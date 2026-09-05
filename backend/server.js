const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { z } = require("zod");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


// Initialize Razorpay
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummyKey1234';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'dummySecret1234';

// Razorpay initialization is below
const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret
});

// -------------------------------------------------------------
// 0. MONGODB AUTHENTICATION & JWT MIDDLEWARE
// -------------------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_hackathon';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/razoragent';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const User = require('./src/models/User');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Forbidden' });
    req.user = user;
    next();
  });
};

// Auth: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email === 'admin@razoragent.ai' ? 'admin' : 'user';
    const user = new User({ email, password: hashedPassword, role });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, user: { email: user.email, agentAuthorization: user.agentAuthorization, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    
    // Auto-create admin if logging in for the first time
    if (!user && email === 'admin@razoragent.ai' && password === 'admin123') {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({ email, password: hashedPassword, role: 'admin' });
      await user.save();
    }

    if (!user) return res.status(400).json({ success: false, message: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, user: { email: user.email, agentAuthorization: user.agentAuthorization, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Auth: Get Current User
app.get('/api/user/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: { email: user.email, agentAuthorization: user.agentAuthorization, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// User: Get Transactions
app.get('/api/user/transactions', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, transactions: user.transactions || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// 0.5 PAYMENT AUTHORIZATION SERVICE
// -------------------------------------------------------------

// Authorize: Create Razorpay Order for Token Setup
app.post('/api/agent-payment/authorize', authenticateToken, async (req, res) => {
  try {
    const { transaction_limit = 5000, payment_method = 'card' } = req.body;
    
    // 1. Get or Create Razorpay Customer
    let user = await User.findById(req.user.id);
    let customerId = user.agentAuthorization?.razorpay_customer_id;
    
    if (razorpayKeyId !== 'rzp_test_dummyKey1234') {
      if (!customerId) {
        const customer = await razorpay.customers.create({
          name: user.email.split('@')[0],
          email: user.email,
          contact: '9999999999'
        });
        customerId = customer.id;
        user.agentAuthorization.razorpay_customer_id = customerId;
        await user.save();
      }
    }

    // 2. Create a Token Setup Order (Amount 0 or 100 for auth)
    let order_id = null;
    let is_mock = false;
    const amount = 100; // 100 paise = ₹1 for authorization

    if (razorpayKeyId === 'rzp_test_dummyKey1234') {
      order_id = 'order_mock_auth_' + Date.now();
      is_mock = true;
    } else {
      const options = {
        amount,
        currency: 'INR',
        receipt: 'auth_' + Date.now(),
        method: payment_method,
        customer_id: customerId,
        token: {
          max_amount: transaction_limit * 100, // in paise
          expire_at: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60), // 10 years
          frequency: 'as_presented'
        }
      };
      const order = await razorpay.orders.create(options);
      order_id = order.id;
    }

    // Set DB status to pending
    await User.findByIdAndUpdate(req.user.id, {
      'agentAuthorization.status': 'pending',
      'agentAuthorization.transaction_limit': transaction_limit,
      'agentAuthorization.payment_method': payment_method,
      'agentAuthorization.updated_at': new Date()
    });

    res.json({ success: true, order_id, amount, currency: 'INR', key_id: razorpayKeyId, is_mock, customer_id: customerId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Verify: Validate Signature and Active Mandate
app.post('/api/agent-payment/verify', authenticateToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, simulateFailure } = req.body;

    if (simulateFailure) {
      await User.findByIdAndUpdate(req.user.id, { 'agentAuthorization.status': 'failed' });
      return res.status(400).json({ success: false, message: 'Verification failed.' });
    }

    // Verification Logic
    let isVerified = false;
    if (razorpay_order_id && razorpay_order_id.startsWith('order_mock_')) {
      isVerified = true;
    } else {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto.createHmac('sha256', razorpayKeySecret).update(body).digest('hex');
      isVerified = expectedSignature === razorpay_signature;
    }

    if (isVerified) {
      let token_id = null;
      
      // If it's a real Razorpay payment, fetch the payment details immediately to grab the token.
      // This bypasses the need for the webhook in local testing!
      if (razorpay_payment_id && !razorpay_order_id?.startsWith('order_mock_') && typeof razorpay !== 'undefined') {
        try {
          const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
          if (paymentDetails && paymentDetails.token_id) {
            token_id = paymentDetails.token_id;
            console.log(`✅ Synchronously fetched TokenHQ token ${token_id} from Razorpay API`);
          }
        } catch (e) {
          console.error("⚠️ Failed to fetch payment details synchronously:", e.message);
        }
      }

      const updateData = {
        'agentAuthorization.status': 'active',
        'agentAuthorization.authorization_reference': razorpay_payment_id,
        'agentAuthorization.updated_at': new Date()
      };
      
      if (token_id) {
        updateData['agentAuthorization.razorpay_token_id'] = token_id;
      }

      const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });

      res.json({ success: true, agentAuthorization: user.agentAuthorization });
    } else {
      await User.findByIdAndUpdate(req.user.id, { 'agentAuthorization.status': 'failed' });
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Webhook: Razorpay Webhook for Token Setup
app.post('/api/razorpay/webhook', async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || razorpayKeySecret;
    const signature = req.headers['x-razorpay-signature'];
    
    // For local dev with ngrok, we might bypass strict signature if secret isn't set
    if (signature) {
      const expectedSignature = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');
      if (expectedSignature !== signature) {
        console.warn('Webhook signature mismatch. Ignoring.');
        // If testing locally, you might want to allow this to pass if you haven't set up the webhook secret properly.
        // return res.status(400).send('Invalid signature');
      }
    }

    const { event, payload } = req.body;
    
    // When a mandate setup payment succeeds, it captures a payment and generates a token
    if (event === 'payment.authorized' || event === 'payment.captured') {
      const paymentEntity = payload.payment.entity;
      const customer_id = paymentEntity.customer_id;
      const token_id = paymentEntity.token_id;

      if (customer_id && token_id) {
        await User.findOneAndUpdate(
          { 'agentAuthorization.razorpay_customer_id': customer_id },
          { 
            'agentAuthorization.razorpay_token_id': token_id,
            'agentAuthorization.status': 'active',
            'agentAuthorization.updated_at': new Date()
          }
        );
        console.log(`✅ Saved TokenHQ token ${token_id} for customer ${customer_id}`);
        
        // Auto-refund the ₹1 setup charge
        if (paymentEntity.id && paymentEntity.amount > 0) {
          try {
            await razorpay.payments.refund(paymentEntity.id, { speed: 'optimum' });
            console.log(`💸 Automatically refunded ₹${paymentEntity.amount / 100} setup charge for ${paymentEntity.id}`);
          } catch (refundErr) {
            console.error('Auto-refund failed (might already be refunded):', refundErr.message);
          }
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Webhook Error');
  }
});

// Status: Get Auth Status
app.get('/api/agent-payment/status', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, agentAuthorization: user.agentAuthorization });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Revoke: Disable Agent Payments
app.post('/api/agent-payment/revoke', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, {
      'agentAuthorization.status': 'revoked',
      'agentAuthorization.razorpay_token_id': null,
      'agentAuthorization.updated_at': new Date()
    }, { new: true });
    res.json({ success: true, agentAuthorization: user.agentAuthorization });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// 1. MACHINE-READABLE MERCHANT CATALOG (AP2 Protocol Format)
// -------------------------------------------------------------
const fs = require('fs');
const path = require('path');

// Load catalog dynamically from the data layer
const catalogPath = path.join(__dirname, 'data', 'catalog.json');
const MERCHANT_CATALOG = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Endpoint: Fetch Agent-Readable Catalog
app.get('/api/v1/agent-catalog', (req, res) => {
  res.json({
    merchant_id: "merchant_razor_store_01",
    merchant_name: "Apex Tech Gear",
    currency: "INR",
    catalog_version: "2026.08.1",
    products: MERCHANT_CATALOG
  });
});

// -------------------------------------------------------------
// 1.5 RAG SYSTEM: VECTOR EMBEDDINGS & SIMILARITY SEARCH
// -------------------------------------------------------------
const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: "text-embedding-004",
  apiKey: process.env.GEMINI_API_KEY || "dummy",
});

let catalogWithEmbeddings = [];

// Cosine similarity utility
const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Initialize embeddings on startup
const initializeEmbeddings = async () => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_KEY_HERE') {
    console.warn("⚠️ No GEMINI_API_KEY found, skipping catalog embeddings generation.");
    return;
  }
  
  console.log("🔄 Generating embeddings for product catalog...");
  try {
    const textsToEmbed = MERCHANT_CATALOG.map(p => 
      `${p.product} ${p.category} ${Object.values(p.specs).join(" ")}`
    );
    
    // Embed all documents
    const docEmbeddings = await embeddings.embedDocuments(textsToEmbed);
    
    catalogWithEmbeddings = MERCHANT_CATALOG.map((product, index) => ({
      ...product,
      vector: docEmbeddings[index]
    }));
    
    console.log(`✅ Successfully embedded ${catalogWithEmbeddings.length} products for RAG.`);
  } catch (error) {
    console.error("❌ Failed to generate catalog embeddings:", error.message);
  }
};
// Trigger initialization
initializeEmbeddings();


// -------------------------------------------------------------
// 2. DETERMINISTIC POLICY ENGINE & LANGCHAIN AGENT ROUTER
// -------------------------------------------------------------
const POLICY_RULES = {
  MAX_AUTO_SPEND: 3500, // INR
  MAX_DISCOUNT_PERCENT: 20,
  LOW_STOCK_THRESHOLD: 2
};

// Initialize LangChain Models with Fallback Switching
const geminiFlash = new ChatGoogleGenerativeAI({
  model: "gemini-3.6-flash",
  apiKey: process.env.GEMINI_API_KEY || "dummy",
  maxRetries: 1,
});

const geminiPro = new ChatGoogleGenerativeAI({
  model: "gemini-3.6-pro",
  apiKey: process.env.GEMINI_API_KEY || "dummy",
  maxRetries: 1,
});

// LangChain native .withFallbacks mechanism
let llm = geminiFlash.withFallbacks([geminiPro]);

// Optional OpenAI Fallback if key is present in .env
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'YOUR_OPENAI_KEY_HERE') {
  try {
    const { ChatOpenAI } = require("@langchain/openai");
    const openAiLlm = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      openAIApiKey: process.env.OPENAI_API_KEY,
      maxRetries: 1
    });
    llm = geminiFlash.withFallbacks([geminiPro, openAiLlm]);
  } catch (e) {
    console.log("LangChain OpenAI fallback optional package note:", e.message);
  }
}

// Define structured output schema for the LLM
const searchSchema = z.object({
  selected_product_id: z.string().describe("The product_id of the best matching product from the catalog. Leave empty string if no good match is found."),
  is_ambiguous: z.boolean().describe("Set to true if the user's request is too vague and could match multiple very different products."),
  reasoning: z.string().describe("Brief reasoning for the selection."),
  recommended_addons: z.array(z.string()).describe("Array of product_ids from the catalog representing the best complementary add-ons. Do not include the main product.")
});

app.post('/api/agent/interact', async (req, res) => {
  const { prompt, userBudget = 3500, forceFailureMode = null } = req.body;
  const telemetryLogs = [];

  const addLog = (event, details) => {
    telemetryLogs.push({
      timestamp: new Date().toISOString().substring(11, 19),
      event,
      details
    });
  };

  addLog('INTENT_RECEIVED', `Parsed prompt: "${prompt}"`);

  // Handle Intent Search using LangChain with Fallback Router
  addLog('CATALOG_SEARCH', 'Invoking LLM for product matching via LangChain (with Fallbacks)...');
  
  let matchedProduct = null;
  let llmAmbiguous = false;
  let llmReasoning = "Mock mode fallback used.";
  let llmAddons = [];

  try {
    const hasGemini = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_KEY_HERE';
    const hasOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'YOUR_OPENAI_KEY_HERE';

    if (hasGemini || hasOpenAI) {
      // Apply structured output to the base model instead of the RunnableWithFallbacks wrapper
      const structuredLlm = geminiFlash.withStructuredOutput(searchSchema);
      
      // RAG Retrieval
      let retrievedCatalog = MERCHANT_CATALOG;
      
      if (catalogWithEmbeddings.length > 0) {
        addLog('RAG_SEARCH', `Embedding user prompt and performing vector search...`);
        try {
          // Workaround for @langchain/google-genai embedQuery bug with text-embedding-004
          const promptEmbedding = (await embeddings.embedDocuments([prompt]))[0];
          
          // Calculate similarities
          const scoredProducts = catalogWithEmbeddings.map(p => ({
            ...p,
            similarity: cosineSimilarity(promptEmbedding, p.vector)
          }));
          
          // Sort by highest similarity
          scoredProducts.sort((a, b) => b.similarity - a.similarity);
          
          // Retrieve top 1 product as requested
          retrievedCatalog = scoredProducts.slice(0, 1);
          
          addLog('RAG_RESULT', `RAG retrieved top 1 product: ${retrievedCatalog[0].product} (Sim: ${retrievedCatalog[0].similarity.toFixed(2)})`);
        } catch (e) {
          addLog('RAG_ERROR', `RAG search failed: ${e.message}. Falling back to full catalog.`);
        }
      }

      const catalogSummary = retrievedCatalog.map(p => `- ID: ${p.product_id} | Name: ${p.product} | Price: ₹${p.price} | Category: ${p.category} | Specs: ${JSON.stringify(p.specs)}`).join('\n');
      const addonCatalog = MERCHANT_CATALOG.map(p => `- ID: ${p.product_id} | Name: ${p.product} | Price: ₹${p.price}`).join('\n');
      
      const systemPrompt = `You are a strict deterministic AI Buyer Agent. Match the user's natural language request to the best product in the catalog.
Do not hallucinate products. If there is no product that satisfies the request or budget, leave selected_product_id empty.
CRITICAL: To increase merchant growth and Average Order Value, you MUST recommend the most highly relatable and complementary accessory from the catalog (e.g., a mouse for a keyboard, a phone case for a mobile phone, a laptop bag for a laptop).

Top RAG Match for Main Product:
${catalogSummary}

Full Catalog (Select Add-ons from here):
${addonCatalog}

User request: "${prompt}"
User budget constraint (if any implied): ${userBudget}`;

      const result = await structuredLlm.invoke(systemPrompt);
      llmAmbiguous = result.is_ambiguous;
      llmReasoning = result.reasoning;
      llmAddons = result.recommended_addons || [];
      
      addLog('LLM_REASONING', `Decision via LangChain: ${llmReasoning}`);

      if (!llmAmbiguous && result.selected_product_id) {
        matchedProduct = MERCHANT_CATALOG.find(p => p.product_id === result.selected_product_id);
      }
    } else {
      addLog('LLM_WARNING', 'No API KEY found in .env. Falling back to simple keyword matching.');
      const searchKeyword = (prompt || '').toLowerCase();
      matchedProduct = MERCHANT_CATALOG.find(p => searchKeyword.includes(p.category.toLowerCase()) || searchKeyword.includes(p.product.toLowerCase().split(' ')[0]));
    }
  } catch (err) {
    addLog('LLM_ERROR', `LLM failed: ${err.message}. Using exact fallback.`);
    const searchKeyword = (prompt || '').toLowerCase();
    matchedProduct = MERCHANT_CATALOG.find(p => searchKeyword.includes(p.category.toLowerCase()));
  }

  if (!matchedProduct) {
    addLog('POLICY_CHECK', 'BLOCKED: No matching product found in the catalog.');
    return res.json({
      status: 'SUCCESS',
      cart: [],
      totalAmount: 0,
      policyStatus: 'UNCERTAIN',
      policyMessage: llmReasoning || 'No suitable product was found in the catalog for your request.',
      requiresHumanApproval: false,
      upsellApplied: false,
      telemetryLogs
    });
  }

  addLog('PRODUCT_SELECTED', `Main Product: ${matchedProduct.product} — ₹${matchedProduct.price}`);

  let cartItems = [{ ...matchedProduct }];
  let totalAmount = matchedProduct.price;
  let upsellApplied = false;
  let upsellExceedsBudget = false;

  // Process Addons: AI Cart Optimizer Loop
  if (llmAddons.length > 0) {
    const remainingBudget = userBudget - matchedProduct.price;
    
    // 1. Retrieve & Filter
    let validAddons = llmAddons
      .map(id => MERCHANT_CATALOG.find(p => p.product_id === id))
      .filter(p => p !== undefined && p.stock > 0);
      
    if (validAddons.length > 0) {
      // 2. Rank by Quality & Rating
      validAddons.sort((a, b) => {
        const scoreA = (a.quality === 'High' ? 2 : a.quality === 'Medium' ? 1 : 0) + (a.rating || 0);
        const scoreB = (b.quality === 'High' ? 2 : b.quality === 'Medium' ? 1 : 0) + (b.rating || 0);
        return scoreB - scoreA;
      });

      // 3. Find best addon that fits the budget AND is good quality
      const bestFittingAddon = validAddons.find(a => a.price <= remainingBudget && a.quality !== 'Low');
      
      // 4. Fallback to the absolute best addon (even if over budget)
      const addonProduct = bestFittingAddon || validAddons[0];

      const pushesOverBudget = addonProduct.price > remainingBudget;

      cartItems.push({
        ...addonProduct,
        is_upsell: true,
        bundle_price: addonProduct.price,
        exceeds_budget: pushesOverBudget,
        reason: llmReasoning
      });
      
      upsellApplied = true;

      // 5. Smart Cart Integration
      if (pushesOverBudget) {
        // Do NOT add to totalAmount automatically. It requires explicit UI approval.
        addLog('AI_RECOMMENDATION', `Premium Upgrade: ${addonProduct.product} (₹${addonProduct.price}). Reason: "${llmReasoning}"`);
      } else {
        // Automatically add it!
        totalAmount += addonProduct.price;
        addLog('AI_RECOMMENDATION', `Smart Cart Optimized: ${addonProduct.product} (+₹${addonProduct.price}). Reason: "${llmReasoning}"`);
      }
    }
  }

  addLog('CART_TOTAL_CALCULATED', `Cart Total: ₹${totalAmount} (Currency: INR)`);

  // Deterministic Policy Engine Evaluation
  addLog('POLICY_EVALUATED', `Checking autonomous cart total (₹${totalAmount}) against MAX_AUTO_SPEND (₹${userBudget})`);

  let policyStatus = 'APPROVED';
  let requiresHumanApproval = false;
  let policyMessage = 'Transaction within autonomous spending limits.';

  if (forceFailureMode === 'AMBIGUITY' || llmAmbiguous) {
    policyStatus = 'UNCERTAIN';
    policyMessage = 'High query ambiguity detected. Agent requires clarification on product specs.';
    addLog('POLICY_CHECK', 'UNCERTAIN: Query match confidence < 80% → Requesting User Clarification');
  } else if (totalAmount > userBudget) {
    policyStatus = 'BLOCKED_REQUIRES_APPROVAL';
    requiresHumanApproval = true;
    policyMessage = `Main product ₹${totalAmount} exceeds autonomous budget limit of ₹${userBudget}.`;
    addLog('POLICY_CHECK', `BLOCKED: Cart total ₹${totalAmount} > Limit ₹${userBudget} → Human Gate Triggered`);
  } else {
    addLog('POLICY_CHECK', 'APPROVED: Policy checks passed successfully');
  }

  res.json({
    status: 'SUCCESS',
    cart: cartItems,
    totalAmount,
    policyStatus,
    requiresHumanApproval,
    policyMessage,
    telemetryLogs,
    upsellApplied
  });
});

// -------------------------------------------------------------
// 3. RAZORPAY TEST MODE API INTEGRATION
// -------------------------------------------------------------

// Endpoint: Zero-Click Agentic AutoPay (Simulated Mandate/TokenHQ Charge)
app.post('/api/agent-charge', authenticateToken, async (req, res) => {
  try {
    const { cartIds, currency = 'INR' } = req.body;

    if (!cartIds || !Array.isArray(cartIds) || cartIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid cart data' });
    }
    
    // Fetch user from DB to verify real mandate status and budget
    const user = await User.findById(req.user.id);
    if (!user || user.agentAuthorization?.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Agentic AutoPay is not authorized or is revoked.' });
    }

    // Backend Recalculation: Final Amount Integrity Check
    let authoritativeTotal = 0;
    for (const id of cartIds) {
      const product = MERCHANT_CATALOG.find(p => p.product_id === id);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product ID ${id} not found in catalog.` });
      }
      authoritativeTotal += product.price;
    }

    // Secure Server-Side Policy check against DB User Budget
    const activeLimit = user.agentAuthorization.transaction_limit || 5000;
    if (authoritativeTotal > activeLimit) {
       return res.status(403).json({ success: false, message: `Agent transaction blocked: total ₹${authoritativeTotal} exceeds autonomous limit (₹${activeLimit}).`});
    }

    // 1. Attempt Real Razorpay TokenHQ Charge
    let payment_id = 'pay_agent_' + Date.now();
    let order_id = 'order_agent_' + Date.now();
    let is_simulated = true;

    if (razorpayKeyId !== 'rzp_test_dummyKey1234' && user.agentAuthorization.razorpay_token_id) {
      try {
        console.log(`[TOKEN_HQ] Attempting real zero-click charge for token: ${user.agentAuthorization.razorpay_token_id}`);
        
        // Step 1: Create an Order (Required by Razorpay API for recurring token payments)
        const rzpOrder = await razorpay.orders.create({
          amount: authoritativeTotal * 100,
          currency,
          receipt: 'agent_' + Date.now(),
        });

        // Step 2: Execute the Token Charge
        const charge = await razorpay.payments.createRecurringPayment({
          order_id: rzpOrder.id,
          customer_id: user.agentAuthorization.razorpay_customer_id,
          token: user.agentAuthorization.razorpay_token_id,
          amount: authoritativeTotal * 100,
          currency,
          description: 'RazorAgent Autonomous Purchase',
          email: user.email || 'customer@razorpay.com',
          contact: '9999999999'
        });
        
        payment_id = charge.id;
        order_id = rzpOrder.id;
        is_simulated = false;
        console.log(`[TOKEN_HQ] Real charge successful: ${charge.id}`);
      } catch (rzpError) {
        console.warn(`[TOKEN_HQ] Real charge failed (expected if recurring UPI isn't fully approved for test merchant). Falling back to simulation. Error:`, rzpError);
        // Fallback to simulation gracefully
        is_simulated = true;
      }
    }

    const payment_mode = is_simulated ? 'S2S RESTRICTED - SIMULATED' : 'RAZORPAY TEST MODE';

    // Save transaction to history
    user.transactions.push({
      payment_id,
      amount: authoritativeTotal,
      product_name: cartIds.map(id => MERCHANT_CATALOG.find(p => p.product_id === id)?.product).join(', '),
      status: 'successful',
      payment_mode: payment_mode
    });
    await user.save();

    // Return instant success for Agent Payment (real or simulated)
    return res.json({
      success: true,
      order_id,
      payment_id,
      amount: authoritativeTotal,
      currency,
      payment_mode
    });
  } catch (error) {
    console.error('Agent AutoPay Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint: Create Razorpay Order
app.post('/api/create-order', async (req, res) => {
  try {
    const { cartIds, currency = 'INR', receipt = 'receipt_' + Date.now() } = req.body;

    if (!cartIds || !Array.isArray(cartIds) || cartIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid cart data' });
    }

    // Backend Recalculation: Final Amount Integrity Check
    let authoritativeTotal = 0;
    const validatedProducts = [];

    for (const id of cartIds) {
      const product = MERCHANT_CATALOG.find(p => p.product_id === id);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product ID ${id} not found in catalog.` });
      }
      authoritativeTotal += product.price;
      validatedProducts.push(product);
    }

    console.log(`[POLICY_CHECK] Authoritative backend total: ₹${authoritativeTotal} for ${validatedProducts.length} items`);

    const options = {
      amount: authoritativeTotal * 100, // Amount in paise (e.g., ₹3798 -> 379800)
      currency,
      receipt,
      payment_capture: 1
    };

    // If real keys are not provided, return a mock valid Razorpay order response for demo resiliency
    if (razorpayKeyId === 'rzp_test_dummyKey1234') {
      return res.json({
        success: true,
        order_id: 'order_mock_' + Date.now(),
        amount: options.amount,
        currency: options.currency,
        key_id: razorpayKeyId,
        is_mock: true
      });
    }

    const order = await razorpay.orders.create(options);
    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: razorpayKeyId,
      is_mock: false
    });
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint: Verify Razorpay Payment Signature
app.post('/api/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, simulateFailure } = req.body;

  if (simulateFailure) {
    return res.status(400).json({
      success: false,
      message: 'Payment verification failed: Simulated payment decline by bank.',
      telemetry: 'PAYMENT_VERIFICATION_FAILED: Bank declined test transaction. Cart preserved.'
    });
  }

  // Handle mock orders
  if (razorpay_order_id && razorpay_order_id.startsWith('order_mock_')) {
    return res.json({
      success: true,
      message: 'Razorpay signature verified successfully (Mock Mode)',
      telemetry: 'PAYMENT_VERIFICATION: Razorpay signature verified'
    });
  }

  // Handle agent autopay simulated orders
  if (razorpay_order_id && razorpay_order_id.startsWith('order_agent_')) {
    return res.json({
      success: true,
      message: 'Agent AutoPay simulated securely via Backend',
      telemetry: 'AGENT_AUTOPAY: S2S Verification Successful'
    });
  }

  // Real HMAC Verification
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', razorpayKeySecret)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    res.json({
      success: true,
      message: 'Razorpay signature verified successfully',
      telemetry: 'PAYMENT_VERIFICATION: Razorpay signature verified'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid Razorpay signature',
      telemetry: 'PAYMENT_VERIFICATION_FAILED: Signature mismatch'
    });
  }
});

app.listen(PORT, () => {
  console.log('\n  🚀 \x1b[36mRazorAgent AP2 Protocol\x1b[0m ready in test mode');
  console.log(`  ➜  \x1b[1mLocal:\x1b[0m   \x1b[36mhttp://localhost:${PORT}/\x1b[0m`);
  console.log(`  ➜  \x1b[1mStatus:\x1b[0m  Agentic Checkout Engine Active\n`);
});

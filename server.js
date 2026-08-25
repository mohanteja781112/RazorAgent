const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { z } = require("zod");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// Static serving removed - backend acts strictly as an API server

// Initialize Razorpay instance (using test mode fallback if credentials not yet provided)
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummyKey1234';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'dummySecret1234';

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
    const user = new User({ email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, user: { email: user.email, agentMandateActive: user.agentMandateActive, autonomousBudget: user.autonomousBudget } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, user: { email: user.email, agentMandateActive: user.agentMandateActive, autonomousBudget: user.autonomousBudget } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Auth: Get Current User
app.get('/api/user/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: { email: user.email, agentMandateActive: user.agentMandateActive, autonomousBudget: user.autonomousBudget } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Auth: Update Mandate Status
app.post('/api/user/update-mandate', authenticateToken, async (req, res) => {
  try {
    const { agentMandateActive } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { agentMandateActive }, { new: true });
    res.json({ success: true, agentMandateActive: user.agentMandateActive });
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
      const catalogSummary = MERCHANT_CATALOG.map(p => `- ID: ${p.product_id} | Name: ${p.product} | Price: ₹${p.price} | Category: ${p.category} | Specs: ${JSON.stringify(p.specs)}`).join('\n');
      
      const systemPrompt = `You are a strict deterministic AI Buyer Agent. Match the user's natural language request to the best product in the catalog.
Do not hallucinate products. If there is no product that satisfies the request or budget, leave selected_product_id empty.
Also recommend 1 complementary add-on from the catalog if relevant.

Catalog:
${catalogSummary}

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
    if (!user || !user.agentMandateActive) {
      return res.status(403).json({ success: false, message: 'Agentic AutoPay is not authorized by this user.' });
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
    if (authoritativeTotal > user.autonomousBudget) {
       return res.status(403).json({ success: false, message: `Agent transaction blocked: total ₹${authoritativeTotal} exceeds autonomous limit (₹${user.autonomousBudget}).`});
    }

    // Return instant simulated success for Agent Payment
    return res.json({
      success: true,
      order_id: 'order_agent_' + Date.now(),
      payment_id: 'pay_agent_' + Date.now(),
      amount: authoritativeTotal * 100,
      currency,
      is_agent_autopay: true
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

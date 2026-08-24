import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import HeroCommandArea from './components/HeroCommandArea.jsx';
import TransactionWorkflow from './components/TransactionWorkflow.jsx';
import ProductCard from './components/ProductCard.jsx';
import SmartUpsellSection from './components/SmartUpsellSection.jsx';
import PolicySafetyPanel from './components/PolicySafetyPanel.jsx';
import AuditTelemetryDrawer from './components/AuditTelemetryDrawer.jsx';
import PaymentExperience from './components/PaymentExperience.jsx';
import FailureStateBanner from './components/FailureStateBanner.jsx';
import MerchantGrowthDashboard from './components/MerchantGrowthDashboard.jsx';
import JsonCatalogModal from './components/JsonCatalogModal.jsx';
import HumanApprovalModal from './components/HumanApprovalModal.jsx';
import AuthOverlay from './components/AuthOverlay.jsx';
import LandingPage from './components/LandingPage.jsx';
import { ShoppingCart, Bot, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

export default function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState('workspace'); // 'workspace' | 'merchant'

  // Form & Budget State
  const [promptInput, setPromptInput] = useState('Find me a mechanical keyboard under ₹4,000 and buy it');
  const [userBudget, setUserBudget] = useState(3500);
  const [simulatedFailureMode, setSimulatedFailureMode] = useState(false);

  // Workflow & Active Commerce State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Understand, 2: Decide, 3: Guard, 4: Transact
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [policyStatus, setPolicyStatus] = useState(null); // 'APPROVED' | 'BLOCKED_REQUIRES_APPROVAL' | 'UNCERTAIN'
  const [requiresHumanApproval, setRequiresHumanApproval] = useState(false);
  const [policyMessage, setPolicyMessage] = useState('');
  const [upsellApplied, setUpsellApplied] = useState(false);
  const [upsellIncluded, setUpsellIncluded] = useState(true);

  // Payment State
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState('');

  // Live Merchant Analytics State
  const [aiOrders, setAiOrders] = useState(37);
  const [upsellsAccepted, setUpsellsAccepted] = useState(14);
  const [cartsRecovered, setCartsRecovered] = useState(8);
  const [revenueUplift, setRevenueUplift] = useState(12450);

  // Telemetry & Modals
  const [telemetryLogs, setTelemetryLogs] = useState([
    {
      timestamp: new Date().toISOString().substring(11, 19),
      event: 'SYSTEM_INIT',
      details: 'RazorAgent AP2 Protocol initialized. Ready for autonomous AI buyer transactions.'
    }
  ]);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isHumanGateModalOpen, setIsHumanGateModalOpen] = useState(false);

  // Helper to add telemetry logs
  const appendTelemetryLog = (event, details) => {
    const newLog = {
      timestamp: new Date().toISOString().substring(11, 19),
      event,
      details
    };
    setTelemetryLogs(prev => [...prev, newLog]);
  };

  // Execute Agent Commerce Order
  const executeAgentOrder = async (textOverride = null, forceFailureMode = null) => {
    const prompt = (textOverride !== null ? textOverride : promptInput).trim();
    if (!prompt) return;

    setIsProcessing(true);
    setCurrentStep(1); // Step 01: UNDERSTAND
    setPaymentVerified(false);
    setPaymentFailed(false);

    appendTelemetryLog('INTENT_RECEIVED', `Parsed prompt: "${prompt}"`);

    // Step 02 Animation transition
    setTimeout(() => setCurrentStep(2), 400);

    try {
      const response = await fetch('/api/agent/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          userBudget,
          forceFailureMode
        })
      });

      const data = await response.json();

      // Merge backend telemetry logs
      if (data.telemetryLogs) {
        setTelemetryLogs(prev => [...prev, ...data.telemetryLogs]);
      }

      if (data.status === 'SUCCESS') {
        setCart(data.cart);
        setTotalAmount(data.totalAmount);
        setPolicyStatus(data.policyStatus);
        setRequiresHumanApproval(data.requiresHumanApproval);
        setPolicyMessage(data.policyMessage);
        setUpsellApplied(data.upsellApplied);
        setUpsellIncluded(!data.cart.some(item => item.exceeds_budget));

        setCurrentStep(3); // Step 03: GUARD

        // Trigger Modal if blocked
        if (data.policyStatus === 'BLOCKED_REQUIRES_APPROVAL' || data.totalAmount > userBudget) {
          setIsHumanGateModalOpen(true);
        }
      }
    } catch (error) {
      appendTelemetryLog('ERROR', `Agent interaction failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle Upsell Item Addition
  const handleToggleUpsell = (included) => {
    setUpsellIncluded(included);
    if (!cart || cart.length === 0) return;

    const mainItem = cart[0];
    const upsellItem = cart.find(i => i.is_upsell);

    if (included && upsellItem) {
      const newTotal = mainItem.price + upsellItem.price;
      setTotalAmount(newTotal);
      appendTelemetryLog('CART_UPDATE', `Added upsell bundle item (${upsellItem.product}). Cart total: ₹${newTotal}`);
      
      if (newTotal > userBudget) {
        setPolicyStatus('BLOCKED_REQUIRES_APPROVAL');
      } else {
        setPolicyStatus('APPROVED');
      }
    } else {
      const newTotal = mainItem.price;
      setTotalAmount(newTotal);
      appendTelemetryLog('CART_UPDATE', `Removed upsell item. Cart total: ₹${newTotal}`);
      
      if (newTotal <= userBudget) {
        setPolicyStatus('APPROVED');
        setIsHumanGateModalOpen(false);
      }
    }
  };

  // Initiate Razorpay Checkout
  const initiateRazorpayPayment = async () => {
    setIsHumanGateModalOpen(false);
    setCurrentStep(4); // Step 04: TRANSACT
    appendTelemetryLog('RAZORPAY_API', `Requesting Razorpay order creation for ₹${totalAmount}...`);

    try {
      const activeCart = upsellIncluded ? cart : cart.filter(item => !item.is_upsell);
      const cartIds = activeCart.map(item => item.product_id);

      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartIds })
      });

      const orderData = await res.json();
      if (!orderData.success) throw new Error(orderData.message);

      setOrderDetails(orderData);
      appendTelemetryLog('RAZORPAY_ORDER_CREATED', `Order ID: ${orderData.order_id} | Amount: ₹${totalAmount}`);

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Apex Tech Gear',
        description: 'RazorAgent Bounded Checkout',
        order_id: orderData.order_id,
        handler: function (response) {
          verifyPaymentOnBackend(response);
        },
        modal: {
          ondismiss: function () {
            appendTelemetryLog('PAYMENT_DISMISSED', 'Razorpay checkout modal closed by user.');
          }
        },
        prefill: {
          name: 'AI Buyer Agent',
          email: 'agent@razoragent.ai',
          contact: '9999999999'
        },
        theme: { color: '#38bdf8' }
      };

      if (orderData.is_mock) {
        // Fallback simulation for test keys
        simulateRazorpayModal(options);
      } else if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback if SDK script isn't loaded
        simulateRazorpayModal(options);
      }
    } catch (err) {
      appendTelemetryLog('ERROR', `Razorpay Order Error: ${err.message}`);
    }
  };

  // Mock Modal Simulator when dummy keys are present
  const simulateRazorpayModal = (options) => {
    const confirmPayment = window.confirm(
      `[RAZORPAY TEST MODE CHECKOUT]\n\nMerchant: Apex Tech Gear\nOrder ID: ${options.order_id}\nTotal: ₹${totalAmount.toLocaleString('en-IN')}\n\nClick OK to simulate SUCCESS payment.\nClick Cancel to simulate PAYMENT DECLINE.`
    );

    if (simulatedFailureMode || !confirmPayment) {
      verifyPaymentOnBackend({
        razorpay_order_id: options.order_id,
        razorpay_payment_id: 'pay_failed_' + Date.now(),
        razorpay_signature: 'invalid_sig'
      }, true);
    } else {
      verifyPaymentOnBackend({
        razorpay_order_id: options.order_id,
        razorpay_payment_id: 'pay_test_' + Date.now(),
        razorpay_signature: 'valid_mock_sig'
      }, false);
    }
  };

  // Backend Payment Verification
  const verifyPaymentOnBackend = async (paymentPayload, forceSimulateFailure = false) => {
    appendTelemetryLog('PAYMENT_VERIFICATION_INIT', 'Sending payment payload for backend HMAC signature validation...');

    try {
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentPayload,
          simulateFailure: simulatedFailureMode || forceSimulateFailure
        })
      });

      const verifyData = await res.json();

      if (verifyData.success) {
        setPaymentVerified(true);
        setOrderDetails(verifyData);
        appendTelemetryLog('PAYMENT_SUCCESS', `Transaction approved for ${verifyData.razorpay_order_id || 'mock_order'}`);

        // Update Merchant Analytics
        setAiOrders(prev => prev + 1);
        if (upsellIncluded && cart.some(i => i.is_upsell)) {
          setUpsellsAccepted(prev => prev + 1);
          const upsellItem = cart.find(i => i.is_upsell);
          if (upsellItem) setRevenueUplift(prev => prev + upsellItem.price);
        }
        if (requiresHumanApproval) {
          setCartsRecovered(prev => prev + 1);
        }
        appendTelemetryLog('TRANSACTION_SEALED', 'Transaction completed successfully. Order dispatched!');
      } else {
        setPaymentVerified(false);
        setPaymentFailed(true);
        setPaymentErrorMessage(verifyData.message || 'Payment decline');
        appendTelemetryLog('PAYMENT_VERIFICATION_FAILED', verifyData.telemetry || verifyData.message);
        appendTelemetryLog('RETRY_ENGINE', 'Preserving cart state. No duplicate order created. Clean retry available.');
      }
    } catch (err) {
      appendTelemetryLog('ERROR', `Verification Error: ${err.message}`);
    }
  };

  // Human Gate Handlers
  const handleApproveHumanGate = () => {
    setIsHumanGateModalOpen(false);
    appendTelemetryLog('HUMAN_GATE_DECISION', 'User APPROVED spending gate override. Proceeding to Razorpay checkout.');
    initiateRazorpayPayment();
  };

  const handleRejectHumanGate = () => {
    setIsHumanGateModalOpen(false);
    appendTelemetryLog('HUMAN_GATE_DECISION', 'User REJECTED spending gate. Transaction blocked & cart preserved.');
  };

  const handleResetOrder = () => {
    setCart([]);
    setTotalAmount(0);
    setPolicyStatus(null);
    setPaymentVerified(false);
    setPaymentFailed(false);
    setCurrentStep(1);
    appendTelemetryLog('SYSTEM', 'New commerce session initiated.');
  };

  // Extract catalog items
  const mainProductItem = cart.length > 0 ? cart[0] : null;
  const upsellItem = cart.find(i => i.is_upsell);

  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onLogin={() => setIsAuthModalOpen(true)} />
        {isAuthModalOpen && (
          <AuthOverlay 
            onLogin={() => {
              setIsAuthenticated(true);
              setIsAuthModalOpen(false);
            }} 
            onClose={() => setIsAuthModalOpen(false)} 
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      
      {/* TOP NAV HEADER */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        onToggleTelemetryDrawer={() => setIsAuditDrawerOpen(!isAuditDrawerOpen)}
        isAuditDrawerOpen={isAuditDrawerOpen}
        simulatedFailureMode={simulatedFailureMode}
        setSimulatedFailureMode={setSimulatedFailureMode}
        telemetryLogsCount={telemetryLogs.length}
      />

      {/* MAIN CONTENT WRAPPER (~1400px Max Width) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">

        {activeTab === 'merchant' ? (
          /* SECONDARY TAB: MERCHANT GROWTH DASHBOARD */
          <MerchantGrowthDashboard />
        ) : (
          /* PRIMARY TAB: AGENT WORKSPACE */
          <>
            {/* 1. HERO COMMAND AREA */}
            <HeroCommandArea
              promptInput={promptInput}
              setPromptInput={setPromptInput}
              userBudget={userBudget}
              setUserBudget={setUserBudget}
              onExecute={executeAgentOrder}
              isProcessing={isProcessing}
              simulatedFailureMode={simulatedFailureMode}
            />

            {/* 2. TRANSACTION WORKFLOW STEPPER */}
            <TransactionWorkflow
              currentStep={currentStep}
              policyStatus={policyStatus}
              paymentStatus={paymentFailed ? 'FAILED' : paymentVerified ? 'SUCCESS' : 'PENDING'}
            />

            {/* 3. ACTIVE TRANSACTION WORKSPACE */}
            {cart.length > 0 || policyStatus === 'UNCERTAIN' || policyStatus === 'BLOCKED_REQUIRES_APPROVAL' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT / MAIN COLUMN: PRODUCTS & UPSELL */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* SUCCESS STATE OVERRIDE */}
                  {paymentVerified ? (
                    <PaymentExperience
                      status="SUCCESS"
                      orderDetails={orderDetails}
                      totalAmount={totalAmount}
                      onOpenAuditTrail={() => setIsAuditDrawerOpen(true)}
                      onResetOrder={handleResetOrder}
                    />
                  ) : paymentFailed ? (
                    /* PAYMENT DECLINE FAILURE STATE */
                    <FailureStateBanner
                      mode="PAYMENT"
                      errorMessage={paymentErrorMessage}
                      onRetry={initiateRazorpayPayment}
                    />
                  ) : policyStatus === 'UNCERTAIN' ? (
                    /* AMBIGUITY FAILURE STATE */
                    <FailureStateBanner
                      mode="AMBIGUITY"
                      errorMessage={policyMessage}
                      onSelectOption={(text) => executeAgentOrder(text)}
                    />
                  ) : (
                    /* STANDARD PRODUCT RECOMMENDATION */
                    <>
                      {mainProductItem && (
                        <ProductCard item={mainProductItem} />
                      )}

                      {/* SMART UPSELL MODULE */}
                      {upsellApplied && upsellItem && (
                        <SmartUpsellSection
                          upsellItem={upsellItem}
                          mainProductName={mainProductItem?.product}
                          mainProductPrice={mainProductItem ? mainProductItem.price : 3499}
                          userBudget={userBudget}
                          isIncluded={upsellIncluded}
                          onToggleUpsell={handleToggleUpsell}
                        />
                      )}
                    </>
                  )}

                </div>

                {/* RIGHT COLUMN: FINANCIAL SAFETY PANEL */}
                <div className="lg:col-span-5 space-y-6 sticky top-20">
                  
                  {!paymentVerified && (
                    <PolicySafetyPanel
                      userBudget={userBudget}
                      totalAmount={totalAmount}
                      policyStatus={policyStatus}
                      requiresHumanApproval={requiresHumanApproval}
                      onApproveHumanGate={() => setIsHumanGateModalOpen(true)}
                      onInitiatePayment={initiateRazorpayPayment}
                      onClarifyQuery={() => executeAgentOrder('Find me a mechanical RGB keyboard with red switches under ₹4,000')}
                    />
                  )}

                  {/* QUICK STATS CARD */}
                  <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 text-xs space-y-2 text-slate-400">
                    <div className="flex justify-between items-center">
                      <span>Merchant Store:</span>
                      <strong className="text-white">Apex Tech Gear</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Agent Standard:</span>
                      <span className="text-sky-400 font-mono">AP2 Bounded Protocol</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Payment Engine:</span>
                      <span className="text-emerald-400 font-mono">Razorpay API v1</span>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              /* EMPTY ACTIVE STATE HINT */
              <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white font-heading">
                  Waiting for AI Commerce Execution
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Select an example prompt chip or enter a natural language command above to start the autonomous buyer agent workflow.
                </p>
              </div>
            )}

            {/* LOWER SECTION: SECONDARY MERCHANT GROWTH PREVIEW */}
            <div className="pt-6 border-t border-slate-800/80">
              <MerchantGrowthDashboard 
                aiOrders={aiOrders}
                upsellsAccepted={upsellsAccepted}
                cartsRecovered={cartsRecovered}
                revenueUplift={revenueUplift}
              />
            </div>
          </>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500 font-mono">
        RazorAgent • Razorpay Buildathon Track 01 • Bounded Autonomous Agentic Commerce
      </footer>

      {/* AUDIT TELEMETRY DRAWER */}
      <AuditTelemetryDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        telemetryLogs={telemetryLogs}
        onClearLogs={() => setTelemetryLogs([])}
      />

      {/* MACHINE CATALOG JSON MODAL */}
      <JsonCatalogModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
      />

      {/* HUMAN APPROVAL GATE MODAL */}
      <HumanApprovalModal
        isOpen={isHumanGateModalOpen}
        onClose={() => setIsHumanGateModalOpen(false)}
        totalAmount={totalAmount}
        userBudget={userBudget}
        onApprove={handleApproveHumanGate}
        onReject={handleRejectHumanGate}
      />

    </div>
  );
}

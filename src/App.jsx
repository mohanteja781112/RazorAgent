import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header.jsx';
import HeroCommandArea from './components/HeroCommandArea.jsx';
import TransactionWorkflow from './components/TransactionWorkflow.jsx';
import ProductCard from './components/ProductCard.jsx';
import SmartUpsellSection from './components/SmartUpsellSection.jsx';
import PolicySafetyPanel from './components/PolicySafetyPanel.jsx';
import AuditTelemetryDrawer from './components/AuditTelemetryDrawer.jsx';
import PaymentExperience from './components/PaymentExperience.jsx';
import FailureStateBanner from './components/FailureStateBanner.jsx';
import JsonCatalogModal from './components/JsonCatalogModal.jsx';
import HumanApprovalModal from './components/HumanApprovalModal.jsx';
import AuthOverlay from './components/AuthOverlay.jsx';
import LandingPage from './components/LandingPage.jsx';
import UserProfileModal from './components/UserProfileModal.jsx';
import MandateSetupModal from './components/MandateSetupModal.jsx';
import TransactionHistoryModal from './components/TransactionHistoryModal.jsx';
import RazorAgentSplash from './components/RazorAgentSplash.jsx';
import { ShoppingCart, Bot, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const workflowRef = useRef(null);
  const workspaceRef = useRef(null);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState(localStorage.getItem('razoragent_view') || 'landing');
  const [showSplash, setShowSplash] = useState(currentView === 'landing');

  // Splash Screen Duration (2 seconds horizontal loading only for landing page)
  useEffect(() => {
    if (currentView === 'landing') {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowSplash(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('razoragent_view', currentView);
  }, [currentView]);

  const [agentAuthorization, setAgentAuthorization] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('user');
  const [isMandateModalOpen, setIsMandateModalOpen] = useState(false);

  // Fetch Session on Mount
  useEffect(() => {
    const token = localStorage.getItem('razoragent_token');
    if (token) {
      fetch('/api/user/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsAuthenticated(true);
          setAgentAuthorization(data.user.agentAuthorization);
          setUserEmail(data.user.email);
          setUserRole(data.user.role || 'user');
        }
        setIsInitializing(false);
      })
      .catch(err => {
        console.error("Session restore failed:", err);
        setIsInitializing(false);
      });
    } else {
      setIsInitializing(false);
    }
  }, []);

  // Form & Budget State
  const [promptInput, setPromptInput] = useState('Find me a mechanical keyboard under ₹4,000 and buy it');
  const [userBudget, setUserBudget] = useState(5000);

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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Payment State
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState('');

  // Telemetry & Modals
  const [telemetryLogs, setTelemetryLogs] = useState([
    {
      timestamp: new Date().toISOString().substring(11, 19),
      event: 'SYSTEM_INIT',
      details: 'RazorAgent AP2 Protocol initialized. Ready for autonomous AI buyer transactions.'
    }
  ]);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isHumanGateModalOpen, setIsHumanGateModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Scroll to workflow on execution start
  useEffect(() => {
    if (isProcessing && workflowRef.current) {
      setTimeout(() => {
        workflowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [isProcessing]);

  // Scroll to workspace on product received
  useEffect(() => {
    if ((cart.length > 0 || policyStatus) && workspaceRef.current && !isProcessing) {
      setTimeout(() => {
        workspaceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [cart, policyStatus, isProcessing]);

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
  const executeAgentOrder = async (textOverride = null) => {
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
      const token = localStorage.getItem('razoragent_token');
      const response = await fetch('/api/agent/interact', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          prompt,
          userBudget
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
        } else if (data.policyStatus === 'APPROVED') {
          // Guard passed successfully, move to Transact step
          setTimeout(() => setCurrentStep(4), 800);
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
        setCurrentStep(3);
      } else {
        setPolicyStatus('APPROVED');
        setCurrentStep(4);
      }
    } else {
      const newTotal = mainItem.price;
      setTotalAmount(newTotal);
      appendTelemetryLog('CART_UPDATE', `Removed upsell item. Cart total: ₹${newTotal}`);
      
      if (newTotal <= userBudget) {
        setPolicyStatus('APPROVED');
        setIsHumanGateModalOpen(false);
        setCurrentStep(4);
      }
    }
  };

  // Initiate Real Razorpay Mandate Setup
  const setupAgentMandate = async (selectedLimit) => {
    setIsProcessing(true);
    appendTelemetryLog('AGENT_PAYMENT_SETUP', `Initiating Agentic Authorization for limit ₹${selectedLimit}...`);
    
    try {
      const token = localStorage.getItem('razoragent_token');
      if (!token) {
        alert('You must be logged in to set up Agent Payments.');
        setIsProcessing(false);
        return;
      }

      // Step 1: Create 1 INR Authorization Order
      const res = await fetch('/api/agent-payment/authorize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ transaction_limit: selectedLimit })
      });
      const orderData = await res.json();
      
      if (!orderData.success) throw new Error(orderData.message);

      appendTelemetryLog('AUTHORIZATION_ORDER_CREATED', `Auth Order: ${orderData.order_id}`);

      // Step 2: Open Razorpay Checkout for Authorization
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'RazorAgent Zero-Click',
        description: 'Agentic Payment Authorization',
        order_id: orderData.order_id,
        customer_id: orderData.customer_id, // Required for TokenHQ recurring
        handler: async function (response) {
          appendTelemetryLog('AUTHORIZATION_PAYMENT_SUCCESS', 'Verifying signature securely on backend...');
          
          // Step 3: Verify and activate mandate
          const verifyRes = await fetch('/api/agent-payment/verify', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(response)
          });
          
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setAgentAuthorization(verifyData.agentAuthorization);
            setIsMandateModalOpen(false);
            appendTelemetryLog('AGENT_PAYMENT_AUTHORIZED', 'Zero-Click Agent Mandate successfully verified and ACTIVE.');
          } else {
            appendTelemetryLog('ERROR', `Verification failed: ${verifyData.message}`);
          }
          setIsProcessing(false);
        },
        modal: {
          ondismiss: function () {
            appendTelemetryLog('PAYMENT_DISMISSED', 'Authorization modal closed.');
            setIsProcessing(false);
          }
        },
        prefill: {
          email: userEmail
        },
        theme: { color: '#10b981' }
      };

      if (orderData.is_mock) {
        // Test fallback for dummy key
        if (window.confirm('Simulate successful authorization payment?')) {
          options.handler({
            razorpay_order_id: orderData.order_id,
            razorpay_payment_id: 'pay_auth_mock_' + Date.now(),
            razorpay_signature: 'valid_mock_sig'
          });
        } else {
          setIsProcessing(false);
        }
      } else if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert("Razorpay SDK not loaded");
        setIsProcessing(false);
      }
    } catch (err) {
      appendTelemetryLog('ERROR', `Setup failed: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const handleRevokeMandate = async () => {
    appendTelemetryLog('AGENT_PAYMENT_REVOKE', 'Revoking agent payments authorization...');
    try {
      const token = localStorage.getItem('razoragent_token');
      const res = await fetch('/api/agent-payment/revoke', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAgentAuthorization(data.agentAuthorization);
        appendTelemetryLog('REVOKE_SUCCESS', 'Agent payments revoked successfully.');
      }
    } catch (err) {
      appendTelemetryLog('ERROR', `Revoke failed: ${err.message}`);
    }
  };

  // Initiate Razorpay Payment (or Zero-Click Agent Pay)
  const initiateRazorpayPayment = async () => {
    setIsHumanGateModalOpen(false);
    setCurrentStep(4); // Step 04: TRANSACT
    setIsProcessingPayment(true);
    
    // ZERO-CLICK AGENT AUTOPAY FLOW
    const activeLimit = agentAuthorization?.transaction_limit || 5000;
    if (agentAuthorization?.status === 'active' && totalAmount <= activeLimit) {
      appendTelemetryLog('AGENT_AUTOPAY_INITIATED', `Zero-click execution started via authorized mandate for ₹${totalAmount}...`);
      try {
        // Simulate real-world S2S banking latency (2.5 seconds) to make the prototype feel realistic
        await new Promise(resolve => setTimeout(resolve, 2500));

        const activeCart = upsellIncluded ? cart : cart.filter(item => !item.is_upsell);
        const cartIds = activeCart.map(item => item.product_id);

        const token = localStorage.getItem('razoragent_token');
        const res = await fetch('/api/agent-charge', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({ cartIds })
        });

        const orderData = await res.json();
        if (!orderData.success) throw new Error(orderData.message);

        // Instantly verify on backend (simulate S2S success)
        verifyPaymentOnBackend({
          razorpay_order_id: orderData.order_id,
          razorpay_payment_id: orderData.payment_id,
          razorpay_signature: 'agent_autopay_signature',
          is_agent_autopay: true
        }, false);

      } catch (err) {
        appendTelemetryLog('ERROR', `Agent AutoPay Error: ${err.message}`);
        setPaymentVerified(false);
        setPaymentFailed(true);
        setPaymentErrorMessage(`Agent AutoPay Blocked: ${err.message}`);
      }
      setIsProcessingPayment(false);
      return; // Exit here, do not open Razorpay UI
    }

    // STANDARD RAZORPAY CHECKOUT FLOW
    appendTelemetryLog('RAZORPAY_API', `Requesting Razorpay order creation for ₹${totalAmount}...`);

    try {
      const activeCart = upsellIncluded ? cart : cart.filter(item => !item.is_upsell);
      const cartIds = activeCart.map(item => item.product_id);

      const token = localStorage.getItem('razoragent_token');
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
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
            setIsProcessingPayment(false);
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
        // Test fallback for dummy key
        if (window.confirm('Simulate successful payment for Agent order?')) {
          simulateRazorpayModal(options);
        } else {
          setIsProcessingPayment(false);
        }
      } else if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
        // Reset processing after modal opens (user completes it there)
        setIsProcessingPayment(false);
      } else {
        alert("Razorpay SDK not loaded");
        setIsProcessingPayment(false);
      }
    } catch (err) {
      appendTelemetryLog('ERROR', `Payment initiation failed: ${err.message}`);
      setPaymentVerified(false);
      setPaymentFailed(true);
      setPaymentErrorMessage(`Payment Initiation Error: ${err.message}`);
      setIsProcessingPayment(false);
    }
  };

  // Mock Modal Simulator when dummy keys are present
  const simulateRazorpayModal = (options) => {
    const confirmPayment = window.confirm(
      `[RAZORPAY TEST MODE CHECKOUT]\n\nMerchant: Apex Tech Gear\nOrder ID: ${options.order_id}\nTotal: ₹${totalAmount.toLocaleString('en-IN')}\n\nClick OK to simulate SUCCESS payment.\nClick Cancel to simulate PAYMENT DECLINE.`
    );

    if (!confirmPayment) {
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
          simulateFailure: forceSimulateFailure
        })
      });

      const verifyData = await res.json();

      if (verifyData.success) {
        setPaymentVerified(true);
        setOrderDetails(verifyData);
        appendTelemetryLog('PAYMENT_SUCCESS', `Transaction approved for ${verifyData.razorpay_order_id || 'mock_order'}`);

        // Log to telemetry
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
    } finally {
      setIsProcessingPayment(false);
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

  const handleLogout = () => {
    localStorage.removeItem('razoragent_token');
    localStorage.removeItem('razoragent_view');
    setIsAuthenticated(false);
    setUserEmail('');
    setUserRole('user');
    setAgentAuthorization(null);
    setCart([]);
    setCurrentStep(1);
    setCurrentView('landing');
  };

  if (showSplash) {
    return <RazorAgentSplash />;
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#060913] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-sky-500 animate-spin"></div>
      </div>
    );
  }

  if (currentView === 'landing') {
    return (
      <>
        <LandingPage 
          isAuthenticated={isAuthenticated}
          onGoToWorkspace={() => setCurrentView('workspace')}
          onLogin={(mode) => {
            setAuthMode(mode || 'login');
            setIsAuthModalOpen(true);
          }} 
        />
        {isAuthModalOpen && (
          <AuthOverlay 
            initialMode={authMode}
            onLogin={(user) => {
              setIsAuthenticated(true);
              setIsAuthModalOpen(false);
              setCurrentView('workspace');
              if (user && user.email) setUserEmail(user.email);
              if (user && user.role) setUserRole(user.role);
              if (user && user.agentAuthorization !== undefined) setAgentAuthorization(user.agentAuthorization);
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
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        onToggleTelemetryDrawer={() => setIsAuditDrawerOpen(!isAuditDrawerOpen)}
        isAuditDrawerOpen={isAuditDrawerOpen}
        telemetryLogsCount={telemetryLogs.length}
        agentAuthorization={agentAuthorization}
        onSetupAgentPayments={() => setIsMandateModalOpen(true)}
        userEmail={userEmail}
        userRole={userRole}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onGoHome={() => setCurrentView('landing')}
      />

      {/* MAIN CONTENT WRAPPER (~1400px Max Width) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">

        <>
            {/* 1. HERO COMMAND AREA */}
            <HeroCommandArea
              promptInput={promptInput}
              setPromptInput={setPromptInput}
              userBudget={userBudget}
              setUserBudget={setUserBudget}
              onExecute={executeAgentOrder}
              isProcessing={isProcessing}
            />

            {/* 2. TRANSACTION WORKFLOW STEPPER */}
            <div ref={workflowRef}>
              <TransactionWorkflow
                currentStep={currentStep}
                policyStatus={policyStatus}
                paymentStatus={paymentFailed ? 'FAILED' : paymentVerified ? 'SUCCESS' : 'PENDING'}
              />
            </div>

            {/* 3. ACTIVE TRANSACTION WORKSPACE */}
            {cart.length > 0 || policyStatus === 'UNCERTAIN' || policyStatus === 'BLOCKED_REQUIRES_APPROVAL' ? (
              <div ref={workspaceRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start scroll-mt-24">
                
                {/* LEFT / MAIN COLUMN: PRODUCTS & UPSELL */}
                <div className={`${paymentVerified ? 'lg:col-span-12 max-w-4xl mx-auto w-full' : 'lg:col-span-7'} space-y-6`}>
                  
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
                {!paymentVerified && (
                  <div className="lg:col-span-5 space-y-6 sticky top-20">
                    
                    {/* SAFETY POLICY PANEL */}
                    <PolicySafetyPanel
                      userBudget={userBudget}
                    totalAmount={totalAmount}
                    policyStatus={policyStatus}
                    requiresHumanApproval={requiresHumanApproval}
                    agentAuthorization={agentAuthorization}
                    onApproveHumanGate={() => setIsHumanGateModalOpen(true)}
                    onInitiatePayment={initiateRazorpayPayment}
                    onClarifyQuery={(t) => executeAgentOrder(t)}
                    isProcessingPayment={isProcessingPayment}
                  />

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
                )}
              </div>
            ) : null}

          </>
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

      {/* USER PROFILE MODAL */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userEmail={userEmail}
        agentAuthorization={agentAuthorization}
        onRevoke={handleRevokeMandate}
      />

      {/* MANDATE SETUP MODAL */}
      <MandateSetupModal
        isOpen={isMandateModalOpen}
        onClose={() => setIsMandateModalOpen(false)}
        onAuthorize={setupAgentMandate}
        isProcessing={isProcessing}
      />

      {/* TRANSACTION HISTORY MODAL */}
      <TransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

    </div>
  );
}


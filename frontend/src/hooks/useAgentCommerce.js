import { useState } from 'react';

export function useAgentCommerce({ userEmail, agentAuthorization, setAgentAuthorization, setIsMandateModalOpen }) {
  // Form & Budget State
  const [promptInput, setPromptInput] = useState('');
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

  // Modals & Telemetry
  const [telemetryLogs, setTelemetryLogs] = useState([
    {
      timestamp: new Date().toISOString().substring(11, 19),
      event: 'SYSTEM_INIT',
      details: 'RazorAgent AP2 Protocol initialized. Ready for autonomous AI buyer transactions.'
    }
  ]);
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

  const clearTelemetryLogs = () => setTelemetryLogs([]);

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
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${API_BASE}/api/agent/interact`, {
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

        // Only advance to GUARD step if a product was actually found.
        // NOT_FOUND and UNCERTAIN cases should stop at DECIDE (step 2).
        if (data.policyStatus === 'NOT_FOUND' || data.policyStatus === 'UNCERTAIN') {
          setCurrentStep(2); // Stay at DECIDE — show error at this step
        } else {
          setCurrentStep(3); // Step 03: GUARD
        }
        // We intentionally do not auto-open the modal or auto-progress to step 4.
        // The user must manually click "Continue & Pay" to confirm they are happy with the product.
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
        setCurrentStep(3); // User must still manually click continue
      }
    } else {
      const newTotal = mainItem.price;
      setTotalAmount(newTotal);
      appendTelemetryLog('CART_UPDATE', `Removed upsell item. Cart total: ₹${newTotal}`);
      
      if (newTotal <= userBudget) {
        setPolicyStatus('APPROVED');
        setIsHumanGateModalOpen(false);
        setCurrentStep(3); // User must still manually click continue
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

      const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${API_BASE}/api/agent-payment/authorize`, {
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

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'RazorAgent Zero-Click',
        description: 'Agentic Payment Authorization',
        order_id: orderData.order_id,
        customer_id: orderData.customer_id,
        handler: async function (response) {
          appendTelemetryLog('AUTHORIZATION_PAYMENT_SUCCESS', 'Verifying signature securely on backend...');
          const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
          const verifyRes = await fetch(`${API_BASE}/api/agent-payment/verify`, {
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
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${API_BASE}/api/agent-payment/revoke`, {
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

  // Initiate Razorpay Payment
  const initiateRazorpayPayment = async () => {
    setIsHumanGateModalOpen(false);
    setCurrentStep(4);
    setIsProcessingPayment(true);
    
    const activeLimit = agentAuthorization?.transaction_limit || 5000;
    if (agentAuthorization?.status === 'active' && totalAmount <= activeLimit) {
      appendTelemetryLog('AGENT_AUTOPAY_INITIATED', `Zero-click execution started via authorized mandate for ₹${totalAmount}...`);
      try {
        await new Promise(resolve => setTimeout(resolve, 2500));

        const activeCart = upsellIncluded ? cart : cart.filter(item => !item.is_upsell);
        const cartIds = activeCart.map(item => item.product_id);

        const token = localStorage.getItem('razoragent_token');
        const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
        const res = await fetch(`${API_BASE}/api/agent-charge`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({ cartIds })
        });

        const orderData = await res.json();
        if (!orderData.success) throw new Error(orderData.message);

        await verifyPaymentOnBackend({
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
        setIsProcessingPayment(false);
      }
      return;
    }

    appendTelemetryLog('RAZORPAY_API', `Requesting Razorpay order creation for ₹${totalAmount}...`);

    try {
      const activeCart = upsellIncluded ? cart : cart.filter(item => !item.is_upsell);
      const cartIds = activeCart.map(item => item.product_id);

      const token = localStorage.getItem('razoragent_token');
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${API_BASE}/api/create-order`, {
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
        if (window.confirm('Simulate successful payment for Agent order?')) {
          simulateRazorpayModal(options);
        } else {
          setIsProcessingPayment(false);
        }
      } else if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
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

  const verifyPaymentOnBackend = async (paymentPayload, forceSimulateFailure = false) => {
    setIsProcessingPayment(true);
    appendTelemetryLog('PAYMENT_VERIFICATION_INIT', 'Sending payment payload for backend HMAC validation...');

    try {
      // Simulate 2-second S2S processing time for the prototype
      await new Promise(resolve => setTimeout(resolve, 2000));

      const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${API_BASE}/api/verify-payment`, {
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
        appendTelemetryLog('TRANSACTION_SEALED', 'Transaction completed successfully. Order dispatched!');
      } else {
        setPaymentVerified(false);
        setPaymentFailed(true);
        setPaymentErrorMessage(verifyData.message || 'Payment decline');
        appendTelemetryLog('PAYMENT_VERIFICATION_FAILED', verifyData.telemetry || verifyData.message);
        appendTelemetryLog('RETRY_ENGINE', 'Preserving cart state. No duplicate order created. Clean retry available.');
        setIsProcessingPayment(false);
      }
    } catch (err) {
      appendTelemetryLog('ERROR', `Verification Error: ${err.message}`);
      setIsProcessingPayment(false);
    }
  };

  const handleApproveHumanGate = () => {
    setIsHumanGateModalOpen(false);
    appendTelemetryLog('HUMAN_GATE_DECISION', 'User APPROVED spending gate override. Proceeding to checkout.');
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

  const mainProductItem = cart.length > 0 ? cart[0] : null;
  const upsellItem = cart.find(i => i.is_upsell);

  return {
    promptInput, setPromptInput,
    userBudget, setUserBudget,
    isProcessing,
    currentStep,
    cart, totalAmount,
    policyStatus, requiresHumanApproval, policyMessage,
    upsellApplied, upsellIncluded, handleToggleUpsell,
    isProcessingPayment, orderDetails, paymentVerified, paymentFailed, paymentErrorMessage,
    telemetryLogs, clearTelemetryLogs, appendTelemetryLog,
    isHumanGateModalOpen, setIsHumanGateModalOpen,
    executeAgentOrder,
    setupAgentMandate,
    handleRevokeMandate,
    initiateRazorpayPayment,
    handleApproveHumanGate,
    handleRejectHumanGate,
    handleResetOrder,
    mainProductItem, upsellItem
  };
}

import React, { useRef, useEffect } from 'react';
import HeroCommandArea from './HeroCommandArea.jsx';
import TransactionWorkflow from './TransactionWorkflow.jsx';
import ProductCard from './ProductCard.jsx';
import SmartUpsellSection from './SmartUpsellSection.jsx';
import PolicySafetyPanel from './PolicySafetyPanel.jsx';
import PaymentExperience from './PaymentExperience.jsx';
import FailureStateBanner from './FailureStateBanner.jsx';

export default function WorkspaceView({ commerce, agentAuthorization, setIsAuditDrawerOpen }) {
  const workflowRef = useRef(null);
  const workspaceRef = useRef(null);

  // Scroll to workflow on execution start
  useEffect(() => {
    if (commerce.isProcessing && workflowRef.current) {
      setTimeout(() => {
        workflowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [commerce.isProcessing]);

  // Scroll to workspace on product received
  useEffect(() => {
    if ((commerce.cart.length > 0 || commerce.policyStatus) && workspaceRef.current && !commerce.isProcessing) {
      setTimeout(() => {
        workspaceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [commerce.cart, commerce.policyStatus, commerce.isProcessing]);

  return (
    <>
      {/* 1. HERO COMMAND AREA */}
      <HeroCommandArea
        promptInput={commerce.promptInput}
        setPromptInput={commerce.setPromptInput}
        userBudget={commerce.userBudget}
        setUserBudget={commerce.setUserBudget}
        onExecute={commerce.executeAgentOrder}
        isProcessing={commerce.isProcessing}
      />

      {/* 2. TRANSACTION WORKFLOW STEPPER */}
      <div ref={workflowRef}>
        <TransactionWorkflow
          currentStep={commerce.currentStep}
          policyStatus={commerce.policyStatus}
          paymentStatus={commerce.paymentFailed ? 'FAILED' : commerce.paymentVerified ? 'SUCCESS' : 'PENDING'}
        />
      </div>

      {/* 3. ACTIVE TRANSACTION WORKSPACE */}
      {(commerce.cart.length > 0 || commerce.policyStatus === 'UNCERTAIN' || commerce.policyStatus === 'BLOCKED_REQUIRES_APPROVAL') ? (
        <div ref={workspaceRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start scroll-mt-24">
          
          {/* LEFT / MAIN COLUMN: PRODUCTS & UPSELL */}
          <div className={`${commerce.paymentVerified ? 'lg:col-span-12 max-w-4xl mx-auto w-full' : 'lg:col-span-7'} space-y-6`}>
            
            {/* SUCCESS STATE OVERRIDE */}
            {commerce.paymentVerified ? (
              <PaymentExperience
                status="SUCCESS"
                orderDetails={commerce.orderDetails}
                totalAmount={commerce.totalAmount}
                onOpenAuditTrail={() => setIsAuditDrawerOpen(true)}
                onResetOrder={commerce.handleResetOrder}
              />
            ) : commerce.paymentFailed ? (
              /* PAYMENT DECLINE FAILURE STATE */
              <FailureStateBanner
                mode="PAYMENT"
                errorMessage={commerce.paymentErrorMessage}
                onRetry={commerce.initiateRazorpayPayment}
              />
            ) : commerce.policyStatus === 'UNCERTAIN' ? (
              /* AMBIGUITY FAILURE STATE */
              <FailureStateBanner
                mode="AMBIGUITY"
                errorMessage={commerce.policyMessage}
                onSelectOption={(text) => commerce.executeAgentOrder(text)}
              />
            ) : (
              /* STANDARD PRODUCT RECOMMENDATION */
              <>
                {commerce.mainProductItem && (
                  <ProductCard item={commerce.mainProductItem} />
                )}

                {/* SMART UPSELL MODULE */}
                {commerce.upsellApplied && commerce.upsellItem && (
                  <SmartUpsellSection
                    upsellItem={commerce.upsellItem}
                    mainProductName={commerce.mainProductItem?.product}
                    mainProductPrice={commerce.mainProductItem ? commerce.mainProductItem.price : 3499}
                    userBudget={commerce.userBudget}
                    isIncluded={commerce.upsellIncluded}
                    onToggleUpsell={commerce.handleToggleUpsell}
                  />
                )}
              </>
            )}

          </div>

          {/* RIGHT COLUMN: FINANCIAL SAFETY PANEL */}
          {!commerce.paymentVerified && (
            <div className="lg:col-span-5 space-y-6 sticky top-20">
              
              {/* SAFETY POLICY PANEL */}
              <PolicySafetyPanel
                userBudget={commerce.userBudget}
                totalAmount={commerce.totalAmount}
                policyStatus={commerce.policyStatus}
                requiresHumanApproval={commerce.requiresHumanApproval}
                agentAuthorization={agentAuthorization}
                onApproveHumanGate={() => commerce.setIsHumanGateModalOpen(true)}
                onInitiatePayment={commerce.initiateRazorpayPayment}
                onClarifyQuery={(t) => commerce.executeAgentOrder(t)}
                isProcessingPayment={commerce.isProcessingPayment}
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
  );
}

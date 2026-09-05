import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import AuditTelemetryDrawer from './components/AuditTelemetryDrawer.jsx';
import JsonCatalogModal from './components/JsonCatalogModal.jsx';
import HumanApprovalModal from './components/HumanApprovalModal.jsx';
import AuthOverlay from './components/AuthOverlay.jsx';
import LandingPage from './components/LandingPage.jsx';
import UserProfileModal from './components/UserProfileModal.jsx';
import MandateSetupModal from './components/MandateSetupModal.jsx';
import TransactionHistoryModal from './components/TransactionHistoryModal.jsx';
import RazorAgentSplash from './components/RazorAgentSplash.jsx';
import WorkspaceView from './components/WorkspaceView.jsx';
import { useAgentCommerce } from './hooks/useAgentCommerce.js';

export default function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState(localStorage.getItem('razoragent_view') || 'landing');
  const [showSplash, setShowSplash] = useState(currentView === 'landing');
  
  const [agentAuthorization, setAgentAuthorization] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('user');
  const [isMandateModalOpen, setIsMandateModalOpen] = useState(false);

  // Global Modals & Auth Mode
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Splash Screen Duration
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

  // Fetch Session on Mount
  useEffect(() => {
    const token = localStorage.getItem('razoragent_token');
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
    
    if (token) {
      fetch(`${API_BASE}/api/user/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsAuthenticated(true);
          setAgentAuthorization(data.user.agentAuthorization);
          setUserEmail(data.user.email);
          setUserRole(data.user.role || 'user');
        } else {
          // Token is invalid or expired, log them out properly
          localStorage.removeItem('razoragent_token');
          localStorage.removeItem('razoragent_view');
          setCurrentView('landing');
        }
        setIsInitializing(false);
      })
      .catch(err => {
        console.error("Session restore failed:", err);
        localStorage.removeItem('razoragent_token');
        localStorage.removeItem('razoragent_view');
        setCurrentView('landing');
        setIsInitializing(false);
      });
    } else {
      setIsInitializing(false);
    }
  }, []);

  // Initialize Commerce Engine
  const commerce = useAgentCommerce({
    userEmail, 
    agentAuthorization, 
    setAgentAuthorization,
    setIsMandateModalOpen
  });

  const handleLogout = () => {
    localStorage.removeItem('razoragent_token');
    localStorage.removeItem('razoragent_view');
    setIsAuthenticated(false);
    setUserEmail('');
    setUserRole('user');
    setAgentAuthorization(null);
    commerce.handleResetOrder();
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
        telemetryLogsCount={commerce.telemetryLogs.length}
        agentAuthorization={agentAuthorization}
        onSetupAgentPayments={() => setIsMandateModalOpen(true)}
        userEmail={userEmail}
        userRole={userRole}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onGoHome={() => setCurrentView('landing')}
      />

      {/* MAIN CONTENT WRAPPER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        <WorkspaceView 
          commerce={commerce} 
          agentAuthorization={agentAuthorization} 
          setIsAuditDrawerOpen={setIsAuditDrawerOpen} 
        />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500 font-mono">
        RazorAgent • Razorpay Buildathon Track 01 • Bounded Autonomous Agentic Commerce
      </footer>

      {/* GLOBAL MODALS */}
      <AuditTelemetryDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        telemetryLogs={commerce.telemetryLogs}
        onClearLogs={commerce.clearTelemetryLogs}
      />
      <JsonCatalogModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
      />
      <HumanApprovalModal
        isOpen={commerce.isHumanGateModalOpen}
        onClose={() => commerce.setIsHumanGateModalOpen(false)}
        totalAmount={commerce.totalAmount}
        userBudget={commerce.userBudget}
        onApprove={commerce.handleApproveHumanGate}
        onReject={commerce.handleRejectHumanGate}
      />
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userEmail={userEmail}
        agentAuthorization={agentAuthorization}
        onRevoke={commerce.handleRevokeMandate}
      />
      <MandateSetupModal
        isOpen={isMandateModalOpen}
        onClose={() => setIsMandateModalOpen(false)}
        onAuthorize={commerce.setupAgentMandate}
        isProcessing={commerce.isProcessing}
      />
      <TransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </div>
  );
}

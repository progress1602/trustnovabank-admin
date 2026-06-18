/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  LogOut, 
  User as UserIcon, 
  Layers, 
  Briefcase, 
  CheckSquare, 
  UserPlus, 
  ShieldCheck, 
  ExternalLink,
  RefreshCw,
  Clock,
  Menu,
  X,
  History,
  TrendingUp,
  Send,
  Heart,
  FileCheck2
} from 'lucide-react';

import { User, Loan } from './types';
import { 
  getStoredToken, 
  getStoredAdminUser, 
  clearStoredAuth 
} from './lib/graphql';

import AdminLogin from './components/AdminLogin';
import CreateAdminForm from './components/CreateAdminForm';
import LoansManager from './components/LoansManager';
import ApproveLoanForm from './components/ApproveLoanForm';
import CreditUserBalanceForm from './components/CreditUserBalanceForm';
import AdminProfileView from './components/AdminProfileView';
import TransactionsManager from './components/TransactionsManager';
import DepositsManager from './components/DepositsManager';
import WireTransfersManager from './components/WireTransfersManager';
import CharitiesManager from './components/CharitiesManager';
import GrantsManager from './components/GrantsManager';

export default function App() {
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [adminUser, setAdminUser] = useState<User | null>(getStoredAdminUser());
  const [showRegisterView, setShowRegisterView] = useState(false);

  // Prefill state coordinates
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Auto-refresh mechanism for Loans collection
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [activeTab, setActiveTab] = useState<'loans' | 'credit' | 'transactions' | 'deposits' | 'wireTransfers' | 'charities' | 'grants' | 'register' | 'profile'>('loans');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLoginSuccess = (user: User, storedToken: string) => {
    setToken(storedToken);
    setAdminUser(user);
    setShowRegisterView(false);
  };

  const handleLogout = () => {
    clearStoredAuth();
    setToken(null);
    setAdminUser(null);
    setSelectedLoanId('');
    setSelectedUserId('');
  };

  const handleSelectLoan = (loan: Loan) => {
    setSelectedLoanId(loan.id);
    setSelectedUserId(loan.userId);
  };

  const handleMutationSuccess = () => {
    // Increment refreshed tag to trigger child table query re-loads automatically
    setRefreshTrigger(prev => prev + 1);
  };

  React.useEffect(() => {
    if (activeTab === 'register' && adminUser) {
      const isSuper = adminUser.role?.toUpperCase() === 'SUPER_ADMIN' || adminUser.role?.toUpperCase().includes('SUPER');
      if (!isSuper) {
        setActiveTab('loans');
      }
    }
  }, [activeTab, adminUser]);

  // If unauthorized, show security gateway login or creation switch
  if (!token || !adminUser) {
    if (showRegisterView) {
      return (
        <CreateAdminForm 
          onSuccess={(newAdmin) => {
            // Once root is generated, redirect back to login and let user authenticate
            setShowRegisterView(false);
          }}
          onBackToLogin={() => setShowRegisterView(false)}
        />
      );
    }

    return (
      <AdminLogin 
        onLoginSuccess={handleLoginSuccess} 
      />
    );
  }

  const isSuperAdmin = adminUser.role?.toUpperCase() === 'SUPER_ADMIN' || adminUser.role?.toUpperCase().includes('SUPER');

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans flex flex-col md:flex-row selection:bg-brand-500/20 selection:text-brand-500">
      
      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between bg-zinc-950 border-b border-zinc-800 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-black border border-gold-500/50 rounded flex items-center justify-center text-gold-500">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="text-sm font-extrabold text-gold-500 tracking-wider">TRUSTNOVA</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 bg-zinc-900 border border-zinc-800 rounded text-slate-300 hover:text-gold-500 transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Sidebar - Permanent on desktop, slid out on mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-[#d4af37]/20 flex flex-col justify-between transition-transform duration-300 transform
        md:sticky md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Sidebar Header */}
        <div className="p-5 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-black border-2 border-gold-500 rounded flex items-center justify-center text-gold-500 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-white tracking-widest font-sans">
                  TRUSTNOVA 
                </span>
                <span className="text-[9px] text-[#d4af37] font-semibold border border-[#d4af37]/30 px-1 py-0.2 rounded-sm bg-[#d4af37]/5">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-zinc-500">Dashboard Control Gate</p>
            </div>
          </div>

          {/* Connected host address */}
          <div className="mt-4 px-2.5 py-1.5 bg-zinc-900/50 border border-zinc-900 rounded text-[10px] font-mono text-zinc-400 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500 animate-pulse" />
            <span className="truncate">Server: manual-bank.onrender</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <span className="px-3 text-[9px] uppercase font-extrabold tracking-wider text-zinc-500 block mb-2">
            Main Features
          </span>

          <button
            onClick={() => { setActiveTab('loans'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'loans'
                ? "bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/5 border-l-4 border-[#d4af37] text-[#d4af37] pl-3"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <Briefcase className="h-4 w-4 text-[#d4af37]" />
            <span>Loans List</span>
          </button>

          <button
            onClick={() => { setActiveTab('credit'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'credit'
                ? "bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/5 border-l-4 border-[#d4af37] text-[#d4af37] pl-3"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <Layers className="h-4 w-4 text-[#d4af37]" />
            <span>Deposit Funds</span>
          </button>

          <button
            onClick={() => { setActiveTab('deposits'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'deposits'
                ? "bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/5 border-l-4 border-[#d4af37] text-[#d4af37] pl-3"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <TrendingUp className="h-4 w-4 text-[#d4af37]" />
            <span>Deposits (Clearings)</span>
          </button>

          <button
            onClick={() => { setActiveTab('wireTransfers'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'wireTransfers'
                ? "bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/5 border-l-4 border-[#d4af37] text-[#d4af37] pl-3"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <Send className="h-4 w-4 text-[#d4af37]" />
            <span>Wire Transfers</span>
          </button>

          <button
            onClick={() => { setActiveTab('charities'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'charities'
                ? "bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/5 border-l-4 border-[#d4af37] text-[#d4af37] pl-3"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <Heart className="h-4 w-4 text-[#d4af37]" />
            <span>Charities</span>
          </button>

          <button
            onClick={() => { setActiveTab('grants'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'grants'
                ? "bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/5 border-l-4 border-[#d4af37] text-[#d4af37] pl-3"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <FileCheck2 className="h-4 w-4 text-[#d4af37]" />
            <span>Grants</span>
          </button>

          <button
            onClick={() => { setActiveTab('transactions'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'transactions'
                ? "bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/5 border-l-4 border-[#d4af37] text-[#d4af37] pl-3"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <History className="h-4 w-4 text-[#d4af37]" />
            <span>Transactions List</span>
          </button>


          {isSuperAdmin && (
            <>
              <span className="px-3 pt-4 text-[9px] uppercase font-extrabold tracking-wider text-zinc-500 block mb-2">
                Administration
              </span>

              <button
                onClick={() => { setActiveTab('register'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? "bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/5 border-l-4 border-[#d4af37] text-[#d4af37] pl-3"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <UserPlus className="h-4 w-4 text-[#d4af37]" />
                <span>Add New Admin</span>
              </button>
            </>
          )}

          <button
            onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'profile'
                ? "bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/5 border-l-4 border-[#d4af37] text-[#d4af37] pl-3"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-[#d4af37]" />
            <span>Active Profile</span>
          </button>

          {/* Quick status state or Selection card in sidebar for context retention */}
          <div className="mt-6 p-3 bg-zinc-900/40 border border-zinc-900 rounded-lg space-y-2">
            <span className="text-[8px] uppercase font-mono tracking-wider text-zinc-500 font-extrabold block">
              Active Selection Buffer
            </span>
            <div className="space-y-1.5 text-[10px] font-mono leading-none">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-zinc-500">Loan ID:</span>
                <span className={selectedLoanId ? "text-[#d4af37] font-bold" : "text-zinc-600 italic"}>
                  {selectedLoanId ? selectedLoanId.slice(0, 8) + "..." : "None Selected"}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-zinc-500">User ID:</span>
                <span className={selectedUserId ? "text-[#d4af37] font-bold" : "text-zinc-600 italic"}>
                  {selectedUserId ? selectedUserId.slice(0, 8) + "..." : "None Selected"}
                </span>
              </div>
            </div>
            {selectedLoanId && activeTab !== 'credit' && (
              <div className="pt-1.5">
                <button 
                  onClick={() => setActiveTab('credit')}
                  className="w-full py-1 text-center bg-zinc-800 hover:bg-[#d4af37]/10 hover:text-[#d4af37] hover:border-[#d4af37]/35 text-white text-[9px] font-bold uppercase rounded border border-zinc-800 cursor-pointer transition-all"
                >
                  Deposit View &rarr;
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Sidebar Footer with active admin profile and logout */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-900/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-zinc-900 border border-gold-500/30 flex items-center justify-center text-xs text-gold-500 font-bold font-mono">
              {adminUser.firstName[0]}{adminUser.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-bold text-white truncate leading-none">
                {adminUser.firstName} {adminUser.lastName}
              </span>
              <span className="text-[9px] text-zinc-500 font-mono block uppercase mt-0.5">
                {adminUser.role} Account
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 bg-zinc-950 hover:bg-red-950/20 active:bg-zinc-900 border border-zinc-800 hover:border-red-900 text-zinc-400 hover:text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="fixed inset-0 z-30 bg-black/80 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Right-side Content Hub */}
      <div className="flex-1 flex flex-col min-w-0 bg-neutral-950">
        
        {/* Top Header - contains active view details & status info */}
        <header className="hidden md:flex sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-900 px-6 py-4 items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-white tracking-wide uppercase font-sans flex items-center gap-2">
              {activeTab === 'loans' && "Loan Underwriting System"}
              {activeTab === 'credit' && "Deposit Customer Funds"}
              {activeTab === 'transactions' && "Global Transaction History"}
              {activeTab === 'deposits' && "Deposit Underwriting (Receipts)"}
              {activeTab === 'wireTransfers' && "Wire Transfer Clearing"}
              {activeTab === 'charities' && "Charity Disbursement Board"}
              {activeTab === 'grants' && "Corporate Grants Allocation"}
              {activeTab === 'register' && "Add New Administrator"}
              {activeTab === 'profile' && "Your Profile Settings"}
            </h2>
            <p className="text-zinc-500 text-xs mt-0.5">
              {activeTab === 'loans' && "Review client loan requests, authorize payouts or reject manual logs"}
              {activeTab === 'credit' && "Inject active capital directly into standard customer balance ledger"}
              {activeTab === 'transactions' && "Monitor banking history, trace electronic transfers and channel logs"}
              {activeTab === 'deposits' && "Verify uploaded proof-of-payment bank slips to approve incoming cash"}
              {activeTab === 'wireTransfers' && "Verify interbank SWIFT parameters and IBAN details to release or decline wire cashflows"}
              {activeTab === 'charities' && "Review, authorize, or decline philanthropic NGO donation outlays"}
              {activeTab === 'grants' && "Audit, release, or decline business or technical grant funding applications"}
              {activeTab === 'register' && "Create secondary authorization credentials for manual database control"}
              {activeTab === 'profile' && "Verify current admin identity settings and record logs"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Clock Indicator */}
            <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#d4af37]" />
              <span>UTC : 2026-06-04</span>
            </div>
          </div>
        </header>

        {/* Action Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              {activeTab === 'loans' && (
                <div className="space-y-6">
                  {/* Summary/Helper Banner */}
                  <div className="bg-gradient-to-r from-zinc-900 to-black border border-[#d4af37]/30 rounded-xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                      <Briefcase className="h-28 w-28 text-gold-500" />
                    </div>
                    <div className="relative z-10">
                      <span className="text-[10px] text-gold-500 font-extrabold uppercase tracking-wide bg-gold-500/10 border border-gold-500/20 px-2.5 py-0.5 rounded">
                        Action Guide
                      </span>
                      <h3 className="text-base font-bold text-white mt-2">Manual Underwriting Dashboard</h3>
                      <p className="text-zinc-400 text-xs mt-1 max-w-xl leading-relaxed">
                        To process approvals or reject manual loan applications, select any row in the **Loans Registry** below. Decision controls will load on the right column instantly.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <div className="lg:col-span-2">
                      <LoansManager 
                        onSelectLoan={(loan) => {
                          handleSelectLoan(loan);
                        }}
                        selectedLoanId={selectedLoanId}
                        refreshTrigger={refreshTrigger}
                      />
                    </div>
                    <div className="lg:col-span-1">
                      <ApproveLoanForm 
                        prefilledLoanId={selectedLoanId}
                        onApproveSuccess={handleMutationSuccess}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'credit' && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <CreditUserBalanceForm 
                    prefilledUserId={selectedUserId}
                    onCreditSuccess={handleMutationSuccess}
                  />

                  {/* Selection contextual assist helper */}
                  {!selectedUserId && (
                    <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-lg text-center">
                      <p className="text-xs text-zinc-500 leading-normal">
                        No customer record is pre-filled. You can search or select a loan from the 
                        <button 
                          onClick={() => setActiveTab('loans')} 
                          className="mx-1 text-gold-500 hover:underline font-bold"
                        >
                          Loans List
                        </button> 
                        page to auto-populate the client identifier.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'transactions' && (
                <div className="space-y-6">
                  <TransactionsManager refreshTrigger={refreshTrigger} />
                </div>
              )}

              {activeTab === 'deposits' && (
                <div className="space-y-6">
                  <DepositsManager onMutationSuccess={handleMutationSuccess} refreshTrigger={refreshTrigger} />
                </div>
              )}

              {activeTab === 'wireTransfers' && (
                <div className="space-y-6">
                  <WireTransfersManager onMutationSuccess={handleMutationSuccess} refreshTrigger={refreshTrigger} />
                </div>
              )}

              {activeTab === 'charities' && (
                <div className="space-y-6">
                  <CharitiesManager onMutationSuccess={handleMutationSuccess} refreshTrigger={refreshTrigger} />
                </div>
              )}

              {activeTab === 'grants' && (
                <div className="space-y-6">
                  <GrantsManager onMutationSuccess={handleMutationSuccess} refreshTrigger={refreshTrigger} />
                </div>
              )}

              {activeTab === 'register' && isSuperAdmin && (
                <div className="max-w-2xl mx-auto">
                  <CreateAdminForm isInDashboard={true} />
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="max-w-2xl mx-auto">
                  <AdminProfileView user={adminUser} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Corporate trust footer */}
        <footer className="bg-zinc-950 border-t border-zinc-900 py-6 px-6 mt-12">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-zinc-500">
            <p>© 2026 Trustnova Banking Group. Secure Administrative Core Active.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-500" /> Database Link Active
              </span>
              <span>API Gateway Connected</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}

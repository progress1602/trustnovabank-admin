/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, 
  Search, 
  RotateCw, 
  CheckCircle, 
  XSquare, 
  AlertCircle, 
  Image as ImageIcon, 
  FileText, 
  Calendar, 
  User as UserIcon, 
  CornerDownRight, 
  DollarSign, 
  TrendingUp, 
  X,
  Clock,
  Sparkles
} from 'lucide-react';
import { runGraphQL, DEPOSITS_QUERY, APPROVE_DEPOSIT_MUTATION, REJECT_DEPOSIT_MUTATION } from '../lib/graphql';
import { Deposit } from '../types';

interface DepositsManagerProps {
  onMutationSuccess: () => void;
  refreshTrigger: number;
}

export default function DepositsManager({ onMutationSuccess, refreshTrigger }: DepositsManagerProps) {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  
  // Reject modal/form state
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [loadingSeconds, setLoadingSeconds] = useState(0);

  // Full-scale image preview modal
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingSeconds(0);
      interval = setInterval(() => {
        setLoadingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setLoadingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const fetchDeposits = async (showLoader = true, bypassCache = false) => {
    if (showLoader) setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await runGraphQL<{ deposits: Deposit[] }>(DEPOSITS_QUERY, {}, bypassCache);
      if (data && data.deposits) {
        setDeposits(data.deposits);
      }
    } catch (error: any) {
      console.error('Error fetching deposits:', error);
      setErrorMessage(error.message || 'Failed to fetch deposits ledger.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits(true);
  }, [refreshTrigger]);

  // Handle selected sync if dataset changes
  useEffect(() => {
    if (selectedDeposit) {
      const updated = deposits.find(d => d.id === selectedDeposit.id);
      if (updated) setSelectedDeposit(updated);
    }
  }, [deposits]);

  // Sandbox fallback database mock
  const loadDemoDeposits = () => {
    const demoData: Deposit[] = [
      {
        id: "dep_661271",
        userId: "usr_trust7721",
        amount: 3500.00,
        paymentMethod: "WIRE_TRANSFER",
        proofOfPayment: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
        reference: "DEP-WIRE-9821211",
        status: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "dep_152341",
        userId: "usr_nova9912",
        amount: 12500.00,
        paymentMethod: "MANUAL_SLIP",
        proofOfPayment: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
        reference: "DEP-SLIP-4412092",
        status: "APPROVED",
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      {
        id: "dep_912095",
        userId: "usr_star8811",
        amount: 850.00,
        paymentMethod: "CRYPTO_USDT",
        proofOfPayment: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=800&q=80",
        reference: "TXN_HASH_USDT_0219A91B",
        status: "REJECTED",
        createdAt: new Date(Date.now() - 86450000).toISOString(),
        updatedAt: new Date(Date.now() - 86450000).toISOString()
      }
    ];
    setDeposits(demoData);
  };

  const handleApprove = async (depositId: string) => {
    setActionLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const data = await runGraphQL<{ approveDeposit: Deposit }>(APPROVE_DEPOSIT_MUTATION, { depositId });
      if (data && data.approveDeposit) {
        setSuccessMessage(`Deposit reference ${depositId} has been approved successfully!`);
        onMutationSuccess();
        fetchDeposits(false);
      } else {
        throw new Error("Resolution returned null response.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Server rejected approval sequence.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeposit) return;
    
    setActionLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const data = await runGraphQL<{ rejectDeposit: Deposit }>(REJECT_DEPOSIT_MUTATION, {
        depositId: selectedDeposit.id,
        remarks: remarks.trim() || undefined
      });
      if (data && data.rejectDeposit) {
        setSuccessMessage(`Deposit transaction ${selectedDeposit.id} has been rejected.`);
        setShowRejectForm(false);
        setRemarks('');
        onMutationSuccess();
        fetchDeposits(false);
      } else {
        throw new Error("Resolution returned null response.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Server rejected rejection sequence.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredDeposits = deposits.filter(dep => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      dep.id.toLowerCase().includes(term) ||
      dep.userId.toLowerCase().includes(term) ||
      dep.reference.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'ALL' || dep.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Upper Utility Header Card */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold-400/10 rounded-lg border border-gold-500/30 text-gold-500">
              <Layers className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#d4af37] tracking-wider uppercase font-sans">
                Pending Deposit Clearings
              </h3>
              <p className="text-zinc-500 text-[11px] font-sans">
                Approve capital injections after confirming wire or ticket proof-of-payment receipts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchDeposits(true, true)}
              disabled={isLoading}
              className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-[#d4af37] transition-all cursor-pointer disabled:opacity-50"
              title="Refresh ledger feed"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            {deposits.length === 0 && !isLoading && (
              <button
                type="button"
                onClick={loadDemoDeposits}
                className="py-1 px-2.5 bg-zinc-900 border border-[#d4af37]/30 hover:border-[#d4af37]/60 text-[#d4af37] text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-all font-sans"
              >
                Load Sandbox Data
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <Search className="h-3.5 w-3.5" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Deposit ID, reference or client identifier..."
              className="w-full pl-8.5 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 focus:border-[#d4af37] rounded-lg outline-none text-xs text-white transition-all placeholder-zinc-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-[#d4af37] rounded-lg outline-none text-xs text-white cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING审核</option>
              <option value="APPROVED">APPROVED (Captured)</option>
              <option value="REJECTED">REJECTED (Declined)</option>
            </select>
          </div>
        </div>
      </div>

      {actionLoading && (
        <div className="p-3 bg-gold-500/10 border border-gold-500/20 text-[#d4af37] rounded-lg text-xs font-semibold flex items-center gap-2 font-mono">
          <RotateCw className="h-4 w-4 animate-spin text-gold-500" />
          Dispatching resolution query to high-trust API core...
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-950/20 border border-red-920/40 text-red-400 rounded-lg text-xs flex gap-3">
          <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold block text-red-450 uppercase text-[10px] tracking-wider mb-0.5">Command Rejected</span>
            {errorMessage}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-920/40 text-emerald-400 rounded-lg text-xs flex gap-3">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold block text-emerald-450 uppercase text-[10px] tracking-wider mb-0.5">Clearing Captured</span>
            {successMessage}
          </div>
        </div>
      )}

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Collection Panel */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
              <RotateCw className="h-6 w-6 animate-spin text-[#d4af37]" />
              <p className="text-xs text-zinc-405 font-mono">Executing GraphQL clearing query... {loadingSeconds}s</p>
            </div>
          ) : filteredDeposits.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="h-8 w-8 text-zinc-650 mx-auto mb-2" />
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Empty Ledger</p>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
                No active receipts are matching your status queries. Use standard sandbox data options to test UI.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-900/20 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                    <th className="py-3.5 px-4 font-sans">Clearing Ref / client</th>
                    <th className="py-3.5 px-4 font-sans text-right">Credit Amount</th>
                    <th className="py-3.5 px-4 font-sans text-center">Receipt Image</th>
                    <th className="py-3.5 px-4 font-sans text-center">Ledger State</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-xs">
                  {filteredDeposits.map((dep) => {
                    const isSelected = selectedDeposit?.id === dep.id;
                    const hasProof = !!dep.proofOfPayment;
                    return (
                      <tr 
                        key={dep.id}
                        className={`transition-colors hover:bg-zinc-900/30 ${
                          isSelected ? 'bg-[#d4af37]/5' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-white text-xs tracking-tight">
                              {dep.id}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                              User: {dep.userId.slice(0, 10)}...
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono font-black text-xs text-emerald-450">
                            +${dep.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {hasProof ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setZoomedImage(dep.proofOfPayment!);
                              }}
                              className="mx-auto flex items-center justify-center h-8 w-12 bg-zinc-900 hover:bg-[#d4af37]/20 border border-zinc-800 rounded group transition-all relative overflow-hidden cursor-zoom-in"
                            >
                              <img 
                                src={dep.proofOfPayment} 
                                alt="Proof" 
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                              />
                            </button>
                          ) : (
                            <span className="text-[10px] text-zinc-650 italic font-mono uppercase">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-sm ${
                            dep.status === 'APPROVED' ? 'text-emerald-400 bg-emerald-500/5 border border-emerald-500/10' :
                            dep.status === 'PENDING' ? 'text-amber-500 bg-amber-500/5 border border-amber-500/10' :
                            'text-red-500 bg-red-500/5 border border-red-500/10'
                          }`}>
                            ● {dep.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDeposit(dep);
                              setShowRejectForm(false);
                            }}
                            className="bg-zinc-900 hover:bg-[#d4af37]/20 hover:text-white border border-zinc-800 text-zinc-400 py-1 px-2 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer font-sans"
                          >
                            Details &rarr;
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Panel Column */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedDeposit ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-md text-xs font-sans"
              >
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#d4af37]" />
                    <span className="font-extrabold uppercase text-white tracking-wider text-xs">
                      Clearing Control
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDeposit(null);
                      setShowRejectForm(false);
                    }}
                    className="text-[10px] text-zinc-500 hover:text-white bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-2.5 font-mono text-[11px] divide-y divide-zinc-900">
                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-505">Transaction UUID:</span>
                    <span className="text-white font-bold select-all">{selectedDeposit.id}</span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-550">Target User ID:</span>
                    <span className="text-white font-extrabold select-all">{selectedDeposit.userId}</span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-505">Inflow amount:</span>
                    <span className="text-emerald-400 font-extrabold text-xs">
                      ${selectedDeposit.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-550">Receipt Method:</span>
                    <span className="text-zinc-300 font-bold">{selectedDeposit.paymentMethod}</span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-505">Bank Slip Reference:</span>
                    <span className="text-[#d4af37] font-bold select-all">{selectedDeposit.reference}</span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-550">Created Date:</span>
                    <span className="text-zinc-400">{new Date(selectedDeposit.createdAt).toLocaleString()}</span>
                  </div>

                  {/* Proof of Payment Picture - explicitly customized */}
                  {selectedDeposit.proofOfPayment && (
                    <div className="pt-3 flex flex-col gap-1.5 text-left">
                      <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                        <ImageIcon className="h-3.5 w-3.5 text-[#d4af37]" />
                        Proof Of Payment
                      </span>
                      <div className="relative border border-zinc-900 rounded-lg overflow-hidden bg-black/60 h-36">
                        <img
                          src={selectedDeposit.proofOfPayment}
                          alt="Manual banking proof of payment receipt check"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setZoomedImage(selectedDeposit.proofOfPayment!)}
                          className="absolute bottom-2 right-2 px-2 py-1 bg-zinc-950/80 border border-zinc-800 rounded text-[9px] text-[#d4af37] font-bold hover:bg-black transition-all cursor-zoom-in font-sans uppercase"
                        >
                          Enlarge Slip
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedDeposit.status === 'PENDING' && !showRejectForm && (
                    <div className="pt-4 flex gap-2 font-sans">
                      <button
                        type="button"
                        onClick={() => handleApprove(selectedDeposit.id)}
                        disabled={actionLoading}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-black text-[10px] font-extrabold uppercase tracking-widest py-2 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1"
                      >
                        Approve Inflow
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRejectForm(true)}
                        disabled={actionLoading}
                        className="flex-1 bg-zinc-900 hover:bg-red-950/20 hover:text-red-400 text-zinc-400 border border-zinc-805 text-[10px] font-extrabold uppercase tracking-widest py-2 rounded-lg cursor-pointer transition-all"
                      >
                        Decline Slip
                      </button>
                    </div>
                  )}
                </div>

                {/* Decline/Reject inline form */}
                {showRejectForm && selectedDeposit.status === 'PENDING' && (
                  <form onSubmit={handleReject} className="pt-3 border-t border-zinc-900 space-y-3 font-sans">
                    <div className="bg-red-500/5 p-2.5 rounded border border-red-950 text-red-400 text-[10px] leading-relaxed">
                      You are rejecting deposit application {selectedDeposit.id}. Enter decline reasons to notify customer context.
                    </div>
                    <div>
                      <label className="block text-zinc-550 text-[10px] uppercase font-bold tracking-wider mb-1">
                        Decline/Reject Remarks
                      </label>
                      <textarea
                        required
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="E.g. Wire slip is illegible or bank metadata is unverified."
                        className="w-full p-2 bg-zinc-900/60 border border-zinc-800 focus:border-red-500 rounded-lg outline-none text-xs text-white placeholder-zinc-550 h-20 resize-none font-sans"
                        disabled={actionLoading}
                      />
                    </div>
                    <div className="flex gap-2 text-[10px] font-extrabold uppercase">
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md cursor-pointer transition-all"
                      >
                        Submit Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowRejectForm(false);
                          setRemarks('');
                        }}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-md cursor-pointer border border-zinc-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Historic Decided State Messages */}
                {selectedDeposit.status !== 'PENDING' && (
                  <div className="p-3 bg-zinc-900/60 border border-zinc-900 rounded-lg flex items-center gap-1.5 font-mono text-[10px]">
                    <Clock className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-zinc-500 uppercase">
                      Clearing completed. Status is locked.
                    </span>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="p-6 bg-zinc-950/50 border border-zinc-900 rounded-xl text-center space-y-2">
                <Sparkles className="h-6 w-6 text-zinc-650 mx-auto" />
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Audit Selector</p>
                <p className="text-zinc-600 text-[10.5px] leading-normal font-sans">
                  Choose an active wire clearing reference on the left tabular ledger. You will instantly load interactive underwriting approvals paired with high-definition receipts.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Enlarged image modal backdrop */}
      <AnimatePresence>
        {zoomedImage && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm"
            onClick={() => setZoomedImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center bg-zinc-950 border border-zinc-900 p-2.5 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="absolute top-4 right-4 p-1.5 bg-zinc-900/90 border border-zinc-800 hover:text-white rounded-full text-zinc-400 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="p-1 px-4 text-xs font-bold font-mono text-[#d4af37] border-b border-zinc-900 w-full mb-3 text-center uppercase tracking-wider">
                Proof Of Payment Wire Receipt Detail
              </div>

              <div className="w-full flex-1 overflow-auto rounded-lg bg-black/40 flex items-center justify-center" style={{ minHeight: '400px' }}>
                <img
                  src={zoomedImage}
                  alt="Proof Of Payment Wire Receipt fullscreen check"
                  referrerPolicy="no-referrer"
                  className="max-h-[66vh] max-w-full object-contain"
                />
              </div>
              <div className="p-2 text-[10px] text-zinc-550 font-mono">
                Click elsewhere to exit fullscreen clearing viewer
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

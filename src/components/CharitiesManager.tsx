/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Search, 
  RotateCw, 
  CheckCircle, 
  XSquare, 
  AlertCircle, 
  FileText, 
  Calendar, 
  User as UserIcon, 
  ArrowUpRight, 
  DollarSign, 
  Sparkles,
  Clock,
  X,
  Building,
  Tag,
  MessageSquare
} from 'lucide-react';
import { runGraphQL, CHARITIES_QUERY, APPROVE_CHARITY_MUTATION, REJECT_CHARITY_MUTATION } from '../lib/graphql';
import { Charity } from '../types';

interface CharitiesManagerProps {
  onMutationSuccess: () => void;
  refreshTrigger: number;
}

export default function CharitiesManager({ onMutationSuccess, refreshTrigger }: CharitiesManagerProps) {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  
  // Reject form state
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [loadingSeconds, setLoadingSeconds] = useState(0);

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

  const fetchCharities = async (showLoader = true, bypassCache = false) => {
    if (showLoader) setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await runGraphQL<{ charities: Charity[] }>(CHARITIES_QUERY, {}, bypassCache);
      if (data && data.charities) {
        setCharities(data.charities);
      }
    } catch (error: any) {
      console.error('Error fetching charities:', error);
      setErrorMessage(error.message || 'Failed to fetch charities registry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCharities(true);
  }, [refreshTrigger]);

  // Synchronize selection details if array updates
  useEffect(() => {
    if (selectedCharity) {
      const updated = charities.find(c => c.id === selectedCharity.id);
      if (updated) setSelectedCharity(updated);
    }
  }, [charities]);

  // Dummy fallback data matching the standard design schema
  const loadDemoCharities = () => {
    const demoData: Charity[] = [
      {
        id: "ch_900101",
        userId: "usr_trust7721",
        organizationName: "Red Cross International Emergency Fund",
        amount: 25000.00,
        message: "Emergency disaster relief grant for regional flood recovery support",
        reference: "TXN-RED-CROSS-99",
        status: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "ch_443190",
        userId: "usr_nova9912",
        organizationName: "Doctors Without Borders",
        amount: 5500.00,
        message: "Medical assistance equipment procurement allocation",
        reference: "TXN-DWB-7721",
        status: "APPROVED",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: "ch_881902",
        userId: "usr_star8811",
        organizationName: "Ocean Conservancy Coalition",
        amount: 12000.00,
        message: "Marine plastic recovery and littoral sanitation project sponsorship",
        reference: "TXN-OCEAN-102",
        status: "REJECTED",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ];
    setCharities(demoData);
  };

  const handleApprove = async (charityId: string) => {
    setActionLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const data = await runGraphQL<{ approveCharity: Charity }>(APPROVE_CHARITY_MUTATION, { charityId });
      if (data && data.approveCharity) {
        setSuccessMessage(`Charity payout initiative ${charityId} has been successfully approved and resolved.`);
        onMutationSuccess();
        fetchCharities(false, true);
      } else {
        throw new Error("GraphQL core returned null confirmation payload.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Server rejected approval query.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCharity) return;

    setActionLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const data = await runGraphQL<{ rejectCharity: Charity }>(REJECT_CHARITY_MUTATION, {
        charityId: selectedCharity.id,
        remarks: remarks.trim() || undefined
      });
      if (data && data.rejectCharity) {
        setSuccessMessage(`Charity payout request ${selectedCharity.id} has been rejected.`);
        setShowRejectForm(false);
        setRemarks('');
        onMutationSuccess();
        fetchCharities(false, true);
      } else {
        throw new Error("GraphQL core returned null confirmation payload.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Server rejected rejection query.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCharities = charities.filter(charity => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      charity.id.toLowerCase().includes(term) ||
      charity.userId.toLowerCase().includes(term) ||
      charity.organizationName.toLowerCase().includes(term) ||
      (charity.reference && charity.reference.toLowerCase().includes(term)) ||
      (charity.message && charity.message.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'ALL' || charity.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Segment */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/30 text-rose-500 animate-pulse">
              <Heart className="h-4.5 w-4.5 fill-rose-500/20" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#d4af37] tracking-wider uppercase font-sans">
                Corporate Charity Disbursements
              </h3>
              <p className="text-zinc-505 text-[11px] font-sans">
                Review, register, audit, and finalize philanthropic donations and altruistic grant outlays
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchCharities(true, true)}
              disabled={isLoading}
              className="p-1.5 bg-zinc-900 border border-zinc-805 rounded-lg text-zinc-450 hover:text-[#d4af37] transition-all cursor-pointer disabled:opacity-50"
              title="Refresh charity feeds"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            {charities.length === 0 && !isLoading && (
              <button
                type="button"
                onClick={loadDemoCharities}
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
              placeholder="Search by charitable body, client UUID, key expressions, references..."
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
              <option value="PENDING">PENDING (Reviewing)</option>
              <option value="APPROVED">APPROVED (Disbursed)</option>
              <option value="REJECTED">REJECTED (Declined)</option>
            </select>
          </div>
        </div>
      </div>

      {actionLoading && (
        <div className="p-3 bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] rounded-lg text-xs font-semibold flex items-center gap-2 font-mono">
          <RotateCw className="h-4 w-4 animate-spin text-gold-500" />
          Dispatching underwriter signature to central ledger...
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
            <span className="font-extrabold block text-emerald-455 uppercase text-[10px] tracking-wider mb-0.5">Disburse Signature Acquired</span>
            {successMessage}
          </div>
        </div>
      )}

      {/* Split main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table representation */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
              <RotateCw className="h-6 w-6 animate-spin text-[#d4af37]" />
              <p className="text-xs text-zinc-500 font-mono">Executing GraphQL querying... {loadingSeconds}s</p>
            </div>
          ) : filteredCharities.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Empty Payout Ledger</p>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
                No fundraising actions correspond to your query bounds. Click 'Load Sandbox Data' to simulate records.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-900/20 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                    <th className="py-3.5 px-4 font-sans">Beneficiary NGO Body</th>
                    <th className="py-3.5 px-4 font-sans text-right">Debit Outgoings</th>
                    <th className="py-3.5 px-4 font-sans text-center">Reference</th>
                    <th className="py-3.5 px-4 font-sans text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Board</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-xs">
                  {filteredCharities.map((charity) => {
                    const isSelected = selectedCharity?.id === charity.id;
                    return (
                      <tr 
                        key={charity.id}
                        className={`transition-colors hover:bg-zinc-900/30 ${
                          isSelected ? 'bg-[#d4af37]/5' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-white text-xs tracking-tight">
                              {charity.organizationName}
                            </span>
                            <span className="text-[10px] text-zinc-550 font-sans mt-0.5 truncate max-w-sm">
                              {charity.message || 'No additional note parameters.'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-mono font-black text-xs text-rose-450">
                            -${charity.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-[10.5px] text-zinc-400 font-mono">
                            {charity.reference || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                            charity.status === 'APPROVED' ? 'text-emerald-450 bg-emerald-500/5 border border-emerald-500/10' :
                            charity.status === 'PENDING' ? 'text-amber-500 bg-amber-500/5 border border-amber-500/10' :
                            'text-red-500 bg-red-500/5 border border-red-500/10'
                          }`}>
                            ● {charity.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCharity(charity);
                              setShowRejectForm(false);
                            }}
                            className="bg-zinc-900 hover:bg-[#d4af37]/20 hover:text-white border border-zinc-800 text-zinc-400 py-1 px-2.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer font-sans"
                          >
                            Underwrite &rarr;
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

        {/* Side detailed drawer */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedCharity ? (
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
                      Underwriter Board
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCharity(null);
                      setShowRejectForm(false);
                    }}
                    className="text-[10px] text-zinc-500 hover:text-white bg-zinc-900 border border-zinc-805 px-2 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-2.5 font-mono text-[11px] divide-y divide-zinc-900">
                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-550">Disburse UUID:</span>
                    <span className="text-white font-bold select-all truncate max-w-[140px]">{selectedCharity.id}</span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-550">Target User:</span>
                    <span className="text-white font-extrabold select-all truncate max-w-[140px]">{selectedCharity.userId}</span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-505">Initiated Value:</span>
                    <span className="text-rose-450 font-black text-xs">
                      -${selectedCharity.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="pt-2 flex flex-col gap-1 text-left">
                    <span className="text-zinc-500 uppercase text-[9px] tracking-wider font-bold">Charitable Target:</span>
                    <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-900 space-y-1.5 mt-1">
                      <div className="flex items-center gap-1.5">
                        <Heart className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                        <div>
                          <span className="text-zinc-400 font-sans font-bold">Recipient Body:</span>
                          <span className="block text-zinc-105 font-sans text-xs font-black mt-0.5">{selectedCharity.organizationName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedCharity.message && (
                    <div className="pt-2 flex flex-col gap-1 text-left">
                      <span className="text-zinc-500 uppercase text-[9px] tracking-wider font-bold">Message Attachment:</span>
                      <div className="bg-zinc-900/40 p-2.5 rounded border border-zinc-900 text-zinc-300 font-sans leading-relaxed flex gap-2">
                        <MessageSquare className="h-3.5 w-3.5 text-[#d4af37] shrink-0 mt-0.5" />
                        <span>{selectedCharity.message}</span>
                      </div>
                    </div>
                  )}

                  {selectedCharity.reference && (
                    <div className="pt-2 flex justify-between gap-2">
                      <span className="text-zinc-550">Reference ID:</span>
                      <span className="text-[#d4af37] font-bold select-all">{selectedCharity.reference}</span>
                    </div>
                  )}

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-550">Logged On:</span>
                    <span className="text-zinc-450">{new Date(selectedCharity.createdAt).toLocaleString()}</span>
                  </div>

                  {selectedCharity.status === 'PENDING' && !showRejectForm && (
                     <div className="pt-4 flex gap-2 font-sans">
                     <button
                       type="button"
                       onClick={() => handleApprove(selectedCharity.id)}
                       disabled={actionLoading}
                       className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-black text-[10px] font-extrabold uppercase tracking-widest py-2 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
                     >
                       Approve Disburse
                     </button>
                     <button
                       type="button"
                       onClick={() => setShowRejectForm(true)}
                       disabled={actionLoading}
                       className="flex-1 bg-zinc-900 hover:bg-red-950/20 hover:text-red-400 text-zinc-400 border border-zinc-805 text-[10px] font-extrabold uppercase tracking-widest py-2 rounded-lg cursor-pointer transition-all"
                     >
                       Reject Disburse
                     </button>
                   </div>
                  )}
                </div>

                {/* Decline validation block */}
                {showRejectForm && selectedCharity.status === 'PENDING' && (
                  <form onSubmit={handleReject} className="pt-3 border-t border-zinc-900 space-y-3 font-sans">
                    <div className="bg-red-500/5 p-2.5 rounded border border-red-950 text-red-400 text-[10px] leading-relaxed">
                      Decline charity payout request {selectedCharity.id}. Remarks are required to finalize rejection.
                    </div>
                    <div>
                      <label className="block text-zinc-500 text-[10px] uppercase font-extrabold tracking-wider mb-1">
                        Rejection reason remarks
                      </label>
                      <textarea
                        required
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="E.g. Organization authentication failure or message fails under financial guidelines."
                        className="w-full p-2 bg-zinc-900/60 border border-zinc-800 focus:border-red-500 rounded-lg outline-none text-xs text-white placeholder-zinc-550 h-20 resize-none font-sans"
                        disabled={actionLoading}
                      />
                    </div>
                    <div className="flex gap-2 text-[10px] font-extrabold uppercase">
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="flex-1 py-1.5 bg-red-650 hover:bg-red-505 text-white rounded-md cursor-pointer transition-all"
                      >
                        Decline Payout
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

                {/* Log final states */}
                {selectedCharity.status !== 'PENDING' && (
                  <div className="p-3 bg-zinc-900/60 border border-zinc-900 rounded-lg flex items-center gap-1.5 font-mono text-[10px]">
                    <Clock className="h-3.5 w-3.5 text-zinc-505" />
                    <span className="text-zinc-500 uppercase">
                      Decision locked. Archive secured.
                    </span>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="p-6 bg-zinc-950/50 border border-zinc-900 rounded-xl text-center space-y-2">
                <Sparkles className="h-6 w-6 text-zinc-700 mx-auto" />
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Underwriting Desk</p>
                <p className="text-zinc-650 text-[10.5px] leading-normal font-sans">
                  Select a philanthropic fund requisition to load corresponding validation files, custom transaction trails, and release controls.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
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
  CreditCard,
  Building,
  Globe,
  Tag
} from 'lucide-react';
import { runGraphQL, WIRE_TRANSFERS_QUERY, APPROVE_WIRE_TRANSFER_MUTATION, REJECT_WIRE_TRANSFER_MUTATION } from '../lib/graphql';
import { WireTransfer } from '../types';

interface WireTransfersManagerProps {
  onMutationSuccess: () => void;
  refreshTrigger: number;
}

export default function WireTransfersManager({ onMutationSuccess, refreshTrigger }: WireTransfersManagerProps) {
  const [wireTransfers, setWireTransfers] = useState<WireTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedWire, setSelectedWire] = useState<WireTransfer | null>(null);
  
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

  const fetchWireTransfers = async (showLoader = true, bypassCache = false) => {
    if (showLoader) setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await runGraphQL<{ wireTransfers: WireTransfer[] }>(WIRE_TRANSFERS_QUERY, {}, bypassCache);
      if (data && data.wireTransfers) {
        setWireTransfers(data.wireTransfers);
      }
    } catch (error: any) {
      console.error('Error fetching wire transfers:', error);
      setErrorMessage(error.message || 'Failed to fetch wire transfers list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWireTransfers(true);
  }, [refreshTrigger]);

  // Synchronize selection details if array updates
  useEffect(() => {
    if (selectedWire) {
      const updated = wireTransfers.find(w => w.id === selectedWire.id);
      if (updated) setSelectedWire(updated);
    }
  }, [wireTransfers]);

  // Fallback template data for seamless sandbox trials
  const loadDemoWires = () => {
    const demoData: WireTransfer[] = [
      {
        id: "wt_992102",
        userId: "usr_trust7721",
        beneficiaryName: "Apex Global Holdings LLC",
        beneficiaryBank: "JP Morgan Chase Bank",
        accountNumber: "123049182390",
        swiftCode: "CHASUS33XXX",
        amount: 85000.00,
        fee: 35.00,
        reason: "Corporate Liquidity Injection",
        reference: "WT-CHASE-0192A",
        status: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "wt_451291",
        userId: "usr_nova9912",
        beneficiaryName: "Clara Oswald",
        beneficiaryBank: "Barclays Bank PLC",
        accountNumber: "GB29BARC20201234567890",
        swiftCode: "BARCGB2D",
        amount: 4200.00,
        fee: 12.00,
        reason: "Family Allocation Remittance",
        reference: "WT-BARC-8219B",
        status: "APPROVED",
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 8).toISOString()
      },
      {
        id: "wt_881023",
        userId: "usr_star8811",
        beneficiaryName: "Helios Energy Ltd",
        beneficiaryBank: "Deutsche Bank AG",
        accountNumber: "DE12370400440532013000",
        swiftCode: "DEUTDEDBXXX",
        amount: 19500.00,
        fee: 25.00,
        reason: "Solar Panel Equipment Invoices",
        reference: "WT-DBANK-4921C",
        status: "REJECTED",
        createdAt: new Date(Date.now() - 86450000).toISOString(),
        updatedAt: new Date(Date.now() - 86450000).toISOString()
      }
    ];
    setWireTransfers(demoData);
  };

  const handleApprove = async (wireTransferId: string) => {
    setActionLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const data = await runGraphQL<{ approveWireTransfer: WireTransfer }>(APPROVE_WIRE_TRANSFER_MUTATION, { wireTransferId });
      if (data && data.approveWireTransfer) {
        setSuccessMessage(`Wire transfer ${wireTransferId} has been successfully approved & processed.`);
        onMutationSuccess();
        fetchWireTransfers(false, true);
      } else {
        throw new Error("API base returned null response.");
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
    if (!selectedWire) return;
    
    setActionLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const data = await runGraphQL<{ rejectWireTransfer: WireTransfer }>(REJECT_WIRE_TRANSFER_MUTATION, {
        wireTransferId: selectedWire.id,
        remarks: remarks.trim() || undefined
      });
      if (data && data.rejectWireTransfer) {
        setSuccessMessage(`Wire transfer ${selectedWire.id} has been declined.`);
        setShowRejectForm(false);
        setRemarks('');
        onMutationSuccess();
        fetchWireTransfers(false, true);
      } else {
        throw new Error("API base returned null response.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Server rejected rejection sequence.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredWires = wireTransfers.filter(wire => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      wire.id.toLowerCase().includes(term) ||
      wire.userId.toLowerCase().includes(term) ||
      wire.beneficiaryName.toLowerCase().includes(term) ||
      wire.beneficiaryBank.toLowerCase().includes(term) ||
      (wire.reference && wire.reference.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'ALL' || wire.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Segment */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold-400/10 rounded-lg border border-gold-500/30 text-gold-500">
              <Send className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#d4af37] tracking-wider uppercase font-sans">
                Wire Transfer Cleared Ledger
              </h3>
              <p className="text-zinc-500 text-[11px] font-sans">
                Process or reject interbank SWIFT, IBAN, and cross-border electronic cable transfers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchWireTransfers(true, true)}
              disabled={isLoading}
              className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-[#d4af37] transition-all cursor-pointer disabled:opacity-50"
              title="Refresh ledger feed"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            {wireTransfers.length === 0 && !isLoading && (
              <button
                type="button"
                onClick={loadDemoWires}
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
              placeholder="Search by Beneficiary Name, Bank, SWIFT or client identifier..."
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
              <option value="APPROVED">APPROVED (Dispatched)</option>
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
            <span className="font-extrabold block text-emerald-450 uppercase text-[10px] tracking-wider mb-0.5">Dispatched Wire Capture</span>
            {successMessage}
          </div>
        </div>
      )}

      {/* Main split viewport layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table View block */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
              <RotateCw className="h-6 w-6 animate-spin text-[#d4af37]" />
              <p className="text-xs text-zinc-405 font-mono">Executing GraphQL clearing query... {loadingSeconds}s</p>
            </div>
          ) : filteredWires.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="h-8 w-8 text-zinc-650 mx-auto mb-2" />
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Empty Wire Registry</p>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
                No active receipts are matching your status queries. Use standard sandbox data options to test UI.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-900/20 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                    <th className="py-3.5 px-4 font-sans">Beneficiary Bank / Route</th>
                    <th className="py-3.5 px-4 font-sans text-right">Debit Outflow</th>
                    <th className="py-3.5 px-4 font-sans text-center">SWIFT / Account</th>
                    <th className="py-3.5 px-4 font-sans text-center">Ledger State</th>
                    <th className="py-3.5 px-4 text-center">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-xs">
                  {filteredWires.map((wire) => {
                    const isSelected = selectedWire?.id === wire.id;
                    return (
                      <tr 
                        key={wire.id}
                        className={`transition-colors hover:bg-zinc-900/30 ${
                          isSelected ? 'bg-[#d4af37]/5' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-white text-xs tracking-tight">
                              {wire.beneficiaryName}
                            </span>
                            <span className="text-[10px] text-zinc-550 font-sans mt-0.5">
                              {wire.beneficiaryBank}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-mono font-black text-xs text-[#d4af37]">
                              -${wire.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                            {wire.fee && wire.fee > 0 ? (
                              <span className="text-[9.5px] text-zinc-500 font-mono">
                                Fee: ${wire.fee}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-[11px] text-zinc-300 font-mono">
                              {wire.accountNumber.slice(-4).padStart(wire.accountNumber.length, '•')}
                            </span>
                            <span className="text-[9.5px] text-zinc-550 font-mono uppercase">
                              SWIFT: {wire.swiftCode}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-sm ${
                            wire.status === 'APPROVED' ? 'text-emerald-400 bg-emerald-500/5 border border-emerald-500/10' :
                            wire.status === 'PENDING' ? 'text-amber-500 bg-amber-500/5 border border-amber-500/10' :
                            'text-red-500 bg-red-500/5 border border-red-500/10'
                          }`}>
                            ● {wire.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedWire(wire);
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

        {/* Detailed Side Drawer */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedWire ? (
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
                      setSelectedWire(null);
                      setShowRejectForm(false);
                    }}
                    className="text-[10px] text-zinc-500 hover:text-white bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-2.5 font-mono text-[11px] divide-y divide-zinc-900">
                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-505">Transaction UUID:</span>
                    <span className="text-white font-bold select-all truncate max-w-[140px]">{selectedWire.id}</span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-550">Target User ID:</span>
                    <span className="text-white font-extrabold select-all truncate max-w-[140px]">{selectedWire.userId}</span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-505">Outflow Amount:</span>
                    <span className="text-red-400 font-extrabold text-xs">
                      -${selectedWire.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-550">Levied Transaction Fee:</span>
                    <span className="text-zinc-400">${selectedWire.fee ?? 0.00}</span>
                  </div>

                  <div className="pt-2 flex flex-col gap-1 text-left">
                    <span className="text-zinc-505 uppercase text-[9px] tracking-wider font-bold text-zinc-500">Beneficiary Route Detail:</span>
                    <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-900 space-y-1.5 mt-1">
                      <div className="flex items-center gap-1.5">
                        <UserIcon className="h-3 w-3 text-[#d4af37] shrink-0" />
                        <div><span className="text-zinc-500">Payee:</span> <span className="text-zinc-200 font-sans font-bold">{selectedWire.beneficiaryName}</span></div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3 w-3 text-zinc-500 shrink-0" />
                        <div><span className="text-zinc-500">Bank:</span> <span className="text-zinc-300 font-sans">{selectedWire.beneficiaryBank}</span></div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="h-3 w-3 text-zinc-500 shrink-0" />
                        <div><span className="text-zinc-500">Acct No:</span> <span className="text-zinc-300 font-mono-none font-bold select-all">{selectedWire.accountNumber}</span></div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3 w-3 text-zinc-500 shrink-0" />
                        <div><span className="text-zinc-500">SWIFT BIC:</span> <span className="text-[#d4af37] font-mono font-bold select-all">{selectedWire.swiftCode}</span></div>
                      </div>
                    </div>
                  </div>

                  {selectedWire.reason && (
                    <div className="pt-2 flex flex-col gap-1 text-left">
                      <span className="text-zinc-505 uppercase text-[9px] tracking-wider font-bold text-zinc-500">Corporate Wire Reason:</span>
                      <span className="text-zinc-300 font-sans mt-0.5 leading-normal bg-zinc-900/40 p-2 rounded border border-zinc-900">
                        {selectedWire.reason}
                      </span>
                    </div>
                  )}

                  {selectedWire.reference && (
                    <div className="pt-2 flex justify-between gap-2">
                      <span className="text-zinc-505">Unique Reference:</span>
                      <span className="text-[#d4af37] font-bold select-all">{selectedWire.reference}</span>
                    </div>
                  )}

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-550">Logged Date:</span>
                    <span className="text-zinc-400">{new Date(selectedWire.createdAt).toLocaleString()}</span>
                  </div>

                  {selectedWire.status === 'PENDING' && !showRejectForm && (
                    <div className="pt-4 flex gap-2 font-sans">
                      <button
                        type="button"
                        onClick={() => handleApprove(selectedWire.id)}
                        disabled={actionLoading}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-black text-[10px] font-extrabold uppercase tracking-widest py-2 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        Approve Wire
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRejectForm(true)}
                        disabled={actionLoading}
                        className="flex-1 bg-zinc-900 hover:bg-red-950/20 hover:text-red-400 text-zinc-400 border border-zinc-805 text-[10px] font-extrabold uppercase tracking-widest py-2 rounded-lg cursor-pointer transition-all"
                      >
                        Reject Wire
                      </button>
                    </div>
                  )}
                </div>

                {/* Reject form inline component */}
                {showRejectForm && selectedWire.status === 'PENDING' && (
                  <form onSubmit={handleReject} className="pt-3 border-t border-zinc-900 space-y-3 font-sans">
                    <div className="bg-red-500/5 p-2.5 rounded border border-red-950 text-red-400 text-[10px] leading-relaxed">
                      Decline payout request {selectedWire.id}. State remarks to persist inside the central ledger logs.
                    </div>
                    <div>
                      <label className="block text-zinc-550 text-[10px] uppercase font-bold tracking-wider mb-1">
                        Rejection reason remarks
                      </label>
                      <textarea
                        required
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="E.g. Interbank routing SWIFT BIC is invalid or account constraints present."
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
                        Decline Wire
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
                {selectedWire.status !== 'PENDING' && (
                  <div className="p-3 bg-zinc-900/60 border border-zinc-900 rounded-lg flex items-center gap-1.5 font-mono text-[10px]">
                    <Clock className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-zinc-500 uppercase">
                      Wire processed. Status locked.
                    </span>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="p-6 bg-zinc-950/50 border border-zinc-900 rounded-xl text-center space-y-2">
                <Sparkles className="h-6 w-6 text-zinc-650 mx-auto" />
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Underwriting Desk</p>
                <p className="text-zinc-600 text-[10.5px] leading-normal font-sans">
                  Select an active payee from the cross-border listing column. Full IBAN parameters, corresponding fees and underwriting controls will update instantaneously.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

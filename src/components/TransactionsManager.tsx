/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Search, 
  RotateCw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Calendar, 
  DollarSign, 
  Tag, 
  Hash, 
  User as UserIcon,
  HelpCircle,
  FileText
} from 'lucide-react';
import { runGraphQL, TRANSACTIONS_QUERY } from '../lib/graphql';
import { Transaction } from '../types';

interface TransactionsManagerProps {
  refreshTrigger: number;
}

export default function TransactionsManager({ refreshTrigger }: TransactionsManagerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
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

  const fetchTransactions = async (showLoader = true, bypassCache = false) => {
    if (showLoader) setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await runGraphQL<{ transactions: Transaction[] }>(TRANSACTIONS_QUERY, {}, bypassCache);
      if (data && data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      setErrorMessage(error.message || 'Failed to fetch transaction records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(true);
  }, [refreshTrigger]);

  // Demo fallback to test immediately in the sandbox environment
  const loadDemoTransactions = () => {
    const demoData: Transaction[] = [
      {
        id: "tx_1a2b3c",
        userId: "usr_trust7721",
        transactionId: "TRX-NOV-9102",
        transactionType: "DEPOSIT",
        amount: 50000,
        fee: 0,
        currency: "USD",
        reference: "Wire Transfer Setup #1012",
        status: "SUCCESS",
        direction: "IN",
        description: "Primary deposit injection via wire transfer",
        recipientName: "Self Deposit",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "tx_4d5e6f",
        userId: "usr_nova9912",
        transactionId: "TRX-NOV-1149",
        transactionType: "WITHDRAWAL",
        amount: 8500,
        fee: 25,
        currency: "USD",
        reference: "ATM Outflow REF_920",
        status: "PENDING",
        direction: "OUT",
        description: "Pending ATM international debit request",
        recipientName: "ATM Vault #12",
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: "tx_7g8h9i",
        userId: "usr_star8811",
        transactionId: "TRX-NOV-4921",
        transactionType: "TRANSFER",
        amount: 1450,
        fee: 5,
        currency: "USD",
        reference: "Interbank Pay #3121",
        status: "FAILED",
        direction: "OUT",
        description: "Peer to peer transfer allocation reject",
        recipientName: "Sarah Connor",
        recipientBank: "Cyberdyne Federal Credit",
        recipientAccountNumber: "******920A",
        remarks: "Insufficient primary balance reserves",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    setTransactions(demoData);
  };

  // Search and Filter formulation
  const filteredTxs = transactions.filter(tx => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      tx.id.toLowerCase().includes(term) ||
      tx.userId.toLowerCase().includes(term) ||
      (tx.transactionId && tx.transactionId.toLowerCase().includes(term)) ||
      (tx.reference && tx.reference.toLowerCase().includes(term)) ||
      (tx.recipientName && tx.recipientName.toLowerCase().includes(term)) ||
      (tx.description && tx.description.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || tx.transactionType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Hub */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold-500/10 rounded-lg border border-gold-500/30 text-gold-500">
              <History className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#d4af37] tracking-wider uppercase font-sans">
                Transaction Registry
              </h3>
              <p className="text-zinc-500 text-[11px] font-sans">
                Trace real-time electronic wire, checkout, and underwriting logs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchTransactions(true, true)}
              disabled={isLoading}
              className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-[#d4af37] transition-all cursor-pointer disabled:opacity-50"
              title="Refresh ledger feed"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            {transactions.length === 0 && !isLoading && (
              <button
                type="button"
                onClick={loadDemoTransactions}
                className="py-1 px-2.5 bg-zinc-900 border border-[#d4af37]/30 hover:border-[#d4af37]/60 text-[#d4af37] text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-all font-sans"
              >
                Load Sandbox Data
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <Search className="h-3.5 w-3.5" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by TxID, User, reference, description..."
              className="w-full pl-8.5 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 focus:border-[#d4af37] rounded-lg outline-none text-xs text-white transition-all placeholder-zinc-500"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-[#d4af37] rounded-lg outline-none text-xs text-white cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
              <option value="LOAN">Loan</option>
              <option value="TRANSFER">Transfer</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-[#d4af37] rounded-lg outline-none text-xs text-white cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success / Captured</option>
              <option value="PENDING">Pending Approval</option>
              <option value="FAILED">Failed / Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Workspace Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table View column */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
              <RotateCw className="h-6 w-6 animate-spin text-[#d4af37]" />
              <div className="space-y-1">
                <p className="text-xs text-zinc-405 font-mono">Running GraphQL transaction query... {loadingSeconds}s</p>
                {loadingSeconds >= 3 && (
                  <p className="text-[10px] text-zinc-500 max-w-sm">
                    Waking up Render hosted sandbox backend... This might take up to 45 seconds for a clean boot. Thank you!
                  </p>
                )}
              </div>
            </div>
          ) : filteredTxs.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-zinc-900 m-5 rounded-lg">
              <HelpCircle className="h-8 w-8 text-zinc-650 mx-auto mb-2" />
              <p className="text-xs text-zinc-400 font-bold">No Transactions Found</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Refine your selection query or load mock accounts to inspect structural details.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-900/20 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                    <th className="py-3 px-4 font-sans">Registry Reference</th>
                    <th className="py-3 px-4 font-sans text-right">Amount</th>
                    <th className="py-3 px-4 font-sans text-center">Type</th>
                    <th className="py-3 px-4 font-sans text-center">Status</th>
                    <th className="py-4 px-4 text-center">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-xs">
                  {filteredTxs.map((tx) => {
                    const isSelected = selectedTx?.id === tx.id;
                    const isDirectionIn = tx.direction === 'IN' || tx.transactionType === 'DEPOSIT';
                    return (
                      <tr 
                        key={tx.id} 
                        className={`transition-colors hover:bg-zinc-900/30 ${
                          isSelected ? 'bg-gold-500/5' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-white text-xs tracking-tight">
                              {tx.transactionId || tx.id.slice(0, 12)}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                              User ID: {tx.userId.slice(0, 10)}...
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className={`font-mono font-bold text-xs ${
                              isDirectionIn ? "text-emerald-400" : "text-zinc-300"
                            }`}>
                              {isDirectionIn ? "+" : "-"}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                            {tx.fee && tx.fee > 0 && (
                              <span className="text-[9px] text-zinc-500 font-mono">
                                Fee: ${tx.fee}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${
                            tx.transactionType === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            tx.transactionType === 'WITHDRAWAL' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                            tx.transactionType === 'LOAN' ? 'font-serif bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {tx.transactionType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                            tx.status === 'SUCCESS' ? 'text-emerald-400' :
                            tx.status === 'PENDING' ? 'text-amber-500' :
                            'text-red-500'
                          }`}>
                            ● {tx.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedTx(tx)}
                            className="bg-zinc-900 hover:bg-[#d4af37]/20 hover:text-white border border-zinc-800 p-1 rounded transition-all cursor-pointer text-zinc-400"
                          >
                            <Eye className="h-3.5 w-3.5" />
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

        {/* Details Side Drawer */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedTx ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4 text-xs font-sans shadow-md"
              >
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#d4af37]" />
                    <span className="font-extrabold uppercase text-white tracking-wider text-xs">
                      Ledger Details
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTx(null)}
                    className="text-[10px] text-zinc-500 hover:text-white bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-3 font-mono text-[11px] divide-y divide-zinc-900">
                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-505">Transaction UUID:</span>
                    <span className="text-white font-bold select-all">{selectedTx.id}</span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-550">Channel ID:</span>
                    <span className="text-gold-400 font-bold">{selectedTx.transactionId || "N/A"}</span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-505">Client ID:</span>
                    <span className="text-white font-bold select-all truncate max-w-[140px]">{selectedTx.userId}</span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-550">Type Category:</span>
                    <span className="text-white font-black">{selectedTx.transactionType}</span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-505">Booked Amount:</span>
                    <span className="text-[#d4af37] font-bold">
                      ${selectedTx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {selectedTx.currency || 'USD'}
                    </span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-550">Booked Fee:</span>
                    <span className="text-zinc-400">${selectedTx.fee ?? 0.00}</span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <span className="text-zinc-505">Ledger Flow:</span>
                    <span className={`font-bold ${selectedTx.direction === 'IN' ? 'text-emerald-400' : 'text-zinc-405'}`}>
                      {selectedTx.direction === 'IN' ? 'CREDIT / INFLOW' : 'DEBIT / OUTFLOW'}
                    </span>
                  </div>

                  <div className="pt-2 flex flex-col gap-1 text-left">
                    <span className="text-zinc-505">Details/Description:</span>
                    <span className="text-zinc-300 font-sans leading-relaxed leading-normal bg-zinc-900/40 p-2 rounded border border-zinc-900 mt-1">
                      {selectedTx.description || "No manual summary comments recorded for this asset transaction."}
                    </span>
                  </div>

                  {selectedTx.reference && (
                    <div className="pt-2 flex justify-between gap-2">
                      <span className="text-zinc-505">Reference:</span>
                      <span className="text-zinc-300 truncate max-w-[140px]">{selectedTx.reference}</span>
                    </div>
                  )}

                  {selectedTx.recipientName && (
                    <div className="pt-2 flex flex-col gap-1 text-left">
                      <span className="text-zinc-505">Recipient Route Details:</span>
                      <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-900 space-y-1 mt-1 text-[10px]">
                        <div><span className="text-zinc-500">Name:</span> <span className="text-zinc-200 font-sans font-bold">{selectedTx.recipientName}</span></div>
                        {selectedTx.recipientBank && <div><span className="text-zinc-500">Bank:</span> <span className="text-zinc-300">{selectedTx.recipientBank}</span></div>}
                        {selectedTx.recipientAccountNumber && <div><span className="text-zinc-500">Account:</span> <span className="text-zinc-300 font-mono">{selectedTx.recipientAccountNumber}</span></div>}
                      </div>
                    </div>
                  )}

                  {selectedTx.paymentLinkUsed && (
                    <div className="pt-2 flex justify-between gap-2">
                      <span className="text-zinc-505">Execution Link:</span>
                      <span className="text-blue-400 hover:underline cursor-pointer flex items-center gap-1">
                        Open Node <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </div>
                  )}

                  {selectedTx.remarks && (
                    <div className="pt-2 flex flex-col gap-1 text-left">
                      <span className="text-red-400">Processing Exceptions:</span>
                      <span className="text-red-400 font-sans leading-normal bg-red-950/10 p-2 rounded border border-red-900/30 mt-1">
                        {selectedTx.remarks}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col justify-between gap-1 text-left">
                    <span className="text-zinc-550">Date Logged:</span>
                    <span className="text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                      {new Date(selectedTx.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="p-6 bg-zinc-950/50 border border-zinc-900 rounded-xl text-center space-y-2">
                <Hash className="h-6 w-6 text-zinc-650 mx-auto" />
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">No Row Selected</p>
                <p className="text-zinc-600 text-[10.5px] leading-normal font-sans">
                  Select any specific reference on the left registry tracker column to map comprehensive field assets instantly.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

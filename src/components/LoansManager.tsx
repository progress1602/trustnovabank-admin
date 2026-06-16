/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  Search, 
  RotateCw, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User as UserIcon, 
  SlidersHorizontal,
  ChevronRight,
  Database
} from 'lucide-react';
import { runGraphQL, LOANS_QUERY } from '../lib/graphql';
import { Loan } from '../types';

interface LoansManagerProps {
  onSelectLoan: (loan: Loan) => void;
  selectedLoanId: string | null;
  refreshTrigger: number;
}

export default function LoansManager({ onSelectLoan, selectedLoanId, refreshTrigger }: LoansManagerProps) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
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

  const fetchLoans = async (showLoader = true, bypassCache = false) => {
    if (showLoader) setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await runGraphQL<{ loans: Loan[] }>(LOANS_QUERY, {}, bypassCache);
      if (data && data.loans) {
        setLoans(data.loans);
      }
    } catch (error: any) {
      console.error('Error fetching loans:', error);
      setErrorMessage(error.message || 'Failed to fetch underwriting logs from manual-bank graphql server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans(true);
  }, [refreshTrigger]);

  // Search and filter logic
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.userId.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && loan.status === statusFilter;
  });

  // Safe dummy loader for sandbox evaluation if backend is completely empty
  const loadDemoSandboxLoans = () => {
    const demoData: Loan[] = [
      {
        id: "loan_98231",
        userId: "usr_trust7721",
        loanAmount: 45000,
        interestRate: 4.5,
        durationMonths: 24,
        repaymentStatus: "PENDING",
        status: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "loan_44120",
        userId: "usr_nova9912",
        loanAmount: 120000,
        interestRate: 5.2,
        durationMonths: 48,
        repaymentStatus: "UNPAID",
        status: "PENDING",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: "loan_21155",
        userId: "usr_star8811",
        loanAmount: 15000,
        interestRate: 3.8,
        durationMonths: 12,
        repaymentStatus: "PAID",
        status: "APPROVED",
        createdAt: new Date(Date.now() - 250000000).toISOString(),
        updatedAt: new Date(Date.now() - 200000000).toISOString()
      }
    ];
    setLoans(demoData);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 relative shadow-md h-full flex flex-col">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold-500/10 rounded-lg border border-gold-500/30 text-gold-500">
            <Briefcase className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#d4af37] tracking-wider uppercase font-sans">Loans</h3>
            <p className="text-zinc-500 text-[11px] font-sans">List and browse customer loan applications</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => fetchLoans(true, true)}
            disabled={isLoading}
            className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-[#d4af37] hover:border-gold-500/50 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Loans list"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="md:col-span-2 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Search className="h-3.5 w-3.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Loan ID or customer ID..."
            className="w-full pl-8.5 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 focus:border-[#d4af37] rounded-lg outline-none text-xs text-white transition-all placeholder-zinc-500"
          />
        </div>

        <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          {(['ALL', 'PENDING', 'APPROVED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`flex-1 py-1 px-2 text-[10px] font-bold tracking-wider rounded-md transition-all cursor-pointer ${
                statusFilter === filter
                  ? 'bg-[#d4af37] text-black shadow-xs font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Query Status Errors */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-zinc-900 border border-[#d4af37]/35 flex items-start gap-2">
          <AlertCircle className="h-4.5 w-4.5 text-[#d4af37] shrink-0 mt-0.5" />
          <p className="text-[11px] text-zinc-350 font-mono leading-normal">
            Notice: {errorMessage}
          </p>
        </div>
      )}

      {/* Main List Table */}
      <div className="flex-1 overflow-x-auto min-h-[300px]">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center py-16 gap-3">
            <svg className="animate-spin h-5 w-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs font-mono text-zinc-400">Querying live GraphQL items... {loadingSeconds}s</span>
            {loadingSeconds >= 3 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-2 text-zinc-500 text-[10.5px] max-w-xs text-center border border-zinc-900 bg-zinc-950 p-3 rounded-lg leading-normal"
              >
                <div className="text-[#d4af37] font-bold mb-1 uppercase tracking-wider text-[9px] flex items-center justify-center gap-1.5 font-sans">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-ping" />
                  Render.com Standby Activation
                </div>
                The cloud container service is waking up from standby. On free layers, this cold-start can take up to 45 seconds. Thank you for your patience!
              </motion.div>
            )}
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-12 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
            <Database className="h-8 w-8 text-zinc-700 mb-3" />
            <span className="text-xs font-bold text-zinc-400">No client records found</span>
            <p className="text-zinc-500 text-[11px] max-w-xs mt-1 px-4 font-sans">
              {loans.length === 0 
                ? "The live server database currently lists an empty registry. Add sandbox demo items to get started."
                : "No matching records found in this filters search index."}
            </p>
            {loans.length === 0 && (
              <button
                onClick={loadDemoSandboxLoans}
                className="mt-4 px-3 py-1.5 bg-[#d4af37] hover:bg-gold-600 text-black font-sans font-extrabold text-xs rounded-lg border border-gold-650 transition-all cursor-pointer shadow-md"
              >
                Inject Sandbox Demo Files
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                <th className="py-2.5 px-3">Loan Target</th>
                <th className="py-2.5 px-3">Customer ID</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Interest</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredLoans.map((loan) => {
                const isSelected = selectedLoanId === loan.id;
                return (
                  <tr
                    key={loan.id}
                    onClick={() => onSelectLoan(loan)}
                    className={`group transition-all hover:bg-zinc-900/60 cursor-pointer ${
                      isSelected ? 'bg-gold-500/10 border-l-2 border-[#d4af37]' : ''
                    }`}
                  >
                    <td className="py-2 px-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white font-mono group-hover:text-[#d4af37] transition-colors">
                          {loan.id}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-sans">
                          {loan.durationMonths} Months Duration
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <UserIcon className="h-3.5 w-3.5 text-zinc-500" />
                        <span className="text-xs font-mono text-zinc-450 group-hover:text-white">
                          {loan.userId}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-zinc-200 font-mono text-xs">
                      ${loan.loanAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-center text-xs font-mono text-zinc-400">
                      {loan.interestRate}%
                    </td>
                    <td className="py-2 px-3 text-center font-sans">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
                        loan.status === 'APPROVED' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : loan.status === 'REJECTED'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-gold-500/10 text-[#d4af37] border border-[#d4af37]/20 animate-pulse'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLoan(loan);
                        }}
                        className={`inline-flex items-center justify-center p-1.5 rounded-md border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-sm'
                            : 'bg-zinc-900 text-zinc-450 border-zinc-800 hover:text-white hover:border-gold-500/50 shadow-xs'
                        }`}
                      >
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Selected Action Indicator bar */}
      <div className="mt-4 pt-4 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] font-mono">
        <span className="text-zinc-500 font-sans">
          Tip: Click any row to automatically load details and switch modules
        </span>
        {selectedLoanId && (
          <div className="flex items-center gap-1.5 bg-[#d4af37]/5 text-[#d4af37] px-2.5 py-1 rounded-md border border-[#d4af37]/20">
            <span className="h-2 w-2 rounded-full bg-gold-500 animate-ping inline-block" />
            <span>Active Record: <strong>{selectedLoanId}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}

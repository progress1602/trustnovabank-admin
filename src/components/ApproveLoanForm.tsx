/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckSquare, Sparkles, AlertCircle, Hash, FileCheck, XCircle, Info } from 'lucide-react';
import { runGraphQL, APPROVE_LOAN_MUTATION, REJECT_LOAN_MUTATION } from '../lib/graphql';
import { Loan } from '../types';

interface ApproveLoanFormProps {
  prefilledLoanId: string;
  onApproveSuccess: () => void;
}

export default function ApproveLoanForm({ prefilledLoanId, onApproveSuccess }: ApproveLoanFormProps) {
  const [loanId, setLoanId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState<Loan | null>(null);

  // Sync state with prefilled parent prop
  useEffect(() => {
    if (prefilledLoanId) {
      setLoanId(prefilledLoanId);
      setErrorMessage('');
      setSuccessInfo(null);
      setRemarks('');
    }
  }, [prefilledLoanId]);

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanId.trim()) {
      setErrorMessage('A valid Loan ID is strictly required for approval.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessInfo(null);

    try {
      const data = await runGraphQL<{ approveLoan: Loan }>(APPROVE_LOAN_MUTATION, {
        loanId: loanId.trim()
      });

      if (data && data.approveLoan) {
        setSuccessInfo(data.approveLoan);
        onApproveSuccess();
      } else {
        throw new Error("Mutation ran but returned empty status representation.");
      }
    } catch (error: any) {
      console.error('Approve Loan error:', error);
      setErrorMessage(error.message || 'Server rejected approval. Verify if the loan is already processed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanId.trim()) {
      setErrorMessage('A valid Loan ID is strictly required for rejection.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessInfo(null);

    try {
      const data = await runGraphQL<{ rejectLoan: Loan }>(REJECT_LOAN_MUTATION, {
        loanId: loanId.trim(),
        remarks: remarks.trim() || "Underwriting Manual Rejection"
      });

      if (data && data.rejectLoan) {
        setSuccessInfo(data.rejectLoan);
        onApproveSuccess();
        setRemarks('');
      } else {
        throw new Error("Mutation ran but returned empty status representation.");
      }
    } catch (error: any) {
      console.error('Reject Loan error:', error);
      setErrorMessage(error.message || 'Server rejected rejection request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 relative overflow-hidden shadow-md flex flex-col justify-between h-full font-sans">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gold-500/10 rounded-lg border border-gold-500/30 text-gold-500">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#d4af37] tracking-wider uppercase font-sans">Decision Console</h3>
            <p className="text-zinc-500 text-[11px] font-sans">Verify application metrics and issue manual status updates</p>
          </div>
        </div>

        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 rounded-lg bg-zinc-900 border border-red-500/35 flex items-start gap-2.5"
          >
            <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs text-red-400 leading-normal font-sans">
              <span className="font-bold block text-red-500 mb-0.5">Operation Failure</span>
              {errorMessage}
            </div>
          </motion.div>
        )}

        {!loanId && (
          <div className="py-8 px-4 border border-dashed border-zinc-900 rounded-lg bg-zinc-900/10 text-center">
            <Info className="h-6 w-6 text-zinc-650 mx-auto mb-2" />
            <p className="text-xs text-zinc-500 leading-normal">
              No loan selected. Click on any application in the Loans List to load live controls here.
            </p>
          </div>
        )}

        {/* Action Controls Form */}
        {loanId && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Loaded Loan Identifier</span>
              <div className="mt-1 p-2 bg-zinc-900 border border-zinc-800 rounded-md flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-gold-500">{loanId}</span>
                <span className="text-[9px] text-[#22c55e] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold">
                  Ready
                </span>
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-[11px] font-bold uppercase tracking-wider mb-1">
                Remarks (Required for Rejection)
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Specify rejection reason or audit comments..."
                rows={3}
                className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 focus:border-[#d4af37] rounded-lg outline-none text-xs text-white transition-all placeholder-zinc-500 resize-none font-sans"
                disabled={isLoading}
              />
            </div>

            {/* Verification buttons */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <button
                type="button"
                onClick={handleReject}
                disabled={isLoading || !loanId.trim()}
                className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-red-950/20 border border-zinc-800 hover:border-red-900/50 text-red-400 font-bold rounded-lg text-xs font-sans uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-red-400 border-t-transparent rounded-full" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span>Reject</span>
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={isLoading || !loanId.trim()}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 hover:scale-[1.01] active:scale-[0.98] text-black font-extrabold rounded-lg text-xs font-sans uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(212,175,55,0.15)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full" />
                ) : (
                  <FileCheck className="h-4 w-4 text-black" />
                )}
                <span>Approve</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Success details layout if approved or rejected */}
      <AnimatePresence>
        {successInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3.5 rounded-lg bg-zinc-950 border border-emerald-500/30 text-[#f4f4f5] font-sans text-xs space-y-2.5"
          >
            <div className={`flex items-center gap-2 font-extrabold ${successInfo.status === 'APPROVED' ? 'text-emerald-400' : 'text-red-400'}`}>
              <Sparkles className="h-3.5 w-3.5" />
              <span>LOAN DECISION: {successInfo.status}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2 border-t border-zinc-900 text-zinc-350">
              <div>
                <span className="text-zinc-500 block text-[9px] font-bold uppercase">Loan ID</span>
                <span className="text-gold-500 font-bold font-mono text-[10px]">{successInfo.id}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] font-bold uppercase">Borrower</span>
                <span className="font-semibold text-zinc-300 font-mono text-[10px]">{successInfo.userId}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] font-bold uppercase">Principal</span>
                <span className="text-white font-bold font-mono">${successInfo.loanAmount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] font-bold uppercase">Rate</span>
                <span className="text-zinc-300 font-mono">{successInfo.interestRate}% Interest</span>
              </div>
              <div className="col-span-2">
                <span className="text-zinc-500 block text-[9px] font-bold uppercase">Status State</span>
                <span className={`font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded text-[10px] inline-block mt-0.5 ${
                  successInfo.status === 'APPROVED' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {successInfo.status}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

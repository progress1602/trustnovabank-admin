/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DollarSign, User, HelpCircle, ArrowUpRight, ArrowDownLeft, Sparkles, AlertCircle, RefreshCw, Layers, Search, ChevronDown, Check } from 'lucide-react';
import { runGraphQL, CREDIT_USER_BALANCE_MUTATION, DEBIT_USER_BALANCE_MUTATION, USERS_QUERY } from '../lib/graphql';
import { User as UserType } from '../types';

interface CustomerShort {
  id: string;
  firstName: string;
  lastName: string;
}

interface CreditUserBalanceFormProps {
  prefilledUserId: string;
  onCreditSuccess: () => void;
}

export default function CreditUserBalanceForm({ prefilledUserId, onCreditSuccess }: CreditUserBalanceFormProps) {
  const [actionType, setActionType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [balanceType, setBalanceType] = useState('PRIMARY_BALANCE'); // Default to Primary ledger
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successResult, setSuccessResult] = useState<UserType | null>(null);

  // Users list state
  const [users, setUsers] = useState<CustomerShort[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [usersLoadingSeconds, setUsersLoadingSeconds] = useState(0);
  const [usersError, setUsersError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const fetchUsers = async (bypassCache = false) => {
    setIsUsersLoading(true);
    setUsersError('');
    try {
      const data = await runGraphQL<{ users: CustomerShort[] }>(USERS_QUERY, {}, bypassCache);
      if (data && data.users) {
        setUsers(data.users);
      }
    } catch (err: any) {
      console.error('Failed to load users list:', err);
      setUsersError(err.message || 'Failed to fetch user list from server.');
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isUsersLoading) {
      setUsersLoadingSeconds(0);
      interval = setInterval(() => {
        setUsersLoadingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setUsersLoadingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isUsersLoading]);

  // Sync state with prefilled parent prop
  useEffect(() => {
    if (prefilledUserId) {
      setUserId(prefilledUserId);
      setErrorMessage('');
      setSuccessResult(null);
      
      const matchedUser = users.find(u => u.id === prefilledUserId);
      if (matchedUser) {
        setSearchQuery(`${matchedUser.firstName} ${matchedUser.lastName}`);
      } else {
        setSearchQuery(prefilledUserId);
      }
    }
  }, [prefilledUserId, users]);

  const handleSelectUser = (user: CustomerShort) => {
    setUserId(user.id);
    setSearchQuery(`${user.firstName} ${user.lastName}`);
    setIsOpen(false);
    setSuccessResult(null);
    setErrorMessage('');
  };

  const handleBalanceAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      setErrorMessage('User ID reference is strictly required.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Please specify a positive numeric transfer amount.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessResult(null);

    try {
      if (actionType === 'CREDIT') {
        const data = await runGraphQL<{ creditUserBalance: UserType }>(CREDIT_USER_BALANCE_MUTATION, {
          input: {
            userId: userId.trim(),
            amount: numericAmount,
            balanceType: balanceType // E.g. "PRIMARY_BALANCE", "SECONDARY_BALANCE", "TERTIARY_BALANCE"
          }
        });

        if (data && data.creditUserBalance) {
          setSuccessResult(data.creditUserBalance);
          onCreditSuccess();
          setAmount(''); // clear amount upon successful dispatch
        } else {
          throw new Error("Ledger credit executed but returned null representation.");
        }
      } else {
        const data = await runGraphQL<{ debitUserBalance: UserType }>(DEBIT_USER_BALANCE_MUTATION, {
          input: {
            userId: userId.trim(),
            amount: numericAmount,
            balanceType: balanceType // E.g. "PRIMARY_BALANCE", "SECONDARY_BALANCE", "TERTIARY_BALANCE"
          }
        });

        if (data && data.debitUserBalance) {
          setSuccessResult(data.debitUserBalance);
          onCreditSuccess();
          setAmount(''); // clear amount upon successful dispatch
        } else {
          throw new Error("Ledger debit executed but returned null representation.");
        }
      }
    } catch (error: any) {
      console.error('Balance Adjustment Error:', error);
      setErrorMessage(error.message || 'Server rejected balance change. Ensure the target User ID exists and parameters conform to schema.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedUserInfo = users.find(u => u.id === userId);

  const filteredUsers = users.filter(user => {
    const term = searchQuery.toLowerCase();
    return (
      user.id.toLowerCase().includes(term) ||
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 relative overflow-hidden shadow-md flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gold-500/10 rounded-lg border border-gold-500/30 text-gold-500">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#d4af37] tracking-wider uppercase font-sans">Fund Manager</h3>
            <p className="text-zinc-500 text-[11px] font-sans">Credit deposits or debit balances directly in client ledgers</p>
          </div>
        </div>

        {/* Action Selector Tab */}
        <div className="grid grid-cols-2 p-1 bg-zinc-900/80 rounded-lg border border-zinc-900 mb-4 text-[11px] font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => { setActionType('CREDIT'); setSuccessResult(null); setErrorMessage(''); }}
            className={`py-1.5 rounded-md text-center transition-all cursor-pointer ${
              actionType === 'CREDIT' 
                ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-black font-extrabold shadow-sm'
                : 'text-zinc-450 hover:text-white'
            }`}
          >
            Deposit (Increment)
          </button>
          <button
            type="button"
            onClick={() => { setActionType('DEBIT'); setSuccessResult(null); setErrorMessage(''); }}
            className={`py-1.5 rounded-md text-center transition-all cursor-pointer ${
              actionType === 'DEBIT' 
                ? 'bg-red-500 text-white font-extrabold shadow-md'
                : 'text-zinc-450 hover:text-white'
            }`}
          >
            Withdraw (Decrement)
          </button>
        </div>

        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 rounded-lg bg-zinc-900 border border-red-500/35 flex items-start gap-2.5"
          >
            <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs text-red-400 leading-normal font-sans">
              <span className="font-bold block text-red-500 mb-0.5">
                {actionType === 'CREDIT' ? 'Deposit Failed' : 'Withdrawal Failed'}
              </span>
              {errorMessage}
            </div>
          </motion.div>
        )}

        <form onSubmit={handleBalanceAdjustment} className="space-y-4 font-sans">
          {/* User ID Dropdown/Selector */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-zinc-400 text-[11px] font-bold uppercase tracking-wider">
                Select Customer Target
              </label>
              {selectedUserInfo ? (
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Target: {selectedUserInfo.firstName} {selectedUserInfo.lastName}
                </span>
              ) : prefilledUserId && prefilledUserId === userId ? (
                <span className="text-[10px] text-[#d4af37] font-extrabold uppercase bg-gold-500/10 px-2 py-0.5 rounded border border-[#d4af37]/30 font-mono">
                  linked: {userId.slice(0, 8)}
                </span>
              ) : userId ? (
                <span className="text-[10px] text-gold-500 font-bold uppercase bg-gold-500/10 px-2 py-0.5 rounded">
                  Manual ID Inputed
                </span>
              ) : null}
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <User className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setUserId(e.target.value);
                  setIsOpen(true);
                  setSuccessResult(null);
                }}
                placeholder="Search customers by name or enter User ID..."
                className="w-full pl-8.5 pr-8 py-2 bg-zinc-900/60 border border-zinc-800 focus:border-[#d4af37] rounded-lg outline-none text-xs text-white transition-all placeholder-zinc-500 font-sans"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-500 hover:text-zinc-350 cursor-pointer"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Dropdown Options */}
            <AnimatePresence>
              {isOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-zinc-950 border border-zinc-900 rounded-lg shadow-xl divide-y divide-zinc-900"
                  >
                    {isUsersLoading ? (
                      <div className="p-4 text-center text-xs text-zinc-400 flex flex-col items-center justify-center gap-2 font-mono">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#d4af37]" />
                          <span>Scanning Client Ledger... {usersLoadingSeconds}s</span>
                        </div>
                        {usersLoadingSeconds >= 3 && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-2 text-zinc-500 text-[10px] max-w-xs text-center border border-zinc-900 w-full bg-zinc-950 p-2.5 rounded leading-normal font-sans"
                          >
                            <div className="text-[#d4af37] font-bold mb-0.5 uppercase tracking-wider text-[8.5px] flex items-center justify-center gap-1">
                              <span className="h-1 w-1 rounded-full bg-gold-400 animate-ping" />
                              Render.com Standby Activation
                            </div>
                            The database server is coming out of standby. On free layers, this cold-start can take up to 45 seconds. Thank you for your patience!
                          </motion.div>
                        )}
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="p-3 text-center text-xs text-zinc-400 space-y-2">
                        <span>{usersError ? usersError : "No matching users. Use typed manual string."}</span>
                        {usersError && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchUsers(true);
                            }}
                            className="w-full mt-2.5 py-1 px-2.5 bg-zinc-900 hover:bg-[#d4af37]/10 hover:text-[#d4af37] text-white border border-zinc-800 hover:border-[#d4af37]/30 text-[10px] font-bold uppercase rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 font-sans"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Retry Ledger Scan
                          </button>
                        )}
                        {searchQuery && !usersError && (
                          <div className="text-[10px] text-zinc-500 font-mono mt-1">Manual ID: {searchQuery}</div>
                        )}
                      </div>
                    ) : (
                      filteredUsers.map((user) => {
                        const isSelected = user.id === userId;
                        return (
                          <div
                            key={user.id}
                            onClick={() => handleSelectUser(user)}
                            className={`p-2.5 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-[#d4af37]/10 text-[#d4af37] font-bold' 
                                : 'text-zinc-300 hover:bg-zinc-900'
                            }`}
                          >
                            <div className="flex flex-col text-left font-sans">
                              <span className="font-semibold text-white text-xs">
                                {user.firstName} {user.lastName}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                ID: {user.id}
                              </span>
                            </div>
                            {isSelected && <Check className="h-3.5 w-3.5 text-gold-500" />}
                          </div>
                        );
                      })
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Amount Field */}
            <div>
              <label className="block text-zinc-400 text-[11px] font-bold uppercase tracking-wider mb-1">
                {actionType === 'CREDIT' ? 'Deposit amount ($)' : 'Withdraw/Debit amount ($)'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <DollarSign className="h-3.5 w-3.5" />
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5000.00"
                  className="w-full pl-8.5 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 focus:border-[#d4af37] rounded-lg outline-none text-xs text-white transition-all placeholder-zinc-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Balance Type Selector */}
            <div>
              <label className="block text-zinc-400 text-[11px] font-bold uppercase tracking-wider mb-1">
                Balance Type
              </label>
              <select
                value={balanceType}
                onChange={(e) => setBalanceType(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-[#d4af37] rounded-lg outline-none text-xs text-white cursor-pointer transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%25239ca3af%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat"
                disabled={isLoading}
              >
                <option value="PRIMARY_BALANCE">PRIMARY Balance</option>
                <option value="SECONDARY_BALANCE">SECONDARY Balance</option>
                <option value="TERTIARY_BALANCE">TERTIARY Balance</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !userId.trim() || !amount}
            className={`w-full py-2.5 px-4 rounded-lg text-xs font-sans uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
              actionType === 'CREDIT' 
                ? 'bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 active:scale-[0.98] text-black font-extrabold shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                : 'bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-extrabold'
            }`}
          >
            {isLoading ? (
              <>
                <svg className={`animate-spin h-3.5 w-3.5 ${actionType === 'CREDIT' ? 'text-black' : 'text-white'}`} fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{actionType === 'CREDIT' ? 'Depositing...' : 'Debiting...'}</span>
              </>
            ) : (
              <>
                {actionType === 'CREDIT' ? (
                  <ArrowUpRight className="h-4 w-4 text-black" />
                ) : (
                  <ArrowDownLeft className="h-4 w-4 text-white" />
                )}
                <span>{actionType === 'CREDIT' ? 'Deposit Funds' : 'Debit/Withdraw Funds'}</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Success Receipt Details */}
      <AnimatePresence>
        {successResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="mt-4 p-3.5 rounded-lg bg-zinc-950 border border-emerald-500/30 text-white font-sans text-xs space-y-2.5"
          >
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold border-b border-zinc-900 pb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>TRANSMISSION RECEIPT DISPATCHED</span>
            </div>

            <div className="space-y-1 text-zinc-300 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">Holder:</span>
                <span className="font-bold text-white">{successResult.firstName} {successResult.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Account #:</span>
                <span className="font-bold text-white">{successResult.accountNumber || 'Pending'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Level Tier:</span>
                <span className="text-gold-550 font-extrabold uppercase">{successResult.accountTier || 'STANDARD'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-900 space-y-1.5">
              <span className="text-zinc-505 font-extrabold block text-[9px] uppercase">Updated Ledger:</span>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                  <span className="text-[8px] text-zinc-500 block uppercase">Primary</span>
                  <span className="text-[#d4af37] font-bold font-mono text-[10px]">${(successResult.primaryBalance ?? 0).toLocaleString()}</span>
                </div>
                <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                  <span className="text-[8px] text-zinc-500 block uppercase">Secondary</span>
                  <span className="text-zinc-300 font-bold font-mono text-[10px]">${(successResult.secondaryBalance ?? 0).toLocaleString()}</span>
                </div>
                <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                  <span className="text-[8px] text-zinc-500 block uppercase">Tertiary</span>
                  <span className="text-zinc-300 font-bold font-mono text-[10px]">${(successResult.tertiaryBalance ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


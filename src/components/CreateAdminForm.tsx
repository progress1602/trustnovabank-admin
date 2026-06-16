/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserPlus, Mail, User as UserIcon, Phone, Lock, Sparkles, AlertCircle, Building2, ChevronLeft } from 'lucide-react';
import { runGraphQL, CREATE_ADMIN_MUTATION } from '../lib/graphql';
import { CreateAdminResponse, User } from '../types';

interface CreateAdminFormProps {
  onSuccess?: (createdAdmin: User) => void;
  onBackToLogin?: () => void;
  isInDashboard?: boolean;
}

export default function CreateAdminForm({ onSuccess, onBackToLogin, isInDashboard = false }: CreateAdminFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !username.trim() || !phoneNumber.trim() || !password) {
      setErrorMessage('Every credential parameter is strictly required for root generation.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const data = await runGraphQL<{ createAdmin: User }>(CREATE_ADMIN_MUTATION, {
        input: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          username: username.trim(),
          phoneNumber: phoneNumber.trim(),
          password: password,
        }
      });

      const admin = data.createAdmin;
      setSuccessMessage(`Administrative node successfully spawned: ${admin.firstName} ${admin.lastName} (${admin.username})`);
      
      // Clear inputs
      setFirstName('');
      setLastName('');
      setEmail('');
      setUsername('');
      setPhoneNumber('');
      setPassword('');

      if (onSuccess) {
        setTimeout(() => {
          onSuccess(admin);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Create Admin Error:', error);
      setErrorMessage(error.message || 'The server rejected this administrative command structure.');
    } finally {
      setIsLoading(false);
    }
  };

  const formContent = (
    <div className="space-y-4">
      {errorMessage && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 rounded-lg bg-zinc-900 border border-red-500/35 flex items-start gap-2.5"
        >
          <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-xs text-red-400 leading-normal font-sans">
            <span className="font-bold block text-red-500 mb-0.5">Registration Failed</span>
            {errorMessage}
          </div>
        </motion.div>
      )}

      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 rounded-lg bg-zinc-900 border border-emerald-500/35 flex items-start gap-2.5"
        >
          <Sparkles className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs text-emerald-400 leading-normal font-sans">
            <span className="font-bold block text-emerald-500 mb-0.5">Admin Account Created</span>
            {successMessage}
          </div>
        </motion.div>
      )}

      <form onSubmit={handleCreate} className="space-y-3.5 font-sans">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-zinc-400 text-[11px] font-bold uppercase tracking-wider mb-1">First Name</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. John"
              className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 focus:border-[#d4af37] rounded-lg outline-none text-xs text-white transition-all placeholder-zinc-650"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-[11px] font-bold uppercase tracking-wider mb-1">Last Name</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Doe"
              className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 focus:border-[#d4af37] rounded-lg outline-none text-xs text-white transition-all placeholder-zinc-655"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-zinc-400 text-[11px] font-bold uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Mail className="h-3.5 w-3.5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full pl-8.5 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 focus:border-[#d4af37] rounded-lg outline-none text-xs text-white transition-all placeholder-zinc-500"
                disabled={isLoading}
              />
            </div>
          </div>
          <div>
            <label className="block text-zinc-400 text-[11px] font-bold uppercase tracking-wider mb-1">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <UserIcon className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="john_admin"
                className="w-full pl-8.5 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 focus:border-[#d4af37] rounded-lg outline-none text-xs text-white transition-all placeholder-zinc-500"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-zinc-400 text-[11px] font-bold uppercase tracking-wider mb-1">Phone Number</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <Phone className="h-3.5 w-3.5" />
            </span>
            <input
              type="text"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 019-2834"
              className="w-full pl-8.5 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 focus:border-[#d4af37] rounded-lg outline-none text-xs text-white transition-all placeholder-zinc-500"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-zinc-400 text-[11px] font-bold uppercase tracking-wider mb-1">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <Lock className="h-3.5 w-3.5" />
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-8.5 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 focus:border-[#d4af37] rounded-lg outline-none text-xs text-white transition-all placeholder-zinc-500"
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 mt-2 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 active:scale-[0.98] text-black font-extrabold rounded-lg text-xs font-sans uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(212,175,55,0.15)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Creating...</span>
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 text-black" />
              <span>Create Admin User</span>
            </>
          )}
        </button>
      </form>
    </div>
  );

  if (isInDashboard) {
    return (
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 relative overflow-hidden shadow-md">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-gold-500/10 rounded-lg border border-gold-500/30 text-gold-500">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#d4af37] tracking-wider uppercase font-sans">Create Admin</h3>
            <p className="text-zinc-500 text-[11px] font-sans">Register and authorize a new administrator profile</p>
          </div>
        </div>
        {formContent}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-xl p-6.5 shadow-xl relative overflow-hidden"
      >
        <button
          onClick={onBackToLogin}
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-[11px] font-bold uppercase transition-colors mb-5"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to Login
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 bg-gold-500/10 rounded-lg flex items-center justify-center border border-gold-500/30 shadow-xs mb-3">
            <Building2 className="h-6 w-6 text-gold-500" />
          </div>
          <h1 className="text-sm font-extrabold tracking-tight text-[#d4af37] uppercase font-sans mb-1">
            Create Admin
          </h1>
          <p className="text-zinc-500 text-[11px] text-center px-4">
            Create a new administrative account connected to the system.
          </p>
        </div>

        {formContent}
      </motion.div>
    </div>
  );
}

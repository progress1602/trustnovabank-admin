/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, User as UserIcon, Eye, EyeOff, AlertCircle, Sparkles, Building2 } from 'lucide-react';
import { runGraphQL, LOGIN_MUTATION, setStoredToken, setStoredAdminUser } from '../lib/graphql';
import { User, LoginResult } from '../types';

interface AdminLoginProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim() || !password) {
      setErrorMessage('Please provide both your email/username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const data = await runGraphQL<{ login: LoginResult }>(LOGIN_MUTATION, {
        input: {
          emailOrUsername: emailOrUsername.trim(),
          password: password,
        }
      });

      const { success, message, token, user } = data.login;

      if (!success) {
        throw new Error(message || 'Authentication failed. Please verify credentials.');
      }

      if (token && user) {
        setStoredToken(token);
        setStoredAdminUser(user);
        setSuccessMessage('Access authorized. Initializing Trustnova secure shell...');
        
        // Let user see success briefly for good visual pacing
        setTimeout(() => {
          onLoginSuccess(user, token);
        }, 1000);
      } else {
        throw new Error('Server returned successful status but did not emit token/user payload.');
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      setErrorMessage(error.message || 'Network error connecting to Trustnova authentication terminal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm bg-zinc-950 border border-zinc-900 rounded-xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 bg-gold-500/10 rounded-xl flex items-center justify-center text-gold-500 border border-[#d4af37]/35 shadow-xs mb-3">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-widest text-[#d4af37] mb-0.5 uppercase">
            TRUSTNOVA
          </h1>
          <p className="text-zinc-550 text-[10px] tracking-widest uppercase font-mono font-bold">
            Admin Portal
          </p>
        </div>

        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-3 rounded-lg bg-zinc-900/80 border border-red-500/35 flex items-start gap-2.5"
          >
            <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs text-red-405 leading-normal">
              <span className="font-bold block text-red-500 mb-0.5">Login Failed</span>
              {errorMessage}
            </div>
          </motion.div>
        )}

        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-3 rounded-lg bg-zinc-900/80 border border-emerald-500/35 flex items-start gap-2.5"
          >
            <Sparkles className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-400 leading-normal font-sans">
              <span className="font-bold block text-emerald-550 mb-0.5">Authorized</span>
              {successMessage}
            </div>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
              Email or Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <UserIcon className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="admin@example.com"
                className="w-full pl-9 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 focus:border-[#d4af37] text-white placeholder-zinc-500 rounded-lg outline-none text-xs transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2 bg-zinc-900/60 border border-zinc-800 focus:border-[#d4af37] text-white placeholder-zinc-500 rounded-lg outline-none text-xs transition-all"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-505 hover:text-zinc-300 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 mt-2 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 active:scale-[0.98] text-black font-extrabold rounded-lg text-xs font-sans tracking-wide uppercase transition-all shadow-[0_0_15px_rgba(212,175,55,0.15)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 text-black" />
                <span>Login Securely</span>
              </>
            )}
          </button>
        </form>


      </motion.div>
    </div>
  );
}

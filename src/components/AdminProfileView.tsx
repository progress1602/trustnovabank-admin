/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Shield, Compass, Calendar, CheckCircle, Smartphone, Mail, Phone, DollarSign } from 'lucide-react';
import { User as UserType } from '../types';

interface AdminProfileViewProps {
  user: UserType;
}

export default function AdminProfileView({ user }: AdminProfileViewProps) {
  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 relative overflow-hidden shadow-md">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-gold-500/10 rounded-lg border border-gold-500/30 text-gold-500">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-[#d4af37] uppercase font-sans tracking-wider">Admin Profile</h3>
          <p className="text-zinc-500 text-[11px] font-sans">Verify active administrator permissions and credentials</p>
        </div>
      </div>

      <div className="flex items-start gap-4 pb-5 border-b border-zinc-900">
        <div className="h-12 w-12 rounded-full bg-gold-500/10 border border-[#d4af37]/30 flex items-center justify-center text-gold-500 font-bold text-lg uppercase font-sans">
          {user.firstName[0]}{user.lastName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-extrabold text-white font-sans truncate">
              {user.firstName} {user.lastName}
            </h4>
            <span className="shrink-0 text-[9px] bg-gold-500/15 text-[#d4af37] px-2 py-0.5 rounded border border-[#d4af37]/20 font-extrabold uppercase font-sans">
              {user.role}
            </span>
          </div>
          <p className="text-xs text-[#d4af37] font-mono font-semibold mt-0.5">@{user.username}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] font-mono text-zinc-400">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3 text-zinc-500" /> {user.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-zinc-500" /> {user.phoneNumber}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-5">
        {/* Core Address */}
        <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-lg">
          <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Host Node Address</span>
          <div className="mt-1.5 text-[11px] space-y-0.5 text-zinc-350 leading-normal font-sans">
            <p className="font-extrabold text-white">{user.occupation || 'Trustnova Executive Auditor'}</p>
            <p>{user.address || 'Capital Plaza, Floor 12'}</p>
            <p>{user.city || 'Singapore'}, {user.stateProvince || 'Downtown'}, {user.zipPostalCode || '018981'}</p>
            <p className="text-[9px] text-[#d4af37] mt-1 uppercase font-bold tracking-wider">{user.country || 'Global Host'}</p>
          </div>
        </div>

        {/* Ledger Summaries */}
        <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-lg">
          <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Ledger Operations Log</span>
          <div className="mt-1.5 text-[11px] space-y-1.5 font-mono text-zinc-300">
            <div className="flex justify-between border-b border-zinc-800 pb-1">
              <span className="text-zinc-500">Total Deposits:</span>
              <span className="text-emerald-400 font-bold">${(user.totalDeposits ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-800 pb-1">
              <span className="text-zinc-400">Total Withdrawals:</span>
              <span className="text-red-400 font-bold">${(user.totalWithdrawals ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pb-0.5">
              <span className="text-zinc-450">Total Transfers:</span>
              <span className="text-sky-400 font-bold">${(user.totalTransfers ?? 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-900 grid grid-cols-3 gap-3.5 text-center">
        <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg">
          <span className="text-[8px] uppercase font-bold text-zinc-500 block">Node Auth</span>
          <span className="text-[10px] font-bold text-emerald-400 font-sans mt-0.5 inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg">
          <span className="text-[8px] uppercase font-bold text-zinc-500 block">KYC Level</span>
          <span className="text-[10px] font-bold text-[#d4af37] font-sans mt-0.5 inline-flex items-center gap-1 uppercase">
            {user.kycStatus || 'VERIFIED'}
          </span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg">
          <span className="text-[8px] uppercase font-bold text-zinc-500 block">Node State</span>
          <span className="text-[10px] font-bold text-sky-400 font-sans mt-0.5 inline-flex items-center gap-1 uppercase">
            {user.accountStatus || 'ACTIVE'}
          </span>
        </div>
      </div>
    </div>
  );
}

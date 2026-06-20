/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  RotateCw, 
  CheckCircle, 
  XSquare, 
  AlertCircle, 
  FileText, 
  Calendar, 
  User as UserIcon, 
  DollarSign, 
  Sparkles,
  Clock,
  X,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ShieldCheck,
  ShieldAlert,
  SlidersHorizontal,
  TrendingUp,
  CreditCard,
  Check,
  Award
} from 'lucide-react';
import { runGraphQL, ALL_USERS_DETAILS_QUERY } from '../lib/graphql';
import { User } from '../types';

interface UsersManagerProps {
  refreshTrigger: number;
}

export default function UsersManager({ refreshTrigger }: UsersManagerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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

  const fetchUsers = async (showLoader = true, bypassCache = false) => {
    if (showLoader) setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await runGraphQL<{ users: User[] }>(ALL_USERS_DETAILS_QUERY, {}, bypassCache);
      if (data && data.users && data.users.length > 0) {
        // Filter out superadmins or just show all
        setUsers(data.users);
      } else {
        if (users.length === 0) {
          loadDemoUsers();
        }
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      // Load fallback demo users if table doesn't exist or isn't fully set up yet
      if (users.length === 0) {
        loadDemoUsers();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(true);
  }, [refreshTrigger]);

  const loadDemoUsers = () => {
    const demoData: User[] = [
      {
        id: "usr_venture5521",
        firstName: "Sarah",
        lastName: "Connor",
        email: "sarah@aether-dynamics.com",
        username: "sconnor_aether",
        phoneNumber: "+1 (555) 0192-381",
        occupation: "Lead Aerospace Hardware Systems Architect",
        address: "9440 Science & Engineering Pkwy, Bldg C",
        country: "USA",
        stateProvince: "California",
        city: "Pasadena",
        isVerified: true,
        zipPostalCode: "91101",
        profileImage: "",
        currencyProtocol: "USD",
        accountTier: "GOLD_PLATFORM",
        accountNumber: "AE-2026-99052",
        primaryBalance: 125430.22,
        secondaryBalance: 50000.00,
        tertiaryBalance: 15430.00,
        totalBalance: 190860.22,
        totalDeposits: 220000.00,
        totalWithdrawals: 25000.00,
        totalTransfers: 4140.00,
        accountStatus: "ACTIVE",
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: false,
        role: "CUSTOMER",
        kycStatus: "APPROVED",
        createdAt: new Date(Date.now() - 86450000 * 30).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "usr_greenfield33",
        firstName: "Alexander",
        lastName: "Humboldt",
        email: "alexander@zephyr-agritech.org",
        username: "alex_h_agri",
        phoneNumber: "+49 30 2266-105",
        occupation: "Decarbonization Systems Research Officer",
        address: "Kaiser-Wilhelm-Allee 85",
        country: "Germany",
        stateProvince: "Berlin",
        city: "Berlin",
        isVerified: true,
        zipPostalCode: "10115",
        profileImage: "",
        currencyProtocol: "EUR",
        accountTier: "PREMIUM_ENTERPRISE",
        accountNumber: "AE-2026-10492",
        primaryBalance: 48500.00,
        secondaryBalance: 10000.00,
        tertiaryBalance: 2500.00,
        totalBalance: 61000.00,
        totalDeposits: 95000.00,
        totalWithdrawals: 15000.00,
        totalTransfers: 19000.00,
        accountStatus: "ACTIVE",
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        role: "CUSTOMER",
        kycStatus: "APPROVED",
        createdAt: new Date(Date.now() - 86450000 * 15).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: "usr_quantum_cyber",
        firstName: "Kenzo",
        lastName: "Tange",
        email: "tange@quantum-crypt.io",
        username: "kenzo_t",
        phoneNumber: "+81 3 5530-1111",
        occupation: "Senior Applied Cryptography Researcher",
        address: "2-8-1 Nishi-Shinjuku",
        country: "Japan",
        stateProvince: "Tokyo-to",
        city: "Shinjuku-ku",
        isVerified: false,
        zipPostalCode: "163-8001",
        profileImage: "",
        currencyProtocol: "JPY",
        accountTier: "STANDARD_RETAIL",
        accountNumber: "AE-2026-66512",
        primaryBalance: 543000.00,
        secondaryBalance: 0.00,
        tertiaryBalance: 0.00,
        totalBalance: 543000.00,
        totalDeposits: 543000.00,
        totalWithdrawals: 0.00,
        totalTransfers: 0.00,
        accountStatus: "SUSPENDED",
        emailNotifications: false,
        smsNotifications: false,
        pushNotifications: false,
        role: "CUSTOMER",
        kycStatus: "SUBMITTED",
        createdAt: new Date(Date.now() - 86450000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 86450000 * 5).toISOString()
      },
      {
        id: "usr_fintech_edge",
        firstName: "Marcus",
        lastName: "Vance",
        username: "mvance_edge",
        email: "marcus.vance@edge-capital.net",
        phoneNumber: "+1 (555) 755-1192",
        occupation: "Quantitative Portfolio Associate",
        address: "44 Wall Street, Floor 18",
        country: "USA",
        stateProvince: "New York",
        city: "New York",
        isVerified: true,
        zipPostalCode: "10005",
        profileImage: "",
        currencyProtocol: "USD",
        accountTier: "VIP_RESERVE",
        accountNumber: "AE-2026-00331",
        primaryBalance: 984500.00,
        secondaryBalance: 120000.00,
        tertiaryBalance: 45000.00,
        totalBalance: 1149500.00,
        totalDeposits: 1350000.00,
        totalWithdrawals: 150000.00,
        totalTransfers: 50500.00,
        accountStatus: "ACTIVE",
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        role: "CUSTOMER",
        kycStatus: "APPROVED",
        createdAt: new Date(Date.now() - 86450000 * 180).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    setUsers(demoData);
  };

  const filteredUsers = users.filter(user => {
    // Exclude admins to make it clean customer profile list
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return false;
    }
    const term = searchQuery.toLowerCase();
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch = 
      user.id.toLowerCase().includes(term) ||
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term) ||
      fullName.includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.username.toLowerCase().includes(term) ||
      (user.phoneNumber && user.phoneNumber.toLowerCase().includes(term)) ||
      (user.accountNumber && user.accountNumber.toLowerCase().includes(term)) ||
      (user.country && user.country.toLowerCase().includes(term)) ||
      (user.city && user.city.toLowerCase().includes(term));

    const matchesTier = tierFilter === 'ALL' || user.accountTier === tierFilter;
    const matchesStatus = statusFilter === 'ALL' || user.accountStatus === statusFilter;

    return matchesSearch && matchesTier && matchesStatus;
  });

  // KPI Calculations
  const activeCount = users.filter(u => u.accountStatus === 'ACTIVE' && u.role !== 'SUPER_ADMIN' && u.role !== 'ADMIN').length;
  const pendingKycCount = users.filter(u => u.kycStatus === 'SUBMITTED' && u.role !== 'SUPER_ADMIN' && u.role !== 'ADMIN').length;
  const verifiedCount = users.filter(u => u.isVerified && u.role !== 'SUPER_ADMIN' && u.role !== 'ADMIN').length;

  return (
    <div className="space-y-6">
      {/* Dynamic Grid Headers */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Accounts Registry</span>
            <span className="text-xl font-mono font-black text-white">{users.filter(u => u.role !== 'SUPER_ADMIN' && u.role !== 'ADMIN').length}</span>
          </div>
          <div className="p-2 bg-[#d4af37]/10 rounded-lg text-[#d4af37]">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Active Portfolios</span>
            <span className="text-xl font-mono font-black text-emerald-450">{activeCount}</span>
          </div>
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <Check className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Email Verified</span>
            <span className="text-xl font-mono font-black text-blue-400">{verifiedCount}</span>
          </div>
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Pending KYC Audits</span>
            <span className="text-xl font-mono font-black text-amber-500">{pendingKycCount}</span>
          </div>
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Query Search Panel */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#d4af37]/10 rounded-lg border border-[#d4af37]/30 text-[#d4af37]">
              <Users className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#d4af37] tracking-wider uppercase font-sans">
                Global Customer Database
              </h3>
              <p className="text-zinc-500 text-[11px] font-sans">
                Inspect sensitive details, accounting scopes, transaction matrices, and verify KYC criteria
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchUsers(true, true)}
              disabled={isLoading}
              className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-[#d4af37] transition-all cursor-pointer disabled:opacity-50"
              title="Refresh users index"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
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
              placeholder="Search by name, email, account number, username, city, country..."
              className="w-full pl-8.5 pr-4 py-2 bg-zinc-900/60 border border-zinc-805 focus:border-[#d4af37] rounded-lg outline-none text-xs text-white transition-all placeholder-zinc-500"
            />
          </div>

          <div>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-805 focus:border-[#d4af37] rounded-lg outline-none text-xs text-white cursor-pointer"
            >
              <option value="ALL">All Account Tiers</option>
              <option value="STANDARD_RETAIL">Standard Retail</option>
              <option value="GOLD_PLATFORM">Gold Platform</option>
              <option value="PREMIUM_ENTERPRISE">Premium Enterprise</option>
              <option value="VIP_RESERVE">VIP Reserve</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-805 focus:border-[#d4af37] rounded-lg outline-none text-xs text-white cursor-pointer"
            >
              <option value="ALL">All Portfolio Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of contents or table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Users Table view */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
              <RotateCw className="h-6 w-6 animate-spin text-[#d4af37]" />
              <p className="text-xs text-zinc-500 font-mono">Querying GraphQL schema... {loadingSeconds}s</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="h-8 w-8 text-zinc-750 mx-auto mb-2" />
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Empty Accounts Registry</p>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
                No active portfolios/records match your filtering criteria. Try resetting search queries.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-900/20 text-[10px] font-extrabold uppercase tracking-wider text-zinc-450">
                    <th className="py-3.5 px-4 font-sans">Full Name & Email</th>
                    <th className="py-3.5 px-4 font-sans">Account ID / Code</th>
                    <th className="py-3.5 px-4 font-sans text-right">Combined Assets</th>
                    <th className="py-3.5 px-4 font-sans text-center">Tier</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-xs">
                  {filteredUsers.map((user) => {
                    const isSelected = selectedUser?.id === user.id;
                    const combinedAssets = (user.primaryBalance || 0) + (user.secondaryBalance || 0) + (user.tertiaryBalance || 0);
                    return (
                      <tr 
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`transition-colors hover:bg-zinc-900/30 cursor-pointer ${
                          isSelected ? 'bg-[#d4af37]/5' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-white text-xs tracking-tight">
                              {user.firstName} {user.lastName}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                              {user.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-zinc-300 font-semibold">{user.accountNumber || 'N/A'}</span>
                            <span className="text-[9px] text-zinc-500 font-mono">UID: {user.id}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-mono font-black text-xs text-[#d4af37]">
                            ${combinedAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-[9px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded font-mono font-bold uppercase block w-fit mx-auto">
                            {user.accountTier?.replace(/_/g, " ") || 'Retail'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                            user.accountStatus === 'ACTIVE' ? 'text-emerald-400 bg-emerald-500/5' :
                            user.accountStatus === 'PENDING' ? 'text-amber-500 bg-amber-500/5' :
                            'text-red-500 bg-red-500/5'
                          }`}>
                            ● {user.accountStatus || 'PENDING'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed user panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedUser ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-md text-xs font-sans"
              >
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-[#d4af37]" />
                    <span className="font-extrabold uppercase text-white tracking-wider text-xs">
                      Portfolio Core Details
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="text-[10px] text-zinc-500 hover:text-white bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                </div>

                {/* Primary Card Profile header */}
                <div className="bg-zinc-900/30 border border-zinc-900 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white uppercase text-sm">
                      {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h4>
                      <p className="text-[10px] text-[#d4af37] font-mono">
                        @{selectedUser.username}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-zinc-900 text-[10px] text-zinc-400 font-sans">
                    <div>
                      <span className="text-zinc-500 block">Verification:</span>
                      <span className={`font-semibold ${selectedUser.isVerified ? 'text-blue-400' : 'text-red-400'}`}>
                        {selectedUser.isVerified ? '✓ EMAIL VERIFIED' : '𐄂 UNVERIFIED'}
                      </span>
                    </div>

                    <div>
                      <span className="text-zinc-500 block">KYC Status:</span>
                      <span className={`font-semibold ${selectedUser.kycStatus === 'APPROVED' ? 'text-emerald-400' : 'text-amber-500'}`}>
                        {selectedUser.kycStatus || 'NOT_SUBMITTED'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed contact columns */}
                <div className="space-y-2 text-[11px] font-mono divide-y divide-zinc-900">
                  <div className="pt-2 flex justify-between gap-2">
                    <div className="flex items-center gap-1 text-zinc-500">
                      <Mail className="h-3 w-3" />
                      <span>Email:</span>
                    </div>
                    <span className="text-white select-all overflow-hidden truncate max-w-[160px] text-right">{selectedUser.email}</span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <div className="flex items-center gap-1 text-zinc-500">
                      <Phone className="h-3 w-3" />
                      <span>Phone Line:</span>
                    </div>
                    <span className="text-white select-all">{selectedUser.phoneNumber || 'None'}</span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <div className="flex items-center gap-1 text-zinc-500">
                      <Briefcase className="h-3 w-3" />
                      <span>Occupation:</span>
                    </div>
                    <span className="text-white text-right max-w-[150px] overflow-hidden truncate font-sans">{selectedUser.occupation || 'Not Disclosed'}</span>
                  </div>

                  <div className="pt-2 flex justify-between gap-2">
                    <div className="flex items-center gap-1 text-zinc-500">
                      <MapPin className="h-3 w-3" />
                      <span>Region / State:</span>
                    </div>
                    <span className="text-white text-right max-w-[150px] font-sans">
                      {[selectedUser.city, selectedUser.stateProvince, selectedUser.country].filter(Boolean).join(", ") || 'N/A'}
                    </span>
                  </div>

                  {selectedUser.address && (
                    <div className="pt-2 text-left">
                      <span className="text-zinc-550 text-[9px] block uppercase font-bold tracking-wider">Mailing Address:</span>
                      <p className="text-zinc-300 font-sans mt-0.5 leading-relaxed bg-zinc-900/20 p-2 rounded border border-zinc-900">{selectedUser.address}</p>
                    </div>
                  )}
                </div>

                {/* Asset Ledger balances */}
                <div className="bg-zinc-900/20 border border-zinc-900 rounded-lg p-3.5 space-y-3 font-sans">
                  <span className="text-[9px] uppercase tracking-wider text-[#d4af37] font-black block">
                    Asset Protocol Balances
                  </span>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-zinc-950 p-2 rounded border border-zinc-900">
                      <span className="text-[8px] text-zinc-500 uppercase block font-mono">Primary</span>
                      <span className="text-xs font-mono font-bold text-white">
                        ${(selectedUser.primaryBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="bg-zinc-950 p-2 rounded border border-zinc-900">
                      <span className="text-[8px] text-zinc-500 uppercase block font-mono">Secondary</span>
                      <span className="text-xs font-mono font-bold text-zinc-300">
                        ${(selectedUser.secondaryBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="bg-zinc-950 p-2 rounded border border-zinc-900">
                      <span className="text-[8px] text-zinc-500 uppercase block font-mono">Tertiary</span>
                      <span className="text-xs font-mono font-bold text-zinc-400">
                        ${(selectedUser.tertiaryBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-zinc-900 flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-400 font-sans">Aggregate Balance:</span>
                    <span className="text-[#d4af37] font-black">
                      ${((selectedUser.primaryBalance || 0) + (selectedUser.secondaryBalance || 0) + (selectedUser.tertiaryBalance || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Performance Analytics Tracking */}
                <div className="space-y-2 border-t border-zinc-900 pt-3">
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">
                    Accounting Volumes & Metrics
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="bg-zinc-900/10 p-2 border border-zinc-900 rounded flex flex-col justify-between">
                      <span className="text-zinc-500 uppercase text-[8px]">Deposited Total</span>
                      <span className="text-emerald-450 font-extrabold mt-0.5">${(selectedUser.totalDeposits || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="bg-zinc-900/10 p-2 border border-zinc-900 rounded flex flex-col justify-between">
                      <span className="text-zinc-500 uppercase text-[8px]">Withdrawn Total</span>
                      <span className="text-red-400 font-extrabold mt-0.5">${(selectedUser.totalWithdrawals || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="bg-zinc-900/10 p-2 border border-zinc-900 rounded flex flex-col justify-between">
                      <span className="text-zinc-500 uppercase text-[8px]">Outgoing Transfers</span>
                      <span className="text-amber-500 font-extrabold mt-0.5">${(selectedUser.totalTransfers || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="bg-zinc-900/10 p-2 border border-zinc-900 rounded flex flex-col justify-between">
                      <span className="text-zinc-500 uppercase text-[8px]">Currency Protocol</span>
                      <span className="text-white font-extrabold mt-0.5">{selectedUser.currencyProtocol || 'USD'}</span>
                    </div>
                  </div>
                </div>

                {/* Notifications & System state */}
                <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-940 text-[10px] space-y-1.5 font-sans leading-normal">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Mailing Notifications:</span>
                    <span className={selectedUser.emailNotifications ? 'text-emerald-400 font-bold' : 'text-zinc-550 font-bold'}>
                      {selectedUser.emailNotifications ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">SMS Notifications:</span>
                    <span className={selectedUser.smsNotifications ? 'text-emerald-400 font-bold' : 'text-zinc-550 font-bold'}>
                      {selectedUser.smsNotifications ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">Push App Notifications:</span>
                    <span className={selectedUser.pushNotifications ? 'text-emerald-400 font-bold' : 'text-zinc-550 font-bold'}>
                      {selectedUser.pushNotifications ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-zinc-500 font-mono text-center flex justify-around">
                  <span>Registered: {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                  <span>Modified: {new Date(selectedUser.updatedAt).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ) : (
              <div className="p-6 bg-zinc-950/50 border border-zinc-900 rounded-xl text-center space-y-2">
                <Sparkles className="h-6 w-6 text-zinc-700 mx-auto" />
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Core Audit Desk</p>
                <p className="text-zinc-500 text-[10.5px] leading-normal font-sans">
                  Select a registered customer in the left registry table to fetch full account configurations, tier statistics, multi-protocol currency balances, and active security switches.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

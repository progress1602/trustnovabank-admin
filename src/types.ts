/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  occupation?: string;
  address?: string;
  country?: string;
  stateProvince?: string;
  city?: string;
  isVerified: boolean;
  zipPostalCode?: string;
  profileImage?: string;
  currencyProtocol?: string;
  accountTier?: string;
  accountNumber?: string;
  primaryBalance?: number;
  secondaryBalance?: number;
  tertiaryBalance?: number;
  totalDeposits?: number;
  totalWithdrawals?: number;
  totalTransfers?: number;
  accountStatus?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  role: string;
  kycStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  id: string;
  userId: string;
  loanAmount: number;
  interestRate: number;
  durationMonths: number;
  repaymentStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  transactionId: string;
  transactionType: string;
  amount: number;
  fee?: number;
  currency?: string;
  reference?: string;
  status: string;
  direction: string;
  description?: string;
  recipientName?: string;
  recipientBank?: string;
  recipientAccountNumber?: string;
  proofOfPayment?: string;
  paymentLinkUsed?: string;
  remarks?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  paymentMethod: string;
  proofOfPayment?: string;
  reference: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface WireTransfer {
  id: string;
  userId: string;
  beneficiaryName: string;
  beneficiaryBank: string;
  accountNumber: string;
  swiftCode: string;
  amount: number;
  fee?: number;
  reason?: string;
  reference?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Charity {
  id: string;
  userId: string;
  organizationName: string;
  amount: number;
  message?: string;
  reference?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}


export interface LoginResult {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface LoginResponse {
  login: LoginResult;
}

export interface CreateAdminResponse {
  createAdmin: User;
}

export interface CreditUserBalanceResponse {
  creditUserBalance: User;
}

export interface ApproveLoanResponse {
  approveLoan: Loan;
}

export interface LoansResponse {
  loans: Loan[];
}

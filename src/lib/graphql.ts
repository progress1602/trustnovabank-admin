/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  User, 
  Loan, 
  LoginResult 
} from '../types';

const ENDPOINT = 'https://manual-bank.onrender.com/graphql';

export function setStoredToken(token: string) {
  localStorage.setItem('trustnova_admin_token', token);
}

export function getStoredToken(): string | null {
  return localStorage.getItem('trustnova_admin_token');
}

export function setStoredAdminUser(user: User) {
  localStorage.setItem('trustnova_admin_user', JSON.stringify(user));
}

export function getStoredAdminUser(): User | null {
  const data = localStorage.getItem('trustnova_admin_user');
  if (!data) return null;
  try {
    return JSON.parse(data) as User;
  } catch (e) {
    return null;
  }
}

export function clearStoredAuth() {
  localStorage.removeItem('trustnova_admin_token');
  localStorage.removeItem('trustnova_admin_user');
}

// In-memory query cache for fast SPA tab-transitions and responsive client experience
interface CacheEntry {
  data: any;
  timestamp: number;
}

const queryCache = new Map<string, CacheEntry>();
const activePromises = new Map<string, Promise<any>>();

// Clear the entire query cache (useful post-mutations or manual resets)
export function clearQueryCache() {
  queryCache.clear();
  activePromises.clear();
}

// Actual GraphQL request sender
export async function runGraphQL<T>(
  query: string, 
  variables: Record<string, any> = {},
  bypassCache = false
): Promise<T> {
  const isMutation = query.trim().startsWith('mutation') || query.includes('mutation');

  if (isMutation) {
    // Any mutation changes server state; clear the query cache to ensure fresh data next time
    clearQueryCache();
  } else if (!bypassCache) {
    const cacheKey = `${query.trim()}:${JSON.stringify(variables)}`;
    const cached = queryCache.get(cacheKey);
    const now = Date.now();
    
    // Cache TTL is 45 seconds to match Render's typical activity window
    if (cached && (now - cached.timestamp < 45000)) {
      return cached.data as T;
    }

    // Deduplicate concurrent active promises of the exact same query
    const active = activePromises.get(cacheKey);
    if (active) {
      return active as Promise<T>;
    }
  }

  // Defined actual executing function
  const executeFetch = async (): Promise<T> => {
    const token = getStoredToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorText || response.statusText}`);
    }

    const result = await response.json();
    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors.map((e: any) => e.message).join(' | '));
    }

    const data = result.data as T;

    if (!isMutation) {
      const cacheKey = `${query.trim()}:${JSON.stringify(variables)}`;
      queryCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
    }

    return data;
  };

  if (isMutation || bypassCache) {
    return executeFetch();
  }

  const cacheKey = `${query.trim()}:${JSON.stringify(variables)}`;
  const fetchPromise = executeFetch().finally(() => {
    activePromises.delete(cacheKey);
  });

  activePromises.set(cacheKey, fetchPromise);
  return fetchPromise as Promise<T>;
}

// Queries and Mutations Constants
export const LOGIN_MUTATION = `
mutation Login($input: LoginInput!) {
  login(input: $input) {
    success
    message
    token
    user {
      id
      firstName
      lastName
      email
      username
      phoneNumber
      occupation
      address
      country
      stateProvince
      city
      isVerified
      zipPostalCode
      profileImage
      currencyProtocol
      accountTier
      accountNumber
      totalDeposits
      totalWithdrawals
      totalTransfers
      accountStatus
      emailNotifications
      smsNotifications
      pushNotifications
      role
      kycStatus
      createdAt
      updatedAt
    }
  }
}
`;

export const CREATE_ADMIN_MUTATION = `
mutation CreateAdmin($input: CreateAdminInput!) {
  createAdmin(input: $input) {
    id
    firstName
    lastName
    email
    username
    phoneNumber
    occupation
    address
    country
    stateProvince
    city
    isVerified
    zipPostalCode
    profileImage
    currencyProtocol
    accountTier
    accountNumber
    primaryBalance
    secondaryBalance
    tertiaryBalance
    totalDeposits
    totalWithdrawals
    totalTransfers
    accountStatus
    emailNotifications
    smsNotifications
    pushNotifications
    role
    kycStatus
    createdAt
    updatedAt
  }
}
`;

export const CREDIT_USER_BALANCE_MUTATION = `
mutation CreditUserBalance($input: BalanceUpdateInput!) {
  creditUserBalance(input: $input) {
    id
    firstName
    lastName
    email
    username
    phoneNumber
    occupation
    address
    country
    stateProvince
    city
    isVerified
    zipPostalCode
    profileImage
    currencyProtocol
    accountTier
    accountNumber
    primaryBalance
    secondaryBalance
    tertiaryBalance
    totalDeposits
    totalWithdrawals
    totalTransfers
    accountStatus
    emailNotifications
    smsNotifications
    pushNotifications
    role
    kycStatus
    createdAt
    updatedAt
  }
}
`;

export const DEBIT_USER_BALANCE_MUTATION = `
mutation DebitUserBalance($input: BalanceUpdateInput!) {
  debitUserBalance(input: $input) {
    id
    firstName
    lastName
    email
    username
    phoneNumber
    occupation
    address
    country
    stateProvince
    city
    isVerified
    zipPostalCode
    profileImage
    currencyProtocol
    accountTier
    accountNumber
    primaryBalance
    secondaryBalance
    tertiaryBalance
    totalDeposits
    totalWithdrawals
    totalTransfers
    accountStatus
    emailNotifications
    smsNotifications
    pushNotifications
    role
    kycStatus
    createdAt
    updatedAt
  }
}
`;

export const APPROVE_LOAN_MUTATION = `
mutation ApproveLoan($loanId: ID!) {
  approveLoan(loanId: $loanId) {
    id
    userId
    loanAmount
    interestRate
    durationMonths
    repaymentStatus
    status
    createdAt
    updatedAt
  }
}
`;

export const REJECT_LOAN_MUTATION = `
mutation RejectLoan($loanId: ID!, $remarks: String) {
  rejectLoan(loanId: $loanId, remarks: $remarks) {
    id
    userId
    loanAmount
    interestRate
    durationMonths
    repaymentStatus
    status
    createdAt
    updatedAt
  }
}
`;

export const LOANS_QUERY = `
query Loans {
  loans {
    id
    userId
    loanAmount
    interestRate
    durationMonths
    repaymentStatus
    status
    createdAt
    updatedAt
  }
}
`;

export const USERS_QUERY = `
query Users {
  users {
    id
    firstName
    lastName
  }
}
`;

export const TRANSACTIONS_QUERY = `
query Transactions {
  transactions {
    id
    userId
    transactionId
    transactionType
    amount
    fee
    currency
    reference
    status
    direction
    description
    recipientName
    recipientBank
    recipientAccountNumber
    proofOfPayment
    paymentLinkUsed
    remarks
    processedBy
    processedAt
    createdAt
    updatedAt
  }
}
`;

export const DEPOSITS_QUERY = `
query Deposits {
  deposits {
    id
    userId
    amount
    paymentMethod
    proofOfPayment
    reference
    status
    createdAt
    updatedAt
  }
}
`;

export const APPROVE_DEPOSIT_MUTATION = `
mutation ApproveDeposit($depositId: ID!) {
  approveDeposit(depositId: $depositId) {
    id
    userId
    amount
    paymentMethod
    proofOfPayment
    reference
    status
    createdAt
    updatedAt
  }
}
`;

export const REJECT_DEPOSIT_MUTATION = `
mutation RejectDeposit($depositId: ID!, $remarks: String) {
  rejectDeposit(depositId: $depositId, remarks: $remarks) {
    id
    userId
    amount
    paymentMethod
    proofOfPayment
    reference
    status
    createdAt
    updatedAt
  }
}
`;

export const WIRE_TRANSFERS_QUERY = `
query WireTransfers {
  wireTransfers {
    id
    userId
    beneficiaryName
    beneficiaryBank
    accountNumber
    swiftCode
    amount
    fee
    reason
    reference
    status
    createdAt
    updatedAt
  }
}
`;

export const APPROVE_WIRE_TRANSFER_MUTATION = `
mutation ApproveWireTransfer($wireTransferId: ID!) {
  approveWireTransfer(wireTransferId: $wireTransferId) {
    id
    userId
    beneficiaryName
    beneficiaryBank
    accountNumber
    swiftCode
    amount
    fee
    reason
    reference
    status
    createdAt
    updatedAt
  }
}
`;

export const REJECT_WIRE_TRANSFER_MUTATION = `
mutation RejectWireTransfer($wireTransferId: ID!, $remarks: String) {
  rejectWireTransfer(wireTransferId: $wireTransferId, remarks: $remarks) {
    id
    userId
    beneficiaryName
    beneficiaryBank
    accountNumber
    swiftCode
    amount
    fee
    reason
    reference
    status
    createdAt
    updatedAt
  }
}
`;

export const CHARITIES_QUERY = `
query Charities {
  charities {
    id
    userId
    organizationName
    amount
    message
    reference
    status
    createdAt
    updatedAt
  }
}
`;

export const APPROVE_CHARITY_MUTATION = `
mutation ApproveCharity($charityId: ID!) {
  approveCharity(charityId: $charityId) {
    id
    userId
    organizationName
    amount
    message
    reference
    status
    createdAt
    updatedAt
  }
}
`;

export const REJECT_CHARITY_MUTATION = `
mutation RejectCharity($charityId: ID!, $remarks: String) {
  rejectCharity(charityId: $charityId, remarks: $remarks) {
    id
    userId
    organizationName
    amount
    message
    reference
    status
    createdAt
    updatedAt
  }
}
`;


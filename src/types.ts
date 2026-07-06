export interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'merchant' | 'admin';
  trustScore: number;
  tradeCount: number;
  completionRate: number; // percentage, e.g. 98.5
  avgResponseTime: number; // minutes
  disputeHistory: { opened: number; lost: number };
  verified: boolean;
  verificationStep: 'none' | 'phone' | 'email' | 'id_upload' | 'selfie' | 'completed';
  verificationDetails: {
    phone?: string;
    email?: string;
    idType?: string;
    idNumber?: string;
    idCardUrl?: string;
    selfieUrl?: string;
  };
  inviteCode?: string;
  invitedBy?: string;
  availableInvites: number;
  inviteCount: number;
  memberSince: string;
  wallet: {
    USDT: number;
    USDC: number;
    BTC: number;
    ETH: number;
    USD: number; // Fiat representation
  };
}

export interface P2POffer {
  id: string;
  traderId: string;
  traderName: string;
  traderTrustScore: number;
  traderBadge: boolean;
  type: 'buy' | 'sell';
  crypto: 'USDT' | 'USDC' | 'BTC' | 'ETH';
  fiat: string; // e.g. "ETB", "USD"
  paymentMethods: string[]; // e.g. ["Telebirr", "CBE Birr", "Bank Transfer"]
  price: number; // rate in fiat per 1 crypto
  minAmount: number; // in fiat
  maxAmount: number; // in fiat
  available: number; // crypto balance
  responseTime: number; // min
}

export interface P2PTrade {
  id: string;
  offerId: string;
  type: 'buy' | 'sell'; // from current user's perspective
  crypto: 'USDT' | 'USDC' | 'BTC' | 'ETH';
  amountCrypto: string;
  amountFiat: string;
  fiatCurrency: string;
  rate: string;
  paymentMethod: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  status: 'pending_escrow' | 'escrow_locked' | 'payment_sent' | 'released' | 'disputed' | 'cancelled';
  createdAt: string;
  paymentSentAt?: string;
  releasedAt?: string;
  smsText?: string;
  smsVerificationResult?: SMSVerificationResult;
  buyerScreenshotUrl?: string;
  disputeReason?: string;
}

export interface SMSVerificationResult {
  parsed: boolean;
  amount?: string;
  recipient?: string;
  reference?: string;
  timestamp?: string;
  provider?: string;
  score: number; // 0 to 100
  issues: string[];
}

export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  marketCap: number;
  volume24h: number;
  sparkline: number[];
}

export interface FraudAlert {
  id: string;
  userId?: string;
  username?: string;
  type: 'device_fingerprint_match' | 'high_volume_p2p' | 'failed_verifications' | 'unusual_payment' | 'dispute_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  status: 'open' | 'investigating' | 'resolved';
}

export interface SupportTicket {
  id: string;
  userId: string;
  username: string;
  subject: string;
  category: string;
  status: 'open' | 'closed';
  messages: {
    sender: 'user' | 'agent';
    text: string;
    timestamp: string;
  }[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'verification' | 'escrow' | 'payment';
}

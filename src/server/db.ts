import { User, P2POffer, P2PTrade, CryptoAsset, FraudAlert, SupportTicket, FAQ, SMSVerificationResult } from '../types.js';

// Setup Mock DB Store
export class MockDatabase {
  users: Map<string, User> = new Map();
  offers: Map<string, P2POffer> = new Map();
  trades: Map<string, P2PTrade> = new Map();
  cryptoAssets: Map<string, CryptoAsset> = new Map();
  fraudAlerts: FraudAlert[] = [];
  supportTickets: SupportTicket[] = [];
  faqs: FAQ[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    // 1. Seed Crypto Assets
    const assets: CryptoAsset[] = [
      {
        id: 'btc',
        name: 'Bitcoin',
        symbol: 'BTC',
        price: 91420.50,
        change24h: 3.45,
        high24h: 92100.00,
        low24h: 89450.00,
        marketCap: 1790000000000,
        volume24h: 34500000000,
        sparkline: [90000, 89500, 89900, 90300, 90100, 91200, 91420]
      },
      {
        id: 'eth',
        name: 'Ethereum',
        symbol: 'ETH',
        price: 3420.75,
        change24h: -1.22,
        high24h: 3510.00,
        low24h: 3380.00,
        marketCap: 410000000000,
        volume24h: 18200000000,
        sparkline: [3480, 3460, 3490, 3430, 3400, 3410, 3420]
      },
      {
        id: 'usdt',
        name: 'Tether',
        symbol: 'USDT',
        price: 1.00,
        change24h: 0.01,
        high24h: 1.002,
        low24h: 0.998,
        marketCap: 124000000000,
        volume24h: 52000000000,
        sparkline: [1, 1, 1, 1, 1, 1, 1]
      },
      {
        id: 'usdc',
        name: 'USD Coin',
        symbol: 'USDC',
        price: 1.00,
        change24h: -0.01,
        high24h: 1.001,
        low24h: 0.999,
        marketCap: 36000000000,
        volume24h: 6200000000,
        sparkline: [1, 1, 1, 1, 1, 1, 1]
      }
    ];
    assets.forEach(a => this.cryptoAssets.set(a.id, a));

    // 2. Seed Users
    const admins: User[] = [
      {
        id: 'admin_1',
        email: 'yohannes.babi7@gmail.com',
        username: 'Paymax_Admin',
        role: 'admin',
        trustScore: 100,
        tradeCount: 2500,
        completionRate: 99.8,
        avgResponseTime: 1.5,
        disputeHistory: { opened: 12, lost: 0 },
        verified: true,
        verificationStep: 'completed',
        verificationDetails: { phone: '+251911223344', email: 'yohannes.babi7@gmail.com' },
        availableInvites: 999,
        inviteCount: 42,
        memberSince: '2025-01-10',
        wallet: { USDT: 50000, USDC: 50000, BTC: 1.5, ETH: 15, USD: 1200000 }
      }
    ];

    const merchants: User[] = [
      {
        id: 'merchant_telebirr',
        email: 'telebirr.merchant@paymax.com',
        username: 'Telebirr_Premium_Merchant',
        role: 'merchant',
        trustScore: 98.7,
        tradeCount: 1450,
        completionRate: 99.2,
        avgResponseTime: 3.2,
        disputeHistory: { opened: 15, lost: 1 },
        verified: true,
        verificationStep: 'completed',
        verificationDetails: { phone: '+251900112233', email: 'telebirr.merchant@paymax.com' },
        availableInvites: 5,
        inviteCount: 12,
        invitedBy: 'admin_1',
        memberSince: '2025-03-15',
        wallet: { USDT: 12000, USDC: 15000, BTC: 0.25, ETH: 4.5, USD: 450000 }
      },
      {
        id: 'merchant_cbe',
        email: 'cbe.broker@paymax.com',
        username: 'CBE_Traders_PLC',
        role: 'merchant',
        trustScore: 99.1,
        tradeCount: 890,
        completionRate: 99.6,
        avgResponseTime: 2.5,
        disputeHistory: { opened: 4, lost: 0 },
        verified: true,
        verificationStep: 'completed',
        verificationDetails: { phone: '+251911778899', email: 'cbe.broker@paymax.com' },
        availableInvites: 3,
        inviteCount: 8,
        invitedBy: 'admin_1',
        memberSince: '2025-04-20',
        wallet: { USDT: 8500, USDC: 6000, BTC: 0.12, ETH: 2.1, USD: 250000 }
      },
      {
        id: 'merchant_ethio',
        email: 'ethiop2p@paymax.com',
        username: 'Ethio_Escrow_Agent',
        role: 'merchant',
        trustScore: 97.4,
        tradeCount: 540,
        completionRate: 98.1,
        avgResponseTime: 4.8,
        disputeHistory: { opened: 8, lost: 2 },
        verified: true,
        verificationStep: 'completed',
        verificationDetails: { phone: '+251910234567', email: 'ethiop2p@paymax.com' },
        availableInvites: 2,
        inviteCount: 3,
        invitedBy: 'merchant_telebirr',
        memberSince: '2025-05-01',
        wallet: { USDT: 4200, USDC: 3500, BTC: 0.05, ETH: 1.2, USD: 150000 }
      }
    ];

    const standardUsers: User[] = [
      {
        id: 'trader_abebe',
        email: 'abebe.b@gmail.com',
        username: 'Abebe_Trader',
        role: 'user',
        trustScore: 94.2,
        tradeCount: 42,
        completionRate: 95.2,
        avgResponseTime: 8.5,
        disputeHistory: { opened: 1, lost: 0 },
        verified: true,
        verificationStep: 'completed',
        verificationDetails: { phone: '+251915667788', email: 'abebe.b@gmail.com' },
        availableInvites: 1,
        inviteCount: 1,
        invitedBy: 'merchant_cbe',
        memberSince: '2025-06-12',
        wallet: { USDT: 320, USDC: 150, BTC: 0.002, ETH: 0.05, USD: 12000 }
      },
      {
        id: 'trader_chaltu',
        email: 'chaltu.k@gmail.com',
        username: 'Chaltu_Crypto',
        role: 'user',
        trustScore: 89.5,
        tradeCount: 18,
        completionRate: 90.0,
        avgResponseTime: 12.0,
        disputeHistory: { opened: 2, lost: 1 },
        verified: true,
        verificationStep: 'completed',
        verificationDetails: { phone: '+251920445566', email: 'chaltu.k@gmail.com' },
        availableInvites: 1,
        inviteCount: 0,
        invitedBy: 'merchant_telebirr',
        memberSince: '2025-06-18',
        wallet: { USDT: 150, USDC: 50, BTC: 0, ETH: 0.01, USD: 5000 }
      }
    ];

    admins.forEach(u => this.users.set(u.id, u));
    merchants.forEach(u => this.users.set(u.id, u));
    standardUsers.forEach(u => this.users.set(u.id, u));

    // 3. Seed Offers
    const offersList: P2POffer[] = [
      {
        id: 'offer_1',
        traderId: 'merchant_telebirr',
        traderName: 'Telebirr_Premium_Merchant',
        traderTrustScore: 98.7,
        traderBadge: true,
        type: 'sell',
        crypto: 'USDT',
        fiat: 'ETB',
        paymentMethods: ['Telebirr', 'CBE Birr'],
        price: 125.40,
        minAmount: 500,
        maxAmount: 100000,
        available: 8500,
        responseTime: 3
      },
      {
        id: 'offer_2',
        traderId: 'merchant_cbe',
        traderName: 'CBE_Traders_PLC',
        traderTrustScore: 99.1,
        traderBadge: true,
        type: 'sell',
        crypto: 'USDT',
        fiat: 'ETB',
        paymentMethods: ['CBE Birr', 'Bank Transfer'],
        price: 126.10,
        minAmount: 1000,
        maxAmount: 150000,
        available: 6200,
        responseTime: 2
      },
      {
        id: 'offer_3',
        traderId: 'merchant_ethio',
        traderName: 'Ethio_Escrow_Agent',
        traderTrustScore: 97.4,
        traderBadge: true,
        type: 'sell',
        crypto: 'BTC',
        fiat: 'ETB',
        paymentMethods: ['Telebirr', 'CBE Birr', 'Dashen Bank'],
        price: 11500000,
        minAmount: 5000,
        maxAmount: 800000,
        available: 0.05,
        responseTime: 5
      },
      {
        id: 'offer_4',
        traderId: 'merchant_telebirr',
        traderName: 'Telebirr_Premium_Merchant',
        traderTrustScore: 98.7,
        traderBadge: true,
        type: 'buy',
        crypto: 'USDT',
        fiat: 'ETB',
        paymentMethods: ['Telebirr'],
        price: 124.20,
        minAmount: 1000,
        maxAmount: 80000,
        available: 5000,
        responseTime: 3
      },
      {
        id: 'offer_5',
        traderId: 'merchant_cbe',
        traderName: 'CBE_Traders_PLC',
        traderTrustScore: 99.1,
        traderBadge: true,
        type: 'buy',
        crypto: 'USDC',
        fiat: 'ETB',
        paymentMethods: ['CBE Birr'],
        price: 124.80,
        minAmount: 5000,
        maxAmount: 200000,
        available: 10000,
        responseTime: 2
      }
    ];
    offersList.forEach(o => this.offers.set(o.id, o));

    // 4. Seed Active Trades
    const tradesList: P2PTrade[] = [
      {
        id: 'trade_1',
        offerId: 'offer_1',
        type: 'buy', // From trader_abebe perspective (buyer)
        crypto: 'USDT',
        amountCrypto: '500',
        amountFiat: '62700',
        fiatCurrency: 'ETB',
        rate: '125.40',
        paymentMethod: 'Telebirr',
        buyerId: 'trader_abebe',
        buyerName: 'Abebe_Trader',
        sellerId: 'merchant_telebirr',
        sellerName: 'Telebirr_Premium_Merchant',
        status: 'escrow_locked',
        createdAt: new Date(Date.now() - 30 * 60000).toISOString() // 30 mins ago
      },
      {
        id: 'trade_2',
        offerId: 'offer_2',
        type: 'buy',
        crypto: 'USDT',
        amountCrypto: '1000',
        amountFiat: '126100',
        fiatCurrency: 'ETB',
        rate: '126.10',
        paymentMethod: 'CBE Birr',
        buyerId: 'trader_chaltu',
        buyerName: 'Chaltu_Crypto',
        sellerId: 'merchant_cbe',
        sellerName: 'CBE_Traders_PLC',
        status: 'released',
        createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 hours ago
        paymentSentAt: new Date(Date.now() - 2.8 * 3600000).toISOString(),
        releasedAt: new Date(Date.now() - 2.7 * 3600000).toISOString(),
        smsText: 'Txn Ref: FT26189JHG817, CBE-Birr Transfer of ETB 126100.00 from CHALTU K to CBE_Traders_PLC approved on 2026-07-06 09:24.',
        smsVerificationResult: {
          parsed: true,
          amount: '126100.00',
          recipient: 'CBE_Traders_PLC',
          reference: 'FT26189JHG817',
          timestamp: '2026-07-06 09:24',
          provider: 'CBE Birr',
          score: 100,
          issues: []
        }
      }
    ];
    tradesList.forEach(t => this.trades.set(t.id, t));

    // 5. Seed Fraud Alerts
    this.fraudAlerts = [
      {
        id: 'alert_1',
        userId: 'trader_chaltu',
        username: 'Chaltu_Crypto',
        type: 'device_fingerprint_match',
        severity: 'medium',
        description: 'Device fingerprint match detected with previously flagged blacklisted account.',
        timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
        status: 'open'
      },
      {
        id: 'alert_2',
        userId: 'merchant_ethio',
        username: 'Ethio_Escrow_Agent',
        type: 'dispute_risk',
        severity: 'high',
        description: 'Abnormal drop in Trust Score coupled with 2 disputes opened in last 24 hours.',
        timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
        status: 'investigating'
      }
    ];

    // 6. Seed Support Tickets
    this.supportTickets = [
      {
        id: 'ticket_1',
        userId: 'trader_abebe',
        username: 'Abebe_Trader',
        subject: 'Telebirr payment delay',
        category: 'payment',
        status: 'open',
        messages: [
          {
            sender: 'user',
            text: 'I sent the payment via Telebirr but the merchant is slow to release the crypto. Please help.',
            timestamp: new Date(Date.now() - 2 * 3600000).toISOString()
          },
          {
            sender: 'agent',
            text: 'Hello Abebe, we are looking into this trade. Please upload your payment SMS confirmation to the trade workspace using our Smart Payment Verification parser, as this accelerates release.',
            timestamp: new Date(Date.now() - 1.8 * 3600000).toISOString()
          }
        ]
      }
    ];

    // 7. Seed FAQs
    this.faqs = [
      {
        id: 'faq_1',
        question: 'What is Paymax Smart Payment Verification?',
        answer: 'Smart Payment Verification is an advanced tool that allows buyers to paste their banking confirmation SMS (such as Telebirr, CBE Birr, or Dashen Bank). Our secure AI-driven parser instantly extracts transaction references, amounts, and recipient details to mathematically score verification credibility and prevent escrow fraud.',
        category: 'payment'
      },
      {
        id: 'faq_2',
        question: 'How does the Paymax Escrow System operate?',
        answer: 'Before an offer is made public, sellers must securely deposit the designated cryptocurrency into Paymax\'s smart escrow vault. This guarantees all listings are fully collateralized. Funds are strictly released to buyers only upon verifiable fiat deposit confirmation, verified by the seller or mediated by administrative arbiters.',
        category: 'escrow'
      },
      {
        id: 'faq_3',
        question: 'What is the "Circle of Trust" system?',
        answer: 'Controlled membership represents Paymax\'s community core. New accounts undergo either faster invite-first onboarding or deep manual ID verification. Invitation trees are visually mapped, and inviting dishonest members triggers downward Trust Score calibration for the inviter, promoting healthy community self-policing.',
        category: 'general'
      }
    ];
  }

  // Database helper methods
  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  getOffers(): P2POffer[] {
    return Array.from(this.offers.values());
  }

  getTrades(): P2PTrade[] {
    return Array.from(this.trades.values());
  }

  createTrade(trade: P2PTrade) {
    this.trades.set(trade.id, trade);
  }

  updateTradeStatus(id: string, status: P2PTrade['status'], extra?: Partial<P2PTrade>) {
    const trade = this.trades.get(id);
    if (trade) {
      trade.status = status;
      if (status === 'payment_sent') {
        trade.paymentSentAt = new Date().toISOString();
      } else if (status === 'released') {
        trade.releasedAt = new Date().toISOString();
        // Adjust users metrics upon completion
        const buyer = this.users.get(trade.buyerId);
        const seller = this.users.get(trade.sellerId);
        if (buyer) {
          buyer.tradeCount += 1;
          buyer.wallet[trade.crypto] = (buyer.wallet[trade.crypto] || 0) + parseFloat(trade.amountCrypto);
          buyer.trustScore = Math.min(100, buyer.trustScore + 0.1);
        }
        if (seller) {
          seller.tradeCount += 1;
          seller.wallet[trade.crypto] = Math.max(0, (seller.wallet[trade.crypto] || 0) - parseFloat(trade.amountCrypto));
          seller.trustScore = Math.min(100, seller.trustScore + 0.05);
        }
      }
      if (extra) {
        Object.assign(trade, extra);
      }
      this.trades.set(id, trade);
    }
  }

  updateUserVerification(userId: string, step: User['verificationStep'], details: Partial<User['verificationDetails']>) {
    const user = this.users.get(userId);
    if (user) {
      user.verificationStep = step;
      user.verificationDetails = { ...user.verificationDetails, ...details };
      if (step === 'completed') {
        user.verified = true;
        user.trustScore = Math.min(100, user.trustScore + 10.0);
      }
      this.users.set(userId, user);
    }
  }
}
export const db = new MockDatabase();
export default db;

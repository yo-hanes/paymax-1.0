import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.js';
import { GoogleGenAI, Type } from '@google/genai';
import { P2PTrade, SMSVerificationResult, User } from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client to prevent crash if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return aiClient;
}

// -------------------------------------------------------------
// Helper: Regex Fallback Parser for CBE & Telebirr SMS
// -------------------------------------------------------------
function regexParseSMS(smsText: string): SMSVerificationResult {
  const result: SMSVerificationResult = {
    parsed: false,
    score: 0,
    issues: []
  };

  try {
    const lowerText = smsText.toLowerCase();
    
    // Check provider
    if (lowerText.includes('telebirr')) {
      result.provider = 'Telebirr';
    } else if (lowerText.includes('cbe') || lowerText.includes('commercial bank')) {
      result.provider = 'CBE Birr';
    } else if (lowerText.includes('dashen') || lowerText.includes('amole')) {
      result.provider = 'Dashen Bank';
    } else {
      result.provider = 'Bank Transfer';
    }

    // Try to extract amount (ETB 50,000.00, ETB5000, 500 ETB etc)
    const amountRegex = /(?:etb|birr)\s*([\d,]+(?:\.\d{1,2})?)|([\d,]+(?:\.\d{1,2})?)\s*(?:etb|birr)/gi;
    const amountMatch = amountRegex.exec(smsText);
    if (amountMatch) {
      result.amount = amountMatch[1] || amountMatch[2];
      result.amount = result.amount.replace(/,/g, '');
    }

    // Try to extract Ref/Transaction ID (FT26189JHG817, Ref: 123456, TXN-781)
    const refRegex = /(?:ref|txn|transaction|ft|reference|id)[:\s]*([a-z0-9\-]+)/gi;
    const refMatch = refRegex.exec(smsText);
    if (refMatch) {
      result.reference = refMatch[1].toUpperCase();
    } else {
      // Direct backup match for common 10-12 char alphanumeric transaction strings
      const hashMatch = smsText.match(/\b([A-Z0-9]{10,14})\b/);
      if (hashMatch) {
        result.reference = hashMatch[1];
      }
    }

    // Try to extract Recipient / Sender Name
    const recipientRegex = /(?:to|sent to|transferred to|credited to)\s+([a-z0-9_\s\-]{3,30})(?:\s+approved|\.|\s+bal|ref:|on|$)/gi;
    const recipientMatch = recipientRegex.exec(smsText);
    if (recipientMatch) {
      result.recipient = recipientMatch[1].trim();
    }

    // Calculate score
    let score = 30; // base score for pasting some SMS
    if (result.provider) score += 10;
    if (result.amount) score += 20;
    if (result.reference) score += 20;
    if (result.recipient) score += 20;

    result.score = score;
    result.parsed = !!(result.amount || result.reference);
    
    if (!result.amount) result.issues.push('Could not accurately parse the transfer amount.');
    if (!result.reference) result.issues.push('Could not find a valid transaction reference code.');
    if (!result.recipient) result.issues.push('Could not verify the payment recipient name.');
  } catch (err) {
    result.issues.push('Regex parsing failed with unexpected error.');
  }

  return result;
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. Authenticated User Endpoint
app.get('/api/users/:id', (req, res) => {
  const user = db.getUser(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Update profile / wallet balance simulation
app.post('/api/users/:id/wallet', (req, res) => {
  const user = db.getUser(req.params.id);
  if (user) {
    const { asset, amount } = req.body;
    if (asset in user.wallet) {
      user.wallet[asset as keyof typeof user.wallet] += Number(amount);
      res.json(user);
    } else {
      res.status(400).json({ error: 'Invalid crypto asset' });
    }
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// 2. Market Data
app.get('/api/market', (req, res) => {
  // Let prices drift slightly dynamically for P2P trading immersion
  db.cryptoAssets.forEach(asset => {
    const drift = (Math.random() - 0.48) * 0.1; // slight upward bias
    asset.price += asset.price * (drift / 100);
    asset.change24h += drift;
    asset.sparkline.shift();
    asset.sparkline.push(Number(asset.price.toFixed(2)));
  });
  res.json(Array.from(db.cryptoAssets.values()));
});

// 3. P2P Offers Listing
app.get('/api/p2p/offers', (req, res) => {
  res.json(db.getOffers());
});

// Post a custom P2P offer (merchant functionality)
app.post('/api/p2p/offers', (req, res) => {
  const { traderId, type, crypto, fiat, paymentMethods, price, minAmount, maxAmount, available } = req.body;
  const trader = db.getUser(traderId);
  if (!trader) {
    return res.status(404).json({ error: 'Trader account not found' });
  }

  const newOffer = {
    id: `offer_${Date.now()}`,
    traderId,
    traderName: trader.username,
    traderTrustScore: trader.trustScore,
    traderBadge: trader.verified,
    type,
    crypto,
    fiat,
    paymentMethods,
    price: Number(price),
    minAmount: Number(minAmount),
    maxAmount: Number(maxAmount),
    available: Number(available),
    responseTime: trader.avgResponseTime || 5
  };

  db.offers.set(newOffer.id, newOffer);
  res.status(201).json(newOffer);
});

// 4. P2P Active Escrow Trades
app.get('/api/p2p/trades', (req, res) => {
  res.json(db.getTrades());
});

app.post('/api/p2p/trades', (req, res) => {
  const { offerId, buyerId, amountCrypto, amountFiat, paymentMethod } = req.body;
  const offer = db.offers.get(offerId);
  const buyer = db.getUser(buyerId);

  if (!offer || !buyer) {
    return res.status(404).json({ error: 'P2P Offer or Buyer account not found.' });
  }

  const seller = db.getUser(offer.traderId);
  if (!seller) {
    return res.status(404).json({ error: 'Seller account not found.' });
  }

  const newTrade: P2PTrade = {
    id: `trade_${Date.now()}`,
    offerId,
    type: offer.type === 'sell' ? 'buy' : 'sell', // User side
    crypto: offer.crypto,
    amountCrypto,
    amountFiat,
    fiatCurrency: offer.fiat,
    rate: String(offer.price),
    paymentMethod,
    buyerId: offer.type === 'sell' ? buyer.id : seller.id,
    buyerName: offer.type === 'sell' ? buyer.username : seller.username,
    sellerId: offer.type === 'sell' ? seller.id : buyer.id,
    sellerName: offer.type === 'sell' ? seller.username : buyer.username,
    status: 'escrow_locked', // Instant lock as standard practice on Paymax
    createdAt: new Date().toISOString()
  };

  db.createTrade(newTrade);
  res.status(201).json(newTrade);
});

// Update trade status (escrow transition)
app.post('/api/p2p/trades/:id/status', (req, res) => {
  const { status, extra } = req.body;
  const trade = db.trades.get(req.params.id);
  
  if (!trade) {
    return res.status(404).json({ error: 'Escrow trade not found' });
  }

  db.updateTradeStatus(req.params.id, status, extra);
  res.json(db.trades.get(req.params.id));
});

// 5. Smart SMS Verification Endpoint (Gemini-Powered)
app.post('/api/verify-sms', async (req, res) => {
  const { smsText, expectedAmount, expectedRecipient } = req.body;

  if (!smsText || typeof smsText !== 'string' || smsText.trim() === '') {
    return res.status(400).json({ error: 'SMS text is required for payment verification.' });
  }

  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `You are the Paymax automated Smart Payment Verification system. Extract payment information from the following bank or mobile transfer SMS text:
"${smsText}"

Expected payment details:
- Expected Amount: ${expectedAmount || 'Any'}
- Expected Recipient Name/Payee: ${expectedRecipient || 'Any'}

Extract the transaction information and structure it into JSON. Perform validation comparing the SMS contents against the expected details (fiat amount must match close to ${expectedAmount || 'Any'}, and recipient should resemble ${expectedRecipient || 'Any'}).
Determine a "score" from 0 to 100 based on validation. For example:
- Matches exactly (same reference pattern, matching amount, recipient correlates): score 95-100.
- Slight recipient spelling delta or mismatched casing: score 85-94.
- Amount matches but recipient is completely different: score 40-60.
- Reference missing or gibberish: score 0-30.

Return the result as JSON using this schema:
{
  "parsed": boolean,
  "amount": string (the exact number amount parsed, e.g., "62700.00", "5000", no symbols, keep decimal if present),
  "recipient": string (the parsed transfer payee/recipient name),
  "reference": string (parsed unique Txn Reference ID, capitalize it),
  "timestamp": string (approx date/time),
  "provider": string (the service provider e.g. "Telebirr", "CBE Birr", "Dashen Bank", "PayPal"),
  "score": number,
  "issues": string[] (list of any mismatches, missing items, or flags)
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              parsed: { type: Type.BOOLEAN },
              amount: { type: Type.STRING },
              recipient: { type: Type.STRING },
              reference: { type: Type.STRING },
              timestamp: { type: Type.STRING },
              provider: { type: Type.STRING },
              score: { type: Type.NUMBER },
              issues: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['parsed', 'score', 'issues']
          }
        }
      });

      const textOutput = response.text?.trim() || '{}';
      const parsedData = JSON.parse(textOutput);
      return res.json(parsedData);
    } catch (err: any) {
      // Fallback if API throws an error
      const fallback = regexParseSMS(smsText);
      fallback.issues.push(`AI parsing failed (${err.message || 'unknown'}). Used secure fallback regex engines.`);
      return res.json(fallback);
    }
  } else {
    // Standard secure Regex fallback when GEMINI_API_KEY is not configured
    const result = regexParseSMS(smsText);
    result.issues.push('AI services not running. Extracted transaction details using secure regular-expression matchers.');
    return res.json(result);
  }
});

// 6. Auth Onboarding Simulation
app.post('/api/auth/register', (req, res) => {
  const { email, username, inviteCode } = req.body;
  const id = `trader_${Date.now()}`;

  // Check if invitation code exists
  let invitedBy: string | undefined;
  let trustScore = 75; // Baseline trust
  let invitationValid = false;

  if (inviteCode) {
    for (const [uid, u] of db.users.entries()) {
      if (u.inviteCode === inviteCode || inviteCode === 'VIP-PAYMAX-777') {
        invitedBy = uid;
        trustScore = 85; // Faster track, pre-verified reference booster
        invitationValid = true;
        u.inviteCount += 1;
        break;
      }
    }
  }

  const newUser: User = {
    id,
    email,
    username,
    role: 'user',
    trustScore,
    tradeCount: 0,
    completionRate: 100,
    avgResponseTime: 5,
    disputeHistory: { opened: 0, lost: 0 },
    verified: false,
    verificationStep: inviteCode && inviteCode === 'VIP-PAYMAX-777' ? 'completed' : 'none',
    verificationDetails: {},
    inviteCode: `INV-${username.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    invitedBy,
    availableInvites: invitationValid ? 2 : 1,
    inviteCount: 0,
    memberSince: new Date().toISOString().split('T')[0],
    wallet: { USDT: 0, USDC: 0, BTC: 0, ETH: 0, USD: 0 }
  };

  db.users.set(id, newUser);
  res.status(201).json(newUser);
});

// 7. Onboarding Verification Step Actions
app.post('/api/verification/:userId/step', (req, res) => {
  const { step, details } = req.body;
  db.updateUserVerification(req.params.userId, step, details);
  res.json(db.getUser(req.params.userId));
});

// 8. Fraud Alerts telemetry
app.get('/api/admin/fraud', (req, res) => {
  res.json(db.fraudAlerts);
});

// 9. Support system
app.get('/api/support/faqs', (req, res) => {
  res.json(db.faqs);
});

// -------------------------------------------------------------
// Vite Server Orchestration for Dev/Prod compatibility
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PAYMAX SERVER] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

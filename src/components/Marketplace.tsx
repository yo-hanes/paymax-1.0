import React, { useState } from 'react';
import { 
  Search, Shield, CheckCircle, Users, ArrowRight, Star, SlidersHorizontal,
  Coins, MessageCircle, AlertTriangle, Filter, Plus, Calendar, Loader2, Sparkles
} from 'lucide-react';
import { User, P2POffer } from '../types.js';

interface MarketplaceProps {
  user: User;
  offers: P2POffer[];
  onInitiateTrade: (tradeData: {
    offerId: string;
    buyerId: string;
    amountCrypto: string;
    amountFiat: string;
    paymentMethod: string;
  }) => Promise<void>;
  onPostOffer: (offerData: any) => Promise<void>;
}

export default function Marketplace({ user, offers, onInitiateTrade, onPostOffer }: MarketplaceProps) {
  // Navigation tabs
  const [marketType, setMarketType] = useState<'buy' | 'sell'>('sell'); // From user's perspective: Buy means buying from seller offers
  const [selectedCoin, setSelectedCoin] = useState<'USDT' | 'USDC' | 'BTC' | 'ETH'>('USDT');
  const [selectedPayment, setSelectedPayment] = useState<string>('All');
  const [onlyMerchants, setOnlyMerchants] = useState(false);
  const [filterAmount, setFilterAmount] = useState('');

  // Active Trade Initiator Modal State
  const [activeOffer, setActiveOffer] = useState<P2POffer | null>(null);
  const [fiatAmountInput, setFiatAmountInput] = useState('');
  const [tradePaymentMethod, setTradePaymentMethod] = useState('');
  const [submittingTrade, setSubmittingTrade] = useState(false);

  // New Custom Offer State (Merchant post helper)
  const [showPostOffer, setShowPostOffer] = useState(false);
  const [postCrypto, setPostCrypto] = useState<'USDT' | 'USDC' | 'BTC' | 'ETH'>('USDT');
  const [postFiat, setPostFiat] = useState('ETB');
  const [postPrice, setPostPrice] = useState('125.40');
  const [postMin, setPostMin] = useState('1000');
  const [postMax, setPostMax] = useState('100000');
  const [postAvailable, setPostAvailable] = useState('5000');
  const [postPayment, setPostPayment] = useState('Telebirr');
  const [postingOffer, setPostingOffer] = useState(false);

  // Filter listings
  const filteredOffers = offers.filter(o => {
    // Type mapping: if user wants to 'buy' (marketType='sell' since user buys from seller offer)
    const matchesType = marketType === 'buy' ? o.type === 'sell' : o.type === 'buy';
    const matchesCoin = o.crypto === selectedCoin;
    const matchesPayment = selectedPayment === 'All' ? true : o.paymentMethods.includes(selectedPayment);
    const matchesMerchant = onlyMerchants ? o.traderBadge : true;
    
    let matchesAmount = true;
    if (filterAmount) {
      const amt = parseFloat(filterAmount);
      if (!isNaN(amt)) {
        matchesAmount = amt >= o.minAmount && amt <= o.maxAmount;
      }
    }
    return matchesType && matchesCoin && matchesPayment && matchesMerchant && matchesAmount;
  });

  const handleOpenTradeModal = (offer: P2POffer) => {
    setActiveOffer(offer);
    setFiatAmountInput(String(offer.minAmount));
    setTradePaymentMethod(offer.paymentMethods[0]);
  };

  const handleCreateTrade = async () => {
    if (!activeOffer || !fiatAmountInput) return;
    setSubmittingTrade(true);
    try {
      const fiat = parseFloat(fiatAmountInput);
      const cryptoAmount = (fiat / activeOffer.price).toFixed(4);
      
      await onInitiateTrade({
        offerId: activeOffer.id,
        buyerId: user.id,
        amountCrypto: String(cryptoAmount),
        amountFiat: String(fiat),
        paymentMethod: tradePaymentMethod
      });

      setActiveOffer(null);
    } catch (err) {
      alert('Failed initiating escrow trade. Check console logs.');
    } finally {
      setSubmittingTrade(false);
    }
  };

  const handlePostOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostingOffer(true);
    try {
      await onPostOffer({
        traderId: user.id,
        type: marketType === 'buy' ? 'sell' : 'buy', // merchant perspective is inverted
        crypto: postCrypto,
        fiat: postFiat,
        paymentMethods: [postPayment],
        price: Number(postPrice),
        minAmount: Number(postMin),
        maxAmount: Number(postMax),
        available: Number(postAvailable)
      });
      setShowPostOffer(false);
    } catch (err) {
      alert('Error saving custom market liquidity.');
    } finally {
      setPostingOffer(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Search Filter Header Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Main Action Tabs: BUY or SELL */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-850/50 w-full md:w-auto">
            <button
              onClick={() => setMarketType('buy')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-display font-bold text-sm transition-all ${marketType === 'buy' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200'}`}
            >
              Buy Crypto
            </button>
            <button
              onClick={() => setMarketType('sell')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-display font-bold text-sm transition-all ${marketType === 'sell' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200'}`}
            >
              Sell Crypto
            </button>
          </div>

          {/* Quick Coin Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
            {(['USDT', 'USDC', 'BTC', 'ETH'] as const).map((coin) => (
              <button
                key={coin}
                onClick={() => setSelectedCoin(coin)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                  selectedCoin === coin 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-sm' 
                    : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {coin}
              </button>
            ))}
          </div>

          {/* Post Offer (Merchant helper button) */}
          <button
            onClick={() => setShowPostOffer(!showPostOffer)}
            className="px-4 py-2.5 rounded-xl border border-dashed border-emerald-500/30 text-emerald-500 text-xs font-bold hover:bg-emerald-500/5 transition-all flex items-center space-x-1 justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Post Liquid Offer</span>
          </button>
        </div>

        {/* Detailed filters bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-850/60">
          
          {/* Amount input */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold mb-1">Trade Amount (Fiat)</label>
            <div className="relative">
              <input 
                type="number" 
                value={filterAmount}
                onChange={(e) => setFilterAmount(e.target.value)}
                placeholder="e.g. 5000" 
                className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-850 dark:text-slate-100 focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">ETB</span>
            </div>
          </div>

          {/* Payment Method selector */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold mb-1">Payment Method</label>
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-850 dark:text-slate-100 focus:outline-none"
            >
              <option value="All">All Payments</option>
              <option value="Telebirr">Telebirr</option>
              <option value="CBE Birr">CBE Birr</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          {/* Merchant toggle */}
          <div className="flex items-center space-x-2 pt-5">
            <input 
              type="checkbox" 
              id="merchants-only" 
              checked={onlyMerchants}
              onChange={(e) => setOnlyMerchants(e.target.checked)}
              className="rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4 bg-slate-50 border-slate-200"
            />
            <label htmlFor="merchants-only" className="text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verified Merchants Only</span>
            </label>
          </div>

          <div className="text-right text-xs text-slate-400 dark:text-slate-500 flex items-center justify-end">
            <span>Showing <strong className="text-slate-700 dark:text-slate-300 font-bold">{filteredOffers.length}</strong> available escrow offers</span>
          </div>

        </div>

      </div>

      {/* Post Liquidity Form (If active) */}
      {showPostOffer && (
        <form onSubmit={handlePostOffer} className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <div className="md:col-span-3 border-b border-slate-200 dark:border-slate-800/80 pb-3 flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Post New Market Maker Liquidity (P2P Offer)
            </h3>
            <button type="button" onClick={() => setShowPostOffer(false)} className="text-xs text-slate-400 hover:underline">Cancel</button>
          </div>

          <div>
            <label className="block text-[11px] uppercase text-slate-400 font-bold mb-1">Asset &amp; Price</label>
            <div className="flex space-x-2">
              <select 
                value={postCrypto} 
                onChange={(e) => setPostCrypto(e.target.value as any)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300"
              >
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </select>
              <input 
                type="text" 
                value={postPrice}
                onChange={(e) => setPostPrice(e.target.value)}
                placeholder="Rate e.g. 125.40" 
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100"
              />
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Price in {postFiat} per 1 unit of token.</span>
          </div>

          <div>
            <label className="block text-[11px] uppercase text-slate-400 font-bold mb-1">Limits Range (Min / Max)</label>
            <div className="flex space-x-2">
              <input 
                type="text" 
                value={postMin}
                onChange={(e) => setPostMin(e.target.value)}
                placeholder="Min Fiat" 
                className="w-1/2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100"
              />
              <input 
                type="text" 
                value={postMax}
                onChange={(e) => setPostMax(e.target.value)}
                placeholder="Max Fiat" 
                className="w-1/2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase text-slate-400 font-bold mb-1">Available Escrow Collateral &amp; Payment</label>
            <div className="flex space-x-2">
              <input 
                type="text" 
                value={postAvailable}
                onChange={(e) => setPostAvailable(e.target.value)}
                placeholder="Liquidity e.g. 5000" 
                className="w-1/2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100"
              />
              <select
                value={postPayment}
                onChange={(e) => setPostPayment(e.target.value)}
                className="w-1/2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100"
              >
                <option value="Telebirr">Telebirr</option>
                <option value="CBE Birr">CBE Birr</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={postingOffer}
              className="px-6 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center space-x-1"
            >
              {postingOffer ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Publish Collateralized Listing</span>}
            </button>
          </div>
        </form>
      )}

      {/* Offers List Container */}
      <div className="space-y-4">
        {filteredOffers.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl text-slate-400">
            No matching liquidity pools found for {selectedCoin} utilizing {selectedPayment} payment methods.
          </div>
        ) : (
          filteredOffers.map((offer) => {
            return (
              <div 
                key={offer.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
              >
                
                {/* 1. Trader reputation info (4 columns) */}
                <div className="lg:col-span-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-display font-extrabold text-sm text-slate-850 dark:text-slate-50">{offer.traderName}</span>
                    {offer.traderBadge && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-0.5">
                        <CheckCircle className="w-2.5 h-2.5" /> Merchant
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span className="flex items-center text-emerald-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current mr-1" />
                      {offer.traderTrustScore.toFixed(1)} Trust
                    </span>
                    <span>•</span>
                    <span>99% Settlement Rate</span>
                  </div>

                  <span className="block text-[10px] text-slate-400">Avg release speed: <strong className="text-slate-600 dark:text-slate-300 font-bold">{offer.responseTime} mins</strong></span>
                </div>

                {/* 2. Volume and payments (5 columns) */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-mono">Available Balance</span>
                    <span className="block font-mono font-extrabold text-sm text-slate-800 dark:text-slate-200">
                      {offer.available.toLocaleString()} {offer.crypto}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Limits: {offer.minAmount.toLocaleString()} - {offer.maxAmount.toLocaleString()} {offer.fiat}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-mono">Supported Payments</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {offer.paymentMethods.map((method) => (
                        <span key={method} className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200/50 dark:border-slate-850">
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Price and primary action (3 columns) */}
                <div className="lg:col-span-3 text-left lg:text-right space-y-2">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-mono">P2P Exchange Rate</span>
                    <span className="block font-mono font-black text-lg text-slate-850 dark:text-slate-50">
                      {offer.price.toLocaleString(undefined, { minimumFractionDigits: 2 })} {offer.fiat}
                    </span>
                    <span className="block text-[9px] text-emerald-500 font-semibold font-mono">Peg: $1.00 USD</span>
                  </div>

                  <button
                    onClick={() => handleOpenTradeModal(offer)}
                    className={`w-full lg:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all ${marketType === 'buy' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
                  >
                    {marketType === 'buy' ? 'Buy USDT' : 'Sell USDT'}
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Trade Initiator Workspace Modal Drawer */}
      {activeOffer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-6 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="font-display font-extrabold text-lg text-slate-850 dark:text-slate-50 flex items-center gap-1.5">
                <Shield className="w-5 h-5 text-emerald-500" />
                Initialize Secure Escrow Contract
              </h3>
              <button onClick={() => setActiveOffer(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase">Proposer</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{activeOffer.traderName} (Trust: {activeOffer.traderTrustScore}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase">Rate Lock</span>
                  <span className="font-mono font-bold text-slate-850 dark:text-slate-50">{activeOffer.price} {activeOffer.fiat} / {activeOffer.crypto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase">Acceptable Range</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{activeOffer.minAmount} - {activeOffer.maxAmount} {activeOffer.fiat}</span>
                </div>
              </div>

              {/* Conversion inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold mb-1">Enter Fiat Spend (ETB)</label>
                  <input 
                    type="number" 
                    value={fiatAmountInput}
                    onChange={(e) => setFiatAmountInput(e.target.value)}
                    min={activeOffer.minAmount}
                    max={activeOffer.maxAmount}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-850 dark:text-slate-50 font-mono font-semibold"
                  />
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex justify-between items-center text-xs text-emerald-600">
                  <span>You will receive:</span>
                  <span className="font-mono font-extrabold text-sm">
                    {fiatAmountInput ? (parseFloat(fiatAmountInput) / activeOffer.price).toFixed(4) : '0.00'} {activeOffer.crypto}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 font-bold mb-1">Payment Channel</label>
                  <select
                    value={tradePaymentMethod}
                    onChange={(e) => setTradePaymentMethod(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-100"
                  >
                    {activeOffer.paymentMethods.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                🔒 <strong>100% Locked Escrow guarantee:</strong> Paymax has already locked {activeOffer.crypto} inside the smart escrow pool for this trade. The seller cannot withdraw funds until fiat release is resolved.
              </div>

              <button
                onClick={handleCreateTrade}
                disabled={submittingTrade || !fiatAmountInput}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold text-sm hover:from-emerald-600 hover:to-blue-600 transition-all flex justify-center items-center"
              >
                {submittingTrade ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm &amp; Lock Escrow Contracts</span>}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

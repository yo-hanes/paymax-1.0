import React, { useState } from 'react';
import { 
  Shield, CheckCircle, TrendingUp, Users, ArrowRight, Star, Plus, Minus,
  MessageCircle, AlertTriangle, Coins, Sparkles, Globe, Eye, Settings, 
  HelpCircle, LogOut, Search, UserCheck, Calendar, Info, Bell, Wallet, ExternalLink
} from 'lucide-react';
import { User, P2PTrade } from '../types.js';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onNavigate: (tab: 'marketplace' | 'trades' | 'help' | 'admin' | 'settings') => void;
  activeTab: string;
  onSelectTrade: (tradeId: string) => void;
  trades: P2PTrade[];
  onAddFunds: (asset: 'USDT' | 'USDC' | 'BTC' | 'ETH', amount: number) => void;
}

export default function Dashboard({ 
  user, 
  onLogout, 
  onNavigate, 
  activeTab, 
  onSelectTrade, 
  trades,
  onAddFunds 
}: DashboardProps) {
  const [depositAmount, setDepositAmount] = useState('500');
  const [depositAsset, setDepositAsset] = useState<'USDT' | 'USDC' | 'BTC' | 'ETH'>('USDT');
  const [depositSuccess, setDepositSuccess] = useState(false);

  // Filter active trades involving current user
  const userTrades = trades.filter(t => t.buyerId === user.id || t.sellerId === user.id);
  const activeTrades = userTrades.filter(t => ['pending_escrow', 'escrow_locked', 'payment_sent', 'disputed'].includes(t.status));

  const handleDeposit = () => {
    const val = parseFloat(depositAmount);
    if (!isNaN(val) && val > 0) {
      onAddFunds(depositAsset, val);
      setDepositSuccess(true);
      setTimeout(() => setDepositSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Banner Greetings */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-slate-850 dark:text-slate-50">
              Welcome back, {user.username}
            </h1>
            {user.verified && (
              <span className="inline-flex items-center space-x-1 bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verified Trader</span>
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Registered account: <span className="font-mono text-xs">{user.email}</span> • Session active
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-500 dark:text-slate-400">Escrow Core Connected</span>
          </div>

          <div className="px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-500 dark:text-slate-400">
            Account Type: <span className="font-bold text-slate-700 dark:text-slate-200 uppercase">{user.role}</span>
          </div>
        </div>
      </div>

      {/* Grid of Core Analytical Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Trust Score Gauge */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-mono tracking-widest font-bold">Trust Score Index</span>
            <Shield className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="3" fill="none" />
                <circle cx="28" cy="28" r="24" stroke="#10b981" strokeWidth="3" fill="none" strokeDasharray="150" strokeDashoffset={150 - (150 * user.trustScore) / 100} />
              </svg>
              <span className="text-xs font-mono font-extrabold text-slate-800 dark:text-slate-50">{user.trustScore.toFixed(1)}</span>
            </div>
            <div>
              <span className="block font-bold text-lg text-slate-800 dark:text-slate-50">Excellent</span>
              <span className="text-[11px] text-slate-400">Limits: Up to 500k ETB per Escrow</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total completed trades */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-mono tracking-widest font-bold">P2P Escrow Trades</span>
            <CheckCircle className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <span className="block text-3xl font-mono font-bold text-slate-850 dark:text-slate-50">{user.tradeCount}</span>
            <span className="text-[11px] text-slate-400 block mt-1">Completion rate: <span className="text-emerald-500 font-bold">{user.completionRate}%</span></span>
          </div>
        </div>

        {/* Card 3: Avg release time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-mono tracking-widest font-bold">Avg Settlement Speed</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <span className="block text-3xl font-mono font-bold text-slate-850 dark:text-slate-50">{user.avgResponseTime} min</span>
            <span className="text-[11px] text-slate-400 block mt-1">Top 5% speed in East Africa region</span>
          </div>
        </div>

        {/* Card 4: Invites summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-mono tracking-widest font-bold">Circle Invitations</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className="block text-3xl font-mono font-bold text-slate-850 dark:text-slate-50">{user.inviteCount} Users</span>
            <span className="text-[11px] text-slate-400 block mt-1">Invites remaining: <span className="text-amber-500 font-bold">{user.availableInvites} available</span></span>
          </div>
        </div>

      </div>

      {/* Main split: Wallet + Quick simulated deposit (Left) and Circle of Trust/Stats (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Wallet Manager Column (5 Columns) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-emerald-500" />
              <h2 className="font-display font-bold text-lg text-slate-850 dark:text-slate-50">Collateral Wallets</h2>
            </div>
            <span className="text-xs text-slate-400">Live Balance Sync</span>
          </div>

          <div className="space-y-4">
            
            {/* USDT Wallet */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  USDT
                </div>
                <div>
                  <span className="block font-semibold text-sm text-slate-800 dark:text-slate-200">Tether USD</span>
                  <span className="block text-[10px] text-slate-400 font-mono">TRC20 Network</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block font-mono font-bold text-base text-slate-850 dark:text-slate-50">{user.wallet.USDT.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT</span>
                <span className="block text-[10px] text-slate-400">${user.wallet.USDT.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* USDC Wallet */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  USDC
                </div>
                <div>
                  <span className="block font-semibold text-sm text-slate-800 dark:text-slate-200">USD Coin</span>
                  <span className="block text-[10px] text-slate-400 font-mono">ERC20 Network</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block font-mono font-bold text-base text-slate-850 dark:text-slate-50">{user.wallet.USDC.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC</span>
                <span className="block text-[10px] text-slate-400">${user.wallet.USDC.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* BTC Wallet */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  BTC
                </div>
                <div>
                  <span className="block font-semibold text-sm text-slate-800 dark:text-slate-200">Bitcoin</span>
                  <span className="block text-[10px] text-slate-400 font-mono">Native SegWit</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block font-mono font-bold text-base text-slate-850 dark:text-slate-50">{user.wallet.BTC.toFixed(5)} BTC</span>
                <span className="block text-[10px] text-slate-400">$(approx) {(user.wallet.BTC * 91420).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

          </div>

          {/* Quick Simulated Token Faucet so users can play easily */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
            <span className="block text-xs uppercase font-mono tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Simulated Faucet
            </span>
            
            <p className="text-[11px] text-slate-400">
              Need crypto collateral to test selling or buying? Request instant tokens to mock up escrow trades.
            </p>

            <div className="flex space-x-2">
              <select 
                value={depositAsset} 
                onChange={(e) => setDepositAsset(e.target.value as any)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none text-slate-700 dark:text-slate-300"
              >
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </select>

              <input 
                type="number" 
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none text-slate-850 dark:text-slate-50"
              />

              <button
                onClick={handleDeposit}
                className="px-4 bg-emerald-500 text-white font-semibold text-xs rounded-xl hover:bg-emerald-600 transition-all shadow"
              >
                Mint
              </button>
            </div>

            {depositSuccess && (
              <span className="block text-[10px] text-emerald-500 font-medium text-center">✓ Faucet credited successfully to active wallet.</span>
            )}
          </div>

        </div>

        {/* Circle of Trust Visualizer (7 Columns) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <h2 className="font-display font-bold text-lg text-slate-850 dark:text-slate-50">Circle of Trust Graph</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Your invitation tree. Malicious referrals calibrate your trust points.</p>
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2.5 py-0.5 rounded-full font-bold">Stable Circle</span>
          </div>

          {/* Visual invitation tree node diagram */}
          <div className="relative bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-100 dark:border-slate-850 p-6 h-52 flex items-center justify-center overflow-hidden">
            <svg className="absolute inset-0 w-full h-full stroke-slate-200 dark:stroke-slate-800 fill-none stroke-2">
              <line x1="50%" y1="20%" x2="50%" y2="50%" />
              <line x1="50%" y1="50%" x2="25%" y2="80%" />
              <line x1="50%" y1="50%" x2="75%" y2="80%" />
            </svg>

            {/* Parent Inviter Node */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
              <div className="px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-500 text-[10px] font-mono font-semibold">
                Invited by: {user.invitedBy || 'Admin Account'}
              </div>
            </div>

            {/* Center Node (Current user) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 z-10">
                <span className="font-display font-extrabold text-white text-sm">YOU</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block mt-1">Trust Score: {user.trustScore.toFixed(0)}</span>
            </div>

            {/* Invited children nodes (Mocked invitations) */}
            <div className="absolute bottom-4 left-[15%] text-center">
              <div className="w-9 h-9 rounded-full border border-emerald-400 bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                <span className="text-[9px] font-bold">SAM</span>
              </div>
              <span className="text-[9px] text-emerald-500 block font-mono mt-1">Active • 99.1</span>
            </div>

            <div className="absolute bottom-4 right-[15%] text-center">
              <div className="w-9 h-9 rounded-full border border-slate-300 bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                <span className="text-[9px] font-bold">+</span>
              </div>
              <span className="text-[9px] text-slate-400 block mt-1">Open Slot</span>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-600 space-y-1">
            <span className="font-semibold block">⚠️ Invite Responsibly:</span>
            <span>Every invitee's dispute rate mathematically maps to your Trust Score. If a user you invite gets suspended for fraudulent Telebirr confirmation uploads, your Trust Score drops by -12.5 points immediately.</span>
          </div>

        </div>

      </div>

      {/* Active trades section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <h2 className="font-display font-bold text-lg text-slate-850 dark:text-slate-50">Pending Escrow Engagements</h2>
          </div>
          <span className="text-xs bg-blue-500/10 text-blue-500 px-2.5 py-0.5 rounded-full font-bold font-mono">{activeTrades.length} Active</span>
        </div>

        {activeTrades.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-100 dark:border-slate-850 rounded-2xl">
            No active trades pending verification. Ready to buy or sell stablecoins?
            <button 
              onClick={() => onNavigate('marketplace')}
              className="mt-3 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold text-xs rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center space-x-2 mx-auto"
            >
              <span>Explore P2P Offers</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Trade ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Counterparty</th>
                  <th className="py-3 px-4">Asset &amp; Amount</th>
                  <th className="py-3 px-4">Fiat Volume</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeTrades.map((t) => {
                  const isBuyer = t.buyerId === user.id;
                  return (
                    <tr key={t.id} className="border-b border-slate-50 dark:border-slate-850/60 hover:bg-slate-50 dark:hover:bg-slate-850/30 transition-all font-medium">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-300">{t.id}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${isBuyer ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {isBuyer ? 'BUYING' : 'SELLING'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200">{isBuyer ? t.sellerName : t.buyerName}</td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200">{t.amountCrypto} {t.crypto}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">{parseFloat(t.amountFiat).toLocaleString()} {t.fiatCurrency}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'escrow_locked' ? 'bg-blue-500/10 text-blue-500' :
                          t.status === 'payment_sent' ? 'bg-purple-500/10 text-purple-500' :
                          t.status === 'disputed' ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {t.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            onNavigate('trades');
                            onSelectTrade(t.id);
                          }}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition-all"
                        >
                          Open Workspace
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

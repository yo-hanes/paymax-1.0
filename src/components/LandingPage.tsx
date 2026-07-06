import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, CheckCircle, TrendingUp, Users, ArrowRight, Star, 
  HelpCircle, MessageCircle, AlertTriangle, Coins, Sparkles,Globe, Play, Lock, FileText, ChevronDown, Award
} from 'lucide-react';
import { useTheme } from './ThemeContext.tsx';
import { CryptoAsset, FAQ } from '../types.js';

interface LandingPageProps {
  onJoin: (inviteCode?: string) => void;
  onSelectAccount: (userId: string) => void;
  marketData: CryptoAsset[];
  faqs: FAQ[];
}

export default function LandingPage({ onJoin, onSelectAccount, marketData, faqs }: LandingPageProps) {
  const { theme, toggleTheme } = useTheme();
  const [activeFaq, setActiveFaq] = useState<string | null>(null);
  const [customInviteCode, setCustomInviteCode] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'general' | 'verification' | 'escrow' | 'payment'>('all');
  const [marketTab, setMarketTab] = useState<'all' | 'trending' | 'stablecoins'>('all');

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(f => f.category === selectedCategory);

  const filteredCoins = marketData.filter(coin => {
    if (marketTab === 'trending') return coin.change24h > 0;
    if (marketTab === 'stablecoins') return coin.symbol.includes('USD');
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Dynamic Animated Particles / Node Mesh Banner */}
      <div className="absolute top-0 left-0 w-full h-[640px] pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-75">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] animate-pulse delay-2000"></div>
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full border-x border-dashed border-slate-200 dark:border-slate-800/60"></div>
      </div>

      {/* Header Bar */}
      <header className="sticky top-0 z-50 glass-effect border-b border-slate-200/60 dark:border-slate-800/50 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white font-display font-bold text-xl tracking-tight">P</span>
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-wider text-slate-800 dark:text-slate-50">PAYMAX</span>
              <span className="block text-[9px] text-emerald-500 font-mono font-medium tracking-widest leading-none">TRUST PLATFORM</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#how-it-works" className="hover:text-emerald-500 transition-colors">How It Works</a>
            <a href="#market" className="hover:text-emerald-500 transition-colors">Crypto Markets</a>
            <a href="#about" className="hover:text-emerald-500 transition-colors">Mission &amp; Values</a>
            <a href="#faq" className="hover:text-emerald-500 transition-colors">Help Center</a>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Demo Access Switchers */}
            <div className="hidden lg:flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-1 text-xs">
              <span className="px-2 text-slate-400 font-medium">Quick Login:</span>
              <button 
                onClick={() => onSelectAccount('trader_abebe')}
                className="px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all font-medium"
              >
                Abebe (User)
              </button>
              <button 
                onClick={() => onSelectAccount('merchant_telebirr')}
                className="px-2.5 py-1 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all font-medium border border-emerald-500/10"
              >
                Telebirr Merchant
              </button>
              <button 
                onClick={() => onSelectAccount('admin_1')}
                className="px-2.5 py-1 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all font-medium border border-blue-500/10"
              >
                Admin Panel
              </button>
            </div>

            {/* Dark / Light Toggle */}
            <button
              id="theme-toggle-button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 transition-all shadow-sm"
              title="Switch Visual Theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <button 
              id="header-cta-button"
              onClick={() => onJoin()}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Invite-First Peer-to-Peer Trading</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-slate-50">
              Trade Digital Assets Safely. <br className="hidden sm:inline" />
              <span className="text-gradient">Trade with Verified People,</span> Not Strangers.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              Paymax eliminates peer-to-peer trading scams through mandatory compliance, smart escrow accounts, and reputation ledger metrics. Trade secure stablecoins directly with trusted neighbors and approved professional merchants.
            </p>

            <div className="pt-2">
              <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/85 p-2 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none max-w-md flex flex-col sm:flex-row gap-2">
                <input 
                  type="text" 
                  value={customInviteCode}
                  onChange={(e) => setCustomInviteCode(e.target.value)}
                  placeholder="Paste Invitation Code (Optional)" 
                  className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-sm focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 text-slate-800 dark:text-slate-200 flex-1"
                />
                <button
                  onClick={() => onJoin(customInviteCode)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/10"
                >
                  Join Market <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 ml-2">
                No invitation? No problem. Complete the manual verification track to activate your trading credentials.
              </p>
            </div>

            {/* Micro proof badges */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800/50 max-w-lg">
              <div>
                <span className="block text-2xl sm:text-3xl font-display font-bold text-slate-800 dark:text-slate-50">100%</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">Collateralized Escrow</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-display font-bold text-slate-800 dark:text-slate-50">&lt; 3 Min</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">Avg Settlement Time</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-display font-bold text-slate-800 dark:text-slate-50">Zero</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">Unresolved Scams</span>
              </div>
            </div>

          </div>

          {/* Connected Network Node Animation Simulator Box */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-[400px] h-[380px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 rounded-3xl p-6 shadow-2xl shadow-slate-200 dark:shadow-none overflow-hidden">
              <div className="absolute inset-0 bg-gradient-mesh opacity-60"></div>
              
              <div className="relative h-full flex flex-col justify-between z-10">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">Verified Circle Network</span>
                  </div>
                  <Globe className="w-4 h-4 text-slate-400 dark:text-slate-500 animate-spin" style={{ animationDuration: '20s' }} />
                </div>

                {/* Simulated Network Graph Layer */}
                <div className="relative flex-1 flex items-center justify-center my-4">
                  {/* Glowing Lines in Background */}
                  <svg className="absolute inset-0 w-full h-full stroke-emerald-500/15 dark:stroke-emerald-400/20 fill-none stroke-1">
                    <line x1="50%" y1="20%" x2="20%" y2="50%" />
                    <line x1="50%" y1="20%" x2="80%" y2="50%" />
                    <line x1="20%" y1="50%" x2="50%" y2="80%" />
                    <line x1="80%" y1="50%" x2="50%" y2="80%" />
                    <line x1="50%" y1="20%" x2="50%" y2="80%" />
                    <line x1="20%" y1="50%" x2="80%" y2="50%" />
                  </svg>

                  {/* Centered App Icon Node */}
                  <div className="absolute w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 z-20 scale-100 hover:scale-110 transition-transform">
                    <Shield className="w-8 h-8 text-white" />
                  </div>

                  {/* Neighbor Trust Nodes */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
                    <div className="w-12 h-12 rounded-full border-2 border-emerald-500 bg-white dark:bg-slate-900 flex items-center justify-center shadow-md">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">CBE</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-md font-mono mt-1 inline-block">99.1%</span>
                  </div>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                    <div className="w-12 h-12 rounded-full border-2 border-blue-500 bg-white dark:bg-slate-900 flex items-center justify-center shadow-md">
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-100">Telebirr</span>
                    </div>
                    <span className="text-[10px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded-md font-mono mt-1 inline-block">98.7%</span>
                  </div>

                  <div className="absolute left-2 top-1/2 -translate-y-1/2 text-center">
                    <div className="w-10 h-10 rounded-full border-2 border-emerald-400 bg-white dark:bg-slate-900 flex items-center justify-center shadow-md">
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-100">Abebe</span>
                    </div>
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono mt-1 inline-block">94.2</span>
                  </div>

                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-center">
                    <div className="w-10 h-10 rounded-full border-2 border-purple-500 bg-white dark:bg-slate-900 flex items-center justify-center shadow-md">
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-100">Chaltu</span>
                    </div>
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono mt-1 inline-block">89.5</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl text-center border border-slate-100 dark:border-slate-850">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Identity-Linked Escrow:</span> Assets remain protected until both entities complete verified transaction compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Trust Ledger Problem & Solution Section */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-slate-900/40 border-y border-slate-200/50 dark:border-slate-850/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs uppercase font-mono tracking-widest text-emerald-500 font-bold">Why Paymax Exists</h2>
            <p className="text-3xl sm:text-4xl font-display font-bold text-slate-900 dark:text-slate-50">
              The Peer-to-Peer Trading Problem, Solved.
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Traditional peer-to-peer digital asset markets are riddled with chargeback frauds, fake screenshots, and bad actors. Paymax enforces architectural trust to create a clean environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step / Pillar 1 */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-8 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-lg border border-red-500/20">
                01
              </div>
              <h3 className="font-display font-semibold text-xl text-slate-800 dark:text-slate-50">Identity Verification</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Strangers cannot access the order books. Every client undergoes OTP phone binding, government document validation, and camera selfie liveness detection to acquire their Verified badge.
              </p>
            </div>

            {/* Step / Pillar 2 */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-8 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-lg border border-blue-500/20">
                02
              </div>
              <h3 className="font-display font-semibold text-xl text-slate-800 dark:text-slate-50">Collateralized Escrow</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Fake or phantom listings are impossible. Sellers must deposit the full cryptocurrency amount into our secure, audited escrow contracts before buy/sell posts become searchable in the market.
              </p>
            </div>

            {/* Step / Pillar 3 */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-8 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg border border-emerald-500/20">
                03
              </div>
              <h3 className="font-display font-semibold text-xl text-slate-800 dark:text-slate-50">Smart payment Parsing</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                No more fake screenshot battles. Paste the raw bank/mobile confirmation SMS (Telebirr/CBE) directly. Our parsed intelligence extracts dates, unique references, and recipient data to calculate absolute verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Crypto Market Live Section */}
      <section id="market" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
          <div className="space-y-2">
            <h2 className="text-xs uppercase font-mono tracking-widest text-emerald-500 font-bold">Real-time Rates</h2>
            <p className="text-3xl font-display font-bold text-slate-800 dark:text-slate-50">Crypto Market Pulse</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Pre-trade market analysis. Live quotes directly matching peer-to-peer liquidity indexes.</p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <button 
              onClick={() => setMarketTab('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${marketTab === 'all' ? 'bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              All Assets
            </button>
            <button 
              onClick={() => setMarketTab('trending')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${marketTab === 'trending' ? 'bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              Trending Gainers
            </button>
            <button 
              onClick={() => setMarketTab('stablecoins')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${marketTab === 'stablecoins' ? 'bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              Stablecoins
            </button>
          </div>
        </div>

        {/* Live Coins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCoins.map((asset) => {
            const isGaining = asset.change24h >= 0;
            return (
              <div 
                key={asset.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-950 flex items-center justify-center font-display font-bold text-emerald-500">
                      {asset.symbol}
                    </div>
                    <div>
                      <span className="block font-semibold text-slate-800 dark:text-slate-100 text-sm">{asset.name}</span>
                      <span className="block text-[10px] text-slate-400 uppercase font-mono">{asset.symbol}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-mono font-medium ${isGaining ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'}`}>
                    {isGaining ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </span>
                </div>

                <div className="my-5">
                  <span className="block text-2xl font-mono font-bold text-slate-800 dark:text-slate-100">
                    ${asset.price >= 1 ? asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : asset.price.toFixed(4)}
                  </span>
                  <span className="text-[10px] text-slate-400">Vol: ${(asset.volume24h / 1000000000).toFixed(1)}B</span>
                </div>

                {/* Sparkling SVG Sparkline Mini Chart */}
                <div className="h-10 w-full mt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={`grad-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isGaining ? '#10b981' : '#ef4444'} stopOpacity="0.2"/>
                        <stop offset="100%" stopColor={isGaining ? '#10b981' : '#ef4444'} stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path
                      d={`M ${asset.sparkline.map((val, idx) => {
                        const min = Math.min(...asset.sparkline);
                        const max = Math.max(...asset.sparkline);
                        const range = max - min || 1;
                        const x = (idx / (asset.sparkline.length - 1)) * 100;
                        const y = 40 - ((val - min) / range) * 35 - 2;
                        return `${x} ${y}`;
                      }).join(' L ')}`}
                      className={`fill-none stroke-2 ${isGaining ? 'stroke-emerald-500' : 'stroke-red-500'}`}
                    />
                    <path
                      d={`M 0 40 L ${asset.sparkline.map((val, idx) => {
                        const min = Math.min(...asset.sparkline);
                        const max = Math.max(...asset.sparkline);
                        const range = max - min || 1;
                        const x = (idx / (asset.sparkline.length - 1)) * 100;
                        const y = 40 - ((val - min) / range) * 35 - 2;
                        return `${x} ${y}`;
                      }).join(' L ')} L 100 40 Z`}
                      fill={`url(#grad-${asset.id})`}
                    />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Corporate Mission & Visual Story Section */}
      <section id="about" className="py-20 bg-slate-100 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold uppercase">
                <Award className="w-3.5 h-3.5" />
                <span>Our Philosophy</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-850 dark:text-slate-100 leading-tight">
                Peer-to-Peer Trading is Built on Identity, Not Anonymity.
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Paymax was founded by a coalition of fintech builders who witnessed the rising waves of escrow manipulation in East Africa and South America. We realized that anonymity is the scammer's primary asset. By introducing controlled community growth, we reconnect buyers with verifiably compliant counterparties.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center mt-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">Social Trust Score Integration</span>
                    <span className="block text-xs text-slate-400">Your network reputation influences your trade limits and response rankings.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center mt-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">Smart Invitation Mapping (Circle of Trust)</span>
                    <span className="block text-xs text-slate-400">Inviting malicious actors triggers downward calibration for the inviter, encouraging responsible policing.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center mt-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">Zero Trust AI Arbitration</span>
                    <span className="block text-xs text-slate-400">Disputes are resolved scientifically with automated SMS verification matched directly to actual blockchain ledger records.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated UI Mockup Displaying visual trust cards */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850/80 rounded-3xl p-6 shadow-xl space-y-4">
              <span className="block text-xs uppercase font-mono tracking-widest text-slate-400 font-bold mb-2">Live Trust Score Simulation</span>
              
              <div className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  {/* Custom SVG dial */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="4" fill="none" />
                    <circle cx="32" cy="32" r="28" stroke="#10b981" strokeWidth="4" fill="none" strokeDasharray="175" strokeDashoffset="15" />
                  </svg>
                  <span className="absolute text-sm font-mono font-bold">99.1</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-display font-bold text-slate-850 dark:text-slate-50 text-base">CBE_Traders_PLC</span>
                    <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold">PREMIUM MERCHANT</span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-0.5">Invited by: Admin Account (Chain verified)</span>
                  <span className="text-[10px] text-emerald-500 block font-mono mt-1">● Active now • Avg release time: 2.5 mins</span>
                </div>
              </div>

              {/* Verified Badge Demonstration card */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-100 dark:border-slate-850 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 text-center">
                  <span className="block text-slate-400 text-xs uppercase font-mono tracking-wider">Trading Escrow Limit</span>
                  <span className="block text-xl font-mono font-bold text-slate-850 dark:text-slate-50 mt-1">500K ETB</span>
                  <span className="text-[10px] text-emerald-500 block mt-1">Level 3 Verification Tier</span>
                </div>
                <div className="border border-slate-100 dark:border-slate-850 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 text-center">
                  <span className="block text-slate-400 text-xs uppercase font-mono tracking-wider">Disputes Opened</span>
                  <span className="block text-xl font-mono font-bold text-red-500 mt-1">0/890</span>
                  <span className="text-[10px] text-slate-400 block mt-1">100% resolution success</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-xs uppercase font-mono tracking-widest text-emerald-500 font-bold">FAQ</h2>
          <p className="text-3xl font-display font-bold text-slate-850 dark:text-slate-50">Have questions about safety?</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Everything you need to understand regarding peer-to-peer escrow operations.</p>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {(['all', 'general', 'verification', 'escrow', 'payment'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                  selectedCategory === cat 
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
                    : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq) => {
            const isOpen = activeFaq === faq.id;
            return (
              <div 
                key={faq.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                  className="w-full text-left p-5 flex items-center justify-between text-slate-800 dark:text-slate-100 font-semibold text-sm sm:text-base focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-slate-500 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-850/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Landing Page Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">P</span>
              </div>
              <span className="font-display font-bold text-lg text-white tracking-widest">PAYMAX</span>
            </div>
            <p className="text-xs leading-relaxed">
              Paymax is a smart identity-driven compliance architecture protecting peer-to-peer digital trade networks globally. Registered as an escrow facilitator.
            </p>
          </div>

          <div>
            <h4 className="text-white text-xs uppercase font-mono tracking-wider font-bold mb-4">Market Core</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#market" className="hover:text-emerald-400 transition-colors">USDT Price List</a></li>
              <li><a href="#market" className="hover:text-emerald-400 transition-colors">Bitcoin Liquidity Chart</a></li>
              <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">Circle Onboarding Protocol</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs uppercase font-mono tracking-wider font-bold mb-4">Security Center</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">Smart SMS Parser</a></li>
              <li><a href="#about" className="hover:text-emerald-400 transition-colors">Reputation Calculations</a></li>
              <li><span className="text-slate-500 cursor-not-allowed">2FA Device Guard</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs uppercase font-mono tracking-wider font-bold mb-4">Compliances</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-500">P2P Escrow Facilitator license #81729</span></li>
              <li><span className="text-slate-500">KYC/AML Compliant</span></li>
              <li><span className="text-slate-500">GDPR &amp; ISO 27001 standard practices</span></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <span>&copy; {new Date().getFullYear()} Paymax Ltd. All rights registered.</span>
          <div className="flex space-x-6">
            <span className="text-slate-500">Privacy Policy</span>
            <span className="text-slate-500">Terms of Use</span>
            <span className="text-slate-500">Developer API (Future)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

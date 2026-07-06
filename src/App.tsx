import React, { useState, useEffect } from 'react';
import { 
  Shield, CheckCircle, TrendingUp, Users, ArrowRight, Star, 
  HelpCircle, MessageCircle, AlertTriangle, Coins, Sparkles, Globe,
  LogOut, LayoutDashboard, Search, Settings, ShieldAlert, Heart, Info, Menu, X, ArrowUpRight
} from 'lucide-react';
import { useTheme } from './components/ThemeContext.tsx';
import LandingPage from './components/LandingPage.tsx';
import AuthOnboarding from './components/AuthOnboarding.tsx';
import Dashboard from './components/Dashboard.tsx';
import Marketplace from './components/Marketplace.tsx';
import EscrowWorkspace from './components/EscrowWorkspace.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import { User, P2POffer, P2PTrade, CryptoAsset, FAQ } from './types.js';

export default function App() {
  const { theme, toggleTheme } = useTheme();

  // Authentication & session state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [onboardingActive, setOnboardingActive] = useState(false);

  // Core database replicas in state
  const [marketData, setMarketData] = useState<CryptoAsset[]>([]);
  const [offers, setOffers] = useState<P2POffer[]>([]);
  const [trades, setTrades] = useState<P2PTrade[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  // Navigation tab in authenticated dashboard workspace
  const [activeTab, setActiveTab] = useState<'dashboard' | 'marketplace' | 'trades' | 'help' | 'admin' | 'settings'>('dashboard');
  const [selectedTradeId, setSelectedTradeId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search in FAQs
  const [faqSearchQuery, setFaqSearchQuery] = useState('');

  // 1. Fetch initial states
  const fetchData = async () => {
    try {
      const [marketRes, offersRes, tradesRes, faqRes] = await Promise.all([
        fetch('/api/market'),
        fetch('/api/p2p/offers'),
        fetch('/api/p2p/trades'),
        fetch('/api/support/faqs')
      ]);

      if (marketRes.ok) setMarketData(await marketRes.json());
      if (offersRes.ok) setOffers(await offersRes.json());
      if (tradesRes.ok) setTrades(await tradesRes.json());
      if (faqRes.ok) setFaqs(await faqRes.json());
    } catch (err) {
      console.error('Failure retrieving server data models.', err);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh prices and order blocks periodically
    const timer = setInterval(fetchData, 8000);
    return () => clearInterval(timer);
  }, []);

  // Sync profile details if logged in
  const syncProfile = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`);
      if (res.ok) {
        setCurrentUser(await res.json());
      }
    } catch (err) {
      console.error('Failed refreshing profile.');
    }
  };

  // Quick Demo account selector from Landing page
  const handleSelectDemoAccount = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
        setOnboardingActive(false);
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error('Demo account activation failure.');
    }
  };

  // Post trade initiator
  const handleInitiateTrade = async (tradeData: {
    offerId: string;
    buyerId: string;
    amountCrypto: string;
    amountFiat: string;
    paymentMethod: string;
  }) => {
    try {
      const res = await fetch('/api/p2p/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeData)
      });
      if (!res.ok) throw new Error('Escrow locking failed.');
      const newTrade = await res.json();
      
      // Update local states
      setTrades(prev => [newTrade, ...prev]);
      setSelectedTradeId(newTrade.id);
      setActiveTab('trades');
      
      if (currentUser) syncProfile(currentUser.id);
    } catch (err) {
      console.error('Failed initiating transaction.', err);
      throw err;
    }
  };

  // Post new liquidity offer (merchant capability)
  const handlePostOffer = async (offerData: any) => {
    try {
      const res = await fetch('/api/p2p/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData)
      });
      if (!res.ok) throw new Error('Failed publishing offer.');
      const newOffer = await res.json();
      setOffers(prev => [newOffer, ...prev]);
      
      if (currentUser) syncProfile(currentUser.id);
    } catch (err) {
      console.error('Error saving custom liquidity.', err);
      throw err;
    }
  };

  // Update Escrow Trade Status
  const handleUpdateTradeStatus = async (tradeId: string, status: P2PTrade['status'], extra?: Partial<P2PTrade>) => {
    try {
      const res = await fetch(`/api/p2p/trades/${tradeId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, extra })
      });
      if (res.ok) {
        const updated = await res.json();
        setTrades(prev => prev.map(t => t.id === tradeId ? updated : t));
        if (currentUser) syncProfile(currentUser.id);
      }
    } catch (err) {
      console.error('Status transition failure.', err);
    }
  };

  // Faucet deposit helper
  const handleAddFaucetFunds = async (asset: 'USDT' | 'USDC' | 'BTC' | 'ETH', amount: number) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/users/${currentUser.id}/wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset, amount })
      });
      if (res.ok) {
        setCurrentUser(await res.json());
      }
    } catch (err) {
      console.error('Wallet faucet request failed.');
    }
  };

  // Admin Dispute Settle Action
  const handleAdminResolveDispute = async (tradeId: string, resolution: 'released' | 'cancelled') => {
    await handleUpdateTradeStatus(tradeId, resolution);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setOnboardingActive(false);
    setActiveTab('dashboard');
  };

  // FAQ Filtering
  const filteredFaqs = faqSearchQuery.trim() === ''
    ? faqs
    : faqs.filter(f => f.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) || f.answer.toLowerCase().includes(faqSearchQuery.toLowerCase()));

  // -------------------------------------------------------------
  // Router Conditional Rendering
  // -------------------------------------------------------------

  // If user is not authenticated and onboarding is not active, render landing page
  if (!currentUser && !onboardingActive) {
    return (
      <LandingPage 
        onJoin={(inviteCode) => {
          setOnboardingActive(true);
        }}
        onSelectAccount={handleSelectDemoAccount}
        marketData={marketData}
        faqs={faqs}
      />
    );
  }

  // If onboarding registration/wizard is active
  if (onboardingActive) {
    return (
      <AuthOnboarding 
        onOnboardingComplete={(user) => {
          setCurrentUser(user);
          setOnboardingActive(false);
          setActiveTab('dashboard');
        }}
        onBackToLanding={() => setOnboardingActive(false)}
      />
    );
  }

  // Otherwise, user is logged in, show authenticated system layout with sidebars
  const activeTrade = trades.find(t => t.id === selectedTradeId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-300">
      
      {/* Collapsible/Responsive Sidebar Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-850 p-5 transform transition-transform duration-300 md:translate-x-0 md:relative flex flex-col justify-between ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="space-y-6">
          {/* Logo Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-display font-black text-base">P</span>
              </div>
              <div>
                <span className="font-display font-extrabold text-sm tracking-wider">PAYMAX</span>
                <span className="block text-[8px] text-emerald-500 font-mono font-medium tracking-widest leading-none">TRUST PLATFORM</span>
              </div>
            </div>
            
            {/* Close sidebar button on mobile */}
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick User summary */}
          {currentUser && (
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850 rounded-2xl p-3 text-xs flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                {currentUser.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <span className="block font-bold text-slate-800 dark:text-slate-100 truncate">{currentUser.username}</span>
                <span className="block text-[10px] text-emerald-500 font-medium truncate flex items-center gap-0.5">
                  🛡️ Score: {currentUser.trustScore.toFixed(0)}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-850 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850/60'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Main Dashboard</span>
            </button>

            <button
              onClick={() => { setActiveTab('marketplace'); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'marketplace' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-850 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850/60'}`}
            >
              <Coins className="w-4 h-4" />
              <span>Browse P2P Market</span>
            </button>

            <button
              onClick={() => { setActiveTab('trades'); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'trades' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-850 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850/60'}`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>P2P Escrow Trades</span>
            </button>

            {/* Admin tab (Render only if user is admin) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => { setActiveTab('admin'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'admin' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-500/80 hover:bg-blue-500/5'}`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Facilitation</span>
              </button>
            )}

            <button
              onClick={() => { setActiveTab('help'); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'help' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-850 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850/60'}`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help &amp; Compliances</span>
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeTab === 'settings' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-850 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850/60'}`}
            >
              <Settings className="w-4 h-4" />
              <span>Security Panel</span>
            </button>
          </nav>
        </div>

        <div className="space-y-4">
          {/* Quick theme toggler in rail */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-4">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">Switch Theme</span>
            <button 
              onClick={toggleTheme} 
              className="text-xs bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 p-1.5 rounded-lg border border-slate-200 dark:border-slate-850/80"
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Workspace</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header navbar */}
        <header className="sticky top-0 z-30 glass-effect border-b border-slate-200/60 dark:border-slate-800/50 p-4 flex items-center justify-between md:justify-end">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-400 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            {/* Quick Demo Access Bar when inside */}
            <div className="hidden sm:flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800/80 text-[11px] items-center space-x-2">
              <span className="text-slate-400 font-medium px-1">Role swap:</span>
              <button onClick={() => handleSelectDemoAccount('trader_abebe')} className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded font-medium">Abebe</button>
              <button onClick={() => handleSelectDemoAccount('merchant_telebirr')} className="px-2 py-1 text-emerald-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded font-bold border border-emerald-500/10">Merchant</button>
              <button onClick={() => handleSelectDemoAccount('admin_1')} className="px-2 py-1 text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded font-bold border border-blue-500/10">Admin</button>
            </div>

            {/* Simulated Live Block sync indicator */}
            <div className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>LEDGER STABLE</span>
            </div>
          </div>
        </header>

        {/* Dynamic page tab workspace container */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto pb-24">
          
          {activeTab === 'dashboard' && currentUser && (
            <Dashboard 
              user={currentUser}
              onLogout={handleLogout}
              onNavigate={(tab) => {
                setActiveTab(tab);
                if (tab === 'trades' && trades.length > 0) {
                  setSelectedTradeId(trades[0].id);
                }
              }}
              activeTab={activeTab}
              onSelectTrade={(id) => {
                setSelectedTradeId(id);
                setActiveTab('trades');
              }}
              trades={trades}
              onAddFunds={handleAddFaucetFunds}
            />
          )}

          {activeTab === 'marketplace' && currentUser && (
            <Marketplace 
              user={currentUser}
              offers={offers}
              onInitiateTrade={handleInitiateTrade}
              onPostOffer={handlePostOffer}
            />
          )}

          {activeTab === 'trades' && currentUser && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Trade select index panel (4 Columns) */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-4">
                <span className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold block">Trade History / Queue</span>
                
                <div className="space-y-2">
                  {trades.filter(t => t.buyerId === currentUser.id || t.sellerId === currentUser.id).length === 0 ? (
                    <span className="block text-xs text-slate-400 text-center py-6">You have no trade contracts initiated yet.</span>
                  ) : (
                    trades.filter(t => t.buyerId === currentUser.id || t.sellerId === currentUser.id).map(t => {
                      const isSelected = t.id === selectedTradeId;
                      const isBuyer = t.buyerId === currentUser.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTradeId(t.id)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all flex justify-between items-center ${
                            isSelected 
                              ? 'bg-slate-50 dark:bg-slate-950 border-emerald-500/50 shadow-sm' 
                              : 'bg-transparent border-slate-200/50 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-850/40'
                          }`}
                        >
                          <div>
                            <span className="block font-mono font-bold text-xs text-slate-700 dark:text-slate-300">{t.id}</span>
                            <span className="block text-[11px] text-slate-400 mt-0.5">Counterparty: {isBuyer ? t.sellerName : t.buyerName}</span>
                          </div>
                          <div className="text-right">
                            <span className="block font-mono font-bold text-xs">{parseFloat(t.amountFiat).toLocaleString()} {t.fiatCurrency}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold inline-block mt-0.5 ${
                              t.status === 'released' ? 'bg-emerald-500/10 text-emerald-500' :
                              t.status === 'disputed' ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-blue-500/10 text-blue-500'
                            }`}>
                              {t.status.replace('_', ' ')}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Active trade workspace (8 Columns) */}
              <div className="lg:col-span-8">
                {activeTrade ? (
                  <EscrowWorkspace 
                    user={currentUser}
                    trade={activeTrade}
                    onUpdateTradeStatus={handleUpdateTradeStatus}
                  />
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-12 text-center text-slate-400">
                    Select any trade contract from the history queue to open the active Escrow &amp; SMS Payment Verification workspace.
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === 'admin' && currentUser?.role === 'admin' && (
            <AdminPanel 
              onResolveDispute={handleAdminResolveDispute}
              trades={trades}
            />
          )}

          {activeTab === 'help' && (
            <div className="space-y-8">
              
              {/* Help Center Header */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 space-y-4 max-w-2xl">
                  <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">How can we help protect your trades today?</h1>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Search our intelligent knowledge base for guide metrics on the Circle of Trust referrals, automated Telebirr confirmation rules, and safe bank transfers.
                  </p>
                  
                  {/* Search box */}
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={faqSearchQuery}
                      onChange={(e) => setFaqSearchQuery(e.target.value)}
                      placeholder="Search question, payment provider or rules..." 
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* FAQs searchable listings */}
              <div className="space-y-4 max-w-4xl">
                <span className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold block">Compliance Knowledge Database</span>
                
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">No matching guides found for "{faqSearchQuery}".</div>
                ) : (
                  filteredFaqs.map(faq => (
                    <div key={faq.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2 shadow-sm">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {faq.question}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-4">{faq.answer}</p>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {activeTab === 'settings' && currentUser && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-2xl shadow-sm space-y-6">
              <h2 className="font-display font-extrabold text-xl text-slate-850 dark:text-slate-50 border-b border-slate-100 dark:border-slate-850 pb-3">
                Security Panel &amp; Device Trust
              </h2>

              <div className="space-y-4">
                
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                  <div>
                    <span className="block font-bold text-xs text-slate-800 dark:text-slate-100">Simulated 2FA Authenticator</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">Enforce mobile app token request before publishing buy/sell liquidity.</span>
                  </div>
                  <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                  <div>
                    <span className="block font-bold text-xs text-slate-800 dark:text-slate-100">On-Chain Escrow Gas Reserve</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">Maintain minimum stablecoins to cover automated compliance releases.</span>
                  </div>
                  <span className="font-mono text-xs text-slate-700 dark:text-slate-350">0.02 ETH</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                  <div>
                    <span className="block font-bold text-xs text-slate-800 dark:text-slate-100">Registered Devices</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">Your unique browser fingerprint linked directly to secure ledger sessions.</span>
                  </div>
                  <span className="text-xs text-slate-500">Chrome OS, Linux amd64</span>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}

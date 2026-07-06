import React, { useState, useEffect } from 'react';
import { 
  Shield, CheckCircle, AlertTriangle, Users, ArrowRight, Star, 
  Trash2, Scale, RefreshCw, Layers, ShieldCheck, HeartPulse, Settings
} from 'lucide-react';
import { FraudAlert, P2PTrade } from '../types.js';

interface AdminPanelProps {
  onResolveDispute: (tradeId: string, resolution: 'released' | 'cancelled') => Promise<void>;
  trades: P2PTrade[];
}

export default function AdminPanel({ onResolveDispute, trades }: AdminPanelProps) {
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'disputes' | 'fraud' | 'system'>('disputes');

  // Fetch telemetry alerts
  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/fraud');
      const data = await res.json();
      setFraudAlerts(data);
    } catch (err) {
      console.error('Failed retrieving fraud indexes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const disputedTrades = trades.filter(t => t.status === 'disputed');

  const handleArbibrate = async (tradeId: string, action: 'released' | 'cancelled') => {
    if (!confirm(`Are you certain you wish to arbitrate this dispute? Choosing release releases escrow to buyer. Cancel returns it to seller.`)) return;
    try {
      await onResolveDispute(tradeId, action);
      alert('Arbiter resolution executed successfully on-chain.');
    } catch (err) {
      alert('Failed resolving dispute.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Title block */}
      <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-slate-800/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-slate-850 dark:text-slate-50 flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-500 animate-pulse" />
            Paymax Admin Facilitation Center
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Platform-wide fraud metrics, manual ID verifications, and escrow arbitration controls.</p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800/80">
          <button 
            onClick={() => setTab('disputes')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === 'disputes' ? 'bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Disputes Queue ({disputedTrades.length})
          </button>
          <button 
            onClick={() => setTab('fraud')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === 'fraud' ? 'bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Fraud Telemetry
          </button>
          <button 
            onClick={() => setTab('system')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === 'system' ? 'bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Compliance Engine
          </button>
        </div>
      </div>

      {/* Disputes Queue */}
      {tab === 'disputes' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-lg text-slate-850 dark:text-slate-50 flex items-center gap-1.5">
              <Scale className="w-5 h-5 text-red-500" />
              Active Disputes Requiring Arbitration
            </h2>
            
            {disputedTrades.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border border-dashed border-slate-100 dark:border-slate-850 rounded-2xl">
                Zero active disputes registered. Excellent community trade health.
              </div>
            ) : (
              <div className="space-y-6">
                {disputedTrades.map(t => (
                  <div key={t.id} className="border border-red-500/20 rounded-2xl p-5 bg-red-500/[0.01] space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
                      <div>
                        <span className="text-xs text-slate-400 font-mono">ID: {t.id}</span>
                        <strong className="block text-sm text-slate-800 dark:text-slate-100">{t.buyerName} (Buyer) vs {t.sellerName} (Seller)</strong>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs font-mono font-bold text-red-400">{t.amountFiat} {t.fiatCurrency}</span>
                        <span className="text-[10px] text-slate-400">{t.amountCrypto} {t.crypto} Escrow</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-slate-400 font-bold block">Dispute Escalation Ground:</span>
                        <p className="text-slate-600 dark:text-slate-300 font-medium">{t.disputeReason || 'No descriptive reason provided.'}</p>
                      </div>

                      {t.smsVerificationResult && (
                        <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                          <span className="text-emerald-500 font-bold block">Smart SMS Parser Analysis:</span>
                          <span className="block text-slate-500">Ref: {t.smsVerificationResult.reference} • Amount: {t.smsVerificationResult.amount} ETB</span>
                          <span className="block text-[10px] text-emerald-600 font-bold">Confidence Match: {t.smsVerificationResult.score}%</span>
                        </div>
                      )}
                    </div>

                    {/* Arbiter buttons */}
                    <div className="flex space-x-3 pt-2">
                      <button
                        onClick={() => handleArbibrate(t.id, 'released')}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-all shadow"
                      >
                        Force Release to Buyer
                      </button>
                      <button
                        onClick={() => handleArbibrate(t.id, 'cancelled')}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700"
                      >
                        Cancel &amp; Refund to Seller
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fraud Telemetry */}
      {tab === 'fraud' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
            <h2 className="font-display font-bold text-lg text-slate-850 dark:text-slate-50 flex items-center gap-1.5">
              <HeartPulse className="w-5 h-5 text-blue-500" />
              Platform Fraud Guard Telemetry Alerts
            </h2>
            <button onClick={fetchTelemetry} className="p-1.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 rounded-lg text-slate-400">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {fraudAlerts.map(alert => (
              <div key={alert.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-2xl flex items-start space-x-3">
                <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                  alert.severity === 'critical' ? 'text-red-500' :
                  alert.severity === 'high' ? 'text-amber-500' : 'text-blue-500'
                }`} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-150 uppercase tracking-wide">{alert.type.replace(/_/g, ' ')}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      alert.severity === 'critical' ? 'bg-red-500/10 text-red-500' :
                      alert.severity === 'high' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {alert.severity} Risk
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{alert.description}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">Target Account: <strong>{alert.username}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Telemetry stats */}
      {tab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl text-center space-y-2">
            <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">KYC Compliance Rate</span>
            <span className="block text-3xl font-display font-black text-slate-850 dark:text-slate-50">100.0%</span>
            <span className="text-[10px] text-emerald-500 block">Strict identity liveness binding</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl text-center space-y-2">
            <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">Secured Escrow Vaults</span>
            <span className="block text-3xl font-display font-black text-slate-850 dark:text-slate-50">$481,250</span>
            <span className="text-[10px] text-slate-400 block">Fully backed TRC20/ERC20 assets</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl text-center space-y-2">
            <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">AI SMS verification Accuracy</span>
            <span className="block text-3xl font-display font-black text-slate-850 dark:text-slate-50">99.72%</span>
            <span className="text-[10px] text-blue-500 block">Gemini-Powered parse integrity</span>
          </div>
        </div>
      )}

    </div>
  );
}

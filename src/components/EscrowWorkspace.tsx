import React, { useState } from 'react';
import { 
  Shield, CheckCircle, TrendingUp, Users, ArrowRight, Star, AlertTriangle, 
  MessageCircle, Copy, Check, Sparkles, FileText, Loader2, ArrowUpRight
} from 'lucide-react';
import { User, P2PTrade, SMSVerificationResult } from '../types.js';

interface EscrowWorkspaceProps {
  user: User;
  trade: P2PTrade;
  onUpdateTradeStatus: (tradeId: string, status: P2PTrade['status'], extra?: Partial<P2PTrade>) => Promise<void>;
}

export default function EscrowWorkspace({ user, trade, onUpdateTradeStatus }: EscrowWorkspaceProps) {
  const [smsInput, setSmsInput] = useState('');
  const [parsingLoading, setParsingLoading] = useState(false);
  const [parseResult, setParseResult] = useState<SMSVerificationResult | null>(trade.smsVerificationResult || null);
  const [copied, setCopied] = useState(false);
  const [disputeText, setDisputeText] = useState('');
  const [sendingDispute, setSendingDispute] = useState(false);

  const isBuyer = trade.buyerId === user.id;
  const isSeller = trade.sellerId === user.id;

  // Mock banking accounts details for transfer simulation
  const bankDetails: Record<string, { account: string; holder: string }> = {
    'Telebirr': { account: '+251911223344', holder: 'Telebirr_Premium_Merchant Ltd' },
    'CBE Birr': { account: '1000172635412', holder: 'CBE_Traders_PLC' },
    'Bank Transfer': { account: '1000182736412', holder: 'Paymax Escrow Facilitation' }
  };

  const details = bankDetails[trade.paymentMethod] || { account: '+251900112233', holder: trade.sellerName };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // SMART PAYMENT VERIFICATION ACTION
  const handleVerifySMS = async () => {
    if (!smsInput.trim()) return;
    setParsingLoading(true);
    try {
      const res = await fetch('/api/verify-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smsText: smsInput,
          expectedAmount: trade.amountFiat,
          expectedRecipient: details.holder
        })
      });
      const data = await res.json();
      setParseResult(data);

      // If confidence score is high, we can also bind the verification result to the trade
      await onUpdateTradeStatus(trade.id, 'payment_sent', {
        smsText: smsInput,
        smsVerificationResult: data
      });
    } catch (err) {
      alert('SMS parsing failed. Please input details cleanly.');
    } finally {
      setParsingLoading(false);
    }
  };

  const handleRelease = async () => {
    if (!confirm('Are you absolutely certain you received the exact fiat funds in your bank/mobile wallet? Releasing escrow assets is irreversible!')) return;
    try {
      await onUpdateTradeStatus(trade.id, 'released');
    } catch (err) {
      alert('Error releasing assets.');
    }
  };

  const handleDispute = async () => {
    if (!disputeText) return;
    setSendingDispute(true);
    try {
      await onUpdateTradeStatus(trade.id, 'disputed', {
        disputeReason: disputeText
      });
    } catch (err) {
      alert('Dispute initiation failed.');
    } finally {
      setSendingDispute(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Workspace Header Info Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Escrow Contract ID</span>
            <span className="font-mono font-bold text-sm bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300">{trade.id}</span>
          </div>
          <h2 className="text-xl font-display font-black text-slate-850 dark:text-slate-50 mt-2">
            Trading {trade.amountCrypto} {trade.crypto} for {parseFloat(trade.amountFiat).toLocaleString()} {trade.fiatCurrency}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Payment Channel: <strong className="text-slate-600 dark:text-slate-200">{trade.paymentMethod}</strong> • Locked Escrow protection active</p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 uppercase block">Escrow Contract Status</span>
          <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-bold mt-1 uppercase ${
            trade.status === 'escrow_locked' ? 'bg-blue-500/10 text-blue-500' :
            trade.status === 'payment_sent' ? 'bg-purple-500/10 text-purple-500' :
            trade.status === 'released' ? 'bg-emerald-500/10 text-emerald-500' :
            trade.status === 'disputed' ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-slate-100 text-slate-500'
          }`}>
            {trade.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Escrow Progress Path */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Step 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center space-x-3 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-xs">1</div>
          <div>
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Assets Locked</span>
            <span className="text-[10px] text-slate-400">Escrow collateral secured</span>
          </div>
        </div>

        {/* Step 2 */}
        <div className={`bg-white dark:bg-slate-900 border p-4 rounded-2xl flex items-center space-x-3 shadow-sm ${['payment_sent', 'released', 'disputed'].includes(trade.status) ? 'border-emerald-500/30' : 'border-slate-250 dark:border-slate-800'}`}>
          <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs ${['payment_sent', 'released', 'disputed'].includes(trade.status) ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-950 text-slate-400'}`}>2</div>
          <div>
            <span className="block text-xs font-bold text-slate-850 dark:text-slate-200">Buyer Transfers Fiat</span>
            <span className="text-[10px] text-slate-400">Transfer funds directly</span>
          </div>
        </div>

        {/* Step 3 */}
        <div className={`bg-white dark:bg-slate-900 border p-4 rounded-2xl flex items-center space-x-3 shadow-sm ${['payment_sent', 'released'].includes(trade.status) ? 'border-purple-500/30' : 'border-slate-250 dark:border-slate-800'}`}>
          <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs ${['payment_sent', 'released'].includes(trade.status) ? 'bg-purple-500 text-white' : 'bg-slate-100 dark:bg-slate-950 text-slate-400'}`}>3</div>
          <div>
            <span className="block text-xs font-bold text-slate-850 dark:text-slate-200">Payment Verified</span>
            <span className="text-[10px] text-slate-400">Paste SMS transaction</span>
          </div>
        </div>

        {/* Step 4 */}
        <div className={`bg-white dark:bg-slate-900 border p-4 rounded-2xl flex items-center space-x-3 shadow-sm ${trade.status === 'released' ? 'border-emerald-500/30' : 'border-slate-250 dark:border-slate-800'}`}>
          <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs ${trade.status === 'released' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-950 text-slate-400'}`}>4</div>
          <div>
            <span className="block text-xs font-bold text-slate-850 dark:text-slate-200">Assets Released</span>
            <span className="text-[10px] text-slate-400">Sellers releases collateral</span>
          </div>
        </div>

      </div>

      {/* Main Split workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Transfer details & SMS Parser (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Phase 2 details card */}
          {trade.status === 'escrow_locked' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                Action Required: Fiat Transfer Instructions
              </h3>
              
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBuyer 
                  ? `Please transfer exactly ${parseFloat(trade.amountFiat).toLocaleString()} ${trade.fiatCurrency} utilizing your banking application to the seller's verified checkout details below:` 
                  : `Waiting for ${trade.buyerName} to transfer funds. Do NOT release escrow until you have physically checked your bank account and verified receipt.`}
              </p>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 uppercase">Provider</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{trade.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 uppercase">Beneficiary Holder</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{details.holder}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 uppercase">Account / Phone</span>
                  <div className="flex items-center space-x-1.5 font-mono font-bold text-slate-850 dark:text-slate-50">
                    <span>{details.account}</span>
                    <button onClick={() => handleCopy(details.account)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {isBuyer && (
                <div className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl p-3">
                  ⚠️ <strong>Rule of Escrow:</strong> Never state references to "USDT", "Crypto", or "Paymax" in your banking transfer notes. Doing so violates banking terms and could drop your trust score by -15 points.
                </div>
              )}
            </div>
          )}

          {/* Smart Payment Verification Workspace */}
          {['escrow_locked', 'payment_sent', 'disputed'].includes(trade.status) && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-display font-extrabold text-base text-slate-850 dark:text-slate-50">Smart Payment Verification Parser</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Paste the bank confirmation SMS received after completing transfer. The AI parser validates references against active details.
                </p>
              </div>

              {isBuyer && trade.status === 'escrow_locked' && (
                <div className="space-y-4 font-sans">
                  <textarea
                    rows={4}
                    value={smsInput}
                    onChange={(e) => setSmsInput(e.target.value)}
                    placeholder="Example: Txn Ref: FT26189JHG817, CBE-Birr Transfer of ETB 62700.00 from CHALTU K to CBE_Traders_PLC approved on 2026-07-06 09:24."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-mono focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200"
                  />
                  
                  <div className="flex justify-between items-center text-xs">
                    <button
                      onClick={() => setSmsInput(`Txn Ref: FT26189JHG817, CBE-Birr Transfer of ETB ${trade.amountFiat}.00 from BUYER to ${details.holder} approved on 2026-07-06 09:24.`)}
                      className="text-emerald-500 hover:underline font-semibold"
                    >
                      💡 Insert Sample SMS Demo Text
                    </button>

                    <button
                      onClick={handleVerifySMS}
                      disabled={parsingLoading || !smsInput}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center space-x-1"
                    >
                      {parsingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Verify SMS &amp; Send Proof</span>}
                    </button>
                  </div>
                </div>
              )}

              {/* Show Parser results */}
              {parseResult && (
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-850 pb-3">
                    <span className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400">Parser Score Report</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                      parseResult.score >= 90 ? 'bg-emerald-500/10 text-emerald-500' :
                      parseResult.score >= 70 ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      Confidence Level: {parseResult.score}%
                    </span>
                  </div>

                  {/* Score indicator bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        parseResult.score >= 90 ? 'bg-emerald-500' :
                        parseResult.score >= 70 ? 'bg-blue-500' : 'bg-red-500'
                      }`} 
                      style={{ width: `${parseResult.score}%` }}
                    />
                  </div>

                  {/* Extracted JSON values */}
                  <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                    <div className="space-y-1">
                      <span className="text-slate-400 uppercase text-[10px] block">Parsed Amount</span>
                      <strong className="text-slate-850 dark:text-slate-100 font-mono font-bold text-sm">
                        {parseResult.amount ? `${parseFloat(parseResult.amount).toLocaleString()} ETB` : 'Not Parsed'}
                      </strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 uppercase text-[10px] block">Parsed Reference</span>
                      <strong className="text-slate-850 dark:text-slate-100 font-mono font-bold text-sm">
                        {parseResult.reference || 'Missing'}
                      </strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 uppercase text-[10px] block">Parsed Recipient</span>
                      <strong className="text-slate-850 dark:text-slate-100 font-bold">
                        {parseResult.recipient || 'Unknown'}
                      </strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 uppercase text-[10px] block">Provider</span>
                      <strong className="text-slate-850 dark:text-slate-100 font-bold">
                        {parseResult.provider || 'Bank Transfer'}
                      </strong>
                    </div>
                  </div>

                  {/* Issues block */}
                  {parseResult.issues.length > 0 && (
                    <div className="border-t border-slate-200 dark:border-slate-850 pt-3 space-y-1.5">
                      <span className="text-red-500 text-[10px] font-bold uppercase flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Parsed Flags / Warnings
                      </span>
                      <ul className="list-disc list-inside text-[11px] text-red-400 space-y-1">
                        {parseResult.issues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!isBuyer && trade.status === 'payment_sent' && (
                    <div className="bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs p-3 rounded-xl">
                      💡 <strong>Seller compliance suggestion:</strong> The buyer has submitted SMS proof. The reference matches transaction standards with {parseResult.score}% confidence. Please verify with your physical banking app balance, then release assets.
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Side: Escrow releasing, disputes & communications (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Release and Dispute Actions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100">Escrow Controls Workspace</h3>
            
            <p className="text-xs text-slate-400">
              {isSeller 
                ? 'Only release the smart escrow assets after you confirm exact fund availability in your actual banking ledger.'
                : 'Waiting for seller release. If any delays happen, you can chat below or escalate a formal dispute for moderator review.'}
            </p>

            {isSeller && ['payment_sent', 'escrow_locked', 'disputed'].includes(trade.status) && (
              <button
                onClick={handleRelease}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-500/10"
              >
                Release {trade.amountCrypto} {trade.crypto} to Buyer
              </button>
            )}

            {trade.status === 'released' && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center text-emerald-500 font-sans space-y-1">
                <CheckCircle className="w-8 h-8 mx-auto mb-1" />
                <span className="block font-bold">Smart Escrow Completed</span>
                <span className="text-xs">Funds released to buyer. Trust score points registered.</span>
              </div>
            )}

            {/* Initiate Dispute box */}
            {trade.status !== 'released' && trade.status !== 'cancelled' && (
              <div className="border-t border-slate-100 dark:border-slate-850/60 pt-4 space-y-3">
                <span className="block text-xs uppercase font-mono text-slate-400 font-bold">Raise Escrow Dispute</span>
                <textarea
                  rows={2}
                  value={disputeText}
                  onChange={(e) => setDisputeText(e.target.value)}
                  placeholder="Explain why you are opening a dispute..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:border-red-500 text-slate-800 dark:text-slate-200"
                />
                <button
                  onClick={handleDispute}
                  disabled={sendingDispute || !disputeText}
                  className="w-full py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 text-xs font-semibold transition-all"
                >
                  {sendingDispute ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : <span>Open Dispute &amp; Flag Moderator</span>}
                </button>
              </div>
            )}
          </div>

          {/* Secure Dispute / Communication Chat */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col h-80 justify-between">
            <div className="border-b border-slate-100 dark:border-slate-850 pb-3 flex justify-between items-center">
              <span className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400">Trade Conversation Ledger</span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-950 text-slate-400 px-2 py-0.5 rounded-full">Encrypted</span>
            </div>

            {/* Chats messages box */}
            <div className="flex-1 overflow-y-auto my-3 space-y-3 text-xs pr-1">
              <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                <span className="block font-bold text-[10px] text-slate-400 mb-0.5 uppercase">Paymax System bot</span>
                <p className="text-slate-500 dark:text-slate-400">Escrow collateral locked. Buyer has 15 minutes to complete fiat payment.</p>
              </div>

              {trade.status === 'payment_sent' && (
                <div className="bg-purple-500/5 p-2.5 rounded-xl border border-purple-500/10 text-right ml-6">
                  <span className="block font-bold text-[10px] text-purple-400 mb-0.5 uppercase">Buyer (SMS verification)</span>
                  <p className="text-slate-500 dark:text-slate-400">Fiat transferred. SMS verification code FT26189JHG817 uploaded.</p>
                </div>
              )}

              {trade.status === 'disputed' && (
                <div className="bg-red-500/5 p-2.5 rounded-xl border border-red-500/10 ml-6 text-left">
                  <span className="block font-bold text-[10px] text-red-400 mb-0.5 uppercase">Dispute Moderator</span>
                  <p className="text-slate-500 dark:text-slate-400">A Paymax arbiter is reviewing the uploaded SMS confirmation ledger values.</p>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Type message..." 
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none"
              />
              <button className="px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs rounded-xl">
                Send
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

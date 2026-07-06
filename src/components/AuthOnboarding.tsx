import React, { useState } from 'react';
import { 
  UserPlus, Mail, Shield, Smartphone, Key, FileText, Camera, Check, 
  ArrowRight, Sparkles, Loader2, RefreshCw, SmartphoneIcon, AlertCircle 
} from 'lucide-react';
import { User } from '../types.js';

interface AuthOnboardingProps {
  onOnboardingComplete: (user: User) => void;
  onBackToLanding: () => void;
}

export default function AuthOnboarding({ onOnboardingComplete, onBackToLanding }: AuthOnboardingProps) {
  const [step, setStep] = useState<'register' | 'phone' | 'email_confirm' | 'id_upload' | 'selfie' | 'review'>('register');
  
  // Registration data
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Step state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [idType, setIdType] = useState('National ID');
  const [idNumber, setIdNumber] = useState('');
  const [idCardUrl, setIdCardUrl] = useState('');

  // Selfie liveness check simulator
  const [livenessPrompt, setLivenessPrompt] = useState<'blink' | 'left' | 'smile' | 'completed'>('blink');
  const [selfieCaptured, setSelfieCaptured] = useState(false);

  // Completed simulated user info storage
  const [tempUser, setTempUser] = useState<User | null>(null);

  // 1. Register Action
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email) {
      setErrorMsg('Please enter a username and email address.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, inviteCode })
      });
      if (!res.ok) throw new Error('Registration failed.');
      const data = await res.json();
      setTempUser(data);
      
      // If VIP-PAYMAX-777 was used, auto-complete
      if (inviteCode === 'VIP-PAYMAX-777') {
        onOnboardingComplete(data);
        return;
      }

      setStep('phone');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed registering credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Phone Verification
  const handleSendOtp = () => {
    if (!phone) return;
    setOtpSent(true);
    setErrorMsg('');
  };

  const handleVerifyPhone = async () => {
    if (!otp || !tempUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/verification/${tempUser.id}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'phone',
          details: { phone }
        })
      });
      const updated = await res.json();
      setTempUser(updated);
      setStep('email_confirm');
    } catch (err) {
      setErrorMsg('OTP confirmation failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Email Verification
  const handleVerifyEmail = async () => {
    if (!tempUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/verification/${tempUser.id}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'email',
          details: { email: tempUser.email }
        })
      });
      const updated = await res.json();
      setTempUser(updated);
      setStep('id_upload');
    } catch (err) {
      setErrorMsg('Failed updating verification details.');
    } finally {
      setLoading(false);
    }
  };

  // 4. ID Upload
  const handleVerifyId = async () => {
    if (!idNumber || !tempUser) {
      setErrorMsg('Please enter a valid document number.');
      return;
    }
    setLoading(true);
    try {
      const simulatedUrl = `https://paymax-compliance-storage.s3.amazonaws.com/ids/${tempUser.id}_front.jpg`;
      const res = await fetch(`/api/verification/${tempUser.id}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'id_upload',
          details: { idType, idNumber, idCardUrl: simulatedUrl }
        })
      });
      const updated = await res.json();
      setTempUser(updated);
      setStep('selfie');
    } catch (err) {
      setErrorMsg('Failed writing document compliance.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Selfie Liveness Simulator
  const handleLivenessAction = (next: 'left' | 'smile' | 'completed') => {
    setLoading(true);
    setTimeout(() => {
      setLivenessPrompt(next);
      setLoading(false);
      if (next === 'completed') {
        setSelfieCaptured(true);
      }
    }, 1000);
  };

  const handleVerifySelfie = async () => {
    if (!tempUser) return;
    setLoading(true);
    try {
      const simulatedSelfie = `https://paymax-compliance-storage.s3.amazonaws.com/selfies/${tempUser.id}_face.jpg`;
      const res = await fetch(`/api/verification/${tempUser.id}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'completed',
          details: { selfieUrl: simulatedSelfie }
        })
      });
      const updated = await res.json();
      setTempUser(updated);
      setStep('review');
    } catch (err) {
      setErrorMsg('Liveness verification sync failed.');
    } finally {
      setLoading(false);
    }
  };

  // Step Tracker rendering
  const steps = [
    { label: 'Sign Up', key: 'register' },
    { label: 'Mobile Bind', key: 'phone' },
    { label: 'Email Confirm', key: 'email_confirm' },
    { label: 'ID Documents', key: 'id_upload' },
    { label: 'Face Liveness', key: 'selfie' },
    { label: 'Approve Badge', key: 'review' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        
        {/* Left progress helper (4 columns) */}
        <div className="md:col-span-4 bg-slate-100 dark:bg-slate-950 p-6 flex flex-col justify-between border-r border-slate-200 dark:border-slate-850">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-emerald-500" />
              <span className="font-display font-bold text-lg text-slate-800 dark:text-slate-100">PAYMAX TRUST</span>
            </div>
            
            <div className="space-y-4">
              <span className="text-xs uppercase font-mono text-slate-400 font-bold tracking-widest block">Verification Progress</span>
              <div className="space-y-3">
                {steps.map((s, idx) => {
                  const currentIdx = steps.findIndex(x => x.key === step);
                  const isDone = idx < currentIdx;
                  const isActive = s.key === step;
                  return (
                    <div key={s.key} className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-all ${
                        isDone ? 'bg-emerald-500 text-white border-emerald-500' :
                        isActive ? 'bg-blue-500 text-white border-blue-500 animate-pulse' : 'bg-transparent text-slate-400 border-slate-200 dark:border-slate-800'
                      }`}>
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span className={`text-xs font-semibold ${isActive ? 'text-blue-500' : isDone ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500">
            Secure, identity-first registration prevents market scrapers and automated trading bots.
            <button onClick={onBackToLanding} className="block mt-4 text-emerald-500 hover:underline font-semibold focus:outline-none">
              ← Cancel Registration
            </button>
          </div>
        </div>

        {/* Right workspace (8 columns) */}
        <div className="md:col-span-8 p-8 flex flex-col justify-center">
          
          {step === 'register' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100">Create Secured Escrow Account</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Join the verified circle of digital asset exchange. Fill your core information.</p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">Desired Username</label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '_'))}
                      placeholder="e.g. Samuel_Trader" 
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">Username must not contain spaces (used for invoice references).</span>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. samuel@gmail.com" 
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">Invitation Code (Optional)</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="Paste referral or code e.g. VIP-PAYMAX-777" 
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200 font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-emerald-500 block mt-1 font-medium">Use VIP-PAYMAX-777 for quick bypass verification demo.</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-sm font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/10"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Next: Secure Identity</span> <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </div>
          )}

          {step === 'phone' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <Smartphone className="w-8 h-8 text-emerald-500 mb-2" />
                <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100">Phone Number Verification</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Bind your physical telephone to verify real-time payment transfers.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">Phone Number</label>
                  <div className="flex space-x-2">
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+251 911 223 344" 
                      className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200 font-mono"
                    />
                    <button
                      onClick={handleSendOtp}
                      className="px-4 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      {otpSent ? 'Resend' : 'Send Code'}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">Enter 6-Digit SMS Code</label>
                    <div className="flex space-x-2 items-center">
                      <input 
                        type="text" 
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 529482" 
                        className="w-36 px-4 py-2.5 text-center tracking-widest bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-lg font-mono font-bold focus:outline-none focus:border-emerald-500 text-slate-850 dark:text-slate-50"
                      />
                      <span className="text-xs text-slate-400">Code is: <span className="font-mono font-bold text-emerald-500">817 999</span></span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleVerifyPhone}
                  disabled={loading || !otp}
                  className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify OTP &amp; Next</span>}
                </button>
              </div>
            </div>
          )}

          {step === 'email_confirm' && (
            <div className="space-y-6 text-center">
              <Mail className="w-12 h-12 text-blue-500 mx-auto" />
              <div className="space-y-1">
                <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100">Check Your Email</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">We sent an activation link to <span className="font-semibold text-slate-850 dark:text-slate-100">{tempUser?.email}</span>.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-xs border border-slate-100 dark:border-slate-850 text-slate-500">
                Simulation Link: To maintain a frictionless review, click the confirmation button below to bypass verification of SMTP callbacks.
              </div>

              <button
                onClick={handleVerifyEmail}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-sm font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Email Activation</span>}
              </button>
            </div>
          )}

          {step === 'id_upload' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <FileText className="w-8 h-8 text-blue-500 mb-2" />
                <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100">National ID &amp; Document Review</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Provide official identity document records to comply with safe transaction standards.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">Document Category</label>
                  <select 
                    value={idType} 
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-100"
                  >
                    <option>National ID Card</option>
                    <option>International Passport</option>
                    <option>Driver's Permit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">Document Number / Reference</label>
                  <input 
                    type="text" 
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. ETH-92817263-K" 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>

                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-950 transition-all cursor-pointer">
                  <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Front Image Uploaded</span>
                  <span className="block text-xs text-slate-400 mt-1">Automatic verification active. Scan compliant images cleanly.</span>
                </div>

                <button
                  onClick={handleVerifyId}
                  disabled={loading || !idNumber}
                  className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm &amp; Proceed to Selfie</span>}
                </button>
              </div>
            </div>
          )}

          {step === 'selfie' && (
            <div className="space-y-6 text-center">
              <div className="space-y-1">
                <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100">Selfie Liveness Verification</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Position your face inside the circle indicator and perform liveness gestures.</p>
              </div>

              {/* Liveness camera container mock */}
              <div className="relative w-48 h-48 rounded-full border-4 border-emerald-500 bg-slate-150 dark:bg-slate-950 mx-auto flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end justify-center pb-4">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-400 font-bold">LIVENESS CAM</span>
                </div>
                {selfieCaptured ? (
                  <div className="text-center">
                    <Check className="w-12 h-12 text-emerald-500 mx-auto" />
                    <span className="text-xs text-emerald-500 font-bold block mt-1">Verified Liveness</span>
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    {loading ? (
                      <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto" />
                    ) : (
                      <>
                        <span className="text-xs text-slate-400 block mb-2 uppercase tracking-wide">Gesture instruction:</span>
                        {livenessPrompt === 'blink' && (
                          <span className="text-sm font-bold text-blue-500 block animate-bounce">"Blink Slowly"</span>
                        )}
                        {livenessPrompt === 'left' && (
                          <span className="text-sm font-bold text-blue-500 block">"Turn face slowly to Left"</span>
                        )}
                        {livenessPrompt === 'smile' && (
                          <span className="text-sm font-bold text-emerald-500 block">"Smile at Camera"</span>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {!selfieCaptured && (
                <div className="flex justify-center space-x-2">
                  {livenessPrompt === 'blink' && (
                    <button onClick={() => handleLivenessAction('left')} className="px-4 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300">
                      Done (Blinked)
                    </button>
                  )}
                  {livenessPrompt === 'left' && (
                    <button onClick={() => handleLivenessAction('smile')} className="px-4 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300">
                      Done (Turned Left)
                    </button>
                  )}
                  {livenessPrompt === 'smile' && (
                    <button onClick={() => handleLivenessAction('completed')} className="px-4 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg">
                      Finish (Smiled)
                    </button>
                  )}
                </div>
              )}

              {selfieCaptured && (
                <button
                  onClick={handleVerifySelfie}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-sm font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Face Verification</span>}
                </button>
              )}
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100">Compliance Verification Approved!</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Your selfie, phone number, and documents conform to trade safety regulations.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 text-left max-w-md mx-auto space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 uppercase">Verification Badge</span>
                  <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">VERIFIED TRADER badge</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 uppercase">Initial Trust Score</span>
                  <span className="font-mono text-xs text-emerald-500 font-bold">85.0 points</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 uppercase">Registered Reference ID</span>
                  <span className="font-mono text-xs text-slate-700 dark:text-slate-300 uppercase">{tempUser?.id}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (tempUser) {
                    onOnboardingComplete(tempUser);
                  }
                }}
                className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center space-x-2"
              >
                <span>Activate Dashboard Workspace</span> <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

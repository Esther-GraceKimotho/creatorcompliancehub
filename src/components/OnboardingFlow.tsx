import { useState } from 'react';
import { CheckCircle2, ChevronRight, Fingerprint, Shield, Share2 } from 'lucide-react';

export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    kraPin: '',
    idNumber: '',
    metaConnected: false,
    youtubeConnected: false
  });

  const handleNext = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(s => s + 1);
    }, 800);
  };

  const finishSetup = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onComplete();
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Progress Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Account Setup</h2>
        <div className="flex items-center justify-between relative max-w-sm mx-auto">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
          
          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
        </div>
        <div className="flex justify-between max-w-sm mx-auto mt-2 text-[10px] font-bold text-slate-500 uppercase">
          <span className={step >= 1 ? 'text-blue-600' : ''}>KRA</span>
          <span className={step >= 2 ? 'text-blue-600' : ''}>KECOBO</span>
          <span className={step >= 3 ? 'text-blue-600' : ''}>Platforms</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="p-8 min-h-[300px]">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <Fingerprint className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Connect KRA iTax</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              To use the eTIMS invoicing module and track your Tax Compliance Certificate (TCC), enter your personal or business KRA PIN.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">KRA PIN</label>
                <input
                  type="text"
                  value={formData.kraPin}
                  onChange={e => setFormData({ ...formData, kraPin: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                  placeholder="P000000000A"
                />
              </div>
              <div className="p-3 bg-blue-50 text-blue-800 rounded-xl text-xs flex gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600" />
                <p>We use this purely to route your eTIMS API calls securely to KRA OSCU/VSCU servers.</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">KECOBO Integration</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Link your National ID to interface with the National Rights Registry (NRR). This allows 1-click copyright registration.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">National ID / Passport</label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={e => setFormData({ ...formData, idNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g., 29384722"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
              <Share2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Platform Royalties</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Connect your content platforms to automatically track incoming royalties and calculate the 5% Withholding Tax (WHT).
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => setFormData({ ...formData, youtubeConnected: true })}
                className={`w-full flex items-center justify-between p-4 rounded-xl border ${formData.youtubeConnected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-blue-300 bg-white'}`}
              >
                <span className="font-bold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  YouTube Partner Program
                </span>
                {formData.youtubeConnected ? <span className="text-xs font-bold text-emerald-600 uppercase">Connected</span> : <span className="text-sm text-blue-600 font-medium">Connect</span>}
              </button>

              <button 
                onClick={() => setFormData({ ...formData, metaConnected: true })}
                className={`w-full flex items-center justify-between p-4 rounded-xl border ${formData.metaConnected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-blue-300 bg-white'}`}
              >
                <span className="font-bold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Meta (Facebook/IG) Reels
                </span>
                {formData.metaConnected ? <span className="text-xs font-bold text-emerald-600 uppercase">Connected</span> : <span className="text-sm text-blue-600 font-medium">Connect</span>}
              </button>

              {/* Biometric Shield enrollment option */}
              <div className="mt-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Enable Biometric Vault</p>
                    <p className="text-[11px] text-slate-600">Secure KRA PIN & National ID with FaceID / Touch ID</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                  Enabled
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
        {step > 1 ? (
          <button 
            onClick={() => setStep(s => s - 1)}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900"
          >
            Back
          </button>
        ) : <div></div>}

        {step < 3 ? (
          <button 
            onClick={handleNext}
            disabled={loading || (step === 1 && !formData.kraPin)}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing...' : 'Continue'} <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={finishSetup}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
          >
            {loading ? 'Completing...' : 'Finish Setup'} <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

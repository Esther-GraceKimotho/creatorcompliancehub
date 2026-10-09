import { useState } from 'react';
import EtimsModule from './EtimsModule';
import IpRegistrationModule from './IpRegistrationModule';
import AiComplianceChecker from './AiComplianceChecker';
import OverviewDashboard from './OverviewDashboard';
import KnowledgeBase from './KnowledgeBase';
import OnboardingFlow from './OnboardingFlow';
import SensitiveShield from './SensitiveShield';
import TaxCalendar from './TaxCalendar';
import IncomeLogger from './IncomeLogger';
import ContractRedliner from './ContractRedliner';
import CrossBorderTaxEstimator from './CrossBorderTaxEstimator';
import { useBiometrics } from '../context/BiometricContext';
import { 
  CheckCircle2, 
  FileText, 
  Settings, 
  BookOpen, 
  User, 
  Menu, 
  X, 
  ScanFace, 
  Fingerprint, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  SlidersHorizontal,
  CalendarDays,
  DollarSign,
  Scale,
  Globe2
} from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'taxes' | 'calendar' | 'ip' | 'redline' | 'crossborder' | 'ai' | 'kb' | 'setup'>('overview');
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { 
    isUnlocked, 
    settings, 
    lockVault, 
    triggerBiometricAuth, 
    setIsSettingsOpen 
  } = useBiometrics();

  const BiometricIcon = settings.primaryBiometric === 'fingerprint' ? Fingerprint : ScanFace;

  const handleDownloadKraReport = async () => {
    const authorized = await triggerBiometricAuth({
      reason: 'Authorize FaceID / Fingerprint to generate confidential KRA Tax & Withholding report',
      target: 'PDF_EXPORT'
    });
    if (!authorized) return;

    // Simulate export
    const blob = new Blob([
      `KRA Creator Tax Compliance Report 2026\nPIN: P051829471Z\nTaxpayer: Maina Kamau\nStatus: Compliant\nGenerated: ${new Date().toISOString()}`
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KRA_Compliance_Report_P051829471Z_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col font-sans overflow-hidden text-slate-900">
      {/* Header */}
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 relative z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center shrink-0">
            <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
          </div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-blue-900 truncate hidden sm:block">CreatorCompliance <span className="text-blue-500">Kenya</span></h1>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Biometric Vault Quick Indicator */}
          <div className="flex items-center gap-1.5">
            {isUnlocked ? (
              <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-800 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Biometrics Active</span>
                <button
                  onClick={lockVault}
                  title="Lock Sensitive Data Vault"
                  className="ml-1 p-0.5 hover:bg-emerald-200/60 rounded text-emerald-700"
                >
                  <Lock className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => triggerBiometricAuth({
                  reason: 'Unlock sensitive KRA iTax and KECOBO Copyright credentials with biometrics',
                  target: 'SYSTEM'
                })}
                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold text-amber-900 transition-all shadow-2xs group"
                title="Click to unlock with FaceID / Touch ID"
              >
                <BiometricIcon className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform animate-pulse" />
                <span>Vault Locked</span>
                <span className="hidden md:inline text-[10px] font-normal text-amber-700">(Tap to Unlock)</span>
              </button>
            )}

            {/* Security Config Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Biometric Security & Vault Settings"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-xs font-semibold text-emerald-700">eTIMS Live</span>
          </div>

          <div className="flex items-center gap-3 sm:border-l sm:pl-4 border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="flex items-center justify-end gap-1">
                <span className="text-[10px] font-medium text-slate-400 uppercase">PIN:</span>
                <SensitiveShield 
                  inline 
                  value="P051829471Z" 
                  type="kraPin" 
                  label="KRA PIN" 
                  target="KRA" 
                />
              </div>
              <p className="text-xs font-bold text-slate-800">Maina Kamau</p>
            </div>
            <div 
              onClick={() => setIsSettingsOpen(true)}
              className="w-9 h-9 bg-slate-200 rounded-full border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-600 text-xs shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
              title="Creator Security Profile"
            >
              M
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={`absolute md:relative z-50 w-64 h-full bg-white border-r border-slate-200 p-6 flex flex-col gap-2 shrink-0 overflow-y-auto transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Modules</div>
          
          <button 
            onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-lg">📊</span> Dashboard
          </button>
          
          <button 
            onClick={() => { setActiveTab('income'); setIsMobileMenuOpen(false); }}
            className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === 'income' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">💰</span>
              <span>Income Logger</span>
            </div>
            <span className="text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
              Streams & Deals
            </span>
          </button>

          <button 
            onClick={() => { setActiveTab('taxes'); setIsMobileMenuOpen(false); }}
            className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === 'taxes' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🧾</span> Tax & eTIMS
            </div>
            <span className="text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
              Estimator
            </span>
          </button>

          <button 
            onClick={() => { setActiveTab('calendar'); setIsMobileMenuOpen(false); }}
            className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === 'calendar' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-amber-500" />
              <span>Tax Calendar</span>
            </div>
            <span className="text-[9px] font-extrabold uppercase bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono">
              20th VAT
            </span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('ip'); setIsMobileMenuOpen(false); }}
            className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === 'ip' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🛡️</span> KECOBO IP
            </div>
            <span className="text-[9px] font-extrabold uppercase bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
              Vault & NRR
            </span>
          </button>

          <button 
            onClick={() => { setActiveTab('redline'); setIsMobileMenuOpen(false); }}
            className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === 'redline' ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">⚖️</span> Redliner
            </div>
            <span className="text-[9px] font-extrabold uppercase bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-mono">
              Brand Deals
            </span>
          </button>

          <button 
            onClick={() => { setActiveTab('crossborder'); setIsMobileMenuOpen(false); }}
            className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === 'crossborder' ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🌐</span> Cross-Border
            </div>
            <span className="text-[9px] font-extrabold uppercase bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-mono">
              W-8BEN
            </span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('ai'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === 'ai' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-lg">🤖</span> AI Compliance
          </button>

          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-4">Support & Security</div>

          <button 
            onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }}
            className="flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BiometricIcon className="w-5 h-5 text-blue-600" />
              <span>Biometric Vault</span>
            </div>
            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
              isUnlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {isUnlocked ? 'Active' : 'Locked'}
            </span>
          </button>

          <button 
            onClick={() => { setActiveTab('kb'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === 'kb' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-5 h-5" /> Knowledge Base
          </button>

          <button 
            onClick={() => { setActiveTab('setup'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === 'setup' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-5 h-5" /> Onboarding Setup
          </button>

          <div className="mt-auto p-4 bg-slate-900 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-400">Compliance Score</p>
              <div className="flex items-center gap-1">
                <BiometricIcon className="w-3 h-3 text-emerald-400" />
                <span className="text-[9px] text-emerald-400 font-bold">Secured</span>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold">92%</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">High</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-blue-400 h-full w-[92%]"></div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8 pb-12">
            
            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === 'overview' && (
                <OverviewDashboard 
                  onNavigateToTaxes={() => setActiveTab('taxes')} 
                  onNavigateToIp={() => setActiveTab('ip')}
                  onNavigateToCalendar={() => setActiveTab('calendar')}
                  onNavigateToIncome={() => setActiveTab('income')}
                  onNavigateToRedline={() => setActiveTab('redline')}
                  onNavigateToCrossBorder={() => setActiveTab('crossborder')}
                />
              )}

              {activeTab === 'income' && (
                <IncomeLogger 
                  onNavigateToEstimator={() => setActiveTab('taxes')} 
                  onNavigateToInvoice={() => setActiveTab('taxes')}
                />
              )}

              {activeTab === 'calendar' && (
                <TaxCalendar />
              )}

              {activeTab === 'taxes' && (
                <div className="space-y-6">
                  {/* Withholding Tax Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Pending Withholding Tax</p>
                        <SensitiveShield 
                          inline 
                          value="KES 42,500" 
                          type="currency" 
                          label="Pending Withholding" 
                          target="TAX_ESTIMATES" 
                        />
                      </div>
                      <div className="text-xl font-bold font-mono">
                        <SensitiveShield 
                          value="KES 42,500" 
                          type="currency" 
                          label="Pending WHT" 
                          target="TAX_ESTIMATES" 
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2">From Meta & YouTube Royalties</p>
                    </div>
                    
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Deductible Expenses</p>
                        <SensitiveShield 
                          inline 
                          value="KES 18,200" 
                          type="currency" 
                          label="Deductible Expenses" 
                          target="TAX_ESTIMATES" 
                        />
                      </div>
                      <div className="text-xl font-bold font-mono">
                        <SensitiveShield 
                          value="KES 18,200" 
                          type="currency" 
                          label="Deductible Expenses" 
                          target="TAX_ESTIMATES" 
                        />
                      </div>
                      <p className="text-[10px] text-emerald-500 font-medium mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> All supported by eTIMS
                      </p>
                    </div>
                    
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-start">
                      <button 
                        onClick={handleDownloadKraReport}
                        className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs shadow-xs"
                      >
                        <BiometricIcon className="w-4 h-4 text-blue-600" />
                        Download KRA Report (Biometric)
                      </button>
                      <p className="text-[10px] text-slate-400 text-center w-full mt-2">
                        Requires biometric authentication
                      </p>
                    </div>
                  </div>

                  <EtimsModule />
                </div>
              )}

              {activeTab === 'ip' && (
                <IpRegistrationModule />
              )}

              {activeTab === 'redline' && (
                <ContractRedliner />
              )}

              {activeTab === 'crossborder' && (
                <CrossBorderTaxEstimator />
              )}

              {activeTab === 'ai' && (
                <AiComplianceChecker />
              )}

              {activeTab === 'kb' && (
                <KnowledgeBase />
              )}

              {activeTab === 'setup' && (
                <OnboardingFlow onComplete={() => setActiveTab('overview')} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

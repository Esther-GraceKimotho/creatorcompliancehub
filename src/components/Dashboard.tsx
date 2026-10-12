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
import { PWAInstallButton } from './PWAInstallButton';
import { OfflineIndicator } from './OfflineIndicator';
import { useProfile } from '../context/ProfileContext';
import { useIncome } from '../context/IncomeContext';
import { 
  CheckCircle2, 
  Settings, 
  BookOpen, 
  User, 
  Menu, 
  X, 
  ShieldCheck, 
  CalendarDays,
  Download,
  Building2,
  LayoutDashboard,
  Wallet,
  Receipt,
  Shield,
  Layers,
  FileSpreadsheet,
  Globe2,
  Bot,
  HelpCircle,
  Smartphone
} from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'taxes' | 'calendar' | 'ip' | 'redline' | 'crossborder' | 'ai' | 'kb' | 'setup'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { profile, setIsEditModalOpen } = useProfile();
  const { monthlySummary } = useIncome();

  const handleDownloadKraReport = () => {
    const creatorName = profile.creatorName || 'Digital Creator';
    const kraPin = profile.kraPin || 'Pending PIN';
    const blob = new Blob([
      `KRA Creator Tax Compliance Report 2026\nPIN: ${kraPin}\nTaxpayer: ${creatorName}\nNational ID: ${profile.nationalId || 'N/A'}\nStatus: Compliant\nGenerated: ${new Date().toISOString()}`
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KRA_Compliance_Report_${kraPin}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col font-sans overflow-hidden text-slate-900 select-none md:select-auto">
      {/* Offline Toast */}
      <OfflineIndicator />

      {/* Top App Header */}
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 md:px-8 shrink-0 relative z-40 pt-[env(safe-area-inset-top,0px)]">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            aria-label="Open App Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-900 via-blue-700 to-indigo-600 flex items-center justify-center shadow-sm shrink-0 border border-blue-800/40">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 leading-none">
                CreatorCompliance <span className="text-blue-600 font-black">Kenya</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block mt-0.5">
                eTIMS &bull; Copyright IP &bull; Digital Tax App
              </p>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* PWA Install Button */}
          <PWAInstallButton variant="compact" />

          {/* eTIMS Status Badge */}
          <div className="hidden lg:flex items-center gap-2 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[11px] font-semibold text-emerald-700">eTIMS Live</span>
          </div>

          {/* User Profile Trigger */}
          <div className="flex items-center gap-2.5 sm:border-l sm:pl-3.5 border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="flex items-center justify-end gap-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">PIN:</span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {profile.kraPin || 'Not set'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                {profile.creatorName || 'Set Profile'}
              </p>
            </div>
            
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="w-9 h-9 bg-blue-50 border border-blue-200 hover:border-blue-400 rounded-full flex items-center justify-center font-bold text-blue-700 text-xs shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all shadow-2xs"
              title="Click to view/edit Creator Profile & KRA Credentials"
            >
              {profile.creatorName ? profile.creatorName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Mobile Full Navigation Drawer / Bottom Sheet */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/60 z-50 md:hidden backdrop-blur-xs flex flex-col justify-end animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div 
              className="bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-sm">
                    🇰🇪
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">App Navigation</h3>
                    <p className="text-xs text-slate-500">All tools & statutory services</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Install Banner on Mobile Menu */}
              <PWAInstallButton variant="banner" />

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}
                  className={`p-3 rounded-2xl flex flex-col items-start gap-1 text-left transition-all ${
                    activeTab === 'overview' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="text-xs font-bold mt-1">Dashboard</span>
                  <span className={`text-[10px] ${activeTab === 'overview' ? 'text-blue-100' : 'text-slate-400'}`}>Overview</span>
                </button>

                <button
                  onClick={() => { setActiveTab('income'); setIsMobileMenuOpen(false); }}
                  className={`p-3 rounded-2xl flex flex-col items-start gap-1 text-left transition-all ${
                    activeTab === 'income' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                  <span className="text-xs font-bold mt-1">Income Logger</span>
                  <span className={`text-[10px] ${activeTab === 'income' ? 'text-emerald-100' : 'text-slate-400'}`}>Deals & 5% WHT</span>
                </button>

                <button
                  onClick={() => { setActiveTab('taxes'); setIsMobileMenuOpen(false); }}
                  className={`p-3 rounded-2xl flex flex-col items-start gap-1 text-left transition-all ${
                    activeTab === 'taxes' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Receipt className="w-5 h-5" />
                  <span className="text-xs font-bold mt-1">Tax & eTIMS</span>
                  <span className={`text-[10px] ${activeTab === 'taxes' ? 'text-blue-100' : 'text-slate-400'}`}>Estimator & Invoices</span>
                </button>

                <button
                  onClick={() => { setActiveTab('ip'); setIsMobileMenuOpen(false); }}
                  className={`p-3 rounded-2xl flex flex-col items-start gap-1 text-left transition-all ${
                    activeTab === 'ip' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span className="text-xs font-bold mt-1">KECOBO IP</span>
                  <span className={`text-[10px] ${activeTab === 'ip' ? 'text-indigo-100' : 'text-slate-400'}`}>Vault & NRR</span>
                </button>

                <button
                  onClick={() => { setActiveTab('calendar'); setIsMobileMenuOpen(false); }}
                  className={`p-3 rounded-2xl flex flex-col items-start gap-1 text-left transition-all ${
                    activeTab === 'calendar' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <CalendarDays className="w-5 h-5" />
                  <span className="text-xs font-bold mt-1">Tax Calendar</span>
                  <span className={`text-[10px] ${activeTab === 'calendar' ? 'text-amber-100' : 'text-slate-400'}`}>20th Deadlines</span>
                </button>

                <button
                  onClick={() => { setActiveTab('redline'); setIsMobileMenuOpen(false); }}
                  className={`p-3 rounded-2xl flex flex-col items-start gap-1 text-left transition-all ${
                    activeTab === 'redline' ? 'bg-rose-600 text-white font-bold' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  <span className="text-xs font-bold mt-1">Contract Redliner</span>
                  <span className={`text-[10px] ${activeTab === 'redline' ? 'text-rose-100' : 'text-slate-400'}`}>Brand Deals</span>
                </button>

                <button
                  onClick={() => { setActiveTab('crossborder'); setIsMobileMenuOpen(false); }}
                  className={`p-3 rounded-2xl flex flex-col items-start gap-1 text-left transition-all ${
                    activeTab === 'crossborder' ? 'bg-sky-600 text-white font-bold' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Globe2 className="w-5 h-5" />
                  <span className="text-xs font-bold mt-1">Cross-Border</span>
                  <span className={`text-[10px] ${activeTab === 'crossborder' ? 'text-sky-100' : 'text-slate-400'}`}>W-8BEN Guide</span>
                </button>

                <button
                  onClick={() => { setActiveTab('ai'); setIsMobileMenuOpen(false); }}
                  className={`p-3 rounded-2xl flex flex-col items-start gap-1 text-left transition-all ${
                    activeTab === 'ai' ? 'bg-purple-600 text-white font-bold' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Bot className="w-5 h-5" />
                  <span className="text-xs font-bold mt-1">AI Compliance</span>
                  <span className={`text-[10px] ${activeTab === 'ai' ? 'text-purple-100' : 'text-slate-400'}`}>AI Bill 2026</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => { setActiveTab('kb'); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-1.5 text-slate-600 font-bold hover:text-blue-600"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Knowledge Base</span>
                </button>

                <button
                  onClick={() => { setIsEditModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-1.5 text-blue-600 font-bold hover:text-blue-700"
                >
                  <User className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 h-full bg-white border-r border-slate-200 p-5 flex-col gap-1.5 shrink-0 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-3">
            App Modules
          </div>
          
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('income')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Wallet className="w-4 h-4" />
              <span>Income Logger</span>
            </div>
            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
              activeTab === 'income' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              Deals
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('taxes')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'taxes' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Receipt className="w-4 h-4" />
              <span>Tax & eTIMS</span>
            </div>
            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
              activeTab === 'taxes' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
            }`}>
              2026
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'calendar' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <CalendarDays className="w-4 h-4" />
              <span>Tax Calendar</span>
            </div>
            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded font-mono ${
              activeTab === 'calendar' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
            }`}>
              20th
            </span>
          </button>
          
          <button 
            onClick={() => setActiveTab('ip')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'ip' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4" />
              <span>KECOBO IP</span>
            </div>
            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
              activeTab === 'ip' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-800'
            }`}>
              NRR
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('redline')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'redline' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Contract Redliner</span>
            </div>
            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
              activeTab === 'redline' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
            }`}>
              AI Shield
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('crossborder')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'crossborder' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Globe2 className="w-4 h-4" />
              <span>Cross-Border</span>
            </div>
            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
              activeTab === 'crossborder' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800'
            }`}>
              W-8BEN
            </span>
          </button>
          
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'ai' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Compliance</span>
          </button>

          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 mt-3 px-3">
            Account & Support
          </div>

          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-blue-600" />
              <span>Creator Profile</span>
            </div>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
              {profile.kraPin ? 'Ready' : 'Setup'}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('kb')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'kb' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Knowledge Base</span>
          </button>

          <button 
            onClick={() => setActiveTab('setup')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'setup' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Onboarding Setup</span>
          </button>

          {/* Desktop Install App Banner */}
          <div className="mt-auto pt-3">
            <PWAInstallButton variant="banner" />
          </div>
        </aside>

        {/* Scrollable Main Viewport */}
        <div className="flex-1 p-3.5 sm:p-6 md:p-8 overflow-y-auto pb-24 md:pb-12 overscroll-y-contain">
          <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
            
            {/* Tab Views */}
            <div className="animate-in fade-in slide-from-bottom-3 duration-300">
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
                        <p className="text-xs font-semibold text-slate-500 uppercase">Withholding Tax Credit</p>
                        <SensitiveShield 
                          inline 
                          value={`KES ${monthlySummary.totalWhtDeductedKes.toLocaleString()}`} 
                          type="currency" 
                          label="Withholding Credit" 
                        />
                      </div>
                      <div className="text-xl font-bold font-mono">
                        <SensitiveShield 
                          value={`KES ${monthlySummary.totalWhtDeductedKes.toLocaleString()}`} 
                          type="currency" 
                          label="WHT Credit" 
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2">5% Withholding Tax from logged payouts</p>
                    </div>
                    
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Gross Platform Income</p>
                        <SensitiveShield 
                          inline 
                          value={`KES ${monthlySummary.totalGrossKes.toLocaleString()}`} 
                          type="currency" 
                          label="Gross Income" 
                        />
                      </div>
                      <div className="text-xl font-bold font-mono text-slate-800">
                        <SensitiveShield 
                          value={`KES ${monthlySummary.totalGrossKes.toLocaleString()}`} 
                          type="currency" 
                          label="Gross Income" 
                        />
                      </div>
                      <p className="text-[10px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Reconciled with eTIMS
                      </p>
                    </div>
                    
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-start">
                      <button 
                        onClick={handleDownloadKraReport}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs shadow-sm cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Download KRA Report
                      </button>
                      <p className="text-[10px] text-slate-400 text-center w-full mt-2">
                        Official compliance summary for KRA PIN: {profile.kraPin || 'Pending'}
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

      {/* Mobile Bottom Navigation App Bar (Thumb-Accessible) */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg pb-[max(env(safe-area-inset-bottom,0px),8px)]"
        aria-label="Mobile Navigation"
      >
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'overview' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${activeTab === 'overview' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('income')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'income' ? 'text-emerald-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet className={`w-5 h-5 ${activeTab === 'income' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">Income</span>
        </button>

        <button
          onClick={() => setActiveTab('taxes')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'taxes' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className={`w-5 h-5 ${activeTab === 'taxes' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">Taxes</span>
        </button>

        <button
          onClick={() => setActiveTab('ip')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'ip' ? 'text-indigo-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className={`w-5 h-5 ${activeTab === 'ip' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">IP Vault</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </nav>
    </div>
  );
}

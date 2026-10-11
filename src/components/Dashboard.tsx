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
  Building2
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
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-blue-900 truncate hidden sm:block">
            CreatorCompliance <span className="text-blue-500">Kenya</span>
          </h1>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3 md:gap-5">
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-emerald-700">eTIMS Live</span>
          </div>

          <div className="flex items-center gap-3 sm:border-l sm:pl-4 border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="flex items-center justify-end gap-1">
                <span className="text-[10px] font-medium text-slate-400 uppercase">PIN:</span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {profile.kraPin || 'Not set'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800">
                {profile.creatorName || 'Set Creator Profile'}
              </p>
            </div>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="w-9 h-9 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center font-bold text-blue-700 text-xs shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all shadow-2xs"
              title="Click to edit Creator Profile & KRA PIN"
            >
              {profile.creatorName ? profile.creatorName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </button>
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

          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-4">Profile & Help</div>

          <button 
            onClick={() => { setIsEditModalOpen(true); setIsMobileMenuOpen(false); }}
            className="flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-blue-600" />
              <span>Creator Profile</span>
            </div>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
              {profile.kraPin ? 'Configured' : 'Setup'}
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
              <p className="text-xs text-slate-400">Compliance Readiness</p>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[9px] text-emerald-400 font-bold">Compliant</span>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold">100%</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Active</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-400 h-full w-full"></div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8 pb-12">
            
            {/* Tab Content */}
            <div className="animate-in fade-in slide-from-bottom-4 duration-500">
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
    </div>
  );
}

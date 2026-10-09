import React, { useState, useRef } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Download, 
  FileText, 
  Calculator, 
  ArrowRight, 
  ShieldCheck, 
  ScanFace, 
  Fingerprint, 
  Lock, 
  Unlock,
  Calendar 
} from 'lucide-react';
import { exportElementToPdf } from '../utils/pdfGenerator';
import { useBiometrics } from '../context/BiometricContext';
import { useIncome } from '../context/IncomeContext';
import SensitiveShield from './SensitiveShield';

interface OverviewDashboardProps {
  onNavigateToTaxes?: () => void;
  onNavigateToIp?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToIncome?: () => void;
  onNavigateToRedline?: () => void;
  onNavigateToCrossBorder?: () => void;
}

export default function OverviewDashboard({ 
  onNavigateToTaxes, 
  onNavigateToIp, 
  onNavigateToCalendar,
  onNavigateToIncome,
  onNavigateToRedline,
  onNavigateToCrossBorder
}: OverviewDashboardProps) {
  const { monthlySummary, selectedMonth, selectedYear } = useIncome();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const { 
    isUnlocked, 
    settings, 
    triggerBiometricAuth, 
    lockVault, 
    setIsSettingsOpen 
  } = useBiometrics();

  const BiometricIcon = settings.primaryBiometric === 'fingerprint' ? Fingerprint : ScanFace;

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;

    if (settings.isEnabled && settings.requireAuthForPdfExport) {
      const authorized = await triggerBiometricAuth({
        reason: 'Authorize FaceID / Fingerprint to export sensitive KRA Tax Compliance and eTIMS PDF Report',
        target: 'PDF_EXPORT'
      });
      if (!authorized) return;
    }

    setIsDownloading(true);
    setDownloadError(null);
    try {
      await exportElementToPdf(reportRef.current, {
        filename: 'CreatorCompliance_Report_2026.pdf',
        format: 'a4',
        margin: 10
      });
    } catch (error) {
      console.error('Failed to generate PDF', error);
      setDownloadError('Could not generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compliance Overview</h1>
          <p className="text-sm text-slate-500">Monitor your KRA eTIMS, copyright, and digital tax posture.</p>
        </div>
        <div className="flex items-center gap-3">
          {downloadError && (
            <span className="text-xs text-rose-600 font-medium">{downloadError}</span>
          )}
          <button 
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-70"
          >
            {isDownloading ? (
               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isDownloading ? 'Generating...' : 'Download PDF Report'}
          </button>
        </div>
      </div>

      {/* Biometric Shield Status Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-4 md:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center shrink-0">
            <BiometricIcon className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Biometric Vault Protection</h3>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                isUnlocked 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              }`}>
                {isUnlocked ? 'Unlocked & Verified' : 'Locked (Masked)'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-1">
              <span>
                KRA PIN: <SensitiveShield inline value="P051829471Z" type="kraPin" label="KRA PIN" target="KRA" />
              </span>
              <span>
                KECOBO ID: <SensitiveShield inline value="29384722" type="idNumber" label="National ID" target="KECOBO" />
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          {isUnlocked ? (
            <button
              onClick={lockVault}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-white/15"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Lock Vault
            </button>
          ) : (
            <button
              onClick={() => triggerBiometricAuth({
                reason: 'Authenticate with FaceID / Touch ID to view unmasked KRA and KECOBO data',
                target: 'SYSTEM'
              })}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <BiometricIcon className="w-3.5 h-3.5" />
              Unlock with {settings.primaryBiometric === 'fingerprint' ? 'Fingerprint' : 'FaceID'}
            </button>
          )}

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white rounded-xl transition-colors border border-white/10"
            title="Biometric Settings"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div ref={reportRef} data-pdf-target className="space-y-8 bg-slate-50 p-2 sm:p-4 rounded-2xl">

      {/* Hero Score */}
      <section className="bg-blue-900 rounded-2xl p-6 md:p-10 shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-xl">
          <h2 className="text-3xl font-bold">Your 2026 Compliance Score is Strong</h2>
          <p className="text-blue-100 text-lg">
            You are meeting eTIMS invoicing requirements and withholding tax obligations. Keep logging your platform royalties.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl text-sm font-medium backdrop-blur-sm border border-white/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              TCC Status: Valid
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl text-sm font-medium backdrop-blur-sm border border-white/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              eTIMS Active
            </span>
          </div>
        </div>
        
        <div className="relative shrink-0 z-10">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-8 border-blue-500/30 flex items-center justify-center">
            <div className="w-full h-full rounded-full border-8 border-blue-400 border-t-transparent animate-[spin_3s_linear_infinite] absolute top-[-8px] left-[-8px]" style={{ transform: 'rotate(-45deg)' }}></div>
            <div className="text-center relative z-10">
              <span className="text-4xl md:text-5xl font-black">92</span>
              <span className="text-blue-400 font-bold ml-1">/100</span>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-800 rounded-full blur-3xl opacity-50"></div>
      </section>

      {/* 2026 eTIMS Tax Estimation Tool Feature Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">New: 2026 eTIMS Tax Liability Estimator</h3>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Live Engine
              </span>
            </div>
            <p className="text-slate-600 text-xs mt-1 max-w-xl leading-relaxed">
              Calculate projected 2026 tax liabilities, model graduated PAYE bands, offset eTIMS allowable business expenses, and simulate statutory SHIF (2.75%) and Affordable Housing deductions in real time.
            </p>
          </div>
        </div>
        {onNavigateToTaxes && (
          <button
            onClick={onNavigateToTaxes}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:gap-3 shrink-0"
          >
            Launch Tax Estimator
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Comprehensive Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">iTax TCC Status</p>
          <p className="text-xl font-bold text-emerald-600">Active Valid</p>
          <p className="text-[10px] text-slate-400 mt-2">Expires: 31 Dec 2026</p>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-slate-500 uppercase">Withholding Credit</p>
            <SensitiveShield 
              inline 
              value="KES 42,450" 
              type="currency" 
              label="Withholding Credit" 
              target="TAX_ESTIMATES" 
            />
          </div>
          <div className="text-xl font-bold font-mono">
            <SensitiveShield 
              value="KES 42,450" 
              type="currency" 
              label="Withholding Credit" 
              target="TAX_ESTIMATES" 
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">From Meta & YouTube</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Pending eTIMS</p>
          <p className="text-xl font-bold text-slate-900">0 Invoices</p>
          <p className="text-[10px] text-emerald-500 font-medium mt-2">All synced to KRA</p>
        </div>

        <div 
          onClick={onNavigateToIp}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-slate-500 uppercase">KECOBO IP Registrations</p>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              Checklist &rarr;
            </span>
          </div>
          <p className="text-xl font-bold text-slate-900">3 Works</p>
          <p className="text-[10px] text-slate-400 mt-2">Latest: NRR/2026/0442 • Click for Guide</p>
        </div>
      </div>

      {/* Alerts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Recent Revenue & Deductions</h3>
            <button className="text-xs font-bold text-blue-600">View All</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
              <tr>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">Gross Amount</th>
                <th className="px-6 py-3">WHT (5%)</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium">YouTube Partner Program</td>
                <td className="px-6 py-4">
                  <SensitiveShield inline value="KES 124,500" type="currency" label="YouTube Earnings" target="TAX_ESTIMATES" />
                </td>
                <td className="px-6 py-4 text-orange-600">
                  <SensitiveShield inline value="-6,225" type="currency" label="YouTube WHT" target="TAX_ESTIMATES" />
                </td>
                <td className="px-6 py-4"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-medium">Credited</span></td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium">Brand Deal: Safaricom Ltd</td>
                <td className="px-6 py-4">
                  <SensitiveShield inline value="KES 450,000" type="currency" label="Brand Deal Revenue" target="TAX_ESTIMATES" />
                </td>
                <td className="px-6 py-4 text-orange-600">
                  <SensitiveShield inline value="-22,500" type="currency" label="Brand Deal WHT" target="TAX_ESTIMATES" />
                </td>
                <td className="px-6 py-4"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-medium">Credited</span></td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium">Meta Reels Bonus</td>
                <td className="px-6 py-4">
                  <SensitiveShield inline value="KES 18,200" type="currency" label="Meta Reels Bonus" target="TAX_ESTIMATES" />
                </td>
                <td className="px-6 py-4 text-orange-600">
                  <SensitiveShield inline value="-910" type="currency" label="Meta WHT" target="TAX_ESTIMATES" />
                </td>
                <td className="px-6 py-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">Pending</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-5 border-l-4 border-l-red-500">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              AI Compliance Alert
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Your recent video <span className="font-medium">"Tech Review 2026"</span> was flagged for potential synthetic audio. Update the description with an AI disclosure to comply with the AI Bill.
            </p>
            <button className="text-xs font-bold text-red-600 hover:text-red-700">Resolve Issue &rarr;</button>
          </div>

          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5 border-l-4 border-l-amber-500">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              eTIMS Deadline
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              You have an outstanding expense claim for <span className="font-medium">Video Equipment (KES 120,000)</span>. Upload the supplier's eTIMS invoice by Friday to ensure it's deductible.
            </p>
            <button 
              onClick={onNavigateToTaxes}
              className="text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              Upload Invoice &rarr;
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5 border-l-4 border-l-emerald-600">
            <h3 className="font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-base">💰</span>
                <span>Streaming & Brand Earnings</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                Live Feed
              </span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              KES {monthlySummary.totalGrossKes.toLocaleString()} logged for October across {monthlySummary.entryCount} sources (KES {monthlySummary.totalWhtDeductedKes.toLocaleString()} in 5% WHT credits).
            </p>
            <button 
              onClick={onNavigateToIncome}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Manage Income & Deals &rarr;</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-5 border-l-4 border-l-blue-600">
            <h3 className="font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>KRA 20th Tax Deadline</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                20th Monthly
              </span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              VAT Returns (Form VAT 3) and Turnover Tax (TOT 3%) must be remitted by the 20th of every month on KRA iTax.
            </p>
            <button 
              onClick={onNavigateToCalendar}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Open Monthly Tax Calendar &rarr;</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-5 border-l-4 border-l-rose-600">
            <h3 className="font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-base">⚖️</span>
                <span>AI Contract Redliner</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">
                Anti-Predatory
              </span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Screen brand deal agreements for perpetual copyright loss, synthetic AI likeness grabs, and generate international invoices with SWIFT clearance.
            </p>
            <button 
              onClick={onNavigateToRedline}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <span>Audit Agreement & Invoice &rarr;</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-sky-200 shadow-sm p-5 border-l-4 border-l-sky-600">
            <h3 className="font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-base">🌐</span>
                <span>Cross-Border Tax & W-8BEN</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">
                YouTube & KDP
              </span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Prevent 30% flat withholdings on global earnings. Line-by-line W-8BEN guidance using your KRA PIN and Foreign Tax Credit calculations.
            </p>
            <button 
              onClick={onNavigateToCrossBorder}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>Calculate Withholding & W-8BEN &rarr;</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
  );
}

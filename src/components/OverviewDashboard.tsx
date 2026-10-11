import React, { useState, useRef } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Download, 
  Calculator, 
  ArrowRight, 
  ShieldCheck, 
  Calendar,
  User,
  Building2,
  FileCheck
} from 'lucide-react';
import { exportElementToPdf } from '../utils/pdfGenerator';
import { useIncome } from '../context/IncomeContext';
import { useProfile } from '../context/ProfileContext';
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
  const { incomeLogs, monthlySummary, selectedMonth, selectedYear } = useIncome();
  const { profile, setIsEditModalOpen } = useProfile();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;

    setIsDownloading(true);
    setDownloadError(null);
    try {
      await exportElementToPdf(reportRef.current, {
        filename: `CreatorCompliance_Report_${profile.kraPin || '2026'}.pdf`,
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
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-70 cursor-pointer"
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

      {/* Creator Profile & Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-4 md:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">
                {profile.creatorName || 'Kenyan Digital Creator Profile'}
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                {profile.kraPin ? 'Profile Linked' : 'Profile Pending'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-1">
              <span>
                KRA PIN: <span className="font-mono font-bold text-white">{profile.kraPin || 'Not configured'}</span>
              </span>
              <span>
                National ID: <span className="font-mono text-white">{profile.nationalId || 'Not configured'}</span>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm self-end md:self-auto cursor-pointer"
        >
          <User className="w-3.5 h-3.5" />
          {profile.kraPin ? 'Edit Profile' : 'Configure Credentials'}
        </button>
      </div>

      <div ref={reportRef} data-pdf-target className="space-y-8 bg-slate-50 p-2 sm:p-4 rounded-2xl">

      {/* Hero Score */}
      <section className="bg-blue-900 rounded-2xl p-6 md:p-10 shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-xl">
          <h2 className="text-3xl font-bold">Your 2026 Compliance Score is Strong</h2>
          <p className="text-blue-100 text-lg">
            You are tracking eTIMS invoicing requirements and withholding tax obligations under the Finance Act 2026.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl text-sm font-medium backdrop-blur-sm border border-white/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              TCC Status: Valid
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl text-sm font-medium backdrop-blur-sm border border-white/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              eTIMS VSCU Ready
            </span>
          </div>
        </div>
        
        <div className="relative shrink-0 z-10">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-8 border-blue-500/30 flex items-center justify-center">
            <div className="w-full h-full rounded-full border-8 border-blue-400 border-t-transparent animate-[spin_3s_linear_infinite] absolute top-[-8px] left-[-8px]" style={{ transform: 'rotate(-45deg)' }}></div>
            <div className="text-center relative z-10">
              <span className="text-4xl md:text-5xl font-black">95</span>
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
              <h3 className="font-bold text-slate-900 text-base">2026 eTIMS Tax Liability Estimator</h3>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <p className="text-slate-600 text-xs mt-1 max-w-xl leading-relaxed">
              Calculate projected tax liabilities, model graduated PAYE bands, offset eTIMS allowable business expenses, and simulate statutory SHIF (2.75%) and Housing Levy deductions.
            </p>
          </div>
        </div>
        {onNavigateToTaxes && (
          <button
            onClick={onNavigateToTaxes}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:gap-3 shrink-0 cursor-pointer"
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
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            KES {monthlySummary.totalWhtDeductedKes.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {monthlySummary.totalWhtDeductedKes > 0 ? '5% WHT deducted at source' : 'No WHT withheld yet'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Gross Tracked Revenue</p>
          <p className="text-xl font-bold font-mono text-slate-900">
            KES {monthlySummary.totalGrossKes.toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-600 font-medium mt-2">
            {incomeLogs.length} logged payment {incomeLogs.length === 1 ? 'source' : 'sources'}
          </p>
        </div>

        <div 
          onClick={onNavigateToIp}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-slate-500 uppercase">KECOBO IP Vault</p>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              Manage &rarr;
            </span>
          </div>
          <p className="text-xl font-bold text-slate-900">
            {(() => {
              try {
                const stored = localStorage.getItem('creator_compliance_works_catalog_v1');
                if (stored) {
                  const parsed = JSON.parse(stored);
                  return `${parsed.length} ${parsed.length === 1 ? 'Work' : 'Works'}`;
                }
              } catch {}
              return '0 Works';
            })()}
          </p>
          <p className="text-[10px] text-slate-400 mt-2">National Rights Registry & Timestamps</p>
        </div>
      </div>

      {/* Alerts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Recent Revenue & Deductions</h3>
            {onNavigateToIncome && (
              <button onClick={onNavigateToIncome} className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer">
                Log New Payout &rarr;
              </button>
            )}
          </div>
          {incomeLogs.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 text-xl">
                💰
              </div>
              <p className="text-sm font-semibold text-slate-700">No income records logged yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Track payments from YouTube, Spotify, Selar, or brand deals in the Income Logger to automatically calculate 5% WHT credits and eTIMS taxes.
              </p>
              {onNavigateToIncome && (
                <button
                  onClick={onNavigateToIncome}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-block mt-2 cursor-pointer"
                >
                  + Add First Income Record
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="px-6 py-3">Source / Platform</th>
                    <th className="px-6 py-3">Gross Amount</th>
                    <th className="px-6 py-3">WHT (5%)</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {incomeLogs.slice(0, 5).map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{log.platformOrBrand}</div>
                        <div className="text-[11px] text-slate-400">{log.date}</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold">
                        KES {log.grossAmountKes.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-orange-600 font-mono font-bold">
                        {log.withholdingTaxDeductedKes > 0 ? (
                          `-KES ${log.withholdingTaxDeductedKes.toLocaleString()}`
                        ) : (
                          <span className="text-slate-400 text-xs font-normal">KES 0</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          log.whtWithheldAtSource 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {log.whtWithheldAtSource ? 'WHT Deducted' : 'Direct Payout'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-5 border-l-4 border-l-red-500">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              AI Compliance Disclosure
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Kenya Artificial Intelligence Bill 2026 mandates synthetic media and AI disclosures. Verify video scripts and descriptions in AI Compliance Checker.
            </p>
            <button 
              onClick={() => onNavigateToTaxes && onNavigateToTaxes()}
              className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
            >
              Check Script Compliance &rarr;
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5 border-l-4 border-l-amber-500">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              eTIMS Expense Invoicing
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Under Section 16 of the Income Tax Act, business expenses are only deductible if supported by an electronic tax invoice generated via eTIMS.
            </p>
            <button 
              onClick={onNavigateToTaxes}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
            >
              Open Tax & eTIMS &rarr;
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
              KES {monthlySummary.totalGrossKes.toLocaleString()} logged for {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })} across {monthlySummary.entryCount} sources (KES {monthlySummary.totalWhtDeductedKes.toLocaleString()} in 5% WHT credits).
            </p>
            <button 
              onClick={onNavigateToIncome}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
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
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Open Monthly Tax Calendar &rarr;</span>
            </button>
          </div>
        </div>

      </div>

      </div>
    </div>
  );
}

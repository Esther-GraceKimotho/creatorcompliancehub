import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TaxEstimateInputs } from '../types';
import { calculateProjected2026Tax } from '../utils/taxCalculator';
import { 
  Calculator, 
  TrendingUp, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  DollarSign, 
  Calendar, 
  Receipt,
  Scale
} from 'lucide-react';
import { exportElementToPdf } from '../utils/pdfGenerator';
import { useBiometrics } from '../context/BiometricContext';
import { useIncome } from '../context/IncomeContext';

interface EtimsTaxEstimatorProps {
  onNavigateToInvoice?: (suggestedAmount?: number) => void;
  onNavigateToIncomeLogger?: () => void;
}

export default function EtimsTaxEstimator({ 
  onNavigateToInvoice,
  onNavigateToIncomeLogger 
}: EtimsTaxEstimatorProps) {
  const { settings, triggerBiometricAuth } = useBiometrics();
  const { 
    syncedTaxInputs, 
    lastSyncedAt, 
    lastSyncedMonthLabel, 
    feedIntoTaxEstimator,
    selectedMonth,
    selectedYear,
    isAutoSyncEnabled
  } = useIncome();

  const [inputs, setInputs] = useState<TaxEstimateInputs>(() => {
    if (syncedTaxInputs) {
      return syncedTaxInputs;
    }
    return {
      monthlyAdSense: 120800, // Matches default October sample data (AdSense + Spotify + TikTok + Skiza)
      monthlyBrandDeals: 290000, // Matches October sample data (Safaricom + Equity Bank)
      monthlyDigitalProducts: 32500,
      monthlyServices: 60000,
      monthlyOtherIncome: 0,
      monthlyEtimsExpenses: 110000,
      monthlyNonEtimsExpenses: 25000,
      hasWithholdingTaxApplied: true,
      selectedRegime: 'GRADUATED'
    };
  });

  // Keep inputs in sync if syncedTaxInputs updates from IncomeLogger
  useEffect(() => {
    if (syncedTaxInputs) {
      setInputs(syncedTaxInputs);
    }
  }, [syncedTaxInputs]);

  const [activeView, setActiveView] = useState<'calculator' | 'seasonal' | 'installments'>('calculator');
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Month-by-month seasonal multiplier adjustments
  const [seasonalAdjustments, setSeasonalAdjustments] = useState<number[]>([
    0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.0, 1.1, 1.15, 1.2, 1.35, 1.45 // Jan to Dec
  ]);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Quick preset personas
  const applyPreset = (preset: 'emerging' | 'fulltime' | 'studio' | 'agency') => {
    switch (preset) {
      case 'emerging':
        setInputs({
          monthlyAdSense: 20000,
          monthlyBrandDeals: 35000,
          monthlyDigitalProducts: 10000,
          monthlyServices: 15000,
          monthlyOtherIncome: 0,
          monthlyEtimsExpenses: 20000,
          monthlyNonEtimsExpenses: 8000,
          hasWithholdingTaxApplied: true,
          selectedRegime: 'GRADUATED'
        });
        break;
      case 'fulltime':
        setInputs({
          monthlyAdSense: 65000,
          monthlyBrandDeals: 160000,
          monthlyDigitalProducts: 40000,
          monthlyServices: 55000,
          monthlyOtherIncome: 10000,
          monthlyEtimsExpenses: 75000,
          monthlyNonEtimsExpenses: 20000,
          hasWithholdingTaxApplied: true,
          selectedRegime: 'GRADUATED'
        });
        break;
      case 'studio':
        setInputs({
          monthlyAdSense: 150000,
          monthlyBrandDeals: 380000,
          monthlyDigitalProducts: 90000,
          monthlyServices: 180000,
          monthlyOtherIncome: 30000,
          monthlyEtimsExpenses: 240000,
          monthlyNonEtimsExpenses: 40000,
          hasWithholdingTaxApplied: true,
          selectedRegime: 'GRADUATED'
        });
        break;
      case 'agency':
        setInputs({
          monthlyAdSense: 350000,
          monthlyBrandDeals: 750000,
          monthlyDigitalProducts: 150000,
          monthlyServices: 400000,
          monthlyOtherIncome: 50000,
          monthlyEtimsExpenses: 520000,
          monthlyNonEtimsExpenses: 70000,
          hasWithholdingTaxApplied: true,
          selectedRegime: 'GRADUATED'
        });
        break;
    }
  };

  const results = useMemo(() => calculateProjected2026Tax(inputs), [inputs]);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;

    if (settings.isEnabled && settings.requireAuthForPdfExport) {
      const authorized = await triggerBiometricAuth({
        reason: 'Authorize FaceID / Fingerprint to export 2026 eTIMS Tax Liability Projection PDF',
        target: 'TAX_ESTIMATES'
      });
      if (!authorized) return;
    }

    setIsExporting(true);
    try {
      await exportElementToPdf(reportRef.current, {
        filename: `KRA_2026_eTIMS_Tax_Projection_${Date.now()}.pdf`,
        format: 'a4',
        margin: 8
      });
    } catch (err) {
      console.error('Failed to export PDF', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleInputChange = (field: keyof TaxEstimateInputs, value: number | boolean | string) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-2">
            <Calculator className="w-3.5 h-3.5" />
            Kenya Finance Act & eTIMS 2026 Engine
          </div>
          <h2 className="text-2xl font-bold tracking-tight">eTIMS Tax Projection & Liability Estimator</h2>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Simulate your projected 2026 tax obligations across graduated income tax bands, 
            eTIMS deductible expense offsets, 5% withholding credits, and statutory levies (SHIF & Housing).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-60"
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download PDF Report
          </button>

          {onNavigateToInvoice && (
            <button
              onClick={() => onNavigateToInvoice(results.projectedMonthlyGross)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <Receipt className="w-4 h-4" />
              Generate Monthly eTIMS
            </button>
          )}
        </div>
      </div>

      {/* Live Synced Income Banner */}
      <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Connected to Monthly Income Logger
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-mono">
                {lastSyncedMonthLabel || 'October 2026'}
              </span>
            </div>
            <p className="text-xs text-emerald-800 mt-0.5">
              Current simulation fed from logged streaming (KES {inputs.monthlyAdSense.toLocaleString()}) & brand deals (KES {inputs.monthlyBrandDeals.toLocaleString()}).
              {lastSyncedAt && <span className="text-emerald-700 font-mono ml-1">Synced at {lastSyncedAt}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={() => {
              const updated = feedIntoTaxEstimator(selectedMonth, selectedYear);
              setInputs(updated);
            }}
            className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
            title="Refresh values from Income Logger"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Re-sync Actuals
          </button>

          {onNavigateToIncomeLogger && (
            <button
              onClick={onNavigateToIncomeLogger}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
            >
              Log Income <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Preset Personas Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Quick Simulation Profiles:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const updated = feedIntoTaxEstimator(selectedMonth, selectedYear);
              setInputs(updated);
            }}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
          >
            <DollarSign className="w-3 h-3" />
            My Actual Logs (Synced)
          </button>
          <button
            onClick={() => applyPreset('emerging')}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Part-Time (~80k/mo)
          </button>
          <button
            onClick={() => applyPreset('fulltime')}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Full-Time (~330k/mo)
          </button>
          <button
            onClick={() => applyPreset('studio')}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Studio Team (~830k/mo)
          </button>
          <button
            onClick={() => applyPreset('agency')}
            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Agency (~1.7M/mo)
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveView('calculator')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeView === 'calculator'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Tax Liability Calculator
        </button>
        <button
          onClick={() => setActiveView('seasonal')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeView === 'seasonal'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          12-Month Seasonal Forecast
        </button>
        <button
          onClick={() => setActiveView('installments')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeView === 'installments'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          KRA Installment Schedule
        </button>
      </div>

      {/* Main Estimator View Container (Used for PDF Export) */}
      <div ref={reportRef} className="space-y-6 bg-slate-50 p-1 rounded-2xl">
        
        {/* Mandatory VAT Warning if Threshold Exceeded */}
        {results.isVatMandatory && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 text-sm">
                Mandatory KRA VAT Registration Threshold Reached (KES 5,000,000+)
              </p>
              <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
                Your projected annual turnover is <strong>KES {results.projectedAnnualGross.toLocaleString()}</strong>. 
                Under Kenyan tax laws, entities with taxable turnover exceeding KES 5 Million must register for 16% VAT 
                and transmit validated eTIMS buyer invoices for all business transactions.
              </p>
            </div>
          </div>
        )}

        {/* eTIMS Deduction Advantage Hero Callout */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-950 text-base">
                eTIMS Section 16 Tax Advantage: KES {results.taxSavingsWithEtims.toLocaleString()} Saved
              </h4>
              <p className="text-emerald-800 text-xs mt-0.5 leading-relaxed">
                By maintaining electronic tax invoices (eTIMS) for your KES {results.totalEtimsDeductibleExpenses.toLocaleString()} annual production costs, 
                you prevent KRA from disallowing your business expenses and slash your 2026 taxable income by that full amount!
              </p>
            </div>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-xl border border-emerald-300 text-right shrink-0">
            <div className="text-[10px] text-slate-500 font-medium uppercase">Allowed Deductions</div>
            <div className="text-base font-extrabold text-emerald-700">
              KES {results.totalEtimsDeductibleExpenses.toLocaleString()}
            </div>
          </div>
        </div>

        {activeView === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Monthly Inputs Form */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Income Sources Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-slate-900 text-base">Monthly Income Streams</h3>
                  </div>
                  <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full">
                    KES {results.projectedMonthlyGross.toLocaleString()} / mo
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>YouTube / Meta AdSense & TikTok Rewards</span>
                      <span className="text-slate-400 font-normal">Monthly (KES)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">KES</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={inputs.monthlyAdSense || ''}
                        onChange={e => handleInputChange('monthlyAdSense', parseFloat(e.target.value) || 0)}
                        className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Brand Partnerships & Sponsored Campaigns</span>
                      <span className="text-slate-400 font-normal">Monthly (KES)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">KES</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={inputs.monthlyBrandDeals || ''}
                        onChange={e => handleInputChange('monthlyBrandDeals', parseFloat(e.target.value) || 0)}
                        className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-xs">
                      <label htmlFor="wht-toggle" className="text-slate-600 font-medium cursor-pointer">
                        Apply 5% Resident Withholding Tax Credit (WHT deducted by agencies)
                      </label>
                      <input
                        id="wht-toggle"
                        type="checkbox"
                        checked={inputs.hasWithholdingTaxApplied}
                        onChange={e => handleInputChange('hasWithholdingTaxApplied', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Digital Products, E-books, Merch & Presets</span>
                      <span className="text-slate-400 font-normal">Monthly (KES)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">KES</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={inputs.monthlyDigitalProducts || ''}
                        onChange={e => handleInputChange('monthlyDigitalProducts', parseFloat(e.target.value) || 0)}
                        className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Freelance Production, UGC, Video Editing & Consulting</span>
                      <span className="text-slate-400 font-normal">Monthly (KES)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">KES</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={inputs.monthlyServices || ''}
                        onChange={e => handleInputChange('monthlyServices', parseFloat(e.target.value) || 0)}
                        className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Other Creator Income (Fan Donations, Subscriptions)</span>
                      <span className="text-slate-400 font-normal">Monthly (KES)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">KES</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={inputs.monthlyOtherIncome || ''}
                        onChange={e => handleInputChange('monthlyOtherIncome', parseFloat(e.target.value) || 0)}
                        className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Expenses Breakdown Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-slate-900 text-base">Business Production Expenses</h3>
                  </div>
                  <span className="text-xs text-slate-400">Section 16 eTIMS Rules</span>
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-1">
                      <span>eTIMS Compliant Expenses (Deductible)</span>
                      <span className="text-emerald-700 font-semibold">Allowed by KRA</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 mb-2">
                      Gear bought from VAT vendors, studio rent with electronic invoices, cloud apps, verified fuel/broadband.
                    </p>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-emerald-700 font-medium">KES</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={inputs.monthlyEtimsExpenses || ''}
                        onChange={e => handleInputChange('monthlyEtimsExpenses', parseFloat(e.target.value) || 0)}
                        className="w-full pl-12 pr-4 py-2 bg-white border border-emerald-300 rounded-xl text-sm font-bold text-emerald-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-900 mb-1">
                      <span>Informal / Non-eTIMS Expenses (Disallowed)</span>
                      <span className="text-rose-600 font-semibold">Non-Deductible</span>
                    </div>
                    <p className="text-[11px] text-rose-700 mb-2">
                      Informal transport, cash payments, casual assistants without KRA eTIMS invoice generation.
                    </p>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-rose-700 font-medium">KES</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={inputs.monthlyNonEtimsExpenses || ''}
                        onChange={e => handleInputChange('monthlyNonEtimsExpenses', parseFloat(e.target.value) || 0)}
                        className="w-full pl-12 pr-4 py-2 bg-white border border-rose-300 rounded-xl text-sm font-bold text-rose-900 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 2026 Tax Liability Breakdown & Regime Comparison */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Projected Annual Gross</span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">
                    KES {results.projectedAnnualGross.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    KES {results.projectedMonthlyGross.toLocaleString()} / mo
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Taxable Net Profit</span>
                  <div className="text-xl font-extrabold text-blue-900 mt-1">
                    KES {results.taxableNetIncome.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    After eTIMS deductions
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Net Annual Income Tax</span>
                  <div className="text-xl font-extrabold text-rose-600 mt-1">
                    KES {results.netAnnualIncomeTax.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    KES {Math.round(results.monthlyIncomeTax).toLocaleString()} / mo
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Effective Tax & Levy Rate</span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">
                    {results.effectiveTaxRate.toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-slate-500">
                    All taxes & levies included
                  </span>
                </div>
              </div>

              {/* Detailed Tax Computation Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-600" />
                  KRA Graduated Income Tax Brackets (2026 Bands)
                </h4>

                <div className="space-y-2">
                  {results.brackets.map((b, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                          {b.rate}%
                        </span>
                        <span className="text-slate-700">{b.bracketName}</span>
                      </div>
                      <span className="font-semibold text-slate-900">
                        KES {Math.round(b.taxAmount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Deductions & Reliefs Subtotal */}
                <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Gross Annual Tax:</span>
                    <span className="font-semibold text-slate-900">KES {Math.round(results.grossAnnualTax).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Less Personal Relief (KES 2,400/mo):
                    </span>
                    <span className="font-semibold">- KES {results.personalRelief.toLocaleString()}</span>
                  </div>
                  {inputs.hasWithholdingTaxApplied && (
                    <div className="flex justify-between text-blue-600">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Less Brand Withholding Tax Credit (5% WHT):
                      </span>
                      <span className="font-semibold">- KES {results.withholdingTaxCredits.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-100 text-slate-900">
                    <span>Final Net Income Tax:</span>
                    <span className="text-rose-600">KES {Math.round(results.netAnnualIncomeTax).toLocaleString()}</span>
                  </div>
                </div>

                {/* Statutory Levies Section */}
                <div className="pt-4 border-t border-slate-200">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    2026 Mandatory Statutory Levies
                  </h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-700">
                      <span>Social Health Insurance Fund (SHIF @ 2.75%):</span>
                      <span className="font-semibold">KES {Math.round(results.annualSHIF).toLocaleString()} / yr</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Affordable Housing Levy (1.5% Gross):</span>
                      <span className="font-semibold">KES {Math.round(results.annualHousingLevy).toLocaleString()} / yr</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>NSSF Voluntary/Self-Employed (KES 2,160/mo):</span>
                      <span className="font-semibold">KES {results.annualNSSF.toLocaleString()} / yr</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-100 text-slate-900">
                      <span>Total Annual Obligations (Tax + Levies):</span>
                      <span className="text-blue-900">KES {Math.round(results.totalStatutoryAndTax).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regime Recommendation: Individual Graduated vs Turnover Tax (TOT) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    Turnover Tax (TOT @ 3%) vs Graduated Income Tax
                  </h4>
                  <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded ${
                    results.recommendedRegime === 'TOT' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    Recommended: {results.recommendedRegime === 'TOT' ? 'Turnover Tax' : 'Graduated Tax'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <p className="font-bold text-slate-800">Graduated Income Tax</p>
                    <p className="text-slate-500 text-[11px] mt-1">Based on net profit after eTIMS expense deductions.</p>
                    <p className="text-base font-extrabold text-slate-900 mt-2">
                      KES {Math.round(results.netAnnualIncomeTax).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-purple-200 bg-purple-50/50">
                    <p className="font-bold text-purple-900">Turnover Tax (3% Gross)</p>
                    <p className="text-purple-700 text-[11px] mt-1">Applicable for annual turnover between KES 1M - 25M.</p>
                    <p className="text-base font-extrabold text-purple-900 mt-2">
                      {results.totProjectedTax > 0 
                        ? `KES ${Math.round(results.totProjectedTax).toLocaleString()}`
                        : 'Not eligible (< 1M)'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
                  {results.recommendedRegime === 'TOT' ? (
                    <span>
                      💡 <strong>Tax Tip:</strong> Electing for Turnover Tax (TOT) can save you approximately{' '}
                      <strong>KES {Math.round(results.netAnnualIncomeTax - results.totProjectedTax).toLocaleString()}</strong> in 2026{' '}
                      because your profit margin is high relative to your eTIMS deductible expenses.
                    </span>
                  ) : (
                    <span>
                      💡 <strong>Tax Tip:</strong> Graduated Income Tax is more advantageous because your valid eTIMS deductions{' '}
                      (KES {results.totalEtimsDeductibleExpenses.toLocaleString()}) substantially bring down your taxable profit below the 3% gross mark.
                    </span>
                  )}
                </p>
              </div>

              {/* Net Creator Take-Home Summary */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Projected Net Annual Take-Home</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    KES {Math.round(results.projectedAnnualNetTakeHome).toLocaleString()}
                  </div>
                  <span className="text-xs text-slate-400">
                    ~ KES {Math.round(results.projectedAnnualNetTakeHome / 12).toLocaleString()} per month in pocket
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Total Outflows</div>
                  <div className="text-sm font-bold text-slate-200 mt-1">
                    KES {Math.round(results.totalEtimsDeductibleExpenses + results.totalDisallowedExpenses + results.totalStatutoryAndTax).toLocaleString()}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 12-Month Seasonal Forecast View */}
        {activeView === 'seasonal' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Seasonal Revenue & Tax Liability Model</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kenyan creators typically experience peak ad rates (CPM) and brand spend in Q4 (Oct-Dec), with slower Q1 months.
                </p>
              </div>
              <button
                onClick={() => setSeasonalAdjustments([0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.0, 1.1, 1.15, 1.2, 1.35, 1.45])}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Reset to Default Seasonal Curve
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3">Month</th>
                    <th className="px-4 py-3">Activity Index</th>
                    <th className="px-4 py-3">Projected Gross</th>
                    <th className="px-4 py-3">eTIMS Deductions</th>
                    <th className="px-4 py-3">Taxable Net</th>
                    <th className="px-4 py-3">Est. Tax + Levies</th>
                    <th className="px-4 py-3">Net In-Pocket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {months.map((m, idx) => {
                    const factor = seasonalAdjustments[idx];
                    const mGross = results.projectedMonthlyGross * factor;
                    const mDeductions = inputs.monthlyEtimsExpenses * factor;
                    const mNet = Math.max(0, mGross - mDeductions);
                    const mTax = (results.totalStatutoryAndTax / 12) * factor;
                    const mTakeHome = Math.max(0, mGross - mDeductions - mTax);

                    return (
                      <tr key={m} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-bold text-slate-900">{m} 2026</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="0.5"
                              max="2.0"
                              step="0.05"
                              value={factor}
                              onChange={e => {
                                const newAdj = [...seasonalAdjustments];
                                newAdj[idx] = parseFloat(e.target.value);
                                setSeasonalAdjustments(newAdj);
                              }}
                              className="w-20 accent-blue-600"
                            />
                            <span className="font-mono text-slate-600">{Math.round(factor * 100)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          KES {Math.round(mGross).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-emerald-700">
                          KES {Math.round(mDeductions).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          KES {Math.round(mNet).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-rose-600 font-semibold">
                          KES {Math.round(mTax).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-600">
                          KES {Math.round(mTakeHome).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* KRA Installment Schedule View */}
        {activeView === 'installments' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                2026 KRA Quarterly Installment Tax Calendar
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Under Section 12 of Kenya's Income Tax Act, self-employed creators whose annual tax liability exceeds KES 40,000 
                must remit installment tax in four equal portions (25% each) on the 20th of the 4th, 6th, 9th, and 12th months.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {results.quarterlyInstallments.map((inst, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {inst.period}
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm mt-3">{inst.dueDate}</h5>
                    <p className="text-xs text-slate-500 mt-1">Payment via KRA iTax e-slip</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <span className="text-xs text-slate-400">Projected Due:</span>
                    <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                      KES {Math.round(inst.amount).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 leading-relaxed">
                <strong>Annual Return Deadline:</strong> The final balance of your 2026 tax returns and reconciliation 
                must be filed on or before <strong>30th June 2027</strong> on the KRA iTax portal.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

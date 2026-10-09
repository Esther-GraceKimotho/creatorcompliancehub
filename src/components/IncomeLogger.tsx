import React, { useState, useMemo, useRef } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Filter, 
  Search, 
  Calendar, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink, 
  HelpCircle, 
  Trash2, 
  Edit3, 
  Receipt, 
  Music, 
  Tv, 
  Video, 
  ShoppingBag, 
  Briefcase, 
  Radio, 
  X,
  CreditCard,
  Building2,
  Check,
  Smartphone
} from 'lucide-react';
import { CreatorIncomeLog, IncomeCategory } from '../types';
import { useIncome } from '../context/IncomeContext';
import { useBiometrics } from '../context/BiometricContext';
import SensitiveShield from './SensitiveShield';
import { exportElementToPdf } from '../utils/pdfGenerator';

interface IncomeLoggerProps {
  onNavigateToEstimator?: () => void;
  onNavigateToInvoice?: (suggestedAmount?: number) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PLATFORM_SUGGESTIONS: Record<IncomeCategory, string[]> = {
  STREAMING_ADSENSE: [
    'YouTube Partner Program (AdSense)',
    'Spotify for Artists & Apple Music',
    'TikTok Creator Rewards & LIVE Diamonds',
    'Meta / Instagram Reels Bonus & In-Stream Ads',
    'Twitch Subscriptions & Bits',
    'Boomplay Music & Mdundo Royalties'
  ],
  BRAND_DEAL: [
    'Safaricom PLC (Tuinuane / 5G Campaign)',
    'Equity Bank Kenya (Fintech / Remittance)',
    'East African Breweries (EABL)',
    'Jumia Kenya (Tech Week / Black Friday)',
    'Showmax / MultiChoice Kenya',
    'Airtel Kenya',
    'KCB Bank Kenya',
    'Bolt Kenya'
  ],
  DIGITAL_PRODUCTS: [
    'Selar Store (Lightroom Presets / Ebooks)',
    'Gumroad Digital Downloads',
    'Patreon Monthly Creator Subscriptions',
    'Podia / Teachable Video Course',
    'Buy Me a Coffee Fan Tips'
  ],
  CREATIVE_SERVICES: [
    'Commercial Videography & Drone Pilot',
    'Event MCing & Keynote Hosting',
    'Podcast Audio Production & Sound Design',
    'Influencer Strategy Consulting',
    'Voiceover & Narration Recording'
  ],
  ROYALTIES_SKIZA: [
    'Safaricom Skiza Tunes (Ringback Royalties)',
    'MCSK (Music Copyright Society of Kenya)',
    'PRISK (Performers Rights Society of Kenya)',
    'KAMP (Kenya Association of Music Producers)'
  ],
  OTHER_INCOME: [
    'Live Event Ticket Sales',
    'Merchandise Sales (T-Shirts / Hoodies)',
    'Speaking Engagement Honorarium'
  ]
};

export default function IncomeLogger({ 
  onNavigateToEstimator,
  onNavigateToInvoice 
}: IncomeLoggerProps) {
  const {
    incomeLogs,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    addIncomeLog,
    updateIncomeLog,
    deleteIncomeLog,
    resetToSampleData,
    monthlySummary,
    annualSummary,
    feedIntoTaxEstimator,
    lastSyncedAt,
    lastSyncedMonthLabel,
    isAutoSyncEnabled,
    setIsAutoSyncEnabled
  } = useIncome();

  const { settings, triggerBiometricAuth } = useBiometrics();

  // Component state
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [showSyncSuccessToast, setShowSyncSuccessToast] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Form State for Modal
  const [formData, setFormData] = useState<{
    date: string;
    month: number;
    year: number;
    category: IncomeCategory;
    platformOrBrand: string;
    description: string;
    currency: 'KES' | 'USD';
    originalAmount: number;
    exchangeRateKes: number;
    whtWithheldAtSource: boolean;
    whtCertificateNumber: string;
    etimsInvoiceRef: string;
    paymentMethod: 'MPESA' | 'BANK_TRANSFER' | 'PAYPAL' | 'PAYONEER' | 'OTHER';
    paymentRef: string;
    status: 'RECEIVED' | 'PENDING' | 'SCHEDULED';
    deliverables: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    month: selectedMonth,
    year: selectedYear,
    category: 'STREAMING_ADSENSE',
    platformOrBrand: 'YouTube Partner Program (AdSense)',
    description: '',
    currency: 'USD',
    originalAmount: 400,
    exchangeRateKes: 130,
    whtWithheldAtSource: false,
    whtCertificateNumber: '',
    etimsInvoiceRef: '',
    paymentMethod: 'BANK_TRANSFER',
    paymentRef: '',
    status: 'RECEIVED',
    deliverables: ''
  });

  // Calculate computed gross and net for form
  const computedGrossKes = useMemo(() => {
    if (formData.currency === 'USD') {
      return Math.round((formData.originalAmount || 0) * (formData.exchangeRateKes || 130));
    }
    return formData.originalAmount || 0;
  }, [formData.currency, formData.originalAmount, formData.exchangeRateKes]);

  const computedWhtKes = useMemo(() => {
    if (!formData.whtWithheldAtSource) return 0;
    return Math.round(computedGrossKes * 0.05); // 5% Resident Kenyan WHT
  }, [formData.whtWithheldAtSource, computedGrossKes]);

  const computedNetKes = useMemo(() => {
    return computedGrossKes - computedWhtKes;
  }, [computedGrossKes, computedWhtKes]);

  // Filtered income logs
  const filteredLogs = useMemo(() => {
    return incomeLogs.filter(log => {
      // Month & Year match
      if (selectedMonth !== 0 && log.month !== selectedMonth) return false;
      if (log.year !== selectedYear) return false;

      // Category match
      if (activeCategoryFilter !== 'ALL' && log.category !== activeCategoryFilter) return false;

      // Status match
      if (activeStatusFilter !== 'ALL' && log.status !== activeStatusFilter) return false;

      // Search match
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesBrand = log.platformOrBrand.toLowerCase().includes(query);
        const matchesDesc = log.description.toLowerCase().includes(query);
        const matchesRef = (log.paymentRef || '').toLowerCase().includes(query);
        const matchesEtims = (log.etimsInvoiceRef || '').toLowerCase().includes(query);
        if (!matchesBrand && !matchesDesc && !matchesRef && !matchesEtims) return false;
      }

      return true;
    });
  }, [incomeLogs, selectedMonth, selectedYear, activeCategoryFilter, activeStatusFilter, searchQuery]);

  // Handle opening modal for new entry
  const handleOpenAddModal = (defaultCat?: IncomeCategory) => {
    const cat = defaultCat || 'BRAND_DEAL';
    setEditingLogId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      month: selectedMonth === 0 ? 10 : selectedMonth,
      year: selectedYear,
      category: cat,
      platformOrBrand: PLATFORM_SUGGESTIONS[cat][0] || '',
      description: '',
      currency: cat === 'STREAMING_ADSENSE' ? 'USD' : 'KES',
      originalAmount: cat === 'BRAND_DEAL' ? 100000 : 500,
      exchangeRateKes: 130,
      whtWithheldAtSource: cat === 'BRAND_DEAL', // Default to true for Kenyan brand deals
      whtCertificateNumber: '',
      etimsInvoiceRef: '',
      paymentMethod: cat === 'BRAND_DEAL' ? 'MPESA' : 'BANK_TRANSFER',
      paymentRef: '',
      status: 'RECEIVED',
      deliverables: ''
    });
    setIsModalOpen(true);
  };

  // Handle editing an existing log
  const handleOpenEditModal = (log: CreatorIncomeLog) => {
    setEditingLogId(log.id);
    setFormData({
      date: log.date,
      month: log.month,
      year: log.year,
      category: log.category,
      platformOrBrand: log.platformOrBrand,
      description: log.description,
      currency: log.currency,
      originalAmount: log.originalAmount,
      exchangeRateKes: log.exchangeRateKes || 130,
      whtWithheldAtSource: log.whtWithheldAtSource,
      whtCertificateNumber: log.whtCertificateNumber || '',
      etimsInvoiceRef: log.etimsInvoiceRef || '',
      paymentMethod: log.paymentMethod,
      paymentRef: log.paymentRef || '',
      status: log.status,
      deliverables: log.deliverables || ''
    });
    setIsModalOpen(true);
  };

  // Submit modal form
  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();

    const grossAmountKes = computedGrossKes;
    const withholdingTaxDeductedKes = computedWhtKes;
    const netAmountReceivedKes = computedNetKes;

    if (editingLogId) {
      updateIncomeLog(editingLogId, {
        date: formData.date,
        month: formData.month,
        year: formData.year,
        category: formData.category,
        platformOrBrand: formData.platformOrBrand,
        description: formData.description,
        currency: formData.currency,
        originalAmount: formData.originalAmount,
        exchangeRateKes: formData.exchangeRateKes,
        grossAmountKes,
        withholdingTaxDeductedKes,
        whtWithheldAtSource: formData.whtWithheldAtSource,
        whtCertificateNumber: formData.whtCertificateNumber,
        netAmountReceivedKes,
        etimsInvoiceRef: formData.etimsInvoiceRef,
        paymentMethod: formData.paymentMethod,
        paymentRef: formData.paymentRef,
        status: formData.status,
        deliverables: formData.deliverables
      });
    } else {
      addIncomeLog({
        date: formData.date,
        month: formData.month,
        year: formData.year,
        category: formData.category,
        platformOrBrand: formData.platformOrBrand,
        description: formData.description,
        currency: formData.currency,
        originalAmount: formData.originalAmount,
        exchangeRateKes: formData.exchangeRateKes,
        grossAmountKes,
        withholdingTaxDeductedKes,
        whtWithheldAtSource: formData.whtWithheldAtSource,
        whtCertificateNumber: formData.whtCertificateNumber,
        netAmountReceivedKes,
        etimsInvoiceRef: formData.etimsInvoiceRef,
        paymentMethod: formData.paymentMethod,
        paymentRef: formData.paymentRef,
        status: formData.status,
        deliverables: formData.deliverables
      });
    }

    setIsModalOpen(false);
    triggerFeedToEstimator();
  };

  // Explicit action to feed into eTIMS Tax Estimator
  const triggerFeedToEstimator = () => {
    feedIntoTaxEstimator(selectedMonth === 0 ? 10 : selectedMonth, selectedYear);
    setShowSyncSuccessToast(true);
    setTimeout(() => {
      setShowSyncSuccessToast(false);
    }, 4000);
  };

  // Feed and navigate to the Tax Estimator tab
  const handleFeedAndNavigateToEstimator = () => {
    triggerFeedToEstimator();
    if (onNavigateToEstimator) {
      onNavigateToEstimator();
    }
  };

  // Export PDF with Biometrics
  const handleExportIncomeReport = async () => {
    if (!containerRef.current) return;

    if (settings.isEnabled && settings.requireAuthForPdfExport) {
      const authorized = await triggerBiometricAuth({
        reason: 'Authorize Biometrics to export confidential Creator Income & Withholding Tax ledger',
        target: 'TAX_ESTIMATES'
      });
      if (!authorized) return;
    }

    setIsExporting(true);
    try {
      await exportElementToPdf(containerRef.current, {
        filename: `Kenya_Creator_Income_Ledger_${MONTH_NAMES[selectedMonth - 1] || 'All'}_${selectedYear}.pdf`,
        format: 'a4',
        margin: 8
      });
    } catch (err) {
      console.error('Failed to export PDF', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Category visual badge helper
  const renderCategoryBadge = (category: IncomeCategory) => {
    switch (category) {
      case 'STREAMING_ADSENSE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Tv className="w-3 h-3 text-rose-500" />
            Streaming & AdSense
          </span>
        );
      case 'BRAND_DEAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Briefcase className="w-3 h-3 text-amber-600" />
            Brand Deal
          </span>
        );
      case 'DIGITAL_PRODUCTS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShoppingBag className="w-3 h-3 text-indigo-500" />
            Digital Products
          </span>
        );
      case 'CREATIVE_SERVICES':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Video className="w-3 h-3 text-blue-500" />
            Creative Services
          </span>
        );
      case 'ROYALTIES_SKIZA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Music className="w-3 h-3 text-purple-500" />
            CMO / Skiza
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            Other Income
          </span>
        );
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      
      {/* Toast Alert for eTIMS Sync */}
      {showSyncSuccessToast && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between animate-fade-in transition-all">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">
                Income Feeds Transferred to eTIMS Tax Engine!
              </p>
              <p className="text-xs text-emerald-100">
                Gross KES {monthlySummary.totalGrossKes.toLocaleString()} (Streaming: KES {monthlySummary.streamingAdSenseKes.toLocaleString()}, Brand Deals: KES {monthlySummary.brandDealsKes.toLocaleString()}) updated into 2026 tax liability model.
              </p>
            </div>
          </div>
          {onNavigateToEstimator && (
            <button
              onClick={onNavigateToEstimator}
              className="px-3 py-1.5 bg-white text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors shrink-0 shadow-sm"
            >
              View Calculations &rarr;
            </button>
          )}
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <DollarSign className="w-3.5 h-3.5" />
            Kenyan Creator Revenue Ledger & eTIMS Integration
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Streaming & Brand Deal Income Logger
          </h1>
          <p className="text-emerald-100 text-sm leading-relaxed">
            Record every YouTube AdSense payout, foreign streaming royalty, and local corporate brand deal.
            Track KRA 5% Withholding Tax (Section 35) deducted at source and seamlessly feed actual revenues into your eTIMS tax liability calculator.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => handleOpenAddModal('BRAND_DEAL')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Log New Deal / Stream
          </button>

          <button
            onClick={handleFeedAndNavigateToEstimator}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            title="Update eTIMS 2026 Estimator with this month's earnings"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Feed to eTIMS Tool
          </button>

          <button
            onClick={handleExportIncomeReport}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
            title="Download PDF Ledger"
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Interactive Bridge to eTIMS Tax Estimator Card */}
      <div className="bg-white rounded-2xl border-2 border-emerald-500/30 p-5 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  Live eTIMS Tax Engine Feed
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically mapping logged {MONTH_NAMES[selectedMonth - 1]} earnings to KRA graduated tax bands & 5% WHT credits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isAutoSyncEnabled}
                onChange={e => setIsAutoSyncEnabled(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
              <span>Auto-sync changes</span>
            </label>

            {onNavigateToEstimator && (
              <button
                onClick={handleFeedAndNavigateToEstimator}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                Open Tax Estimator <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Live Mapped Values Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-400">Fed to AdSense & Royalties</div>
            <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
              KES {(monthlySummary.streamingAdSenseKes + monthlySummary.royaltiesSkizaKes).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">YouTube, Spotify, Skiza</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-400">Fed to Brand Partnerships</div>
            <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
              KES {monthlySummary.brandDealsKes.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Safaricom, Equity, EABL</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-400">5% WHT Credits Transferred</div>
            <div className="text-base font-extrabold text-emerald-600 font-mono mt-0.5">
              KES {monthlySummary.totalWhtDeductedKes.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-600/80 mt-1">Offset against tax liability</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-400">Est. eTIMS Section 16 Offset</div>
            <div className="text-base font-extrabold text-blue-600 font-mono mt-0.5">
              KES {Math.round(monthlySummary.totalGrossKes * 0.22).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">22% default deductible costs</div>
          </div>
        </div>
      </div>

      {/* Month & Period Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Month Buttons Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {MONTH_NAMES.map((name, index) => {
              const monthNum = index + 1;
              const isSelected = selectedMonth === monthNum;
              return (
                <button
                  key={name}
                  onClick={() => setSelectedMonth(monthNum)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {name.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Year & Sample Reset Controls */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
          >
            <option value={2026}>Tax Year 2026</option>
            <option value={2025}>Tax Year 2025</option>
          </select>

          <button
            onClick={resetToSampleData}
            className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset to Kenyan creator sample data"
          >
            Reset Demo
          </button>
        </div>
      </div>

      {/* KPI Stats Cards for Selected Month */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Gross */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {MONTH_NAMES[selectedMonth - 1]} Gross Revenue
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-2">
            <SensitiveShield
              value={`KES ${monthlySummary.totalGrossKes.toLocaleString()}`}
              type="currency"
              label="Gross Monthly Income"
              target="TAX_ESTIMATES"
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span>{monthlySummary.entryCount} recorded payouts</span>
          </div>
        </div>

        {/* Streaming & AdSense */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Streaming & AdSense
            </span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Tv className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-700 font-mono mt-2">
            <SensitiveShield
              value={`KES ${(monthlySummary.streamingAdSenseKes + monthlySummary.royaltiesSkizaKes).toLocaleString()}`}
              type="currency"
              label="Streaming Income"
              target="TAX_ESTIMATES"
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            YouTube, Spotify, TikTok & Skiza
          </div>
        </div>

        {/* Brand Deals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Brand Sponsorships
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700 font-mono mt-2">
            <SensitiveShield
              value={`KES ${monthlySummary.brandDealsKes.toLocaleString()}`}
              type="currency"
              label="Brand Deal Income"
              target="TAX_ESTIMATES"
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Corporate campaigns & promos
          </div>
        </div>

        {/* KRA 5% WHT Credits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              KRA 5% WHT Deducted
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-700 font-mono mt-2">
            <SensitiveShield
              value={`KES ${monthlySummary.totalWhtDeductedKes.toLocaleString()}`}
              type="currency"
              label="5% WHT Credits"
              target="TAX_ESTIMATES"
            />
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Sec 35 Tax Credits
          </div>
        </div>

        {/* Net Take-Home */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Net Disbursed Cash
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-2">
            <SensitiveShield
              value={`KES ${monthlySummary.totalNetReceivedKes.toLocaleString()}`}
              type="currency"
              label="Net Cash Received"
              target="TAX_ESTIMATES"
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Received via M-Pesa & Bank
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              activeCategoryFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Sources ({incomeLogs.filter(l => l.month === selectedMonth && l.year === selectedYear).length})
          </button>

          <button
            onClick={() => setActiveCategoryFilter('STREAMING_ADSENSE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              activeCategoryFilter === 'STREAMING_ADSENSE'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            🎵 Streaming & AdSense
          </button>

          <button
            onClick={() => setActiveCategoryFilter('BRAND_DEAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              activeCategoryFilter === 'BRAND_DEAL'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            🤝 Brand Deals
          </button>

          <button
            onClick={() => setActiveCategoryFilter('DIGITAL_PRODUCTS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              activeCategoryFilter === 'DIGITAL_PRODUCTS'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            📦 Digital Products
          </button>

          <button
            onClick={() => setActiveCategoryFilter('CREATIVE_SERVICES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              activeCategoryFilter === 'CREATIVE_SERVICES'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            🎬 Services
          </button>

          <button
            onClick={() => setActiveCategoryFilter('ROYALTIES_SKIZA')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              activeCategoryFilter === 'ROYALTIES_SKIZA'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            📻 Skiza & CMO
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search brand, platform, eTIMS..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Income Records Ledger List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Logged Earnings for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified income items feed your eTIMS Section 16 tax allowances and annual KRA returns.
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-slate-500">
            {filteredLogs.length} of {incomeLogs.length} total entries
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <DollarSign className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">No income logs found for this filter</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Record your streaming payouts from YouTube or brand sponsorships from Kenyan agencies to track your taxes.
            </p>
            <button
              onClick={() => handleOpenAddModal()}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Log Income Entry
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map(log => (
              <div 
                key={log.id} 
                className="p-4 md:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left: Brand/Platform Info */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm md:text-base">
                      {log.platformOrBrand}
                    </span>
                    {renderCategoryBadge(log.category)}
                    
                    {log.whtWithheldAtSource && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <ShieldCheck className="w-3 h-3 text-blue-500" />
                        5% WHT Withheld (KES {log.withholdingTaxDeductedKes.toLocaleString()})
                      </span>
                    )}

                    {log.currency === 'USD' && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        ${log.originalAmount} USD @ {log.exchangeRateKes} KES
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1">
                    {log.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {log.date}
                    </span>

                    <span className="flex items-center gap-1 font-mono">
                      <Smartphone className="w-3 h-3" />
                      {log.paymentMethod} {log.paymentRef ? `(${log.paymentRef})` : ''}
                    </span>

                    {log.whtCertificateNumber && (
                      <span className="font-mono text-blue-600 bg-blue-50/80 px-1.5 py-0.5 rounded">
                        Cert: {log.whtCertificateNumber}
                      </span>
                    )}

                    {log.etimsInvoiceRef && (
                      <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        eTIMS: {log.etimsInvoiceRef}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Amounts & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <div className="text-base font-extrabold text-slate-900 font-mono">
                      KES {log.grossAmountKes.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Net: <strong className="text-emerald-700 font-mono">KES {log.netAmountReceivedKes.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onNavigateToInvoice && (
                      <button
                        onClick={() => onNavigateToInvoice(log.grossAmountKes)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Generate eTIMS Invoice for this payment"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenEditModal(log)}
                      className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Income Record"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteIncomeLog(log.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kenyan Content Creator Tax Compliance & eTIMS Wisdom Callout */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-5 md:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm md:text-base">
              Kenyan Creator Tax Law (KRA Finance Act 2026 Guidelines)
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Understand how Kenyan tax authorities treat your different creative revenue streams:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-xs space-y-1.5">
            <h5 className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-amber-500" />
              1. Brand Deals (5% WHT Credit)
            </h5>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Under Section 35 of Kenya&apos;s Income Tax Act, corporate brands withhold 5% resident withholding tax. 
              Always obtain the <strong>KRA Withholding Tax Certificate</strong> from their finance team—it directly credits your tax bill when filed on iTax!
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-xs space-y-1.5">
            <h5 className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-rose-500" />
              2. Foreign Streaming (YouTube & Spotify)
            </h5>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Foreign payouts received via wire or PayPal don&apos;t have Kenyan tax withheld at source. 
              However, Kenyan tax residents must declare worldwide business income. The eTIMS tool lets you estimate your quarterly installment taxes accurately.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-xs space-y-1.5">
            <h5 className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-emerald-500" />
              3. eTIMS Section 16 Expense Deductions
            </h5>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              To slash your taxable net income, claim your production costs (cameras, internet, editors, studio rent). 
              Under Section 16, KRA only accepts expenses supported by valid electronic tax invoices (eTIMS).
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Log New or Edit Income Record */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 md:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingLogId ? 'Edit Creator Income Record' : 'Log New Creator Income Record'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record earnings to automatically update your KRA eTIMS tax liability.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEntry} className="p-5 md:p-6 overflow-y-auto space-y-4">
              
              {/* Category & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Income Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => {
                      const newCat = e.target.value as IncomeCategory;
                      setFormData(prev => ({
                        ...prev,
                        category: newCat,
                        platformOrBrand: PLATFORM_SUGGESTIONS[newCat][0] || prev.platformOrBrand,
                        currency: newCat === 'STREAMING_ADSENSE' ? 'USD' : 'KES',
                        whtWithheldAtSource: newCat === 'BRAND_DEAL' || newCat === 'CREATIVE_SERVICES'
                      }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                  >
                    <option value="STREAMING_ADSENSE">🎵 Streaming & AdSense</option>
                    <option value="BRAND_DEAL">🤝 Brand Deal / Sponsorship</option>
                    <option value="DIGITAL_PRODUCTS">📦 Digital Products & Presets</option>
                    <option value="CREATIVE_SERVICES">🎬 Creative Services</option>
                    <option value="ROYALTIES_SKIZA">📻 Skiza & CMO Royalties</option>
                    <option value="OTHER_INCOME">💡 Other Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date Received
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => {
                      const d = e.target.value;
                      const month = d ? new Date(d).getMonth() + 1 : formData.month;
                      const year = d ? new Date(d).getFullYear() : formData.year;
                      setFormData(prev => ({
                        ...prev,
                        date: d,
                        month,
                        year
                      }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Platform / Brand Name with suggestions */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Platform / Brand / Client Name
                  </label>
                  <span className="text-[10px] text-slate-400">e.g. YouTube, Safaricom, Equity</span>
                </div>
                <input
                  type="text"
                  required
                  value={formData.platformOrBrand}
                  onChange={e => setFormData(prev => ({ ...prev, platformOrBrand: e.target.value }))}
                  placeholder="e.g. Safaricom PLC, YouTube AdSense, Spotify"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                />

                {/* Quick suggestions pills */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(PLATFORM_SUGGESTIONS[formData.category] || []).slice(0, 3).map(suggestion => (
                    <button
                      type="button"
                      key={suggestion}
                      onClick={() => setFormData(prev => ({ ...prev, platformOrBrand: suggestion }))}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium transition-colors"
                    >
                      {suggestion.split('(')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description & Deliverables */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Campaign Deliverables
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. 2 dedicated YouTube videos + 3 Instagram Reels"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Currency & Amounts */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Currency & Gross Payout
                  </label>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, currency: 'KES' }))}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                        formData.currency === 'KES' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      KES
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, currency: 'USD' }))}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                        formData.currency === 'USD' ? 'bg-blue-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      USD ($)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Gross Amount ({formData.currency})
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={formData.originalAmount || ''}
                      onChange={e => setFormData(prev => ({ ...prev, originalAmount: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold font-mono text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>

                  {formData.currency === 'USD' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Exchange Rate (KES per USD)
                      </label>
                      <input
                        type="number"
                        min="50"
                        step="0.5"
                        value={formData.exchangeRateKes}
                        onChange={e => setFormData(prev => ({ ...prev, exchangeRateKes: parseFloat(e.target.value) || 130 }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold font-mono text-slate-900 outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>

                {/* Computed Gross KES badge */}
                {formData.currency === 'USD' && (
                  <div className="text-xs text-slate-600 bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span>Computed KES Gross:</span>
                    <strong className="font-mono text-slate-900">KES {computedGrossKes.toLocaleString()}</strong>
                  </div>
                )}

                {/* 5% Withholding Tax Section */}
                <div className="pt-2 border-t border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.whtWithheldAtSource}
                        onChange={e => setFormData(prev => ({ ...prev, whtWithheldAtSource: e.target.checked }))}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                      <span>Kenyan 5% Withholding Tax (WHT) Deducted at Source</span>
                    </label>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                      Sec 35 ITA
                    </span>
                  </div>

                  {formData.whtWithheldAtSource && (
                    <div className="pl-6 space-y-2 animate-fade-in">
                      <div className="text-xs text-blue-800 bg-blue-50/80 p-2.5 rounded-xl border border-blue-200/80 flex items-center justify-between">
                        <span>5% Tax Withheld by Brand:</span>
                        <strong className="font-mono font-bold text-blue-900">KES {computedWhtKes.toLocaleString()}</strong>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          KRA WHT Certificate Number (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.whtCertificateNumber}
                          onChange={e => setFormData(prev => ({ ...prev, whtCertificateNumber: e.target.value }))}
                          placeholder="e.g. KRA/WHT/2026/094821"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Net Cash Calculated */}
                  <div className="text-xs font-semibold text-slate-700 flex items-center justify-between pt-1">
                    <span>Net Disbursed Cash:</span>
                    <strong className="text-emerald-700 font-mono text-sm">KES {computedNetKes.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Payment Method & References */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                  >
                    <option value="MPESA">M-Pesa (B2C / Till / Paybill)</option>
                    <option value="BANK_TRANSFER">Bank Wire / EFT / RTGS</option>
                    <option value="PAYPAL">PayPal</option>
                    <option value="PAYONEER">Payoneer</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Transaction / M-Pesa Ref
                  </label>
                  <input
                    type="text"
                    value={formData.paymentRef}
                    onChange={e => setFormData(prev => ({ ...prev, paymentRef: e.target.value }))}
                    placeholder="e.g. SL82K9P2MA or WIRE-9921"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* eTIMS Reference */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  eTIMS Electronic Invoice Ref (Optional)
                </label>
                <input
                  type="text"
                  value={formData.etimsInvoiceRef}
                  onChange={e => setFormData(prev => ({ ...prev, etimsInvoiceRef: e.target.value }))}
                  placeholder="e.g. ETIMS-2026-SAF-0089"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-md shadow-emerald-600/20"
                >
                  {editingLogId ? 'Save Changes & Sync' : 'Save & Feed to Estimator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

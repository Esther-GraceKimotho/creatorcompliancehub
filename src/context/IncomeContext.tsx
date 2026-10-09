import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CreatorIncomeLog, TaxEstimateInputs, MonthlyIncomeSummary } from '../types';

interface IncomeContextType {
  incomeLogs: CreatorIncomeLog[];
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  addIncomeLog: (log: Omit<CreatorIncomeLog, 'id'>) => CreatorIncomeLog;
  updateIncomeLog: (id: string, log: Partial<CreatorIncomeLog>) => void;
  deleteIncomeLog: (id: string) => void;
  resetToSampleData: () => void;
  clearAllLogs: () => void;
  monthlySummary: MonthlyIncomeSummary;
  annualSummary: {
    totalGrossKes: number;
    totalStreamingKes: number;
    totalBrandDealsKes: number;
    totalDigitalProductsKes: number;
    totalServicesKes: number;
    totalWhtKes: number;
    totalNetKes: number;
    entryCount: number;
  };
  getSummaryForMonth: (month: number, year: number) => MonthlyIncomeSummary;
  // Bridge with eTIMS Estimator
  feedIntoTaxEstimator: (month?: number, year?: number) => TaxEstimateInputs;
  syncedTaxInputs: TaxEstimateInputs | null;
  lastSyncedAt: string | null;
  lastSyncedMonthLabel: string | null;
  isAutoSyncEnabled: boolean;
  setIsAutoSyncEnabled: (enabled: boolean) => void;
}

const STORAGE_KEY = 'kenyan_creator_income_logs_v1';
const SYNC_KEY = 'kenyan_creator_synced_tax_inputs_v1';
const AUTO_SYNC_KEY = 'kenyan_creator_auto_sync_preference_v1';

const INITIAL_SAMPLE_LOGS: CreatorIncomeLog[] = [
  {
    id: 'inc-001',
    month: 10,
    year: 2026,
    date: '2026-10-04',
    category: 'STREAMING_ADSENSE',
    platformOrBrand: 'YouTube Partner Program (AdSense)',
    description: 'AdSense monthly monetization for tech review and lifestyle channel (2.4M impressions)',
    currency: 'USD',
    originalAmount: 580,
    exchangeRateKes: 130,
    grossAmountKes: 75400,
    withholdingTaxDeductedKes: 0,
    whtWithheldAtSource: false,
    netAmountReceivedKes: 75400,
    paymentMethod: 'BANK_TRANSFER',
    paymentRef: 'WIRE-GOOG-20261004',
    status: 'RECEIVED',
    deliverables: 'Long-form video ads & Shorts Revenue Share'
  },
  {
    id: 'inc-002',
    month: 10,
    year: 2026,
    date: '2026-10-06',
    category: 'BRAND_DEAL',
    platformOrBrand: 'Safaricom PLC (Neon 5G Campaign)',
    description: 'Sponsored video review + 3 Instagram Reels showcasing 5G mobile network coverage in Nairobi & Mombasa',
    currency: 'KES',
    originalAmount: 180000,
    grossAmountKes: 180000,
    withholdingTaxDeductedKes: 9000, // 5% Kenyan resident WHT under Section 35 ITA
    whtWithheldAtSource: true,
    whtCertificateNumber: 'KRA/WHT/2026/094821',
    netAmountReceivedKes: 171000,
    etimsInvoiceRef: 'ETIMS-2026-SAF-0089',
    paymentMethod: 'MPESA',
    paymentRef: 'SL82K9P2MA',
    status: 'RECEIVED',
    deliverables: '1 YouTube integration + 3 IG Reels + 2 TikToks'
  },
  {
    id: 'inc-003',
    month: 10,
    year: 2026,
    date: '2026-10-08',
    category: 'STREAMING_ADSENSE',
    platformOrBrand: 'Spotify for Artists & Apple Music',
    description: 'Digital music and podcast master streaming royalties via DistroKid payout',
    currency: 'USD',
    originalAmount: 220,
    exchangeRateKes: 130,
    grossAmountKes: 28600,
    withholdingTaxDeductedKes: 0,
    whtWithheldAtSource: false,
    netAmountReceivedKes: 28600,
    paymentMethod: 'PAYONEER',
    paymentRef: 'PAYO-DK-9921',
    status: 'RECEIVED',
    deliverables: 'East African music catalog (140,000 monthly streams)'
  },
  {
    id: 'inc-004',
    month: 10,
    year: 2026,
    date: '2026-10-12',
    category: 'BRAND_DEAL',
    platformOrBrand: 'Equity Bank Kenya (Fintech App Promo)',
    description: 'Financial literacy series sponsorship explaining diaspora remittance mobile app',
    currency: 'KES',
    originalAmount: 110000,
    grossAmountKes: 110000,
    withholdingTaxDeductedKes: 5500, // 5% WHT
    whtWithheldAtSource: true,
    whtCertificateNumber: 'KRA/WHT/2026/099182',
    netAmountReceivedKes: 104500,
    etimsInvoiceRef: 'ETIMS-2026-EQT-0042',
    paymentMethod: 'BANK_TRANSFER',
    paymentRef: 'EFT-EQT-882103',
    status: 'RECEIVED',
    deliverables: 'Dedicated 8-minute YouTube deep dive + pinned link'
  },
  {
    id: 'inc-005',
    month: 10,
    year: 2026,
    date: '2026-10-15',
    category: 'DIGITAL_PRODUCTS',
    platformOrBrand: 'Selar & Gumroad Presets Store',
    description: 'Nairobi Urban Lightroom mobile & desktop photo editing preset bundle sales',
    currency: 'KES',
    originalAmount: 32500,
    grossAmountKes: 32500,
    withholdingTaxDeductedKes: 0,
    whtWithheldAtSource: false,
    netAmountReceivedKes: 30875, // after 5% gateway commission
    paymentMethod: 'MPESA',
    paymentRef: 'SK19L84MNQ',
    status: 'RECEIVED',
    deliverables: 'Automated digital downloads (26 creators)'
  },
  {
    id: 'inc-006',
    month: 10,
    year: 2026,
    date: '2026-10-19',
    category: 'STREAMING_ADSENSE',
    platformOrBrand: 'TikTok Creator Rewards & LIVE Diamonds',
    description: 'Creator Rewards program for viral videos (>1 min) and weekend LIVE stream gifts',
    currency: 'USD',
    originalAmount: 310,
    exchangeRateKes: 130,
    grossAmountKes: 40300,
    withholdingTaxDeductedKes: 0,
    whtWithheldAtSource: false,
    netAmountReceivedKes: 40300,
    paymentMethod: 'PAYPAL',
    paymentRef: 'PP-TT-748921',
    status: 'RECEIVED',
    deliverables: 'TikTok content creator fund distribution'
  },
  {
    id: 'inc-007',
    month: 10,
    year: 2026,
    date: '2026-10-22',
    category: 'CREATIVE_SERVICES',
    platformOrBrand: 'East African Tech Summit 2026',
    description: 'Keynote panel moderation & live video highlights production at Sarit Expo Centre',
    currency: 'KES',
    originalAmount: 60000,
    grossAmountKes: 60000,
    withholdingTaxDeductedKes: 3000, // 5% WHT
    whtWithheldAtSource: true,
    whtCertificateNumber: 'KRA/WHT/2026/101290',
    netAmountReceivedKes: 57000,
    etimsInvoiceRef: 'ETIMS-2026-EATS-0019',
    paymentMethod: 'BANK_TRANSFER',
    paymentRef: 'RTGS-TECH-5521',
    status: 'RECEIVED',
    deliverables: '1 day MCing + 4K recap reel delivered within 48hrs'
  },
  {
    id: 'inc-008',
    month: 10,
    year: 2026,
    date: '2026-10-27',
    category: 'ROYALTIES_SKIZA',
    platformOrBrand: 'Safaricom Skiza Tunes & MCSK Distribution',
    description: 'Caller ringback tune revenue share and music copyright collective management royalty',
    currency: 'KES',
    originalAmount: 16800,
    grossAmountKes: 16800,
    withholdingTaxDeductedKes: 840, // 5% WHT
    whtWithheldAtSource: true,
    whtCertificateNumber: 'KRA/WHT/2026/103445',
    netAmountReceivedKes: 15960,
    paymentMethod: 'MPESA',
    paymentRef: 'SL9902X8K1',
    status: 'RECEIVED',
    deliverables: 'Quarterly CMO mechanical & performance royalty'
  },
  // Previous month (September 2026) for trend context
  {
    id: 'inc-009',
    month: 9,
    year: 2026,
    date: '2026-09-05',
    category: 'STREAMING_ADSENSE',
    platformOrBrand: 'YouTube Partner Program (AdSense)',
    description: 'AdSense revenue for September 2026',
    currency: 'USD',
    originalAmount: 510,
    exchangeRateKes: 130,
    grossAmountKes: 66300,
    withholdingTaxDeductedKes: 0,
    whtWithheldAtSource: false,
    netAmountReceivedKes: 66300,
    paymentMethod: 'BANK_TRANSFER',
    status: 'RECEIVED'
  },
  {
    id: 'inc-010',
    month: 9,
    year: 2026,
    date: '2026-09-18',
    category: 'BRAND_DEAL',
    platformOrBrand: 'Jumia Kenya (Tech Week Influencer)',
    description: 'Affiliate campaign & product unboxing review videos',
    currency: 'KES',
    originalAmount: 140000,
    grossAmountKes: 140000,
    withholdingTaxDeductedKes: 7000,
    whtWithheldAtSource: true,
    whtCertificateNumber: 'KRA/WHT/2026/087192',
    netAmountReceivedKes: 133000,
    paymentMethod: 'BANK_TRANSFER',
    status: 'RECEIVED'
  }
];

const IncomeContext = createContext<IncomeContextType | undefined>(undefined);

export const IncomeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incomeLogs, setIncomeLogs] = useState<CreatorIncomeLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading income logs from localStorage', e);
    }
    return INITIAL_SAMPLE_LOGS;
  });

  const [selectedMonth, setSelectedMonth] = useState<number>(10); // Default to October
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(AUTO_SYNC_KEY);
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [syncedTaxInputs, setSyncedTaxInputs] = useState<TaxEstimateInputs | null>(() => {
    try {
      const saved = localStorage.getItem(SYNC_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [lastSyncedMonthLabel, setLastSyncedMonthLabel] = useState<string | null>(null);

  // Persist income logs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(incomeLogs));
    } catch (e) {
      console.warn('Error saving income logs to localStorage', e);
    }
  }, [incomeLogs]);

  // Persist auto-sync setting
  useEffect(() => {
    try {
      localStorage.setItem(AUTO_SYNC_KEY, JSON.stringify(isAutoSyncEnabled));
    } catch (e) {
      console.warn('Error saving auto sync setting', e);
    }
  }, [isAutoSyncEnabled]);

  const addIncomeLog = (logData: Omit<CreatorIncomeLog, 'id'>) => {
    const newLog: CreatorIncomeLog = {
      ...logData,
      id: `inc-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    setIncomeLogs(prev => [newLog, ...prev]);
    return newLog;
  };

  const updateIncomeLog = (id: string, updatedFields: Partial<CreatorIncomeLog>) => {
    setIncomeLogs(prev => prev.map(log => {
      if (log.id !== id) return log;
      const merged = { ...log, ...updatedFields };
      // Recalculate KES gross if currency is USD
      if (merged.currency === 'USD' && merged.exchangeRateKes && merged.originalAmount) {
        merged.grossAmountKes = Math.round(merged.originalAmount * merged.exchangeRateKes);
      }
      // Recalculate WHT if applicable
      if (merged.whtWithheldAtSource) {
        merged.withholdingTaxDeductedKes = Math.round(merged.grossAmountKes * 0.05);
      } else {
        merged.withholdingTaxDeductedKes = 0;
      }
      merged.netAmountReceivedKes = merged.grossAmountKes - merged.withholdingTaxDeductedKes;
      return merged;
    }));
  };

  const deleteIncomeLog = (id: string) => {
    setIncomeLogs(prev => prev.filter(log => log.id !== id));
  };

  const resetToSampleData = () => {
    setIncomeLogs(INITIAL_SAMPLE_LOGS);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SYNC_KEY);
    setSyncedTaxInputs(null);
    setLastSyncedAt(null);
  };

  const clearAllLogs = () => {
    setIncomeLogs([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SYNC_KEY);
    setSyncedTaxInputs(null);
  };

  const getSummaryForMonth = (month: number, year: number): MonthlyIncomeSummary => {
    const monthLogs = incomeLogs.filter(log => log.month === month && log.year === year);
    
    let totalGrossKes = 0;
    let streamingAdSenseKes = 0;
    let brandDealsKes = 0;
    let digitalProductsKes = 0;
    let servicesKes = 0;
    let royaltiesSkizaKes = 0;
    let otherIncomeKes = 0;
    let totalWhtDeductedKes = 0;
    let totalNetReceivedKes = 0;

    monthLogs.forEach(log => {
      totalGrossKes += log.grossAmountKes;
      totalWhtDeductedKes += log.withholdingTaxDeductedKes;
      totalNetReceivedKes += log.netAmountReceivedKes;

      switch (log.category) {
        case 'STREAMING_ADSENSE':
          streamingAdSenseKes += log.grossAmountKes;
          break;
        case 'BRAND_DEAL':
          brandDealsKes += log.grossAmountKes;
          break;
        case 'DIGITAL_PRODUCTS':
          digitalProductsKes += log.grossAmountKes;
          break;
        case 'CREATIVE_SERVICES':
          servicesKes += log.grossAmountKes;
          break;
        case 'ROYALTIES_SKIZA':
          royaltiesSkizaKes += log.grossAmountKes;
          break;
        case 'OTHER_INCOME':
          otherIncomeKes += log.grossAmountKes;
          break;
      }
    });

    return {
      month,
      year,
      totalGrossKes,
      streamingAdSenseKes,
      brandDealsKes,
      digitalProductsKes,
      servicesKes,
      royaltiesSkizaKes,
      otherIncomeKes,
      totalWhtDeductedKes,
      totalNetReceivedKes,
      entryCount: monthLogs.length
    };
  };

  const monthlySummary = useMemo(() => {
    return getSummaryForMonth(selectedMonth, selectedYear);
  }, [incomeLogs, selectedMonth, selectedYear]);

  const annualSummary = useMemo(() => {
    const yearLogs = incomeLogs.filter(log => log.year === selectedYear);
    return {
      totalGrossKes: yearLogs.reduce((acc, cur) => acc + cur.grossAmountKes, 0),
      totalStreamingKes: yearLogs.filter(l => l.category === 'STREAMING_ADSENSE').reduce((a, c) => a + c.grossAmountKes, 0),
      totalBrandDealsKes: yearLogs.filter(l => l.category === 'BRAND_DEAL').reduce((a, c) => a + c.grossAmountKes, 0),
      totalDigitalProductsKes: yearLogs.filter(l => l.category === 'DIGITAL_PRODUCTS').reduce((a, c) => a + c.grossAmountKes, 0),
      totalServicesKes: yearLogs.filter(l => l.category === 'CREATIVE_SERVICES').reduce((a, c) => a + c.grossAmountKes, 0),
      totalWhtKes: yearLogs.reduce((acc, cur) => acc + cur.withholdingTaxDeductedKes, 0),
      totalNetKes: yearLogs.reduce((acc, cur) => acc + cur.netAmountReceivedKes, 0),
      entryCount: yearLogs.length
    };
  }, [incomeLogs, selectedYear]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Feed into eTIMS Tax Estimator
  const feedIntoTaxEstimator = (targetMonth = selectedMonth, targetYear = selectedYear): TaxEstimateInputs => {
    const summary = getSummaryForMonth(targetMonth, targetYear);
    
    // Combine Streaming + Skiza Royalties into the estimator's monthlyAdSense stream
    const combinedStreaming = summary.streamingAdSenseKes + summary.royaltiesSkizaKes;
    const brandDeals = summary.brandDealsKes;
    const digitalProducts = summary.digitalProductsKes;
    const services = summary.servicesKes;
    const otherIncome = summary.otherIncomeKes;
    const hasWht = summary.totalWhtDeductedKes > 0;

    // Estimate realistic business expenses if not previously configured
    // A healthy creator typical deduction is ~20% - 30% of gross
    const estimatedEtimsExpenses = Math.round(summary.totalGrossKes * 0.22);
    const estimatedNonEtimsExpenses = Math.round(summary.totalGrossKes * 0.05);

    const inputs: TaxEstimateInputs = {
      monthlyAdSense: combinedStreaming,
      monthlyBrandDeals: brandDeals,
      monthlyDigitalProducts: digitalProducts,
      monthlyServices: services,
      monthlyOtherIncome: otherIncome,
      monthlyEtimsExpenses: estimatedEtimsExpenses,
      monthlyNonEtimsExpenses: estimatedNonEtimsExpenses,
      hasWithholdingTaxApplied: hasWht,
      selectedRegime: 'GRADUATED'
    };

    setSyncedTaxInputs(inputs);
    const label = `${monthNames[targetMonth - 1]} ${targetYear}`;
    setLastSyncedMonthLabel(label);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastSyncedAt(timeStr);

    try {
      localStorage.setItem(SYNC_KEY, JSON.stringify(inputs));
    } catch (e) {
      console.warn('Error saving synced tax inputs', e);
    }

    return inputs;
  };

  // If auto-sync is enabled, update syncedTaxInputs automatically when income logs change
  useEffect(() => {
    if (isAutoSyncEnabled && incomeLogs.length > 0) {
      feedIntoTaxEstimator(selectedMonth, selectedYear);
    }
  }, [incomeLogs, selectedMonth, selectedYear, isAutoSyncEnabled]);

  return (
    <IncomeContext.Provider
      value={{
        incomeLogs,
        selectedMonth,
        selectedYear,
        setSelectedMonth,
        setSelectedYear,
        addIncomeLog,
        updateIncomeLog,
        deleteIncomeLog,
        resetToSampleData,
        clearAllLogs,
        monthlySummary,
        annualSummary,
        getSummaryForMonth,
        feedIntoTaxEstimator,
        syncedTaxInputs,
        lastSyncedAt,
        lastSyncedMonthLabel,
        isAutoSyncEnabled,
        setIsAutoSyncEnabled
      }}
    >
      {children}
    </IncomeContext.Provider>
  );
};

export const useIncome = () => {
  const context = useContext(IncomeContext);
  if (!context) {
    throw new Error('useIncome must be used within an IncomeProvider');
  }
  return context;
};

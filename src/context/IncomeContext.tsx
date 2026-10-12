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

const STORAGE_KEY = 'kenyan_creator_income_logs_clean_v1';
const SYNC_KEY = 'kenyan_creator_synced_tax_inputs_clean_v1';
const AUTO_SYNC_KEY = 'kenyan_creator_auto_sync_preference_v1';

const INITIAL_SAMPLE_LOGS: CreatorIncomeLog[] = [];

const IncomeContext = createContext<IncomeContextType | undefined>(undefined);

export const IncomeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incomeLogs, setIncomeLogs] = useState<CreatorIncomeLog[]>(() => {
    try {
      // Purge legacy storage that contained demo/placeholder income records
      localStorage.removeItem('kenyan_creator_income_logs_v1');
      localStorage.removeItem('kenyan_creator_synced_tax_inputs_v1');

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading income logs from localStorage', e);
    }
    return [];
  });

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
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
    setIncomeLogs([]);
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

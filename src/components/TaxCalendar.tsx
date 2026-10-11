import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  Download, 
  FileText, 
  Filter, 
  Info, 
  ShieldCheck, 
  ArrowRight,
  RotateCcw,
  Sparkles,
  CalendarDays,
  BellRing,
  HelpCircle
} from 'lucide-react';
import { 
  KraTaxDeadline, 
  KraTaxCategory, 
  CreatorFilingRecord 
} from '../types';
import { exportElementToPdf } from '../utils/pdfGenerator';
import { useProfile } from '../context/ProfileContext';

// Master Statutory KRA Deadlines for Kenyan Content Creators
const STATUTORY_DEADLINES: KraTaxDeadline[] = [
  {
    id: 'kra-vat-monthly',
    dayOfMonth: 20,
    title: 'KRA Value Added Tax (VAT) Return',
    category: 'VAT',
    frequency: 'MONTHLY',
    statutoryReference: 'Value Added Tax Act 2013, Section 44',
    portal: 'iTax',
    applicableTo: 'VAT-registered creators, digital studios & agencies (Turnover > KES 5M or voluntary registration)',
    description: 'Mandatory monthly VAT return filing on iTax. If no taxable digital services or brand invoices were issued during the preceding month, a Nil Return must still be submitted by the 20th.',
    penaltyLateFiling: 'KES 10,000 or 5% of tax due (whichever is higher) + 1% monthly late payment interest',
    requiredForms: ['Form VAT 3 (iTax Excel / CSV Return)', 'eTIMS Sales & Purchases Ledger'],
    isHighlight: true,
    suggestedAction: 'Download the offline iTax VAT Macro return, extract sales from eTIMS, validate, and upload zipped CSV before midnight.',
    guideSteps: [
      'Log into KRA iTax (itax.kra.go.ke) with your PIN and password.',
      'Navigate to Returns -> File Return and choose "Value Added Tax (VAT)".',
      'Download the VAT return template and copy your monthly sales invoices verified by eTIMS.',
      'Generate the compressed ZIP file, upload it, and click Submit.',
      'If VAT is payable, generate an e-slip payment registration slip and settle via M-Pesa Paybill 222222 or bank.'
    ]
  },
  {
    id: 'kra-turnover-tax-monthly',
    dayOfMonth: 20,
    title: 'Turnover Tax (TOT - 3% Gross)',
    category: 'TURNOVER_TAX',
    frequency: 'MONTHLY',
    statutoryReference: 'Income Tax Act Cap 470, Section 12C',
    portal: 'iTax',
    applicableTo: 'Resident content creators with annual gross sales between KES 1M and KES 25M under TOT regime',
    description: 'Simplified monthly tax calculated at 3% of gross income received from brand deals, sponsorships, merchandise, and digital monetization without expense deductions.',
    penaltyLateFiling: 'KES 1,000 late filing penalty + 5% late payment penalty + 1% monthly interest',
    requiredForms: ['Form TOT 1 (iTax Online Return)'],
    isHighlight: true,
    suggestedAction: 'Compute 3% on total gross income collected in the preceding calendar month and remit via iTax e-slip.',
    guideSteps: [
      'Log into iTax and navigate to Returns -> File Return -> Turnover Tax.',
      'Enter total gross turnover earned in the preceding calendar month.',
      'The portal automatically calculates the 3% tax liability.',
      'Submit the return to generate your KRA e-slip invoice number.',
      'Pay via M-Pesa Paybill 222222 using the PRN (Payment Registration Number) as account.'
    ]
  },
  {
    id: 'kra-wht-remittance-monthly',
    dayOfMonth: 20,
    title: 'Digital Content Withholding Tax (WHT) Credit Reconcile',
    category: 'WITHHOLDING',
    frequency: 'MONTHLY',
    statutoryReference: 'Finance Act 2023 / Section 35(3)(j) Income Tax Act',
    portal: 'iTax',
    applicableTo: 'All Kenyan creators receiving brand sponsorships, creator fund payouts & agency payments',
    description: 'Kenyan brands and advertising agencies must remit the 5% WHT deducted from your creator fees to KRA by the 20th. Creators must verify that Withholding Tax Certificates (Form WHT) reflect on iTax to claim full credits against year-end taxes.',
    penaltyLateFiling: 'Withholding agents penalized 5% + interest. Creators lose credit claims if certificates are missing.',
    requiredForms: ['KRA Withholding Tax Certificate (WHT Certificate)'],
    isHighlight: true,
    suggestedAction: 'Log into iTax and check "WHT Certificates Generated for You" to verify all brand deductions are credited.',
    guideSteps: [
      'Log into iTax and navigate to Consult -> View WHT Certificates.',
      'Filter for the previous month to ensure brands remitted the 5% deducted from your fee.',
      'Download certificate PDFs containing the KRA PRN confirmation.',
      'Note any non-compliant brand for follow-up before quarterly installments.'
    ]
  },
  {
    id: 'kra-paye-statutory-monthly',
    dayOfMonth: 9,
    title: 'PAYE, Housing Levy, SHIF & NSSF Remittances',
    category: 'PAYE_STATUTORY',
    frequency: 'MONTHLY',
    statutoryReference: 'Section 37 Income Tax Act, Affordable Housing Act 2024 & SHIF Act 2023',
    portal: 'iTax',
    applicableTo: 'Creators running production studios with hired full-time video editors, camera crew, or managers',
    description: 'Monthly statutory deductions for studio staff: PAYE (graduated scale), Affordable Housing Levy (1.5% employee + 1.5% employer), SHIF (2.75%), and NSSF Tier I & II contributions.',
    penaltyLateFiling: 'PAYE: 25% of tax due or KES 10,000; Housing Levy: 3% penalty per month; SHIF & NSSF statutory surcharges',
    requiredForms: ['Form P10 (PAYE Monthly Return)', 'Affordable Housing Levy Return', 'SHIF Employer Schedule', 'NSSF Return'],
    isHighlight: false,
    suggestedAction: 'Consolidate payroll numbers by the 5th and submit all returns on iTax and respective fund portals by the 9th.',
    guideSteps: [
      'Prepare monthly payroll breakdown showing gross salary, PAYE, Housing Levy, SHIF, and NSSF.',
      'Upload the P10 macro spreadsheet onto iTax by the 9th.',
      'File the Affordable Housing Levy schedule via iTax.',
      'Generate payment slips and disburse to respective statutory collection accounts.'
    ]
  },
  {
    id: 'kra-etims-monthly-reconciliation',
    dayOfMonth: 30, // Or last day of month
    title: 'eTIMS Monthly Invoice & Expense Deduction Audit',
    category: 'ETIMS_RECONCILIATION',
    frequency: 'MONTHLY',
    statutoryReference: 'Tax Procedures Act 2015, Section 23A & ITA Section 16(2)',
    portal: 'eTIMS',
    applicableTo: 'All content creators claiming expense deductions (gear, studio, editing, travel)',
    description: 'Under Section 16(2) of the Income Tax Act, expenses are strictly non-deductible unless supported by a valid electronic tax invoice generated via KRA eTIMS. Reconcile all invoices before the month closes.',
    penaltyLateFiling: 'Disallowance of expense deductions resulting in higher taxable net profit and 20% tax penalty',
    requiredForms: ['eTIMS Electronic Tax Invoices with QR Code', 'Credit & Debit Notes'],
    isHighlight: false,
    suggestedAction: 'Collect all supplier eTIMS invoices, scan QR codes, and match against bank/M-Pesa business statements.',
    guideSteps: [
      'Gather all receipts for cameras, lighting, software subscriptions, studio rent, and transport.',
      'Verify every receipt contains a KRA eTIMS Control Number and QR code.',
      'Log into eTIMS portal to confirm supplier invoices appear in your buyer profile.',
      'File valid eTIMS invoices into the deductible expense tracker.'
    ]
  },
  {
    id: 'kra-quarterly-installment-tax',
    dayOfMonth: 20,
    title: 'Quarterly Installment Tax (Q1 / Q2 / Q3 / Q4)',
    category: 'INSTALLMENT',
    frequency: 'QUARTERLY',
    statutoryReference: 'Income Tax Act Cap 470, Section 12',
    portal: 'iTax',
    applicableTo: 'Content creators subject to graduated income tax where tax liability exceeds KES 40,000/year',
    description: 'Quarterly advance tax installments due on the 20th of the 4th, 6th, 9th, and 12th months of the accounting year (April 20, June 20, Sept 20, Dec 20). Each installment equals 25% of estimated tax.',
    penaltyLateFiling: '20% penalty on underpaid installment + 1% monthly interest',
    requiredForms: ['Installment Tax Computation Sheet', 'Payment Registration Number (PRN)'],
    isHighlight: true,
    suggestedAction: 'Calculate 25% of annual projected tax minus WHT credits already remitted by brands.',
    guideSteps: [
      'Review net income for the quarter using the eTIMS Tax Estimator.',
      'Deduct 5% WHT credits confirmed from brand certificates.',
      'Generate an e-slip under Income Tax - Resident Individual / Installment Tax.',
      'Pay via M-Pesa or RTGS before the 20th.'
    ]
  },
  {
    id: 'kra-annual-return-individual',
    dayOfMonth: 30, // June 30th
    title: 'Annual Income Tax Return (Individual / Sole Proprietor)',
    category: 'ANNUAL_RETURN',
    frequency: 'ANNUAL',
    statutoryReference: 'Tax Procedures Act 2015, Section 24',
    portal: 'iTax',
    applicableTo: 'Every Kenyan citizen / resident creator with an active KRA PIN (Mandatory filing)',
    description: 'Annual declaration of all worldwide and local income for the preceding calendar year (January 1 - December 31). Due strictly on or before June 30th. Nil return required if no income earned.',
    penaltyLateFiling: 'KES 2,000 late filing penalty for individuals (KES 20,000 for companies) + 5% penalty on tax unpaid',
    requiredForms: ['Form ITR (Individual Tax Return - Excel or Web-based)', 'Withholding Tax Certificates', 'P9 Form (if employed)'],
    isHighlight: true,
    suggestedAction: 'Complete return filing well ahead of the June 30 rush when iTax servers experience high traffic.',
    guideSteps: [
      'Download your P9 form or aggregate all annual creator income statements.',
      'Log into iTax -> Returns -> File Return -> Income Tax - Resident Individual.',
      'Input gross earnings, allowable eTIMS deductions, and personal relief (KES 28,800/year).',
      'Attach all WHT credit certificates to offset taxable balance.',
      'Submit and download the Acknowledgement Receipt.'
    ]
  }
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function TaxCalendar() {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // 9 = October (0-indexed)
  const [selectedDay, setSelectedDay] = useState<number>(20); // Default focus on 20th!
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedDeadlineId, setSelectedDeadlineId] = useState<string>('kra-vat-monthly');
  const [userProfileFilters, setUserProfileFilters] = useState({
    vatRegistered: true,
    turnoverTax: true,
    employCrew: false,
    brandDeals: true,
    installmentTax: true
  });
  const [filingRecords, setFilingRecords] = useState<Record<string, CreatorFilingRecord>>({});
  const [showFilingModal, setShowFilingModal] = useState<boolean>(false);
  const [activeFilingDeadline, setActiveFilingDeadline] = useState<KraTaxDeadline | null>(null);
  const [ackNumberInput, setAckNumberInput] = useState<string>('');
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showIcalNotification, setShowIcalNotification] = useState<boolean>(false);

  const printScheduleRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();

  // Load filings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kra_creator_filing_records');
      if (saved) {
        setFilingRecords(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save filings to localStorage
  const saveFiling = (deadlineId: string, status: 'PENDING' | 'IN_PROGRESS' | 'FILED', ack?: string, amount?: number, notes?: string) => {
    const key = `${selectedYear}-${selectedMonth}-${deadlineId}`;
    const newRecord: CreatorFilingRecord = {
      id: key,
      deadlineId,
      year: selectedYear,
      month: selectedMonth,
      status,
      filingDate: status === 'FILED' ? new Date().toISOString() : undefined,
      acknowledgementNumber: ack || filingRecords[key]?.acknowledgementNumber,
      amountPaidKes: amount !== undefined ? amount : filingRecords[key]?.amountPaidKes,
      notes: notes !== undefined ? notes : filingRecords[key]?.notes
    };

    const updated = { ...filingRecords, [key]: newRecord };
    setFilingRecords(updated);
    try {
      localStorage.setItem('kra_creator_filing_records', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Determine active deadlines applicable to this specific month and year
  const monthDeadlines = useMemo(() => {
    return STATUTORY_DEADLINES.filter(deadline => {
      // Category filter check
      if (categoryFilter !== 'ALL' && deadline.category !== categoryFilter) {
        return false;
      }

      // Profile customization filters
      if (deadline.category === 'VAT' && !userProfileFilters.vatRegistered) return false;
      if (deadline.category === 'TURNOVER_TAX' && !userProfileFilters.turnoverTax) return false;
      if (deadline.category === 'PAYE_STATUTORY' && !userProfileFilters.employCrew) return false;
      if (deadline.category === 'WITHHOLDING' && !userProfileFilters.brandDeals) return false;
      if (deadline.category === 'INSTALLMENT' && !userProfileFilters.installmentTax) return false;

      // Quarterly check: Installments are April (3), June (5), September (8), December (11)
      if (deadline.category === 'INSTALLMENT') {
        const isQuarterMonth = [3, 5, 8, 11].includes(selectedMonth);
        if (!isQuarterMonth) return false;
      }

      // Annual check: June 30th (month 5)
      if (deadline.category === 'ANNUAL_RETURN') {
        if (selectedMonth !== 5) return false;
      }

      return true;
    });
  }, [selectedMonth, categoryFilter, userProfileFilters]);

  // Days in selected month calculation
  const calendarGrid = useMemo(() => {
    const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    // In JS, getDay() returns 0 for Sunday, 1 for Monday... We want Monday as 0
    const firstDayIndex = (new Date(selectedYear, selectedMonth, 1).getDay() + 6) % 7;
    
    const days: { day: number; isCurrentMonth: boolean; deadlines: KraTaxDeadline[] }[] = [];

    // Previous month padding
    const prevMonthDays = new Date(selectedYear, selectedMonth, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        deadlines: []
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      // Match deadlines for this day
      const dayDeadlines = monthDeadlines.filter(item => {
        // Last day of month check for eTIMS / Annual return
        if (item.category === 'ETIMS_RECONCILIATION' || item.category === 'ANNUAL_RETURN') {
          return d === totalDays;
        }
        return item.dayOfMonth === d;
      });

      days.push({
        day: d,
        isCurrentMonth: true,
        deadlines: dayDeadlines
      });
    }

    // Next month padding to fill complete weeks (multiples of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        day: d,
        isCurrentMonth: false,
        deadlines: []
      });
    }

    return days;
  }, [selectedYear, selectedMonth, monthDeadlines]);

  // Get deadlines for the currently selected day
  const selectedDayDeadlines = useMemo(() => {
    const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    return monthDeadlines.filter(item => {
      if (item.category === 'ETIMS_RECONCILIATION' || item.category === 'ANNUAL_RETURN') {
        return selectedDay === totalDays;
      }
      return item.dayOfMonth === selectedDay;
    });
  }, [selectedDay, selectedMonth, selectedYear, monthDeadlines]);

  // Currently focused deadline object
  const activeDeadline = useMemo(() => {
    if (selectedDayDeadlines.length > 0) {
      const match = selectedDayDeadlines.find(d => d.id === selectedDeadlineId);
      return match || selectedDayDeadlines[0];
    }
    const match = monthDeadlines.find(d => d.id === selectedDeadlineId);
    return match || monthDeadlines[0] || null;
  }, [selectedDayDeadlines, selectedDeadlineId, monthDeadlines]);

  // Next upcoming deadline calculation
  const upcomingUrgentDeadline = useMemo(() => {
    const now = new Date();
    // Default to the 20th VAT deadline if viewing current month or beyond
    const vat = monthDeadlines.find(d => d.dayOfMonth === 20 && d.category === 'VAT');
    return vat || monthDeadlines[0] || null;
  }, [monthDeadlines]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
    setSelectedDay(20); // Keep focused on 20th
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
    setSelectedDay(20);
  };

  const handleJumpToMonth = (monthIdx: number, day = 20) => {
    setSelectedMonth(monthIdx);
    setSelectedDay(day);
  };

  // Export iCal (.ics) file
  const handleExportIcs = () => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Kenya Creator Compliance//KRA Tax Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ].join('\r\n');

    monthDeadlines.forEach((item) => {
      const day = item.dayOfMonth === 30 ? new Date(selectedYear, selectedMonth + 1, 0).getDate() : item.dayOfMonth;
      const startMonthStr = String(selectedMonth + 1).padStart(2, '0');
      const startDayStr = String(day).padStart(2, '0');
      const dateStr = `${selectedYear}${startMonthStr}${startDayStr}`;

      icsContent += '\r\n' + [
        'BEGIN:VEVENT',
        `UID:kra-${item.id}-${selectedYear}-${selectedMonth}@kenyacreators.tax`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART;VALUE=DATE:${dateStr}`,
        `SUMMARY:KRA DEADLINE: ${item.title}`,
        `DESCRIPTION:${item.description.replace(/\n/g, ' ')} - Statutory Ref: ${item.statutoryReference}`,
        'LOCATION:KRA iTax Portal (itax.kra.go.ke)',
        'STATUS:CONFIRMED',
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:Reminder: ${item.title} due today!`,
        'TRIGGER:-P1D',
        'END:VALARM',
        'END:VEVENT'
      ].join('\r\n');
    });

    icsContent += '\r\nEND:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KRA_Creator_Tax_Calendar_${MONTH_NAMES[selectedMonth]}_${selectedYear}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowIcalNotification(true);
    setTimeout(() => setShowIcalNotification(false), 4000);
  };

  // Export PDF Schedule
  const handleDownloadPdf = async () => {
    if (!printScheduleRef.current) return;

    if (settings.isEnabled && settings.requireAuthForPdfExport) {
      const authorized = await triggerBiometricAuth({
        reason: 'Authorize biometric scan to export confidential KRA Tax Calendar filing audit',
        target: 'PDF_EXPORT'
      });
      if (!authorized) return;
    }

    setIsExporting(true);
    try {
      await exportElementToPdf(printScheduleRef.current, {
        filename: `KRA_Tax_Calendar_${MONTH_NAMES[selectedMonth]}_${selectedYear}.pdf`,
        format: 'a4',
        margin: 10
      });
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Open filing completion modal
  const handleOpenFilingModal = (deadline: KraTaxDeadline) => {
    const key = `${selectedYear}-${selectedMonth}-${deadline.id}`;
    const existing = filingRecords[key];
    setActiveFilingDeadline(deadline);
    setAckNumberInput(existing?.acknowledgementNumber || '');
    setAmountPaidInput(existing?.amountPaidKes ? String(existing.amountPaidKes) : '');
    setNotesInput(existing?.notes || '');
    setShowFilingModal(true);
  };

  const handleSaveModalFiling = () => {
    if (!activeFilingDeadline) return;
    saveFiling(
      activeFilingDeadline.id,
      'FILED',
      ackNumberInput.trim(),
      amountPaidInput ? parseFloat(amountPaidInput) : undefined,
      notesInput.trim()
    );
    setShowFilingModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Urgency & Highlights for the 20th */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Subtle decorative grid */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Kenya Revenue Authority · Creator Tax Roadmap 2026</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Interactive KRA Monthly Tax Calendar
            </h1>
            
            <p className="text-slate-300 text-sm leading-relaxed">
              Never miss the critical <strong className="text-amber-400 underline decoration-amber-400/50 underline-offset-4">20th of the month</strong> for Value Added Tax (VAT), Turnover Tax (TOT), and Withholding Tax reconciliation. Stay compliant with Kenya's Digital Economy and eTIMS regulations.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 font-semibold text-amber-300">
                <BellRing className="w-3.5 h-3.5" />
                <span>Next Statutory Filing: 20th {MONTH_NAMES[selectedMonth]} {selectedYear}</span>
              </span>
              <span className="text-slate-500">·</span>
              <span>VAT Act 2013 §44</span>
              <span className="text-slate-500">·</span>
              <span>Finance Act 2023 Digital Content WHT</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={handleExportIcs}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10"
              title="Add all deadlines to Google Calendar or Apple Calendar"
            >
              <CalendarDays className="w-4 h-4 text-amber-400" />
              <span>Export to iCal (.ics)</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating PDF...' : 'Download Schedule (PDF)'}</span>
            </button>
          </div>
        </div>

        {/* iCal confirmation banner */}
        {showIcalNotification && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Calendar (.ics) file downloaded! You can now import it into Google Calendar, Apple iCal, or Outlook.</span>
          </div>
        )}
      </div>

      {/* Profile Tailoring & Quick Navigation Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-800">Filter Creator Tax Categories</h2>
          </div>

          {/* Segmented Filter Control */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                categoryFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Obligations ({STATUTORY_DEADLINES.length})
            </button>
            <button
              onClick={() => setCategoryFilter('VAT')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                categoryFilter === 'VAT'
                  ? 'bg-amber-100 text-amber-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              VAT (20th)
            </button>
            <button
              onClick={() => setCategoryFilter('TURNOVER_TAX')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                categoryFilter === 'TURNOVER_TAX'
                  ? 'bg-purple-100 text-purple-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Turnover Tax (3%)
            </button>
            <button
              onClick={() => setCategoryFilter('WITHHOLDING')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                categoryFilter === 'WITHHOLDING'
                  ? 'bg-blue-100 text-blue-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Withholding Tax (5%)
            </button>
            <button
              onClick={() => setCategoryFilter('PAYE_STATUTORY')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                categoryFilter === 'PAYE_STATUTORY'
                  ? 'bg-emerald-100 text-emerald-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PAYE & Levies (9th)
            </button>
          </div>
        </div>

        {/* Tailored Creator Preferences Toggle Bar */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600">
          <span className="font-bold text-slate-700">Customize for your setup:</span>
          
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={userProfileFilters.vatRegistered}
              onChange={(e) => setUserProfileFilters(prev => ({ ...prev, vatRegistered: e.target.checked }))}
              className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
            />
            <span>VAT Registered (Sales &gt; KES 5M)</span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={userProfileFilters.turnoverTax}
              onChange={(e) => setUserProfileFilters(prev => ({ ...prev, turnoverTax: e.target.checked }))}
              className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
            />
            <span>Turnover Tax (TOT 3%)</span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={userProfileFilters.brandDeals}
              onChange={(e) => setUserProfileFilters(prev => ({ ...prev, brandDeals: e.target.checked }))}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span>Brand Deals & Royalties (5% WHT)</span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={userProfileFilters.employCrew}
              onChange={(e) => setUserProfileFilters(prev => ({ ...prev, employCrew: e.target.checked }))}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span>Employ Editors / Studio Crew (PAYE & Levies)</span>
          </label>
        </div>
      </div>

      {/* Main Calendar Section & Deadline Details Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid Left Side (7 columns) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Calendar Header with Month Selector & Jump shortcuts */}
          <div className="p-4 md:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-extrabold text-slate-900">
                {MONTH_NAMES[selectedMonth]} {selectedYear}
              </h3>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Key Months */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => handleJumpToMonth(9, 20)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedMonth === 9 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                October
              </button>
              <button
                onClick={() => handleJumpToMonth(3, 20)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedMonth === 3 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Q1 Installment Tax"
              >
                Apr (Q1)
              </button>
              <button
                onClick={() => handleJumpToMonth(5, 30)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedMonth === 5 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Annual Income Tax Return Deadline"
              >
                Jun (Annual)
              </button>
              <button
                onClick={() => handleJumpToMonth(11, 20)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedMonth === 11 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Q4 Final Installment"
              >
                Dec (Q4)
              </button>
            </div>
          </div>

          {/* Month Grid */}
          <div className="p-4 md:p-5">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 text-center font-bold text-slate-400 text-xs mb-2">
              {DAY_NAMES.map(day => (
                <div key={day} className="py-1">{day}</div>
              ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 gap-1.5 md:gap-2">
              {calendarGrid.map((item, index) => {
                const isSelected = item.isCurrentMonth && item.day === selectedDay;
                const isTheTwentieth = item.isCurrentMonth && item.day === 20;
                const isTheNinth = item.isCurrentMonth && item.day === 9;
                const hasDeadlines = item.deadlines.length > 0;

                // Filing status for items on this day
                const hasCompletedFiling = item.deadlines.every(d => {
                  const key = `${selectedYear}-${selectedMonth}-${d.id}`;
                  return filingRecords[key]?.status === 'FILED';
                }) && item.deadlines.length > 0;

                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (item.isCurrentMonth) {
                        setSelectedDay(item.day);
                        if (item.deadlines.length > 0) {
                          setSelectedDeadlineId(item.deadlines[0].id);
                        }
                      }
                    }}
                    className={`min-h-[72px] md:min-h-[88px] p-1.5 md:p-2 rounded-xl transition-all flex flex-col justify-between border cursor-pointer ${
                      !item.isCurrentMonth
                        ? 'opacity-30 bg-slate-50 border-transparent cursor-not-allowed'
                        : isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20'
                        : isTheTwentieth
                        ? 'border-amber-300 bg-amber-50/40 hover:border-amber-400'
                        : hasDeadlines
                        ? 'border-slate-200 bg-white hover:border-blue-300'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    {/* Day number header */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold leading-none ${
                        !item.isCurrentMonth
                          ? 'text-slate-400'
                          : isSelected
                          ? 'text-blue-700 font-extrabold'
                          : isTheTwentieth
                          ? 'text-amber-900 font-extrabold'
                          : 'text-slate-700'
                      }`}>
                        {item.day}
                      </span>

                      {/* Special 20th VAT Star / Badge */}
                      {isTheTwentieth && item.isCurrentMonth && (
                        <span className="text-[10px] font-black tracking-tight text-amber-700 bg-amber-200/60 px-1 rounded" title="Key KRA 20th Deadline">
                          20th
                        </span>
                      )}

                      {/* Completed badge if filed */}
                      {hasCompletedFiling && (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      )}
                    </div>

                    {/* Deadline Tags */}
                    <div className="space-y-1 my-1">
                      {item.deadlines.slice(0, 2).map(dl => {
                        const key = `${selectedYear}-${selectedMonth}-${dl.id}`;
                        const isFiled = filingRecords[key]?.status === 'FILED';

                        return (
                          <div
                            key={dl.id}
                            className={`text-[9px] md:text-[10px] font-semibold truncate px-1 py-0.5 rounded ${
                              isFiled
                                ? 'bg-emerald-100 text-emerald-800 line-through'
                                : dl.category === 'VAT'
                                ? 'bg-amber-100 text-amber-900 font-bold'
                                : dl.category === 'TURNOVER_TAX'
                                ? 'bg-purple-100 text-purple-900'
                                : dl.category === 'PAYE_STATUTORY'
                                ? 'bg-emerald-50 text-emerald-800'
                                : dl.category === 'ANNUAL_RETURN'
                                ? 'bg-rose-100 text-rose-900 font-bold'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                            title={dl.title}
                          >
                            {dl.category === 'VAT' ? 'VAT Return' :
                             dl.category === 'TURNOVER_TAX' ? 'TOT (3%)' :
                             dl.category === 'WITHHOLDING' ? 'WHT Credit' :
                             dl.category === 'PAYE_STATUTORY' ? 'PAYE / SHIF' :
                             dl.category === 'ANNUAL_RETURN' ? 'Annual Return' :
                             'eTIMS Audit'}
                          </div>
                        );
                      })}

                      {item.deadlines.length > 2 && (
                        <div className="text-[8px] font-medium text-slate-500 text-center">
                          +{item.deadlines.length - 2} more
                        </div>
                      )}
                    </div>

                    {/* Footer indicator bar */}
                    <div className="h-1 w-full rounded-full overflow-hidden bg-slate-100">
                      {isTheTwentieth ? (
                        <div className="h-full bg-amber-500 w-full" />
                      ) : isTheNinth ? (
                        <div className="h-full bg-emerald-500 w-full" />
                      ) : hasDeadlines ? (
                        <div className="h-full bg-blue-500 w-full" />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <strong className="text-slate-800">20th:</strong> VAT, TOT & WHT
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <strong className="text-slate-800">9th:</strong> PAYE, SHIF & NSSF
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <strong className="text-slate-800">30th:</strong> eTIMS & Annual
                </span>
              </div>

              <span className="text-[11px] text-slate-400">
                Click any date to inspect statutory forms & guidelines
              </span>
            </div>
          </div>
        </div>

        {/* Selected Day & Deadline Detail Panel Right Side (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Spotlight on Selected Day */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Selected Date
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {selectedDay} {MONTH_NAMES[selectedMonth]} {selectedYear}
                </h3>
              </div>

              {selectedDay === 20 && (
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-extrabold rounded-lg">
                    Key KRA Filing Day
                  </span>
                  <div className="text-[10px] text-amber-700 mt-0.5">Mandatory VAT / TOT</div>
                </div>
              )}
            </div>

            {selectedDayDeadlines.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No Statutory Deadlines On This Day</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  The primary monthly deadline falls on the <strong className="text-slate-800">20th</strong> for VAT & Turnover Tax, and the <strong className="text-slate-800">9th</strong> for payroll.
                </p>
                <button
                  onClick={() => setSelectedDay(20)}
                  className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Jump to 20th {MONTH_NAMES[selectedMonth]} &rarr;
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase">
                  Statutory Obligations Due Today ({selectedDayDeadlines.length})
                </div>

                {selectedDayDeadlines.map(deadline => {
                  const key = `${selectedYear}-${selectedMonth}-${deadline.id}`;
                  const isFiled = filingRecords[key]?.status === 'FILED';
                  const isSelected = activeDeadline?.id === deadline.id;

                  return (
                    <div
                      key={deadline.id}
                      onClick={() => setSelectedDeadlineId(deadline.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            {deadline.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>{deadline.portal}</span>
                            <span>·</span>
                            <span>{deadline.statutoryReference}</span>
                          </div>
                        </div>

                        {/* Status Toggle Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isFiled) {
                              saveFiling(deadline.id, 'PENDING');
                            } else {
                              handleOpenFilingModal(deadline);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                            isFiled
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white'
                          }`}
                        >
                          {isFiled ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Filed</span>
                            </>
                          ) : (
                            <span>Mark as Filed</span>
                          )}
                        </button>
                      </div>

                      {/* Filing details if filed */}
                      {isFiled && filingRecords[key]?.acknowledgementNumber && (
                        <div className="mt-2 text-[11px] bg-white p-2 rounded-lg border border-slate-200 text-slate-600 font-mono flex items-center justify-between">
                          <span>Ref: {filingRecords[key].acknowledgementNumber}</span>
                          {filingRecords[key].amountPaidKes !== undefined && (
                            <span className="font-bold text-slate-900">
                              KES {filingRecords[key].amountPaidKes?.toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Expanded Guide for Active Deadline */}
          {activeDeadline && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                  Compliance Action Guide
                </span>
                <h4 className="text-base font-bold text-slate-900">
                  {activeDeadline.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeDeadline.description}
                </p>
              </div>

              {/* Late Penalty Warning Box */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Late Filing Penalty & Interest</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  {activeDeadline.penaltyLateFiling}
                </p>
              </div>

              {/* Required Forms */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-700">Required Documents & Forms:</span>
                <ul className="space-y-1">
                  {activeDeadline.requiredForms.map((form, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-600">
                      <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{form}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Step by step action steps */}
              <div className="space-y-2 text-xs pt-1 border-t border-slate-100">
                <span className="font-bold text-slate-700">Filing Instructions (KRA Portal):</span>
                <ol className="space-y-1.5 text-slate-600 list-decimal pl-4 leading-relaxed">
                  {activeDeadline.guideSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Direct Links */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                <a
                  href="https://itax.kra.go.ke"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <span>Open KRA iTax Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => handleOpenFilingModal(activeDeadline)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Record Filing Receipt
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Printable / PDF Schedule Hidden Container for export */}
      <div className="hidden">
        <div ref={printScheduleRef} className="p-8 bg-white text-slate-900 space-y-6 font-sans">
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black">KENYA CREATOR TAX COMPLIANCE SCHEDULE</h1>
              <p className="text-xs text-slate-600 mt-1">
                Month: {MONTH_NAMES[selectedMonth]} {selectedYear} · KRA PIN: P051829471Z · Taxpayer: Maina Kamau
              </p>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold">STATUS: COMPLIANT</p>
              <p className="text-slate-500">Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Statutory Deadlines For {MONTH_NAMES[selectedMonth]} {selectedYear}
            </h2>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50">
                  <th className="py-2 px-3 font-bold">Due Date</th>
                  <th className="py-2 px-3 font-bold">Tax Obligation</th>
                  <th className="py-2 px-3 font-bold">Statutory Reference</th>
                  <th className="py-2 px-3 font-bold">Late Penalty</th>
                  <th className="py-2 px-3 font-bold">Filing Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {monthDeadlines.map(d => {
                  const key = `${selectedYear}-${selectedMonth}-${d.id}`;
                  const record = filingRecords[key];
                  const day = d.dayOfMonth === 30 ? new Date(selectedYear, selectedMonth + 1, 0).getDate() : d.dayOfMonth;

                  return (
                    <tr key={d.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {day} {MONTH_NAMES[selectedMonth]}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{d.title}</div>
                        <div className="text-[10px] text-slate-500">{d.applicableTo}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{d.statutoryReference}</td>
                      <td className="py-2.5 px-3 text-amber-900 font-medium">{d.penaltyLateFiling}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          record?.status === 'FILED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {record?.status === 'FILED' ? `FILED (${record.acknowledgementNumber || 'Verified'})` : 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between">
            <span>Verified in accordance with the Kenya Tax Procedures Act 2015 & VAT Act 2013</span>
            <span>Kenya Digital Economy Creator Compliance Suite</span>
          </div>
        </div>
      </div>

      {/* Record Filing Modal */}
      {showFilingModal && activeFilingDeadline && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-blue-600 uppercase">
                Record KRA Filing
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {activeFilingDeadline.title}
              </h3>
              <p className="text-xs text-slate-500">
                Due: {activeFilingDeadline.dayOfMonth} {MONTH_NAMES[selectedMonth]} {selectedYear} ({activeFilingDeadline.portal})
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  KRA Acknowledgement Number / e-Slip PRN
                </label>
                <input
                  type="text"
                  placeholder="e.g. KRA2026102008472 or PRN9827361"
                  value={ackNumberInput}
                  onChange={(e) => setAckNumberInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tax Amount Paid (KES)
                </label>
                <input
                  type="number"
                  placeholder="0.00 (Enter 0 if Nil Return)"
                  value={amountPaidInput}
                  onChange={(e) => setAmountPaidInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes / Reference
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional notes regarding this month's return..."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowFilingModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModalFiling}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm & Save Filing</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

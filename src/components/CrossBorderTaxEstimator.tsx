import React, { useState, useMemo, useRef } from 'react';
import { 
  Globe2, 
  HelpCircle, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck, 
  Download, 
  ArrowRight, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  Info, 
  Copy, 
  Check, 
  Calculator,
  ExternalLink
} from 'lucide-react';
import { exportElementToPdf } from '../utils/pdfGenerator';
import { useBiometrics } from '../context/BiometricContext';

export default function CrossBorderTaxEstimator() {
  const [totalRoyaltiesUsd, setTotalRoyaltiesUsd] = useState<number>(2500);
  const [usAudiencePercent, setUsAudiencePercent] = useState<number>(20);
  const [exchangeRateKes, setExchangeRateKes] = useState<number>(130);
  const [platform, setPlatform] = useState<'YOUTUBE' | 'AMAZON_KDP' | 'PATREON' | 'TWITCH' | 'OTHER'>('YOUTUBE');
  const [copiedLineId, setCopiedLineId] = useState<string | null>(null);

  const guideContainerRef = useRef<HTMLDivElement>(null);
  const { triggerBiometricAuth } = useBiometrics();

  // Calculations
  const calculations = useMemo(() => {
    const grossUsd = totalRoyaltiesUsd;
    const usRatio = usAudiencePercent / 100;
    
    // US-sourced income
    const usSourcedUsd = grossUsd * usRatio;
    const restOfWorldUsd = grossUsd - usSourcedUsd;

    // IRS Chapter 3 Withholding rate for Kenya (no DTT = 30% on US source)
    const withW8benUsTaxUsd = usSourcedUsd * 0.30;
    const withoutW8benTaxUsd = grossUsd * 0.30; // Devastating 30% on total gross if form missing!
    const taxSavedByFilingW8benUsd = withoutW8benTaxUsd - withW8benUsTaxUsd;

    const netReceivedUsd = grossUsd - withW8benUsTaxUsd;
    const grossKes = grossUsd * exchangeRateKes;
    const netReceivedKes = netReceivedUsd * exchangeRateKes;
    const usTaxWithheldKes = withW8benUsTaxUsd * exchangeRateKes;
    const taxSavedKes = taxSavedByFilingW8benUsd * exchangeRateKes;

    // Kenya KRA Foreign Tax Credit (Section 42 Income Tax Act)
    // Kenyan creators can claim the US tax paid as a credit against their annual KRA tax liability
    const foreignTaxCreditAvailableKes = usTaxWithheldKes;

    return {
      grossUsd,
      usSourcedUsd,
      restOfWorldUsd,
      withW8benUsTaxUsd,
      withoutW8benTaxUsd,
      taxSavedByFilingW8benUsd,
      netReceivedUsd,
      grossKes,
      netReceivedKes,
      usTaxWithheldKes,
      taxSavedKes,
      foreignTaxCreditAvailableKes,
      effectiveWithholdingRate: ((withW8benUsTaxUsd / grossUsd) * 100).toFixed(1)
    };
  }, [totalRoyaltiesUsd, usAudiencePercent, exchangeRateKes]);

  const w8benSteps = [
    {
      line: 'Line 1',
      title: 'Name of Individual',
      value: 'Maina Kamau',
      hint: 'Must match your Kenyan National ID or Passport exactly as registered on KRA iTax.',
      danger: 'Do NOT use your YouTube channel name or stage handle here.'
    },
    {
      line: 'Line 2',
      title: 'Country of Citizenship',
      value: 'Kenya',
      hint: 'Always specify "Kenya".',
      danger: ''
    },
    {
      line: 'Line 3',
      title: 'Permanent Residence Address',
      value: 'Argwings Kodhek Rd, Kilimani, Nairobi, 00100, Kenya',
      hint: 'Must be a physical address. If you only provide a P.O. Box, the IRS will reject the form.',
      danger: 'Must include physical house/apartment number and street.'
    },
    {
      line: 'Line 5',
      title: 'U.S. Taxpayer Identification Number (SSN or ITIN)',
      value: '[LEAVE BLANK]',
      hint: 'As an individual Kenyan creator, leave this line completely blank.',
      danger: 'Do NOT pay agencies hundreds of dollars for an ITIN you do not need.'
    },
    {
      line: 'Line 6a',
      title: 'Foreign Tax Identifying Number (FTIN)',
      value: 'P051829471Z (Your KRA PIN)',
      hint: 'THIS IS THE MOST CRITICAL BOX. Enter your 11-character KRA PIN.',
      danger: 'Entering your KRA PIN certifies to Google/Amazon that you are a registered taxpayer outside the US, unlocking 0% withholding on all non-US views!'
    },
    {
      line: 'Part II',
      title: 'Claim of Tax Treaty Benefits (Lines 9 & 10)',
      value: 'Kenya does NOT have a comprehensive Double Tax Treaty (DTT) with the US.',
      hint: 'Check "Kenya" for Line 9. In Line 10, note that standard Chapter 3 30% rate applies to US-source royalties.',
      danger: 'Even without a treaty rate discount (e.g. 0% for UK/Canada), filing W-8BEN protects 100% of your non-US revenue from being taxed!'
    }
  ];

  const handleCopyField = (line: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLineId(line);
    setTimeout(() => setCopiedLineId(null), 2000);
  };

  const handleExportGuidePdf = async () => {
    const authorized = await triggerBiometricAuth({
      reason: 'Authorize biometric identity to export confidential Cross-Border Tax & W-8BEN Dossier',
      target: 'PDF_EXPORT'
    });
    if (!authorized) return;

    if (guideContainerRef.current) {
      exportElementToPdf(guideContainerRef.current, {
        filename: `W8BEN_Tax_Treaty_Guide_${platform}_${Date.now()}.pdf`,
        format: 'a4'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/30">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Cross-Border Digital Royalties & IRS W-8BEN</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Cross-Border Tax & W-8BEN Treaty Navigator
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Stop arbitrary 30% withholdings on YouTube, Amazon KDP, and Patreon. Map exact geographic revenue splits, fill out Form W-8BEN properly with your KRA PIN, and claim Foreign Tax Credits under Section 42 of the Kenya Income Tax Act.
            </p>
          </div>

          <button
            onClick={handleExportGuidePdf}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-5 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-sky-600/30 shrink-0 text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export W-8BEN Dossier</span>
          </button>
        </div>
      </div>

      {/* Interactive Withholding Calculator & Revenue Attribution */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-sky-600" />
              Geographic Royalty & Withholding Estimator
            </h3>
            <p className="text-xs text-slate-500">
              Simulate actual US IRS deductions based on your viewer audience distribution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Platform:</span>
            <select
              value={platform}
              onChange={e => setPlatform(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800"
            >
              <option value="YOUTUBE">YouTube AdSense</option>
              <option value="AMAZON_KDP">Amazon KDP (E-Books)</option>
              <option value="PATREON">Patreon / Subscriptions</option>
              <option value="TWITCH">Twitch Creator Royalties</option>
              <option value="OTHER">Other US Digital Platform</option>
            </select>
          </div>
        </div>

        {/* Inputs Slider Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Gross Earnings (USD):</span>
              <span className="text-sky-700 font-mono text-sm">${totalRoyaltiesUsd.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="100"
              max="20000"
              step="100"
              value={totalRoyaltiesUsd}
              onChange={e => setTotalRoyaltiesUsd(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>$100</span>
              <span>$10,000</span>
              <span>$20,000+</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>US Viewer Traffic / Audience:</span>
              <span className="text-sky-700 font-mono text-sm">{usAudiencePercent}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="95"
              step="1"
              value={usAudiencePercent}
              onChange={e => setUsAudiencePercent(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Local/African (5%)</span>
              <span>Global Blend (25%)</span>
              <span>Predominantly US (80%)</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>FX Conversion Rate (KES/USD):</span>
              <span className="text-sky-700 font-mono text-sm">KES {exchangeRateKes}</span>
            </div>
            <input
              type="number"
              value={exchangeRateKes}
              onChange={e => setExchangeRateKes(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold"
            />
            <span className="text-[10px] text-slate-400 block">Bank buying exchange rate</span>
          </div>
        </div>

        {/* Calculation Visual Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {/* Card 1: Gross Revenue */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Gross Revenue
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono">
              ${calculations.grossUsd.toLocaleString()}
            </div>
            <div className="text-xs text-slate-600 font-medium">
              KES {Math.round(calculations.grossKes).toLocaleString()}
            </div>
          </div>

          {/* Card 2: US vs Rest of World Split */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
              US-Source Audience Split
            </span>
            <div className="text-xl font-black text-sky-950 font-mono">
              ${Math.round(calculations.usSourcedUsd).toLocaleString()} <span className="text-xs text-sky-600">({usAudiencePercent}%)</span>
            </div>
            <div className="text-[11px] text-sky-700">
              Rest of World: ${Math.round(calculations.restOfWorldUsd).toLocaleString()} (0% US Tax)
            </div>
          </div>

          {/* Card 3: Actual IRS Tax Withheld */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Actual IRS 30% Deduction
            </span>
            <div className="text-2xl font-black text-amber-900 font-mono">
              -${Math.round(calculations.withW8benUsTaxUsd).toLocaleString()}
            </div>
            <div className="text-xs text-amber-700 font-medium">
              Effective: {calculations.effectiveWithholdingRate}% (KES {Math.round(calculations.usTaxWithheldKes).toLocaleString()})
            </div>
          </div>

          {/* Card 4: Net Received Into Bank */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Net Paid to Kenya Bank / M-Pesa
            </span>
            <div className="text-2xl font-black text-emerald-950 font-mono">
              ${Math.round(calculations.netReceivedUsd).toLocaleString()}
            </div>
            <div className="text-xs text-emerald-700 font-bold">
              KES {Math.round(calculations.netReceivedKes).toLocaleString()}
            </div>
          </div>
        </div>

        {/* The Big Revelation Banner */}
        <div className="bg-emerald-600 text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-100" />
              Tax Saved by Submitting Form W-8BEN with KRA PIN
            </div>
            <div className="text-xl sm:text-2xl font-black">
              +${Math.round(calculations.taxSavedByFilingW8benUsd).toLocaleString()} saved per payout (KES {Math.round(calculations.taxSavedKes).toLocaleString()})
            </div>
            <p className="text-xs text-emerald-100 max-w-xl">
              Without a certified W-8BEN, platforms are forced by US law to withhold 30% on your ENTIRE global earnings (${Math.round(calculations.withoutW8benTaxUsd)}). Providing your KRA PIN ensures only the {usAudiencePercent}% US portion is taxed!
            </p>
          </div>

          <div className="bg-white/10 px-4 py-3 rounded-xl border border-white/20 text-center shrink-0">
            <div className="text-[10px] text-emerald-200 uppercase font-bold">KRA Foreign Tax Credit</div>
            <div className="text-base font-black text-white mt-0.5">KES {Math.round(calculations.foreignTaxCreditAvailableKes).toLocaleString()}</div>
            <div className="text-[10px] text-emerald-200">Creditable on iTax return</div>
          </div>
        </div>
      </div>

      {/* W-8BEN Line-by-Line Guide Section */}
      <div
        id="w8ben-crossborder-dossier"
        ref={guideContainerRef}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              IRS Form W-8BEN Line-by-Line Compliance Guide
            </h3>
            <p className="text-xs text-slate-500">
              Exactly what to enter into Google AdSense, Amazon KDP, or YouTube Tax Info screens.
            </p>
          </div>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl font-mono">
            Form W-8BEN (Rev. October 2021/2026)
          </span>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {w8benSteps.map((step, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-mono font-bold text-[10px]">
                    {step.line}
                  </span>
                  <button
                    onClick={() => handleCopyField(step.line, step.value)}
                    className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-bold"
                  >
                    {copiedLineId === step.line ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Field</span>
                      </>
                    )}
                  </button>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{step.title}</h4>
                
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 font-mono text-xs text-indigo-950 font-bold break-all">
                  {step.value}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {step.hint}
                </p>
              </div>

              {step.danger && (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{step.danger}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Kenya Foreign Tax Credit Legal Explanation */}
        <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
            <Info className="w-4 h-4" />
            <span>KRA Legal Basis: Section 42 of Income Tax Act (Cap 470)</span>
          </div>
          <h4 className="text-base font-bold text-white">How To Avoid Double Taxation on Your Annual iTax Return</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Even though Kenya does not have a reduced treaty rate with the US, Kenyan tax law explicitly protects creators from double taxation through the <strong>Foreign Tax Credit (FTC)</strong> mechanism. 
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <strong className="block text-white mb-1">1. Download Form 1042-S</strong>
              <span className="text-slate-400 text-[11px]">
                In February each year, Google and Amazon issue IRS Form 1042-S stating your total US tax withheld.
              </span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <strong className="block text-white mb-1">2. Declare in iTax IT1 Return</strong>
              <span className="text-slate-400 text-[11px]">
                On sheet <em>F_Tax_Credits</em> of the KRA return, declare the US withholding tax under "Foreign Tax Relief".
              </span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <strong className="block text-white mb-1">3. Direct KRA Offset</strong>
              <span className="text-slate-400 text-[11px]">
                The US tax dollar-for-dollar reduces what you owe KRA on your June 30th annual filing.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

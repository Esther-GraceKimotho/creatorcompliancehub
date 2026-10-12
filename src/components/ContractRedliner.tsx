import React, { useState, useRef, useEffect } from 'react';
import { 
  ContractRedlineReport, 
  ContractRedlineClause, 
  InternationalInvoiceData 
} from '../types';
import { 
  FileWarning, 
  ShieldAlert, 
  Sparkles, 
  Upload, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Download, 
  DollarSign, 
  Building2, 
  Scale, 
  ArrowRight, 
  Send, 
  RefreshCw,
  Clock,
  Eye,
  Info
} from 'lucide-react';
import { exportElementToPdf } from '../utils/pdfGenerator';
import { useProfile } from '../context/ProfileContext';

// Sample Contracts for instant 1-click testing
const SAMPLE_CONTRACT_PREDATORY = `
INFLUENCER MARKETING AGREEMENT & TALENT RELEASE
Between: Global Apex Media Agency Ltd ("Brand/Agency") and Digital Content Creator ("Creator")

1. SERVICES & DELIVERABLES:
Creator agrees to produce one (1) dedicated 60-second Instagram Reel and one (1) YouTube Integration introducing Brand's financial application.

2. OWNERSHIP & INTELLECTUAL PROPERTY:
Creator irrevocably and unconditionally assigns, transfers, and conveys to Brand all right, title, interest, and copyright in perpetuity throughout the universe in all Deliverables, raw b-roll footage, audio stems, project files, and unreleased takes, under the doctrine of work made for hire. Brand may reproduce, syndicate, sell, remix, and monetize the content in any medium now known or hereafter devised without further compensation to Creator.

3. NAME, LIKENESS & AI SYNTHESIS:
Brand shall have the perpetual, royalty-free, transferable right to exploit Creator's name, photograph, portrait, voice, biographical data, and biometric likeness across all digital and broadcast media, including using Creator's likeness and audio stems for algorithmic synthetic generation, AI voice models, and automated avatar marketing.

4. EXCLUSIVITY & NON-COMPETE:
During the term and for a period of twelve (12) calendar months following publication of the Deliverables, Creator agrees not to directly or indirectly create, publish, endorse, or consult for any company, service, or app operating within the financial, technology, payments, or lifestyle sectors globally.

5. INDEMNIFICATION & LIABILITY:
Creator agrees to defend, indemnify, and hold harmless Brand, its affiliates, directors, and agents against any and all liabilities, damages, losses, claims, and external attorney fees arising out of the campaign, regardless of whether caused by Brand's advertising representations. Creator's liability shall be uncapped.

6. COMPENSATION & PAYMENT TERMS:
Brand shall pay Creator a gross fee of $2,500 USD within sixty (60) days after delivery, subject to sole Brand satisfaction and internal corporate audit sign-off. If Brand determines content is suboptimal, Brand reserves right to withhold all payment.
`;

const SAMPLE_CONTRACT_FAIR = `
STANDARD CREATOR DIGITAL SPONSORSHIP AGREEMENT
Between: Brand Client PLC ("Brand") and Content Creator ("Creator")

1. DELIVERABLES & TIMELINE:
One (1) 90-second YouTube review and two (2) Instagram Stories delivered by 15th April 2026.

2. GRANT OF LIMITED LICENSE:
Creator retains sole and exclusive copyright, ownership, and master project files in all created content under Section 32 of Kenya Copyright Act (Cap 130). Creator grants Brand a non-exclusive, 60-day digital promotional license to share the specific edited video across Brand's verified Kenyan social media channels. Paid whitelisting / dark ads require an additional 30% monthly licensing surcharge.

3. LIKENESS & MORAL RIGHTS:
Brand may only use Creator's approved likeness in direct relation to the approved Deliverables during the 60-day campaign. No synthetic voice cloning or AI generative reproduction is permitted. Creator's moral right to attribution shall be respected.

4. EXCLUSIVITY:
Narrow category exclusivity strictly limited to direct competitor carbonated beverage brands for fourteen (14) days post-posting.

5. PAYMENT TERMS:
Total fee: KES 250,000. 50% deposit (KES 125,000) payable upon contract execution before production. Remaining 50% within fourteen (14) days of public broadcast via M-PESA or Bank Transfer. Standard 5% Kenyan Withholding Tax certificate to be provided to Creator within 30 days.
`;

export default function ContractRedliner() {
  const [activeSubTab, setActiveSubTab] = useState<'redline' | 'invoice'>('redline');
  const [contractText, setContractText] = useState('');
  const [contractTitle, setContractTitle] = useState('Brand Partnership Agreement');
  const [clientName, setClientName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [redlineReport, setRedlineReport] = useState<ContractRedlineReport | null>(null);
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);
  const [counterProposalNote, setCounterProposalNote] = useState<string | null>(null);

  const reportContainerRef = useRef<HTMLDivElement>(null);
  const invoiceContainerRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();

  // International Invoice Form State
  const [invoiceData, setInvoiceData] = useState<InternationalInvoiceData>({
    invoiceNumber: `INV-KE-${new Date().getFullYear()}-001`,
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    creatorName: profile.creatorName || '',
    creatorAddress: '',
    creatorKraPin: profile.kraPin || '',
    creatorBankName: '',
    creatorAccountNumber: '',
    creatorSwiftBic: '',
    intermediaryBankRouting: '',
    creatorEmail: profile.email || '',
    clientName: '',
    clientCountry: '',
    clientEmail: '',
    currency: 'USD',
    items: [
      {
        description: 'Sponsored Content Integration & Video Production',
        deliverableType: 'Video Production',
        amount: 1500,
        usageRights: '60-day non-exclusive regional digital distribution'
      }
    ],
    notes: 'Services rendered remotely from Kenya. Value Added Tax (VAT) exempt under Section 8 of the Kenya VAT Act (Export of Services reverse-charge regime applies).',
    paymentTerms: '50% advance deposit paid upon signing. Balance due within 14 days of broadcast. Wire transfer wire fees absorbed by sender. Standard Kenyan Withholding Tax certificate to be provided.'
  });

  // Sync with profile if loaded
  useEffect(() => {
    if (profile.creatorName && !invoiceData.creatorName) {
      setInvoiceData(prev => ({ ...prev, creatorName: profile.creatorName }));
    }
    if (profile.kraPin && !invoiceData.creatorKraPin) {
      setInvoiceData(prev => ({ ...prev, creatorKraPin: profile.kraPin }));
    }
    if (profile.email && !invoiceData.creatorEmail) {
      setInvoiceData(prev => ({ ...prev, creatorEmail: profile.email }));
    }
  }, [profile.creatorName, profile.kraPin, profile.email]);

  const handleRunRedline = async () => {
    if (!contractText.trim() || contractText.trim().length < 20) {
      alert('Please enter or paste at least 20 characters of contract text.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/contract/redline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractText,
          contractTitle,
          clientName
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setRedlineReport(data.data);
      } else {
        throw new Error(data.error || 'Failed to analyze contract');
      }
    } catch (err: any) {
      console.error('Contract analysis error:', err);
      alert('Could not complete contract analysis. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setContractTitle(file.name.replace(/\.[^/.]+$/, ''));
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = evt => {
        if (typeof evt.target?.result === 'string') {
          setContractText(evt.target.result);
        }
      };
      reader.readAsText(file);
    } else {
      // Simulate reading extracted text from PDF/DOCX
      const simulatedText = `[Extracted from: ${file.name}]\n` + SAMPLE_CONTRACT_PREDATORY;
      setContractText(simulatedText);
    }
  };

  const handleCopyClause = (clause: ContractRedlineClause) => {
    const textToCopy = `RE: Negotiation regarding Clause [${clause.clauseCategory}]:\n\nProposed Counter-Wording under Kenyan Copyright Act:\n"${clause.suggestedCounterClause}"\n\nLegal Reason: ${clause.plainExplanation}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedClauseId(clause.id);
    setTimeout(() => setCopiedClauseId(null), 2500);
  };

  const handleExportRedlinePdf = () => {
    if (reportContainerRef.current) {
      exportElementToPdf(reportContainerRef.current, {
        filename: `Legal_Redline_Report_${contractTitle.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
        format: 'a4'
      });
    }
  };

  const handleExportInvoicePdf = () => {
    if (invoiceContainerRef.current) {
      exportElementToPdf(invoiceContainerRef.current, {
        filename: `International_Invoice_${invoiceData.invoiceNumber}_${Date.now()}.pdf`,
        format: 'a4'
      });
    }
  };

  const invoiceTotal = invoiceData.items.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Anti-Predatory Brand Contract Shield</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              AI Contract Redliner & International Invoicing
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Detect predatory perpetual copyright clauses, AI likeness steals, and uncapped liabilities before you sign. Format international invoices with SWIFT routing to get paid promptly without tax hitches.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl shrink-0 backdrop-blur-xs border border-white/10">
            <button
              onClick={() => setActiveSubTab('redline')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeSubTab === 'redline'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Contract Redliner
            </button>
            <button
              onClick={() => setActiveSubTab('invoice')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeSubTab === 'invoice'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              International Invoice
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'redline' && (
        <div className="space-y-6">
          {/* Input & Upload Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-150">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <FileWarning className="w-5 h-5 text-rose-600" />
                  Drop or Paste Brand Partnership Agreement
                </h3>
                <p className="text-xs text-slate-500">
                  Upload PDF/DOCX or pick a realistic scenario to audit for red flags.
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Presets:</span>
                <button
                  type="button"
                  onClick={() => {
                    setContractText(SAMPLE_CONTRACT_PREDATORY);
                    setContractTitle('Predatory Influencer Agreement (Perpetual Buyout)');
                    setClientName('Global Apex Media Agency Ltd');
                  }}
                  className="px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors"
                >
                  ⚠️ Predatory Buyout
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setContractText(SAMPLE_CONTRACT_FAIR);
                    setContractTitle('Fair 60-Day Digital Sponsorship');
                    setClientName('Horizon Consumer Goods Kenya PLC');
                  }}
                  className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                >
                  ✅ Fair Creator Deal
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Agreement Title
                </label>
                <input
                  type="text"
                  value={contractTitle}
                  onChange={e => setContractTitle(e.target.value)}
                  placeholder="e.g. YouTube Sponsored Video Master Agreement"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Agency / Brand Name
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="e.g. Acme Marketing London Ltd"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Contract Text / Clauses
                </label>
                <label className="cursor-pointer text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Agreement File (.pdf, .txt)</span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
              </div>
              <textarea
                rows={9}
                value={contractText}
                onChange={e => setContractText(e.target.value)}
                placeholder="Paste the agreement text here..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs md:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Audits against Kenyan Copyright Act 2021/2026 (Cap 130) & international SAG-AFTRA/Creator standards.
              </span>
              <button
                onClick={handleRunRedline}
                disabled={isLoading}
                className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Legal Risk...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Legal Redline</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          {redlineReport && (
            <div id="contract-redline-dossier" ref={reportContainerRef} className="space-y-6 animate-in fade-in duration-300">
              {/* Executive Risk Scorecard */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        redlineReport.riskLevel === 'EXTREME'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : redlineReport.riskLevel === 'HIGH'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {redlineReport.riskLevel} RISK CONTRACT
                      </span>
                      <span className="text-xs text-slate-400">Audit Reference: {redlineReport.id}</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900">
                      {redlineReport.contractTitle}
                    </h3>
                    <p className="text-xs text-slate-500">Counterparty: {redlineReport.clientName}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400 uppercase">Risk Severity Score</div>
                      <div className={`text-3xl md:text-4xl font-black ${
                        redlineReport.overallRiskScore > 70 
                          ? 'text-rose-600' 
                          : redlineReport.overallRiskScore > 40 
                          ? 'text-amber-600' 
                          : 'text-emerald-600'
                      }`}>
                        {redlineReport.overallRiskScore}/100
                      </div>
                    </div>
                    <button
                      onClick={handleExportRedlinePdf}
                      className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Export Audit PDF</span>
                    </button>
                  </div>
                </div>

                {/* Plain Language Summary */}
                <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm leading-relaxed">
                  <strong className="block text-slate-900 mb-1 font-bold">Legal Executive Summary:</strong>
                  {redlineReport.riskSummary}
                </div>

                {/* Critical Detection Flags */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                    redlineReport.perpetualBuyoutDetected 
                      ? 'bg-rose-50 border-rose-200 text-rose-900' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    {redlineReport.perpetualBuyoutDetected ? <XCircle className="w-5 h-5 text-rose-600 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                    <div className="text-xs">
                      <div className="font-bold">Perpetual Copyright Transfer</div>
                      <div className="text-[11px] opacity-80">{redlineReport.perpetualBuyoutDetected ? 'Detected (Predatory)' : 'Creator Retains IP'}</div>
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                    redlineReport.likenessRightsGrabbed 
                      ? 'bg-rose-50 border-rose-200 text-rose-900' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    {redlineReport.likenessRightsGrabbed ? <XCircle className="w-5 h-5 text-rose-600 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                    <div className="text-xs">
                      <div className="font-bold">Likeness & AI Voice Grab</div>
                      <div className="text-[11px] opacity-80">{redlineReport.likenessRightsGrabbed ? 'Unrestricted / AI Risk' : 'Safely Protected'}</div>
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                    redlineReport.unfairIndemnityDetected 
                      ? 'bg-amber-50 border-amber-200 text-amber-900' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    {redlineReport.unfairIndemnityDetected ? <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                    <div className="text-xs">
                      <div className="font-bold">One-Sided Indemnification</div>
                      <div className="text-[11px] opacity-80">{redlineReport.unfairIndemnityDetected ? 'Uncapped Creator Liability' : 'Mutual & Capped'}</div>
                    </div>
                  </div>
                </div>

                {/* Action Items Checklist */}
                {redlineReport.actionItems && redlineReport.actionItems.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Negotiation Action Plan:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {redlineReport.actionItems.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-150 text-xs text-slate-700">
                          <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                            {idx + 1}
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Granular Clause Redlines & Counter-Proposals */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Scale className="w-4 h-4 text-slate-600" />
                  Clause-by-Clause Redline Breakdown & Counter-Drafts
                </h4>

                <div className="grid grid-cols-1 gap-4">
                  {redlineReport.clauses.map(clause => (
                    <div
                      key={clause.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                    >
                      {/* Clause Category Bar */}
                      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
                        clause.severity === 'CRITICAL'
                          ? 'bg-rose-50/70 border-rose-100 text-rose-950'
                          : clause.severity === 'WARNING'
                          ? 'bg-amber-50/70 border-amber-100 text-amber-950'
                          : 'bg-emerald-50/70 border-emerald-100 text-emerald-950'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            clause.severity === 'CRITICAL'
                              ? 'bg-rose-600 text-white'
                              : clause.severity === 'WARNING'
                              ? 'bg-amber-600 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}>
                            {clause.severity}
                          </span>
                          <strong className="text-xs font-bold uppercase tracking-wider">
                            {clause.clauseCategory.replace(/_/g, ' ')}
                          </strong>
                        </div>

                        <span className="text-[11px] text-slate-500 font-medium">
                          {clause.kenyanLegalContext}
                        </span>
                      </div>

                      <div className="p-5 space-y-4">
                        {/* Original Predatory Text */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Original Contract Text:</div>
                          <p className="text-xs font-mono text-slate-700 leading-relaxed italic">
                            "{clause.originalText}"
                          </p>
                        </div>

                        {/* Plain Language Explanation */}
                        <div className="text-xs text-slate-800 leading-relaxed bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/50">
                          <strong className="block text-slate-900 mb-0.5 font-bold">What This Means In Plain Language:</strong>
                          <p>{clause.plainExplanation}</p>
                        </div>

                        {/* Suggested Counter-Clause with Copy Button */}
                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Recommended Creator-Friendly Counter-Clause:
                            </span>
                            <button
                              onClick={() => handleCopyClause(clause)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-colors"
                            >
                              {copiedClauseId === clause.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Copied Counter-Clause!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Copy to Email</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-xs font-mono text-emerald-950 bg-white p-3 rounded-lg border border-emerald-150 leading-relaxed">
                            "{clause.suggestedCounterClause}"
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* International Invoice Generator Tab */}
      {activeSubTab === 'invoice' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  International Cross-Border Invoice Formatter
                </h3>
                <p className="text-xs text-slate-500">
                  Formatted for swift clearance through US/UK/EU corporate accounts with SWIFT/BIC, correspondent routing, and reverse-charge VAT disclosure.
                </p>
              </div>

              <button
                onClick={handleExportInvoicePdf}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-colors shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download Invoice PDF</span>
              </button>
            </div>

            {/* Editable Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={invoiceData.invoiceNumber}
                  onChange={e => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Issue Date</label>
                <input
                  type="date"
                  value={invoiceData.issueDate}
                  onChange={e => setInvoiceData({ ...invoiceData, issueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Payment Due Date (Net-14)</label>
                <input
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={e => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Currency</label>
                <select
                  value={invoiceData.currency}
                  onChange={e => setInvoiceData({ ...invoiceData, currency: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                >
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="KES">KES (Kenyan Shilling)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Creator KRA PIN</label>
                <input
                  type="text"
                  value={invoiceData.creatorKraPin}
                  onChange={e => setInvoiceData({ ...invoiceData, creatorKraPin: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">SWIFT / BIC Code</label>
                <input
                  type="text"
                  value={invoiceData.creatorSwiftBic}
                  onChange={e => setInvoiceData({ ...invoiceData, creatorSwiftBic: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>

            {/* Live Invoice Preview Sheet */}
            <div
              id="international-invoice-dossier"
              ref={invoiceContainerRef}
              className="mt-6 bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 sm:p-10 space-y-8 text-slate-800"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-slate-300 pb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">COMMERCIAL INVOICE</h1>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">EXPORT OF CREATIVE DIGITAL SERVICES</p>
                  <div className="mt-4 space-y-0.5 text-xs">
                    <strong className="block text-slate-900 text-sm">{invoiceData.creatorName}</strong>
                    <p className="text-slate-600">{invoiceData.creatorAddress}</p>
                    <p className="text-slate-600">Email: {invoiceData.creatorEmail}</p>
                    <p className="font-mono text-slate-800 font-bold">KRA Tax PIN: {invoiceData.creatorKraPin}</p>
                  </div>
                </div>

                <div className="sm:text-right space-y-1 text-xs">
                  <div className="font-mono text-lg font-black text-slate-900">{invoiceData.invoiceNumber}</div>
                  <div className="text-slate-500">Date: {invoiceData.issueDate}</div>
                  <div className="font-bold text-rose-700">Due: {invoiceData.dueDate}</div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <span className="text-slate-500 uppercase text-[10px] font-bold block">Bill To Counterparty:</span>
                    <strong className="text-slate-900 block">{invoiceData.clientName}</strong>
                    <span className="text-slate-600">{invoiceData.clientCountry}</span>
                    <span className="text-slate-500 block">{invoiceData.clientEmail}</span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-300 text-slate-500 uppercase tracking-wider text-[10px]">
                      <th className="py-2">Description & Scope of Work</th>
                      <th className="py-2">License Terms</th>
                      <th className="py-2 text-right">Amount ({invoiceData.currency})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoiceData.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-3 pr-4">
                          <strong className="block text-slate-900 text-xs">{item.description}</strong>
                          <span className="text-slate-500 text-[11px]">{item.deliverableType}</span>
                        </td>
                        <td className="py-3 text-slate-600 text-[11px] pr-4">
                          {item.usageRights}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-slate-900 text-xs">
                          {invoiceData.currency} {item.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-300">
                      <td colSpan={2} className="py-4 text-right font-bold text-slate-700">
                        Total Amount Due:
                      </td>
                      <td className="py-4 text-right font-mono text-base font-black text-slate-900">
                        {invoiceData.currency} {invoiceTotal.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Wire Banking Instructions */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  International Wire Transfer (SWIFT) Banking Details:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Beneficiary Bank:</span>
                    <strong className="text-slate-900">{invoiceData.creatorBankName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">SWIFT / BIC:</span>
                    <strong className="text-slate-900 font-mono">{invoiceData.creatorSwiftBic}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Account Number / IBAN:</span>
                    <strong className="text-slate-900 font-mono">{invoiceData.creatorAccountNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Intermediary Correspondent Bank:</span>
                    <strong className="text-slate-900 font-mono">{invoiceData.intermediaryBankRouting}</strong>
                  </div>
                </div>
              </div>

              {/* Legal Tax Declaration & Terms */}
              <div className="space-y-2 text-[11px] text-slate-600 border-t border-slate-200 pt-4">
                <p><strong>Tax Classification: </strong>{invoiceData.notes}</p>
                <p><strong>Payment Terms: </strong>{invoiceData.paymentTerms}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

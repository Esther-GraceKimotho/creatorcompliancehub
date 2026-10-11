import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  KecoboChecklistItem, 
  KecoboChecklistPhase, 
  KecoboWorkDossier 
} from '../types';
import { 
  Shield, 
  CheckCircle2, 
  Circle, 
  Download, 
  FileText, 
  AlertCircle, 
  Sparkles, 
  Scale, 
  BookOpen, 
  Clock, 
  ExternalLink, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  FileCheck, 
  Lock, 
  ScanFace, 
  Fingerprint, 
  ShieldCheck, 
  FileSignature, 
  Building2, 
  Smartphone, 
  Share2, 
  Printer, 
  Info,
  Gavel,
  AlertTriangle,
  X
} from 'lucide-react';
import { exportElementToPdf } from '../utils/pdfGenerator';
import { useProfile } from '../context/ProfileContext';
import SensitiveShield from './SensitiveShield';

const INITIAL_CHECKLIST_PHASES: KecoboChecklistPhase[] = [
  {
    id: 1,
    phaseName: 'Phase 1: Pre-Registration & Fixation (Proof of Work)',
    phaseDescription: 'Establishing legal ownership and tangible expression under the Kenya Copyright Act Cap 130.',
    badge: 'Foundation',
    items: [
      {
        id: 'c1_1',
        phaseId: 1,
        title: 'Fixation in Tangible Medium of Expression',
        description: 'Verify your work is recorded in writing, video (MP4/MOV), audio (WAV/MP3), digital image, or code repository. Ideas alone are not protected; fixation is required by law.',
        requirementType: 'MANDATORY',
        legalRef: 'Kenya Copyright Act, Section 22(1)',
        officialTip: 'Ensure your raw recording or project files (e.g. Premiere Pro / Logic Pro / Figma) retain original creation timestamps.',
        timeEstimate: '10 mins',
        completed: true
      },
      {
        id: 'c1_2',
        phaseId: 1,
        title: 'Originality & Non-Infringement Verification',
        description: 'Confirm that the work was independently created by you and does not copy existing copyrighted scripts, beats, melodies, or graphics without license.',
        requirementType: 'MANDATORY',
        legalRef: 'Section 22(3) & 35',
        officialTip: 'If using royalty-free beats or loops, keep written commercial licenses on file in case of dispute.',
        timeEstimate: '15 mins',
        completed: true
      },
      {
        id: 'c1_3',
        phaseId: 1,
        title: 'Co-Creators & Ownership Split Agreements',
        description: 'If you collaborated with videographers, beat producers, actors, or co-writers, agree on ownership percentages and obtain written split sheets.',
        requirementType: 'RECOMMENDED',
        legalRef: 'Copyright Act, Joint Works Clause',
        officialTip: 'Specify whether ownership is joint (e.g. 50/50) or if collaborators were engaged on a "Work-Made-For-Hire" assignment.',
        timeEstimate: '20 mins',
        completed: true
      },
      {
        id: 'c1_4',
        phaseId: 1,
        title: 'Third-Party Model & Location Releases',
        description: 'Secure signed appearance releases from featured individuals, actors, or private venue owners featured predominantly in your audiovisual content.',
        requirementType: 'RECOMMENDED',
        legalRef: 'Data Protection Act 2019 & Privacy Laws',
        officialTip: 'Protects you from likeness disputes or demands to take down monetized episodes after release.',
        timeEstimate: '30 mins',
        completed: false
      }
    ]
  },
  {
    id: 2,
    phaseName: 'Phase 2: NRR Account & eCitizen Verification',
    phaseDescription: 'Accessing the official National Rights Registry (NRR) and verifying creator identity.',
    badge: 'Identity',
    items: [
      {
        id: 'c2_1',
        phaseId: 2,
        title: 'Access Official KECOBO NRR Portal',
        description: 'Visit the official government National Rights Registry portal at nrr.copyright.go.ke (or eCitizen KECOBO services).',
        requirementType: 'MANDATORY',
        legalRef: 'KECOBO NRR Portal',
        officialTip: 'Beware of scam sites. The genuine portal ends with the .go.ke government domain.',
        timeEstimate: '5 mins',
        completed: true
      },
      {
        id: 'c2_2',
        phaseId: 2,
        title: 'Link Valid Kenyan National ID / Alien Card',
        description: 'Provide your 8-digit Kenyan National ID Number or Alien Card. For registered production companies, provide the Certificate of Incorporation (BRS).',
        requirementType: 'MANDATORY',
        legalRef: 'KYC & Authorship Verification',
        officialTip: 'Your National ID will be tied to your cryptographic NRR copyright owner key.',
        timeEstimate: '5 mins',
        completed: true
      },
      {
        id: 'c2_3',
        phaseId: 2,
        title: 'KRA PIN Association for Creator Tax Compliance',
        description: 'Link your individual KRA PIN (e.g. P000000000A) to reconcile copyright licensing royalties and eTIMS withholding taxes.',
        requirementType: 'RECOMMENDED',
        legalRef: 'Finance Act 2023/2026 WHT on Digital Content',
        officialTip: 'Ensures CMOs (MCSK/KAMP/PRISK) remit withholding tax certificates directly to your iTax ledger.',
        timeEstimate: '5 mins',
        completed: true
      }
    ]
  },
  {
    id: 3,
    phaseName: 'Phase 3: Work Categorization & Legal Metadata',
    phaseDescription: 'Accurately defining your work classification for protection scope under Kenyan law.',
    badge: 'Metadata',
    items: [
      {
        id: 'c3_1',
        phaseId: 3,
        title: 'Select Appropriate Work Category',
        description: 'Choose your work class: Audiovisual (YouTube vlog, film, series), Musical work & Sound Recording, Literary (E-book, blog, script), Artistic (graphic design, photo), or Computer Program.',
        requirementType: 'MANDATORY',
        legalRef: 'Kenya Copyright Act, Section 2',
        officialTip: 'For music videos, register both the Sound Recording and the Audiovisual work for dual protection.',
        timeEstimate: '5 mins',
        completed: true
      },
      {
        id: 'c3_2',
        phaseId: 3,
        title: 'Provide Definitive Title & Alternative Working Titles',
        description: 'Enter the exact public title of the work, including episode number or series sub-title, and any working titles used during production.',
        requirementType: 'MANDATORY',
        legalRef: 'NRR Database Record Standard',
        officialTip: 'This exact title will appear on your government-issued Copyright Registration Certificate.',
        timeEstimate: '5 mins',
        completed: true
      },
      {
        id: 'c3_3',
        phaseId: 3,
        title: 'Declare Publication Status & Territory',
        description: 'State whether the work is Published (live on YouTube, TikTok, Spotify, Netflix) or Unpublished. If published, record the exact release date and primary territory (Kenya / Worldwide).',
        requirementType: 'MANDATORY',
        legalRef: 'Section 23, Term of Copyright',
        officialTip: 'Copyright in published audiovisual works lasts 50 years from the end of the year in which it was first made accessible.',
        timeEstimate: '5 mins',
        completed: false
      }
    ]
  },
  {
    id: 4,
    phaseName: 'Phase 4: Digital Deposit & Statutory Attachment Upload',
    phaseDescription: 'Submitting evidence of the work to KECOBO statutory digital archives.',
    badge: 'Deposit Vault',
    items: [
      {
        id: 'c4_1',
        phaseId: 4,
        title: 'Upload Digital Master Copy (Fixation Deposit)',
        description: 'Upload a clear master copy: PDF for scripts/books, MP4/MKV for video (or trailer sample + unlisted link), MP3/WAV for audio, or ZIP archive up to 50MB.',
        requirementType: 'DOCUMENT_UPLOAD',
        legalRef: 'KECOBO Deposit Regulations',
        officialTip: 'KECOBO stores this securely as immutable legal evidence in case of court litigation or piracy prosecution.',
        timeEstimate: '15 mins',
        completed: false
      },
      {
        id: 'c4_2',
        phaseId: 4,
        title: 'Upload Certified Scanned Copy of National ID / Passport',
        description: 'Clear color scan or high-resolution photo of your Kenyan National Identity Card (front & back) or Passport biodata page.',
        requirementType: 'DOCUMENT_UPLOAD',
        legalRef: 'Identity Verification KYC',
        officialTip: 'Ensure file is under 5MB in PDF, JPG, or PNG format.',
        timeEstimate: '5 mins',
        completed: true
      },
      {
        id: 'c4_3',
        phaseId: 4,
        title: 'Upload Assignment Deed / Work-For-Hire Contract (If Applicable)',
        description: 'If you are registering work created by a freelance editor, designer, or contractor, attach their signed intellectual property assignment deed transfer.',
        requirementType: 'RECOMMENDED',
        legalRef: 'Copyright Act, Section 31',
        officialTip: 'Without this deed, the freelance editor could claim co-authorship rights under Kenyan common law.',
        timeEstimate: '10 mins',
        completed: false
      }
    ]
  },
  {
    id: 5,
    phaseName: 'Phase 5: Fee Assessment & M-PESA Settlement',
    phaseDescription: 'Paying the official government statutory fee via eCitizen payment gateway.',
    badge: 'Payment',
    items: [
      {
        id: 'c5_1',
        phaseId: 5,
        title: 'Generate eCitizen KECOBO Payment Invoice',
        description: 'The NRR portal generates a unique eCitizen invoice with a dedicated billing number and fee breakdown.',
        requirementType: 'MANDATORY',
        legalRef: 'KECOBO Statutory Fee Order',
        officialTip: 'The standard registration fee for content creators is KES 1,000 per creative work.',
        timeEstimate: '3 mins',
        completed: false
      },
      {
        id: 'c5_2',
        phaseId: 5,
        title: 'Pay via M-PESA Paybill 222222',
        description: 'Go to M-PESA > Lipa na M-PESA > Paybill > Business No: 222222 > Account No: [eCitizen Invoice Ref] > Amount: KES 1,000.',
        requirementType: 'MANDATORY',
        legalRef: 'Government eCitizen Gateway',
        officialTip: 'Keep your M-PESA confirmation SMS. It is linked automatically within seconds.',
        timeEstimate: '2 mins',
        completed: false
      },
      {
        id: 'c5_3',
        phaseId: 5,
        title: 'Capture M-PESA Transaction Code in Dossier',
        description: 'Enter the 10-character M-PESA code (e.g. SLK9492XYZ) into your NRR registration record for automated reconciliation.',
        requirementType: 'MANDATORY',
        legalRef: 'Financial Audit Clearance',
        officialTip: 'Automated receipt will be attached to your pending application dashboard.',
        timeEstimate: '2 mins',
        completed: false
      }
    ]
  },
  {
    id: 6,
    phaseName: 'Phase 6: Examination, Certificate & Rights Enforcement',
    phaseDescription: 'Legal examination, issuance of the official NRR Certificate, and copyright enforcement.',
    badge: 'Protection',
    items: [
      {
        id: 'c6_1',
        phaseId: 6,
        title: 'KECOBO Examination & Official Register Entry',
        description: 'KECOBO legal officers review the submission against prior filings. The process typically takes 3 to 7 business working days.',
        requirementType: 'MANDATORY',
        legalRef: 'Kenya Copyright Board Examination',
        officialTip: 'If additional clarification is needed, you will receive an SMS and email notification.',
        timeEstimate: '3-7 days',
        completed: false
      },
      {
        id: 'c6_2',
        phaseId: 6,
        title: 'Download Official NRR Registration Certificate',
        description: 'Once approved, download the official government Certificate of Copyright Registration featuring the Republic of Kenya seal, QR code, and NRR Reference number.',
        requirementType: 'MANDATORY',
        legalRef: 'Legal Proof of Prima Facie Ownership',
        officialTip: 'This certificate serves as prima facie evidence in Kenyan courts and international dispute arbitration.',
        timeEstimate: 'Instant on approval',
        completed: false
      },
      {
        id: 'c6_3',
        phaseId: 6,
        title: 'Enforce Notice: Apply Copyright Mark on Digital Content',
        description: 'Place the official copyright notice on YouTube video descriptions, website footers, and credit rolls: "© 2026 [Creator Name]. Registered with KECOBO NRR-[REF]".',
        requirementType: 'RECOMMENDED',
        legalRef: 'Section 35 & 38 (Penalties for Infringement)',
        officialTip: 'Puts all media houses, commercial advertisers, and competitors on legal notice of ownership.',
        timeEstimate: '5 mins',
        completed: false
      },
      {
        id: 'c6_4',
        phaseId: 6,
        title: 'Enroll with Kenyan CMOs (MCSK, KAMP, PRISK) for Royalties',
        description: 'If your work includes music or performance, affiliate with relevant Collective Management Organisations to receive broadcast royalties from Kenyan TV & Radio.',
        requirementType: 'RECOMMENDED',
        legalRef: 'CMO Royalty Regulations Kenya',
        officialTip: 'Present your NRR certificate for fast-track catalog admission and royalty distribution.',
        timeEstimate: '1 hour',
        completed: false
      }
    ]
  }
];

export default function KecoboChecklist() {
  const [phases, setPhases] = useState<KecoboChecklistPhase[]>(() => {
    try {
      const saved = localStorage.getItem('creator_kecobo_checklist');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CHECKLIST_PHASES;
  });

  const [dossier, setDossier] = useState<KecoboWorkDossier>(() => {
    try {
      const saved = localStorage.getItem('creator_kecobo_dossier');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return {
      title: '',
      workType: 'AUDIOVISUAL',
      creatorName: '',
      nationalId: '',
      kraPin: '',
      yearCreated: new Date().getFullYear(),
      isPublished: false,
      publicationDate: '',
      territory: 'Kenya & Worldwide',
      coCreators: '',
      description: '',
      statutoryFeeKes: 1000,
      ecitizenInvoiceRef: '',
      mpesaCode: ''
    };
  });

  const { profile } = useProfile();

  // Populate dossier from profile if creatorName/nationalId are empty
  useEffect(() => {
    setDossier(prev => ({
      ...prev,
      creatorName: prev.creatorName || profile.creatorName || '',
      nationalId: prev.nationalId || profile.nationalId || '',
      kraPin: prev.kraPin || profile.kraPin || ''
    }));
  }, [profile.creatorName, profile.nationalId, profile.kraPin]);

  const [filterType, setFilterType] = useState<'all' | 'mandatory' | 'pending' | 'completed'>('all');
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true
  });
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'checklist' | 'dossier' | 'guide'>('checklist');

  const reportContainerRef = useRef<HTMLDivElement>(null);
  const ceaseDesistContainerRef = useRef<HTMLDivElement>(null);

  const [isCeaseDesistModalOpen, setIsCeaseDesistModalOpen] = useState(false);
  const [isExportingCeaseDesistPdf, setIsExportingCeaseDesistPdf] = useState(false);
  const [infringerDetails, setInfringerDetails] = useState({
    name: 'Infringing Entity / Platform Account',
    platform: 'Social Media / YouTube / TikTok / Broadcast TV',
    urlOrChannel: 'https://example.com/unauthorized-repost-or-clip',
    claimedSettlementFeeKes: 'KES 250,000',
    deadlineDays: 7
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('creator_kecobo_checklist', JSON.stringify(phases));
    } catch (e) {
      console.error(e);
    }
  }, [phases]);

  useEffect(() => {
    try {
      localStorage.setItem('creator_kecobo_dossier', JSON.stringify(dossier));
    } catch (e) {
      console.error(e);
    }
  }, [dossier]);

  // Checklist Calculations
  const stats = useMemo(() => {
    let totalItems = 0;
    let completedItems = 0;
    let mandatoryTotal = 0;
    let mandatoryCompleted = 0;

    phases.forEach(phase => {
      phase.items.forEach(item => {
        totalItems++;
        if (item.completed) completedItems++;
        if (item.requirementType === 'MANDATORY') {
          mandatoryTotal++;
          if (item.completed) mandatoryCompleted++;
        }
      });
    });

    const overallPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    const mandatoryPercentage = mandatoryTotal > 0 ? Math.round((mandatoryCompleted / mandatoryTotal) * 100) : 0;

    let readinessStatus = 'In Progress';
    let badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
    if (mandatoryPercentage === 100 && overallPercentage >= 90) {
      readinessStatus = 'Ready for Official Submission';
      badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    } else if (mandatoryPercentage >= 75) {
      readinessStatus = 'Documentation Substantially Ready';
      badgeColor = 'bg-blue-100 text-blue-800 border-blue-300';
    }

    return {
      totalItems,
      completedItems,
      mandatoryTotal,
      mandatoryCompleted,
      overallPercentage,
      mandatoryPercentage,
      readinessStatus,
      badgeColor
    };
  }, [phases]);

  const toggleItem = (itemId: string) => {
    setPhases(prev => prev.map(phase => ({
      ...phase,
      items: phase.items.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item)
    })));
  };

  const togglePhaseComplete = (phaseId: number, targetStatus: boolean) => {
    setPhases(prev => prev.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          items: phase.items.map(item => ({ ...item, completed: targetStatus }))
        };
      }
      return phase;
    }));
  };

  const toggleAll = (status: boolean) => {
    setPhases(prev => prev.map(phase => ({
      ...phase,
      items: phase.items.map(item => ({ ...item, completed: status }))
    })));
  };

  const resetToDefaults = () => {
    setPhases(INITIAL_CHECKLIST_PHASES);
  };

  const toggleExpand = (phaseId: number) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  // Download Comprehensive KECOBO Registration Compliance Report (PDF)
  const handleDownloadComplianceReport = async () => {
    if (!reportContainerRef.current) return;

    setIsExportingPdf(true);
    setExportNotice(null);
    try {
      const sanitizedTitle = dossier.title.replace(/[^a-zA-Z0-9]/g, '_');
      await exportElementToPdf(reportContainerRef.current, {
        filename: `KECOBO_IP_Registration_Report_${sanitizedTitle}.pdf`,
        format: 'a4',
        orientation: 'portrait',
        margin: 8
      });
      setExportNotice('KECOBO Registration Report downloaded successfully!');
      setTimeout(() => setExportNotice(null), 4000);
    } catch (err) {
      console.error('Failed to generate KECOBO PDF', err);
      setExportNotice('Failed to generate PDF. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Download Formal Statutory Legal Notice & Cease-and-Desist Notice (PDF)
  const handleDownloadCeaseAndDesistPdf = async () => {
    if (!ceaseDesistContainerRef.current) return;

    setIsExportingCeaseDesistPdf(true);
    setExportNotice(null);
    try {
      const sanitizedTitle = dossier.title.replace(/[^a-zA-Z0-9]/g, '_');
      await exportElementToPdf(ceaseDesistContainerRef.current, {
        filename: `KECOBO_Cease_and_Desist_Notice_${sanitizedTitle}.pdf`,
        format: 'a4',
        orientation: 'portrait',
        margin: 8
      });
      setExportNotice('Official Cease & Desist Notice (PDF) downloaded successfully!');
      setTimeout(() => setExportNotice(null), 4000);
      setIsCeaseDesistModalOpen(false);
    } catch (err) {
      console.error('Failed to generate Cease and Desist PDF', err);
      setExportNotice('Failed to generate Cease and Desist PDF. Please try again.');
    } finally {
      setIsExportingCeaseDesistPdf(false);
    }
  };

  // Filter items logic
  const filteredPhases = useMemo(() => {
    return phases.map(phase => {
      let filteredItems = phase.items;
      if (filterType === 'mandatory') {
        filteredItems = phase.items.filter(i => i.requirementType === 'MANDATORY');
      } else if (filterType === 'pending') {
        filteredItems = phase.items.filter(i => !i.completed);
      } else if (filterType === 'completed') {
        filteredItems = phase.items.filter(i => i.completed);
      }
      return {
        ...phase,
        items: filteredItems
      };
    }).filter(phase => filteredItemsLength(phase) > 0);

    function filteredItemsLength(p: KecoboChecklistPhase) {
      return p.items.length;
    }
  }, [phases, filterType]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Kenya Copyright Board (KECOBO)
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                NRR Digital Standards
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Kenyan Content Creator IP Registration Checklist
            </h1>
            <p className="text-blue-100 text-sm md:text-base leading-relaxed">
              Step-by-step statutory guide for video creators, podcasters, musicians, and digital artists to register creative works with the National Rights Registry (NRR) and enforce intellectual property rights in Kenya.
            </p>
          </div>

          {/* Quick Score Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-xl flex flex-col gap-2 min-w-[240px]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-200 font-medium">Readiness Score</span>
              <span className="text-xs font-bold text-white bg-blue-500/40 px-2 py-0.5 rounded">
                {stats.completedItems}/{stats.totalItems} Steps
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-white">{stats.overallPercentage}%</span>
              <span className="text-xs text-blue-200">completed</span>
            </div>
            <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-400 to-emerald-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${stats.overallPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 text-blue-200 border-t border-white/10 mt-1">
              <span>Mandatory Items:</span>
              <span className="font-bold text-white">{stats.mandatoryCompleted}/{stats.mandatoryTotal} ({stats.mandatoryPercentage}%)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation & Export Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'checklist' ? 'bg-white text-slate-900 shadow-sm' : 'text-blue-200 hover:text-white'
              }`}
            >
              Step-by-Step Checklist
            </button>
            <button
              onClick={() => setActiveTab('dossier')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'dossier' ? 'bg-white text-slate-900 shadow-sm' : 'text-blue-200 hover:text-white'
              }`}
            >
              Work Dossier & Details
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'guide' ? 'bg-white text-slate-900 shadow-sm' : 'text-blue-200 hover:text-white'
              }`}
            >
              IP Guide & Fee Schedule
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCeaseDesistModalOpen(true)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-colors border border-white/20 flex items-center gap-1.5 shadow-xs"
              title="Generate & Download Cease & Desist Notice as PDF"
            >
              <FileSignature className="w-3.5 h-3.5 text-blue-300" />
              <span>Cease & Desist (PDF)</span>
            </button>

            <button
              onClick={handleDownloadComplianceReport}
              disabled={isExportingPdf}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-75"
            >
              {isExportingPdf ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-slate-950" />
              )}
              {isExportingPdf ? 'Compiling PDF...' : 'Download Official Report (PDF)'}
            </button>
          </div>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2 text-sm shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Main Tab View */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterType === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Steps ({stats.totalItems})
              </button>
              <button
                onClick={() => setFilterType('mandatory')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterType === 'mandatory' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Mandatory Only ({stats.mandatoryTotal})
              </button>
              <button
                onClick={() => setFilterType('pending')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterType === 'pending' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pending ({stats.totalItems - stats.completedItems})
              </button>
              <button
                onClick={() => setFilterType('completed')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterType === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Completed ({stats.completedItems})
              </button>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={() => toggleAll(true)}
                className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Mark All Complete
              </button>
              <button
                onClick={() => toggleAll(false)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={resetToDefaults}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Reset to default Kenya template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Current Work Summary Pill */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500 uppercase">Target Work:</span>
              <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {dossier.title || 'Untitled Work (Click Edit to configure)'}
              </span>
              <span className="text-slate-500">({dossier.workType})</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Creator: <strong className="text-slate-800">{dossier.creatorName}</strong></span>
              <span>National ID: <SensitiveShield inline value={dossier.nationalId} type="idNumber" label="National ID" target="KECOBO" /></span>
              <button
                onClick={() => setActiveTab('dossier')}
                className="text-blue-600 hover:underline font-bold"
              >
                Edit Dossier &rarr;
              </button>
            </div>
          </div>

          {/* Phases List */}
          <div className="space-y-4">
            {filteredPhases.map(phase => {
              const phaseCompleted = phase.items.every(i => i.completed);
              const phaseCompletedCount = phase.items.filter(i => i.completed).length;
              const isExpanded = expandedPhases[phase.id] ?? true;

              return (
                <div 
                  key={phase.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                >
                  {/* Phase Accordion Header */}
                  <div 
                    className={`p-4 md:p-5 flex items-center justify-between gap-4 cursor-pointer select-none transition-colors ${
                      phaseCompleted ? 'bg-emerald-50/40 hover:bg-emerald-50/60' : 'bg-slate-50/70 hover:bg-slate-100/60'
                    }`}
                    onClick={() => toggleExpand(phase.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        phaseCompleted 
                          ? 'bg-emerald-600 text-white shadow-2xs' 
                          : 'bg-blue-600 text-white'
                      }`}>
                        {phaseCompleted ? <CheckCircle2 className="w-5 h-5" /> : phase.id}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-sm md:text-base">
                            {phase.phaseName}
                          </h3>
                          <span className="text-[10px] uppercase font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {phase.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {phase.phaseDescription}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-bold text-slate-700">
                          {phaseCompletedCount}/{phase.items.length}
                        </span>
                        <span className="text-[10px] text-slate-400 block">completed</span>
                      </div>

                      <button
                        onClick={() => togglePhaseComplete(phase.id, !phaseCompleted)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-colors ${
                          phaseCompleted
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                        title={phaseCompleted ? 'Uncheck all in phase' : 'Mark phase complete'}
                      >
                        {phaseCompleted ? 'Phase Done' : 'Complete Phase'}
                      </button>

                      <button 
                        onClick={() => toggleExpand(phase.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Checklist Items */}
                  {isExpanded && (
                    <div className="divide-y divide-slate-100 p-2 sm:p-3">
                      {phase.items.map(item => (
                        <div 
                          key={item.id}
                          className={`p-3 sm:p-4 rounded-xl transition-all ${
                            item.completed ? 'bg-slate-50/50' : 'hover:bg-blue-50/30'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleItem(item.id)}
                              className="mt-0.5 text-blue-600 hover:scale-110 transition-transform shrink-0"
                            >
                              {item.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-400 hover:text-blue-500" />
                              )}
                            </button>

                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <h4 className={`text-sm font-bold ${
                                  item.completed ? 'text-slate-700 line-through opacity-80' : 'text-slate-900'
                                }`}>
                                  {item.title}
                                </h4>
                                <div className="flex items-center gap-1.5">
                                  {item.requirementType === 'MANDATORY' && (
                                    <span className="text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                                      Mandatory
                                    </span>
                                  )}
                                  {item.requirementType === 'DOCUMENT_UPLOAD' && (
                                    <span className="text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                                      Doc Upload
                                    </span>
                                  )}
                                  {item.requirementType === 'RECOMMENDED' && (
                                    <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                      Recommended
                                    </span>
                                  )}
                                  {item.timeEstimate && (
                                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                      <Clock className="w-3 h-3" />
                                      {item.timeEstimate}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <p className="text-xs text-slate-600 leading-relaxed">
                                {item.description}
                              </p>

                              {/* Legal context & tips */}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1.5 text-[11px]">
                                {item.legalRef && (
                                  <span className="text-indigo-600 font-semibold flex items-center gap-1">
                                    <Scale className="w-3 h-3 text-indigo-500" />
                                    {item.legalRef}
                                  </span>
                                )}
                                {item.officialTip && (
                                  <span className="text-slate-500 italic flex items-center gap-1">
                                    <Info className="w-3 h-3 text-blue-500" />
                                    Tip: {item.officialTip}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dossier & Work Details Tab */}
      {activeTab === 'dossier' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">KECOBO Work Registration Dossier</h2>
            <p className="text-xs text-slate-500">
              Customize the specific creative work details to be printed in your formal compliance audit report and submitted to the National Rights Registry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title of Creative Work</label>
              <input
                type="text"
                value={dossier.title}
                onChange={e => setDossier({ ...dossier, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. The Nairobi Hustle (Season 1)"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Work Classification</label>
              <select
                value={dossier.workType}
                onChange={e => setDossier({ ...dossier, workType: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="AUDIOVISUAL">Audiovisual (YouTube Series, Film, Vlog, Reel)</option>
                <option value="MUSICAL">Musical Work (Composition & Lyrics)</option>
                <option value="SOUND_RECORDING">Sound Recording (Master Audio & Beats)</option>
                <option value="LITERARY">Literary (E-Book, Script, Blog, Training Manual)</option>
                <option value="ARTISTIC">Artistic (Digital Art, Graphic Design, Photography)</option>
                <option value="SOFTWARE">Computer Software & App Code</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Creator / Author Legal Name</label>
              <input
                type="text"
                value={dossier.creatorName}
                onChange={e => setDossier({ ...dossier, creatorName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">National ID / Passport</label>
              <input
                type="text"
                value={dossier.nationalId}
                onChange={e => setDossier({ ...dossier, nationalId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">KRA PIN</label>
              <input
                type="text"
                value={dossier.kraPin}
                onChange={e => setDossier({ ...dossier, kraPin: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Creation & Production Year</label>
              <input
                type="number"
                value={dossier.yearCreated}
                onChange={e => setDossier({ ...dossier, yearCreated: parseInt(e.target.value) || 2026 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Co-Creators, Collaborators & Ownership Splits</label>
              <input
                type="text"
                value={dossier.coCreators}
                onChange={e => setDossier({ ...dossier, coCreators: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Sole Creator (100%) or Co-Director (50% share)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Work Description & Fixation Summary</label>
              <textarea
                rows={3}
                value={dossier.description}
                onChange={e => setDossier({ ...dossier, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">eCitizen Invoice Reference</label>
              <input
                type="text"
                value={dossier.ecitizenInvoiceRef}
                onChange={e => setDossier({ ...dossier, ecitizenInvoiceRef: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="ECIT-KECOBO-XXXXX"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">M-PESA Paybill Code</label>
              <input
                type="text"
                value={dossier.mpesaCode}
                onChange={e => setDossier({ ...dossier, mpesaCode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. SLK79X21PQ"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('checklist')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
            >
              Save & Return to Checklist
            </button>
          </div>
        </div>
      )}

      {/* Kenyan IP Guide & Legal FAQ Tab */}
      {activeTab === 'guide' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Kenyan Creator Intellectual Property Guide & KECOBO Fee Schedule</h2>
            <p className="text-xs text-slate-500">
              Statutory pricing breakdown (what is free vs paid), legal provisions under the Kenya Copyright Act Cap 130, and enforcement mechanisms.
            </p>
          </div>

          {/* Pricing & Fee Transparency Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>KECOBO Statutory Pricing Schedule: What is Free vs Paid?</span>
              </h3>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Official NRR 2026 Gazetted Rates
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Free Services Card */}
              <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>WHAT IS 100% FREE (NO STATUTORY CHARGE)</span>
                </div>
                <ul className="text-xs text-slate-700 space-y-2.5">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <div>
                      <strong>Automatic Copyright Vesting upon Fixation:</strong> Under Section 22(1) of the Kenya Copyright Act, copyright exists automatically the moment your work is recorded/fixed in tangible form. You pay nothing to own copyright.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <div>
                      <strong>NRR Portal Account Creation & eCitizen Sign-up:</strong> Creating an account on the National Rights Registry (nrr.copyright.go.ke) and linking your Kenyan National ID or Alien Card is completely free of charge.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <div>
                      <strong>Filing Piracy / Criminal Infringement Complaints:</strong> Lodging a formal infringement complaint or reporting piracy to the KECOBO Enforcement & Anti-Piracy Unit is completely free.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <div>
                      <strong>Digital Takedown Notices (Section 35B):</strong> Serving statutory notice of infringement on internet service providers (ISPs) or online hosting platforms carries zero government fees.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <div>
                      <strong>Public Education, Clinics & Creator Sensitization:</strong> Attending official KECOBO creator webinars, training workshops, and legal guidance forums is free to the public.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Paid Services Card */}
              <div className="bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-indigo-950 font-extrabold text-sm">
                  <Scale className="w-5 h-5 text-indigo-600" />
                  <span>WHAT IS PAID (STATUTORY GOVERNMENT FEES)</span>
                </div>
                <ul className="text-xs text-slate-700 space-y-2.5">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold font-mono">1.</span>
                    <div>
                      <strong>Official Copyright Registration Certificate:</strong> <span className="font-bold text-indigo-900">KES 1,000 per creative work</span>. Applies to Audiovisual (YouTube vlog, series, film), Musical work, Sound Recording, Literary work (script, book), Artistic design, or Software. Paid exclusively via eCitizen Paybill <strong>222222</strong>.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold font-mono">2.</span>
                    <div>
                      <strong>Commissioner for Oaths Affidavit (Witnessing):</strong> Approximately <span className="font-bold text-indigo-900">KES 500 – KES 1,500</span> (standard private legal fee paid to an independent advocate/commissioner if swearing formal ownership affidavits).
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold font-mono">3.</span>
                    <div>
                      <strong>Certified Copy of Register / Document:</strong> <span className="font-bold text-indigo-900">KES 500</span> for individual natural persons, and <span className="font-bold text-indigo-900">KES 1,000</span> for registered corporate entities.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold font-mono">4.</span>
                    <div>
                      <strong>Official Register Search / Verification:</strong> Standard search fee of <span className="font-bold text-indigo-900">KES 500</span> to verify title ownership and prior filings in the KECOBO NRR database.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold font-mono">5.</span>
                    <div>
                      <strong>Correction or Amendment of Register:</strong> Statutory modification fee of <span className="font-bold text-indigo-900">KES 500</span> to amend creator title, ownership transfer deed, or collaborator shares.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm pt-2">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-bold">
                  <Scale className="w-4 h-4" />
                  <span>Why Register if Creation is Automatically Free?</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  While copyright legally exists without registration, paying the KES 1,000 statutory registration fee provides an official Certificate of Copyright Registration. In Kenyan courts and arbitrations, this serves as <strong>prima facie evidence of legal ownership</strong> (shifting the burden of proof onto the infringer), fast-tracks YouTube/Meta digital rights manager access, and is mandatory to receive collective royalty distributions from CMOs (MCSK, KAMP, PRISK).
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-bold">
                  <Building2 className="w-4 h-4" />
                  <span>Payment Gateway & Reconciliation</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All KECOBO statutory payments are strictly cashless via the Government eCitizen platform. Paybill: <strong>222222</strong>. Never pay cash to any individual agent or officer.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Anti-Piracy Remedies & Statutory Penalties</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Under Section 38 of the Kenya Copyright Act, unauthorized commercial broadcasting or re-uploading carries criminal penalties of up to <strong>KES 800,000 fine</strong>, imprisonment up to <strong>10 years</strong>, or civil statutory damages.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-bold">
                  <Smartphone className="w-4 h-4" />
                  <span>KECOBO Physical & Support Contacts</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Headquarters:</strong> NHIF Building, 5th Floor, Ragati Road, Upper Hill, Nairobi.<br />
                  <strong>Official Portal:</strong> nrr.copyright.go.ke<br />
                  <strong>Email:</strong> info@copyright.go.ke / nrr@copyright.go.ke
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden / Exportable Printable Element for PDF Generation */}
      <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-700">Official Report Preview (What Gets Exported to PDF)</span>
          </div>
          <button
            onClick={handleDownloadComplianceReport}
            disabled={isExportingPdf}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            Export Now
          </button>
        </div>

        {/* This div is the exact DOM target captured into high-resolution PDF */}
        <div 
          ref={reportContainerRef}
          data-pdf-target
          className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 text-slate-900 font-sans"
        >
          {/* Government / KECOBO Styled Header */}
          <div className="border-b-2 border-indigo-900 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-900">
                  REPUBLIC OF KENYA • KENYA COPYRIGHT BOARD (KECOBO)
                </p>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  National Rights Registry (NRR) Compliance Audit Report
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official Statutory Intellectual Property Preparedness Certification
                </p>
              </div>
              <div className="text-right">
                <div className="inline-block bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 block">Report Ref</span>
                  <span className="text-xs font-mono font-bold text-indigo-950">
                    KECOBO-AUDIT-{dossier.yearCreated}-{(dossier.nationalId || '0000').slice(-4)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Generated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Dossier Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Work Title</span>
              <span className="font-bold text-slate-900 text-sm">{dossier.title}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Classification</span>
              <span className="font-semibold text-slate-800">{dossier.workType}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Registered Creator</span>
              <span className="font-bold text-slate-800">{dossier.creatorName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">National ID / Passport</span>
              <span className="font-mono text-slate-800">{dossier.nationalId}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">KRA PIN</span>
              <span className="font-mono text-slate-800">{dossier.kraPin}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Production Year</span>
              <span className="font-semibold text-slate-800">{dossier.yearCreated}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">eCitizen Invoice</span>
              <span className="font-mono text-slate-800">{dossier.ecitizenInvoiceRef || 'ECIT-PENDING'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">M-PESA Trans Code</span>
              <span className="font-mono text-emerald-700 font-bold">{dossier.mpesaCode || 'M-PESA RECORDED'}</span>
            </div>
          </div>

          {/* Readiness Summary Bar */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-900 block">Overall NRR Filing Readiness</span>
              <p className="text-xs text-indigo-700">
                {stats.readinessStatus} ({stats.completedItems} of {stats.totalItems} statutory checklist items completed)
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-indigo-900">{stats.overallPercentage}%</span>
              <span className="text-[10px] text-indigo-600 block">Filing Score</span>
            </div>
          </div>

          {/* Detailed Phase-by-Phase Checklist Audit Table */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1">
              Statutory Requirement Milestones & Audit Verification
            </h3>

            {phases.map(phase => (
              <div key={phase.id} className="space-y-2">
                <div className="flex items-center justify-between bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800">
                  <span>{phase.phaseName}</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {phase.items.filter(i => i.completed).length} / {phase.items.length} Cleared
                  </span>
                </div>

                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-slate-100">
                    {phase.items.map(item => (
                      <tr key={item.id} className="py-2">
                        <td className="w-8 py-2 align-top text-center">
                          {item.completed ? (
                            <span className="text-emerald-700 font-bold">✓</span>
                          ) : (
                            <span className="text-slate-300 font-bold">○</span>
                          )}
                        </td>
                        <td className="py-2 pr-4 align-top">
                          <span className={`font-semibold ${item.completed ? 'text-slate-800' : 'text-slate-500'}`}>
                            {item.title}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {item.description}
                          </span>
                        </td>
                        <td className="py-2 align-top text-right text-[10px] whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                            item.completed 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.completed ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Statutory Certification & Disclaimer Box */}
          <div className="border-t-2 border-slate-200 pt-4 space-y-2 text-[10px] text-slate-500">
            <p className="font-bold text-slate-700 uppercase">
              LEGAL DISCLAIMER & STATUTORY NOTICE:
            </p>
            <p className="leading-relaxed">
              This compliance report is compiled under the guidelines of the Kenya Copyright Act Cap 130 and the National Rights Registry regulations. It confirms that the author has fulfilled the evidentiary fixation standards necessary for statutory registration. Official copyright certificates are issued exclusively by the Kenya Copyright Board upon eCitizen fee settlement (KES 1,000) and examiner approval.
            </p>
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-[10px]">
              <span>CreatorCompliance Kenya • Verified Digital IP Audit Seal</span>
              <span className="font-mono text-slate-400">DIGITAL-NRR-VERIFIED-AUTH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cease and Desist PDF Generator Modal */}
      {isCeaseDesistModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-red-950 via-slate-900 to-red-950 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-400/30 flex items-center justify-center">
                  <Gavel className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">KECOBO Statutory Cease & Desist Notice</h3>
                  <p className="text-xs text-red-200">Official copyright assertion under Section 22, 35 & 38 of Kenya Copyright Act</p>
                </div>
              </div>
              <button
                onClick={() => setIsCeaseDesistModalOpen(false)}
                className="text-white/70 hover:text-white p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body & Customization Controls */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Infringer Details Customization Form */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Customize Infringement Notice Details
                  </h4>
                  <span className="text-[11px] text-slate-500">Updates live in the document below</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Infringing Entity / Channel / Company
                    </label>
                    <input
                      type="text"
                      value={infringerDetails.name}
                      onChange={e => setInfringerDetails({ ...infringerDetails, name: e.target.value })}
                      placeholder="e.g. Media Agency Ltd / Viral Channel"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Platform / Medium
                    </label>
                    <input
                      type="text"
                      value={infringerDetails.platform}
                      onChange={e => setInfringerDetails({ ...infringerDetails, platform: e.target.value })}
                      placeholder="e.g. TikTok, YouTube, TV Broadcast"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Infringing Link / Video URL
                    </label>
                    <input
                      type="text"
                      value={infringerDetails.urlOrChannel}
                      onChange={e => setInfringerDetails({ ...infringerDetails, urlOrChannel: e.target.value })}
                      placeholder="e.g. https://tiktok.com/@infringing/video/123"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Settlement Fee Demand
                      </label>
                      <input
                        type="text"
                        value={infringerDetails.claimedSettlementFeeKes}
                        onChange={e => setInfringerDetails({ ...infringerDetails, claimedSettlementFeeKes: e.target.value })}
                        placeholder="KES 250,000"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Deadline (Days)
                      </label>
                      <input
                        type="number"
                        min="3"
                        max="30"
                        value={infringerDetails.deadlineDays}
                        onChange={e => setInfringerDetails({ ...infringerDetails, deadlineDays: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* The Live Document Target to be converted to PDF */}
              <div
                ref={ceaseDesistContainerRef}
                data-pdf-target
                className="bg-white p-8 sm:p-10 rounded-2xl border-2 border-slate-300 shadow-sm text-slate-900 font-sans space-y-6"
              >
                {/* Official Kenyan Legal Header */}
                <div className="border-b-2 border-red-800 pb-5 text-center space-y-1">
                  <div className="text-[11px] font-black uppercase tracking-widest text-red-800">
                    REPUBLIC OF KENYA • STATUTORY COPYRIGHT ASSERTION & CEASE-AND-DESIST NOTICE
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
                    FORMAL NOTICE OF COPYRIGHT INFRINGEMENT & DEMAND TO CEASE AND DESIST
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    Issued Pursuant to Sections 22, 32, 35 & 38 of the Kenya Copyright Act (Cap 130) • Laws of Kenya
                  </p>
                  <div className="pt-2 flex justify-between items-center text-[10px] font-mono text-slate-500 border-t border-slate-200 mt-3">
                    <span>REF: KECOBO/CD-STAT/{new Date().getFullYear()}/{(dossier.nationalId || '0000').slice(-4)}-{Date.now().toString(16).slice(-4).toUpperCase()}</span>
                    <span>DATE: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Recipient & Sender Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      TO (INFRINGING PARTY / COMMERCIAL EXPLOITER):
                    </span>
                    <div className="font-bold text-slate-900 text-sm">{infringerDetails.name}</div>
                    <div className="text-slate-600">Platform: {infringerDetails.platform}</div>
                    <div className="text-slate-600 font-mono text-[11px] break-all">URL: {infringerDetails.urlOrChannel}</div>
                  </div>
                  <div className="space-y-1 sm:border-l sm:pl-4 border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      FROM (COPYRIGHT PROPRIETOR / LEGAL CREATOR):
                    </span>
                    <div className="font-bold text-slate-900 text-sm">{dossier.creatorName}</div>
                    <div className="text-slate-600">National ID / Passport: <span className="font-mono font-bold">{dossier.nationalId}</span></div>
                    <div className="text-slate-600">KRA Tax PIN: <span className="font-mono font-bold">{dossier.kraPin}</span></div>
                    <div className="text-slate-600">Territory: Republic of Kenya & Worldwide Rights</div>
                  </div>
                </div>

                {/* Protected Work Summary */}
                <div className="bg-red-50/60 p-4 rounded-xl border border-red-200 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-black text-red-900">
                      PROTECTED WORK SUBJECT TO THIS STATUTORY DEMAND:
                    </span>
                    <span className="font-mono text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
                      NRR REGISTERED / AUDITED
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Title of Protected Work:</span>
                      <span className="font-bold text-slate-900 block">{dossier.title}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Classification:</span>
                      <span className="font-bold text-slate-900 block">{dossier.workType}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Year of Fixation:</span>
                      <span className="font-bold text-slate-900 block">{dossier.yearCreated}</span>
                    </div>
                  </div>
                </div>

                {/* Formal Legal Sections */}
                <div className="space-y-4 text-xs text-slate-800 leading-relaxed">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-950 uppercase tracking-wide text-[11px]">
                      1. STATUTORY ASSERTION OF EXCLUSIVE INTELLECTUAL PROPERTY RIGHTS:
                    </h3>
                    <p>
                      PLEASE BE FORMALLY ADVISED that the above-described creative expression is the exclusive, original intellectual property of <strong>{dossier.creatorName}</strong>. Pursuant to Sections 22, 32, and 35 of the Kenya Copyright Act (Cap 130, Laws of Kenya), the copyright proprietor holds sole, unencumbered moral and economic rights to reproduce, distribute, broadcast, synchronize, and commercially license the said work.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-950 uppercase tracking-wide text-[11px]">
                      2. UNLAWFUL ACTS OF COMMERCIAL INFRINGEMENT:
                    </h3>
                    <p>
                      It has come to our verified attention that your organization, platform, or account has broadcast, reproduced, excerpted, or commercially monetized the protected work without securing prior written synchronization clearance, commercial broadcast authorization, or paying statutory licensing fees. Such unauthorized commercial use constitutes willful copyright infringement under Kenyan law.
                    </p>
                  </div>

                  <div className="space-y-1 bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <h3 className="font-bold text-amber-950 uppercase tracking-wide text-[11px]">
                      3. MANDATORY REMEDIAL DEMANDS (WITHIN {infringerDetails.deadlineDays} BUSINESS DAYS):
                    </h3>
                    <p className="text-amber-900">
                      You are hereby required and commanded to take the following remedial actions within <strong>{infringerDetails.deadlineDays} business days</strong> of receipt of this statutory notice:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-amber-950 mt-1 font-medium">
                      <li><strong>CEASE AND DESIST:</strong> Immediately halt all unauthorized broadcast, streaming, syncing, distribution, and marketing of the protected work.</li>
                      <li><strong>TAKEDOWN:</strong> Remove, delete, and permanently take down all digital videos, reels, clips, audio tracks, or articles across all digital channels, social media, and advertising ad-sets.</li>
                      <li><strong>ACCOUNTING:</strong> Render a certified financial accounting of all gross commercial proceeds, sponsorship revenues, or advertising impressions generated from the unauthorized use.</li>
                      <li><strong>COMPENSATORY SETTLEMENT:</strong> Remit standard statutory licensing settlement compensation of <strong>{infringerDetails.demandAmountKes}</strong> to the proprietor to avoid litigation damages.</li>
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-950 uppercase tracking-wide text-[11px]">
                      4. RESERVATION OF CRIMINAL PROSECUTION & CIVIL DAMAGES:
                    </h3>
                    <p>
                      Take further notice that failure to comply with this notice within the stipulated timeline will trigger immediate multi-agency legal escalations:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Lodging of an immediate criminal infringement complaint with the <strong>Kenya Copyright Board (KECOBO) Enforcement & Anti-Piracy Unit</strong> (NHIF Building, Ragati Road, Nairobi).</li>
                      <li>Under <strong>Section 38 of the Kenya Copyright Act</strong>, commercial copyright infringement carries criminal statutory fines of up to <strong>KES 800,000</strong> and/or imprisonment for terms of up to <strong>10 years</strong>.</li>
                      <li>Filing of an emergency application in the High Court of Kenya (Commercial & Admiralty Division) for interlocutory injunctions, exemplary damages, statutory royalties, and full legal costs.</li>
                      <li>Digital takedown requests served on intermediary hosting service providers under Section 35B of the Copyright Act.</li>
                    </ul>
                  </div>
                </div>

                {/* Signatures & Enclave Hash */}
                <div className="pt-4 border-t-2 border-slate-300 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">COPYRIGHT PROPRIETOR SIGNATURE:</span>
                    <div className="font-bold text-slate-950 text-sm mt-0.5">{dossier.creatorName}</div>
                    <div className="text-[10px] text-slate-500">ID: {dossier.nationalId} • KRA: {dossier.kraPin}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">DIGITAL VERIFICATION ENCLAVE:</span>
                    <div className="font-bold text-red-900 text-xs mt-0.5">VERIFIED_KECOBO_FIDO2_SECURE</div>
                    <div className="text-[10px] text-slate-400">HASH: SHA256-KE-ACT130-VALID</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCeaseDesistModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCeaseAndDesistPdf}
                  disabled={isExportingCeaseDesistPdf}
                  className="bg-red-700 hover:bg-red-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-75"
                >
                  {isExportingCeaseDesistPdf ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 text-white" />
                  )}
                  <span>{isExportingCeaseDesistPdf ? 'Exporting PDF...' : 'Download Cease & Desist Notice (PDF)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

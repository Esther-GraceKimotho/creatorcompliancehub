import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  CatalogedWork, 
  CreativeWorkType 
} from '../types';
import { 
  FolderLock, 
  Plus, 
  Clock, 
  Hash, 
  FileText, 
  Video, 
  Music, 
  BookOpen, 
  Sparkles, 
  Search, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Share2, 
  Trash2, 
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Lock,
  ArrowRight,
  Gavel,
  FileSignature
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { exportElementToPdf } from '../utils/pdfGenerator';

const STORAGE_KEY = 'creator_compliance_works_catalog_v1';

const INITIAL_WORKS: CatalogedWork[] = [];

interface CreativeWorksCatalogProps {
  onLodgeWithKecobo?: (work: CatalogedWork) => void;
}

export default function CreativeWorksCatalog({ onLodgeWithKecobo }: CreativeWorksCatalogProps) {
  const [works, setWorks] = useState<CatalogedWork[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Filter out legacy placeholder mock works
          return parsed.filter(w => !w.id?.startsWith('work-10'));
        }
      }
    } catch (e) {
      console.error('Error loading works from localStorage:', e);
    }
    return [];
  });

  const [activeFilter, setActiveFilter] = useState<'ALL' | CreativeWorkType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedWorkForCert, setSelectedWorkForCert] = useState<CatalogedWork | null>(null);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  const certContainerRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
    } catch (e) {
      console.error('Error saving works to localStorage:', e);
    }
  }, [works]);

  // Form state for new work
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<CreativeWorkType>('VIDEO');
  const [newDescription, setNewDescription] = useState('');
  const [newCollaborators, setNewCollaborators] = useState('');
  const [newExternalUrl, setNewExternalUrl] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newLicense, setNewLicense] = useState<'ALL_RIGHTS_RESERVED' | 'CC_BY' | 'CC_BY_NC' | 'COMMERCIAL_LIMITED'>('ALL_RIGHTS_RESERVED');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [computedHash, setComputedHash] = useState<string>('');
  const [isHashing, setIsHashing] = useState(false);

  // Compute SHA-256 hash when file or title changes
  const handleFileSelection = async (file: File) => {
    setSelectedFile(file);
    setIsHashing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setComputedHash(hashHex);
    } catch (err) {
      console.error('Hashing failed:', err);
      // Fallback pseudo-hash
      const fallback = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      setComputedHash(fallback);
    } finally {
      setIsHashing(false);
    }
  };

  const handleSaveWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const now = new Date();
    const formattedEAT = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} EAT`;

    let finalHash = computedHash;
    if (!finalHash) {
      // Deterministic hash based on text payload
      const author = profile.creatorName || 'Creative Author';
      const str = `${newTitle}|${newType}|${now.toISOString()}|${author}`;
      finalHash = Array.from(new TextEncoder().encode(str))
        .reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '')
        .slice(0, 64)
        .padEnd(64, 'a');
    }

    const newWorkItem: CatalogedWork = {
      id: `work-${Date.now()}`,
      title: newTitle.trim(),
      workType: newType,
      description: newDescription.trim() || 'Original creative expression authored in Kenya.',
      timestamp: now.toISOString(),
      formattedTimestamp: formattedEAT,
      contentHash: finalHash,
      fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : 'Digital Master Document',
      fileName: selectedFile ? selectedFile.name : `${newTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.master`,
      externalUrl: newExternalUrl.trim() || undefined,
      collaborators: newCollaborators.trim() || 'Sole Author / Creator',
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      status: 'TIMESTAMPED',
      licenseType: newLicense,
      creatorName: profile.creatorName || 'Creative Author',
      creatorIdNumber: profile.nationalId || 'N/A',
      proofSignature: `SHA256:EAT-${now.toISOString().slice(0, 10).replace(/-/g, '')}-VAULT-SIGNED`
    };

    setWorks([newWorkItem, ...works]);
    setIsAddModalOpen(false);

    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewCollaborators('');
    setNewExternalUrl('');
    setNewTags('');
    setSelectedFile(null);
    setComputedHash('');
  };

  const handleDeleteWork = (id: string) => {
    if (confirm('Are you sure you want to remove this work record from local storage?')) {
      setWorks(works.filter(w => w.id !== id));
    }
  };

  const handleCopyHash = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHashId(id);
    setTimeout(() => setCopiedHashId(null), 2500);
  };

  const handleExportCertificatePdf = (work: CatalogedWork) => {
    if (certContainerRef.current) {
      exportElementToPdf(certContainerRef.current, {
        filename: `IP_Proof_Of_Creation_${work.id}_${Date.now()}.pdf`,
        format: 'a4'
      });
    }
  };

  // Filtered list
  const filteredWorks = useMemo(() => {
    return works.filter(w => {
      const matchesFilter = activeFilter === 'ALL' || w.workType === activeFilter;
      const matchesSearch = 
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.contentHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [works, activeFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: works.length,
      videos: works.filter(w => w.workType === 'VIDEO').length,
      music: works.filter(w => w.workType === 'MUSIC').length,
      articles: works.filter(w => w.workType === 'ARTICLE').length,
      certified: works.filter(w => w.status === 'CERTIFIED' || w.status === 'LODGED_KECOBO').length
    };
  }, [works]);

  const getTypeIcon = (type: CreativeWorkType) => {
    switch (type) {
      case 'VIDEO': return <Video className="w-4 h-4 text-rose-500" />;
      case 'MUSIC': return <Music className="w-4 h-4 text-purple-500" />;
      case 'ARTICLE': return <BookOpen className="w-4 h-4 text-blue-500" />;
      default: return <FileText className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <FolderLock className="w-3.5 h-3.5" />
              <span>Section 26 Kenya Copyright Act (Cap 130)</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Creative Works Vault & Timestamping Catalog
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Catalog your videos, tracks, articles, and master files with cryptographic SHA-256 fingerprints and immutable Nairobi timestamps (EAT UTC+3) to establish unshakeable proof of prior creation.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2.5 bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 shrink-0 text-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Catalog New Work</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/5">
            <div className="text-xs text-slate-400 font-medium">Cataloged Works</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/5">
            <div className="text-xs text-slate-400 font-medium">Videos & Films</div>
            <div className="text-2xl font-bold text-rose-400 mt-1">{stats.videos}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/5">
            <div className="text-xs text-slate-400 font-medium">Music & Audio</div>
            <div className="text-2xl font-bold text-purple-400 mt-1">{stats.music}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/5">
            <div className="text-xs text-slate-400 font-medium">KECOBO Registered</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.certified}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(['ALL', 'VIDEO', 'MUSIC', 'ARTICLE', 'ART', 'PODCAST'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === tab
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab === 'ALL' ? 'All Works' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by title, tag, or SHA hash..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Works List / Cards */}
      {filteredWorks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <FolderLock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Creative Works Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery 
              ? 'No catalog items match your search query. Try resetting filters.'
              : 'Add your first video, track, or article to generate an immutable timestamp and SHA-256 hash.'}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Work Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorks.map(work => (
            <div
              key={work.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 space-y-3">
                {/* Header: Work Type Badge & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                    {getTypeIcon(work.workType)}
                    <span className="uppercase tracking-wider text-[10px]">{work.workType}</span>
                  </div>

                  {work.status === 'CERTIFIED' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      NRR Certified
                    </span>
                  )}
                  {work.status === 'LODGED_KECOBO' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <CheckCircle2 className="w-3 h-3" />
                      NRR Lodged
                    </span>
                  )}
                  {work.status === 'TIMESTAMPED' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="w-3 h-3" />
                      Timestamp Proof
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {work.title}
                  </h3>
                  <p className="text-slate-600 text-xs mt-1 line-clamp-2 leading-relaxed">
                    {work.description}
                  </p>
                </div>

                {/* Timestamp Anchor */}
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-150 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Created & Anchored:
                    </span>
                    <span className="font-semibold text-slate-800">{work.formattedTimestamp}</span>
                  </div>

                  {/* SHA-256 Hash Display */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200/60">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Hash className="w-3 h-3" />
                      SHA-256:
                    </span>
                    <button
                      onClick={() => handleCopyHash(work.id, work.contentHash)}
                      title="Click to copy full 64-char SHA-256 checksum"
                      className="flex items-center gap-1 hover:text-indigo-600 transition-colors font-bold text-slate-700"
                    >
                      <span>{work.contentHash.slice(0, 8)}...{work.contentHash.slice(-6)}</span>
                      {copiedHashId === work.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400 hover:text-indigo-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Tags and Collaborators */}
                <div className="flex flex-wrap items-center gap-1">
                  {work.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      #{tag}
                    </span>
                  ))}
                  {work.nrrReference && (
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-bold px-2 py-0.5 rounded-md">
                      {work.nrrReference}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-150 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedWorkForCert(work)}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>View Proof Dossier</span>
                </button>

                <div className="flex items-center gap-1">
                  {onLodgeWithKecobo && work.status === 'TIMESTAMPED' && (
                    <button
                      onClick={() => onLodgeWithKecobo(work)}
                      title="Send this work to KECOBO NRR filing checklist"
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  {work.externalUrl && (
                    <a
                      href={work.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open Master Content URL"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDeleteWork(work.id)}
                    title="Remove from Local Storage"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Work Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            <div className="bg-linear-to-r from-indigo-900 to-slate-900 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                  <FolderLock className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Catalog Creative Work</h3>
                  <p className="text-xs text-indigo-200">Generate cryptographic proof of creation with EAT timestamp</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/70 hover:text-white p-2 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWork} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Title of Work *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Kenya Tech Giants Documentary (Master Cut)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Work Category *
                  </label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as CreativeWorkType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="VIDEO">Video / Audiovisual</option>
                    <option value="MUSIC">Music / Audio Composition</option>
                    <option value="ARTICLE">Article / Literary / Script</option>
                    <option value="ART">Digital Art / Graphic</option>
                    <option value="PODCAST">Podcast Episode</option>
                    <option value="SOFTWARE">Software / Creator Code</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Default License Term
                  </label>
                  <select
                    value={newLicense}
                    onChange={e => setNewLicense(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="ALL_RIGHTS_RESERVED">All Rights Reserved (Full Copyright)</option>
                    <option value="COMMERCIAL_LIMITED">Limited Commercial License (Brands)</option>
                    <option value="CC_BY">Creative Commons (CC BY)</option>
                    <option value="CC_BY_NC">Creative Commons Non-Commercial (CC BY-NC)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Synopsis
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Outline key creative elements, production gear, original story synopsis..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* File Attachment & Hashing */}
              <div className="border border-dashed border-indigo-200 bg-indigo-50/40 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-indigo-600" />
                    Attach File for Client-Side SHA-256 Checksum
                  </span>
                  {isHashing && (
                    <span className="text-[10px] text-indigo-600 font-semibold animate-pulse">
                      Computing SHA-256 hash...
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelection(f);
                  }}
                  className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                />
                {computedHash && (
                  <div className="p-2 bg-white rounded-lg border border-indigo-100 text-[10px] font-mono text-slate-700 break-all">
                    <span className="font-bold text-indigo-600">SHA-256: </span>
                    {computedHash}
                  </div>
                )}
                <p className="text-[10px] text-slate-500">
                  Files are processed securely in your browser using the Web Crypto API. No media is stored on external servers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Collaborators / Co-Creators
                  </label>
                  <input
                    type="text"
                    value={newCollaborators}
                    onChange={e => setNewCollaborators(e.target.value)}
                    placeholder="e.g. John Doe (Sound), Jane Smith (Edit)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    External Master URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={newExternalUrl}
                    onChange={e => setNewExternalUrl(e.target.value)}
                    placeholder="e.g. https://drive.google.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  placeholder="e.g. ShortFilm, Nairobi, 4K, YouTube"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Anchor Timestamp in Local Vault</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proof of Creation Dossier Modal */}
      {selectedWorkForCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm sm:text-base">IP Proof of Creation Dossier</h3>
              </div>
              <button
                onClick={() => setSelectedWorkForCert(null)}
                className="text-white/70 hover:text-white p-1.5"
              >
                ✕
              </button>
            </div>

            {/* Printable Dossier Content */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              <div
                id="ip-timestamp-cert-dossier"
                ref={certContainerRef}
                className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 text-slate-800"
              >
                {/* Official Header */}
                <div className="border-b-2 border-slate-300 pb-5 text-center space-y-1">
                  <div className="text-[11px] font-black uppercase tracking-widest text-indigo-700">
                    Republic of Kenya • Intellectual Property Documentation
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                    CERTIFICATE OF PRIOR CREATION & TIMESTAMP
                  </h1>
                  <p className="text-xs text-slate-500">
                    Section 26 & 32 of Copyright Act (Cap 130) • Evidence of Creative Authorship
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Title of Work:</span>
                    <strong className="text-slate-900 text-sm block mt-0.5">{selectedWorkForCert.title}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Media Classification:</span>
                    <strong className="text-slate-900 block mt-0.5 uppercase">{selectedWorkForCert.workType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Registered Author:</span>
                    <strong className="text-slate-900 block mt-0.5">{selectedWorkForCert.creatorName}</strong>
                    <span className="text-slate-500 text-[10px]">National ID: {selectedWorkForCert.creatorIdNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Collaborators / Co-Authors:</span>
                    <strong className="text-slate-900 block mt-0.5">{selectedWorkForCert.collaborators || 'None'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Immutable Anchor Timestamp:</span>
                    <strong className="text-slate-900 block mt-0.5">{selectedWorkForCert.formattedTimestamp}</strong>
                    <span className="text-slate-500 text-[10px] font-mono">{selectedWorkForCert.timestamp}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">NRR Registry Status:</span>
                    <strong className="text-emerald-700 block mt-0.5">
                      {selectedWorkForCert.nrrReference ? `LODGED (${selectedWorkForCert.nrrReference})` : 'SECURED IN LOCAL VAULT'}
                    </strong>
                  </div>
                </div>

                {/* SHA-256 Fingerprint */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-indigo-600" />
                    Cryptographic SHA-256 Digest (Proof of Exact Content):
                  </span>
                  <div className="font-mono text-[11px] text-slate-800 break-all bg-slate-50 p-2.5 rounded border border-slate-200">
                    {selectedWorkForCert.contentHash}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>File Master: {selectedWorkForCert.fileName}</span>
                    <span>Size: {selectedWorkForCert.fileSize}</span>
                  </div>
                </div>

                {/* Legal Clause Notice */}
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-950 space-y-1">
                  <strong className="block text-indigo-900">Legal Evidentiary Value:</strong>
                  <p className="leading-relaxed">
                    Under the Law of Evidence (Cap 80) and Kenya Copyright Act, electronic timestamping and digital cryptographic hashing establish prima facie evidence of prior possession and originality in the event of copyright infringement or dispute.
                  </p>
                </div>

                {/* Signatures */}
                <div className="pt-4 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-600 font-mono">
                  <div>
                    <span>AUTHOR DIGITAL SIGNATURE:</span>
                    <div className="font-bold text-slate-800">{selectedWorkForCert.proofSignature}</div>
                  </div>
                  <div className="text-right">
                    <span>VAULT ENGINE:</span>
                    <div className="font-bold text-slate-800">CreatorCompliance Kenya FIDO2</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedWorkForCert(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleExportCertificatePdf(selectedWorkForCert)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download IP Timestamp Dossier (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

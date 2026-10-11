import React, { useState } from 'react';
import { IpRegistration, CatalogedWork } from '../types';
import { 
  Shield, 
  Upload, 
  FileCheck, 
  AlertCircle, 
  ScanFace, 
  Fingerprint, 
  Lock, 
  Unlock, 
  Download,
  ListChecks,
  PlusCircle,
  FolderLock,
  Send
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import SensitiveShield from './SensitiveShield';
import KecoboChecklist from './KecoboChecklist';
import CreativeWorksCatalog from './CreativeWorksCatalog';

export default function IpRegistrationModule() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'checklist' | 'register'>('catalog');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IpRegistration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const { profile } = useProfile();

  const [formData, setFormData] = useState({
    title: '',
    type: 'AUDIOVISUAL',
    creatorName: profile.creatorName || '',
    idNumber: profile.nationalId || ''
  });

  // Sync if profile updates
  useEffect(() => {
    if (profile.creatorName && !formData.creatorName) {
      setFormData(prev => ({ ...prev, creatorName: profile.creatorName }));
    }
    if (profile.nationalId && !formData.idNumber) {
      setFormData(prev => ({ ...prev, idNumber: profile.nationalId }));
    }
  }, [profile.creatorName, profile.nationalId]);

  const handleLodgeFromCatalog = (work: CatalogedWork) => {
    setFormData({
      ...formData,
      title: work.title,
      type: work.workType === 'VIDEO' ? 'AUDIOVISUAL' : work.workType === 'MUSIC' ? 'MUSICAL' : 'LITERARY'
    });
    setActiveTab('register');
  };

  const handleDownloadCertificate = (nrrRef: string, title: string) => {
    const ownerName = formData.creatorName || profile.creatorName || 'Creative Author';
    const nationalId = formData.idNumber || profile.nationalId || 'N/A';
    // Simulate official certificate download
    const blob = new Blob([
      `KENYA COPYRIGHT BOARD (KECOBO)\nNATIONAL RIGHTS REGISTRY (NRR)\nCertificate of Copyright Registration\n\nNRR Reference: ${nrrRef}\nTitle of Work: ${title}\nOwner: ${ownerName}\nNational ID: ${nationalId}\nDate: ${new Date().toISOString().slice(0, 10)}\nStatus: Officially Registered under Copyright Act 2021/2026\nDigital Signature: VERIFIED_NRR_PORTAL_SIGNATURE`
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KECOBO_Certificate_${nrrRef}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please attach a file as proof of work.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = new FormData();
      data.append('file', file);
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, String(value));
      });

      const res = await fetch('/api/ip/register', {
        method: 'POST',
        body: data
      });
      const responseData = await res.json();
      if (!res.ok || !responseData.success) {
        throw new Error(responseData.error || 'Failed to register IP');
      }
      setResult(responseData.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Module Sub-Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 md:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'catalog'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FolderLock className="w-4 h-4 text-indigo-400" />
            <span>Creative Works Catalog</span>
            <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/30 text-white">
              Vault & Timestamps
            </span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'checklist'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>Step-by-Step KECOBO Checklist</span>
            <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/30 text-white">
              Guide & Reports
            </span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'register'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit to NRR Portal</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <Shield className="w-4 h-4 text-indigo-600" />
          <span>Copyright Act Cap 130 • Republic of Kenya</span>
        </div>
      </div>

      {activeTab === 'catalog' && (
        <CreativeWorksCatalog onLodgeWithKecobo={handleLodgeFromCatalog} />
      )}

      {activeTab === 'checklist' && (
        <KecoboChecklist />
      )}

      {activeTab === 'register' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-4 md:p-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-indigo-600" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">KECOBO Copyright Portal</h2>
                <p className="text-sm text-slate-500">National Rights Registry (NRR) Direct Bridge</p>
              </div>
            </div>

            <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Title of Work</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="e.g. The Nairobi Hustle (Short Film)"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Work Type</label>
                      <select
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      >
                        <option value="AUDIOVISUAL">Audiovisual (Video)</option>
                        <option value="LITERARY">Literary (E-Book/Script)</option>
                        <option value="MUSICAL">Musical</option>
                        <option value="ARTISTIC">Artistic (Digital Art)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">National ID / Passport</label>
                      <input
                        type="text"
                        required
                        value={formData.idNumber}
                        onChange={e => setFormData({ ...formData, idNumber: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="ID Number"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Proof of Work (PDF/MP4)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-8 w-8 text-slate-400" />
                        <div className="flex text-sm text-slate-600 justify-center">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                            <span>Upload a file</span>
                            <input 
                              type="file" 
                              className="sr-only" 
                              accept=".pdf,.mp4,.zip" 
                              onChange={e => setFile(e.target.files?.[0] || null)}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-slate-500">
                          {file ? file.name : "PDF, MP4 up to 50MB"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit to NRR (KECOBO Portal)
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col justify-center min-h-[300px]">
                {result ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
                      <FileCheck className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Registration Accepted</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{result.message}</p>
                    
                    <div className="space-y-2 text-sm text-slate-600 bg-white p-4 rounded-lg border border-slate-200">
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="font-medium">NRR Reference:</span>
                        <span className="font-mono text-slate-900 font-bold">{result.nrrNumber}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="font-medium">Work Title:</span>
                        <span className="text-slate-900">{result.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Registration Fee:</span>
                        <span className="text-slate-900 font-semibold">KES 1,000</span>
                      </div>
                    </div>
                    
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm mt-4 shadow-sm">
                      Pay via M-PESA
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-slate-400">
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Upload your creative work for KECOBO copyright registration.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tracker Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Recent Applications Tracker</h3>
            </div>
            <div className="overflow-x-auto">
              {!result ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <FileCheck className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">No pending submissions</p>
                  <p className="text-[11px] text-slate-400">
                    Submit your creative work above to receive an instant National Rights Registry (NRR) tracking reference.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                    <tr>
                      <th className="px-6 py-3">Reference (NRR)</th>
                      <th className="px-6 py-3">Work Title</th>
                      <th className="px-6 py-3">Date Submitted</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/50 bg-blue-50/20">
                      <td className="px-6 py-4 font-mono font-medium text-slate-900">{result.nrrNumber}</td>
                      <td className="px-6 py-4 font-medium">{result.title}</td>
                      <td className="px-6 py-4 text-slate-500">Today</td>
                      <td className="px-6 py-4">
                        <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase">Pending Pay</span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 font-semibold text-xs hover:underline">Pay KES 1000</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

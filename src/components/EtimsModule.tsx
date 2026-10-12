import React, { useState, useRef, useEffect } from 'react';
import { EtimsInvoice } from '../types';
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Download, 
  Calculator, 
  Receipt,
  CalendarDays
} from 'lucide-react';
import { exportElementToPdf } from '../utils/pdfGenerator';
import EtimsTaxEstimator from './EtimsTaxEstimator';
import TaxCalendar from './TaxCalendar';
import IncomeLogger from './IncomeLogger';
import CrossBorderTaxEstimator from './CrossBorderTaxEstimator';
import { useProfile } from '../context/ProfileContext';
import SensitiveShield from './SensitiveShield';
import { Globe2 } from 'lucide-react';

interface EtimsModuleProps {
  initialTab?: 'income' | 'estimator' | 'calendar' | 'invoice' | 'crossborder';
}

export default function EtimsModule({ initialTab = 'income' }: EtimsModuleProps) {
  const [activeTab, setActiveTab] = useState<'income' | 'estimator' | 'calendar' | 'invoice' | 'crossborder'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<EtimsInvoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const { profile } = useProfile();

  const [formData, setFormData] = useState({
    sellerPin: profile.kraPin || '',
    buyerPin: '',
    amount: '',
    description: '',
    type: 'SERVICES'
  });

  // Sync with profile if updated
  useEffect(() => {
    if (profile.kraPin && !formData.sellerPin) {
      setFormData(prev => ({ ...prev, sellerPin: profile.kraPin }));
    }
  }, [profile.kraPin]);

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current || !invoice) return;
    setIsDownloading(true);
    try {
      await exportElementToPdf(receiptRef.current, {
        filename: `eTIMS_Receipt_${invoice.kraControlNum}.pdf`,
        format: 'a5',
        margin: 6
      });
    } catch (err) {
      console.error('Failed to generate receipt PDF', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/etims/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate invoice');
      }
      setInvoice(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToInvoice = (suggestedAmount?: number) => {
    setActiveTab('invoice');
    if (suggestedAmount && suggestedAmount > 0) {
      setFormData(prev => ({
        ...prev,
        amount: String(Math.round(suggestedAmount)),
        description: 'Monthly Creator Content Revenue 2026'
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Switcher Header */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('income')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 min-w-[200px] ${
            activeTab === 'income'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span className="text-base">💰</span>
          <span>Income Logger</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
            activeTab === 'income' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            Feeds Tax Tool
          </span>
        </button>

        <button
          onClick={() => setActiveTab('estimator')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 min-w-[200px] ${
            activeTab === 'estimator'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>2026 Tax Estimator</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
            activeTab === 'estimator' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700'
          }`}>
            Interactive
          </span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 min-w-[200px] ${
            activeTab === 'calendar'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>KRA Tax Calendar</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
            activeTab === 'calendar' ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-900'
          }`}>
            20th VAT
          </span>
        </button>

        <button
          onClick={() => setActiveTab('invoice')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 min-w-[200px] ${
            activeTab === 'invoice'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>eTIMS Invoicing (VSCU)</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
            activeTab === 'invoice' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            KRA Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab('crossborder')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 min-w-[200px] ${
            activeTab === 'crossborder'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Globe2 className="w-4 h-4 text-sky-400" />
          <span>Cross-Border & W-8BEN</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
            activeTab === 'crossborder' ? 'bg-sky-500 text-white' : 'bg-sky-100 text-sky-800'
          }`}>
            US Royalties
          </span>
        </button>
      </div>

      {activeTab === 'crossborder' && (
        <CrossBorderTaxEstimator />
      )}

      {activeTab === 'income' && (
        <IncomeLogger 
          onNavigateToEstimator={() => setActiveTab('estimator')}
          onNavigateToInvoice={handleNavigateToInvoice}
        />
      )}

      {activeTab === 'calendar' && (
        <TaxCalendar />
      )}

      {activeTab === 'estimator' && (
        <EtimsTaxEstimator 
          onNavigateToInvoice={handleNavigateToInvoice}
          onNavigateToIncomeLogger={() => setActiveTab('income')}
        />
      )}

      {activeTab === 'invoice' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-4 md:p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">KRA eTIMS Electronic Invoice Generator</h2>
                <p className="text-sm text-slate-500">Finance Act 2026 Compliant VSCU Transmission</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('estimator')}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
            >
              <Calculator className="w-3.5 h-3.5" />
              Recalculate 2026 Taxes
            </button>
          </div>

          <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Your KRA PIN (Seller)</label>
                  <input
                    type="text"
                    required
                    value={formData.sellerPin}
                    onChange={e => setFormData({ ...formData, sellerPin: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
                    placeholder="PXXXXXXXXXA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Client KRA PIN (Optional)</label>
                  <input
                    type="text"
                    value={formData.buyerPin}
                    onChange={e => setFormData({ ...formData, buyerPin: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
                    placeholder="PXXXXXXXXXA"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount (KES)</label>
                    <input
                      type="number"
                      required
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Supply Type</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="SERVICES">Services (Content/Ads)</option>
                      <option value="GOODS">Goods (Merch)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. YouTube AdSense Revenue Jan 2026"
                  />
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
                      Sign & Transmit to KRA (eTIMS VSCU)
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col justify-center min-h-[300px]">
              {invoice ? (
                <div className="space-y-4" ref={receiptRef}>
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Valid eTIMS Invoice Generated</h3>
                  <div className="space-y-2 text-sm text-slate-600 bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="font-medium">KRA Control Num:</span>
                      <span className="font-mono text-slate-900">{invoice.kraControlNum}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="font-medium">Status:</span>
                      <span className="text-green-600 font-semibold">{invoice.status}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="font-medium">Amount:</span>
                      <span>KES {invoice.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">VAT (16%):</span>
                      <span>KES {invoice.taxAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleDownloadReceipt}
                    disabled={isDownloading}
                    className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm mt-4 disabled:opacity-70"
                  >
                    {isDownloading ? (
                       <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {isDownloading ? 'Generating PDF...' : 'Download PDF Receipt'}
                  </button>
                </div>
              ) : (
                <div className="text-center text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Fill out the form to generate and transmit a compliant eTIMS invoice.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { AiComplianceResult } from '../types';
import { Bot, CheckCircle2, AlertTriangle, XCircle, Search } from 'lucide-react';

export default function AiComplianceChecker() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiComplianceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    contentScript: '',
    hasDeepfakes: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const responseData = await res.json();
      if (!res.ok || !responseData.success) {
        throw new Error(responseData.error || 'Failed to check compliance');
      }
      setResult(responseData.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6">
      <div className="bg-slate-50 border-b border-slate-200 p-4 md:p-6 flex items-center gap-3">
        <Bot className="w-6 h-6 text-emerald-600" />
        <div>
          <h2 className="text-lg font-semibold text-slate-900">AI Content Compliance</h2>
          <p className="text-sm text-slate-500">Kenya Artificial Intelligence Bill 2026</p>
        </div>
      </div>

      <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Content Script / Description</label>
              <textarea
                required
                rows={5}
                value={formData.contentScript}
                onChange={e => setFormData({ ...formData, contentScript: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                placeholder="Paste your script or video description here to check if your AI disclosures meet the 2026 mandates..."
              />
            </div>
            
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                id="hasDeepfakes"
                checked={formData.hasDeepfakes}
                onChange={e => setFormData({ ...formData, hasDeepfakes: e.target.checked })}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="hasDeepfakes" className="text-sm text-slate-700 font-medium">
                This content contains synthetic audio/video or deepfakes
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 text-sm">
                <XCircle className="w-5 h-5 shrink-0" />
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
                  <Search className="w-4 h-4" />
                  Analyze Compliance
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col justify-center min-h-[300px]">
          {result ? (
            <div className="space-y-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                result.isCompliant ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
                {result.isCompliant ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {result.isCompliant ? 'Fully Compliant' : 'Compliance Issue Detected'}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-medium text-slate-500">Risk Level:</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    result.riskLevel === 'LOW' ? 'bg-green-100 text-green-700' :
                    result.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {result.riskLevel}
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm text-slate-700 leading-relaxed">
                <strong className="block mb-1 text-slate-900">Legal Feedback:</strong>
                {result.feedback}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Run the AI analyzer to ensure your content meets KRA and AI Bill 2026 transparency rules.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { User, X, Check, Building2, Shield, Mail } from 'lucide-react';

export default function ProfileModal() {
  const { profile, updateProfile, isEditModalOpen, setIsEditModalOpen } = useProfile();
  const [formData, setFormData] = useState({
    creatorName: profile.creatorName,
    kraPin: profile.kraPin,
    nationalId: profile.nationalId,
    email: profile.email,
    businessName: profile.businessName
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isEditModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      creatorName: formData.creatorName.trim(),
      kraPin: formData.kraPin.trim().toUpperCase(),
      nationalId: formData.nationalId.trim(),
      email: formData.email.trim(),
      businessName: formData.businessName.trim()
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsEditModalOpen(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-base">Creator Profile & Credentials</h3>
          </div>
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Enter your official legal details to automatically populate KRA eTIMS invoices, KECOBO registration forms, and tax computation reports.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Legal Full Name (as on National ID / Passport)
            </label>
            <input
              type="text"
              value={formData.creatorName}
              onChange={e => setFormData({ ...formData, creatorName: e.target.value })}
              placeholder="e.g. your legal name"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span>KRA PIN</span>
              </label>
              <input
                type="text"
                value={formData.kraPin}
                onChange={e => setFormData({ ...formData, kraPin: e.target.value.toUpperCase() })}
                placeholder="P000000000A"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm uppercase font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                <Shield className="w-3 h-3 text-slate-400" />
                <span>National ID / Passport</span>
              </label>
              <input
                type="text"
                value={formData.nationalId}
                onChange={e => setFormData({ ...formData, nationalId: e.target.value })}
                placeholder="e.g. 12345678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="creator@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Registered Business / Channel Name (Optional)
            </label>
            <input
              type="text"
              value={formData.businessName}
              onChange={e => setFormData({ ...formData, businessName: e.target.value })}
              placeholder="e.g. Media Productions"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  Saved!
                </>
              ) : (
                'Save Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

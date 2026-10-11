import React from 'react';

interface SensitiveShieldProps {
  value: string;
  maskedValue?: string;
  type?: 'kraPin' | 'idNumber' | 'currency' | 'generic';
  label?: string;
  target?: 'KRA' | 'KECOBO' | 'TAX_ESTIMATES' | 'SYSTEM';
  className?: string;
  inline?: boolean;
}

export default function SensitiveShield({
  value,
  className = '',
  inline = false
}: SensitiveShieldProps) {
  if (inline) {
    return <span className={`font-mono font-medium ${className}`}>{value}</span>;
  }

  return (
    <div className={`inline-flex items-center p-2 rounded-xl bg-slate-50 border border-slate-200 ${className}`}>
      <span className="font-mono font-bold text-sm tracking-wide text-slate-800">{value}</span>
    </div>
  );
}

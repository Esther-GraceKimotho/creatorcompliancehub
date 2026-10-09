import { HelpCircle, Book, FileText, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function KnowledgeBase() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does the Finance Act 2026 affect digital creators?",
      answer: "The Finance Act 2026 mandates that all digital content creators, including influencers and independent contractors, must register for eTIMS. Business expenses are only deductible if supported by a valid eTIMS invoice. Additionally, platforms like Meta and YouTube will withhold a 5% tax on your royalties."
    },
    {
      question: "Why does KRA reject non-eTIMS expenses during tax assessment?",
      answer: "Under Section 16 of the Income Tax Act, any business expense incurred by an entity or creator is strictly disallowed as a tax deduction unless it is backed by an electronic tax invoice generated via eTIMS. Using our 2026 Tax Estimator, you can model how much money you save by strictly collecting eTIMS receipts from your equipment and studio suppliers."
    },
    {
      question: "What is Turnover Tax (TOT) vs Graduated Individual Tax?",
      answer: "Turnover Tax (TOT) is a simplified flat 3% tax on gross sales for businesses making between KES 1M and KES 25M annually without deducting expenses. If you have significant production costs supported by eTIMS, the Graduated Individual Income Tax with Personal Relief (KES 28,800/yr) is often cheaper. The app's Tax Estimator automatically compares both regimes and recommends the lowest tax option."
    },
    {
      question: "What is eTIMS and how do I use it?",
      answer: "eTIMS (electronic Tax Invoice Management System) is KRA's platform for real-time invoice validation. You must generate an eTIMS invoice for any service you provide (e.g., brand deals). Use the 'Tax & eTIMS' tab in this app to generate and transmit these automatically using your KRA PIN."
    },
    {
      question: "What is KECOBO and why should I register my IP?",
      answer: "The Kenya Copyright Board (KECOBO) manages the National Rights Registry (NRR). Registering your videos, scripts, or music provides legal proof of ownership, which is crucial for fighting copyright strikes, claiming royalties, and preventing unauthorized use by AI training bots."
    },
    {
      question: "How do I handle AI Content Compliance?",
      answer: "The AI Bill 2026 requires creators to explicitly disclose if their content uses synthetic media or deepfakes. Our AI Compliance module scans your video descriptions and scripts to ensure you have the correct watermarks and disclosures to avoid high-risk penalties."
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Book className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Creator Knowledge Base</h2>
        <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
          Understand your legal obligations under the Kenyan Finance Act 2026, AI Bill, and intellectual property rights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step-by-Step Guides */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800">Step-by-Step Guides</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Filing eTIMS for a Brand Deal</h4>
              <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside marker:text-blue-500 marker:font-bold">
                <li>Navigate to the <strong>Tax & eTIMS</strong> module.</li>
                <li>Enter the brand's KRA PIN (Buyer PIN).</li>
                <li>Select "SERVICES" and enter the gross amount.</li>
                <li>Click "Transmit to KRA" to generate the control number.</li>
                <li>Download the PDF and send it to the brand.</li>
              </ol>
            </div>
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm">Registering a YouTube Video (KECOBO)</h4>
              <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside marker:text-blue-500 marker:font-bold">
                <li>Export your final video in MP4 (or use a script PDF).</li>
                <li>Go to the <strong>IP Protection</strong> module.</li>
                <li>Select "AUDIOVISUAL" and upload the file.</li>
                <li>Submit to NRR and wait for the reference number.</li>
                <li>Pay the KES 1,000 fee via the M-PESA prompt.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800">Frequently Asked Questions</h3>
          </div>
          <div className="p-4 space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-white"
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left px-5 py-4 font-semibold text-sm text-slate-800 flex justify-between items-center hover:bg-slate-50"
                >
                  {faq.question}
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Glossary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Legal Glossary</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Withholding Tax (WHT)</h4>
            <p className="text-xs text-slate-600">A 5% tax deducted at source by platforms (like Meta) before they pay you. You claim this as a credit against your final tax bill.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Tax Compliance Certificate (TCC)</h4>
            <p className="text-xs text-slate-600">A document from KRA proving your tax affairs are in order. Required by many corporate brands before they sign sponsorship deals.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Deepfake Disclosure</h4>
            <p className="text-xs text-slate-600">A legal requirement under the AI Bill 2026 to label any highly realistic AI-generated video or audio to prevent misinformation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

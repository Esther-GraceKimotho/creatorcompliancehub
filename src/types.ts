export interface EtimsInvoice {
  kraControlNum: string;
  timestamp: string;
  sellerPin: string;
  buyerPin?: string;
  amount: number;
  taxAmount: number;
  status: string;
  message: string;
}

export interface IpRegistration {
  nrrNumber: string;
  title: string;
  status: string;
  message: string;
  certificateUrl: string;
}

export interface AiComplianceResult {
  isCompliant: boolean;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  feedback: string;
}

export interface WithholdingTaxRecord {
  id: string;
  platform: string; // Meta, YouTube, etc.
  date: string;
  amountEarned: number;
  taxDeducted: number; // 5%
  status: "CREDITED" | "PENDING";
}

export interface ExpenseRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  hasEtimsInvoice: boolean;
}

export interface TaxEstimateInputs {
  monthlyAdSense: number;
  monthlyBrandDeals: number;
  monthlyDigitalProducts: number;
  monthlyServices: number;
  monthlyOtherIncome: number;
  monthlyEtimsExpenses: number;
  monthlyNonEtimsExpenses: number;
  hasWithholdingTaxApplied: boolean;
  selectedRegime: 'GRADUATED' | 'TOT';
}

export interface TaxBracketBreakdown {
  bracketName: string;
  rate: number;
  taxableInBracket: number;
  taxAmount: number;
}

export interface TaxProjectionResult {
  projectedAnnualGross: number;
  projectedMonthlyGross: number;
  totalEtimsDeductibleExpenses: number;
  totalDisallowedExpenses: number;
  taxableNetIncome: number;
  grossAnnualTax: number;
  personalRelief: number;
  withholdingTaxCredits: number;
  netAnnualIncomeTax: number;
  monthlyIncomeTax: number;
  annualSHIF: number;
  annualHousingLevy: number;
  annualNSSF: number;
  totalStatutoryAndTax: number;
  effectiveTaxRate: number;
  projectedAnnualNetTakeHome: number;
  totProjectedTax: number;
  brackets: TaxBracketBreakdown[];
  isVatMandatory: boolean;
  recommendedRegime: 'GRADUATED' | 'TOT';
  taxSavingsWithEtims: number;
  quarterlyInstallments: {
    period: string;
    dueDate: string;
    amount: number;
  }[];
}

export type KecoboRequirementType = 'MANDATORY' | 'RECOMMENDED' | 'DOCUMENT_UPLOAD';

export interface KecoboChecklistItem {
  id: string;
  phaseId: number;
  title: string;
  description: string;
  requirementType: KecoboRequirementType;
  legalRef?: string;
  officialTip?: string;
  timeEstimate?: string;
  completed: boolean;
}

export interface KecoboChecklistPhase {
  id: number;
  phaseName: string;
  phaseDescription: string;
  badge: string;
  items: KecoboChecklistItem[];
}

export interface KecoboWorkDossier {
  title: string;
  workType: 'AUDIOVISUAL' | 'MUSICAL' | 'LITERARY' | 'ARTISTIC' | 'SOFTWARE' | 'SOUND_RECORDING';
  creatorName: string;
  nationalId: string;
  kraPin: string;
  yearCreated: number;
  isPublished: boolean;
  publicationDate?: string;
  territory: string;
  coCreators: string;
  description: string;
  statutoryFeeKes: number;
  ecitizenInvoiceRef?: string;
  mpesaCode?: string;
}

export type KraTaxCategory = 
  | 'VAT' 
  | 'TURNOVER_TAX' 
  | 'WITHHOLDING' 
  | 'PAYE_STATUTORY' 
  | 'INSTALLMENT' 
  | 'ANNUAL_RETURN' 
  | 'ETIMS_RECONCILIATION';

export type FilingFrequency = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'ONGOING';

export interface KraTaxDeadline {
  id: string;
  dayOfMonth: number;
  title: string;
  category: KraTaxCategory;
  frequency: FilingFrequency;
  statutoryReference: string;
  portal: 'iTax' | 'eTIMS' | 'eCitizen' | 'NSSF/SHIF Portal';
  applicableTo: string;
  description: string;
  penaltyLateFiling: string;
  requiredForms: string[];
  isHighlight?: boolean;
  suggestedAction: string;
  guideSteps: string[];
}

export interface CreatorFilingRecord {
  id: string;
  deadlineId: string;
  year: number;
  month: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'FILED';
  filingDate?: string;
  acknowledgementNumber?: string;
  amountPaidKes?: number;
  notes?: string;
}

export type IncomeCategory = 
  | 'STREAMING_ADSENSE' 
  | 'BRAND_DEAL' 
  | 'DIGITAL_PRODUCTS' 
  | 'CREATIVE_SERVICES' 
  | 'ROYALTIES_SKIZA' 
  | 'OTHER_INCOME';

export interface CreatorIncomeLog {
  id: string;
  month: number; // 1 - 12
  year: number;  // e.g. 2026
  date: string;  // YYYY-MM-DD
  category: IncomeCategory;
  platformOrBrand: string; // e.g. "YouTube AdSense", "Safaricom PLC", "Spotify", "Equity Bank"
  description: string;
  currency: 'KES' | 'USD';
  originalAmount: number;
  exchangeRateKes?: number; // e.g. 130 KES per USD
  grossAmountKes: number;
  withholdingTaxDeductedKes: number; // e.g. 5% WHT for Kenyan corporate brand deals
  whtWithheldAtSource: boolean;
  whtCertificateNumber?: string;
  netAmountReceivedKes: number;
  etimsInvoiceRef?: string;
  paymentMethod: 'MPESA' | 'BANK_TRANSFER' | 'PAYPAL' | 'PAYONEER' | 'OTHER';
  paymentRef?: string;
  status: 'RECEIVED' | 'PENDING' | 'SCHEDULED';
  deliverables?: string;
}

export interface MonthlyIncomeSummary {
  month: number;
  year: number;
  totalGrossKes: number;
  streamingAdSenseKes: number;
  brandDealsKes: number;
  digitalProductsKes: number;
  servicesKes: number;
  royaltiesSkizaKes: number;
  otherIncomeKes: number;
  totalWhtDeductedKes: number;
  totalNetReceivedKes: number;
  entryCount: number;
}

export type CreativeWorkType = 
  | 'VIDEO' 
  | 'MUSIC' 
  | 'ARTICLE' 
  | 'ART' 
  | 'PODCAST' 
  | 'SOFTWARE';

export interface CatalogedWork {
  id: string;
  title: string;
  workType: CreativeWorkType;
  description: string;
  timestamp: string; // ISO string
  formattedTimestamp: string;
  contentHash: string; // SHA-256 fingerprint
  fileSize?: string;
  fileName?: string;
  externalUrl?: string;
  collaborators?: string;
  tags: string[];
  status: 'TIMESTAMPED' | 'LODGED_KECOBO' | 'CERTIFIED';
  nrrReference?: string;
  licenseType: 'ALL_RIGHTS_RESERVED' | 'CC_BY' | 'CC_BY_NC' | 'COMMERCIAL_LIMITED';
  creatorName: string;
  creatorIdNumber: string;
  proofSignature: string;
}

export type RedlineSeverity = 'CRITICAL' | 'WARNING' | 'FAIR';

export interface ContractRedlineClause {
  id: string;
  clauseCategory: 'IP_OWNERSHIP' | 'LIKENESS_AND_AI' | 'EXCLUSIVITY' | 'PAYMENT_TERMS' | 'INDEMNITY' | 'USAGE_WINDOW';
  severity: RedlineSeverity;
  originalText: string;
  plainExplanation: string;
  kenyanLegalContext: string;
  suggestedCounterClause: string;
}

export interface ContractRedlineReport {
  id: string;
  contractTitle: string;
  clientName: string;
  overallRiskScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  riskSummary: string;
  clauses: ContractRedlineClause[];
  perpetualBuyoutDetected: boolean;
  likenessRightsGrabbed: boolean;
  unfairIndemnityDetected: boolean;
  actionItems: string[];
  createdAt: string;
}

export interface InternationalInvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  creatorName: string;
  creatorAddress: string;
  creatorKraPin: string;
  creatorBankName: string;
  creatorAccountNumber: string;
  creatorSwiftBic: string;
  intermediaryBankRouting?: string;
  creatorEmail: string;
  clientName: string;
  clientCountry: string;
  clientEmail: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'KES';
  items: {
    description: string;
    deliverableType: string;
    amount: number;
    usageRights: string;
  }[];
  notes: string;
  paymentTerms: string;
}

export interface CrossBorderTaxReport {
  totalRoyaltiesUsd: number;
  usAudiencePercent: number;
  usSourcedIncomeUsd: number;
  restOfWorldIncomeUsd: number;
  usWithholdingRate: number; // 0.30
  usTaxWithheldUsd: number;
  netPayoutUsd: number;
  exchangeRateKes: number;
  grossAmountKes: number;
  netPayoutKes: number;
  usTaxWithheldKes: number;
  kenyaForeignTaxCreditEligibleKes: number;
  w8benStatus: 'VALID_SUBMITTED' | 'MISSING' | 'EXPIRED';
  w8benLineGuide: {
    lineNumber: string;
    fieldName: string;
    instruction: string;
    creatorValue: string;
    criticalNotes: string;
  }[];
}


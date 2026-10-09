import { TaxBracketBreakdown, TaxEstimateInputs, TaxProjectionResult } from '../types';

export function calculateProjected2026Tax(inputs: TaxEstimateInputs): TaxProjectionResult {
  const {
    monthlyAdSense,
    monthlyBrandDeals,
    monthlyDigitalProducts,
    monthlyServices,
    monthlyOtherIncome,
    monthlyEtimsExpenses,
    monthlyNonEtimsExpenses,
    hasWithholdingTaxApplied
  } = inputs;

  const projectedMonthlyGross = 
    monthlyAdSense + 
    monthlyBrandDeals + 
    monthlyDigitalProducts + 
    monthlyServices + 
    monthlyOtherIncome;

  const projectedAnnualGross = projectedMonthlyGross * 12;

  // Annual Expenses
  const totalEtimsDeductibleExpenses = monthlyEtimsExpenses * 12;
  const totalDisallowedExpenses = monthlyNonEtimsExpenses * 12;

  // Under KRA Section 16, ONLY eTIMS generated expenses can be deducted
  const taxableNetIncome = Math.max(0, projectedAnnualGross - totalEtimsDeductibleExpenses);

  // 2026 Kenyan Individual Income Tax Bands
  // Band 1: First KES 288,000 @ 10%
  // Band 2: Next KES 100,000 (288,001 - 388,000) @ 25%
  // Band 3: Next KES 5,612,000 (388,001 - 6,000,000) @ 30%
  // Band 4: Next KES 3,600,000 (6,000,001 - 9,600,000) @ 32.5%
  // Band 5: Above KES 9,600,000 @ 35%

  const brackets: TaxBracketBreakdown[] = [];
  let remainingTaxable = taxableNetIncome;
  let grossAnnualTax = 0;

  // Band 1
  const b1Cap = 288000;
  const b1Taxable = Math.min(remainingTaxable, b1Cap);
  const b1Tax = b1Taxable * 0.10;
  brackets.push({
    bracketName: 'Band 1: Up to KES 288,000 (KES 24,000/mo)',
    rate: 10,
    taxableInBracket: b1Taxable,
    taxAmount: b1Tax
  });
  grossAnnualTax += b1Tax;
  remainingTaxable = Math.max(0, remainingTaxable - b1Cap);

  // Band 2
  const b2Cap = 100000;
  const b2Taxable = Math.min(remainingTaxable, b2Cap);
  const b2Tax = b2Taxable * 0.25;
  brackets.push({
    bracketName: 'Band 2: KES 288,001 - KES 388,000',
    rate: 25,
    taxableInBracket: b2Taxable,
    taxAmount: b2Tax
  });
  grossAnnualTax += b2Tax;
  remainingTaxable = Math.max(0, remainingTaxable - b2Cap);

  // Band 3
  const b3Cap = 5612000;
  const b3Taxable = Math.min(remainingTaxable, b3Cap);
  const b3Tax = b3Taxable * 0.30;
  brackets.push({
    bracketName: 'Band 3: KES 388,001 - KES 6,000,000',
    rate: 30,
    taxableInBracket: b3Taxable,
    taxAmount: b3Tax
  });
  grossAnnualTax += b3Tax;
  remainingTaxable = Math.max(0, remainingTaxable - b3Cap);

  // Band 4
  const b4Cap = 3600000;
  const b4Taxable = Math.min(remainingTaxable, b4Cap);
  const b4Tax = b4Taxable * 0.325;
  brackets.push({
    bracketName: 'Band 4: KES 6,000,001 - KES 9,600,000',
    rate: 32.5,
    taxableInBracket: b4Taxable,
    taxAmount: b4Tax
  });
  grossAnnualTax += b4Tax;
  remainingTaxable = Math.max(0, remainingTaxable - b4Cap);

  // Band 5
  if (remainingTaxable > 0) {
    const b5Tax = remainingTaxable * 0.35;
    brackets.push({
      bracketName: 'Band 5: Above KES 9,600,000 (> KES 800k/mo)',
      rate: 35,
      taxableInBracket: remainingTaxable,
      taxAmount: b5Tax
    });
    grossAnnualTax += b5Tax;
  } else {
    brackets.push({
      bracketName: 'Band 5: Above KES 9,600,000 (> KES 800k/mo)',
      rate: 35,
      taxableInBracket: 0,
      taxAmount: 0
    });
  }

  // Personal Relief (KES 2,400/month = KES 28,800/yr)
  const personalRelief = taxableNetIncome > 0 ? Math.min(grossAnnualTax, 28800) : 0;
  const taxAfterRelief = Math.max(0, grossAnnualTax - personalRelief);

  // Withholding Tax Credits
  // 5% WHT typically deducted at source on Brand Deals & Local Media Monetization
  const brandAnnualRevenue = monthlyBrandDeals * 12;
  const withholdingTaxCredits = hasWithholdingTaxApplied ? brandAnnualRevenue * 0.05 : 0;

  // Net Annual Income Tax Payable (or refund if credits exceed tax)
  const netAnnualIncomeTax = Math.max(0, taxAfterRelief - withholdingTaxCredits);
  const monthlyIncomeTax = netAnnualIncomeTax / 12;

  // Mandatory Statutory Levies (2026 Kenya)
  // SHIF: 2.75% of Gross Income (Minimum KES 300/mo = KES 3,600/yr)
  const annualSHIF = Math.max(3600, projectedAnnualGross * 0.0275);

  // Affordable Housing Levy: 1.5% of Gross Income
  const annualHousingLevy = projectedAnnualGross * 0.015;

  // NSSF: voluntary/statutory self-employed (KES 2,160/mo = KES 25,920/yr)
  const annualNSSF = projectedAnnualGross > 0 ? 25920 : 0;

  const totalStatutoryAndTax = netAnnualIncomeTax + annualSHIF + annualHousingLevy + annualNSSF;
  const effectiveTaxRate = projectedAnnualGross > 0 ? (totalStatutoryAndTax / projectedAnnualGross) * 100 : 0;
  const projectedAnnualNetTakeHome = Math.max(
    0, 
    projectedAnnualGross - totalEtimsDeductibleExpenses - totalDisallowedExpenses - totalStatutoryAndTax
  );

  // Alternative Turnover Tax (TOT) for qualifying turnover (KES 1M - 25M) @ 3%
  const isTotEligible = projectedAnnualGross >= 1000000 && projectedAnnualGross <= 25000000;
  const totProjectedTax = isTotEligible ? projectedAnnualGross * 0.03 : 0;

  // Recommendation: If TOT is eligible and produces lower tax liability, recommend TOT
  let recommendedRegime: 'GRADUATED' | 'TOT' = 'GRADUATED';
  if (isTotEligible && totProjectedTax < netAnnualIncomeTax) {
    recommendedRegime = 'TOT';
  }

  // Calculate eTIMS Tax Savings Advantage:
  // If eTIMS expenses were NOT backed by eTIMS invoices, taxable income would be projectedAnnualGross
  // Let's compute hypothetical tax without eTIMS deductions:
  let hypotheticalTax = 0;
  let hypotheticalRem = projectedAnnualGross;
  const h1 = Math.min(hypotheticalRem, b1Cap);
  hypotheticalTax += h1 * 0.10;
  hypotheticalRem = Math.max(0, hypotheticalRem - b1Cap);
  const h2 = Math.min(hypotheticalRem, b2Cap);
  hypotheticalTax += h2 * 0.25;
  hypotheticalRem = Math.max(0, hypotheticalRem - b2Cap);
  const h3 = Math.min(hypotheticalRem, b3Cap);
  hypotheticalTax += h3 * 0.30;
  hypotheticalRem = Math.max(0, hypotheticalRem - b3Cap);
  const h4 = Math.min(hypotheticalRem, b4Cap);
  hypotheticalTax += h4 * 0.325;
  hypotheticalRem = Math.max(0, hypotheticalRem - b4Cap);
  if (hypotheticalRem > 0) {
    hypotheticalTax += hypotheticalRem * 0.35;
  }
  const taxSavingsWithEtims = Math.max(0, hypotheticalTax - grossAnnualTax);

  // Mandatory VAT Check (KES 5,000,000 threshold)
  const isVatMandatory = projectedAnnualGross >= 5000000;

  // Installment Tax Schedule (Due on 20th of 4th, 6th, 9th, and 12th months)
  const quarterlyAmount = netAnnualIncomeTax / 4;
  const quarterlyInstallments = [
    { period: '1st Installment (25%)', dueDate: '20 April 2026', amount: quarterlyAmount },
    { period: '2nd Installment (25%)', dueDate: '20 June 2026', amount: quarterlyAmount },
    { period: '3rd Installment (25%)', dueDate: '20 September 2026', amount: quarterlyAmount },
    { period: '4th Installment (25%)', dueDate: '20 December 2026', amount: quarterlyAmount }
  ];

  return {
    projectedAnnualGross,
    projectedMonthlyGross,
    totalEtimsDeductibleExpenses,
    totalDisallowedExpenses,
    taxableNetIncome,
    grossAnnualTax,
    personalRelief,
    withholdingTaxCredits,
    netAnnualIncomeTax,
    monthlyIncomeTax,
    annualSHIF,
    annualHousingLevy,
    annualNSSF,
    totalStatutoryAndTax,
    effectiveTaxRate,
    projectedAnnualNetTakeHome,
    totProjectedTax,
    brackets,
    isVatMandatory,
    recommendedRegime,
    taxSavingsWithEtims,
    quarterlyInstallments
  };
}

export type MortgageField = 'amount' | 'years' | 'rate';
export type MortgageValues = Record<MortgageField, string>;

export type MortgageCalculation = {
  amount: number;
  years: number;
  rate: number;
  payment: number;
};

export const mortgageLimits = {
  amount: { min: 10000, max: 10000000 },
  years: { min: 1, max: 35 },
  rate: { min: 0, max: 30 }
} as const;

function readNumber(value: string) {
  if (value.trim() === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function calculateMortgage(values: MortgageValues): { calculation: MortgageCalculation | null; invalidFields: MortgageField[] } {
  const amount = readNumber(values.amount);
  const years = readNumber(values.years);
  const rate = readNumber(values.rate);
  const invalidFields: MortgageField[] = [];

  if (amount === null || amount < mortgageLimits.amount.min || amount > mortgageLimits.amount.max) invalidFields.push('amount');
  if (years === null || !Number.isInteger(years) || years < mortgageLimits.years.min || years > mortgageLimits.years.max) invalidFields.push('years');
  if (rate === null || rate < mortgageLimits.rate.min || rate > mortgageLimits.rate.max) invalidFields.push('rate');
  if (invalidFields.length > 0 || amount === null || years === null || rate === null) return { calculation: null, invalidFields };

  const months = years * 12;
  const monthlyRate = rate / 1200;
  const payment = monthlyRate === 0
    ? amount / months
    : amount * monthlyRate * (1 + monthlyRate) ** months / ((1 + monthlyRate) ** months - 1);

  return { calculation: { amount, years, rate, payment }, invalidFields };
}

export function buildMortgageContextHref(href: string, calculation: MortgageCalculation) {
  const [pathAndQuery, hash] = href.split('#', 2);
  const [path, query = ''] = pathAndQuery.split('?', 2);
  const params = new URLSearchParams(query);
  params.set('amount', String(calculation.amount));
  params.set('years', String(calculation.years));
  params.set('rate', String(calculation.rate));
  return `${path}?${params.toString()}${hash ? `#${hash}` : ''}`;
}

export function readMortgageContext(search: string) {
  const params = new URLSearchParams(search);
  return calculateMortgage({
    amount: params.get('amount') ?? '',
    years: params.get('years') ?? '',
    rate: params.get('rate') ?? ''
  }).calculation;
}

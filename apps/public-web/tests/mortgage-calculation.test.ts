import { describe, expect, it } from 'vitest';
import { buildMortgageContextHref, calculateMortgage, readMortgageContext } from '../src/lib/mortgage-calculation';

describe('mortgage calculation context', () => {
  it('calculates a valid monthly payment', () => {
    const result = calculateMortgage({ amount: '650000', years: '25', rate: '7.2' });
    expect(result.invalidFields).toEqual([]);
    expect(Math.round(result.calculation?.payment ?? 0)).toBe(4677);
  });

  it('rejects empty, out-of-range and fractional-term values', () => {
    expect(calculateMortgage({ amount: '', years: '25', rate: '7.2' }).invalidFields).toEqual(['amount']);
    expect(calculateMortgage({ amount: '650000', years: '35.5', rate: '31' }).invalidFields).toEqual(['years', 'rate']);
  });

  it('round-trips a valid context through the consultation URL', () => {
    const calculation = calculateMortgage({ amount: '650000', years: '25', rate: '7.2' }).calculation!;
    const href = buildMortgageContextHref('/ru/ipoteka/konsultaciya#forma', calculation);
    expect(href).toBe('/ru/ipoteka/konsultaciya?amount=650000&years=25&rate=7.2#forma');
    expect(readMortgageContext(href.slice(href.indexOf('?'), href.indexOf('#')))).toEqual(calculation);
  });

  it('ignores invalid URL context', () => {
    expect(readMortgageContext('?amount=1&years=0&rate=99')).toBeNull();
  });
});

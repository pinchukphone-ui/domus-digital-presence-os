import { useMemo, useState } from 'react';
import { buildMortgageContextHref, calculateMortgage, mortgageLimits, type MortgageCalculation, type MortgageField, type MortgageValues } from '../lib/mortgage-calculation';

export function MortgageCalculator({ language, consultationHref, initialCalculation }: { language: 'pl' | 'ru'; consultationHref?: string; initialCalculation?: MortgageCalculation | null }) {
  const [values, setValues] = useState<MortgageValues>(() => initialCalculation
    ? { amount: String(initialCalculation.amount), years: String(initialCalculation.years), rate: String(initialCalculation.rate) }
    : { amount: '500000', years: '25', rate: '7.2' });
  const [touched, setTouched] = useState<Partial<Record<MortgageField, boolean>>>({});
  const { calculation, invalidFields } = useMemo(() => calculateMortgage(values), [values]);
  const labels = language === 'pl'
    ? { amount: 'Kwota kredytu (PLN)', years: 'Okres (lata)', rate: 'Oprocentowanie (%)', result: 'Szacowana rata miesięczna', suffix: 'PLN / mies.', note: 'Wynik orientacyjny. To nie jest oferta ani rekomendacja finansowa.', consultation: 'Omów ten wynik', errors: { amount: 'Podaj kwotę od 10 000 do 10 000 000 PLN.', years: 'Podaj pełną liczbę lat od 1 do 35.', rate: 'Podaj oprocentowanie od 0% do 30%.' } }
    : { amount: 'Сумма кредита (PLN)', years: 'Срок (лет)', rate: 'Ставка (%)', result: 'Ориентировочный платёж в месяц', suffix: 'PLN / мес.', note: 'Расчёт ориентировочный. Это не предложение и не финансовая рекомендация.', consultation: 'Обсудить этот расчёт', errors: { amount: 'Укажите сумму от 10 000 до 10 000 000 PLN.', years: 'Укажите целое число лет от 1 до 35.', rate: 'Укажите ставку от 0% до 30%.' } };
  const noteId = `mortgage-calculator-note-${language}`;
  const locale = language === 'pl' ? 'pl-PL' : 'ru-RU';

  function field(field: MortgageField, options: { min: number; max: number; step?: number }) {
    const errorId = `mortgage-calculator-${field}-error-${language}`;
    const invalid = invalidFields.includes(field);
    return <>
      <input
        aria-label={labels[field]}
        aria-describedby={touched[field] && invalid ? errorId : undefined}
        aria-invalid={touched[field] && invalid ? true : undefined}
        inputMode={field === 'rate' ? 'decimal' : 'numeric'}
        type="number"
        min={options.min}
        max={options.max}
        step={options.step}
        value={values[field]}
        onBlur={() => setTouched((current) => ({ ...current, [field]: true }))}
        onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))}
      />
      {touched[field] && invalid && <small className="calculator__error" id={errorId}>{labels.errors[field]}</small>}
    </>;
  }

  return <div className="calculator" data-testid="mortgage-calculator" aria-describedby={noteId}>
    <label>{labels.amount}{field('amount', { ...mortgageLimits.amount, step: 10000 })}</label>
    <label>{labels.years}{field('years', mortgageLimits.years)}</label>
    <label>{labels.rate}{field('rate', { ...mortgageLimits.rate, step: 0.1 })}</label>
    <output aria-live="polite"><span>{labels.result}</span><strong>{calculation ? Math.round(calculation.payment).toLocaleString(locale) : '—'} {calculation && <small>{labels.suffix}</small>}</strong></output>
    <small id={noteId}>{labels.note}</small>
    {consultationHref && (calculation
      ? <a className="calculator__cta" href={buildMortgageContextHref(consultationHref, calculation)}>{labels.consultation}<span aria-hidden="true">→</span></a>
      : <span className="calculator__cta calculator__cta--disabled" aria-disabled="true">{labels.consultation}<span aria-hidden="true">→</span></span>)}
  </div>;
}

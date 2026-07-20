import { useMemo, useState } from 'react';

export function MortgageCalculator({ language, consultationHref }: { language: 'pl' | 'ru'; consultationHref?: string }) {
  const [amount, setAmount] = useState(500000);
  const [years, setYears] = useState(25);
  const [rate, setRate] = useState(7.2);
  const payment = useMemo(() => {
    const safeAmount = Math.max(0, amount);
    const months = Math.max(1, years * 12);
    const monthly = Math.max(0, rate) / 1200;
    return monthly === 0 ? safeAmount / months : safeAmount * monthly * (1 + monthly) ** months / ((1 + monthly) ** months - 1);
  }, [amount, years, rate]);
  const labels = language === 'pl'
    ? { amount: 'Kwota kredytu (PLN)', years: 'Okres (lata)', rate: 'Oprocentowanie (%)', result: 'Szacowana rata miesięczna', suffix: 'PLN / mies.', note: 'Wynik orientacyjny. To nie jest oferta ani rekomendacja finansowa.', consultation: 'Omów ten wynik' }
    : { amount: 'Сумма кредита (PLN)', years: 'Срок (лет)', rate: 'Ставка (%)', result: 'Ориентировочный платёж в месяц', suffix: 'PLN / мес.', note: 'Расчёт ориентировочный. Это не предложение и не финансовая рекомендация.', consultation: 'Обсудить этот расчёт' };
  const noteId = `mortgage-calculator-note-${language}`;
  return <div className="calculator" data-testid="mortgage-calculator" aria-describedby={noteId}>
    <label>{labels.amount}<input aria-label={labels.amount} inputMode="numeric" type="number" min="10000" step="10000" value={amount} onChange={(event) => setAmount(Number(event.target.value))} /></label>
    <label>{labels.years}<input aria-label={labels.years} inputMode="numeric" type="number" min="1" max="35" value={years} onChange={(event) => setYears(Number(event.target.value))} /></label>
    <label>{labels.rate}<input aria-label={labels.rate} inputMode="decimal" type="number" min="0" max="30" step="0.1" value={rate} onChange={(event) => setRate(Number(event.target.value))} /></label>
    <output aria-live="polite"><span>{labels.result}</span><strong>{Math.round(payment).toLocaleString(language === 'pl' ? 'pl-PL' : 'ru-RU')} <small>{labels.suffix}</small></strong></output>
    <small id={noteId}>{labels.note}</small>
    {consultationHref && <a className="calculator__cta" href={consultationHref}>{labels.consultation}<span aria-hidden="true">→</span></a>}
  </div>;
}

import { useMemo, useState } from 'react';

export function MortgageCalculator({ language }: { language: 'pl' | 'ru' }) {
  const [amount, setAmount] = useState(500000);
  const [years, setYears] = useState(25);
  const [rate, setRate] = useState(7.2);
  const payment = useMemo(() => {
    const months = years * 12;
    const monthly = rate / 1200;
    return monthly === 0 ? amount / months : amount * monthly * (1 + monthly) ** months / ((1 + monthly) ** months - 1);
  }, [amount, years, rate]);
  const labels = language === 'pl'
    ? { amount: 'Kwota kredytu (PLN)', years: 'Okres (lata)', rate: 'Oprocentowanie (%)', result: 'Szacowana rata', note: 'Wynik orientacyjny. To nie jest oferta ani rekomendacja finansowa.' }
    : { amount: 'Сумма кредита (PLN)', years: 'Срок (лет)', rate: 'Ставка (%)', result: 'Ориентировочный платёж', note: 'Расчёт ориентировочный. Это не предложение и не финансовая рекомендация.' };
  return <div className="calculator" data-testid="mortgage-calculator">
    <label>{labels.amount}<input aria-label={labels.amount} type="number" min="10000" step="10000" value={amount} onChange={(event) => setAmount(Number(event.target.value))} /></label>
    <label>{labels.years}<input aria-label={labels.years} type="number" min="1" max="35" value={years} onChange={(event) => setYears(Number(event.target.value))} /></label>
    <label>{labels.rate}<input aria-label={labels.rate} type="number" min="0" max="30" step="0.1" value={rate} onChange={(event) => setRate(Number(event.target.value))} /></label>
    <output><span>{labels.result}</span><strong>{Math.round(payment).toLocaleString(language === 'pl' ? 'pl-PL' : 'ru-RU')} PLN</strong></output>
    <small>{labels.note}</small>
  </div>;
}


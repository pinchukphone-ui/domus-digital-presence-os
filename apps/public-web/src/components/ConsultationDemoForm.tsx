import { useEffect, useState, type SyntheticEvent } from 'react';
import { readMortgageContext, type MortgageCalculation } from '../lib/mortgage-calculation';

export function ConsultationDemoForm({ language }: { language: 'pl' | 'ru' }) {
  const [submitted, setSubmitted] = useState(false);
  const [mortgageContext, setMortgageContext] = useState<MortgageCalculation | null>(null);
  const isPolish = language === 'pl';
  const copy = isPolish
    ? {
        email: 'E-mail',
        placeholder: 'twoj@email.pl',
        privacy: 'Dane pozostają wyłącznie w tej karcie i nie są wysyłane.',
        submit: 'Sprawdź formularz',
        success: 'Formularz działa. Dane nie zostały wysłane.',
        context: 'Twój orientacyjny wynik',
        contextPayment: 'Szacowana rata'
      }
    : {
        email: 'Эл. почта',
        placeholder: 'name@example.com',
        privacy: 'Данные остаются только в этой вкладке и никуда не отправляются.',
        submit: 'Проверить форму',
        success: 'Форма работает. Данные не были отправлены.',
        context: 'Ваш ориентировочный расчёт',
        contextPayment: 'Ориентировочный платёж'
      };
  const privacyId = `consultation-demo-privacy-${language}`;
  const locale = isPolish ? 'pl-PL' : 'ru-RU';

  useEffect(() => setMortgageContext(readMortgageContext(window.location.search)), []);

  function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return <form className="demo-form" data-testid="consultation-demo-form" onSubmit={submit}>
    {mortgageContext && <div className="demo-form__context" data-testid="mortgage-context">
      <strong>{copy.context}</strong>
      <span>{mortgageContext.amount.toLocaleString(locale)} PLN · {mortgageContext.years} {isPolish ? 'lat' : 'лет'} · {mortgageContext.rate.toLocaleString(locale)}%</span>
      <span>{copy.contextPayment}: <b>{Math.round(mortgageContext.payment).toLocaleString(locale)} {isPolish ? 'PLN / mies.' : 'PLN / мес.'}</b></span>
    </div>}
    <label htmlFor={`consultation-email-${language}`}>
      {copy.email}
      <input
        id={`consultation-email-${language}`}
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        aria-describedby={privacyId}
        placeholder={copy.placeholder}
        onChange={() => setSubmitted(false)}
      />
    </label>
    <button type="submit">{copy.submit}</button>
    <small className="demo-form__privacy" id={privacyId}>{copy.privacy}</small>
    {submitted && <p className="demo-form__status" role="status">{copy.success}</p>}
  </form>;
}

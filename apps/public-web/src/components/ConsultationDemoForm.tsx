import { useState, type SyntheticEvent } from 'react';

export function ConsultationDemoForm({ language }: { language: 'pl' | 'ru' }) {
  const [submitted, setSubmitted] = useState(false);
  const isPolish = language === 'pl';
  const copy = isPolish
    ? {
        email: 'E-mail',
        placeholder: 'twoj@email.pl',
        privacy: 'Dane pozostają wyłącznie w tej karcie i nie są wysyłane.',
        submit: 'Sprawdź formularz',
        success: 'Formularz działa. Dane nie zostały wysłane.'
      }
    : {
        email: 'Эл. почта',
        placeholder: 'name@example.com',
        privacy: 'Данные остаются только в этой вкладке и никуда не отправляются.',
        submit: 'Проверить форму',
        success: 'Форма работает. Данные не были отправлены.'
      };
  const privacyId = `consultation-demo-privacy-${language}`;

  function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return <form className="demo-form" data-testid="consultation-demo-form" onSubmit={submit}>
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

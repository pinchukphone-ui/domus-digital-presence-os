import type { Hub, Language, LanguageVersionSnapshot, Page } from '@domus/content-model';

export type MortgageHubFixtureVersion = {
  page_id: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  snapshot: LanguageVersionSnapshot;
};

const group = {
  home: '11111111-1111-4111-8111-111111111111',
  process: '22222222-2222-4222-8222-222222222222',
  capacity: '33333333-3333-4333-8333-333333333333',
  service: '44444444-4444-4444-8444-444444444444'
};

const homeByLanguage: Record<Language, string> = { pl: '/pl/kredyty-hipoteczne', ru: '/ru/ipoteka' };

function page(input: Omit<Page, 'hubId' | 'breadcrumbs'> & { homeLabel: string }): Page {
  const home = homeByLanguage[input.language];
  return {
    ...input,
    hubId: 'mortgage-hub',
    breadcrumbs: input.pageType === 'hub'
      ? [{ label: input.homeLabel, href: home }]
      : [{ label: input.homeLabel, href: home }, { label: input.title, href: input.canonicalPath }]
  };
}

export const mortgageHubFixture: Hub = {
  id: 'mortgage-hub', key: 'mortgage', name: 'DOMUS Mortgage Hub', pages: [
    page({ id: 'home-pl', translationGroup: group.home, language: 'pl', slug: 'kredyty-hipoteczne', status: 'published', pageType: 'hub', homeLabel: 'Kredyty hipoteczne', title: 'Kredyt hipoteczny w Polsce — przewodnik DOMUS', metaDescription: 'Praktyczny przewodnik po kredycie hipotecznym w Polsce: zdolność kredytowa, proces, dokumenty oraz wsparcie eksperta DOMUS.', canonicalPath: '/pl/kredyty-hipoteczne', blocks: [
      { id: 'hero-pl', kind: 'hero', sort: 1, heading: 'Kredyt hipoteczny bez chaosu', body: 'Uporządkuj finansowanie zakupu nieruchomości w Polsce — od pierwszej kalkulacji do decyzji banku.', data: {} },
      { id: 'intro-pl', kind: 'rich_text', sort: 2, heading: 'Zacznij od realnego budżetu', body: 'Ten hub wyjaśnia kolejne kroki i pomaga przygotować się do rozmowy z bankiem. Materiał ma charakter informacyjny i nie stanowi porady finansowej.', data: {} },
      { id: 'calc-pl', kind: 'calculator', sort: 3, heading: 'Orientacyjna rata', body: 'Obliczenie demonstracyjne, bez zapisu danych i bez oferty bankowej.', data: {} }
    ], links: [
      { label: 'Jak wygląda proces kredytowy', href: '/pl/kredyty-hipoteczne/proces', relation: 'child' },
      { label: 'Jak ocenić zdolność kredytową', href: '/pl/kredyty-hipoteczne/zdolnosc', relation: 'child' },
      { label: 'Wsparcie eksperta hipotecznego', href: '/pl/kredyty-hipoteczne/konsultacja', relation: 'service' }
    ], cta: { id: 'cta-pl', label: 'Umów konsultację', href: '/pl/kredyty-hipoteczne/konsultacja#formularz', style: 'primary' } }),
    page({ id: 'home-ru', translationGroup: group.home, language: 'ru', slug: 'ipoteka', status: 'published', pageType: 'hub', homeLabel: 'Ипотека', title: 'Ипотека в Польше — практический гид DOMUS', metaDescription: 'Практический гид по ипотеке в Польше: оценка бюджета, кредитоспособность, документы и сопровождение специалиста DOMUS.', canonicalPath: '/ru/ipoteka', blocks: [
      { id: 'hero-ru', kind: 'hero', sort: 1, heading: 'Ипотека без хаоса', body: 'Разберитесь с финансированием покупки недвижимости в Польше — от первого расчёта до решения банка.', data: {} },
      { id: 'intro-ru', kind: 'rich_text', sort: 2, heading: 'Начните с реалистичного бюджета', body: 'Этот хаб объясняет этапы и помогает подготовиться к разговору с банком. Материал носит информационный характер и не является финансовой консультацией.', data: {} },
      { id: 'calc-ru', kind: 'calculator', sort: 3, heading: 'Ориентировочный платёж', body: 'Демонстрационный расчёт без сохранения данных и без банковского предложения.', data: {} }
    ], links: [
      { label: 'Как проходит ипотечный процесс', href: '/ru/ipoteka/process', relation: 'child' },
      { label: 'Как оценить кредитоспособность', href: '/ru/ipoteka/kreditosposobnost', relation: 'child' },
      { label: 'Сопровождение ипотечного специалиста', href: '/ru/ipoteka/konsultaciya', relation: 'service' }
    ], cta: { id: 'cta-ru', label: 'Записаться на консультацию', href: '/ru/ipoteka/konsultaciya#forma', style: 'primary' } }),
    page({ id: 'process-pl', translationGroup: group.process, language: 'pl', slug: 'kredyty-hipoteczne/proces', status: 'published', pageType: 'article', homeLabel: 'Kredyty hipoteczne', title: 'Proces kredytu hipotecznego krok po kroku', metaDescription: 'Poznaj etapy procesu kredytu hipotecznego w Polsce: analiza budżetu, dokumenty, wniosek, decyzja banku i uruchomienie finansowania.', canonicalPath: '/pl/kredyty-hipoteczne/proces', blocks: [{ id: 'process-body-pl', kind: 'rich_text', sort: 1, heading: 'Od budżetu do uruchomienia kredytu', body: 'Proces obejmuje analizę możliwości, wybór nieruchomości i banków, komplet dokumentów, wniosek, decyzję i spełnienie warunków wypłaty.', data: {} }], links: [{ label: 'Sprawdź zdolność kredytową', href: '/pl/kredyty-hipoteczne/zdolnosc', relation: 'related' }], cta: null }),
    page({ id: 'process-ru', translationGroup: group.process, language: 'ru', slug: 'ipoteka/process', status: 'published', pageType: 'article', homeLabel: 'Ипотека', title: 'Ипотечный процесс в Польше по шагам', metaDescription: 'Разберите этапы ипотеки в Польше: бюджет, документы, подача заявки, решение банка, выполнение условий и выдача финансирования.', canonicalPath: '/ru/ipoteka/process', blocks: [{ id: 'process-body-ru', kind: 'rich_text', sort: 1, heading: 'От бюджета до выдачи кредита', body: 'Процесс включает оценку возможностей, выбор объекта и банков, сбор документов, подачу заявки, решение и выполнение условий выдачи.', data: {} }], links: [{ label: 'Оценить кредитоспособность', href: '/ru/ipoteka/kreditosposobnost', relation: 'related' }], cta: null }),
    page({ id: 'capacity-pl', translationGroup: group.capacity, language: 'pl', slug: 'kredyty-hipoteczne/zdolnosc', status: 'published', pageType: 'article', homeLabel: 'Kredyty hipoteczne', title: 'Zdolność kredytowa — co wpływa na ocenę banku', metaDescription: 'Dowiedz się, co wpływa na zdolność kredytową w Polsce: dochody, zobowiązania, wkład własny, okres kredytowania i stabilność zatrudnienia.', canonicalPath: '/pl/kredyty-hipoteczne/zdolnosc', blocks: [{ id: 'capacity-body-pl', kind: 'rich_text', sort: 1, heading: 'Bank analizuje więcej niż dochód', body: 'Znaczenie mają dochody, koszty gospodarstwa, obecne zobowiązania, wkład własny, forma zatrudnienia i parametry kredytu.', data: {} }], links: [{ label: 'Zobacz proces kredytowy', href: '/pl/kredyty-hipoteczne/proces', relation: 'related' }], cta: null }),
    page({ id: 'capacity-ru', translationGroup: group.capacity, language: 'ru', slug: 'ipoteka/kreditosposobnost', status: 'published', pageType: 'article', homeLabel: 'Ипотека', title: 'Кредитоспособность — что оценивает банк', metaDescription: 'Узнайте, что влияет на кредитоспособность в Польше: доходы, обязательства, первый взнос, срок кредита и стабильность занятости.', canonicalPath: '/ru/ipoteka/kreditosposobnost', blocks: [{ id: 'capacity-body-ru', kind: 'rich_text', sort: 1, heading: 'Банк оценивает не только доход', body: 'Важны доходы, расходы домохозяйства, действующие обязательства, первый взнос, форма занятости и параметры кредита.', data: {} }], links: [{ label: 'Посмотреть ипотечный процесс', href: '/ru/ipoteka/process', relation: 'related' }], cta: null }),
    page({ id: 'service-pl', translationGroup: group.service, language: 'pl', slug: 'kredyty-hipoteczne/konsultacja', status: 'published', pageType: 'service', homeLabel: 'Kredyty hipoteczne', title: 'Konsultacja hipoteczna DOMUS', metaDescription: 'Umów konsultację hipoteczną DOMUS i uporządkuj budżet, dokumenty oraz kolejne kroki finansowania nieruchomości w Polsce.', canonicalPath: '/pl/kredyty-hipoteczne/konsultacja', blocks: [{ id: 'service-body-pl', kind: 'service', sort: 1, heading: 'Rozmowa o Twojej sytuacji', body: 'Formularz demonstracyjny nie wysyła danych. Produkcyjna integracja wymaga osobnego zadania, zgód i polityki prywatności.', data: { formId: 'formularz' } }], links: [{ label: 'Wróć do przewodnika', href: '/pl/kredyty-hipoteczne', relation: 'related' }], cta: null }),
    page({ id: 'service-ru', translationGroup: group.service, language: 'ru', slug: 'ipoteka/konsultaciya', status: 'published', pageType: 'service', homeLabel: 'Ипотека', title: 'Ипотечная консультация DOMUS', metaDescription: 'Запишитесь на ипотечную консультацию DOMUS, чтобы структурировать бюджет, документы и следующие шаги покупки жилья в Польше.', canonicalPath: '/ru/ipoteka/konsultaciya', blocks: [{ id: 'service-body-ru', kind: 'service', sort: 1, heading: 'Разговор о вашей ситуации', body: 'Демонстрационная форма не отправляет данные. Рабочая интеграция требует отдельной задачи, согласий и политики конфиденциальности.', data: { formId: 'forma' } }], links: [{ label: 'Вернуться к гиду', href: '/ru/ipoteka', relation: 'related' }], cta: null })
  ]
};

function snapshot(page: Page, body: string, status: 'draft' | 'published'): LanguageVersionSnapshot {
  return {
    schema_version: 1,
    page: {
      id: page.id,
      hub_id: page.hubId,
      translation_group: page.translationGroup,
      language: page.language,
      slug: page.slug,
      canonical_path: page.canonicalPath,
      page_type: page.pageType,
      status,
      title: page.title,
      meta_description: page.metaDescription
    },
    blocks: page.blocks.map((block) => block.id === 'service-body-ru' ? { ...block, body } : block)
  };
}

const serviceRu = mortgageHubFixture.pages.find((page) => page.id === 'service-ru');
if (!serviceRu) throw new Error('service-ru fixture is required');

const publishedBody = serviceRu.blocks[0]?.body;
if (!publishedBody) throw new Error('service-ru published body is required');

export const mortgageHubFixtureVersions: MortgageHubFixtureVersion[] = [
  { page_id: serviceRu.id, version: 3, status: 'published', snapshot: snapshot(serviceRu, publishedBody, 'draft') },
  {
    page_id: serviceRu.id,
    version: 4,
    status: 'draft',
    snapshot: snapshot(
      serviceRu,
      'Черновик версии 4: демонстрационная форма не отправляет данные. Перед публикацией требуется отдельная проверка текста, согласий и политики конфиденциальности.',
      'published'
    )
  }
];

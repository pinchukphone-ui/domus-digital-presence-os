BEGIN;

INSERT INTO hubs (id, key, name, status) VALUES ('mortgage-hub', 'mortgage', 'DOMUS Mortgage Hub', 'published');

INSERT INTO pages (id, hub_id, translation_group, language, slug, canonical_path, page_type, status, title, meta_description) VALUES
('home-pl', 'mortgage-hub', '11111111-1111-4111-8111-111111111111', 'pl', 'kredyty-hipoteczne', '/pl/kredyty-hipoteczne', 'hub', 'published', 'Kredyt hipoteczny w Polsce — przewodnik DOMUS', 'Praktyczny przewodnik po kredycie hipotecznym w Polsce: zdolność kredytowa, proces, dokumenty oraz wsparcie eksperta DOMUS.'),
('home-ru', 'mortgage-hub', '11111111-1111-4111-8111-111111111111', 'ru', 'ipoteka', '/ru/ipoteka', 'hub', 'published', 'Ипотека в Польше — практический гид DOMUS', 'Практический гид по ипотеке в Польше: оценка бюджета, кредитоспособность, документы и сопровождение специалиста DOMUS.'),
('process-pl', 'mortgage-hub', '22222222-2222-4222-8222-222222222222', 'pl', 'kredyty-hipoteczne/proces', '/pl/kredyty-hipoteczne/proces', 'article', 'published', 'Proces kredytu hipotecznego krok po kroku', 'Poznaj etapy procesu kredytu hipotecznego w Polsce: analiza budżetu, dokumenty, wniosek, decyzja banku i uruchomienie finansowania.'),
('process-ru', 'mortgage-hub', '22222222-2222-4222-8222-222222222222', 'ru', 'ipoteka/process', '/ru/ipoteka/process', 'article', 'published', 'Ипотечный процесс в Польше по шагам', 'Разберите этапы ипотеки в Польше: бюджет, документы, подача заявки, решение банка, выполнение условий и выдача финансирования.'),
('capacity-pl', 'mortgage-hub', '33333333-3333-4333-8333-333333333333', 'pl', 'kredyty-hipoteczne/zdolnosc', '/pl/kredyty-hipoteczne/zdolnosc', 'article', 'published', 'Zdolność kredytowa — co wpływa na ocenę banku', 'Dowiedz się, co wpływa na zdolność kredytową w Polsce: dochody, zobowiązania, wkład własny, okres kredytowania i stabilność zatrudnienia.'),
('capacity-ru', 'mortgage-hub', '33333333-3333-4333-8333-333333333333', 'ru', 'ipoteka/kreditosposobnost', '/ru/ipoteka/kreditosposobnost', 'article', 'published', 'Кредитоспособность — что оценивает банк', 'Узнайте, что влияет на кредитоспособность в Польше: доходы, обязательства, первый взнос, срок кредита и стабильность занятости.'),
('service-pl', 'mortgage-hub', '44444444-4444-4444-8444-444444444444', 'pl', 'kredyty-hipoteczne/konsultacja', '/pl/kredyty-hipoteczne/konsultacja', 'service', 'published', 'Konsultacja hipoteczna DOMUS', 'Umów konsultację hipoteczną DOMUS i uporządkuj budżet, dokumenty oraz kolejne kroki finansowania nieruchomości w Polsce.'),
('service-ru', 'mortgage-hub', '44444444-4444-4444-8444-444444444444', 'ru', 'ipoteka/konsultaciya', '/ru/ipoteka/konsultaciya', 'service', 'draft', 'Ипотечная консультация DOMUS', 'Запишитесь на ипотечную консультацию DOMUS, чтобы структурировать бюджет, документы и следующие шаги покупки жилья в Польше.');

INSERT INTO content_blocks (id, page_id, kind, sort, heading, body, data) VALUES
('hero-pl', 'home-pl', 'hero', 1, 'Kredyt hipoteczny bez chaosu', 'Uporządkuj finansowanie zakupu nieruchomości w Polsce — od pierwszej kalkulacji do decyzji banku.', '{}'),
('intro-pl', 'home-pl', 'rich_text', 2, 'Zacznij od realnego budżetu', 'Ten hub wyjaśnia kolejne kroki. Materiał ma charakter informacyjny i nie stanowi porady finansowej.', '{}'),
('calc-pl', 'home-pl', 'calculator', 3, 'Orientacyjna rata', 'Obliczenie demonstracyjne, bez zapisu danych i bez oferty bankowej.', '{}'),
('hero-ru', 'home-ru', 'hero', 1, 'Ипотека без хаоса', 'Разберитесь с финансированием покупки недвижимости в Польше — от первого расчёта до решения банка.', '{}'),
('intro-ru', 'home-ru', 'rich_text', 2, 'Начните с реалистичного бюджета', 'Материал носит информационный характер и не является финансовой консультацией.', '{}'),
('calc-ru', 'home-ru', 'calculator', 3, 'Ориентировочный платёж', 'Демонстрационный расчёт без сохранения данных и без банковского предложения.', '{}'),
('process-body-pl', 'process-pl', 'rich_text', 1, 'Od budżetu do uruchomienia kredytu', 'Proces obejmuje analizę możliwości, wybór nieruchomości i banków, dokumenty, wniosek oraz decyzję.', '{}'),
('process-body-ru', 'process-ru', 'rich_text', 1, 'От бюджета до выдачи кредита', 'Процесс включает оценку возможностей, выбор объекта и банков, документы, заявку и решение.', '{}'),
('capacity-body-pl', 'capacity-pl', 'rich_text', 1, 'Bank analizuje więcej niż dochód', 'Znaczenie mają dochody, koszty, zobowiązania, wkład własny, forma zatrudnienia i parametry kredytu.', '{}'),
('capacity-body-ru', 'capacity-ru', 'rich_text', 1, 'Банк оценивает не только доход', 'Важны доходы, расходы, обязательства, первый взнос, форма занятости и параметры кредита.', '{}'),
('service-body-pl', 'service-pl', 'service', 1, 'Rozmowa o Twojej sytuacji', 'Formularz demonstracyjny nie wysyła danych. Integracja wymaga osobnego zadania i polityki prywatności.', '{"formId":"formularz"}'),
('service-body-ru', 'service-ru', 'service', 1, 'Разговор о вашей ситуации', 'Демонстрационная форма не отправляет данные. Интеграция требует отдельной задачи и политики конфиденциальности.', '{"formId":"forma"}');

INSERT INTO services (id, key, language, page_id, name, description) VALUES
('mortgage-consultation-pl', 'mortgage-consultation', 'pl', 'service-pl', 'Konsultacja hipoteczna', 'Wsparcie w uporządkowaniu procesu finansowania.'),
('mortgage-consultation-ru', 'mortgage-consultation', 'ru', 'service-ru', 'Ипотечная консультация', 'Сопровождение процесса финансирования.');

INSERT INTO media_assets (id, directus_file_id, alt_pl, alt_ru, rights_source) VALUES
('55555555-5555-4555-8555-555555555555', NULL, 'Znak słowny DOMUS GLOBAL', 'Текстовый логотип DOMUS GLOBAL', 'DOMUS-owned wordmark; local pilot metadata');

INSERT INTO ctas (id, page_id, label, href, style) VALUES
('cta-pl', 'home-pl', 'Umów konsultację', '/pl/kredyty-hipoteczne/konsultacja#formularz', 'primary'),
('cta-ru', 'home-ru', 'Записаться на консультацию', '/ru/ipoteka/konsultaciya#forma', 'primary');

INSERT INTO internal_links (source_page_id, target_page_id, label, href, relation) VALUES
('home-pl', 'process-pl', 'Jak wygląda proces kredytowy', '/pl/kredyty-hipoteczne/proces', 'child'),
('home-pl', 'capacity-pl', 'Jak ocenić zdolność kredytową', '/pl/kredyty-hipoteczne/zdolnosc', 'child'),
('home-pl', 'service-pl', 'Wsparcie eksperta hipotecznego', '/pl/kredyty-hipoteczne/konsultacja', 'service'),
('home-ru', 'process-ru', 'Как проходит ипотечный процесс', '/ru/ipoteka/process', 'child'),
('home-ru', 'capacity-ru', 'Как оценить кредитоспособность', '/ru/ipoteka/kreditosposobnost', 'child'),
('home-ru', 'service-ru', 'Сопровождение ипотечного специалиста', '/ru/ipoteka/konsultaciya', 'service'),
('process-pl', 'capacity-pl', 'Sprawdź zdolność kredytową', '/pl/kredyty-hipoteczne/zdolnosc', 'related'),
('capacity-pl', 'process-pl', 'Zobacz proces kredytowy', '/pl/kredyty-hipoteczne/proces', 'related'),
('process-ru', 'capacity-ru', 'Оценить кредитоспособность', '/ru/ipoteka/kreditosposobnost', 'related'),
('capacity-ru', 'process-ru', 'Посмотреть ипотечный процесс', '/ru/ipoteka/process', 'related');

INSERT INTO language_versions (page_id, version, status, snapshot)
SELECT id, 1, status, jsonb_build_object('title', title, 'meta_description', meta_description, 'canonical_path', canonical_path) FROM pages;

INSERT INTO change_tasks (title, scope, status, target_page_id, base_version, candidate_version, preview_url, rollback_reference)
VALUES ('Publish Russian mortgage consultation', 'Single draft translation; human review required', 'draft', 'service-ru', 1, 2, '/ru/ipoteka/konsultaciya', 'language_versions:service-ru:1');

COMMIT;

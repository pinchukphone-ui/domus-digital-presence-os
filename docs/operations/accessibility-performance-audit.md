# Accessibility и performance gate

Дата проверки: 2026-07-20.

## Scope

Локальный public-контур проверяется на восьми production-маршрутах PL/RU и на четырёх ключевых mobile-маршрутах при ширине 390 px. Автоматическая проверка использует axe-core с правилами WCAG 2.0/2.1 A/AA и WCAG 2.2 AA. Это регрессионный gate, а не сертификат полного соответствия WCAG.

## Проверенный сценарий

1. Открыть польскую главную страницу ипотечного хаба на desktop и mobile.
2. Перейти к калькулятору и проверить responsive layout.
3. Перейти на страницу консультации.
4. Заполнить демонстрационную форму тестовыми данными и проверить локальный success-state; данные не отправляются и не сохраняются.
5. Проверить клавиатурный вход: первый `Tab` показывает skip-link с видимым focus indicator.

Локальные визуальные артефакты сохраняются в `output/playwright/accessibility-audit/` и не добавляются в Git.

## Найдено и исправлено

- Axe обнаружил недостаточный контраст слова `GLOBAL` в логотипе: 2.29:1 на светлом фоне.
- Accent token изменён с `#c79d55` на `#8b5c16`; итоговый контраст составляет 5.28:1 на основном фоне.
- Focus indicator усилен до белого outline 3 px с тёмным внешним контуром; для `prefers-reduced-motion` отключён переход skip-link.
- На mobile-маршрутах добавлена автоматическая защита от горизонтального overflow.

## Автоматические проверки

- 13 accessibility E2E: восемь desktop routes, четыре mobile routes и keyboard skip-link.
- Performance budgets после Astro build: суммарный client JavaScript не более 80 KiB gzip, один JS asset не более 65 KiB gzip, суммарный CSS не более 15 KiB gzip.
- Зафиксированный readback: JS 63,190/81,920 bytes gzip; CSS 1,745/15,360 bytes gzip; шесть client assets.
- Полный readback: 38 unit/schema tests и 20 E2E проходят.

## Оставшиеся ограничения

Перед внешним pilot отдельно нужны ручные проверки screen reader, high-contrast mode, zoom 200–400%, реальные iOS/Android устройства и field Core Web Vitals. Юридическая и редакторская проверка PL/RU остаётся самостоятельным gate.

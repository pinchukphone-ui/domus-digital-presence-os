# Calculator context design QA

- Source visual truth: `output/playwright/calculator-context-v2/01-source-calculator.jpg`
- Implementation screenshot: `output/playwright/calculator-context-v2/05-implementation-calculator.jpg`
- Supporting states: `output/playwright/calculator-context-v2/02-invalid-calculator.jpg`, `output/playwright/calculator-context-v2/04-consultation-context.jpg`
- Viewport: 376 × 863 CSS pixels
- State: RU hub, 650 000 PLN, 25 years, 7.2%, calculator result and consultation CTA visible

## Full-view comparison evidence

The source and implementation captures were opened together at the same viewport, route, scroll position and calculator values. The calculator card, result hierarchy, disclaimer, CTA, related-links heading and card spacing remain visually unchanged. The query-backed context is intentionally invisible until navigation.

## Focused region comparison evidence

The full screenshot is already a focused component-region capture: labels, inputs, result, disclaimer and CTA are readable at native mobile scale. A separate crop was not needed. The invalid state was checked independently and keeps the error next to its field without horizontal overflow. The consultation state was checked independently and places the carried calculation above the email field.

## Required fidelity surfaces

- Fonts and typography: existing Georgia headings and system UI text remain unchanged; weights, line heights and wrapping match the source.
- Spacing and layout rhythm: calculator padding, grid collapse, input spacing, radius, shadow and section rhythm match the source; the validation message expands the affected field vertically without overlap.
- Colors and visual tokens: existing paper, surface, brand and muted treatments are preserved; the error color reuses the established preview warning color.
- Image quality and assets: no image or icon assets are introduced or replaced.
- Copy and content: PL/RU validation and calculation-context copy are localized and remain informational rather than advisory.

## Findings

No actionable P0, P1 or P2 visual differences remain.

## Comparison history

- Initial comparison: no P0/P1/P2 mismatch in the unchanged valid calculator state.
- Functional state checks: invalid amount disables the consultation action and shows a localized inline error; valid values restore the result and link; consultation displays the same amount, term, rate and payment; PL/RU switching preserves the context.
- Post-fix evidence: `03-valid-calculator.jpg`, `04-consultation-context.jpg`, and `05-implementation-calculator.jpg`.

## Follow-up polish

No blocking polish item. A future iteration may add an explicit “edit calculation” return link on the consultation page.

final result: passed

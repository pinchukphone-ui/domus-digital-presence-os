# Calculator round-trip design QA

- Source visual truth: `output/playwright/calculator-round-trip/01-source-consultation.jpg`
- Implementation screenshot: `output/playwright/calculator-round-trip/02-implementation-consultation.jpg`
- Supporting state: `output/playwright/calculator-round-trip/03-restored-calculator.jpg`
- Viewport: 376 × 863 CSS pixels
- State: RU consultation, 650 000 PLN, 25 years, 7.2%, calculation context and form visible

## Full-view comparison evidence

The source and implementation captures were opened together at the same viewport, route, scroll position and calculation values. The implementation adds one secondary text link inside the existing calculation-context panel. The form hierarchy, input width, primary button, privacy copy and surrounding page rhythm remain intact; the additional line increases the card height without hiding the primary action.

## Focused region comparison evidence

The full screenshot is already a focused mobile component capture with readable calculation copy, link, email input, button and privacy note. A separate crop was not required. The restored-calculator capture confirms the linked destination retains all three values and the calculated payment without horizontal overflow.

## Required fidelity surfaces

- Fonts and typography: the new link uses the existing system UI family and established bold weight; headings, labels and body copy are unchanged.
- Spacing and layout rhythm: the link uses a small top gap within the context panel; existing panel padding, form gaps, radius, shadow and button dimensions are preserved.
- Colors and visual tokens: the link uses the established strong brand color on the existing pale-green context surface; no new palette is introduced.
- Image quality and assets: no image or icon assets are introduced or replaced.
- Copy and content: “Изменить расчёт” and “Edytuj obliczenia” are concise, localized and describe the destination directly.

## Findings

No actionable P0, P1 or P2 visual differences remain.

## Comparison history

- Initial comparison: the new secondary action fits the existing context panel and keeps the form’s primary action visible in the same mobile viewport.
- Functional verification: RU and PL edit links carry validated parameters back to the correct localized calculator anchor; calculator inputs and payment are restored; language switching preserves the same context.
- Post-fix evidence: `02-implementation-consultation.jpg` and `03-restored-calculator.jpg`.

## Follow-up polish

No blocking polish item. Browser back/forward restoration is covered by URL state but could receive a dedicated history-navigation test later.

final result: passed

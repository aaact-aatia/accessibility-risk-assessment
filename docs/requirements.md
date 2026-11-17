# Proof of concept requirements

## Scope

A public, jurisdiction-neutral accessibility procurement risk assessment tool. Preserve the original spreadsheet scoring methodology for WCAG 2.1 Level A and AA. Do not publish the original workbook or government-specific references. The score supports decision-making and does not establish conformance.

## Architecture

Keep it simple: semantic HTML, custom CSS, native JavaScript modules, JSON scoring configuration, no production dependencies, no build step, no backend or database. Use Node.js built-in tests and GitHub Actions. Host on GitHub Pages.

## Workflow

1. Enter assessment information.
2. Record conformance responses grouped by the four WCAG principles.
3. Answer vendor governance questions.
4. Review an accessible HTML report and real-time scoring.
5. Optionally import or export assessment JSON. No automatic persistence or user accounts.

## Assessment information

Vendor name and product name are required. Include product version, product website, Accessibility Conformance Report URL and date, evaluator name, assessment date (default today, editable), intended product use and additional notes.

## Accessibility

Target WCAG 2.2 Level AA for the application itself. Use native controls, clear labels, keyboard access, accessible validation, responsive layout and text equivalents for visual results. Test manually as well as automatically.

## Implementation checks

Extract and verify weights, formulas, statuses, thresholds and edge cases directly against the original workbook before implementing the scoring engine. Keep calculation logic independent of presentation and use a structured report model for future exports. Do not silently modify scoring rules.

## Deferred enhancements

- #1 English and French support
- #2 WCAG 2.2 assessment support
- #3 Accessible Word and PDF reports
- #4 Persistent assessment storage and management

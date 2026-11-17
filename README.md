# Accessibility Risk Assessment Tool

A dependency-free proof of concept for evaluating product accessibility conformance and procurement risk using a vendor's Accessibility Conformance Report. The 49-criterion WCAG 2.1 scoring methodology is documented in [docs/methodology.md](docs/methodology.md).

## Use locally

Serve the repository root with a static HTTP server (opening index.html directly will not load the JSON configuration). For example, with Python installed:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. No build or installation is required.

## Tests

With Node.js 22 or later, run `npm test`. No dependency installation is needed. Tests cover the source workbook sample, maximum scores, partial and zero scores, incomplete answers and criterion coverage.

## GitHub Pages

In repository Settings > Pages, select Deploy from a branch, main, / (root), and Save. The expected site is https://aaact-aatia.github.io/accessibility-risk-assessment/.

## Data and privacy

Responses are held in memory only. Export JSON to retain a copy; import it to resume. No server-side storage or account is required. JSON files and printed reports may contain sensitive product or evaluator information; handle them accordingly. The HTML print facility is not an accessible tagged PDF generator.

## Status

Proof of concept; independent accessibility testing and browser review are still required. The score is a procurement decision-support measure, not proof of conformance. See [requirements](docs/requirements.md) and [open issues](https://github.com/aaact-aatia/accessibility-risk-assessment/issues).

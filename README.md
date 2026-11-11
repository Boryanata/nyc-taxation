# NYC tax ladder

An animated visualization of NYC's marginal personal income tax rate for married couples filing jointly. It shows how the rate rises through the lower brackets and stays at 3.876% above $90,000, including at $5 million.

## Preview

Run `python3 -m http.server 8000` from this folder, then open `http://127.0.0.1:8000/`. The page loads Observable Plot and D3 from a CDN, so the browser needs an internet connection.

## Files

- [`index.html`](index.html) is the standalone preview page.
- [`taxAccordion.js`](taxAccordion.js) is the Observable Classic visualization cell.
- [`CONCEPT.md`](CONCEPT.md) explains the design intent and how to use the cell in Observable.

The source workbook supplied with the exercise is intentionally excluded from this repository.

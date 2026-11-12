# NYC taxation

An animated look at NYC's marginal personal income tax rate for married couples filing jointly. The supplied bracket data shows a 3.876% rate above $90,000, including for the income examples through $5 million. The chart shows the rate on the next dollar; total tax paid still rises with income.

## Preview locally

Run `python3 -m http.server 8000` from this folder, then open `http://127.0.0.1:8000/`. The preview loads Observable Plot and D3 from a CDN, so the browser needs an internet connection.

## Use in Observable Classic

Create a cell `Plot = require("@observablehq/plot@0.6.19")`, then paste the contents of [`nyc-tax-ladder.js`](nyc-tax-ladder.js) into another cell. That cell loads D3 itself.

The supplied exercise workbook and an earlier prototype are kept out of this repository.

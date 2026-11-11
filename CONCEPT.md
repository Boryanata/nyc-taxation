# Concept and intention

Four dollar-bill stacks build upward in sequence to show how NYC's marginal personal income tax rate rises across the married-filing-jointly brackets in the supplied exercise data. The vertical scale begins at 3%; each full bill represents 0.1 percentage point above it, and a partially shaded bill shows the remainder. After the above-$90,000 stack finishes, an amber line draws upward to mark the threshold. Five sideways unfolds then add one stack each for $200,000, $500,000, $1 million, $2 million, and $5 million. Every unfolded stack remains at the same 3.876% marginal rate, displayed as 3.88%. After the $5 million explainer holds, the explainer changes to a separate amber closing line: "The tax ladder ends at $90K." The question "What does paying your fair share mean?" then types into the subheader position.

I want a viewer to notice where the rate stops rising and ask whether that matches their expectation of a progressive tax system. Pauses between the first four rates establish the staircase; later examples unfold one at a time at the same height. The equal gaps are a visual sequence, not a proportional income axis. The graphic depicts the marginal rate on the next dollar, not the total tax bill; total tax paid continues to rise with income.

## Observable Classic

Create a cell `Plot = require("@observablehq/plot@0.6.19")`, then paste the complete [`taxAccordion.js`](taxAccordion.js) cell into the notebook. The cell loads D3 itself. To view the local preview, run `python3 -m http.server 8000` in the project folder and open `http://127.0.0.1:8000/`.

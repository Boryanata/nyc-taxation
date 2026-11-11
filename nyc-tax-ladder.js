// Observable Classic: keep a separate Plot = require("@observablehq/plot@0.6.19") cell.
// Paste this entire cell into the notebook. D3 is loaded inside the cell.

nycTaxLadder = {
  const d3 = await require("d3@7");
  const GREEN = "#176746", PALE = "#DDEFE4", PAPER = "#FFFEFC";
  const INK = "#29332E", MUTED = "#5C6B61", AMBER = "#C88517";
  const BASE = 3, UNIT = 0.1;
  const W = 1190, H = 640, L = 70, R = 30, T = 75, B = 90;
  const Y_MIN = 3, Y_MAX = 4.12, HALF_BILL_WIDTH = 0.03;

  // Every column has one size and one horizontal gap. X positions are an
  // ordered sequence of tax brackets and example incomes, not a dollar axis.
  const FIRST_X = 0.08, PITCH = 0.105;
  const brackets = [
    {income: "$0–\n$21.6K", rate: 3.078},
    {income: "$21.6K–\n$45K", rate: 3.762},
    {income: "$45K–\n$90K", rate: 3.819},
    {income: "Above\n$90K", rate: 3.876}
  ].map((d, index) => ({...d, index, x: FIRST_X + index * PITCH}));
  const stageSpecs = [
    {incomeValue: 200000, label: "$200K"},
    {incomeValue: 500000, label: "$500K"},
    {incomeValue: 1000000, label: "$1M"},
    {incomeValue: 2000000, label: "$2M"},
    {incomeValue: 5000000, label: "$5M"}
  ];
  const plateau = stageSpecs.map((stage, i) => ({
    ...stage, index: 4 + i, x: FIRST_X + (4 + i) * PITCH, rate: 3.876
  }));
  const columns = [...brackets, ...plateau];
  const stages = stageSpecs.map((stage, i) => ({
    ...stage, panel: i, x: plateau[i].x,
    message: i === 0
      ? "$200K. Higher income, same 3.88% rate on the next dollar."
      : i === stageSpecs.length - 1
        ? "$5M. Millions more in income. Still 3.88% on the next dollar."
        : `${stage.label}. Still 3.88% on the next dollar.`
  }));

  // A stack starts at the labeled 3% baseline. Full bills and fractional top bills share one
  // outline; a left-to-right tint shows how much of the top bill counts.
  const bills = columns.flatMap(column => {
    const count = Math.ceil((column.rate - BASE) / UNIT - 1e-8);
    return Array.from({length: count}, (_, row) => {
      const fraction = Math.min(1, Math.max(0, (column.rate - BASE) / UNIT - row));
      const x1 = column.x - HALF_BILL_WIDTH;
      const x2 = column.x + HALF_BILL_WIDTH;
      const fillX1 = x1 + 0.003;
      return {
        x: column.x, index: column.index,
        x1, x2, y1: BASE + row * UNIT, y2: BASE + (row + 1) * UNIT,
        yc: BASE + (row + 0.5) * UNIT, fraction, fillX1,
        fillX2: fillX1 + fraction * (x2 - x1 - 0.006)
      };
    });
  });

  function billMarks(data, className) {
    return [
      Plot.rect(data, {
        x1: "x1", x2: "x2", y1: "y1", y2: "y2",
        fill: PAPER, stroke: GREEN, strokeWidth: 1.3, r: 3,
        insetTop: 7, insetBottom: 7, className
      }),
      Plot.rect(data, {
        x1: "fillX1", x2: "fillX2", y1: "y1", y2: "y2",
        fill: PALE, r: 1.5, insetTop: 9, insetBottom: 9, className
      }),
      Plot.rect(data, {
        x1: "x1", x2: "x2", y1: "y1", y2: "y2",
        fill: "none", stroke: GREEN, strokeOpacity: 0.55,
        strokeWidth: 0.7, r: 1,
        insetLeft: 4, insetRight: 4, insetTop: 10, insetBottom: 10,
        className
      }),
      Plot.dot(data, {
        x: "x", y: "yc", r: 7.5,
        fill: PAPER, stroke: GREEN, strokeWidth: 1, className
      }),
      Plot.text(data, {
        x: "x", y: "yc", text: () => "$",
        fill: GREEN, fontFamily: "Georgia, serif",
        fontSize: 12, fontWeight: 700, className
      })
    ];
  }

  const plot = Plot.plot({
    width: W, height: H,
    marginLeft: L, marginRight: R, marginTop: T, marginBottom: B,
    style: {background: PAPER, color: INK, fontFamily: "Arial, sans-serif"},
    x: {domain: [0, 1], axis: null, label: null},
    y: {domain: [Y_MIN, Y_MAX], axis: null, label: null},
    ariaLabel: "NYC marginal income tax rates for married couples filing jointly: " +
      "3.078%, 3.762%, 3.819%, then 3.876% above $90,000. " +
      "One equally spaced stack unfolds at each labeled income through $5 million, " +
      "all at the 3.876% rate.",
    ariaDescription: "Each full bill represents 0.1 percentage point of the " +
      "marginal rate above the labeled 3% baseline. A partially shaded final " +
      "bill represents the remainder. An amber line marks the $90,000 " +
      "threshold. Total tax paid still rises with income.",
    marks: [
      Plot.ruleY([3, 3.5, 4], {stroke: "#E3E9E4", strokeWidth: 1}),
      Plot.axisY({ticks: [3, 3.5, 4], tickFormat: d => `${d.toFixed(1)}%`,
        tickSize: 0, label: null, color: MUTED}),
      ...columns.flatMap(column => {
        const className = `bill-col-${column.index}`;
        return [
          ...billMarks(bills.filter(d => d.index === column.index), className),
          ...(column.index < brackets.length ? [
            Plot.text([column], {
              x: "x", y: d => BASE + Math.ceil((d.rate - BASE) / UNIT) * UNIT + 0.12,
              text: d => `${d.rate.toFixed(2)}%`,
              fill: GREEN, fontSize: 19, fontWeight: 700, className
            }),
            Plot.text([column], {
              x: "x", y: BASE, dy: 40, text: "income",
              fill: MUTED, fontSize: 13, lineHeight: 1.1, className
            })
          ] : [])
        ];
      })
    ]
  });

  // Plot draws every full-height bill column. D3 reveals the first four rates
  // in sequence, then opens one whole column per labeled income sideways.
  const pxX = x => L + (W - L - R) * x;
  const pxY = y => H - B - (H - T - B) * (y - Y_MIN) / (Y_MAX - Y_MIN);
  const svg = d3.select(plot);
  const thresholdBottom = pxY(BASE);
  const thresholdTop = pxY(4.06);
  const thresholdX = pxX((brackets[3].x + plateau[0].x) / 2);
  const thresholdLine = svg.append("line")
    .attr("x1", thresholdX)
    .attr("x2", thresholdX)
    .attr("y1", thresholdBottom).attr("y2", thresholdBottom)
    .attr("stroke", AMBER).attr("stroke-width", 2.6)
    .attr("stroke-dasharray", "2,6").attr("stroke-linecap", "round")
    .attr("opacity", 0).attr("aria-hidden", "true");
  const layer = svg.append("g")
    .attr("aria-hidden", "true").attr("class", "accordion-columns");
  const columnGroups = columns.map((column, i) => {
    const g = layer.append("g").attr("class", `animated-column-${i}`);
    const marks = svg.selectAll(`.bill-col-${i}`).nodes();
    if (!marks.length) throw new Error(`Missing Plot marks for column ${i}`);
    marks.forEach(mark => g.node().appendChild(mark));
    if (i < brackets.length) {
      return {g};
    }
    const center = pxX(column.x);
    const hinge = pxX(columns[i - 1].x);
    function draw(progress) {
      const x = hinge + (center - hinge) * progress;
      const width = 0.08 + 0.92 * progress;
      g.attr("opacity", progress <= 0 ? 0 : 1)
        .attr("transform", `translate(${x},0) scale(${width},1) translate(${-center},0)`);
    }
    draw(0);
    return {g, draw};
  });
  const maskDefs = svg.append("defs");
  const maskPrefix = "rate-stack-" + Math.random().toString(36).slice(2);
  const rateMasks = brackets.map((bracket, i) => {
    const id = `${maskPrefix}-${i}`;
    const bottom = pxY(BASE) + 60;
    const top = pxY(BASE + Math.ceil((bracket.rate - BASE) / UNIT) * UNIT + 0.15);
    const center = pxX(bracket.x);
    const rect = maskDefs.append("clipPath")
      .attr("id", id).attr("clipPathUnits", "userSpaceOnUse")
      .append("rect")
      .attr("x", center - HALF_BILL_WIDTH * (W - L - R) - 22)
      .attr("width", HALF_BILL_WIDTH * 2 * (W - L - R) + 44)
      .attr("y", bottom).attr("height", 0);
    columnGroups[i].g.attr("clip-path", `url(#${id})`);
    function draw(progress) {
      const y = bottom + (top - bottom) * progress;
      rect.attr("y", y).attr("height", bottom - y);
    }
    draw(0);
    return {draw};
  });
  const panels = columnGroups.slice(brackets.length);
  const markers = stages.map(stage => {
    const x = pxX(stage.x);
    const g = svg.append("g").attr("opacity", 0).attr("aria-hidden", "true");
    g.append("line")
      .attr("x1", x).attr("x2", x)
      .attr("y1", pxY(BASE) + 6).attr("y2", pxY(BASE) + 18)
      .attr("stroke", GREEN).attr("stroke-width", 1.3);
    g.append("text")
      .attr("x", x).attr("y", pxY(BASE) + 42)
      .attr("text-anchor", "middle")
      .attr("fill", GREEN).attr("font-family", "Arial, sans-serif")
      .attr("font-size", 15).attr("font-weight", 700)
      .text(stage.label);
    return g;
  });

  const figure = document.createElement("figure");
  figure.style.cssText = "max-width:1190px;margin:0;background:#FFFEFC;" +
    "color:#29332E;font-family:Arial,sans-serif";
  const title = document.createElement("h2");
  title.textContent = "From $90K to $5 million. Same NYC personal income tax rate.";
  title.style.cssText = "font-size:34px;line-height:1.12;margin:0 0 8px;font-weight:750";
  const subtitleCopy = "What does paying your fair share mean?";
  const subtitle = document.createElement("div");
  subtitle.setAttribute("aria-label", subtitleCopy);
  subtitle.style.cssText = "font-size:21px;line-height:1.25;color:#4F5752;" +
    "font-weight:700;margin-bottom:56px;min-height:27px;visibility:hidden";
  plot.style.width = "100%";
  plot.style.height = "auto";
  const message = document.createElement("div");
  message.style.cssText = "font-size:21px;line-height:1.3;color:#176746;" +
    "font-weight:700;border-left:3px solid #176746;padding:3px 0 3px 14px;" +
    "margin:0 30px 6px 70px;min-height:28px";
  function setMessage(copy, allAmber = false) {
    message.replaceChildren();
    message.style.color = allAmber ? AMBER : GREEN;
    message.style.borderLeftColor = allAmber ? AMBER : GREEN;
    if (allAmber) {
      message.textContent = copy;
      return;
    }
    const highlights = /\$[\d.]+[KM]?|\d+(?:\.\d+)?%/g;
    let start = 0;
    for (const match of copy.matchAll(highlights)) {
      message.append(document.createTextNode(copy.slice(start, match.index)));
      const value = document.createElement("span");
      value.style.color = AMBER;
      value.textContent = match[0];
      message.append(value);
      start = match.index + match[0].length;
    }
    message.append(document.createTextNode(copy.slice(start)));
  }
  async function fadeMessage(copy, {allAmber = false, outMs = 220, inMs = 420} = {}) {
    const target = d3.select(message);
    await target.transition().duration(outMs)
      .ease(d3.easeCubicInOut).style("opacity", 0).end();
    setMessage(copy, allAmber);
    await target.transition().duration(inMs)
      .ease(d3.easeCubicInOut).style("opacity", 1).end();
  }
  setMessage("Watch the NYC tax rate climb.");
  const note = document.createElement("figcaption");
  note.textContent = "NYC personal income tax · Married filing jointly" +
    " · Full bill = 0.1 percentage point above 3%" +
    " · Income spacing not to scale" +
    " · Total tax paid rises with income" +
    " · Source: Data Viz Exercise.xlsx";
  note.style.cssText = "font-size:11.5px;line-height:1.45;color:#617067;" +
    "margin:24px 30px 0 70px;padding-bottom:14px";
  figure.append(title, subtitle, message, plot, note);

  let stopped = false, timer, resumeWait;
  const pause = ms => new Promise(resolve => {
    resumeWait = resolve;
    timer = setTimeout(() => { timer = null; resumeWait = null; resolve(); }, ms);
  });
  const reset = () => {
    rateMasks.forEach(mask => mask.draw(0));
    thresholdLine.attr("opacity", 0).attr("y2", thresholdBottom);
    panels.forEach(p => p.draw(0));
    markers.forEach(g => g.attr("opacity", 0));
    setMessage("Watch the NYC tax rate climb.");
    message.style.opacity = "1";
    subtitle.textContent = "";
    subtitle.style.visibility = "hidden";
  };
  const complete = () => {
    rateMasks.forEach(mask => mask.draw(1));
    thresholdLine.attr("opacity", 1).attr("y2", thresholdTop);
    panels.forEach(p => p.draw(1));
    markers.forEach(g => g.attr("opacity", 1));
    setMessage("The tax rate hits its ceiling at $90K. Income doesn't.", true);
    subtitle.textContent = subtitleCopy;
    subtitle.style.visibility = "visible";
  };

  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
    complete();
  } else {
    (async () => {
      let firstCycle = true;
      while (!stopped) {
        reset();
        await pause(firstCycle ? 800 : 350);
        firstCycle = false;
        for (let i = 0; i < brackets.length; i++) {
          if (stopped) break;
          try {
            await columnGroups[i].g.transition().duration(850)
              .ease(d3.easeCubicOut)
              .tween("stack", () => progress => rateMasks[i].draw(progress)).end();
          } catch (e) { stopped = true; break; }
          if (i === brackets.length - 1) {
            try {
              await Promise.all([
                fadeMessage("Above $90K: 3.88% on the next dollar.",
                  {outMs: 350, inMs: 900}),
                thresholdLine.transition().duration(1000)
                  .ease(d3.easeCubicOut).attr("opacity", 1)
                  .attr("y2", thresholdTop).end()
              ]);
            } catch (e) { stopped = true; break; }
            await pause(900);
          } else {
            await pause(650);
          }
        }
        for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
          if (stopped) break;
          const stageStartedAt = performance.now();
          const panel = panels[stages[stageIndex].panel];
          try {
            const unfolding = panel.g.transition().duration(350).ease(d3.easeCubicOut)
              .tween("unfold", () => progress => panel.draw(progress)).end();
            if (stageIndex === 0) {
              await Promise.all([unfolding, fadeMessage(stages[stageIndex].message)]);
            } else {
              await unfolding;
              setMessage(stages[stageIndex].message);
            }
          } catch (e) { stopped = true; break; }
          if (stopped) break;
          markers[stageIndex].attr("opacity", 1);
          await pause(stageIndex === stages.length - 1 ? 2200 :
            Math.max(0, 1650 - (performance.now() - stageStartedAt)));
        }
        if (!stopped) {
          try {
            await fadeMessage("The tax rate hits its ceiling at $90K. Income doesn't.",
              {allAmber: true, outMs: 350, inMs: 1400});
          } catch (e) { stopped = true; break; }
          subtitle.style.visibility = "visible";
          try {
            await d3.select(subtitle).transition().duration(2100)
              .ease(d3.easeLinear)
              .tween("type", () => progress => {
                subtitle.textContent = subtitleCopy.slice(0,
                  Math.ceil(progress * subtitleCopy.length));
              }).end();
          } catch (e) { stopped = true; break; }
          subtitle.textContent = subtitleCopy;
          await pause(4500);
        }
      }
    })();
  }
  invalidation.then(() => {
    stopped = true;
    thresholdLine.interrupt();
    d3.select(message).interrupt();
    d3.select(subtitle).interrupt();
    layer.selectAll("*").interrupt();
    clearTimeout(timer);
    resumeWait?.();
  });

  return figure;
}

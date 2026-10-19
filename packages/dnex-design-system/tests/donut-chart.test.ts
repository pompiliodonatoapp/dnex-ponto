import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/components/charts/DonutChartDnex.tsx", import.meta.url), "utf8");

test("DonutChart exposes Pie and Tooltip directly to Recharts, not through a Fragment", () => {
  const chart = source.slice(source.indexOf("<PieChart>"), source.indexOf("</PieChart>"));
  assert.doesNotMatch(chart, /<>|<Fragment|<React\.Fragment/);
  assert.match(chart, /total > 0 \? \(\s*<Pie/);
  assert.match(chart, /total > 0 && \(\s*<Tooltip/);
  assert.equal((chart.match(/isAnimationActive=\{false\}/g) ?? []).length, 2, "Both data and empty-state pies remain readable without motion");
});

test("DonutChart fits long center values inside the donut and retains accessible values", () => {
  assert.match(source, /containerType: "inline-size"/);
  assert.match(source, /max-w-\[62%\]/);
  assert.match(source, /92 \/ centerValue\.length/);
  assert.match(source, /overflowWrap: "anywhere"/);
  assert.match(source, /<figcaption className="sr-only">/);
  assert.match(source, /aria-label=\{ariaLabel\}/);
});

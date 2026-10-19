// Validates the published ESM file graph without evaluating browser-only code.
// Run from the package directory after build:library.
const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const { resolve, dirname, relative } = require("node:path");
const dist = resolve("dist");
const visited = new Set();
function visit(file) {
  assert.ok(existsSync(file), `Missing distributed module: ${relative(dist, file)}`);
  if (visited.has(file)) return;
  visited.add(file);
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/\bfrom\s*["'](\.[^"']+)["']/g)) visit(resolve(dirname(file), match[1]));
}
visit(resolve(dist, "index.js"));
assert.ok(visited.size > 20, "DS preserves component modules instead of a monolithic bundle");
assert.ok(existsSync(resolve(dist, "index.d.ts")), "Stable NodeNext-compatible declarations");
assert.ok(existsSync(resolve(dist, "styles.css")), "Stable CSS entry");
const entry = readFileSync(resolve(dist, "index.js"), "utf8");
for (const symbol of ["PageLoader", "AppLayout", "LoginScreen", "DataTable", "ThemeProvider"]) assert.ok(entry.includes(symbol), `Public export ${symbol}`);
console.log(`DS distribution: ${visited.size} ESM modules resolve; public exports, CSS and types preserved.`);

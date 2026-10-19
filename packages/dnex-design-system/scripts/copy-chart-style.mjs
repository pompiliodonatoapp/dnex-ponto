import { copyFileSync } from "node:fs";
// Opt-in chart stylesheet: route-level imports keep login CSS within budget.
copyFileSync(new URL("../src/styles/status-pipeline.css", import.meta.url), new URL("../dist/status-pipeline.css", import.meta.url));

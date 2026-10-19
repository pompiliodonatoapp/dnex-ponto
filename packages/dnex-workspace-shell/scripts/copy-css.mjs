import { copyFileSync } from "node:fs";
copyFileSync(new URL("../src/workspace-shell.css", import.meta.url), new URL("../dist/workspace-shell.css", import.meta.url));

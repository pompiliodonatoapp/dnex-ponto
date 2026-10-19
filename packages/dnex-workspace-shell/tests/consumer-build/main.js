import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { WorkspaceShell } from "@dnex/workspace-shell";
import "@dnex/ds/styles";

// Deliberately no direct shell/styles import: the public browser entry owns it.
createRoot(document.getElementById("root")).render(createElement(WorkspaceShell, {
  products: [{ key: "normas", label: "DNEX Normas", href: "/normas", visible: true }],
  sections: [], currentProductKey: "normas", productLabel: "DNEX Normas",
  children: createElement("h1", null, "Consumer production fixture"),
}));

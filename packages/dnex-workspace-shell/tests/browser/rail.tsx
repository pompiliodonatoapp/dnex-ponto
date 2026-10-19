import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "@dnex/ds/styles";
import { WorkspaceShell } from "@dnex/workspace-shell";
function Fixture() {
  const [count, setCount] = useState(1);
  const products = Array.from({ length: count }, (_, i) => ({ key: "fixture-" + i, label: "App " + (i + 1), href: "#app-" + i, visible: true, icon: <span>{i + 1}</span> }));
  return <WorkspaceShell products={products} currentProductKey="fixture-0" productLabel="Fixture" sections={[{ key: "fixture-menu", label: "Menu de teste", items: Array.from({ length: 25 }, (_, i) => ({ key: "item-" + i, label: "Item " + (i + 1), href: "#item-" + i })) }]} hubHref="#hub">
    <h1>Rail de teste</h1>
    <button onClick={() => setCount(1)}>Um aplicativo</button>
    <button onClick={() => setCount(3)}>Poucos aplicativos</button>
    <button onClick={() => setCount(18)}>Muitos aplicativos</button>
  </WorkspaceShell>;
}
createRoot(document.getElementById("root")!).render(<Fixture />);

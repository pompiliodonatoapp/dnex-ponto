import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { PageLoader } from "../../src/components/composed/Spinner";
import "../../src/styles/theme.css";

declare global {
  interface Window {
    loaderQA: { set: (count: number, position?: "fixed" | "absolute") => void; clicks: number };
  }
}

document.documentElement.dataset.theme = new URLSearchParams(location.search).get("theme") ?? "light";

function Fixture() {
  const [count, setCount] = useState(0);
  const [position, setPosition] = useState<"fixed" | "absolute">("fixed");
  window.loaderQA = {
    clicks: window.loaderQA?.clicks ?? 0,
    set: (nextCount, nextPosition = "fixed") => { setPosition(nextPosition); setCount(nextCount); },
  };
  return <>
    <header style={{ position: "fixed", inset: "0 0 auto", height: 64, zIndex: 1110, background: "#eab308" }}>Topbar atrás do carregamento</header>
    <aside style={{ position: "fixed", inset: "64px auto 0 0", width: 64, zIndex: 1100, background: "#211c47" }}>Sidebar</aside>
    <main style={{ margin: "80px 16px 0 80px", minHeight: "160vh" }}>
      <button id="trigger" onClick={() => setCount(1)}>Carregar página</button>
      <button id="behind" onClick={() => { window.loaderQA.clicks += 1; }}>Ação atrás do loader</button>
      <div id="animated-ancestor" style={{ position: "relative", height: 280, transform: "translate3d(0, 24px, 0)", filter: "blur(0px)", opacity: 0.85, overflow: "hidden" }}>
        <h1>Visão geral</h1>
        <p>Esta tela não pode aparecer atrás do carregamento global.</p>
        {Array.from({ length: count }, (_, index) => <PageLoader key={index} position={position} label="Organizando sua visão geral" />)}
      </div>
    </main>
  </>;
}

createRoot(document.getElementById("root")!).render(<StrictMode><Fixture /></StrictMode>);

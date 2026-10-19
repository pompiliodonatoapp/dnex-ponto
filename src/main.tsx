import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "@dnex/ds";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" persist={false}><App /></ThemeProvider>
  </React.StrictMode>
);

// Update only this product's existing legacy worker. The replacement disables
// anonymous replay and preserves IndexedDB queues for authenticated recovery.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => Promise.all(
    registrations.filter(registration => [registration.active, registration.waiting, registration.installing].some(worker => worker && new URL(worker.scriptURL).origin === location.origin && new URL(worker.scriptURL).pathname === '/sw.js')).map(registration => registration.update())
  )).catch(() => console.warn('Não foi possível atualizar o sincronizador legado do Ponto.'));
}

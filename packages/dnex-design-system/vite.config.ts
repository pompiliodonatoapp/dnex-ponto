import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Showcase do DNEX Design System.
// Tailwind v4 via plugin (CSS-first, sem tailwind.config.js).
// React 19 via plugin oficial.
//
// CODE-SPLIT (manualChunks)
// -----------------------------------------------------------------------------
// O showcase carrega TODAS as libs do DS de uma vez (gráficos, tabela de dados,
// calendário, command palette, motion…). Num único bundle isso estoura o aviso
// de chunk >500 kB do Rollup e degrada o carregamento. Aqui fatiamos as libs
// pesadas em chunks próprios, por dependência, para que:
//   • o navegador baixe em paralelo e cacheie cada lib separadamente;
//   • atualizar o código do app não invalide o cache das libs;
//   • nenhum chunk "monstro" concentre tudo.
//
// Estratégia: função sobre o `id` (caminho do módulo). Cada módulo de
// node_modules cai no PRIMEIRO grupo cujo teste casa; o que sobra vira um
// `vendor` genérico. Ordem importa — react vem primeiro para não ser puxado
// por libs que dependem dele. Código do próprio DS (src/) NÃO é fatiado aqui:
// fica no entry, e o tree-shaking dos apps consumidores cuida do resto.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // O pacote distribuível escreve em `dist`; a vitrine permanece isolada
    // para que um `npm pack` nunca leve os artefatos do app de demonstração.
    outDir: "dist-showcase",
    sourcemap: false,
    // Bundle único (vitrine). Fatiar com manualChunks gerou dependência
    // circular entre chunks (react/charts/vendor) → "Cannot access X before
    // initialization" em produção. O DS é tree-shakeável: o que pesa no app
    // consumidor é só o que ele importa — o split real vive nos apps
    // (lazy-load por rota). Aqui só elevamos o limite do aviso.
    chunkSizeWarningLimit: 1600,
  },
});

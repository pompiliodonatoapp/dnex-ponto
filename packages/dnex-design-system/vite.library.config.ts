import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";

const externalPackages = [
  "@hookform/resolvers",
  "@radix-ui/react-accordion",
  "@radix-ui/react-avatar",
  "@radix-ui/react-checkbox",
  "@radix-ui/react-dialog",
  "@radix-ui/react-dropdown-menu",
  "@radix-ui/react-hover-card",
  "@radix-ui/react-label",
  "@radix-ui/react-popover",
  "@radix-ui/react-progress",
  "@radix-ui/react-radio-group",
  "@radix-ui/react-select",
  "@radix-ui/react-separator",
  "@radix-ui/react-slider",
  "@radix-ui/react-slot",
  "@radix-ui/react-switch",
  "@radix-ui/react-tabs",
  "@radix-ui/react-toggle-group",
  "@radix-ui/react-tooltip",
  "@tanstack/react-table",
  "clsx",
  "cmdk",
  "date-fns",
  "lucide-react",
  "motion",
  "react",
  "react-day-picker",
  "react-dom",
  "react-hook-form",
  "recharts",
  "tailwind-merge",
  "zod",
] as const;

function isExternal(id: string) {
  return externalPackages.some(
    (packageName) => id === packageName || id.startsWith(`${packageName}/`),
  );
}

/**
 * Build do pacote consumível entre repositórios. A configuração de showcase
 * permanece em `vite.config.ts` e produz somente `dist-showcase`.
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Um único index.d.ts evita que o consumidor NodeNext percorra exports
    // internos sem extensão. A superfície pública passa a ser ESM válida.
    dts({
      entryRoot: "src",
      outDir: "dist",
      tsconfigPath: "tsconfig.lib.json",
      rollupTypes: true,
      insertTypesEntry: true,
    }),
  ],
  build: {
    outDir: "dist",
    // O Vite limpa os artefatos anteriores; o emissor de declarações escreve
    // a superfície pública agrupada diretamente em `dist`, evitando arquivos
    // obsoletos no tarball da RC.
    // Artefatos RC não carregam mapas de fonte: consumidores recebem apenas
    // a superfície compilada e os tipos públicos declarados.
    sourcemap: false,
    lib: {
      // Executado pela script do próprio package; a entrada relativa evita
      // dependência de caminhos específicos de Windows/POSIX nesta RC.
      entry: "src/library.ts",
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName === "library" ? "index" : entryName}.js`,
      cssFileName: "styles",
    },
    rollupOptions: {
      external: isExternal,
      output: {
        // Manter os limites entre componentes permite que o consumidor faça
        // tree-shaking e carregue tabelas/calendários apenas na tela que os usa.
        // A API pública continua em dist/index.js; os tipos seguem agrupados.
        preserveModules: true,
        preserveModulesRoot: "src",
      },
    },
  },
});

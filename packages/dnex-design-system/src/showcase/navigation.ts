import type { ShowcaseGroup } from "./ShowcaseExperience";

export const navGroups: ShowcaseGroup[] = [
  {
    title: "Foundations",
    items: [
      { id: "foundations", label: "Foundations" },
      { id: "identidade-produtos", label: "Identidade dos produtos" },
      { id: "tokens", label: "Tokens" },
      { id: "densidade", label: "Densidade" },
    ],
  },
  {
    title: "Componentes",
    items: [
      { id: "primitivos", label: "Primitivos" },
      { id: "formularios", label: "Formulários" },
      { id: "inputs-br", label: "Inputs Fiscais" },
      { id: "compostos", label: "Compostos" },
    ],
  },
  {
    title: "Padrões",
    items: [
      { id: "datas", label: "Datas" },
      { id: "wizard", label: "Wizard" },
      { id: "notificacoes", label: "Notificações" },
      { id: "overlays", label: "Overlays" },
      { id: "command", label: "Command ⌘K" },
      { id: "loading", label: "Loading" },
    ],
  },
  {
    title: "Visual & Dados",
    items: [
      { id: "dados", label: "Dados" },
      { id: "graficos", label: "Gráficos" },
      { id: "ilustracoes", label: "Ilustrações" },
      { id: "icones", label: "Ícones" },
    ],
  },
  {
    title: "Aplicação",
    items: [
      { id: "shell-tokens", label: "Tokens do App Shell" },
      { id: "sidebar", label: "Sidebar" },
      { id: "topbar", label: "Barra superior" },
      { id: "page-headers", label: "Cabeçalhos" },
      { id: "page-container", label: "Contêiner" },
      { id: "billing", label: "Billing" },
      { id: "error-pages", label: "Error Pages" },
      { id: "shell", label: "App Shell" },
      { id: "responsivo", label: "Responsivo" },
    ],
  },
  {
    title: "Telas",
    items: [
      { id: "telas-auth", label: "Auth (telas)" },
      { id: "telas-settings", label: "Configurações" },
      { id: "telas-onboarding", label: "Onboarding" },
      { id: "telas-crud", label: "CRUD (quarteto)" },
    ],
  },
];

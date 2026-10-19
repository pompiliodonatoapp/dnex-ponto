/**
 * Templates CRUD genéricos (D3a) — o "quarteto" reutilizável por todos os
 * cadastros do hub: lista → detalhe → form → excluir (via ConfirmDialog do DS).
 * Compõem componentes JÁ existentes (DataTable, Sheet/Dialog, DescriptionList,
 * Form, PageHeader, EmptyState/ErrorState). O que muda entre cadastros é o
 * schema (colunas/campos) e as permissões — não o arcabouço.
 */
export { CrudListTemplate } from "./CrudListTemplate";
export type { CrudListTemplateProps } from "./CrudListTemplate";
export { CrudFormTemplate } from "./CrudFormTemplate";
export type {
  CrudFormTemplateProps,
  CrudFormMode,
  CrudFormSurface,
} from "./CrudFormTemplate";
export { CrudDetailTemplate } from "./CrudDetailTemplate";
export type {
  CrudDetailTemplateProps,
  CrudDetailField,
} from "./CrudDetailTemplate";

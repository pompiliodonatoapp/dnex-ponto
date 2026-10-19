/**
 * Telas CRUD aplicadas (D3b) — exemplos concretos que compõem os templates
 * genéricos do quarteto (`src/templates/crud`). Conteúdo é ILUSTRATIVO
 * (sintético, rotulado) — num app real, lista vem do tRPC e mutações chamam o
 * servidor; aqui demonstramos a composição.
 */
export { UsersCrud } from "./UsersCrud";
export type {
  UsersCrudProps,
  UserRow,
  UserRole,
  UserStatus,
} from "./UsersCrud";
export { DepartmentsCrud } from "./DepartmentsCrud";
export type { Department } from "./DepartmentsCrud";
export { CollaboratorsCrud } from "./CollaboratorsCrud";
export type { Collaborator } from "./CollaboratorsCrud";

import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Building2,
  Check,
  Mail,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { PreviewShell } from "./PreviewShell";

type Row = {
  id: number;
  name: string;
  description: string;
  category: string;
  status: "Ativo" | "Convidado";
};
const initialRows: Row[][] = [
  [
    {
      id: 1,
      name: "Marina Alves",
      description: "marina@example.com",
      category: "Administrador",
      status: "Ativo",
    },
    {
      id: 2,
      name: "Rafael Souza",
      description: "rafael@example.com",
      category: "Membro",
      status: "Ativo",
    },
    {
      id: 3,
      name: "Bianca Costa",
      description: "bianca@example.com",
      category: "Visualizador",
      status: "Convidado",
    },
    {
      id: 4,
      name: "Pedro Lima",
      description: "pedro@example.com",
      category: "Membro",
      status: "Ativo",
    },
  ],
  [
    {
      id: 11,
      name: "Lara Oliveira",
      description: "lara@example.com",
      category: "Analista fiscal",
      status: "Ativo",
    },
    {
      id: 12,
      name: "Caio Santos",
      description: "caio@example.com",
      category: "Contador",
      status: "Ativo",
    },
    {
      id: 13,
      name: "Ana Martins",
      description: "ana@example.com",
      category: "Coordenadora",
      status: "Convidado",
    },
  ],
  [
    {
      id: 21,
      name: "Fiscal",
      description: "Obrigações, apuração e documentos",
      category: "Marina Alves",
      status: "Ativo",
    },
    {
      id: 22,
      name: "Contabilidade",
      description: "Fechamento e demonstrações",
      category: "Caio Santos",
      status: "Ativo",
    },
    {
      id: 23,
      name: "Relacionamento",
      description: "Cuidado com o cliente",
      category: "Ana Martins",
      status: "Ativo",
    },
  ],
];
const entities = ["Usuários", "Colaboradores", "Departamentos"];
const singular = ["usuário", "colaborador", "departamento"];
const categories = ["Permissão", "Função", "Responsável"];
const nav = [
  { label: "Usuários", icon: Users },
  { label: "Colaboradores", icon: UserRound },
  { label: "Departamentos", icon: Building2 },
];
const hub = { key: "hub", name: "Hub" };
const blank = (): Row => ({
  id: 0,
  name: "",
  description: "",
  category: "Membro",
  status: "Ativo",
});
const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

/** Quarteto CRUD demonstrativo: listar, detalhar, editar/criar e excluir com confirmação. */
export function ModernCrud() {
  const [entity, setEntity] = useState(0);
  const [collections, setCollections] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [sort, setSort] = useState("Nome A–Z");
  const [modal, setModal] = useState<"form" | "detail" | "delete" | null>(null);
  const [draft, setDraft] = useState<Row>(blank);
  const [notice, setNotice] = useState("");
  const [removed, setRemoved] = useState<{ row: Row; entity: number } | null>(
    null,
  );
  const trigger = useRef<HTMLElement | null>(null);
  const createButton = useRef<HTMLButtonElement | null>(null);
  const nextId = useRef(100);
  const rows = collections[entity]
    .filter(
      (row) =>
        `${row.name} ${row.description} ${row.category}`
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()) &&
        (filter === "Todos" || row.status === filter),
    )
    .sort((a, b) =>
      sort === "Nome A–Z" ? a.name.localeCompare(b.name, "pt-BR") : b.id - a.id,
    );
  const open = (
    kind: "form" | "detail" | "delete",
    row: Row,
    element: HTMLElement,
  ) => {
    trigger.current = element;
    setDraft({ ...row });
    setModal(kind);
  };
  const navigate = (index: number) => {
    setEntity(index);
    setQuery("");
    setFilter("Todos");
    setNotice("");
    setRemoved(null);
  };
  const update = (transform: (rows: Row[]) => Row[]) =>
    setCollections((current) =>
      current.map((items, index) =>
        index === entity ? transform(items) : items,
      ),
    );
  return (
    <div className="ds-crud-showcase">
      <PreviewShell
        product={hub}
        products={[hub]}
        navigation={nav}
        active={entity}
        onNavigate={navigate}
        label="Prévia das telas de CRUD"
      >
        <div className="ds-crud">
          <header className="ds-crud-heading">
            <div>
              <p className="ds-viz-eyebrow">PESSOAS & ORGANIZAÇÃO</p>
              <h3>
                {entity === 2
                  ? "Uma estrutura que conecta."
                  : "Pessoas que fazem acontecer."}
              </h3>
              <p>
                {entity === 2
                  ? "Organize as frentes de trabalho com clareza."
                  : "Um espaço para reunir sua equipe e cuidar dos acessos."}
              </p>
            </div>
            <button
              ref={createButton}
              type="button"
              className="ds-wb-primary"
              onClick={(event) =>
                open(
                  "form",
                  { ...blank(), category: entity === 0 ? "Membro" : "" },
                  event.currentTarget,
                )
              }
            >
              <Plus size={18} />
              {entity === 0
                ? "Convidar usuário"
                : `Adicionar ${singular[entity]}`}
            </button>
          </header>
          <div className="ds-crud-overview">
            <div>
              <span className="ds-crud-overview-icon">
                <Users size={19} />
              </span>
              <p>
                <strong>
                  {collections[entity].length.toString().padStart(2, "0")}
                </strong>
                <span>{entities[entity].toLocaleLowerCase()} no workspace</span>
              </p>
            </div>
            <div>
              <span className="ds-crud-overview-icon ds-crud-green">
                <ShieldCheck size={19} />
              </span>
              <p>
                <strong>
                  {collections[entity]
                    .filter((row) => row.status === "Ativo")
                    .length.toString()
                    .padStart(2, "0")}
                </strong>
                <span>ativos agora</span>
              </p>
            </div>
            <div>
              <span className="ds-crud-overview-icon ds-crud-amber">
                <Mail size={19} />
              </span>
              <p>
                <strong>
                  {collections[entity]
                    .filter((row) => row.status === "Convidado")
                    .length.toString()
                    .padStart(2, "0")}
                </strong>
                <span>convites de exemplo</span>
              </p>
            </div>
          </div>
          {notice && (
            <div className="ds-crud-feedback" role="status">
              <Check size={17} />
              <span>{notice}</span>
              {removed && (
                <button
                  type="button"
                  onClick={() => {
                    const restore = removed;
                    setCollections((current) =>
                      current.map((items, index) =>
                        index === restore.entity
                          ? [...items, restore.row]
                          : items,
                      ),
                    );
                    setRemoved(null);
                    setNotice("Registro restaurado nesta sessão.");
                  }}
                >
                  Desfazer
                </button>
              )}
              <button
                type="button"
                aria-label="Dispensar mensagem"
                onClick={() => setNotice("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          <section
            className="ds-crud-directory"
            aria-label={`Cadastro de ${entities[entity].toLowerCase()}`}
          >
            <div className="ds-crud-toolbar">
              <div>
                <h4>{entities[entity]}</h4>
                <span>{collections[entity].length}</span>
              </div>
              <label>
                <Search size={17} />
                <input
                  aria-label={`Buscar ${entities[entity].toLowerCase()}`}
                  placeholder="Buscar por nome…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
            </div>
            <div className="ds-crud-filters">
              <div aria-label="Filtrar por status">
                {["Todos", "Ativo", "Convidado"].map((value) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={filter === value}
                    onClick={() => setFilter(value)}
                  >
                    {value === "Ativo"
                      ? "Ativos"
                      : value === "Convidado"
                        ? "Convidados"
                        : value}
                  </button>
                ))}
              </div>
              <label>
                <span>Ordenar</span>
                <select
                  aria-label="Ordenar registros"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option>Nome A–Z</option>
                  <option>Mais recentes</option>
                </select>
              </label>
            </div>
            <div className="ds-crud-column-head" aria-hidden="true">
              <span>{entity === 2 ? "Departamento" : "Pessoa"}</span>
              <span>{categories[entity]}</span>
              <span>Status</span>
              <span>Ações</span>
            </div>
            <ul className="ds-crud-rows">
              {rows.map((row) => (
                <li key={row.id} className="ds-crud-row">
                  <button
                    type="button"
                    className="ds-crud-person"
                    aria-label={`Ver detalhes de ${row.name}`}
                    onClick={(event) =>
                      open("detail", row, event.currentTarget)
                    }
                  >
                    <span className="ds-crud-avatar">
                      {entity === 2 ? (
                        <Building2 size={20} />
                      ) : (
                        initials(row.name)
                      )}
                    </span>
                    <span>
                      <strong>{row.name}</strong>
                      <small>{row.description}</small>
                    </span>
                  </button>
                  <span className="ds-crud-role">
                    <small className="ds-crud-mobile-label">
                      {categories[entity]}
                    </small>
                    {row.category}
                  </span>
                  <span
                    className={`ds-crud-status ${row.status === "Ativo" ? "is-active" : "is-invited"}`}
                  >
                    <i />
                    {row.status}
                  </span>
                  <div className="ds-crud-actions">
                    <button
                      type="button"
                      title="Editar"
                      aria-label={`Editar ${row.name}`}
                      onClick={(event) =>
                        open("form", row, event.currentTarget)
                      }
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      title="Excluir"
                      aria-label={`Excluir ${row.name}`}
                      onClick={(event) =>
                        open("delete", row, event.currentTarget)
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {!rows.length && (
              <div className="ds-crud-empty">
                <Search size={26} />
                <h4>Nenhum registro por aqui.</h4>
                <p>Ajuste a busca ou comece com um novo cadastro.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setFilter("Todos");
                  }}
                >
                  Limpar filtros
                </button>
              </div>
            )}
            <footer className="ds-crud-list-footer">
              <span>
                {rows.length} de {collections[entity].length} registros
              </span>
              <span>Dados fictícios · alterações nesta sessão</span>
            </footer>
          </section>
        </div>
        <Dialog.Root
          open={modal !== null}
          onOpenChange={(value) => {
            if (!value) setModal(null);
          }}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="ds-wb-overlay" />
            <Dialog.Content
              className="ds-wb-dialog ds-crud-dialog"
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                if (trigger.current?.isConnected) trigger.current.focus();
                else createButton.current?.focus();
              }}
            >
              <div className="ds-wb-dialog-heading">
                <div>
                  <Dialog.Title>
                    {modal === "delete"
                      ? "Excluir este registro?"
                      : modal === "detail"
                        ? draft.name
                        : draft.id
                          ? `Editar ${singular[entity]}`
                          : `Novo ${singular[entity]}`}
                  </Dialog.Title>
                  <Dialog.Description>
                    {modal === "delete"
                      ? "Você pode desfazer a exclusão nesta sessão."
                      : "Exemplo interativo · nada será enviado ao servidor"}
                  </Dialog.Description>
                </div>
                <Dialog.Close aria-label="Fechar formulário">
                  <X size={21} />
                </Dialog.Close>
              </div>
              {modal === "form" && (
                <form
                  className="ds-crud-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (
                      !draft.name.trim() ||
                      !draft.description.trim() ||
                      !draft.category.trim()
                    )
                      return;
                    const saved = {
                      ...draft,
                      id: draft.id || nextId.current++,
                      name: draft.name.trim(),
                      description: draft.description.trim(),
                      category: draft.category.trim(),
                    };
                    update((items) =>
                      draft.id
                        ? items.map((item) =>
                            item.id === draft.id ? saved : item,
                          )
                        : [...items, saved],
                    );
                    setModal(null);
                    setQuery("");
                    setFilter("Todos");
                    setNotice(
                      draft.id
                        ? "Alterações salvas nesta sessão."
                        : "Registro criado na demonstração. Nenhum convite foi enviado.",
                    );
                    setRemoved(null);
                  }}
                >
                  <label>
                    Nome
                    <input
                      required
                      minLength={2}
                      maxLength={80}
                      value={draft.name}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder={
                        entity === 2 ? "Ex.: Operações" : "Nome completo"
                      }
                    />
                  </label>
                  <label>
                    {entity === 2 ? "Descrição" : "E-mail"}
                    <input
                      required
                      type={entity === 2 ? "text" : "email"}
                      maxLength={150}
                      value={draft.description}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      placeholder={
                        entity === 2
                          ? "Qual o papel deste departamento?"
                          : "pessoa@example.com"
                      }
                    />
                  </label>
                  <label>
                    {categories[entity]}
                    {entity === 0 ? (
                      <select
                        value={draft.category}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            category: event.target.value,
                          }))
                        }
                      >
                        {["Administrador", "Membro", "Visualizador"].map(
                          (option) => (
                            <option key={option}>{option}</option>
                          ),
                        )}
                      </select>
                    ) : (
                      <input
                        required
                        maxLength={80}
                        value={draft.category}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            category: event.target.value,
                          }))
                        }
                      />
                    )}
                  </label>
                  <label>
                    Status
                    <select
                      value={draft.status}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          status: event.target.value as Row["status"],
                        }))
                      }
                    >
                      <option>Ativo</option>
                      <option>Convidado</option>
                    </select>
                  </label>
                  <div className="ds-crud-form-actions">
                    <button type="button" onClick={() => setModal(null)}>
                      Cancelar
                    </button>
                    <button type="submit" className="ds-wb-primary">
                      Salvar {singular[entity]}
                    </button>
                  </div>
                </form>
              )}
              {modal === "detail" && (
                <div className="ds-crud-detail">
                  <span className="ds-crud-avatar">{initials(draft.name)}</span>
                  <dl>
                    <div>
                      <dt>{entity === 2 ? "Descrição" : "E-mail"}</dt>
                      <dd>{draft.description}</dd>
                    </div>
                    <div>
                      <dt>{categories[entity]}</dt>
                      <dd>{draft.category}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>{draft.status}</dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    className="ds-wb-primary"
                    onClick={() => setModal("form")}
                  >
                    <Pencil size={16} />
                    Editar cadastro
                  </button>
                </div>
              )}
              {modal === "delete" && (
                <div className="ds-crud-delete">
                  <span>
                    <Trash2 size={25} />
                  </span>
                  <p>
                    <strong>{draft.name}</strong> será removido apenas desta
                    demonstração.
                  </p>
                  <div className="ds-crud-form-actions">
                    <button type="button" onClick={() => setModal(null)}>
                      Manter registro
                    </button>
                    <button
                      type="button"
                      className="ds-crud-danger"
                      onClick={() => {
                        update((items) =>
                          items.filter((item) => item.id !== draft.id),
                        );
                        setRemoved({ row: draft, entity });
                        setModal(null);
                        setNotice("Registro excluído nesta sessão.");
                      }}
                    >
                      Confirmar exclusão
                    </button>
                  </div>
                </div>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </PreviewShell>
      <p className="ds-crud-caption">
        <ShieldCheck size={15} /> O mesmo shell, do primeiro acesso ao último
        detalhe. CRUD em memória, sem alteração de usuários reais.
      </p>
    </div>
  );
}

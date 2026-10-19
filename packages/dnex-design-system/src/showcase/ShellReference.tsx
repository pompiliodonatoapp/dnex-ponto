import { useState, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

/** A anatomia aponta para a única prévia interativa; não monta um segundo app. */
export function ShellAnatomy() {
  return (
    <div className="ds-shell-reference">
      <div className="ds-shell-reference-heading">
        <div>
          <p className="ds-eyebrow">UMA ESTRUTURA, PAPÉIS CLAROS</p>
          <h3>Cada ação tem o seu lugar.</h3>
        </div>
        <a href="#experiencia">
          Explorar a interface <ArrowUpRight size={16} />
        </a>
      </div>
      <div
        className="ds-shell-anatomy"
        role="img"
        aria-label="Anatomia: faixa de produtos à esquerda, menu contextual ao lado, barra superior sobre a área de trabalho."
      >
        <div className="ds-anatomy-rail">
          <span>01</span>
          <strong>Produtos</strong>
        </div>
        <div className="ds-anatomy-sidebar">
          <span>02</span>
          <strong>Menu do módulo</strong>
          <i />
          <i />
          <i />
        </div>
        <div className="ds-anatomy-topbar">
          <span>03</span>
          <strong>Contexto, ações e perfil</strong>
        </div>
        <div className="ds-anatomy-content">
          <span>04</span>
          <strong>Área de trabalho</strong>
          <p>Informação, decisões e próxima ação.</p>
        </div>
      </div>
      <dl className="ds-shell-roles">
        <div>
          <dt>01 · Produtos</dt>
          <dd>
            Único ponto para trocar entre Fiscal, Contratos e Metas. O produto
            ativo fica destacado.
          </dd>
        </div>
        <div>
          <dt>02 · Menu contextual</dt>
          <dd>
            Empresa e páginas do produto. O menu recolhe de 226 para 72 px,
            mantendo ícones identificados e o botão para expandir. No celular,
            a navegação abre em um painel sobre o conteúdo.
          </dd>
        </div>
        <div>
          <dt>03 · Barra superior</dt>
          <dd>
            Contexto, busca, ajuda, notificações e perfil. Altura de 60 px no
            desktop e 56 px no celular, com alvos de toque de 44 px. O botão
            de menu abre a navegação sem reduzir a largura do conteúdo.
          </dd>
        </div>
        <div>
          <dt>04 · Conteúdo</dt>
          <dd>
            Uma ação principal, indicadores legíveis e registros para continuar
            o trabalho.
          </dd>
        </div>
      </dl>
    </div>
  );
}

/** Exemplos anteriores ficam explícitos e não montam até a abertura deliberada. */
export function PreviousImplementation({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <details
      className="ds-compatibility"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>Consultar componente V1.1 · compatibilidade</summary>
      <p>
        Implementação anterior, mantida para consulta técnica. Não é a
        referência visual da nova prévia, nem significa que os produtos
        publicados já foram migrados.
      </p>
      {open && children}
    </details>
  );
}

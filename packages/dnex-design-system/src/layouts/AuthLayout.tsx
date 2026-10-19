import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../lib/cn";
import { fadeUp, staggerContainer } from "../lib/motion";
import { Logo } from "../components/brand/Logo";

/**
 * AuthLayout — moldura de tela inteira para autenticação e onboarding.
 *
 * Com `aside`: SPLIT full-bleed da V1 (0.82 / 1.18 em ≥ lg) — painel de marca
 * índigo compacto à esquerda e a coluna do formulário sobre superfície sólida.
 * No mobile, só a coluna do formulário (logo no topo).
 *
 * Sem `aside`: card único centralizado, com a atmosfera índigo da landing.
 *
 * Composição (zero valor mágico): tokens de cor/raio/sombra/motion do DS.
 * Acessibilidade: <main> rotulado, foco visível herdado, contraste AA.
 */

export type AuthLayoutProps = {
  /** Conteúdo central — normalmente um <Card>/form da tela. */
  children: ReactNode;
  /** Painel marketing (split). Quando presente, vira 2 colunas full-bleed em ≥ lg. */
  aside?: ReactNode;
  /** Controle de tema no topo direito (ex.: <ThemeSwitcher />). */
  themeToggle?: ReactNode;
  /** Marca custom no cabeçalho mobile. Default: logo DNEX genérica. */
  mobileBrand?: ReactNode;
  /** Links do rodapé (ex.: Termos · Privacidade · Suporte). */
  footerLinks?: ReactNode;
  /** Nota opcional do produto. Nenhuma frase institucional é imposta pelo DS. */
  disclaimer?: ReactNode;
  /** Contexto opcional do form. Não repetir a marca já presente no cabeçalho. */
  topSlot?: ReactNode;
  /** Vitrine/preview: ocupa a altura do contêiner, em vez da viewport. */
  embedded?: boolean;
  /** Largura/composição do conteúdo, por exemplo max-w-2xl para onboarding. */
  contentClassName?: string;
  className?: string;
};

/**
 * Painel marketing default — índigo profundo, full-height, com marca d'água e
 * lista opcional de benefícios. Sobrescrevível (claims passam por compliance).
 */
export function AuthMarketingPanel({
  eyebrow = "Hub DNEX",
  title,
  description,
  benefits,
  children,
  brand,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Lista de benefícios (vira cartões com check). */
  benefits?: ReactNode[];
  children?: ReactNode;
  /** Marca do produto. Default: logo DNEX. */
  brand?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-full min-w-0 flex-col gap-10 bg-[var(--color-indigo-950)] p-8 text-white [overflow-wrap:anywhere] xl:p-12 2xl:p-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, rgba(129,139,246,0.24), transparent 30%)",
        }}
      />

      <div className="relative">
        {brand ?? <Logo height={30} tone="inverse" />}
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={staggerContainer(0.08, 0.06)}
        className="relative mt-auto max-w-sm pb-2"
      >
        <motion.span
          variants={fadeUp}
          className="text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-[var(--color-indigo-300)]"
        >
          {eyebrow}
        </motion.span>
        <motion.h2
          variants={fadeUp}
          className="mt-4 font-display text-[clamp(2.25rem,3.2vw,3.75rem)] font-bold leading-[1.04] tracking-[-0.045em]"
        >
          {title}
        </motion.h2>
        <motion.span variants={fadeUp} className="mt-6 block h-1 w-12 rounded-full bg-[var(--color-amber-500)]" />
        {description && (
          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-xs text-sm leading-relaxed text-[var(--color-indigo-200)]"
          >
            {description}
          </motion.p>
        )}
        {benefits && benefits.length > 0 && (
          <motion.ul variants={fadeUp} className="mt-6 grid gap-2 text-sm text-[var(--color-indigo-100)]">
            {benefits.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </motion.ul>
        )}
        {children}
      </motion.div>
    </div>
  );
}

export function AuthLayout({
  children,
  aside,
  themeToggle,
  mobileBrand,
  footerLinks,
  disclaimer,
  topSlot,
  embedded = false,
  contentClassName,
  className,
}: AuthLayoutProps) {
  const split = aside != null;
  const Content = embedded ? "section" : "main";

  if (split) {
    return (
      <div
        className={cn(
          // Trilhas com mínimo zero: conteúdo longo nunca alarga/estica a tela.
          "dnex-auth-layout grid w-full min-h-0 min-w-0 max-w-full grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] overflow-hidden bg-[var(--bg)] text-fg",
          embedded ? "@[64rem]/dnex-auth:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]" : "lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]",
          embedded ? "h-full" : "h-[100dvh]",
          className,
        )}
      >
        {/* ESQUERDA: painel marketing full-height (≥ lg) */}
        <div className={cn("hidden min-h-0 min-w-0 overflow-y-auto overscroll-y-contain", embedded ? "@[64rem]/dnex-auth:block" : "lg:block")}>{aside}</div>

        {/* DIREITA: coluna do formulário */}
        <div className="relative flex min-h-0 min-w-0 flex-col overflow-hidden bg-[var(--surface)]">
          <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 px-5 py-3 sm:px-10">
            <div className={cn("min-w-0", embedded ? "@[64rem]/dnex-auth:hidden" : "lg:hidden")}>
              {mobileBrand ?? <Logo height={26} />}
            </div>
            {themeToggle && <div className="ml-auto shrink-0 [&_button]:h-11 [&_button]:w-11">{themeToggle}</div>}
          </header>

          <Content
            aria-label="Autenticação"
            className="flex min-h-0 min-w-0 flex-1 flex-col items-center overflow-y-auto overscroll-y-contain px-5 py-6 sm:px-10 sm:py-8"
          >
            <motion.div
              initial="hidden"
              animate="show"
              variants={staggerContainer(0.08, 0.04)}
              className={cn("my-auto w-full min-w-0 max-w-[27rem] shrink-0", contentClassName)}
            >
              {topSlot && (
                <motion.div variants={fadeUp} className="mb-5">
                  {topSlot}
                </motion.div>
              )}
              <motion.div variants={fadeUp}>{children}</motion.div>
            </motion.div>
          </Content>

          {(footerLinks || disclaimer) && (
            <footer className="min-w-0 shrink-0 px-5 py-4 [overflow-wrap:anywhere] sm:px-10">
              <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
                {footerLinks && (
                  <nav
                    aria-label="Links institucionais"
                    className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[0.8rem] text-fg-muted"
                  >
                    {footerLinks}
                  </nav>
                )}
                {disclaimer && (
                  <p className="max-w-sm text-[0.72rem] leading-relaxed text-fg-subtle">
                    {disclaimer}
                  </p>
                )}
              </div>
            </footer>
          )}
        </div>
      </div>
    );
  }

  // Sem split: card único centralizado, atmosfera índigo.
  return (
    <div
      className={cn(
        "dnex-auth-layout relative flex w-full min-h-0 min-w-0 max-w-full flex-col overflow-hidden bg-[var(--bg)] text-fg",
        embedded ? "h-full" : "h-[100dvh]",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 45% at 50% 0%, var(--atmo-1) 0%, transparent 60%)",
        }}
      />
      <header className="relative z-10 flex min-h-16 shrink-0 items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <div className="min-w-0">{mobileBrand ?? <Logo height={26} />}</div>
        {themeToggle && <div className="ml-auto shrink-0 [&_button]:h-11 [&_button]:w-11">{themeToggle}</div>}
      </header>
      <Content
        aria-label="Autenticação"
        className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col items-center overflow-y-auto overscroll-y-contain px-5 py-6 sm:px-8 sm:py-8"
      >
        <motion.div
          initial="hidden"
          animate="show"
          variants={staggerContainer(0.08, 0.04)}
          className={cn("my-auto w-full min-w-0 max-w-md shrink-0", contentClassName)}
        >
          {topSlot && (
            <motion.div variants={fadeUp} className="mb-5">
              {topSlot}
            </motion.div>
          )}
          <motion.div variants={fadeUp}>{children}</motion.div>
        </motion.div>
      </Content>
      {(footerLinks || disclaimer) && <footer className="relative z-10 min-w-0 shrink-0 border-t border-line px-5 py-4 [overflow-wrap:anywhere] sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          {footerLinks && (
            <nav
              aria-label="Links institucionais"
              className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[0.8rem] text-fg-muted"
            >
              {footerLinks}
            </nav>
          )}
          {disclaimer && (
            <p className="max-w-md text-[0.72rem] leading-relaxed text-fg-subtle">
              {disclaimer}
            </p>
          )}
        </div>
      </footer>}
    </div>
  );
}

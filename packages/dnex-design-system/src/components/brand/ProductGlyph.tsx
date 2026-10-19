import type {} from "../../assets/svg-modules.d.ts";

import type { ImgHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

import auroraSrc from "../../assets/products/dnex-aurora.svg";
import consoleSrc from "../../assets/products/dnex-console.svg";
import contratosSrc from "../../assets/products/dnex-contratos.svg";
import crmSrc from "../../assets/products/dnex-crm.svg";
import contabilSrc from "../../assets/products/dnex-contabil.svg";
import fiscalSrc from "../../assets/products/dnex-fiscal.svg";
import folhaSrc from "../../assets/products/dnex-folha.svg";
import gestaoSrc from "../../assets/products/dnex-gestao.svg";
import marketingSrc from "../../assets/products/dnex-marketing.svg";
import portalClienteSrc from "../../assets/products/dnex-portal-cliente.svg";
import xmlSrc from "../../assets/products/dnex-xml.svg";
import nfeSrc from "../../assets/products/dnex-nfe.svg";
import juridicoSrc from "../../assets/products/dnex-juridico.svg";
import incorporadoraSrc from "../../assets/products/dnex-incorporadora.svg";
import gestaoContadorSrc from "../../assets/products/dnex-gestao-contador.svg";
import hubSrc from "../../assets/products/dnex-hub.svg";
import metasSrc from "../../assets/products/dnex-metas.svg";
import normasSrc from "../../assets/products/dnex-normas.svg";
import painelSrc from "../../assets/products/dnex-painel.svg";
import perdcompSrc from "../../assets/products/dnex-perdcomp.svg";
import processosSrc from "../../assets/products/dnex-processos.svg";

export const DNEX_PRODUCT_KEYS = [
  "aurora",
  "contratos",
  "normas",
  "processos",
  "crm",
  "marketing",
  "portal-cliente",
  "metas",
  "fiscal",
  "folha",
  "contabil",
  "perdcomp",
  "gestao-contador",
  "gestao",
  "xml",
  "nfe",
  "juridico",
  "incorporadora",
  "hub",
  "painel",
  "console",
] as const;

export type DnexProductKey = (typeof DNEX_PRODUCT_KEYS)[number];

const PRODUCT_ASSETS: Record<DnexProductKey, string> = {
  aurora: auroraSrc,
  contratos: contratosSrc,
  normas: normasSrc,
  processos: processosSrc,
  crm: crmSrc,
  marketing: marketingSrc,
  "portal-cliente": portalClienteSrc,
  metas: metasSrc,
  fiscal: fiscalSrc,
  folha: folhaSrc,
  contabil: contabilSrc,
  perdcomp: perdcompSrc,
  "gestao-contador": gestaoContadorSrc,
  gestao: gestaoSrc,
  xml: xmlSrc,
  nfe: nfeSrc,
  juridico: juridicoSrc,
  incorporadora: incorporadoraSrc,
  hub: hubSrc,
  painel: painelSrc,
  console: consoleSrc,
};

const LEGACY_PRODUCT_ALIASES: Record<string, DnexProductKey> = {
  gestao360: "hub",
  econte: "fiscal",
  juris: "normas",
  "notas-fiscais": "nfe",
  contador: "gestao-contador",
  "jurídico": "juridico",
};

export function normalizeDnexProductKey(product: string): DnexProductKey {
  const normalized = product.trim().toLocaleLowerCase("pt-BR").replace(/^dnex[-_\s]*/, "");
  if (DNEX_PRODUCT_KEYS.includes(normalized as DnexProductKey)) {
    return normalized as DnexProductKey;
  }
  return LEGACY_PRODUCT_ALIASES[normalized] ?? "hub";
}

export type ProductGlyphProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> & {
  /** Chave estável do produto no catálogo DNEX. */
  product: DnexProductKey | string;
  /** Tamanho quadrado em pixels. Mínimo recomendado: 24 px. */
  size?: number;
  /** Rótulo acessível. Sem rótulo, o glifo é tratado como decorativo. */
  label?: string;
};

/**
 * Glifo oficial de produto DNEX.
 *
 * Use no launcher, sidebar recolhida, favicon/PWA e marca compacta de acesso.
 * Para contextos institucionais ou comerciais com nome, mantenha o lockup
 * horizontal `Logo product="…"`.
 */
export function ProductGlyph({
  product,
  size = 40,
  label,
  className,
  alt,
  ...props
}: ProductGlyphProps) {
  const key = normalizeDnexProductKey(product);
  const accessibleLabel = label ?? alt;

  return (
    <img
      {...props}
      src={PRODUCT_ASSETS[key]}
      width={size}
      height={size}
      alt={accessibleLabel ?? ""}
      aria-hidden={accessibleLabel ? undefined : true}
      className={cn("shrink-0 select-none", className)}
      draggable={false}
    />
  );
}

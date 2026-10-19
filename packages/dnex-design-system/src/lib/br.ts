/**
 * @dnex/ds — utilitários do domínio brasileiro / fiscal (puros e testáveis).
 * -----------------------------------------------------------------------------
 * Funções de MÁSCARA (formatação) e VALIDAÇÃO (dígitos verificadores, data real)
 * sem qualquer dependência externa — algoritmos próprios, para menos acoplamento
 * e mais controle. Reutilizáveis pelos apps do hub (dashboard/fiscal/docs) tanto
 * em formulários (camada Form) quanto em exibição (tabelas, recibos).
 *
 * Convenções:
 * - `mask*`  → recebe entrada suja (com ou sem máscara) e devolve string mascarada
 *              PARCIAL conforme o usuário digita (não força tamanho completo).
 * - `isValid*` → valida o valor COMPLETO (formato + regra de negócio).
 * - `onlyDigits` → remove tudo que não é dígito (base dos campos numéricos).
 * - `normalizeCnpj` → preserva letras do CNPJ alfanumérico e remove a máscara.
 *
 * Números fiscais devem ser exibidos em IBM Plex Mono (assinatura da marca) —
 * a fonte é responsabilidade do componente, não destas funções.
 */

/* ════════════════════════════════════════════════════════════════════════════
   Base
   ════════════════════════════════════════════════════════════════════════════ */

/** Remove tudo que não for dígito (0-9). */
export function onlyDigits(value: string): string {
  return value.replace(/\D+/g, "");
}

/** Verdadeiro se a string (após limpar) for uma sequência repetida (000…, 111…). */
function allSameDigit(digits: string): boolean {
  return digits.length > 0 && /^(\d)\1+$/.test(digits);
}

/* ════════════════════════════════════════════════════════════════════════════
   CPF — máscara 000.000.000-00 + validação de DV
   ════════════════════════════════════════════════════════════════════════════ */

/** Aplica a máscara de CPF progressivamente (até 11 dígitos). */
export function maskCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  let out = d.slice(0, 3);
  if (d.length > 3) out += "." + d.slice(3, 6);
  if (d.length > 6) out += "." + d.slice(6, 9);
  if (d.length > 9) out += "-" + d.slice(9, 11);
  return out;
}

/** Calcula um dígito verificador de CPF para os `len` primeiros dígitos. */
function cpfCheckDigit(digits: string, len: number): number {
  let sum = 0;
  let weight = len + 1;
  for (let i = 0; i < len; i++) {
    sum += Number(digits[i]) * weight;
    weight--;
  }
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
}

/** Valida um CPF (com ou sem máscara): 11 dígitos, não todos iguais, DV correto. */
export function isValidCpf(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 11 || allSameDigit(d)) return false;
  const dv1 = cpfCheckDigit(d, 9);
  const dv2 = cpfCheckDigit(d, 10);
  return dv1 === Number(d[9]) && dv2 === Number(d[10]);
}

/* ════════════════════════════════════════════════════════════════════════════
   CNPJ — 12 caracteres alfanuméricos + 2 DVs numéricos
   ════════════════════════════════════════════════════════════════════════════ */

/**
 * Normaliza CNPJ numérico ou alfanumérico: remove pontuação, converte
 * letras para maiúsculas e limita a 14 caracteres ASCII [A-Z0-9].
 */
export function normalizeCnpj(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 14);
}

/** Aplica a máscara de CNPJ progressivamente (até 14 caracteres). */
export function maskCnpj(value: string): string {
  const cnpj = normalizeCnpj(value);
  let out = cnpj.slice(0, 2);
  if (cnpj.length > 2) out += "." + cnpj.slice(2, 5);
  if (cnpj.length > 5) out += "." + cnpj.slice(5, 8);
  if (cnpj.length > 8) out += "/" + cnpj.slice(8, 12);
  if (cnpj.length > 12) out += "-" + cnpj.slice(12, 14);
  return out;
}

/** Pesos do CNPJ para o 1º DV (12 dígitos) e 2º DV (13 dígitos). */
const CNPJ_WEIGHTS_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_WEIGHTS_2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

/** Converte um caractere conforme a regra oficial: código ASCII menos 48. */
function cnpjCharacterValue(character: string): number {
  return character.charCodeAt(0) - 48;
}

/** Calcula um dígito verificador de CNPJ a partir dos pesos informados. */
function cnpjCheckDigit(characters: string, weights: number[]): number {
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += cnpjCharacterValue(characters[i]!) * weights[i]!;
  }
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

/**
 * Valida CNPJ numérico ou alfanumérico, com ou sem máscara. As 12 primeiras
 * posições aceitam A-Z/0-9 e os dois dígitos verificadores permanecem numéricos.
 */
export function isValidCnpj(value: string): boolean {
  const cnpj = normalizeCnpj(value);
  if (!/^[A-Z0-9]{12}\d{2}$/.test(cnpj)) return false;
  if (/^\d{14}$/.test(cnpj) && allSameDigit(cnpj)) return false;
  const base = cnpj.slice(0, 12);
  const dv1 = cnpjCheckDigit(base, CNPJ_WEIGHTS_1);
  const dv2 = cnpjCheckDigit(`${base}${dv1}`, CNPJ_WEIGHTS_2);
  return dv1 === Number(cnpj[12]) && dv2 === Number(cnpj[13]);
}

/* ════════════════════════════════════════════════════════════════════════════
   CEP — máscara 00000-000
   ════════════════════════════════════════════════════════════════════════════ */

/** Aplica a máscara de CEP progressivamente (até 8 dígitos). */
export function maskCep(value: string): string {
  const d = onlyDigits(value).slice(0, 8);
  if (d.length > 5) return d.slice(0, 5) + "-" + d.slice(5, 8);
  return d;
}

/** Verdadeiro quando o CEP tem os 8 dígitos (apenas formato, sem consultar base). */
export function isCompleteCep(value: string): boolean {
  return onlyDigits(value).length === 8;
}

/* ════════════════════════════════════════════════════════════════════════════
   Telefone — máscara (00) 000000000, padrão DNEX (DDD entre parênteses + espaço,
   sem hífen no número). Aceita celular (9 dígitos após o DDD) e fixo (8 dígitos).
   ════════════════════════════════════════════════════════════════════════════ */

/** Aplica a máscara de telefone progressivamente: "(DD) NNNNNNNNN" (padrão DNEX). */
export function maskTelefone(value: string): string {
  const d = onlyDigits(value).slice(0, 11); // DDD (2) + até 9 dígitos
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  return `(${d.slice(0, 2)}) ${d.slice(2)}`;
}

/** Verdadeiro quando o telefone tem 10 (fixo) ou 11 (celular) dígitos. */
export function isCompleteTelefone(value: string): boolean {
  const len = onlyDigits(value).length;
  return len === 10 || len === 11;
}

/* ════════════════════════════════════════════════════════════════════════════
   BRL — moeda (R$ 1.234,56) ⇄ número
   ════════════════════════════════════════════════════════════════════════════ */

/**
 * Formata um número de REAIS como moeda brasileira: `1234.56` → `"R$ 1.234,56"`.
 * Use `withSymbol: false` para omitir o "R$ " (ex.: alinhar em coluna de tabela).
 */
export function formatBRL(reais: number, withSymbol = true): string {
  const safe = Number.isFinite(reais) ? reais : 0;
  const body = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);
  return withSymbol ? `R$ ${body}` : body;
}

/**
 * Converte CENTAVOS (inteiro) em string mascarada de moeda — é o motor do
 * CurrencyInput, que guarda o valor como centavos enquanto o usuário digita.
 * Ex.: `123456` → `"R$ 1.234,56"`. Aceita negativo.
 */
export function centsToBRL(cents: number, withSymbol = true): string {
  const safe = Number.isFinite(cents) ? Math.trunc(cents) : 0;
  return formatBRL(safe / 100, withSymbol);
}

/**
 * Extrai os CENTAVOS de uma string digitada, lendo apenas os dígitos da direita
 * para a esquerda (comportamento "caixa registradora"): cada tecla numérica
 * empurra o valor uma casa decimal. `"R$ 12,3"` e `"123"` → `123` centavos.
 * Preserva sinal negativo se houver "-" na entrada.
 */
export function parseBRLToCents(value: string): number {
  const negative = value.trim().startsWith("-") || value.includes("-");
  const digits = onlyDigits(value);
  if (!digits) return 0;
  const cents = Number(digits);
  return negative ? -cents : cents;
}

/**
 * Interpreta uma string de moeda como número de REAIS (float): `"R$ 1.234,56"`
 * → `1234.56`. Útil para colar valores já formatados ou ler de fora. Trata
 * separador de milhar "." e decimal ",". Retorna `0` se não houver dígitos.
 */
export function parseBRL(value: string): number {
  const negative = value.trim().startsWith("-");
  const cleaned = onlyDigits(value);
  if (!cleaned) return 0;
  // A string formatada sempre tem 2 casas decimais → últimos 2 dígitos = centavos.
  const reais = Number(cleaned) / 100;
  return negative ? -reais : reais;
}

/* ════════════════════════════════════════════════════════════════════════════
   Percentual — 12,34% ⇄ número
   ════════════════════════════════════════════════════════════════════════════ */

/** Formata um número como percentual pt-BR com `decimals` casas. `12.5` → `"12,50%"`. */
export function formatPercent(value: number, decimals = 2): string {
  const safe = Number.isFinite(value) ? value : 0;
  const body = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safe);
  return `${body}%`;
}

/**
 * Lê o número a partir de uma string de percentual digitada, no estilo "caixa
 * registradora" com `decimals` casas. `"12,34%"` (decimals=2) → `12.34`.
 * Os dígitos preenchem da direita para a esquerda conforme `decimals`.
 */
export function parsePercent(value: string, decimals = 2): number {
  const negative = value.trim().startsWith("-");
  const digits = onlyDigits(value);
  if (!digits) return 0;
  const n = Number(digits) / Math.pow(10, decimals);
  return negative ? -n : n;
}

/** Limita `n` ao intervalo [min, max] (qualquer um pode ser undefined). */
export function clamp(n: number, min?: number, max?: number): number {
  let out = n;
  if (typeof min === "number" && out < min) out = min;
  if (typeof max === "number" && out > max) out = max;
  return out;
}

/* ════════════════════════════════════════════════════════════════════════════
   Data BR — máscara dd/mm/aaaa + validação de data real
   ════════════════════════════════════════════════════════════════════════════ */

/** Aplica a máscara de data brasileira progressivamente (até 8 dígitos). */
export function maskDateBR(value: string): string {
  const d = onlyDigits(value).slice(0, 8);
  let out = d.slice(0, 2);
  if (d.length > 2) out += "/" + d.slice(2, 4);
  if (d.length > 4) out += "/" + d.slice(4, 8);
  return out;
}

/**
 * Valida uma data no formato dd/mm/aaaa como data REAL do calendário
 * (rejeita 31/02, 30/02, mês 13, dia 00 etc.). Ano com 4 dígitos.
 */
export function isValidDateBR(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 8) return false;
  const day = Number(d.slice(0, 2));
  const month = Number(d.slice(2, 4));
  const year = Number(d.slice(4, 8));
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1) return false;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/** Converte `dd/mm/aaaa` válida em `Date` (meia-noite local). `null` se inválida. */
export function parseDateBR(value: string): Date | null {
  if (!isValidDateBR(value)) return null;
  const d = onlyDigits(value);
  const day = Number(d.slice(0, 2));
  const month = Number(d.slice(2, 4));
  const year = Number(d.slice(4, 8));
  return new Date(year, month - 1, day);
}

/** Formata um `Date` como `dd/mm/aaaa` (string vazia se inválido). */
export function formatDateBR(date: Date | undefined | null): string {
  if (!date || Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).padStart(4, "0");
  return `${day}/${month}/${year}`;
}

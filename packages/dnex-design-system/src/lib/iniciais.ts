/**
 * Iniciais de reserva para item sem ícone. Mesma solução que a barra superior já usa para a
 * navegação global — o padrão da casa é degradar para texto legível, nunca para vazio.
 *
 * Vive fora do JSX (src/lib) por dois motivos:
 * - é testável com `node --test --experimental-strip-types`, sem React nem DOM;
 * - a implementação é segura sob `noUncheckedIndexedAccess`. Consumidores da biblioteca
 *   (ex.: dnex-normas) ligam essa flag e acusavam TS2532 ×5 na versão anterior
 *   (`palavras[0].slice(...)`, `palavras[0][0] + palavras[1][0]`); o tsconfig do DS não liga
 *   a flag, por isso o kit não denunciava o defeito.
 */
export function iniciais(rotulo: string): string {
  const palavras = rotulo.trim().split(/\s+/).filter(Boolean);
  const [a, b] = palavras;
  if (!a) return "•";
  if (!b) return a.slice(0, 2).toUpperCase();
  return (a.charAt(0) + b.charAt(0)).toUpperCase();
}

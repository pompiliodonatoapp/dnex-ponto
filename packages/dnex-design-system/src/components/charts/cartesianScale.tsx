import { ReferenceLine } from "recharts";
import type { ChartTheme } from "./chartTheme";

/**
 * Contrato de escala compartilhado pelos gráficos cartesianos do DS
 * (LineChartDnex, BarChartDnex, AreaChartDnex).
 *
 * Regra do DS para gráficos: "escala fixa e honesta onde a comparação importa".
 * Quando a métrica tem limite natural — percentual 0–100, nota 0–10, índice
 * 0–1 — fixe `yDomain` (e, de preferência, `yTicks`). Sem isso o Recharts usa
 * `[0, 'auto']`: o teto do eixo vira o maior valor arredondado, uma série que
 * oscila entre 45 % e 52 % encosta no topo e parece meta batida, e dois cartões
 * vizinhos ganham eixos diferentes, deixando de ser comparáveis. Deixe o eixo
 * automático apenas para grandezas abertas (moeda, contagens), em que a
 * amplitude dos próprios dados é a informação.
 */
export type YDomainEdge = number | "auto";
export type YDomain = [YDomainEdge, YDomainEdge];

export type ReferenceLineTone = "muted" | "action" | "success" | "warning";

export type ReferenceLineSpec = {
  /** Valor no eixo Y onde a linha é traçada (ex.: 100 para "Meta"). */
  y: number;
  /** Rótulo curto exibido junto à linha (ex.: "Meta", "Mínimo legal"). */
  label?: string;
  /** Cor resolvida pelos tokens de `useChartTheme().reference`. Default: `muted`. */
  tone?: ReferenceLineTone;
};

export type CartesianScaleProps = {
  /**
   * Domínio explícito do eixo Y, repassado ao `YAxis` do Recharts com
   * `allowDataOverflow={false}`: se um dado extrapolar o domínio, o eixo se
   * estende em vez de cortar a série. Default: comportamento atual
   * (`[0, 'auto']`).
   */
  yDomain?: YDomain;
  /**
   * Ticks explícitos do eixo Y, ex.: `[0, 25, 50, 75, 100]`. Default: automático.
   * Nota: o Recharts estende o domínio para cobrir ticks explícitos, mas
   * `yDomain` continua sendo o contrato — é ele que segura o eixo quando os
   * ticks são automáticos e o que documenta a intenção de escala fixa.
   * Atenção: com ticks explícitos, um dado ACIMA do último tick estende o eixo
   * mas o excedente fica sem rótulo; se a série puder ultrapassar 100 %, inclua
   * um tick acima (ex.: 125) ou omita `yTicks`.
   */
  yTicks?: number[];
  /**
   * Linhas de referência horizontais tracejadas (meta, limite). Fora do
   * domínio, o eixo se estende para incluí-las (`ifOverflow="extendDomain"`) —
   * uma meta nunca some em silêncio.
   */
  referenceLines?: ReferenceLineSpec[];
};

/** Props do `YAxis` derivadas do contrato de escala (vazio = comportamento atual). */
export function yAxisScaleProps({ yDomain, yTicks }: CartesianScaleProps) {
  return {
    // Id explícito (ver referenceLineElements): a ReferenceLine referencia este eixo.
    yAxisId: 0,
    ...(yDomain ? { domain: yDomain, allowDataOverflow: false } : {}),
    ...(yTicks ? { ticks: yTicks } : {}),
  };
}

/**
 * Elementos `<ReferenceLine>` prontos para entrar como filhos diretos do
 * gráfico. Devolve um array (nunca um Fragment): o Recharts inspeciona os
 * filhos por tipo e ignora o que estiver embrulhado — ver donut-chart.test.ts.
 */
export function referenceLineElements(lines: ReferenceLineSpec[] | undefined, t: ChartTheme) {
  if (!lines || lines.length === 0) return null;
  return lines.map((line, i) => {
    const stroke = t.reference[line.tone ?? "muted"];
    return (
      <ReferenceLine
        key={`${line.y}-${i}`}
        // Ids EXPLÍCITOS: o React 19 (jsx-runtime) ignora `defaultProps` e o
        // Recharts 2.15 resolve o eixo pelo id padrão — sem eles a linha não
        // acha o YAxis, não estende o domínio e some fora do gráfico.
        xAxisId={0}
        yAxisId={0}
        y={line.y}
        stroke={stroke}
        strokeDasharray="4 4"
        strokeWidth={1}
        ifOverflow="extendDomain"
        label={
          line.label
            ? {
                value: line.label,
                // Numa linha (caixa de altura zero) "insideTop*" ancora o texto
                // ABAIXO do traço — uma meta no teto do domínio não é cortada.
                position: "insideTopRight",
                fill: stroke,
                fontSize: 11,
                fontFamily: t.fontMono,
              }
            : undefined
        }
      />
    );
  });
}

/** Validação de rascunho; não define formato de persistência nem calcula jornadas. */
export interface ParDeHorarios {
  entrada: string;
  saida: string;
}

export interface RascunhoDeAjuste {
  data: string;
  motivo: string;
  horarios: ParDeHorarios[];
}

export interface ErroDeAjuste {
  campo: "data" | "motivo" | "horarios" | `horarios.${number}.entrada` | `horarios.${number}.saida`;
  mensagem: string;
}

function dataValida(data: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  if (!match) return false;
  const ano = Number(match[1]);
  const mes = Number(match[2]);
  const dia = Number(match[3]);
  if (ano === 0 || mes < 1 || mes > 12) return false;
  const bissexto = ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0);
  const dias = [31, bissexto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return dia >= 1 && dia <= dias[mes - 1];
}

function horaValida(hora: string): boolean {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(hora);
}

/** Aceita batida isolada: um ajuste pode corrigir somente uma entrada ou saída. */
export function validarRascunhoDeAjuste(rascunho: RascunhoDeAjuste): ErroDeAjuste[] {
  const erros: ErroDeAjuste[] = [];
  if (!dataValida(rascunho.data)) erros.push({ campo: "data", mensagem: "Informe uma data válida." });
  if (!rascunho.motivo.trim()) erros.push({ campo: "motivo", mensagem: "Informe o motivo." });
  if (rascunho.horarios.length > 4) erros.push({ campo: "horarios", mensagem: "Informe no máximo quatro pares de horários." });
  if (!rascunho.horarios.some((par) => par.entrada.trim() || par.saida.trim())) {
    erros.push({ campo: "horarios", mensagem: "Informe ao menos um horário." });
  }
  rascunho.horarios.forEach((par, indice) => {
    for (const campo of ["entrada", "saida"] as const) {
      if (par[campo] && !horaValida(par[campo])) {
        erros.push({ campo: `horarios.${indice}.${campo}`, mensagem: "Informe um horário válido no formato HH:mm." });
      }
    }
  });
  return erros;
}

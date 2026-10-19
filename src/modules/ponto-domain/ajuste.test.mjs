import test from 'node:test';
import assert from 'node:assert/strict';
import { validarRascunhoDeAjuste } from './ajuste.ts';

const base = { data: '2026-10-14', motivo: 'Correção', horarios: [{ entrada: '08:00', saida: '12:00' }] };
const campos = (input) => validarRascunhoDeAjuste(input).map((erro) => erro.campo);

test('aceita quatro pares e uma batida isolada', () => {
  assert.deepEqual(campos({ ...base, horarios: [base.horarios[0], { entrada: '13:00', saida: '17:00' }, { entrada: '18:00', saida: '19:00' }, { entrada: '20:00', saida: '' }] }), []);
  assert.deepEqual(campos({ ...base, horarios: [{ entrada: '', saida: '17:00' }] }), []);
});

test('exige motivo não vazio e pelo menos uma batida', () => {
  assert.deepEqual(campos({ ...base, motivo: '  ', horarios: [{ entrada: '', saida: '' }] }), ['motivo', 'horarios']);
  assert.deepEqual(campos({ ...base, horarios: [] }), ['horarios']);
});

test('rejeita mais de quatro pares e horários inválidos com campo identificado', () => {
  assert.ok(campos({ ...base, horarios: Array(5).fill(base.horarios[0]) }).includes('horarios'));
  assert.deepEqual(campos({ ...base, horarios: [{ entrada: '24:00', saida: '12:60' }] }), ['horarios.0.entrada', 'horarios.0.saida']);
});

test('valida datas reais e anos bissextos', () => {
  assert.deepEqual(campos({ ...base, data: '2024-02-29' }), []);
  for (const data of ['2023-02-29', '1900-02-29', '2026-04-31', '2026-13-01', '0000-01-01', '14/10/2026']) {
    assert.ok(campos({ ...base, data }).includes('data'), data);
  }
});

test('não presume que a saída no dia seguinte seja inválida', () => {
  assert.deepEqual(campos({ ...base, horarios: [{ entrada: '22:00', saida: '06:00' }] }), []);
});

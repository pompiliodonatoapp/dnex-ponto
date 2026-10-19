export type ClockType = 'clock_in' | 'break_start' | 'break_end' | 'clock_out';
export interface PontoContext { userId: string; accountId: string; employeeId: string; timeZone:string; permissions: string[]; serverTime: string }
export interface ClockReceipt { clockId: string | null; origin?:'clock'|'adjustment'; idempotencyKey?: string; requestId?:string; timestampUtc: string; type: ClockType }
export interface Mirror { timeZone:string; clocks: ClockReceipt[]; effectiveClocks?: ClockReceipt[]; adjustments: Adjustment[] }
export class PontoApiError extends Error {
  status: number; code: string;
  constructor(status: number, code: string) { super(status === 401 ? 'Sua sessão expirou. Entre novamente pelo Hub.' : status === 403 ? 'Seu acesso ao Ponto não está autorizado para esta empresa.' : status === 409 ? 'A operação conflitou com um registro existente. Atualize a tela.' : 'Não foi possível confirmar a operação. Tente novamente.'); this.status=status; this.code=code; }
}
export interface Adjustment { requestId:string; employeeId:string; targetDate:string; status:'pending'|'approved'|'rejected'; reason:string; punches:Array<{timestampUtc:string;type:ClockType}> | null }
export interface AdjustmentInput {mode:'replace_day';idempotencyKey:string;targetDate:string;reason:string;punches:Array<{timestampUtc:string;type:ClockType}>}
export interface PontoApi {
  context(): Promise<PontoContext>;
  adjustments(): Promise<{adjustments:Adjustment[]}>;
  requestAdjustment(input:AdjustmentInput): Promise<{requestId:string;status:string}>;
  decide(requestId:string,input:{decision:'approved'|'rejected';reason:string}):Promise<{requestId:string;status:string}>;
  clock(body: { idempotencyKey: string; type: ClockType }): Promise<{status: string; receipt: ClockReceipt}>;
  mirror(from: string, to: string): Promise<Mirror>;
}
export function createPontoApi(accountId: string, getAccessToken: () => Promise<string | null>, fetcher: typeof fetch = fetch): PontoApi {
  async function request<T>(path: string, body?: unknown): Promise<T> {
    const token = await getAccessToken();
    if (!token) throw new PontoApiError(401, 'AUTH_REQUIRED');
    const response = await fetcher(`/api/gestao/v1/ponto/${path}`, {
      method: body === undefined ? 'GET' : 'POST', cache: 'no-store', credentials: 'same-origin',
      headers: { Authorization: `Bearer ${token}`, 'X-DNEX-Account-Id': accountId, ...(body === undefined ? {} : {'Content-Type':'application/json'}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new PontoApiError(response.status, payload?.code ?? 'PONTO_UNAVAILABLE');
    if (!payload || typeof payload !== 'object') throw new PontoApiError(503, 'PONTO_UNAVAILABLE');
    return payload;
  }
  return { adjustments:()=>request('adjustments'), requestAdjustment:input=>request('adjustments',input), decide:(id,input)=>request('adjustments/'+encodeURIComponent(id)+'/decision',input), context: () => request('context'), clock: body => request('clock', body), mirror: (from,to) => request(`mirror?${new URLSearchParams({from,to})}`) };
}
export const clockLabels: Record<ClockType,string> = {clock_in:'Entrada', break_start:'Início do intervalo', break_end:'Retorno do intervalo', clock_out:'Saída'};
export function formatCivilDate(value: string) { const [year,month,day] = value.split('-'); return `${day}/${month}/${year}`; }
export function localDateValue(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }

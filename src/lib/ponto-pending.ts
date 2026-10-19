/** Pending commands are scoped to the verified identity. No token and no automatic replay. */
export function pendingKey(scope:string,kind:'clock'|'adjustment') {return `dnex-ponto-pending-v1:${scope}:${kind}`;}
export function readPending<T>(key:string,storage:Storage=localStorage):T|null {const raw=storage.getItem(key);if(!raw)return null;try{return JSON.parse(raw) as T;}catch{throw new Error('Há uma tentativa local inválida. Procure o suporte antes de registrar novamente.');}}
export function writePending<T>(key:string,value:T,storage:Storage=localStorage) {storage.setItem(key,JSON.stringify(value));}
export function clearPending(key:string,storage:Storage=localStorage) {storage.removeItem(key);}
export async function commandFingerprint(command:unknown):Promise<string> {
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(command)));
  return Array.from(new Uint8Array(digest),value=>value.toString(16).padStart(2,'0')).join('');
}

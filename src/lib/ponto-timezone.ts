function partsAt(date:Date,timeZone:string) {
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date);
  const get=(type:string)=>parts.find(part=>part.type===type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}
/** Convert a wall time in the verified company zone. Reject gaps and ambiguous DST times. */
export function zonedTimeToUtc(wall:string,timeZone:string):string {
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(wall))throw new Error('Informe data e hora completas.');
  const target=Date.parse(wall+'Z');
  if(!Number.isFinite(target)||new Date(target).toISOString().slice(0,16)!==wall)throw new Error('Data ou hora inválida.');
  const offsets=new Set<number>();
  for(const hours of [-36,0,36]){const sample=target+hours*3600000;offsets.add(Date.parse(partsAt(new Date(sample),timeZone)+'Z')-sample);}
  const matches=[...offsets].map(offset=>target-offset).filter(candidate=>partsAt(new Date(candidate),timeZone)===wall);
  if(matches.length!==1)throw new Error('Horário inexistente ou ambíguo no fuso da empresa. Solicite orientação ao gestor.');
  return new Date(matches[0]).toISOString();
}
export function civilDateInZone(date:Date,timeZone:string):string{return partsAt(date,timeZone).slice(0,10);}

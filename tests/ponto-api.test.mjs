import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createPontoApi,PontoApiError} from '../src/lib/ponto-api.ts';
const response=(body,status=200)=>new Response(JSON.stringify(body),{status});
test('missing session fails closed before any network call',async()=>{
 let called=false;const api=createPontoApi('company',async()=>null,async()=>{called=true;});
 await assert.rejects(()=>api.context(),e=>e instanceof PontoApiError&&e.status===401);assert.equal(called,false);
});
test('token refreshed for every operation and account remains selection header',async()=>{
 let token=0;const calls=[];const api=createPontoApi('selected',async()=>`token-${++token}`,async(url,init)=>{calls.push({url,init});return response({clocks:[],adjustments:[]});});
 await api.context();await api.mirror('2026-10-01','2026-10-31');assert.equal(calls[0].init.headers.Authorization,'Bearer token-1');assert.equal(calls[1].init.headers.Authorization,'Bearer token-2');assert.equal(calls[1].init.headers['X-DNEX-Account-Id'],'selected');assert.equal(calls[1].init.cache,'no-store');assert.match(calls[1].url,/from=2026-10-01&to=2026-10-31$/);
});
test('clock only sends operation identity and type, with retry key preserved',async()=>{
 const bodies=[];const api=createPontoApi('selected',async()=>'token',async(url,init)=>{bodies.push(JSON.parse(init.body));return response({status:'duplicate',receipt:{clockId:'id',timestampUtc:'2026-10-18T12:00:00.000Z',type:'clock_in'}});});
 const command={idempotencyKey:'retry-key',type:'clock_in'};await api.clock(command);await api.clock(command);assert.deepEqual(bodies,[command,command]);assert.equal('employeeId' in bodies[0],false);assert.equal('timestampUtc' in bodies[0],false);
});
test('unauthorized and conflict responses are never reported as success',async()=>{
 for(const status of [401,403,409,503]){const api=createPontoApi('company',async()=>'token',async()=>response({code:'DENIED'},status));await assert.rejects(()=>api.clock({idempotencyKey:'key',type:'clock_out'}),e=>e.status===status);}
});
test('adjustment and decision use authenticated routes and preserve dates',async()=>{
 const calls=[];const api=createPontoApi('company',async()=>'token',async(url,init)=>{calls.push({url,init});return response({requestId:'a',status:'pending'});});
 const input={mode:'replace_day',idempotencyKey:'adjustment-key',targetDate:'2026-10-18',reason:'Correção',punches:[{timestampUtc:'2026-10-18T12:00:00.000Z',type:'clock_in'}]};await api.requestAdjustment(input);await api.decide('a/b',{decision:'rejected',reason:'Revisar'});assert.deepEqual(JSON.parse(calls[0].init.body),input);assert.match(calls[1].url,/adjustments\/a%2Fb\/decision$/);
});
test('legacy worker has no replay/cache handlers and never touches IDB',async()=>{
 const handlers={};const deleted=[];let claimed=false;const context={self:{addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{claimed=true;}}},caches:{keys:async()=>['dnex-ponto-v2','other-product'],delete:async key=>deleted.push(key)}};
 vm.runInNewContext(readFileSync(new URL('../public/sw.js',import.meta.url),'utf8'),context);
 assert.deepEqual(Object.keys(handlers).sort(),['activate','install']);let pending;handlers.activate({waitUntil:p=>pending=p});await pending;assert.deepEqual(deleted,['dnex-ponto-v2']);assert.equal(claimed,true);
});
import {zonedTimeToUtc,civilDateInZone} from '../src/lib/ponto-timezone.ts';
import {pendingKey,readPending,writePending,clearPending,commandFingerprint} from '../src/lib/ponto-pending.ts';
test('company timezone maps Brazilian wall time independently of machine zone',()=>{
 assert.equal(zonedTimeToUtc('2026-10-18T08:00','America/Sao_Paulo'),'2026-10-18T11:00:00.000Z');
 assert.equal(civilDateInZone(new Date('2026-10-19T02:59:00.000Z'),'America/Sao_Paulo'),'2026-10-18');
 assert.equal(zonedTimeToUtc('2026-10-18T23:30','America/Sao_Paulo'),'2026-10-19T02:30:00.000Z');
});
test('timezone conversion rejects invalid civil dates, DST gaps and ambiguity',()=>{
 assert.throws(()=>zonedTimeToUtc('2026-02-30T08:00','America/Sao_Paulo'));
 assert.throws(()=>zonedTimeToUtc('2026-03-08T02:30','America/New_York'));
 assert.throws(()=>zonedTimeToUtc('2026-11-01T01:30','America/New_York'));
});
test('pending operation survives navigation, isolates account, and fingerprint contains no reason',async()=>{
 const values=new Map();const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
 const a=pendingKey('user:accountA:employee','adjustment'),b=pendingKey('user:accountB:employee','adjustment');
 const command={reason:'sensitive reason',punches:[]};const pending={idempotencyKey:'key',fingerprint:await commandFingerprint(command)};writePending(a,pending,storage);assert.deepEqual(readPending(a,storage),pending);assert.equal(readPending(b,storage),null);assert(!values.get(a).includes(command.reason));assert.notEqual(await commandFingerprint({...command,reason:'other'}),pending.fingerprint);clearPending(a,storage);assert.equal(readPending(a,storage),null);
});

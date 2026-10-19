import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
const here=path.dirname(fileURLToPath(import.meta.url));
const require=createRequire(new URL('../package.json',import.meta.url));
const {build,preview}=await import(pathToFileURL(require.resolve('vite')));
const tw=(await import(pathToFileURL(require.resolve('@tailwindcss/vite')))).default;
const out=process.env.DNEX_ACTION_ARTIFACTS || path.resolve(here,'../../../../../inbox/mobile-ds-20261008/kit-action-link-focal');
const baseline=process.env.DNEX_ACTION_BASELINE==='1';
const manifest=process.env.DNEX_FONT_MANIFEST ? JSON.parse(await fs.readFile(process.env.DNEX_FONT_MANIFEST,'utf8')) : null;
if(process.env.DNEX_ACTION_FINAL==='1')assert(manifest,'Final validation requires the official cached fonts');
if(manifest)for(const e of manifest.entries)assert.equal(createHash('sha256').update(await fs.readFile(e.file)).digest('hex'),e.sha256);
await fs.mkdir(out,{recursive:true});
const rows=[],errors=[],external=[];
let browser,server;
// Composite computed CSS backgrounds from the painted ancestor stack. Alpha
// foregrounds are composited too; opaque page backing is verified by the fixture.
async function contrast(locator,kind,state,paint='color'){return locator.evaluate((el,{kind,state,paint})=>{
 const rgba=s=>{const n=s.match(/[\d.]+/g)?.map(Number) || [];return [n[0]||0,n[1]||0,n[2]||0,n.length>3?n[3]:1]};
 const over=(a,b)=>[...a.slice(0,3).map((v,i)=>v*a[3]+b[i]*(1-a[3])),1];
 const chain=[];for(let node=el;node;node=node.parentElement)chain.unshift(node);
 let bg=[255,255,255,1];for(const node of chain)bg=over(rgba(getComputedStyle(node).backgroundColor),bg);
 const style=getComputedStyle(el),paintStyle=paint==='indicator'?getComputedStyle(el,'::after'):style,foreground=paint==='indicator'?paintStyle.backgroundColor:paint==='outline'?style.outlineColor:style.color,fg=over(rgba(foreground),bg),lum=a=>a.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
 const x=lum(fg),y=lum(bg),ratio=(Math.max(x,y)+.05)/(Math.min(x,y)+.05);
 return {kind,state,text:el.textContent,color:foreground,background:bg,ratio,threshold:kind==='text'?4.5:3,paint,paintOpacity:paintStyle.opacity,outlineWidth:style.outlineWidth,fontSize:style.fontSize,focusVisible:el.matches(':focus-visible'),outline:style.outlineStyle,shadow:style.boxShadow};
 },{kind,state,paint});}
async function settled(page){await page.evaluate(async()=>{await Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})));});}
try{
 await build({configFile:false,envDir:false,root:path.join(here,'action-link-fixture'),plugins:[{name:'official-font-cache',transformIndexHtml:html=>manifest?html.replace('</head>',`<link rel="stylesheet" href="${manifest.entries.find(e=>e.contentType.includes('css')).url}"></head>`):html},tw()],esbuild:{jsx:'automatic'},build:{outDir:out+'/production',emptyOutDir:true}});
 server=await preview({configFile:false,envDir:false,build:{outDir:out+'/production'},preview:{host:'127.0.0.1',port:0}});
 const origin='http://127.0.0.1:'+server.httpServer.address().port;
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,1440])for(const theme of ['light','dark']){
  const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  await ctx.route('**/*',async r=>{const u=r.request().url(),e=manifest?.entries.find(e=>e.url===u);if(e)return r.fulfill({body:await fs.readFile(e.file),contentType:e.contentType,headers:{'Access-Control-Allow-Origin':'*'}});if(new URL(u).origin===origin)return r.continue();external.push(u);return r.abort();});
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(origin);await page.locator('html').evaluate((el,t)=>el.dataset.theme=t,theme);
  const fonts=manifest?await page.evaluate(async()=>{const rows=[];for(const [f,weights]of[['Space Grotesk',['600','700']],['Plus Jakarta Sans',['400','500','600','700','800']],['IBM Plex Mono',['500','600','700']]])for(const w of weights){const a=await document.fonts.load(`${w} 16px "${f}"`);rows.push({family:f,weight:w,decoded:a.length,check:document.fonts.check(`${w} 16px "${f}"`)});}await document.fonts.ready;return rows;}):[];
  if(manifest)assert(fonts.every(f=>f.decoded>0&&f.check));
  const measurements=[];
  const targets=[page.getByRole('button',{name:'Esqueci a senha',exact:true}),page.getByRole('link',{name:'Ajuda de autenticação'}),page.getByRole('button',{name:'Abrir detalhes',exact:true}),page.getByRole('link',{name:'Ir ao destino'})];
  for(const target of targets){await page.mouse.move(0,0);await settled(page);measurements.push(await contrast(target,'text','normal'));await target.hover();await settled(page);measurements.push(await contrast(target,'text','hover'));await target.focus();await page.keyboard.press('Shift');await settled(page);const m=await contrast(target,'text','focus');assert(m.focusVisible,'Keyboard focus must remain visible');assert(m.outline!=='none'||m.shadow!=='none','Focus indicator required');measurements.push(m);}
  measurements.push(await contrast(page.getByText('Ações disponíveis',{exact:true}),'text','eyebrow'));
  measurements.push(await contrast(page.getByTestId('section-icon'),'icon','tinted-section'));
  assert(await page.getByRole('button',{name:'Ação bloqueada',exact:true}).isDisabled());assert(await page.getByRole('button',{name:'Carregando',exact:true}).isDisabled());assert.equal(await page.getByRole('button',{name:'Carregando',exact:true}).getAttribute('aria-busy'),'true');
  await targets[0].focus();await targets[0].press('Enter');await targets[2].focus();await targets[2].press('Enter');assert.equal(await page.getByTestId('calls').textContent(),'2');assert.equal(await targets[1].getAttribute('href'),'#destino');assert.equal(await targets[3].getAttribute('href'),'#destino');
  const scope=page.getByRole('button',{name:'Meus',exact:true});await scope.hover();await settled(page);measurements.push(await contrast(scope,'text','pipeline-scope-hover'));await scope.click();assert.equal(await page.getByTestId('scope').textContent(),'mine');assert.equal(await scope.getAttribute('aria-pressed'),'true');measurements.push(await contrast(scope,'text','pipeline-scope-selected'));const indicator=await contrast(scope,'indicator','pipeline-selected-indicator','indicator');assert.equal(indicator.paintOpacity,'1','Selected indicator must be painted');measurements.push(indicator);await scope.focus();await page.keyboard.press('Shift');const ring=await contrast(scope,'indicator','pipeline-keyboard-ring','outline');assert(ring.focusVisible&&parseFloat(ring.outlineWidth)>=2,'Pipeline focus ring must be visible');measurements.push(ring);
  const primary=await page.getByTestId('primary').evaluate(el=>({bg:getComputedStyle(el).backgroundColor,token:getComputedStyle(el).getPropertyValue('--action').trim()}));assert.equal(primary.bg,'rgb(79, 70, 229)','Filled action background must stay unchanged');assert.equal(primary.token,'#4f46e5');
  const trigger=page.getByRole('button',{name:'Notificações, 1 não lidas'});await trigger.hover();await settled(page);measurements.push(await contrast(trigger.locator('svg').first(),'icon','notification-trigger-hover'));await trigger.click();
  const read=page.getByRole('button',{name:'Marcar todas',exact:true});await read.waitFor();await settled(page);measurements.push(await contrast(read,'text','notification-normal'));await read.hover();await settled(page);measurements.push(await contrast(read,'text','notification-hover'));await read.focus();await page.keyboard.press('Shift');measurements.push(await contrast(read,'text','notification-focus'));await read.press('Enter');assert.equal(await page.getByTestId('reads').textContent(),'1');await page.keyboard.press('Escape');await trigger.waitFor();await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='Notificações, 1 não lidas');assert.equal(await trigger.evaluate(el=>document.activeElement===el),true,'Popover must restore trigger focus');
  await page.mouse.move(0,0);await settled(page);await page.screenshot({path:out+'/'+width+'-'+theme+'.png',fullPage:true});await page.evaluate(()=>window.scrollTo(99999,0));assert.equal(await page.evaluate(()=>window.scrollX),0);
  rows.push({width,theme,fonts,measurements,callbackCount:2,readAllOnce:true,disabledAndLoading:true,asChildAnchorPreserved:true,focusRestored:true,actionBackground:primary.bg});
  if(!baseline)for(const m of measurements)assert(m.ratio>=m.threshold,`${width}/${theme}/${m.state}/${m.text}: ${m.ratio}<${m.threshold}`);
  await ctx.close();
 }
 assert.equal(errors.length,0);assert.equal(external.length,0);
}finally{await browser?.close();await server?.httpServer.close();await fs.writeFile(out+'/report.json',JSON.stringify({baseline,rows,errors,external},null,2));}
console.log(JSON.stringify({cases:rows.length,baseline,measurements:rows.reduce((n,r)=>n+r.measurements.length,0),minRatio:Math.min(...rows.flatMap(r=>r.measurements.map(m=>m.ratio))),errors:errors.length,external:external.length}));
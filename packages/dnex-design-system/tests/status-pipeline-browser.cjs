const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const {mkdirSync,writeFileSync}=require('node:fs');
const {resolve}=require('node:path');
const base=process.env.DS_PREVIEW_URL || 'http://127.0.0.1:5197';
assert.match(base,/^http:\/\/127\.0\.0\.1:\d+$/);
const output='/tmp/dnex-ds-status-pipeline';
async function main(){
  mkdirSync(output,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true});
  const report={cases:[],errors:[]};
  try{
    for(const width of [320,390,768,1440]) for(const theme of ['light','dark']){
      const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:width<768?2:1,colorScheme:theme,reducedMotion:'reduce',isMobile:width<768,hasTouch:width<768});
      const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
      await page.addInitScript(theme=>localStorage.setItem('dnex-showcase-theme',theme),theme);
      await page.goto(base+'/#graficos');
      const chart=page.locator('#status-pipeline .dnex-status-pipeline');
      await chart.waitFor();await chart.scrollIntoViewIfNeeded();await page.evaluate(()=>document.fonts.ready);
      const measures=await page.evaluate(()=>{
        scrollTo(99999,scrollY);
        const root=document.querySelector('.dnex-status-pipeline');
        return {viewport:innerWidth,content:document.documentElement.scrollWidth,x:scrollX,offscreen:[root,...root.querySelectorAll('*')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(r.left< -1 || r.right>innerWidth+1);}).map(el=>el.className),background:getComputedStyle(root).backgroundColor};
      });
      assert.ok(measures.content<=width+1&&measures.x===0,JSON.stringify(measures));assert.deepEqual(measures.offscreen,[]);
      assert.equal(measures.background,theme==='dark'?'rgb(21, 18, 46)':'rgb(255, 255, 255)');
      const controls=await chart.locator('.dnex-pipeline-toolbar').evaluate(el=>{
        const targets=[...el.querySelectorAll('button,select')].map(button=>{const r=button.getBoundingClientRect();return {height:r.height,right:r.right,left:r.left};});
        const a=el.querySelector('.dnex-pipeline-scope').getBoundingClientRect(),b=el.querySelector('.dnex-pipeline-metric').getBoundingClientRect();
        return {targets,scopeCenter:a.y+a.height/2,metricCenter:b.y+b.height/2};
      });
      assert.ok(controls.targets.every(t=>t.height>=44 && t.left>=0 && t.right<=width+1));
      if(width===1440) assert.ok(Math.abs(controls.scopeCenter-controls.metricCenter)<3,'One aligned desktop toolbar');
      assert.equal(await chart.locator('.dnex-pipeline-total > strong').textContent(),'35');
      const sent=chart.getByRole('button',{name:/Ver 12 registros: Enviadas/});
      await sent.focus();await page.keyboard.press('Enter');
      await page.getByText(/Prévia ilustrativa: 12 registros/).waitFor();
      await chart.getByRole('button',{name:'Valor',exact:true}).click();assert.match(await sent.textContent(),/36%/);
      await chart.getByRole('button',{name:/Mostrar 1 status/}).click();await chart.getByText('Convertidas',{exact:true}).waitFor();
      if(width===1440||width===390) {
        // Capture the real viewport below the sticky catalogue header. An oversized
        // element screenshot can place that header across the component itself.
        await chart.evaluate(el=>scrollTo(0,scrollY+el.getBoundingClientRect().top-100));
        await page.screenshot({path:resolve(output,`ds-pipeline-${width}-${theme}.png`)});
      }
      await chart.getByRole('button',{name:'Contratos',exact:true}).click();
      assert.equal(await chart.locator('.dnex-pipeline-total > strong').textContent(),'30');
      assert.equal(await chart.getByLabel('Tipo de proposta no funil').count(),0);
      await chart.getByRole('button',{name:'Propostas',exact:true}).click();
      await chart.getByLabel('Tipo de proposta no funil').selectOption('catalogo');
      assert.equal(await chart.locator('.dnex-pipeline-total > strong').textContent(),'10');
      await chart.getByLabel('Tipo de proposta no funil').selectOption('comparativa');
      const state=page.getByLabel('Estado do exemplo de status');
      await state.selectOption('loading');await chart.getByText('Organizando os status…').waitFor();assert.equal(await chart.getAttribute('aria-busy'),'true');
      assert.equal(await chart.getByRole('button',{name:'Valor',exact:true}).isDisabled(),true);
      assert.equal(await chart.getByRole('button',{name:'Contratos',exact:true}).isEnabled(),true);
      await state.selectOption('empty');await chart.getByText('Seu próximo movimento começa aqui.').waitFor();
      await state.selectOption('error');await chart.getByRole('alert').waitFor();await chart.getByRole('button',{name:'Tentar novamente'}).click();await sent.waitFor();
      report.cases.push({width,theme,measures,checks:['full catalogue','keyboard','quantity/value','zeros','loading','empty','error/retry','viewport','no runtime exception']});await context.close();
    }
    assert.deepEqual(report.errors,[]);
  }finally{writeFileSync(resolve(output,'report.json'),JSON.stringify(report,null,2));await browser.close();}
  console.log(JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const {mkdirSync,writeFileSync}=require('node:fs');
const {resolve}=require('node:path');
const base=process.env.DS_PREVIEW_URL || 'http://127.0.0.1:5216';
assert.match(base,/^http:\/\/127\.0\.0\.1:\d+$/);
const output=process.env.AUDIT_OUTPUT || '/tmp/dnex-ds-global-rail-028';
async function main(){
  mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({headless:true, ...(process.env.CHROME_CHANNEL ? {channel:process.env.CHROME_CHANNEL}:{})});
  const report={cases:[],errors:[]};
  try {
    for(const width of [320,390,768,1440]) for(const theme of ['light','dark']) {
      const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:width<768?2:1,colorScheme:theme,reducedMotion:'reduce',isMobile:width<768,hasTouch:width<768});
      const page=await context.newPage();
      page.on('pageerror',e=>report.errors.push(e.message));
      await page.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
      await page.goto(base+'/tests/fixtures/global-rail.html');
      await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
      const trigger=page.getByRole('button',{name:'Abrir navegação'});
      await trigger.waitFor();
      const scopes=[];
      if(width>=768) scopes.push(page.getByRole('navigation',{name:'Aplicativos',exact:true}));
      for(const scope of scopes) await checkItems(page,scope);
      await trigger.click();
      const dialog=page.getByRole('dialog',{name:'Menu de navegação'});
      await dialog.waitFor();
      await checkItems(page,dialog);
      await page.keyboard.press('Escape');
      await assertEventually(()=>dialog.count(),0);
      assert.equal(await trigger.evaluate(el=>el===document.activeElement),true,'Drawer restores initiating control focus');
      await trigger.click();
      const ready=dialog.getByRole('button',{name:'Abrir DNEX CRM',exact:true});
      const countBefore=await selectionCount(page);
      await ready.focus();await page.keyboard.press('Enter');
      await assertEventually(()=>dialog.count(),0);
      assert.equal(await selectionCount(page),countBefore+1,'Ready item dispatches once and closes mobile drawer');
      assert.equal(await trigger.evaluate(el=>el===document.activeElement),true);
      const metrics=await page.evaluate(()=>{scrollTo(10000,scrollY);return {x:scrollX,content:document.documentElement.scrollWidth,width:innerWidth};});
      assert.ok(metrics.x===0&&metrics.content<=width+1,JSON.stringify(metrics));
      await page.screenshot({path:resolve(output,`rail-${width}-${theme}.png`)});
      report.cases.push({width,theme,checks:['mouse click and Enter/Space disabled inert','keyboard tab reaches disabled explanation','visible focus','ready selects once','drawer remains open on disabled','Escape and selection restore focus','no horizontal scroll']});
      await context.close();
    }
    assert.deepEqual(report.errors,[]);
  } finally {writeFileSync(resolve(output,'report.json'),JSON.stringify(report,null,2));await browser.close();}
  console.log(JSON.stringify(report,null,2));
}
async function assertEventually(get,expected){
  for(let i=0;i<30;i++){if(await get()===expected)return;await new Promise(resolve=>setTimeout(resolve,20));}
  assert.equal(await get(),expected);
}
async function selectionCount(page){return Number((await page.getByRole('status',{includeHidden:true}).textContent()).match(/Seleções: (\d+)/)[1]);}
async function checkItems(page,scope){
  for(const [name,state] of [['Normas','provisioning'],['Fiscal','unavailable']]){
    const target=scope.getByRole('button',{name:new RegExp(`DNEX ${name} —`)});
    assert.equal(await target.getAttribute('aria-disabled'),'true');
    assert.equal(await target.getAttribute('data-availability'),state);
    const description=await target.getAttribute('aria-describedby');
    assert.ok(description && await page.locator(`[id="${description}"]`).textContent());
    const before=await selectionCount(page);
    // aria-disabled remains focusable and explanatory, so Playwright's actionability
    // safeguard must be bypassed to simulate an actual user pointer click.
    await target.click({force:true});
    await target.focus();
    await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
    assert.equal(await target.evaluate(el=>el===document.activeElement),true);
    const ring=await target.evaluate(el=>getComputedStyle(el).boxShadow);
    assert.notEqual(ring,'none','Keyboard focus must be visible');
    await page.keyboard.press('Enter');await page.keyboard.press('Space');
    assert.equal(await selectionCount(page),before);
    assert.equal(await target.isVisible(),true);
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});

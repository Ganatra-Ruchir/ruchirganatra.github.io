const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 let file;
 try{file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400);return res.end();}
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);return res.end();}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file)){res.writeHead(404);return res.end();}
 res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.pdf':'application/pdf','.png':'image/png'})[path.extname(file)]||'application/octet-stream');
 fs.createReadStream(file).pipe(res);
});
(async()=>{
 let browser;
 try{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  browser=await chromium.launch();
  const base='http://127.0.0.1:'+server.address().port;
  const context=await browser.newContext({viewport:{width:1440,height:1080},reducedMotion:'reduce'});
  const p=await context.newPage();p.setDefaultTimeout(15000);const errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'/',{waitUntil:'domcontentloaded'});
  await p.locator('#loader').waitFor({state:'hidden',timeout:15000}).catch(()=>{});
  assert.equal(await p.locator('#workTrack .panel').count(),5,'Featured project count');
  assert.equal(await p.locator('#client-studio').count(),0,'Planner is no longer embedded on homepage');
  assert.equal(await p.locator('.topbar a[href="/plan-project.html"]').count(),1,'Planner navigation link');
  assert.equal(await p.locator('#workPrev').count(),1,'Project gallery remains intact');
  assert.equal(await p.locator('#workNav').count(),0,'Redundant project navigation strip is removed');
  assert.equal(await p.locator('#workProg').count(),0,'Redundant project progress strip is removed');
  assert.equal(await p.locator('#miniList .mini-row').count(),11,'Original workbench source is preserved');
  assert.equal(await p.locator('#workbenchStory.wb-ready').count(),1,'Scroll-driven book is ready');
  await p.evaluate(() => {
    const story=document.querySelector('#workbenchStory');
    window.scrollTo({top:scrollY+story.getBoundingClientRect().top+story.offsetHeight*.35,behavior:'instant'});
  });
  await p.waitForTimeout(350);
  const bookBefore=await p.evaluate(() => ({
    scrollY:window.scrollY,
    position:document.querySelector('.wb-sticky').getBoundingClientRect().top,
    chapter:document.querySelector('#wbCount').textContent
  }));
  assert.ok(bookBefore.position>=75&&bookBefore.position<=140,'Workbench stays pinned and visible while scrolling');
  await p.locator('#wbNext').click();
  await p.waitForTimeout(250);
  const bookAfter=await p.evaluate(() => ({
    scrollY:window.scrollY,
    position:document.querySelector('.wb-sticky').getBoundingClientRect().top,
    chapter:document.querySelector('#wbCount').textContent
  }));
  assert.notEqual(bookAfter.chapter,bookBefore.chapter,'Next arrow changes chapter');
  assert.ok(Math.abs(bookAfter.scrollY-bookBefore.scrollY)<2,'Flipping a page must not scroll the document');
  assert.ok(Math.abs(bookAfter.position-bookBefore.position)<2,'Book position stays fixed after a page turn');
  await p.locator('#wbPrev').click();
  await p.waitForTimeout(200);
  assert.equal(await p.locator('#wbCount').textContent(),bookBefore.chapter,'Previous arrow restores chapter');
  assert.ok(Math.abs(await p.evaluate(()=>window.scrollY)-bookBefore.scrollY)<2,'Previous page does not scroll the document');
  assert.equal(await p.locator('#certificateShelf .cw-sleeve').count(),10,'All imported credentials are available');
  await p.locator('#certificateWardrobe').scrollIntoViewIfNeeded();
  await p.locator('#certificateShelf .cw-sleeve').first().click();
  assert.equal(await p.locator('#certificateViewer').evaluate(el=>el.open),true,'Certificate viewer opens');
  assert.match(await p.locator('#cwViewerTitle').innerText(),/Google Analytics/);
  await p.locator('#cwClose').click();
  assert.equal(await p.locator('#certificateViewer').evaluate(el=>el.open),false,'Certificate viewer closes');
  await p.locator('#certificateShelf .cw-sleeve').nth(6).click();
  await p.locator('#cwViewerPreview img').waitFor({state:'visible',timeout:10000});
  assert.match(await p.locator('#cwViewerTitle').innerText(),/Data Visualization/);
  await p.keyboard.press('Escape');
  assert.equal(await p.locator('#certificateViewer').evaluate(el=>el.open),false,'Escape closes certificate dialog');
  await p.goto(base+'/plan-project.html',{waitUntil:'domcontentloaded'});
  assert.equal(await p.locator('#client-studio').count(),1,'Standalone planner renders');
  assert.equal(await p.locator('a.plan-back[href="/"]').count(),1,'Return to portfolio is available');
  await p.locator('#projectSearch').fill('documents');
  assert.match(await p.locator('#projectDirectory').innerText(),/DocuSense/);
  await p.locator('[data-shortlist="docusense-ai"]').click();
  await p.locator('#service').selectOption('dashboard');
  await p.locator('#briefGoal').fill('Combine weekly spreadsheets into a single sales dashboard.');
  await p.locator('#briefData').selectOption('Excel / CSV files');
  await p.locator('#acceptance input').first().check();
  await p.locator('#buildBrief').click();
  assert.match(await p.locator('#briefOutput').innerText(),/sales dashboard/);
  await p.locator('#saveDraft').click();
  const dl=p.waitForEvent('download');
  await p.locator('#downloadBrief').click();
  assert.equal((await dl).suggestedFilename(),'project-brief.md');
  await p.reload();
  assert.match(await p.locator('#briefGoal').inputValue(),/sales dashboard/);
  await p.locator('#studioMotion').click();
  assert.equal(await p.locator('body').evaluate(el=>el.classList.contains('motion-paused')),true);
  const other=await context.newPage();await other.goto(p.url());
  await other.locator('#briefGoal').fill('A different project saved in another tab.');
  await other.locator('#saveDraft').click();
  await p.locator('#saveDraft').click();
  assert.match(await p.locator('#studioStatus').innerText(),/another tab/);
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('rg.clientDraft.v1')).goal),'A different project saved in another tab.');
  await other.close();
  assert.doesNotMatch(await p.locator('body').innerText(),/[\u00c2\u00c3]|\u00e2[\u0080-\u00bf\u20ac\u2020\u20ac]/,'UTF-8 labels must render correctly');
  assert.deepEqual(errors,[],'Unexpected page errors');
  await p.setViewportSize({width:390,height:844});await p.waitForTimeout(200);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'Planner mobile horizontal overflow');
  await p.goto(base+'/',{waitUntil:'domcontentloaded'});
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'Portfolio mobile horizontal overflow');
  console.log('Standalone planner, preserved featured gallery, Workbench book, 10 certificate viewer files and mobile checks passed.');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});

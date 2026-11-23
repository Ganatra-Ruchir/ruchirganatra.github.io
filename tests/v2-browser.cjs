const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 let file;
 try{file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400);return res.end();}
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);return res.end();}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file)){res.writeHead(404);return res.end();}
 res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.pdf':'application/pdf','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');
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
  assert.equal(await p.locator('#writingList .wrow').count(),6,'Six original article links are retained');
  assert.equal(await p.locator('#dvdRack .dvd-case').count(),6,'All six game cases rendered');
  const shelf=await p.evaluate(()=>{
    const rect=e=>e.getBoundingClientRect();
    const left=rect(document.querySelector('.dvd-filled-bay'));
    const empty=document.querySelector('.dvd-empty-bay'),right=rect(empty);
    return {left,right,emptyChildren:empty.children.length,
      cases:[...document.querySelectorAll('#dvdRack .dvd-case')].map(rect)};
  });
  assert.equal(shelf.emptyChildren,0,'Right shelf reserved and empty');
  assert.ok(shelf.left.right<=shelf.right.left+11,'Filled bay is on the left');
  assert.ok(shelf.cases.every(r=>r.left>=shelf.left.left-2&&r.right<=shelf.left.right+2),'All six articles remain visible inside left compartment');
  assert.match(await p.locator('#dvdRack .dvd-case-title').nth(1).innerText(),/Static Dashboard/,'Readable DVD spine title');
  await p.locator('#dvdRack .dvd-case').first().click();
  assert.equal(await p.locator('#articleReader').evaluate(d=>d.open),true,'Selecting a case opens the article viewer');
  assert.match(await p.locator('#articleReaderTitle').innerText(),/Classrooms/i,'Selected article title');
  assert.match(await p.locator('#articleReaderLead').innerText(),/national literacy/,'Article summary is present');
  assert.match(await p.locator('#articleReaderLink').getAttribute('href'),/medium.com/,'Full original Medium article link');
  assert.ok((await p.locator('#articleReaderImage').getAttribute('src')).length>8,'Original article image referenced');
  await p.locator('#articleReaderNext').click();
  assert.match(await p.locator('#articleReaderTitle').innerText(),/Static Dashboard/i,'Next article navigation');
  await p.locator('#articleReaderPrev').click();
  assert.match(await p.locator('#articleReaderTitle').innerText(),/Classrooms/i,'Previous article navigation');
  await p.keyboard.press('Escape');
  assert.equal(await p.locator('#articleReader').evaluate(d=>d.open),false,'Escape closes reader');
  assert.equal(await p.evaluate(()=>document.activeElement?.getAttribute('data-article-index')),'0','Keyboard focus returns to selected case');
  assert.equal(await p.locator('#certificateShelf .cw-sleeve').count(),10,'All imported credentials are available');
  if(await p.locator('#certificateWardrobe').evaluate(el=>el.classList.contains('cw-is-open'))){
    await p.locator('#cabinetToggle').click();
  }
  assert.equal(await p.locator('#cwCabinetContent').evaluate(el=>el.inert),true,'Closed wardrobe is inert');
  assert.equal(await p.locator('#cwFeaturedOpen').isDisabled(),true,'Closed wardrobe prevents certificate access');
  const cabinet=await p.evaluate(()=>{
    const r=document.querySelector('.archive-v4 .cw-cabinet').getBoundingClientRect();
    return {width:r.width,height:r.height};
  });
  assert.ok(cabinet.width>cabinet.height,'Certificate exhibit remains landscape');
  await p.locator('#certificateWardrobe').scrollIntoViewIfNeeded();
  await p.waitForTimeout(150);
  if(!await p.locator('#certificateWardrobe').evaluate(el=>el.classList.contains('cw-is-open'))){
    await p.locator('#cabinetToggle').click();
  }
  await p.waitForTimeout(250);
  assert.equal(await p.locator('#certificateWardrobe').evaluate(el=>el.classList.contains('cw-is-open')),true,'Wardrobe opens when requested or on first intersection');
  assert.equal(await p.locator('#cwFeaturedOpen').isEnabled(),true,'Certificate controls unlock only after opening');
  assert.equal(await p.locator('#cwFeaturedImage').evaluate(el=>el.complete&&el.naturalWidth>0),true,'True certificate image loads');
  await p.locator('#cwShelfNext').click();
  assert.match(await p.locator('#cwFeaturedTitle').innerText(),/Ads Measurement/i,'Shelf navigation chooses next certificate');
  await p.locator('#certificateShelf .cw-sleeve').nth(6).click();
  assert.match(await p.locator('#cwFeaturedTitle').innerText(),/Data Visualization/i,'Choosing a sleeve displays its full-sized image');
  await p.locator('#cwFeaturedOpen').click();
  assert.equal(await p.locator('#certificateViewer').evaluate(el=>el.open),true,'Large preview opens from selected certificate');
  await p.locator('#cwViewerPreview img').waitFor({state:'visible',timeout:10000});
  await p.keyboard.press('Escape');
  assert.equal(await p.locator('#certificateViewer').evaluate(el=>el.open),false,'Escape closes certificate dialog');
  await p.locator('#cabinetToggle').click();
  assert.equal(await p.locator('#certificateWardrobe').evaluate(el=>el.classList.contains('cw-is-open')),false,'Wardrobe closes on request');
  assert.equal(await p.locator('#cwCabinetContent').evaluate(el=>el.inert),true,'Closing blocks all certificates');
  assert.equal(await p.locator('#cwFeaturedOpen').isDisabled(),true,'Closing disables full-size preview');
  await p.waitForTimeout(220);
  assert.equal(await p.locator('#certificateWardrobe').evaluate(el=>el.classList.contains('cw-is-open')),false,'Observer respects manual closure');
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
  console.log('DVD shelf with six left-side articles, empty right bay, credentials, projects and planner checks passed.');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});

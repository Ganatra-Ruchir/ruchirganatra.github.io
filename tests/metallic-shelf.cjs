const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.pdf':'application/pdf'};
const server=http.createServer((request,response)=>{
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)&&file!==root){response.writeHead(403);return response.end('Forbidden');}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){response.writeHead(404);return response.end('Not found');}
  response.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(response);
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port+'/';
  let browser;
  try{
    browser=await chromium.launch({args:['--disable-dev-shm-usage']});
    for(const [width,height,columns] of [[1536,900,6],[1280,800,6],[1024,768,6],[768,900,6],[390,844,4],[320,700,3]]){
      const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce',hasTouch:width<700,isMobile:width<700});
      const page=await context.newPage();
      const errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.goto(base,{waitUntil:'domcontentloaded'});
      await page.locator('#loader').waitFor({state:'hidden',timeout:15000}).catch(()=>{});
      await page.locator('#dvdRack .dvd-case').first().waitFor({state:'attached',timeout:15000});
      assert.equal(await page.locator('#workTrack .panel').count(),5,'Featured project cards remain unchanged');
      assert.equal(await page.locator('#writingList .wrow').count(),12,'Exactly twelve published articles are linked');
      assert.equal(await page.locator('#dvdRack .dvd-case').count(),12,'All twelve article cases are rendered');
      const state=await page.evaluate(()=>{
        const rect=e=>{
          const r=e.getBoundingClientRect();
          return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};
        };
        const rack=document.querySelector('#dvdRack'),left=document.querySelector('.dvd-filled-bay'),empty=document.querySelector('.dvd-empty-bay');
        const sources=[...document.querySelectorAll('#writingList .wrow')];
        const cases=[...document.querySelectorAll('#dvdRack .dvd-case')];
        return {
          viewport:innerWidth,
          bodyOverflow:document.documentElement.scrollWidth-innerWidth,
          left:rect(left),empty:rect(empty),
          emptyChildren:empty.children.length,
          cases:cases.map(rect),
          columns:getComputedStyle(rack).gridTemplateColumns.trim().split(/\s+/).length,
          urls:sources.map(a=>a.href),
          caseTitles:cases.map(c=>c.querySelector('.dvd-case-title')?.textContent),
          sourceHidden:getComputedStyle(document.querySelector('#writingList')).display==='none',
          metallicBackground:getComputedStyle(document.querySelector('.dvd-cabinet')).backgroundImage
        };
      });
      assert.ok(state.bodyOverflow<=2,'No horizontal page overflow at '+width);
      assert.equal(new Set(state.urls).size,12,'No duplicate Medium articles at '+width);
      assert.ok(state.urls.every(url=>url.startsWith('https://ruchirganatra.medium.com/')),'Only original Medium articles, no project shortcuts');
      assert.equal(state.emptyChildren,0,'Unused shelf remains empty');
      assert.equal(state.columns,columns,'All cases use the designed shelf grid at '+width);
      assert.ok(state.caseTitles.every(title=>title&&title.trim().length>4),'All spines have titles');
      assert.ok(state.metallicBackground.includes('linear-gradient'),'Metallic cabinet styling is active');
      assert.equal(state.sourceHidden,true,'Fallback list does not duplicate visible cases');
      const tolerance=7;
      assert.ok(state.cases.every(c=>c.left>=state.left.left-tolerance&&c.right<=state.left.right+tolerance),'All cases stay inside the populated shelf');
      if(width>740)assert.ok(state.left.right<=state.empty.left+14,'The right-hand shelf is unused');
      await page.locator('#dvdRack .dvd-case').first().click();
      assert.equal(await page.locator('#articleReader').evaluate(el=>el.open),true,'Opening a metallic case shows the reader');
      assert.match(await page.locator('#articleReaderTitle').innerText(),/document Q&A tool/i);
      assert.match(await page.locator('#articleReaderLink').getAttribute('href'),/medium\.com/);
      assert.equal(await page.locator('#articleReaderCount').innerText(),'01 / 12');
      await page.locator('#articleReaderNext').click();
      assert.match(await page.locator('#articleReaderTitle').innerText(),/Classrooms/i);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#articleReader').evaluate(el=>el.open),false);
      assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-article-index')),'0');
      await page.locator('#dvdRack .dvd-case').last().click();
      assert.match(await page.locator('#articleReaderTitle').innerText(),/Ransomware Canary/i);
      assert.match(await page.locator('#articleReaderLink').getAttribute('href'),/ransomware-canary-detector/);
      assert.equal(await page.locator('#articleReaderCount').innerText(),'12 / 12');
      await page.locator('#articleReaderClose').click();
      assert.equal(await page.locator('#articleReader').evaluate(el=>el.open),false);
      assert.equal(await page.locator('#certificateShelf .cw-sleeve').count(),10,'Certificate wardrobe remains separate');
      assert.deepEqual(errors,[],'No JavaScript exceptions at '+width);
      console.log('PASS '+width+'×'+height+' — 12 metallic articles / '+columns+' columns / reserved bay / reader / no overflow');
      await context.close();
    }
    console.log('METALLIC SHELF MASTER AUDIT PASSED');
  }finally{
    if(browser)await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(error=>{console.error(error.stack);process.exitCode=1;});

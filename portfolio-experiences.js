/* BOOK + CERTIFICATE WARDROBE
   Progressive enhancements only. The featured projects gallery is untouched. */
(function(){
'use strict';
var doc=document, reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
function $ (s,root){return (root||doc).querySelector(s);}
function all(s,root){return Array.from((root||doc).querySelectorAll(s));}
function canAnimate(){return !reduce.matches&&!doc.body.classList.contains('motion-paused');}
function numbered(n,total){return String(n).padStart(2,'0')+' / '+String(total).padStart(2,'0');}

/* Published articles live in a page-turning book beside the wardrobe.
   Smaller builds remain a normal, accessible workbench list. */
(function initArticleBook(){
var root=$('#articleBook'),cover=$('#articleCover'),page=$('#articlePage');
var source=$('#writingList'),turner=$('#articleTurner');
var prev=$('#articlePrev'),next=$('#articleNext'),counter=$('#articleCount');
if(!root||!cover||!page||!source)return;
var items=all('.wrow',source).map(function(row){
 var text=function(selector){var el=$(selector,row);return el?el.textContent.trim():'';};
 return {title:text('.wt'),category:text('.wcat'),date:text('.wdate'),
  desc:row.getAttribute('data-peek')||'',href:row.href};
});
if(!items.length)return;
var index=-1;
function render(){
 var item=items[index],number=String(index+1).padStart(2,'0');
 var kicker=doc.createElement('div');kicker.className='wb-page-num';
 kicker.textContent='ARTICLE '+number+' / '+String(items.length).padStart(2,'0');
 var category=doc.createElement('div');category.className='ab-category';
 category.textContent=item.category+' · '+item.date;
 var title=doc.createElement('h4');title.className='wb-page-title';title.textContent=item.title;
 var desc=doc.createElement('p');desc.className='wb-page-desc';desc.textContent=item.desc;
 var link=doc.createElement('a');link.href=item.href;link.target='_blank';
 link.rel='noopener noreferrer';link.textContent='Read article ↗';
 var links=doc.createElement('div');links.className='wb-page-links';links.appendChild(link);
 var group=doc.createElement('div');group.append(kicker,category,title,desc,links);
 var foot=doc.createElement('div');foot.className='wb-page-meta';
 foot.append('R. GANATRA / MEDIUM','PUBLISHED '+item.date.toUpperCase());
 page.replaceChildren(group,foot);
}
function setIndex(n){
 n=Math.max(-1,Math.min(items.length-1,n));
 if(n===index)return;
 var wasOpen=index>=0;
 index=n;
 root.classList.toggle('is-open',n>=0);
 cover.setAttribute('aria-hidden',String(n>=0));
 cover.tabIndex=n>=0?-1:0;
 if(n>=0){
  render();
  if(wasOpen&&canAnimate()&&turner){
   turner.classList.remove('is-turning');
   void turner.offsetWidth;
   turner.classList.add('is-turning');
  }
 }
 counter.textContent=n<0?'COVER / '+numbered(0,items.length):'PAGE '+numbered(n+1,items.length);
 prev.disabled=n<0;
 next.disabled=n===items.length-1;
}
cover.addEventListener('click',function(){setIndex(0);});
prev.addEventListener('click',function(){setIndex(index-1);});
next.addEventListener('click',function(){setIndex(index+1);});
root.addEventListener('keydown',function(e){
 if(e.target.closest('a')||e.altKey||e.ctrlKey||e.metaKey)return;
 if(e.key==='ArrowRight'&&index<items.length-1){e.preventDefault();setIndex(index+1);}
 if(e.key==='ArrowLeft'&&index>=0){e.preventDefault();setIndex(index-1);}
});
setIndex(0);setIndex(-1);
root.classList.add('ab-ready');
source.classList.add('ab-hidden');
})();
 
/* The certificate wardrobe contains first-party, same-origin previews derived
   from the user's own verified Drive certificate files. Drive sharing is unchanged. */
(function initCertificateWardrobe(){
var wardrobe=$('#certificateWardrobe'),shelf=$('#certificateShelf'),openBtn=$('#cabinetToggle'),viewer=$('#certificateViewer');
var title=$('#cwViewerTitle'),issuer=$('#cwViewerIssuer'),preview=$('#cwViewerPreview'),original=$('#cwOriginal'),count=$('#cwViewerCount');
var prev=$('#cwPrevious'),next=$('#cwNext'),close=$('#cwClose');
if(!wardrobe||!shelf||!viewer)return;
var certificates=[
 {title:'Google Analytics Certification',short:'Google Analytics',issuer:'Google',date:'Sep 2026',path:'certificates/google-analytics.pdf',type:'pdf'},
 {title:'Google Ads Measurement',short:'Ads Measurement',issuer:'Google',date:'Sep 2026',path:'certificates/google-ads.pdf',type:'pdf'},
 {title:'Getting Started with Artificial Intelligence',short:'Getting Started with AI',issuer:'IBM SkillsBuild',date:'Sep 2026',path:'certificates/ibm-ai.pdf',type:'pdf'},
 {title:'Cloud Computing Fundamentals',short:'Cloud Computing',issuer:'IBM SkillsBuild',date:'Aug 2026',path:'certificates/ibm-cloud.pdf',type:'pdf'},
 {title:'Generative AI Essentials: Using LLMs with Data',short:'Generative AI Essentials',issuer:'IBM SkillsBuild',date:'Sep 2026',path:'certificates/generative-ai.pdf',type:'pdf'},
 {title:'Data Science Essentials with Python',short:'Data Science & Python',issuer:'Cisco Networking Academy',date:'Sep 2026',path:'certificates/cisco-data-science.pdf',type:'pdf'},
 {title:'Data Visualization',short:'Data Visualization',issuer:'Kaggle',date:'2026',path:'certificates/kaggle-visualization.png',type:'image'},
 {title:'Python',short:'Python',issuer:'Kaggle',date:'Feb 2026',path:'certificates/kaggle-python.pdf',type:'pdf'},
 {title:'AI Tools and ChatGPT Workshop',short:'AI Tools & ChatGPT',issuer:'be10X',date:'Jan 2026',path:'certificates/be10x-ai.pdf',type:'pdf'},
 {title:'Generative AI Essentials Badge',short:'Generative AI Badge',issuer:'IBM SkillsBuild',date:'2026',path:'certificates/ibm-genai-badge.pdf',type:'pdf'}
];
var index=0,activeToken=0,lastButton=null,pdfLibrary=null;
function showDoors(open){
 wardrobe.classList.toggle('cw-is-open',open);
 if(openBtn){openBtn.setAttribute('aria-expanded',String(open));openBtn.textContent=open?'Close wardrobe':'Open wardrobe';}
}
openBtn?.addEventListener('click',function(){showDoors(!wardrobe.classList.contains('cw-is-open'));});
if('IntersectionObserver' in window){
 var obs=new IntersectionObserver(function(entries){
  if(entries.some(function(e){return e.isIntersecting;})){showDoors(true);obs.disconnect();}
 },{threshold:.15});
 obs.observe(wardrobe);
}else showDoors(true);
certificates.forEach(function(c,i){
 var button=doc.createElement('button');button.type='button';button.className='cw-sleeve';
 button.style.setProperty('--cw-tilt',((i%5)-2)*1.2+'deg');
 button.setAttribute('aria-label','Pick certificate: '+c.title+' by '+c.issuer);
 button.setAttribute('data-cert-index',i);
 var card=doc.createElement('span');card.className='cw-paper';
 var medal=doc.createElement('span');medal.className='cw-medal';medal.textContent='✦';
 var provider=doc.createElement('span');provider.className='cw-provider';provider.textContent=c.issuer;
 var name=doc.createElement('span');name.className='cw-course';name.textContent=c.short;
 card.append(medal,provider,name);
 var foot=doc.createElement('span');foot.className='cw-sleeve-title';foot.textContent=c.short;
 button.append(card,foot);
 button.addEventListener('click',function(){lastButton=button;openCertificate(i);});
 shelf.appendChild(button);
});
function loadPdfjs(){
 if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);
 if(pdfLibrary)return pdfLibrary;
 pdfLibrary=new Promise(function(resolve,reject){
  var script=doc.createElement('script');
  script.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  script.async=true;
  script.onload=function(){
   if(!window.pdfjsLib)return reject(new Error('PDF renderer unavailable'));
   window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
   resolve(window.pdfjsLib);
  };
  script.onerror=function(){reject(new Error('PDF library could not load'));};
  doc.head.appendChild(script);
 }).catch(function(e){pdfLibrary=null;throw e;});
 return pdfLibrary;
}
function fallbackPdf(c,token){
 if(token!==activeToken||!viewer.open)return;
 var frame=doc.createElement('iframe');frame.title=c.title;
 frame.src=c.path+'#toolbar=0&navpanes=0';
 frame.loading='eager';preview.replaceChildren(frame);
}
async function renderPdf(c,token){
 try{
  var pdfjs=await loadPdfjs();
  if(token!==activeToken)return;
  var docHandle=await pdfjs.getDocument({url:c.path}).promise;
  var pdfPage=await docHandle.getPage(1);
  if(token!==activeToken)return;
  var pageViewport=pdfPage.getViewport({scale:1}),maxWidth=Math.min(1000,window.innerWidth-66);
  var density=Math.min(window.devicePixelRatio||1,2);
  var scaled=pdfPage.getViewport({scale:Math.min(2.2,Math.max(.75,maxWidth/pageViewport.width))});
  var canvas=doc.createElement('canvas');
  canvas.width=Math.ceil(scaled.width*density);canvas.height=Math.ceil(scaled.height*density);
  canvas.style.width=Math.ceil(scaled.width)+'px';canvas.style.height=Math.ceil(scaled.height)+'px';
  await pdfPage.render({canvasContext:canvas.getContext('2d'),viewport:pdfPage.getViewport({scale:scaled.scale*density})}).promise;
  if(token===activeToken&&viewer.open)preview.replaceChildren(canvas);
  docHandle.destroy();
 }catch(e){fallbackPdf(c,token);}
}
function openCertificate(i){
 index=(i+certificates.length)%certificates.length;
 var c=certificates[index],token=++activeToken;
 if(title)title.textContent=c.title;if(issuer)issuer.textContent=c.issuer+' · '+c.date;
 if(count)count.textContent=numbered(index+1,certificates.length);
 if(original){original.href=c.path;original.setAttribute('aria-label','Open original '+c.title+' in a new tab');}
 var loading=doc.createElement('span');loading.className='cw-loading';loading.textContent='Opening original certificate…';
 preview.replaceChildren(loading);
 if(!viewer.open)viewer.showModal();
 if(c.type==='image'){
  var image=doc.createElement('img');image.src=c.path;image.alt=c.title+' certificate image';image.decoding='async';
  image.onload=function(){if(token===activeToken)preview.replaceChildren(image);};
  image.onerror=function(){if(token===activeToken)preview.replaceChildren(doc.createTextNode('Preview unavailable. Use Open original.'));};
 }else renderPdf(c,token);
}
function navigate(d){openCertificate(index+d);}
prev?.addEventListener('click',function(){navigate(-1);});
next?.addEventListener('click',function(){navigate(1);});
close?.addEventListener('click',function(){viewer.close();});
viewer.addEventListener('close',function(){activeToken++;if(lastButton)lastButton.focus({preventScroll:true});});
viewer.addEventListener('keydown',function(e){
 if(e.key==='ArrowRight'){e.preventDefault();navigate(1);}
 if(e.key==='ArrowLeft'){e.preventDefault();navigate(-1);}
});
viewer.addEventListener('click',function(e){if(e.target===viewer)viewer.close();});
})();
})();
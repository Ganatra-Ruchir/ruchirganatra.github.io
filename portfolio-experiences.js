/* BOOK + CERTIFICATE WARDROBE
   Progressive enhancements only. The featured projects gallery is untouched. */
(function(){
'use strict';
var doc=document, reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
function $ (s,root){return (root||doc).querySelector(s);}
function all(s,root){return Array.from((root||doc).querySelectorAll(s));}
function canAnimate(){return !reduce.matches&&!doc.body.classList.contains('motion-paused');}
function numbered(n,total){return String(n).padStart(2,'0')+' / '+String(total).padStart(2,'0');}

/* A closed book becomes an open archive as the visitor scrolls down.
   Normal vertical scrolling is never intercepted or disabled. */
(function initWorkbenchBook(){
var story=$('#workbenchStory'),source=$('#miniList'),book=$('#wbBook'),contents=$('#wbContent'),turner=$('#wbTurner');
var counter=$('#wbCount'),prev=$('#wbPrev'),next=$('#wbNext'),cover=$('#wbCover');
if(!story||!source||!book||!contents)return;
var items=all('.mini-row',source).filter(function(row){
 var title=$('.mr-t',row);return title&&title.textContent.trim()!=='Live from GitHub';
}).map(function(row){
 return {
  title:$('.mr-t',row).textContent.trim(),
  desc:$('.mr-desc',row)?.textContent.trim()||'',
  links:all('.mr-go a',row).map(function(a){return{href:a.href,label:a.textContent.trim(),target:a.target||'_blank'};})
 };
});
if(!items.length)return;
var state=0,raf=0,ignoreUntil=0;
var total=items.length;
function render(index){
 var item=items[index],num=String(index+1).padStart(2,'0');
 contents.replaceChildren();
 var kicker=doc.createElement('div');kicker.className='wb-page-num';kicker.textContent='CHAPTER '+num+' · '+String(total).padStart(2,'0');
 var title=doc.createElement('h4');title.className='wb-page-title';title.textContent=item.title;
 var desc=doc.createElement('p');desc.className='wb-page-desc';desc.textContent=item.desc;
 var links=doc.createElement('div');links.className='wb-page-links';
 item.links.forEach(function(entry){
  var a=doc.createElement('a');a.href=entry.href;a.target='_blank';a.rel='noopener noreferrer';
  a.textContent=entry.label.replace('↗','').trim()+' ↗';
  links.appendChild(a);
 });
 var group=doc.createElement('div');group.append(kicker,title,desc,links);
 var meta=doc.createElement('div');meta.className='wb-page-meta';
 meta.innerHTML='<span>R. GANATRA / THE WORKBENCH</span><span>ARCHIVE '+num+'</span>';
 contents.append(group,meta);
}
function apply(step){
 step=Math.max(0,Math.min(total,step));
 if(step===state)return;
 var previous=state;
 state=step;
 if(step>0){
  render(step-1);
  book.classList.add('is-open');
  cover.setAttribute('aria-hidden','true');
  if(previous>0&&canAnimate()){
   turner.classList.remove('is-turning');void turner.offsetWidth;
   turner.classList.add('is-turning');
  }
 } else {
  book.classList.remove('is-open');cover.setAttribute('aria-hidden','false');
 }
 if(counter)counter.textContent=step===0?'COVER / '+numbered(0,total):'PAGE '+numbered(step,total);
 if(prev)prev.disabled=step===0;
 if(next)next.disabled=step===total;
}
function setSize(){
 /* Long enough to show each turning chapter, but without any scroll lock. */
 var unit=Math.max(270,Math.min(440,window.innerHeight*.43));
 story.style.height=Math.ceil((total+1)*unit+window.innerHeight*.55)+'px';
}
function updateFromScroll(){
 raf=0;if(performance.now()<ignoreUntil)return;
 var rect=story.getBoundingClientRect(),vh=window.innerHeight;
 if(rect.top>vh*1.1||rect.bottom < -vh*.2)return;
 var start=window.scrollY+rect.top, travel=Math.max(1,story.offsetHeight-vh);
 var progress=Math.max(0,Math.min(1,(window.scrollY-start+vh*.12)/travel));
 apply(Math.max(0,Math.min(total,Math.floor(progress*(total+1)))));
}
function kick(){if(!raf)raf=requestAnimationFrame(updateFromScroll);}
function jump(step){
 step=Math.max(0,Math.min(total,step));
 apply(step);
 var start=window.scrollY+story.getBoundingClientRect().top;
 var travel=story.offsetHeight-window.innerHeight;
 var fraction=(step+.15)/(total+1);
 ignoreUntil=performance.now()+850;
 window.scrollTo({top:Math.max(0,start+Math.max(0,travel)*fraction),behavior:canAnimate()?'smooth':'instant'});
}
prev?.addEventListener('click',function(){jump(state-1);});
next?.addEventListener('click',function(){jump(state+1);});
var view=story;
view.addEventListener('keydown',function(e){
 if(e.target.closest('a,button,input,textarea,select'))return;
 if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();jump(state+1);}
 if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();jump(state-1);}
});
setSize();render(0);state=-1;apply(0);
story.classList.add('wb-ready');
window.addEventListener('scroll',kick,{passive:true});
window.addEventListener('resize',function(){setSize();kick();},{passive:true});
kick();
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
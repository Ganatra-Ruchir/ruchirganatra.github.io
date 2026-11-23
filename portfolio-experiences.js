/* BOOK + CERTIFICATE WARDROBE
   Progressive enhancements only. The featured projects gallery is untouched. */
(function(){
'use strict';
var doc=document, reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
function $ (s,root){return (root||doc).querySelector(s);}
function all(s,root){return Array.from((root||doc).querySelectorAll(s));}
function canAnimate(){return !reduce.matches&&!doc.body.classList.contains('motion-paused');}
function numbered(n,total){return String(n).padStart(2,'0')+' / '+String(total).padStart(2,'0');}

/* One article per two-page spread: image/title on the left, description on the right.
   Projects remain in the separate Workbench listing. */
(function initArticleBook(){
var root=$('#articleBook'),cover=$('#articleCover'),
 left=$('#articlePageLeft'),right=$('#articlePageRight'),source=$('#writingList'),
 turner=$('#articleTurner'),prev=$('#articlePrev'),next=$('#articleNext'),counter=$('#articleCount');
if(!root||!cover||!left||!right||!source||!prev||!next||!counter)return;
var items=all('.wrow',source).map(function(row){
 var text=function(selector){var el=$(selector,row);return el?el.textContent.trim():'';};
 return {
  title:text('.wt'),category:text('.wcat'),date:text('.wdate'),
  desc:row.getAttribute('data-description')||row.getAttribute('data-peek')||'',
  hook:row.getAttribute('data-hook')||'',
  image:row.getAttribute('data-image')||'',
  alt:row.getAttribute('data-image-alt')||'Article illustration',
  href:row.href
 };
});
if(!items.length)return;
var index=-1;
function element(tag,className,content){
 var node=doc.createElement(tag);
 if(className)node.className=className;
 if(content!==undefined)node.textContent=content;
 return node;
}
function render(){
 var item=items[index],number=String(index+1).padStart(2,'0');
 var kicker=element('span','wb-page-num','ARTICLE '+number+' / '+String(items.length).padStart(2,'0'));
 var pic=element('div','ab-picture');
 var img=element('img','ab-article-image');
 img.src=item.image;img.alt=item.alt;img.loading='eager';img.decoding='async';
 img.addEventListener('error',function(){
  pic.classList.add('is-fallback');
  img.remove();
  pic.appendChild(element('span','ab-image-missing','ART / '+item.category));
 },{once:true});
 pic.appendChild(img);
 var title=element('h4','ab-article-title',item.title);
 var meta=element('div','ab-page-footer','R. GANATRA  ·  '+item.date);
 left.replaceChildren(kicker,pic,title,meta);
 var header=element('div','ab-right-header');
 header.append(element('span','ab-category',item.category),element('span','ab-page-date',item.date));
 var hook=element('h5','ab-article-hook',item.hook);
 var desc=element('p','ab-article-summary',item.desc);
 var link=element('a','ab-read-link','Read full article ↗');
 link.href=item.href;link.target='_blank';link.rel='noopener noreferrer';
 var body=element('div','ab-right-body');
 body.append(header,hook,desc,link);
 var foot=element('div','ab-page-footer','MEDIUM · WRITING ARCHIVE');
 right.replaceChildren(body,foot);
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
 counter.textContent=n<0?'COVER / '+numbered(0,items.length):'SPREAD '+numbered(n+1,items.length);
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
var index=0,activeToken=0,lastButton=null;
function previewPath(c){return 'certificates/previews/'+c.path.split('/').pop().replace(/\.(?:pdf|png)$/i,'.webp');}
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
 var image=doc.createElement('img');
 image.className='cw-cert-image';image.src=previewPath(c);
 image.alt=c.title+' — actual certificate preview';image.loading='lazy';image.decoding='async';
 card.appendChild(image);
 var foot=doc.createElement('span');foot.className='cw-sleeve-title';foot.textContent=c.short;
 button.append(card,foot);
 button.addEventListener('click',function(){lastButton=button;openCertificate(i);});
 shelf.appendChild(button);
});
/* Images are pre-rendered from the original PDF's first page and served
   directly from GitHub/Vercel; no CDN script or PDF worker on the critical path. */
/* Measure the wardrobe cabinet and match the book's displayed height,
   clamping only when the viewport is too short to contain page controls. */
function matchBookToWardrobe(){
 var cabinet=$('.cw-cabinet',wardrobe),book=$('#articleBook');
 if(!cabinet||!book)return;
 var height=Math.round(cabinet.getBoundingClientRect().height);
 if(height>0)book.style.setProperty('--book-cabinet-height',height+'px');
}
requestAnimationFrame(matchBookToWardrobe);
if('ResizeObserver' in window){
 var cabinet=$('.cw-cabinet',wardrobe);
 if(cabinet)new ResizeObserver(matchBookToWardrobe).observe(cabinet);
}
function imageFallback(c,token){
 if(token!==activeToken||!viewer.open)return;
 if(c.type==='pdf'){
  var frame=doc.createElement('iframe');frame.title=c.title;
  frame.src=c.path+'#toolbar=0&navpanes=0';preview.replaceChildren(frame);
 }else{
  var message=doc.createElement('span');message.className='cw-loading';
  message.textContent='Preview unavailable. Open the original certificate instead.';
  preview.replaceChildren(message);
 }
}
function openCertificate(i){
 index=(i+certificates.length)%certificates.length;
 var c=certificates[index],token=++activeToken;
 if(title)title.textContent=c.title;if(issuer)issuer.textContent=c.issuer+' · '+c.date;
 if(count)count.textContent=numbered(index+1,certificates.length);
 if(original){original.href=c.path;original.setAttribute('aria-label','Open original '+c.title+' in a new tab');}
 var image=doc.createElement('img');
 image.className='cw-certificate-full';image.src=previewPath(c);
 image.alt=c.title+' original certificate page';image.decoding='async';image.loading='eager';
 image.onerror=function(){imageFallback(c,token);};
 preview.replaceChildren(image);
 if(!viewer.open)viewer.showModal();
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
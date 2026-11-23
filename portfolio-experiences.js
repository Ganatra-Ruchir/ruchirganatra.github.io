/* BOOK + CERTIFICATE WARDROBE
   Progressive enhancements only. The featured projects gallery is untouched. */
(function(){
'use strict';
var doc=document, reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
function $ (s,root){return (root||doc).querySelector(s);}
function all(s,root){return Array.from((root||doc).querySelectorAll(s));}
function canAnimate(){return !reduce.matches&&!doc.body.classList.contains('motion-paused');}
function numbered(n,total){return String(n).padStart(2,'0')+' / '+String(total).padStart(2,'0');}

/* DVD-inspired article collection: actual published stories from #writingList.
   Each case is keyboard-accessible and opens a native, focus-trapped reader. */
(function initArticleShelf(){
 var rack=$('#dvdRack'),source=$('#writingList'),reader=$('#articleReader');
 if(!rack||!source||!reader)return;
 var image=$('#articleReaderImage'),fallback=$('#articleArtFallback'),
  number=$('#articleReaderNumber'),count=$('#articleReaderCount'),
  heading=$('#articleReaderTitle'),category=$('#articleReaderCategory'),
  date=$('#articleReaderDate'),hook=$('#articleReaderHook'),
  lead=$('#articleReaderLead'),description=$('#articleReaderDescription'),
  link=$('#articleReaderLink'),previous=$('#articleReaderPrev'),
  next=$('#articleReaderNext'),close=$('#articleReaderClose');
 /* Only published Medium story links are allowed here. Project links
    belong in Selected Work and must never populate the article shelf. */
 var items=all('.wrow',source).filter(function(row){
  try{
   var host=new URL(row.href,window.location.href).hostname.toLowerCase();
   return host==='medium.com'||host.endsWith('.medium.com');
  }catch(e){return false;}
 }).map(function(row){
  function txt(selector){var el=$(selector,row);return el?el.textContent.trim():'';}
  return {title:txt('.wt'),spine:$('.wt',row)?.getAttribute('data-spine')||txt('.wt'),category:txt('.wcat'),date:txt('.wdate'),
   desc:row.getAttribute('data-description')||row.getAttribute('data-peek')||'',
   hook:row.getAttribute('data-hook')||'',image:row.getAttribute('data-image')||'',
   alt:row.getAttribute('data-image-alt')||'',href:row.href};
 });
 if(!items.length)return;
 var active=-1,lastCase=null;
 var total=items.length;
 var bookcase=$('.dvd-bookcase');
 if(bookcase)bookcase.style.setProperty('--dvd-rows',String(Math.ceil(total/6)));
 rack.style.setProperty('--dvd-total',String(total));
 var countDisplay=$('#dvdArticleCount'),statusDisplay=$('#dvdShelfStatus');
 if(countDisplay)countDisplay.textContent=total+' PUBLISHED ARTICLES';
 if(statusDisplay)statusDisplay.textContent=total+' STORIES · CHOOSE A CASE TO READ';
 var tones=['ochre','plum','sage','clay','midnight','teal'];
 function node(tag,klass,txt){
  var el=doc.createElement(tag);
  if(klass)el.className=klass;
  if(txt!==undefined)el.textContent=txt;
  return el;
 }
 items.forEach(function(item,i){
  var button=node('button','dvd-case');
  button.type='button';button.dataset.articleIndex=String(i);
  button.setAttribute('aria-label','Pull out article '+(i+1)+': '+item.title);
  button.setAttribute('aria-haspopup','dialog');
  button.style.setProperty('--dvd-position',String(i));
  button.classList.add('dvd-'+tones[i%tones.length]);
  var edge=node('span','dvd-case-edge');
  var serial=node('span','dvd-case-serial',String(i+1).padStart(2,'0')+' / '+String(items.length).padStart(2,'0'));
  var title=node('strong','dvd-case-title',item.spine);title.title=item.title;
  var footer=node('span','dvd-case-category',item.category);
  edge.append(serial,title,footer);
  var art=node('span','dvd-case-art');
  if(item.image){
   var img=doc.createElement('img');
   img.src=item.image;img.alt='';img.loading='lazy';img.decoding='async';
   img.onerror=function(){img.remove();art.classList.add('no-banner');};
   art.appendChild(img);
  }
  button.append(edge,art);
  button.addEventListener('click',function(){
   lastCase=button;
   openArticle(i);
  });
  rack.appendChild(button);
 });
 function render(index){
  active=(index+items.length)%items.length;
  var item=items[active],num=String(active+1).padStart(2,'0')+' / '+String(items.length).padStart(2,'0');
  heading.textContent=item.title;
  category.textContent=item.category;
  date.textContent=item.date;
  hook.textContent=item.hook||item.category;
  number.textContent=count.textContent=num;
  var segments=item.desc.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[item.desc];
  lead.textContent=(segments[0]||'').trim();
  description.textContent=segments.slice(1).join(' ').trim();
  description.hidden=!description.textContent;
  link.href=item.href;
  link.setAttribute('aria-label','Read the full original Medium article: '+item.title);
  var src=item.image;
  /* No invented cover: use the real post's short title when Medium has no banner. */
  fallback.textContent=item.spine||item.title;
  fallback.hidden=!!src;
  image.hidden=!src;
  if(src){
   image.alt=item.alt||item.title+' article cover image';
   image.onload=function(){fallback.hidden=true;};
   image.onerror=function(){image.hidden=true;fallback.hidden=false;};
   image.src=src;
  }else image.removeAttribute('src');
  all('.dvd-case',rack).forEach(function(b,i){
   b.classList.toggle('is-selected',i===active);
   b.setAttribute('aria-pressed',String(i===active));
  });
 }
 function openArticle(i){
  render(i);
  if(!reader.open)reader.showModal();
 }
 function navigate(d){render(active+d);}
 previous.addEventListener('click',function(){navigate(-1);});
 next.addEventListener('click',function(){navigate(1);});
 close.addEventListener('click',function(){reader.close();});
 reader.addEventListener('keydown',function(e){
  if(e.altKey||e.ctrlKey||e.metaKey)return;
  if(e.key==='ArrowRight'){e.preventDefault();navigate(1);}
  if(e.key==='ArrowLeft'){e.preventDefault();navigate(-1);}
 });
 reader.addEventListener('click',function(e){if(e.target===reader)reader.close();});
 reader.addEventListener('close',function(){
  all('.dvd-case',rack).forEach(function(b){b.classList.remove('is-selected');b.setAttribute('aria-pressed','false');});
  if(lastCase)lastCase.focus({preventScroll:true});
 });
 source.classList.add('ab-hidden');
 rack.classList.add('dvd-ready');
})();

/* The certificate wardrobe contains first-party, same-origin previews derived
   from the user's own verified Drive certificate files. Drive sharing is unchanged. */
(function initCertificateWardrobe(){
var wardrobe=$('#certificateWardrobe'),shelf=$('#certificateShelf'),openBtn=$('#cabinetToggle'),viewer=$('#certificateViewer');
var title=$('#cwViewerTitle'),issuer=$('#cwViewerIssuer'),preview=$('#cwViewerPreview'),original=$('#cwOriginal'),count=$('#cwViewerCount');
var prev=$('#cwPrevious'),next=$('#cwNext'),close=$('#cwClose');
var cabinetContent=$('#cwCabinetContent'),featureBtn=$('#cwFeaturedOpen'),
 featureImg=$('#cwFeaturedImage'),featureTitle=$('#cwFeaturedTitle'),featureIssuer=$('#cwFeaturedIssuer'),
 shelfPrev=$('#cwShelfPrev'),shelfNext=$('#cwShelfNext');
if(!cabinetContent||!featureBtn||!featureImg||!featureTitle||!featureIssuer||!shelfPrev||!shelfNext)return;
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
/* Skill and value statements describe what each credential represents;
   they do not invent work history or claim demonstrated mastery. */
var credentialStories=[
 ['Understanding the people behind the numbers.','Analytics matters when behavior becomes a better decision—not simply another chart.'],
 ['Measure results, not just activity.','The useful question is whether a campaign created value. Clear measurement keeps attention on outcomes.'],
 ['Building AI with judgment.','Learning the foundations matters because useful systems must also be explainable, responsible and practical.'],
 ['Thinking beyond the code.','Reliable software depends on infrastructure and thoughtful systems design, not just what happens on screen.'],
 ['Turning language models into useful tools.','The exciting part is not a clever response; it is helping someone reach an answer they can verify.'],
 ['Question the data before the result.','Good analysis earns trust through clean inputs, honest methods and decisions that make sense.'],
 ['Make complex stories understandable.','A strong chart should invite questions and reveal what matters—even for someone who never writes SQL.'],
 ['Small scripts. Real leverage.','Python is a foundation for saving repetitive effort and making everyday workflows more dependable.'],
 ['Curiosity, applied with care.','New tools are worth learning when they solve actual problems, not simply because they are new.'],
 ['Learning keeps moving forward.','A credential marks progress, but its real value comes from what gets built and improved afterwards.']
];
var index=0,activeToken=0,lastButton=null;
function previewPath(c){return 'certificates/previews/'+c.path.split('/').pop().replace(/\.(?:pdf|png)$/i,'.webp');}
function showDoors(open){
 var wasOpen=wardrobe.classList.contains('cw-is-open');
 wardrobe.classList.toggle('cw-is-open',open);
 cabinetContent.inert=!open;
 cabinetContent.toggleAttribute('inert',!open);
 featureBtn.disabled=!open;
 shelfPrev.disabled=!open;
 shelfNext.disabled=!open;
 all('.cw-sleeve',shelf).forEach(function(b){b.disabled=!open;});
 if(!open&&viewer.open)viewer.close();
 if(open&&!wasOpen)renderFeatured();
 if(openBtn){
  openBtn.setAttribute('aria-expanded',String(open));
  openBtn.textContent=open?'Close wardrobe':'Open wardrobe';
 }
}
var manualDoorChoice=false;
openBtn?.addEventListener('click',function(){
 manualDoorChoice=true;
 showDoors(!wardrobe.classList.contains('cw-is-open'));
});
if('IntersectionObserver' in window){
 var obs=new IntersectionObserver(function(entries){
  if(entries.some(function(e){return e.isIntersecting;})){
   if(!manualDoorChoice)showDoors(true);
   obs.disconnect();
  }
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
 button.disabled=true;
 button.setAttribute('aria-pressed','false');
 button.addEventListener('click',function(){if(!isOpen())return;lastButton=button;selectCertificate(i);});
 shelf.appendChild(button);
});
/* Images are pre-rendered from the original PDF's first page and served
   directly from GitHub/Vercel; no CDN script or PDF worker on the critical path. */
/* Certificate controls never work while the cabinet is closed.
   The selected original certificate is shown large inside the wardrobe. */
function isOpen(){return wardrobe.classList.contains('cw-is-open');}
function renderFeatured(){
 var c=certificates[index];
 featureImg.src=previewPath(c);
 featureImg.alt='Full certificate preview: '+c.title+' by '+c.issuer;
 featureTitle.textContent=c.title;
 featureIssuer.textContent=c.issuer+' · '+numbered(index+1,certificates.length);
 featureBtn.setAttribute('aria-label','Open full-size certificate: '+c.title);
 var story=credentialStories[index];
 var storyNumber=$('#cwStoryNumber'),storyDate=$('#cwStoryDate'),
 storyTakeaway=$('#cwStoryTakeaway'),storyValue=$('#cwStoryValue'),storyCounter=$('#cwStoryCounter');
 if(storyNumber)storyNumber.textContent='CREDENTIAL '+numbered(index+1,certificates.length);
 if(storyDate)storyDate.textContent=c.date.toUpperCase();
 if(storyTakeaway)storyTakeaway.textContent=story[0];
 if(storyValue)storyValue.textContent=story[1];
 if(storyCounter)storyCounter.textContent=numbered(index+1,certificates.length);
 all('.cw-sleeve',shelf).forEach(function(b,i){b.setAttribute('aria-pressed',String(i===index));});
}
function selectCertificate(i){
 if(!isOpen())return;
 index=(i+certificates.length)%certificates.length;
 renderFeatured();
 var picked=$('.cw-sleeve[data-cert-index="'+index+'"]',shelf);
 if(picked)picked.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
}
featureBtn.addEventListener('click',function(){if(isOpen()){lastButton=featureBtn;openCertificate(index);}});
shelfPrev.addEventListener('click',function(){selectCertificate(index-1);});
shelfNext.addEventListener('click',function(){selectCertificate(index+1);});
wardrobe.addEventListener('keydown',function(e){
 if(!isOpen()||viewer.open||e.altKey||e.ctrlKey||e.metaKey)return;
 if(e.target===openBtn)return;
 if(e.key==='ArrowRight'){e.preventDefault();selectCertificate(index+1);}
 if(e.key==='ArrowLeft'){e.preventDefault();selectCertificate(index-1);}
});
renderFeatured();
showDoors(false);
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
 if(!isOpen())return;
 index=(i+certificates.length)%certificates.length;
 renderFeatured();
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
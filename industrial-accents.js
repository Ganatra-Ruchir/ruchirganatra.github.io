/* IRON / SIGNAL — non-interactive fractured cable accents. */
(function(){
'use strict';
if(!document.body || document.querySelector('.iron-break'))return;
var drawable=[
 '<svg viewBox="0 0 220 124" focusable="false" aria-hidden="true">',
 '<path class="rust-spall" d="M6 17l17-8 22 13-8 16-18-5z M192 92l16-11 18 13-6 18-23-7z"/>',
 '<path class="wire-sheath" d="M-12 24Q40 21 79 44L99 57"/>',
 '<path class="wire-braid" d="M-12 24Q40 21 79 44L99 57"/>',
 '<path class="wire-core" d="M-12 24Q40 21 79 44L99 57"/>',
 '<path class="wire-sheath" d="M128 69Q162 91 232 85"/>',
 '<path class="wire-braid" d="M128 69Q162 91 232 85"/>',
 '<path class="wire-core" d="M128 69Q162 91 232 85"/>',
 '<circle class="rust-socket" cx="99" cy="57" r="8"/>',
 '<circle class="rust-socket" cx="128" cy="69" r="8"/>',
 '<path class="arc-core" d="M105 56L111 49L117 63L123 60L127 68"/>',
 '<path class="arc-streak" d="M107 68L115 74L121 64M109 51L116 45"/>',
 '<circle class="arc-dot" cx="116" cy="49" r="2"/>',
 '<circle class="arc-dot" cx="119" cy="79" r="1.5"/>',
 '<circle class="arc-dot" cx="131" cy="55" r="1"/>',
 '</svg>'
].join('');
var targets=['#hero','#toolkit','#contact','.plan-banner'];
var pieces=[];
targets.forEach(function(selector){
 var host=document.querySelector(selector);
 if(!host)return;
 var wrap=document.createElement('div');
 wrap.className='iron-break';
 wrap.setAttribute('aria-hidden','true');
 wrap.setAttribute('role','presentation');
 wrap.innerHTML=drawable;
 host.appendChild(wrap);
 pieces.push(wrap);
});
if(!pieces.length)return;
var media=window.matchMedia('(prefers-reduced-motion: reduce)');
function allowed(){return !media.matches&&!document.body.classList.contains('motion-paused');}
function update(){
 pieces.forEach(function(el){
  el.classList.toggle('is-on',!document.hidden&&el.classList.contains('is-visible-zone')&&allowed());
 });
}
if('IntersectionObserver' in window){
 var io=new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
   entry.target.classList.toggle('is-visible-zone',entry.isIntersecting);
  });
  update();
 },{threshold:0.04,rootMargin:'60px 0px'});
 pieces.forEach(function(el){io.observe(el);});
}else{
 pieces.forEach(function(el){el.classList.add('is-visible-zone');});
 update();
}
if(media.addEventListener)media.addEventListener('change',update);
document.addEventListener('visibilitychange',update,{passive:true});
})();
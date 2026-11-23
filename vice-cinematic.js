/* About portrait carousel — three original photos, rotating every 3000 ms.
   Accessible reduced-motion fallback, and no timers on hidden tabs. */
(function(){
  'use strict';
  var root=document.getElementById('photoWrap');
  if(!root)return;
  var slides=Array.from(root.querySelectorAll('.about-portrait-slide'));
  var dots=Array.from(root.querySelectorAll('.about-photo-dot'));
  if(slides.length<2)return;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  var index=0;
  var timer=null;
  function show(next){
    index=(next+slides.length)%slides.length;
    slides.forEach(function(slide,i){
      var active=i===index;
      slide.classList.toggle('is-active',active);
      slide.setAttribute('aria-hidden',String(!active));
    });
    dots.forEach(function(dot,i){dot.classList.toggle('is-active',i===index)});
  }
  function stop(){if(timer!==null){window.clearInterval(timer);timer=null}}
  function start(){
    stop();
    if(document.hidden||reduce.matches)return;
    timer=window.setInterval(function(){show(index+1)},3000);
  }
  show(0);
  start();
  document.addEventListener('visibilitychange',function(){
    if(document.hidden)stop();
    else start();
  });
  if(reduce.addEventListener)reduce.addEventListener('change',function(){
    if(reduce.matches)show(0);
    start();
  });
  else if(reduce.addListener)reduce.addListener(function(){
    if(reduce.matches)show(0);
    start();
  });
})();

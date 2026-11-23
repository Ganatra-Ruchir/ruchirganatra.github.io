/* Optional parallax only; the images remain visible without JS. */
(function(){
 'use strict';
 var hero=document.querySelector('.vice-hero');
 var scene=hero&&hero.querySelector('.vice-scene');
 if(!scene)return;
 var fine=window.matchMedia('(pointer:fine)');
 var reduced=window.matchMedia('(prefers-reduced-motion:reduce)');
 var frame=0,x=0,y=0;
 function paint(){
  frame=0;
  scene.style.setProperty('--vice-tilt-y',(x*5.5).toFixed(2)+'deg');
  scene.style.setProperty('--vice-tilt-x',(-y*4).toFixed(2)+'deg');
  scene.style.setProperty('--vice-shift-x',(x*9).toFixed(1)+'px');
  scene.style.setProperty('--vice-shift-y',(y*7).toFixed(1)+'px');
  hero.style.setProperty('--vice-glow-x',(65+x*10).toFixed(1)+'%');
  hero.style.setProperty('--vice-glow-y',(44+y*7).toFixed(1)+'%');
 }
 function move(e){
  if(reduced.matches||!fine.matches||document.hidden)return;
  var r=scene.getBoundingClientRect();
  x=Math.max(-1,Math.min(1,((e.clientX-r.left)/r.width-.5)*2));
  y=Math.max(-1,Math.min(1,((e.clientY-r.top)/r.height-.5)*2));
  if(!frame)frame=requestAnimationFrame(paint);
 }
 function reset(){if(frame)cancelAnimationFrame(frame);frame=0;x=0;y=0;paint()}
 scene.addEventListener('pointermove',move,{passive:true});
 scene.addEventListener('pointerleave',reset,{passive:true});
 if(reduced.addEventListener)reduced.addEventListener('change',reset);
 if(fine.addEventListener)fine.addEventListener('change',reset);
 document.addEventListener('visibilitychange',function(){if(document.hidden)reset()});
})();

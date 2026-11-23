/* IRONWORK AMBIENCE
   Decorative severed wiring with occasional CSS sparks.
   Motion disables under reduced-motion preference. */
(function(){
'use strict';
var targets=[
 {selector:'#hero',placement:'is-hero'},
 {selector:'#work',placement:'is-work'}
];
var art='<svg viewBox="0 0 420 390" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">'
+'<path class="industrial-wire-sheath" d="M463 -27 C371 44 415 106 308 145 S219 217 188 250"/>'
+'<path class="industrial-wire-sheath" d="M462 14 C343 94 380 173 268 206 S195 238 159 285"/>'
+'<path class="industrial-wire-sheath" d="M449 83 C372 135 378 232 285 266 S235 293 218 323"/>'
+'<path class="industrial-wire-copper" d="M191 248 C169 259 164 281 146 293"/>'
+'<path class="industrial-wire-blue" d="M161 286 C151 302 135 305 119 314"/>'
+'<path class="industrial-wire-amber" d="M218 324 C199 332 203 346 188 350"/>'
+'<path class="industrial-wire-copper" d="M188 250 L167 271"/>'
+'<path class="industrial-wire-blue" d="M159 285 L143 304"/>'
+'<path class="industrial-wire-amber" d="M218 322 L205 337"/>'
+'<g class="industrial-wire-tips"><circle cx="146" cy="293" r="4.2"/><circle cx="119" cy="314" r="4.2"/><circle cx="188" cy="350" r="4.2"/></g>'
+'<path class="industrial-arc" d="M146 289 l-9 -13 14 -1 -4 -12 16 10"/>'
+'<path class="industrial-arc" d="M119 312 l-17 -2 7 -12 -14 -4"/>'
+'<path class="industrial-arc" d="M188 349 l9 -13 6 9 12 -10"/>'
+'<g class="industrial-spark"><path d="M137 278 l-5 -14 9 9 7 -16 -3 18 11 4 -13 3 -6 11z"/>'
+'<circle cx="165" cy="264" r="2.8"/><circle cx="111" cy="294" r="2.4"/></g>'
+'<g class="industrial-spark"><path d="M98 311 l-11 -12 13 5 1 -12 5 15 11 4 -13 2 -4 9z"/>'
+'<circle cx="91" cy="326" r="2"/><circle cx="116" cy="286" r="2"/></g>'
+'</svg>';
function mount(target){
 var root=document.querySelector(target.selector);
 if(!root||root.querySelector('.industrial-wires'))return;
 var layer=document.createElement('div');
 layer.className='industrial-wires '+target.placement;
 layer.setAttribute('aria-hidden','true');
 layer.setAttribute('role','presentation');
 layer.innerHTML=art;
 root.appendChild(layer);
}
if(document.readyState==='loading'){
 document.addEventListener('DOMContentLoaded',function(){targets.forEach(mount);},{once:true});
}else targets.forEach(mount);
})();
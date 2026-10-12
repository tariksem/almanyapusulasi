const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('assets/js/analytics-consent.js','utf8');
function setup(initial){
  const storage=new Map(initial?[['ap_cookie_consent',initial]]:[]),writes=[],loaded=[];
  const buttons={},cookies=new Set(['_ga','_ga_2E8PT2LRG1','essential']);
  let ready;
  const document={
    head:{appendChild(el){loaded.push(el);}},body:{appendChild(el){},classList:{toggle(){}}},
    querySelector(){return null;},addEventListener(name,fn){if(name==='DOMContentLoaded')ready=fn;},dispatchEvent(){},
    createElement(){return {remove(){},querySelector(selector){return buttons[selector]||(buttons[selector]={});}}}
  };
  Object.defineProperty(document,'cookie',{get(){return [...cookies].map(n=>n+'=value').join('; ');},set(value){writes.push(value);if(value.includes('Max-Age=0'))cookies.delete(value.split('=')[0]);}});
  const context={window:{},document,location:{pathname:'/araclar/',hostname:'almanyapusulasi.de'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},CustomEvent:class {},URL};
  context.window=context;vm.createContext(context);vm.runInContext(source,context);ready();
  return {context,loaded,buttons,cookies,writes};
}
const fresh=setup();assert(!fresh.loaded.some(e=>(e.src||'').includes('googletagmanager')));
fresh.context.APAnalytics.track('before_consent');assert(!fresh.context.dataLayer);
fresh.buttons['.cookie-reject'].onclick();
assert(!fresh.loaded.some(e=>(e.src||'').includes('googletagmanager')));
assert(!fresh.cookies.has('_ga'));assert(fresh.cookies.has('essential'));
const accepted=setup('accepted');
assert.equal(accepted.loaded.filter(e=>(e.src||'').includes('googletagmanager')).length,1);
accepted.context.APAnalytics.track('allowed');
assert(accepted.context.dataLayer.some(a=>a[0]==='event'&&a[1]==='allowed'));
// Exercise withdrawal and reacceptance with the real preference handlers.
const active=setup();active.buttons['.cookie-accept'].onclick();active.buttons['.cookie-reject'].onclick();
const count=active.context.dataLayer.length;active.context.APAnalytics.track('after_withdrawal');
assert.equal(active.context.dataLayer.length,count);assert.equal(active.context['ga-disable-G-2E8PT2LRG1'],true);
active.buttons['.cookie-accept'].onclick();assert.equal(active.context['ga-disable-G-2E8PT2LRG1'],false);
assert.equal(active.loaded.filter(e=>(e.src||'').includes('googletagmanager')).length,1);
assert(active.writes.some(s=>s.includes('domain=.almanyapusulasi.de')));
console.log('PASS consent: no tag before acceptance, rejected events blocked, cookies removed, withdrawal disables GA, reaccept uses one loader.');

const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('assets/js/analytics-consent.js','utf8');
function setup(initial,landingUrl='https://almanyapusulasi.de/araclar/?email=secret%40example.com'){
  const storage=new Map(initial?[['ap_cookie_consent',initial]]:[]),writes=[],loaded=[];
  const buttons={},cookies=new Set(['_ga','_ga_2E8PT2LRG1','essential']);
  let ready,click;
  const document={
    head:{appendChild(el){loaded.push(el);}},body:{appendChild(el){},classList:{toggle(){}}},
    querySelector(){return null;},addEventListener(name,fn){if(name==='DOMContentLoaded')ready=fn;if(name==='click')click=fn;},dispatchEvent(){},
    createElement(){return {remove(){},setAttribute(){},querySelector(selector){return buttons[selector]||(buttons[selector]={focus(){}});}}}
  };
  Object.defineProperty(document,'cookie',{get(){return [...cookies].map(n=>n+'=value').join('; ');},set(value){writes.push(value);if(value.includes('Max-Age=0'))cookies.delete(value.split('=')[0]);}});
  const context={window:{},document,location:{pathname:'/araclar/',hostname:'almanyapusulasi.de',origin:'https://almanyapusulasi.de',href:landingUrl},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},CustomEvent:class {},URL};
  context.window=context;vm.createContext(context);vm.runInContext(source,context);ready();
  return {context,loaded,buttons,cookies,writes,click:(event)=>click(event)};
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
const configEvent=accepted.context.dataLayer.find(a=>a[0]==='config');
assert.equal(configEvent[2].page_location,'https://almanyapusulasi.de/araclar/');
const campaign=setup('accepted','https://almanyapusulasi.de/araclar/?utm_source=facebook&utm_medium=social&utm_campaign=nov2026&email=secret%40example.com');
const campaignConfig=campaign.context.dataLayer.find(a=>a[0]==='config')[2];
assert.equal(campaignConfig.page_location,'https://almanyapusulasi.de/araclar/?utm_source=facebook&utm_medium=social&utm_campaign=nov2026');
assert.equal(campaignConfig.page_referrer,'');
const unsafeCampaign=setup('accepted','https://almanyapusulasi.de/araclar/?utm_source=email%40example.com&utm_medium=social&utm_campaign=nov2026#private');
const unsafeUrl=unsafeCampaign.context.dataLayer.find(a=>a[0]==='config')[2].page_location;
assert(!unsafeUrl.includes('email%40example.com'));
assert(!unsafeUrl.includes('private'));
const affiliateHref='https://partner.example/offer?email=sensitive%40example.com#private';
const anchor={href:affiliateHref,textContent:'Partner offer',getAttribute:k=>k==='href'?affiliateHref:null};
accepted.click({target:{closest:selector=>selector==='a'?anchor:null}});
const outbound=accepted.context.dataLayer.find(a=>a[0]==='event'&&a[1]==='outbound_click');
assert(outbound,'outbound tracking event exists after opt-in');
assert.equal(outbound[2].link_url,'https://partner.example/offer');
// Exercise withdrawal and reacceptance with the real preference handlers.
const active=setup();active.buttons['.cookie-accept'].onclick();active.buttons['.cookie-reject'].onclick();
const count=active.context.dataLayer.length;active.context.APAnalytics.track('after_withdrawal');
assert.equal(active.context.dataLayer.length,count);assert.equal(active.context['ga-disable-G-2E8PT2LRG1'],true);
active.buttons['.cookie-accept'].onclick();assert.equal(active.context['ga-disable-G-2E8PT2LRG1'],false);
assert.equal(active.loaded.filter(e=>(e.src||'').includes('googletagmanager')).length,1);
assert(active.writes.some(s=>s.includes('domain=.almanyapusulasi.de')));
console.log('PASS consent: no tag before acceptance, rejected events blocked, cookies removed, withdrawal disables GA, reaccept uses one loader.');

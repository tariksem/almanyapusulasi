const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const listeners={},events=[],observers=[];let consent=null;
const slot={getAttribute:()=> 'bank-comparison',classList:{contains:()=>true}};
const stack={getAttribute:()=> 'bank-offers',classList:{contains:()=>true},querySelectorAll:()=>[{},{}]};
class Observer{
 constructor(callback){this.callback=callback;this.targets=new Set();observers.push(this);}
 observe(target){this.targets.add(target);this.callback([{target,isIntersecting:true}]);}
 unobserve(target){this.targets.delete(target);}
}
const context={
 window:{APAnalytics:{track:(name,payload)=>events.push({name,payload})},IntersectionObserver:Observer},
 document:{
  title:'Test comparison',
  addEventListener:(name,fn)=>(listeners[name]||(listeners[name]=[])).push(fn),
  querySelector:selector=>selector==='[data-affiliate-slot]'?slot:null,
  querySelectorAll:selector=>selector==='[data-affiliate-slot]'?[slot]:selector==='[data-offer-stack]'?[stack]:[]
 },
 IntersectionObserver:Observer,localStorage:{getItem:()=>consent},
 location:{pathname:'/test/',origin:'https://almanyapusulasi.de'},URL
};
vm.runInNewContext(fs.readFileSync('assets/js/commercial-tracking.js','utf8'),context);
const dispatch=name=>(listeners[name]||[]).forEach(fn=>fn());
dispatch('DOMContentLoaded');
assert.equal(events.length,0,'No impressions without consent');
assert(observers.every(o=>o.targets.size===1),'Observers must stay available before consent');
consent='accepted';dispatch('ap:analytics-ready');
assert.deepEqual(events.map(e=>e.name),['commercial_page_view','affiliate_slot_view','commercial_offer_stack_view']);
assert.equal(events[2].payload.offer_count,2);
dispatch('ap:analytics-ready');assert.equal(events.length,3,'No duplicate impressions on reaccept');
const link={href:'https://example.com/offer',textContent:'Test offer',getAttribute:name=>({'data-track':'affiliate_click','data-commercial-area':'bank-comparison','data-commercial-target':'bank-affiliate','data-commercial-provider':'TEST'}[name]||null)};
const click=()=>listeners.click.forEach(fn=>fn({target:{closest:selector=>selector==='a[data-track]'?link:null}}));
consent='rejected';click();assert.equal(events.length,3,'Withdrawal blocks clicks');
consent='accepted';click();assert.equal(events.at(-1).name,'affiliate_click');
console.log('PASS commercial consent: no pre-consent events, acceptance measures visible placements once, withdrawal blocks clicks. No partner requests sent.');

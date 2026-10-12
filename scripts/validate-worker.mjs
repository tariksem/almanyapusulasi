import assert from 'node:assert/strict';
import worker from '../worker.mjs';
const calls=[];
const env={ASSETS:{fetch:async request=>{calls.push(request.url);return new Response('asset',{headers:{'Content-Type':'text/html'}});}}};
for(const host of ['http://almanyapusulasi.de','http://www.almanyapusulasi.de','https://www.almanyapusulasi.de']){
  const r=await worker.fetch(new Request(host+'/araclar/?utm_source=test'),env);
  assert.equal(r.status,308);assert.equal(r.headers.get('Location'),'https://almanyapusulasi.de/araclar/?utm_source=test');
}
const legacy=await worker.fetch(new Request('https://www.almanyapusulasi.de/kindergeld-2026/?x=1'),env);
assert.equal(legacy.status,301);assert.equal(legacy.headers.get('Location'),'https://almanyapusulasi.de/kindergeld/?x=1');
const normal=await worker.fetch(new Request('https://almanyapusulasi.de/araclar/'),env);
assert.equal(normal.status,200);assert.equal(await normal.text(),'asset');assert.equal(calls.length,1);
assert.equal(normal.headers.get('X-Content-Type-Options'),'nosniff');
assert.equal(normal.headers.get('Strict-Transport-Security'),'max-age=86400');
assert.equal(normal.headers.get('Content-Security-Policy'),"frame-ancestors 'self'");
assert.equal(normal.headers.get('X-Frame-Options'),'SAMEORIGIN');
assert(normal.headers.get('Content-Security-Policy-Report-Only').includes("default-src 'self'"));
assert(normal.headers.get('Content-Security-Policy-Report-Only').includes("worker-src 'self' blob:"));
const embed=await worker.fetch(new Request('https://almanyapusulasi.de/araclar/?embed=1'),env);
assert(embed.headers.get('Content-Security-Policy').includes('https:'),'External embeds must remain available');
assert(!embed.headers.has('X-Frame-Options'));
const normalized=await worker.fetch(new Request('https://almanyapusulasi.de/araclar'),{ASSETS:{fetch:async()=>new Response(null,{status:307,headers:{Location:'/araclar/'}})}});
assert.equal(normalized.status,308);
const missing=await worker.fetch(new Request('https://almanyapusulasi.de/missing/'),{ASSETS:{fetch:async()=>new Response('Not found',{status:404})}});
assert.equal(missing.status,404);
console.log('PASS worker: HTTPS/apex, query preservation, legacy redirects, asset normalization, headers and 404.');

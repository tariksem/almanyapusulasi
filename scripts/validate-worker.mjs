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
assert(normal.headers.get('Cache-Control').includes('no-transform'),'HTML must suppress Cloudflare automatic analytics injection');
assert.equal(normal.headers.get('Strict-Transport-Security'),'max-age=2592000');
assert.equal(normal.headers.get('Content-Security-Policy'),"frame-ancestors 'self'; object-src 'none'; base-uri 'self'");
assert.equal(normal.headers.get('X-Frame-Options'),'SAMEORIGIN');
assert(normal.headers.get('Content-Security-Policy-Report-Only').includes("default-src 'self'"));
assert(normal.headers.get('Content-Security-Policy-Report-Only').includes("worker-src 'self' blob:"));
assert(normal.headers.get('Content-Security-Policy').includes("object-src 'none'; base-uri 'self'"));
for(const slug of [
  'almanya-emeklilik-hesaplayici-2026',
  'chancenkarte-puan-hesaplayici-2026',
  'blue-card-uygunluk-kontrolu-2026',
  'brutto-netto-hesaplayici-2026'
]){
  const embed=await worker.fetch(new Request('https://almanyapusulasi.de/'+slug+'/?embed=1'),env);
  assert(embed.headers.get('Content-Security-Policy').includes('https:'),'Allowed tool embed must remain available: '+slug);
  assert(!embed.headers.has('X-Frame-Options'),'Allowed tool embed cannot use SAMEORIGIN: '+slug);
}
for(const page of ['/araclar/','/','/familienversicherung/']){
  const blocked=await worker.fetch(new Request('https://almanyapusulasi.de'+page+'?embed=1'),env);
  assert((blocked.headers.get('Content-Security-Policy')||'').startsWith("frame-ancestors 'self'; object-src 'none'; base-uri 'self'"),'Other pages must not permit external framing');
  assert.equal(blocked.headers.get('X-Frame-Options'),'SAMEORIGIN');
}
// Scoped enforcement applies to four affiliate and eight reviewed editorial
// pages. Dynamic tools, especially OCR, stay Report-Only.
for(const path of [
  '/stromtarif-karsilastirma-2026/',
  '/haftpflicht-karsilastirma-2026/',
  '/private-krankenversicherung-pkv-2026/',
  '/kfz-versicherung-karsilastirma-2026/',
  '/familienversicherung/',
  '/krankenkasse-degistirme/',
  '/is-birakinca-saglik-sigortasi/',
  '/wohngeld/',
  '/kindergeld/',
  '/haberler/',
  '/almanya-2026-resmi-esikler/',
  '/berufsunfaehigkeitsversicherung/'
]){
  const r=await worker.fetch(new Request('https://almanyapusulasi.de'+path),env);
  const policy=r.headers.get('Content-Security-Policy')||'';
  assert(policy.includes("script-src 'self' 'unsafe-inline' https://www.googletagmanager.com"),path+' missing restricted script-src');
  assert(policy.includes("connect-src 'self' https://*.google-analytics.com"),path+' missing restricted connect-src');
  assert(policy.includes("frame-src 'none'"),path+' must not embed third-party widgets');
  assert(policy.includes("form-action 'self'"),path+' must block off-origin form submissions');
}
for(const path of ['/nebenkosten-abrechnung-kontrolu/','/sigorta-secim-araci/']){
  const r=await worker.fetch(new Request('https://almanyapusulasi.de'+path),env);
  assert(!r.headers.get('Content-Security-Policy').includes('script-src'),path+' must retain CSP report-only for dynamic workflows');
}
const normalized=await worker.fetch(new Request('https://almanyapusulasi.de/araclar'),{ASSETS:{fetch:async()=>new Response(null,{status:307,headers:{Location:'/araclar/'}})}});
assert.equal(normalized.status,308);
const jsAsset=await worker.fetch(new Request('https://almanyapusulasi.de/assets/js/analytics-consent.js'),{ASSETS:{fetch:async()=>new Response('x', {headers:{'Content-Type':'application/javascript','Cache-Control':'public, max-age=604800'}})}});
assert.equal(jsAsset.headers.get('Cache-Control'),'public, max-age=604800','Non-HTML caching must remain unchanged');
const missing=await worker.fetch(new Request('https://almanyapusulasi.de/missing/'),{ASSETS:{fetch:async()=>new Response('Not found',{status:404})}});
assert.equal(missing.status,404);
const audioBytes=Uint8Array.of(0x49,0x44,0x33,0x04,0x00,0x01);
const audioEnv={ASSETS:{fetch:async request=>new Response(
  request.method==='HEAD'?null:audioBytes,
  {headers:{'Content-Type':'audio/mpeg','Content-Length':String(audioBytes.length),ETag:'"audio"'}}
)}};
const audioRequest=(headers,method='GET',path='/gunluk-almanca/apartman.mp3')=>
  worker.fetch(new Request('https://almanyapusulasi.de'+path,{headers,method}),audioEnv);
for(const path of [
  '/gunluk-almanca/apartman.mp3',
  '/almanca-akademisi-demo/audio/lesson.mp3',
  '/almanca-akademisi-demo/audio_new/lesson.mp3',
  '/almanca-akademisi-demo/audio_v14/lesson.mp3'
]){
  const probe=await audioRequest({Range:'bytes=0-1'},'GET',path);
  assert.equal(probe.status,206);
  assert.equal(probe.headers.get('Accept-Ranges'),'bytes');
  assert.equal(probe.headers.get('Content-Range'),'bytes 0-1/6');
  assert.equal(probe.headers.get('Content-Length'),'2');
  assert.equal(probe.headers.get('Content-Type'),'audio/mpeg');
  assert.equal(probe.headers.get('ETag'),'"audio"');
  assert.deepEqual(new Uint8Array(await probe.arrayBuffer()),audioBytes.slice(0,2));
}
for(const range of ['bytes=4-','bytes=-2','bytes=4-20']){
  const partial=await audioRequest({Range:range,'If-Range':'"audio"'});
  assert.equal(partial.status,206);
  assert.equal(partial.headers.get('Content-Range'),'bytes 4-5/6');
  assert.deepEqual(new Uint8Array(await partial.arrayBuffer()),audioBytes.slice(4));
}
for(const range of ['bytes=6-','bytes=-0']){
  const unsatisfied=await audioRequest({Range:range});
  assert.equal(unsatisfied.status,416);
  assert.equal(unsatisfied.headers.get('Content-Range'),'bytes */6');
  assert.equal((await unsatisfied.arrayBuffer()).byteLength,0);
}
for(const headers of [
  {},{Range:'bytes=4-2'},{Range:'bytes=0-1,4-5'},{Range:'bytes=0-1','If-Range':'"old"'}
]){
  const full=await audioRequest(headers);
  assert.equal(full.status,200);
  assert.equal(full.headers.get('Accept-Ranges'),'bytes');
  assert.equal(full.headers.get('Content-Range'),null);
  assert.deepEqual(new Uint8Array(await full.arrayBuffer()),audioBytes);
}
const audioHead=await audioRequest({Range:'bytes=0-1'},'HEAD');
assert.equal(audioHead.status,200);
assert.equal(audioHead.headers.get('Content-Length'),'6');
assert.equal((await audioHead.arrayBuffer()).byteLength,0);
const unrelatedAudio=await audioRequest({Range:'bytes=0-1'},'GET','/assets/other.mp3');
assert.equal(unrelatedAudio.status,200);
assert.equal(unrelatedAudio.headers.get('Accept-Ranges'),null);
console.log('PASS worker: HTTPS/apex, query preservation, legacy redirects, asset normalization, headers, 404 and lesson audio ranges.');

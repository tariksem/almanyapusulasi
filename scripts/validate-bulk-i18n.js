const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const {
  SITE,sourcePaths,routeFromPath,fileFromPath,extractStaticSegments,referencedRuntimeSegments,
  segmentId,numericTokens,attrValue
}=require('./bulk-i18n-lib.js');
const {curatedRoutes,translatedRoutes}=require('./i18n-registry.js');

const catalog=JSON.parse(fs.readFileSync('data/i18n-bulk-translations.json','utf8'));
const pages=catalog.pages||{};
const strings=catalog.strings||{};
const curated=new Set(curatedRoutes());
const publishedRoutes=translatedRoutes();
const publishedRouteSet=new Set(publishedRoutes);
const expected=sourcePaths().filter(path=>path!=='/'&&!curated.has(routeFromPath(path))).map(routeFromPath).sort();
const actual=Object.keys(pages).sort();
assert.deepEqual(actual,expected,'Bulk catalog must exactly cover the source inventory left after curated translations');
assert.equal(actual.length,185,'The verified backlog changed; review inventory instead of silently changing the denominator');
assert.equal(publishedRouteSet.size,227,'Every non-home Turkish route must publish exactly once');

const sorted=value=>[...value].sort();
const ids=html=>[...html.matchAll(/\sid\s*=\s*["']([^"']+)["']/gi)].map(match=>match[1]).sort();
const headings=html=>[...html.matchAll(/<(h[1-6])\b/gi)].map(match=>match[1].toLowerCase()).sort();
const scripts=html=>[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map(match=>({src:attrValue('<script '+match[1]+'>','src'),type:attrValue('<script '+match[1]+'>','type'),body:match[2]}));
const scriptSignature=html=>scripts(html).filter(item=>!item.src&&!/application\/ld\+json/i.test(item.type||'')).map(item=>crypto.createHash('sha256').update(item.body).digest('hex')).sort();
const scriptSources=html=>scripts(html).map(item=>item.src).filter(Boolean).filter(src=>!src.includes('bulk-i18n-runtime.js')).sort();
const styleSources=html=>[...html.matchAll(/<link\b[^>]*rel\s*=\s*["']stylesheet["'][^>]*>/gi)].map(match=>attrValue(match[0],'href')).sort();
const logoSources=html=>[...html.matchAll(/<img\b[^>]*>/gi)].map(match=>attrValue(match[0],'src')).filter(src=>src&&/logo|favicon/i.test(src)).sort();
const bodyClass=html=>attrValue(html.match(/<body\b[^>]*>/i)?.[0]||'','class')||'';
const formSignature=html=>[...html.matchAll(/<(?:form|input|select|textarea|button)\b[^>]*>/gi)].map(match=>{
  const tag=match[0];
  return [tag.match(/^<([a-z]+)/i)?.[1].toLowerCase(),attrValue(tag,'id')||'',attrValue(tag,'name')||'',attrValue(tag,'type')||'',attrValue(tag,'data-tool')||''].join('|');
}).sort();
const suspiciousTurkish=value=>[...String(value).matchAll(/\b(?:ve|veya|için|değil|gerekli|hesapla|kontrol|sonuç|seçin|başvuru|rehber|aç|kapat|devam|geri|gelir|gider|maaş|vergi|sigorta|kira|çocuk|aile|araç|tutar|uygun|bilgi|kaynak|gizlilik|iletişim)\b/gi)].length;
const sourceLikelyTurkish=value=>/[çğıİşÇĞŞ]/.test(String(value))||suspiciousTurkish(value)>0;
const digits=value=>(String(value).match(/\d+/g)||[]).sort();

const verified=[];
let staticCount=0,runtimeCount=0;
for(const route of actual){
  const page=pages[route];
  const sourceFile=page.sourceFile||fileFromPath(page.path);
  const source=fs.readFileSync(sourceFile,'utf8');
  const extracted=extractStaticSegments(source);
  const runtime=referencedRuntimeSegments(source);
  if(route==='haberler'){
    // The archive is built from time-sensitive editorial data on each deployment.
    // Validate every CURRENT extracted segment against a verified translation below;
    // an older catalog inventory is not a stable source-of-truth for this route.
    const currentIds=extracted.map(item=>item.id);
    assert.equal(new Set(currentIds).size,currentIds.length,
      'News archive contains duplicated translatable source segments');
    const missing=currentIds.filter(id=>!strings[id]||!strings[id].en||!strings[id].de);
    assert.deepEqual(missing,[],
      'Generated news archive has text missing from the EN/DE translation catalog');
    const added=currentIds.filter(id=>!page.segments.includes(id));
    const removed=page.segments.filter(id=>!currentIds.includes(id));
    if(added.length||removed.length)
      console.log('Dynamic news archive inventory: '+added.length+' new, '+removed.length+' removed source IDs; all current segments have translations');
  }else{
    assert.deepEqual(sorted(new Set(page.segments)),sorted(new Set(extracted.map(item=>item.id))),route+' source text changed; rebuild and re-verify the translation catalog');
  }
  assert.deepEqual(sorted(new Set(page.runtime||[])),sorted(new Set(runtime.map(item=>item.id))),route+' runtime UI text changed; rebuild catalog');
  staticCount+=page.segments.length;runtimeCount+=(page.runtime||[]).length;

  for(const item of [...extracted,...runtime]){
    const entry=strings[item.id];
    assert.ok(entry,route+' missing catalog entry '+item.id);
    assert.equal(segmentId(entry.tr),item.id,route+' catalog source hash mismatch');
    for(const lang of ['en','de']){
      assert.ok(entry[lang]&&entry[lang].trim(),route+' '+lang+' has an empty translation');
      const sourceDigits=digits(entry.tr),targetDigits=digits(entry[lang]);
      for(const number of new Set(sourceDigits))assert.ok(targetDigits.filter(item=>item===number).length>=sourceDigits.filter(item=>item===number).length,route+' '+lang+' numeric token lost: '+entry.tr);
      if(sourceLikelyTurkish(entry.tr)){
        const sourceScore=suspiciousTurkish(entry.tr);
        if(entry.tr.length>15)assert.notEqual(entry[lang].toLocaleLowerCase('tr'),entry.tr.toLocaleLowerCase('tr'),route+' '+lang+' retained Turkish source as a fake translation: '+entry.tr);
        if(sourceScore)assert.ok(suspiciousTurkish(entry[lang])<=Math.floor(sourceScore/3),route+' '+lang+' retains too much Turkish: '+entry[lang]);
      }
    }
  }

  for(const lang of ['en','de']){
    const file=lang+'/'+route+'/index.html';
    assert.ok(fs.existsSync(file),'Generated localized file missing: '+file);
    const html=fs.readFileSync(file,'utf8');
    const pathname='/'+route+'/';
    assert.match(html,new RegExp('<html\\b[^>]*lang=["\\\']'+lang+'["\\\']','i'),file+' html language');
    const canonicalTag=html.match(/<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>/i)?.[0]||'';
    assert.equal(attrValue(canonicalTag,'href'),SITE+'/'+lang+pathname,file+' canonical');
    for(const code of ['tr','en','de','x-default'])assert.ok(html.includes('hreflang="'+code+'"'),file+' missing '+code+' alternate');
    assert.ok(html.includes('name="ap-i18n-verification" content="catalog-generated"'),file+' verification marker');
    assert.ok(html.includes('/assets/js/bulk-i18n-runtime.js" data-lang="'+lang+'"'),file+' runtime localization');
    assert.deepEqual(ids(html),ids(source),file+' DOM ids/function hooks changed');
    assert.deepEqual(headings(html),headings(source),file+' heading structure changed');
    assert.deepEqual(formSignature(html),formSignature(source),file+' form controls changed');
    assert.deepEqual(scriptSources(html),scriptSources(source),file+' functional script set changed');
    assert.deepEqual(scriptSignature(html),scriptSignature(source),file+' inline functional logic changed');
    assert.deepEqual(styleSources(html),styleSources(source),file+' design stylesheets changed');
    assert.deepEqual(logoSources(html),logoSources(source),file+' logo asset references changed');
    assert.equal(bodyClass(html),bodyClass(source),file+' V4.1/V4.2 source design class changed');
    const staticHtml=html.replace(/<(script|style|code|pre|svg|noscript|template)\b[\s\S]*?<\/\1\s*>/gi,'');
    for(const href of [...staticHtml.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["']/gi)].map(match=>match[1])){
      if(!href.startsWith('/'))continue;
      const clean=href.replace(/^\/(?:en|de)(?=\/|$)/,'');
      const target=routeFromPath(clean.split(/[?#]/)[0]);
      if(publishedRouteSet.has(target))assert.ok(href.startsWith('/'+lang+'/'),file+' same-language internal link missing: '+href);
    }
  }
  verified.push(page.path);
}

for(const lang of ['en','de']){
  const payload=JSON.parse(fs.readFileSync('assets/data/bulk-i18n-'+lang+'.json','utf8'));
  assert.equal(payload.lang,lang);
  assert.equal(payload.routes.length,publishedRoutes.length,lang+' runtime route registry');
  assert.equal(Object.keys(payload.translations).length,new Set(Object.values(pages).flatMap(page=>page.runtime||[])).size,lang+' runtime catalog size');
}

const report={
  date:new Date().toISOString().slice(0,10),
  status:'automated-structural-functional-language-qa-passed',
  humanReviewed:false,
  routes:verified.length,
  staticSegments:staticCount,
  runtimeSegments:runtimeCount,
  verifiedPaths:verified.sort()
};
fs.writeFileSync('i18n-bulk-verification.json',JSON.stringify(report,null,2)+'\n');
console.log('Bulk i18n QA passed: '+verified.length+' routes × 2 languages; source structure, SEO, V4 design, logo, numeric facts, forms, scripts, links and runtime UI preserved.');

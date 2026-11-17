const fs=require('node:fs');
const {
  sourcePaths,routeFromPath,fileFromPath,extractStaticSegments,referencedRuntimeSegments
}=require('./bulk-i18n-lib.js');
const {curatedRoutes}=require('./i18n-registry.js');

const OUTPUT='data/i18n-bulk-translations.json';
const TARGETS=['en','de'];
const TRANSLATE_ENDPOINT='https://translate.googleapis.com/translate_a/single';
const concurrency=Math.max(1,Math.min(8,Number(process.argv.find(arg=>arg.startsWith('--concurrency='))?.split('=')[1]||4)));
const inventoryOnly=process.argv.includes('--inventory-only');

const previous=fs.existsSync(OUTPUT)?JSON.parse(fs.readFileSync(OUTPUT,'utf8')):{strings:{},pages:{}};
const curated=new Set(curatedRoutes());
const paths=sourcePaths().filter(path=>path!=='/'&&!curated.has(routeFromPath(path)));
const strings={};
const pages={};
const runtimeIds=new Set();

for(const pathname of paths){
  const route=routeFromPath(pathname);
  const sourceFile=fileFromPath(pathname);
  if(!fs.existsSync(sourceFile))throw new Error('Inventory points to missing source: '+sourceFile);
  const html=fs.readFileSync(sourceFile,'utf8');
  const staticSegments=extractStaticSegments(html);
  const runtimeSegments=referencedRuntimeSegments(html);
  const add=item=>{
    const old=previous.strings?.[item.id];
    strings[item.id]={tr:item.source,en:old?.tr===item.source?old.en||'':'',de:old?.tr===item.source?old.de||'':''};
  };
  staticSegments.forEach(add);
  runtimeSegments.forEach(item=>{add(item);runtimeIds.add(item.id);});
  pages[route]={path:pathname,sourceFile,segments:staticSegments.map(item=>item.id),runtime:runtimeSegments.map(item=>item.id)};
}

const used=new Set(Object.values(pages).flatMap(page=>[...page.segments,...page.runtime]));
for(const id of Object.keys(strings))if(!used.has(id))delete strings[id];

const catalog={
  schemaVersion:1,
  sourceLanguage:'tr',
  targetLanguages:TARGETS,
  translationMethod:'machine-assisted-neural-translation',
  generatedAt:new Date().toISOString().slice(0,10),
  pages,
  runtime:[...runtimeIds].sort(),
  strings
};

function save(){fs.writeFileSync(OUTPUT,JSON.stringify(catalog,null,2)+'\n');}
save();
console.log('Bulk inventory: '+paths.length+' source routes, '+Object.keys(strings).length+' unique strings, '+runtimeIds.size+' runtime strings.');
if(paths.length!==185)throw new Error('Expected the verified 185-route backlog, found '+paths.length+'. Review source inventory before translating.');
if(inventoryOnly){console.log('Inventory-only mode: untranslated entries retained for review.');process.exit(0);}

function batches(items,maxChars=4200,maxItems=35){
  const result=[];
  let batch=[],size=0;
  for(const item of items){
    const cost=item.source.length+28;
    if(batch.length&&(batch.length>=maxItems||size+cost>maxChars)){result.push(batch);batch=[];size=0;}
    batch.push(item);size+=cost;
  }
  if(batch.length)result.push(batch);
  return result;
}

const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function request(text,target){
  const params=new URLSearchParams({client:'gtx',sl:'tr',tl:target,dt:'t',q:text});
  let last;
  for(let attempt=0;attempt<9;attempt++){
    try{
      await delay(250);
      const response=await fetch(TRANSLATE_ENDPOINT,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded;charset=UTF-8','user-agent':'AlmanyaPusulasi-i18n-build/1.0'},body:params});
      if(!response.ok){
        const error=new Error('HTTP '+response.status);
        error.status=response.status;
        error.retryAfter=Number(response.headers.get('retry-after')||0);
        throw error;
      }
      const payload=await response.json();
      const translated=(payload[0]||[]).map(part=>part[0]||'').join('').trim();
      if(!translated)throw new Error('Empty translation response');
      return translated;
    }catch(error){
      last=error;
      const wait=error.status===429?Math.min(45000,Math.max(error.retryAfter*1000,3000*Math.pow(1.8,attempt))):Math.min(15000,500*Math.pow(2,attempt));
      await delay(wait);
    }
  }
  throw last;
}

async function translateBatch(batch,target){
  const protectedNumbers=[];
  const prepared=batch.map((item,index)=>{
    const values=[];
    const text=item.source.replace(/\d[\d.,:/–-]*/g,value=>{
      const marker='⟦APNUM'+String(index).padStart(3,'0')+'X'+String(values.length).padStart(3,'0')+'⟧';
      values.push([marker,value]);
      return marker;
    });
    protectedNumbers.push(values);
    return text;
  });
  const source=prepared.map((text,index)=>'⟦APSEG'+String(index).padStart(5,'0')+'⟧\n'+text).join('\n');
  const translated=await request(source,target);
  const pieces=new Map();
  const pattern=/⟦APSEG(\d{5})⟧\s*([\s\S]*?)(?=⟦APSEG\d{5}⟧|$)/g;
  for(const match of translated.matchAll(pattern))pieces.set(Number(match[1]),match[2].trim());
  if(pieces.size!==batch.length){
    if(batch.length===1){
      let value=translated.replace(/^⟦APSEG\d{5}⟧\s*/,'').trim();
      for(const [marker,number] of protectedNumbers[0])value=value.split(marker).join(number);
      return [value];
    }
    const midpoint=Math.ceil(batch.length/2);
    return [...await translateBatch(batch.slice(0,midpoint),target),...await translateBatch(batch.slice(midpoint),target)];
  }
  return batch.map((_,index)=>{
    let value=pieces.get(index);
    for(const [marker,number] of protectedNumbers[index])value=value.split(marker).join(number);
    return value;
  });
}

async function runTarget(target){
  const pending=Object.entries(strings).filter(([,entry])=>!entry[target]).map(([id,entry])=>({id,source:entry.tr}));
  const jobs=batches(pending);
  console.log(target.toUpperCase()+': '+pending.length+' strings in '+jobs.length+' requests.');
  let cursor=0,completed=0;
  async function worker(){
    while(true){
      const index=cursor++;
      if(index>=jobs.length)return;
      const job=jobs[index];
      const results=await translateBatch(job,target);
      results.forEach((value,itemIndex)=>{
        if(!value||/⟦APSEG\d+⟧/.test(value))throw new Error('Invalid translation marker output: '+job[itemIndex].source);
        const before=(job[itemIndex].source.match(/\d+/g)||[]).sort();
        const after=(value.match(/\d+/g)||[]).sort();
        const counts=list=>list.reduce((map,item)=>(map[item]=(map[item]||0)+1,map),{});
        const sourceCounts=counts(before),targetCounts=counts(after);
        if(Object.entries(sourceCounts).some(([number,count])=>(targetCounts[number]||0)<count))throw new Error('Numeric drift in '+target+': '+job[itemIndex].source+' -> '+value);
        strings[job[itemIndex].id][target]=value;
      });
      completed++;
      if(completed%5===0||completed===jobs.length){save();console.log(target.toUpperCase()+': '+completed+'/'+jobs.length+' batches saved.');}
    }
  }
  await Promise.all(Array.from({length:Math.min(concurrency,jobs.length||1)},()=>worker()));
  save();
}

(async()=>{
  for(const target of TARGETS)await runTarget(target);
  const incomplete=Object.values(strings).filter(entry=>!entry.en||!entry.de);
  if(incomplete.length)throw new Error(incomplete.length+' catalog strings remain untranslated');
  console.log('Bulk catalog complete: '+Object.keys(pages).length+' routes, '+Object.keys(strings).length+' verified source strings in EN and DE.');
})().catch(error=>{save();console.error(error);process.exit(1);});

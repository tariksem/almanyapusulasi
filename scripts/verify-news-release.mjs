import fs from 'node:fs';
import assert from 'node:assert/strict';

const SHA=process.env.GITHUB_SHA||'';
const BASE='https://almanyapusulasi.de';
const mode=process.argv[2];
assert.match(SHA,/^[a-f0-9]{40}$/i,'A real GITHUB_SHA is required');

function validateNews(html,page){
  assert.match(html,/<html\b[^>]*lang="tr"/i,page+' must be Turkish');
  const links=[...html.matchAll(/<a\s+class="news-card"\s+href="([^"]+)"/g)].map(m=>m[1]);
  assert.ok(links.length>0,page+': no news cards');
  assert.equal(new Set(links).size,links.length,page+': duplicate news cards');
  for(const href of links){
    assert.match(href,/^\/haberler\/[a-z0-9-]+\/$/,page+': non-Turkish/invalid news link '+href);
  }
  return links;
}

function validatePages(home,archive){
  const homeLinks=validateNews(home,'Homepage');
  const archiveLinks=validateNews(archive,'News archive');
  for(const href of homeLinks)assert.ok(archiveLinks.includes(href),'Homepage news missing from archive: '+href);
  return {homeCount:homeLinks.length,archiveCount:archiveLinks.length};
}

if(mode==='bundle'){
  const home=fs.readFileSync('dist/index.html','utf8');
  const archive=fs.readFileSync('dist/haberler/index.html','utf8');
  const counts=validatePages(home,archive);
  const stamp={commit:SHA,createdAt:new Date().toISOString(),...counts};
  fs.writeFileSync('dist/release-status.json',JSON.stringify(stamp)+'\n');
  console.log('Bundle release verified',stamp);
}else if(mode==='live'){
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  async function get(path){
    const url=BASE+path+(path.includes('?')?'&':'?')+'release='+SHA;
    const response=await fetch(url,{cache:'no-store',headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new Error(path+' HTTP '+response.status);
    return response.text();
  }
  let last;
  for(let attempt=1;attempt<=6;attempt++){
    try{
      const stamp=JSON.parse(await get('/release-status.json'));
      assert.equal(stamp.commit,SHA,'Cloudflare is still serving a different release');
      const counts=validatePages(await get('/'),await get('/haberler/'));
      assert.equal(counts.homeCount,stamp.homeCount,'Deployed homepage is from a different build');
      assert.equal(counts.archiveCount,stamp.archiveCount,'Deployed news archive is from a different build');
      console.log('Live Cloudflare release verified:',SHA,counts);
      last=null;
      break;
    }catch(error){
      last=error;
      console.error('Live release check '+attempt+'/6:',error.message);
      if(attempt<6)await sleep(5000);
    }
  }
  if(last)throw last;
}else{
  throw new Error('Use: node scripts/verify-news-release.mjs bundle|live');
}

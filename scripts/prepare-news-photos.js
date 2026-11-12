// Licensed documentary photographs are fetched into the production bundle, not hotlinked.
// Every photo must have an explicit Commons file page, author and license in the manifest.
const fs=require('node:fs');
const path=require('node:path');
const photos=JSON.parse(fs.readFileSync('data/news-photos.json','utf8')).items;
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const fetchPhotos=process.argv.includes('--download');
async function download(slug,entry) {
  const dest=path.join('assets/news/photos',slug+'.jpg');
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  if(fs.existsSync(dest)&&fs.statSync(dest).size>10000)return;
  const request='https://commons.wikimedia.org/wiki/Special:Redirect/file/'+encodeURIComponent(entry.file.replaceAll(' ','_'))+'?width=1200';
  for(let attempt=0;attempt<3;attempt++){
    try{
      const result=await fetch(request,{headers:{'User-Agent':'AlmanyaPusulasi/1.0 (licensed editorial photo retrieval; https://almanyapusulasi.de)','Accept':'image/jpeg,image/*;q=0.9'}});
      if(!result.ok)throw Error('HTTP '+result.status);
      const buffer=Buffer.from(await result.arrayBuffer());
      if(buffer.length<10000 || !/^image\//.test(result.headers.get('content-type')||''))throw Error('Invalid image response');
      fs.writeFileSync(dest,buffer);
      console.log('Downloaded licensed photo '+slug+' ('+buffer.length+' bytes)');
      return;
    }catch(err){if(attempt===2)throw Error('Photo '+slug+': '+err.message);await new Promise(resolve=>setTimeout(resolve,2000*(attempt+1)));}
  }
}
async function main(){
  const entries=Object.entries(photos);
  for(const [slug,entry] of entries){
    if(!entry.author||!entry.page||entry.license!=='CC BY-SA 4.0'||!entry.image.startsWith('/assets/news/photos/'))throw Error('Incomplete credit: '+slug);
    const file='haberler/'+slug+'/index.html';
    if(!fs.existsSync(file))throw Error('Missing article '+file);
    let html=fs.readFileSync(file,'utf8');
    // Remove only the previously injected photograph; preserve editorial content.
    html=html.replace(/<figure data-news-photo="licensed">[\s\S]*?<\/figure>/g,'');
    // Replace obsolete static thumbnail figures, where the article already has one.
    html=html.replace(/<figure><img src="\/assets\/news\/[^"]+"[\s\S]*?<\/figure>/,'');
    const credit='Fotoğraf: <a href="'+escape(entry.page)+'" target="_blank" rel="noopener noreferrer">'+escape(entry.author)+'</a> · <a href="'+escape(entry.licenseUrl)+'" target="_blank" rel="noopener noreferrer">'+escape(entry.license)+'</a> · Wikimedia Commons · Kartta kırpılmış görünüm';
    const figure='<figure data-news-photo="licensed" style="margin:20px 0 26px"><img src="'+escape(entry.image)+'" alt="'+escape(entry.alt)+'" loading="lazy" decoding="async" width="1200" height="675" style="width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;border-radius:14px"><figcaption style="font-size:.8rem;color:#516578;margin-top:8px">'+credit+'</figcaption></figure>';
    if(!html.includes('<article class="article">'))throw Error('Missing article root: '+slug);
    const meta=html.match(/<div class="article-meta">[\\s\\S]*?<\\/div>/);
    if(meta)html=html.replace(meta[0],meta[0]+figure);
    else html=html.replace(/<\\/h1>/,'</h1>'+figure);
    const pageImage='https://almanyapusulasi.de'+entry.image;
    html=html.replace(/<meta property="og:image" content="[^"]*">/g,'');
    html=html.replace(/(<meta name="description" content="[^"]*">)/, '$1<meta property="og:image" content="'+pageImage+'">');
    // Schema image is synchronized with the same licensed photo as the page.
    html=html.replace(/(<script type="application\/ld\+json">)(\{[\s\S]*?\})(<\/script>)/,(all,open,payload,close)=>{
      const schema=JSON.parse(payload);
      if(schema['@type']==='NewsArticle'){schema.image=[pageImage];return open+JSON.stringify(schema)+close;}
      return all;
    });
    fs.writeFileSync(file,html);
  }
  if(fetchPhotos){for(const [slug,entry] of entries)await download(slug,entry);}
  console.log('Prepared '+entries.length+' credited real-photo news articles.');
}
main().catch(err=>{console.error(err);process.exit(1)});

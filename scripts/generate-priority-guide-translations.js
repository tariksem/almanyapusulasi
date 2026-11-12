const fs=require('node:fs');
const path=require('node:path');
const corpus=JSON.parse(fs.readFileSync('data/priority-guide-translations.json','utf8')).items;
const base='https://almanyapusulasi.de';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const [slug,langs] of Object.entries(corpus)){
 if(!fs.existsSync(slug+'/index.html'))throw Error('Missing Turkish source '+slug);
 if(!langs.en||!langs.de)throw Error('Missing full translation '+slug);
 for(const lang of ['en','de']){
  const d=langs[lang];
  if(!d.title||!d.description||!d.heading||!d.sections?.length)throw Error('Incomplete translation '+slug+' '+lang);
  const canonical=base+'/'+lang+'/'+slug+'/';
  const alternate=['tr','en','de'].map(l=>'<link rel="alternate" hreflang="'+l+'" href="'+base+'/'+(l==='tr'?'':l+'/')+slug+'/">').join('');
  const bullet=d.highlights?.length?'<div class="trust-card"><h3>'+(lang==='en'?'At a glance':'Auf einen Blick')+'</h3><ul class="trust-list">'+d.highlights.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul></div>':'';
  const cards=d.cards?.length?'<section class="section"><div class="container"><h2>'+(lang==='en'?'Choose your situation':'Wählen Sie Ihre Situation')+'</h2><div class="grid grid-3">'+d.cards.map(([title,detail,url])=>'<a class="card" href="'+esc(url)+'" hreflang="tr" lang="tr" title="'+(lang==='en'?'Detailed guide in Turkish':'Ausführlicher Ratgeber auf Türkisch')+'"><h3>'+esc(title)+'</h3><p>'+esc(detail)+'</p><small>'+(lang==='en'?'Detailed guide in Turkish':'Ausführlicher Ratgeber auf Türkisch')+'</small></a>').join('')+'</div></div></section>':'';
  const body=d.sections.map(([title,html],i)=>'<h2 id="section-'+(i+1)+'">'+esc(title)+'</h2>'+(/^(<ul|<ol|<div|<table)/.test(html)?html:'<p>'+html+'</p>')).join('');
  const toc=d.sections.map(([title],i)=>'<a href="#section-'+(i+1)+'">'+esc(title)+'</a>').join('');
  const html='<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(d.title)+'</title><meta name="description" content="'+esc(d.description)+'"><link rel="canonical" href="'+canonical+'">'+alternate+'<link rel="stylesheet" href="/assets/style.css"><link rel="stylesheet" href="/assets/v42-preview.css"><script defer src="/assets/js/analytics-consent.js"></script><script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@type':'Article',headline:d.title,inLanguage:lang,mainEntityOfPage:canonical})+'</script></head><body class="v41-preview v42-preview page-rehber"><header class="site-header"></header><main><section class="hero"><div class="container hero-grid"><div><span class="badge">'+esc(d.badge)+'</span><h1>'+esc(d.heading)+'</h1><p>'+d.intro+'</p><small>'+esc(d.meta)+'</small></div>'+bullet+'</div></section>'+cards+'<section class="section"><div class="container"><div class="reading-body">'+body+'</div><aside class="v41-toc" aria-label="'+(lang==='en'?'Contents':'Inhalt')+'"><b>'+(lang==='en'?'On this page':'In diesem Ratgeber')+'</b>'+toc+'</aside></div></section></main><footer class="footer"></footer></body></html>';
  const output=lang+'/'+slug+'/index.html';
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,html);
 }
}
console.log('Generated '+Object.keys(corpus).length*2+' fully translated priority guide pages');

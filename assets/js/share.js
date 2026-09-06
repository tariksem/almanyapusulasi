(function(){
  "use strict";

  const style=document.createElement('style');
  style.textContent='.share-row,.share-strip{display:none!important}.ap-share{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:18px 0}.ap-share-label{font-size:.82rem;font-weight:700;color:#64748b;margin-right:2px}.ap-share-btn{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:7px 10px;border:1px solid #dbe3ec;border-radius:999px;background:#fff;color:#17202a;font:inherit;font-size:.84rem;font-weight:700;cursor:pointer;box-shadow:0 1px 2px rgba(15,23,42,.04);transition:transform .15s ease,box-shadow .15s ease}.ap-share-btn:hover{transform:translateY(-1px);box-shadow:0 3px 10px rgba(15,23,42,.08)}.ap-share-btn svg{width:18px;height:18px;flex:0 0 18px}.ap-wa{color:#128c7e;border-color:#cdebe4}.ap-tg{color:#229ed9;border-color:#d3eaf5}.ap-native{color:#475569}.ap-share-result{margin-top:16px;padding:14px;border-top:1px solid #e2e8f0;background:rgba(248,250,252,.72);border-radius:12px}.ap-share-result .ap-share-label{width:100%;font-size:.9rem;color:#334155}.ap-share-result .ap-share-btn{min-height:40px;padding:8px 12px}.ap-share-page.ap-home-share{margin:22px auto 8px;max-width:1180px;padding:14px 20px 0;border-top:1px solid rgba(148,163,184,.25)}.ap-more-toggle{display:none}.ap-mobile-extra{display:initial}@media(max-width:700px){.ap-share{gap:6px}.ap-share-label{width:100%;margin-bottom:1px}.ap-share-page .ap-share-btn{min-height:34px;padding:6px 9px}.ap-share-page .ap-share-btn svg{width:17px;height:17px}.ap-share-page .ap-share-btn span{font-size:.78rem}.ap-share-result .ap-share-btn{flex:1 1 auto;justify-content:center}.ap-share-result .ap-share-btn span{font-size:.82rem}.ap-mobile-collapsible .ap-mobile-extra{display:none!important}.ap-mobile-collapsible.ap-expanded .ap-mobile-extra{display:flex!important}.ap-mobile-collapsible.grid .ap-mobile-extra,.ap-mobile-collapsible.home-category-grid .ap-mobile-extra,.ap-mobile-collapsible.popular-grid .ap-mobile-extra{display:none!important}.ap-mobile-collapsible.ap-expanded.grid .ap-mobile-extra,.ap-mobile-collapsible.ap-expanded.home-category-grid .ap-mobile-extra,.ap-mobile-collapsible.ap-expanded.popular-grid .ap-mobile-extra{display:flex!important}.ap-more-toggle{display:flex;width:100%;justify-content:center;align-items:center;gap:8px;margin:12px 0 0;padding:11px 14px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;color:#334155;font:inherit;font-weight:700;cursor:pointer}.ap-more-toggle:active{transform:translateY(1px)}.home-tools-growth .popular-grid>a:nth-child(n+5){display:none}.home-tools-growth .popular-grid.ap-expanded>a:nth-child(n+5){display:flex}}';
  document.head.appendChild(style);

  const ICONS={
    whatsapp:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.173.198-.297.298-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.009-.372-.011-.57-.011-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.693.625.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.894 9.83 9.83 0 0 1 2.893 6.99c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.82 11.82 0 0 0 12.055 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.056 24l6.305-1.654a11.88 11.88 0 0 0 5.69 1.448h.005c6.558 0 11.893-5.336 11.897-11.893a11.82 11.82 0 0 0-3.489-8.413"/></svg>',
    telegram:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23.91 3.79 20.3 20.84c-.27 1.2-.98 1.49-1.99.93l-5.5-4.05-2.65 2.55c-.29.29-.54.54-1.1.54l.39-5.6 10.19-9.2c.44-.39-.1-.61-.69-.22L6.36 13.72.94 12.02c-1.18-.37-1.2-1.18.25-1.74L22.4 2.1c.98-.36 1.84.22 1.51 1.69z"/></svg>',
    share:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14"/></svg>'
  };

  const cleanUrl=()=>location.origin+location.pathname;
  const title=()=>{const h=document.querySelector('h1');return (h?h.textContent:document.title.split('|')[0]).trim();};
  const track=(channel,kind)=>{if(typeof window.gtag==='function')window.gtag('event',kind==='result'?'tool_result_share':'content_share',{share_channel:channel,page_path:location.pathname});};
  const popup=(url)=>window.open(url,'_blank','noopener,noreferrer,width=720,height=640');

  function textFor(kind,box){
    if(kind==='result'&&box){
      const copy=box.cloneNode(true);copy.querySelectorAll('.ap-share').forEach(n=>n.remove());
      const raw=(copy.innerText||copy.textContent||'').replace(/\s+/g,' ').trim();
      return (title()+' — '+raw.slice(0,420)+'\n'+cleanUrl()).trim();
    }
    return title()+'\n'+cleanUrl();
  }

  function bar(kind,box){
    const el=document.createElement('div');el.className='ap-share ap-share-'+kind;el.setAttribute('data-ap-share','1');
    const label=kind==='result'?'Sonucunu paylaş':'Paylaş';
    el.innerHTML='<span class="ap-share-label">'+label+'</span><button type="button" class="ap-share-btn ap-wa" aria-label="WhatsApp ile paylaş">'+ICONS.whatsapp+'<span>WhatsApp</span></button><button type="button" class="ap-share-btn ap-tg" aria-label="Telegram ile paylaş">'+ICONS.telegram+'<span>Telegram</span></button><button type="button" class="ap-share-btn ap-native" aria-label="Diğer uygulamalarla paylaş">'+ICONS.share+'<span>Paylaş</span></button>';
    const get=()=>textFor(kind,box);
    el.querySelector('.ap-wa').onclick=()=>{track('whatsapp',kind);popup('https://wa.me/?text='+encodeURIComponent(get()));};
    el.querySelector('.ap-tg').onclick=()=>{track('telegram',kind);popup('https://t.me/share/url?url='+encodeURIComponent(cleanUrl())+'&text='+encodeURIComponent(get().replace(cleanUrl(),'')));};
    el.querySelector('.ap-native').onclick=async()=>{track('native',kind);const text=get();if(navigator.share){try{await navigator.share({title:title(),text:text.replace(cleanUrl(),''),url:cleanUrl()});return;}catch(e){if(e&&e.name==='AbortError')return;}}try{await navigator.clipboard.writeText(text);const span=el.querySelector('.ap-native span');const old=span.textContent;span.textContent='Kopyalandı';setTimeout(()=>span.textContent=old,1600);}catch(_){popup('mailto:?subject='+encodeURIComponent(title())+'&body='+encodeURIComponent(text));}};
    return el;
  }

  function firstIntro(root,h1){
    if(!root)return null;
    const candidates=Array.from(root.querySelectorAll('p,.lead,.hero-subtitle,.subtitle,.article-meta,.info-box'));
    return candidates.find(el=>!h1||el.compareDocumentPosition(h1)&Node.DOCUMENT_POSITION_PRECEDING)||candidates[0]||null;
  }

  function injectPageShare(){
    if(document.querySelector('.ap-share-page'))return;
    const root=document.querySelector('main article,main .article,.article-wrap article,.hero .container,main');if(!root)return;
    const h1=root.querySelector('h1')||document.querySelector('h1');const el=bar('page');
    const isHome=location.pathname==='/'||location.pathname==='/index.html';
    if(isHome){
      el.classList.add('ap-home-share');
      const sections=Array.from(document.querySelectorAll('body > section'));
      const target=sections.find(s=>((s.querySelector('.section-label')||{}).textContent||'').toLowerCase().includes('google'))||document.querySelector('.home-tools-growth');
      if(target)target.insertAdjacentElement('afterend',el);else document.body.appendChild(el);
      return;
    }
    const intro=firstIntro(root,h1);
    if(intro)intro.insertAdjacentElement('afterend',el);else if(h1)h1.insertAdjacentElement('afterend',el);else root.prepend(el);
  }

  function resultBoxes(){return Array.from(document.querySelectorAll('.result,#out,[id*="result" i],[class*="result-box" i]')).filter(el=>el instanceof HTMLElement);}
  function ensureResultShare(box){
    if(!box||box.dataset.apShareObserved==='1')return;box.dataset.apShareObserved='1';let timer;
    const add=()=>{clearTimeout(timer);timer=setTimeout(()=>{const txt=(box.innerText||box.textContent||'').trim();if(txt.length<8||box.querySelector('.ap-share-result'))return;box.appendChild(bar('result',box));},40);};
    new MutationObserver(add).observe(box,{childList:true,subtree:true,characterData:true});add();
  }
  function scanResults(){resultBoxes().forEach(ensureResultShare);}

  function addMobileToggle(grid,visible,label){
    if(!grid||grid.dataset.apCompact==='1')return;
    const items=Array.from(grid.children).filter(el=>el.matches('a,.card,.popular-link,.home-category-card'));
    if(items.length<=visible)return;
    grid.dataset.apCompact='1';grid.classList.add('ap-mobile-collapsible');
    items.slice(visible).forEach(el=>el.classList.add('ap-mobile-extra'));
    const btn=document.createElement('button');btn.type='button';btn.className='ap-more-toggle';btn.textContent=label;
    btn.onclick=()=>{const open=grid.classList.toggle('ap-expanded');btn.textContent=open?'Daha az göster':label;};
    grid.insertAdjacentElement('afterend',btn);
  }

  function compactHomepage(){
    const isHome=location.pathname==='/'||location.pathname==='/index.html';if(!isHome)return;
    const mobile=window.matchMedia&&window.matchMedia('(max-width:700px)').matches;if(!mobile)return;
    const sections=Array.from(document.querySelectorAll('body > section'));
    const findSection=(needle)=>sections.find(s=>((s.querySelector('h2')||{}).textContent||'').toLocaleLowerCase('tr').includes(needle));
    addMobileToggle(document.querySelector('.home-tools-growth .popular-grid'),4,'Diğer karar araçlarını göster');
    const compare=findSection('yüksek maliyetli sözleşmelerde');if(compare)addMobileToggle(compare.querySelector('.grid'),3,'Diğer karşılaştırmaları göster');
    const hubs=findSection('daha derine inmek istediğiniz');if(hubs)addMobileToggle(hubs.querySelector('.home-category-grid,.grid'),4,'Diğer konu merkezlerini göster');
    const city=sections.find(s=>{const t=((s.querySelector('h2')||{}).textContent||'').toLocaleLowerCase('tr');return t.includes('şehir')||t.includes('şehr');});if(city)addMobileToggle(city.querySelector('.grid,.home-category-grid'),4,'Diğer şehirleri göster');
  }

  function init(){if(new URLSearchParams(location.search).get('embed')==='1')return;injectPageShare();scanResults();compactHomepage();new MutationObserver(scanResults).observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
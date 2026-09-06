(function(){
  "use strict";

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
      const copy=box.cloneNode(true); copy.querySelectorAll('.ap-share').forEach(n=>n.remove());
      const raw=(copy.innerText||copy.textContent||'').replace(/\s+/g,' ').trim();
      return (title()+' — '+raw.slice(0,420)+'\n'+cleanUrl()).trim();
    }
    return title()+'\n'+cleanUrl();
  }

  function bar(kind,box){
    const el=document.createElement('div');
    el.className='ap-share ap-share-'+kind;
    el.setAttribute('data-ap-share','1');
    const label=kind==='result'?'Sonucu paylaş':'Paylaş';
    el.innerHTML='<span class="ap-share-label">'+label+'</span>'+
      '<button type="button" class="ap-share-btn ap-wa" aria-label="WhatsApp ile paylaş">'+ICONS.whatsapp+'<span>WhatsApp</span></button>'+
      '<button type="button" class="ap-share-btn ap-tg" aria-label="Telegram ile paylaş">'+ICONS.telegram+'<span>Telegram</span></button>'+
      '<button type="button" class="ap-share-btn ap-native" aria-label="Diğer uygulamalarla paylaş">'+ICONS.share+'<span>Paylaş</span></button>';
    const get=()=>textFor(kind,box);
    el.querySelector('.ap-wa').onclick=()=>{track('whatsapp',kind);popup('https://wa.me/?text='+encodeURIComponent(get()));};
    el.querySelector('.ap-tg').onclick=()=>{track('telegram',kind);popup('https://t.me/share/url?url='+encodeURIComponent(cleanUrl())+'&text='+encodeURIComponent(get().replace(cleanUrl(),'')));};
    el.querySelector('.ap-native').onclick=async()=>{
      track('native',kind); const text=get();
      if(navigator.share){try{await navigator.share({title:title(),text:text.replace(cleanUrl(),''),url:cleanUrl()});return;}catch(e){if(e&&e.name==='AbortError')return;}}
      try{await navigator.clipboard.writeText(text);const span=el.querySelector('.ap-native span');const old=span.textContent;span.textContent='Kopyalandı';setTimeout(()=>span.textContent=old,1600);}catch(_){popup('mailto:?subject='+encodeURIComponent(title())+'&body='+encodeURIComponent(text));}
    };
    return el;
  }

  function injectPageShare(){
    if(document.querySelector('.ap-share-page'))return;
    const root=document.querySelector('main article, main .article, .article-wrap article, .hero .container, main');
    if(!root)return;
    const h1=root.querySelector('h1')||document.querySelector('h1');
    const el=bar('page');
    if(h1)h1.insertAdjacentElement('afterend',el); else root.prepend(el);
  }

  function resultBoxes(){return Array.from(document.querySelectorAll('.result,#out,[id*="result" i],[class*="result-box" i]')).filter(el=>el instanceof HTMLElement);}
  function ensureResultShare(box){
    if(!box||box.dataset.apShareObserved==='1')return;
    box.dataset.apShareObserved='1';
    let timer;
    const add=()=>{
      clearTimeout(timer);timer=setTimeout(()=>{
        const txt=(box.innerText||box.textContent||'').trim();
        if(txt.length<8||box.querySelector('.ap-share-result'))return;
        box.appendChild(bar('result',box));
      },40);
    };
    new MutationObserver(add).observe(box,{childList:true,subtree:true,characterData:true});
    add();
  }
  function scanResults(){resultBoxes().forEach(ensureResultShare);}

  function init(){
    if(new URLSearchParams(location.search).get('embed')==='1')return;
    injectPageShare();scanResults();
    new MutationObserver(scanResults).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init); else init();
})();
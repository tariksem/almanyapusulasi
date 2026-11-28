const crypto=require('node:crypto');
const fs=require('node:fs');

const SITE='https://almanyapusulasi.de';
const GROUPS=['priority','migration','family','finance-housing','career','commercial','tools','news'];
const SKIP_TEXT=new Set(['script','style','code','pre','svg','noscript','template']);
const TRANSLATABLE_ATTRIBUTES=['alt','aria-label','placeholder','title'];

const decodeEntities=value=>String(value)
  .replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)))
  .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))
  .replace(/&(amp|lt|gt|quot|apos|nbsp);/gi,(_,n)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}[n.toLowerCase()]));

const escapeHtml=value=>String(value).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const escapeAttribute=(value,quote)=>escapeHtml(value).replace(quote==='"'?/"/g:/'/g,quote==='"'?'&quot;':'&#39;');
const normalize=value=>decodeEntities(value).replace(/\s+/g,' ').trim();
const segmentId=value=>crypto.createHash('sha256').update(normalize(value)).digest('hex').slice(0,24);

function shouldTranslate(value){
  const text=normalize(value);
  if(!text||!/[\p{L}]/u.test(text))return false;
  if(text==='Almanya Pusulası'||text==='almanyapusulasi.de')return false;
  if(/^(?:https?:|mailto:|tel:|\/|#)/i.test(text))return false;
  if(/^[\w.-]+@[\w.-]+\.[a-z]{2,}$/i.test(text))return false;
  if(/^[A-Z0-9_.:/-]{2,}$/.test(text)&&!/[ÇĞİÖŞÜ]/.test(text))return false;
  return true;
}

function looksTurkish(value){
  const text=normalize(value);
  return /[çğıöşüÇĞİÖŞÜ]/.test(text)||/\b(?:ve|veya|için|ile|değil|olan|olarak|gerekli|hesapla|kontrol|sonuç|seçin|başvuru|rehber|aç|kapat|devam|geri|önce|sonra|aylık|yıllık|gelir|gider|maaş|vergi|sigorta|kira|çocuk|aile|iş|araç|tutar|uygun|bilgi|kaynak|göster|görüntüle|hakkında|gizlilik|iletişim|haberler|araçlar)\b/i.test(text);
}

function sourcePaths({translationsOnly=false}={}){
  const paths=new Set();
  for(const group of GROUPS){
    const xml=fs.readFileSync('sitemap-'+group+'.xml','utf8');
    for(const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)){
      const pathname=new URL(match[1]).pathname;
      if(!pathname.startsWith('/en/')&&!pathname.startsWith('/de/'))paths.add(pathname);
    }
  }
  const turkishOnly=new Set(require('./i18n-registry.js').turkishOnlyRoutes.map(route=>'/'+route+'/'));
  return [...paths].filter(pathname=>!translationsOnly||!turkishOnly.has(pathname)).sort();
}

const routeFromPath=pathname=>pathname.replace(/^\/+|\/+$/g,'');
const fileFromPath=pathname=>pathname==='/'?'index.html':pathname.slice(1)+'index.html';

function attrValue(tag,name){
  const match=tag.match(new RegExp('\\s'+name+'\\s*=\\s*(["\\\'])([\\s\\S]*?)\\1','i'));
  return match?decodeEntities(match[2]):null;
}

function replaceAttribute(tag,name,replacer){
  const pattern=new RegExp('(\\s'+name+'\\s*=\\s*)(["\\\'])([\\s\\S]*?)\\2','i');
  return tag.replace(pattern,(all,prefix,quote,value)=>prefix+quote+escapeAttribute(replacer(decodeEntities(value)),quote)+quote);
}

function collectJsonStrings(value,collector,key=''){
  if(Array.isArray(value))return value.forEach(item=>collectJsonStrings(item,collector,key));
  if(!value||typeof value!=='object'){
    if(typeof value==='string'&&!/^@/.test(key)&&!/(?:url|image|logo|sameAs|identifier)$/i.test(key)&&shouldTranslate(value))collector(value,'jsonld');
    return;
  }
  for(const [childKey,child] of Object.entries(value))collectJsonStrings(child,collector,childKey);
}

function transformJsonStrings(value,translate,lang,key=''){
  if(Array.isArray(value))return value.map(item=>transformJsonStrings(item,translate,lang,key));
  if(!value||typeof value!=='object'){
    if(typeof value!=='string')return value;
    if(key==='inLanguage')return lang;
    if(/(?:url|image|logo|sameAs|identifier|mainEntityOfPage)$/i.test(key))return localizeAbsolute(value,lang);
    if(!/^@/.test(key)&&shouldTranslate(value))return translate(value);
    return value;
  }
  return Object.fromEntries(Object.entries(value).map(([childKey,child])=>[childKey,transformJsonStrings(child,translate,lang,childKey)]));
}

function processJsonLd(html,{collector,translate,lang}){
  return html.replace(/(<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi,(all,open,payload,close)=>{
    try{
      const parsed=JSON.parse(payload);
      if(collector)collectJsonStrings(parsed,collector);
      if(translate)return open+JSON.stringify(transformJsonStrings(parsed,translate,lang))+close;
    }catch(_){/* Existing JSON-LD validation reports malformed source separately. */}
    return all;
  });
}

function tokenizeHtml(html,handlers={}){
  const rawBlocks=[];
  html=html.replace(/<(script|style|code|pre|svg|noscript|template)\b[\s\S]*?<\/\1\s*>/gi,block=>{
    const index=rawBlocks.push(block)-1;
    return '<!--APRAW:'+index+'-->';
  });
  const stack=[];
  const tokenPattern=/<!--[\s\S]*?-->|<![^>]*>|<[^>]+>|[^<]+/g;
  const transformed=html.replace(tokenPattern,token=>{
    if(token.startsWith('<!--')||token.startsWith('<!'))return token;
    if(token.startsWith('<')){
      const end=token.match(/^<\s*\/\s*([\w:-]+)/);
      if(end){
        const name=end[1].toLowerCase();
        for(let i=stack.length-1;i>=0;i--){if(stack[i]===name){stack.splice(i,1);break;}}
        return handlers.tag?handlers.tag(token,stack):token;
      }
      const start=token.match(/^<\s*([\w:-]+)/);
      const transformed=handlers.tag?handlers.tag(token,stack):token;
      if(start&&!/\/\s*>$/.test(token)&&!/^<(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b/i.test(token))stack.push(start[1].toLowerCase());
      return transformed;
    }
    if(stack.some(name=>SKIP_TEXT.has(name)))return token;
    return handlers.text?handlers.text(token,stack):token;
  });
  return transformed.replace(/<!--APRAW:(\d+)-->/g,(_,index)=>rawBlocks[Number(index)]);
}

function extractStaticSegments(html){
  const segments=[];
  const collector=(value,kind)=>{const text=normalize(value);if(shouldTranslate(text))segments.push({id:segmentId(text),source:text,kind});};
  processJsonLd(html,{collector});
  tokenizeHtml(html,{
    text(token){collector(token,'text');return token;},
    tag(tag){
      for(const name of TRANSLATABLE_ATTRIBUTES){const value=attrValue(tag,name);if(value)collector(value,'attribute');}
      if(/^<meta\b/i.test(tag)){
        const name=(attrValue(tag,'name')||attrValue(tag,'property')||'').toLowerCase();
        if(/^(?:description|og:title|og:description|twitter:title|twitter:description)$/.test(name)){
          const value=attrValue(tag,'content');if(value)collector(value,'metadata');
        }
      }
      if(/^<input\b/i.test(tag)&&/^(?:submit|button|reset)$/i.test(attrValue(tag,'type')||'')){
        const value=attrValue(tag,'value');if(value)collector(value,'attribute');
      }
      return tag;
    }
  });
  const unique=new Map(segments.map(item=>[item.id,item]));
  return [...unique.values()];
}

function decodeJsLiteral(value,quote){
  try{if(quote==='"')return JSON.parse('"'+value.replace(/"/g,'\\"')+'"');}catch(_){}
  return value.replace(/\\n/g,'\n').replace(/\\r/g,'\r').replace(/\\t/g,'\t').replace(/\\([\\'"`])/g,'$1').replace(/\$\{[^}]+\}/g,' ');
}

function jsLiteralTokens(js){
  const tokens=[];
  const regexStart=previous=>!previous||/[([{:;,=!?&|+\-*%^~<>]/.test(previous);
  const skipQuoted=(start,quote)=>{
    let index=start+1;
    while(index<js.length){
      if(js[index]==='\\'){index+=2;continue;}
      if(js[index]===quote)return index+1;
      index++;
    }
    return index;
  };
  const skipRegex=start=>{
    let index=start+1,inClass=false;
    while(index<js.length){
      if(js[index]==='\\'){index+=2;continue;}
      if(js[index]==='['){inClass=true;index++;continue;}
      if(js[index]===']'){inClass=false;index++;continue;}
      if(js[index]==='/'&&!inClass){index++;while(/[a-z]/i.test(js[index]||''))index++;return index;}
      index++;
    }
    return index;
  };
  let findExpressionEnd;
  const skipTemplate=start=>{
    let index=start+1;
    while(index<js.length){
      if(js[index]==='\\'){index+=2;continue;}
      if(js[index]==='`')return index+1;
      if(js[index]==='$'&&js[index+1]==='{'){index=findExpressionEnd(index+2)+1;continue;}
      index++;
    }
    return index;
  };
  findExpressionEnd=start=>{
    let index=start,depth=1,previous='';
    while(index<js.length){
      const char=js[index],next=js[index+1];
      if(char==='/'&&next==='/'){index=js.indexOf('\n',index+2);if(index<0)return js.length;continue;}
      if(char==='/'&&next==='*'){const end=js.indexOf('*/',index+2);index=end<0?js.length:end+2;continue;}
      if(char==='\''||char==='"'){index=skipQuoted(index,char);previous='v';continue;}
      if(char==='`'){index=skipTemplate(index);previous='v';continue;}
      if(char==='/'&&regexStart(previous)){index=skipRegex(index);previous='v';continue;}
      if(char==='{')depth++;
      else if(char==='}'&&--depth===0)return index;
      if(!/\s/.test(char))previous=char;
      index++;
    }
    return js.length-1;
  };
  const scanRange=(start,end)=>{
    let index=start,previous='';
    while(index<end){
      const char=js[index],next=js[index+1];
      if(char==='/'&&next==='/'){index=js.indexOf('\n',index+2);if(index<0)return;continue;}
      if(char==='/'&&next==='*'){const close=js.indexOf('*/',index+2);index=close<0?end:close+2;continue;}
      if(char==='\''||char==='"'){
        const close=skipQuoted(index,char);
        tokens.push({value:js.slice(index+1,Math.max(index+1,close-1)),quote:char});
        index=close;previous='v';continue;
      }
      if(char==='`'){
        let cursor=index+1,raw='';
        while(cursor<end){
          if(js[cursor]==='\\'){raw+=js.slice(cursor,cursor+2);cursor+=2;continue;}
          if(js[cursor]==='`'){cursor++;break;}
          if(js[cursor]==='$'&&js[cursor+1]==='{'){
            const expressionStart=cursor+2;
            const expressionEnd=findExpressionEnd(expressionStart);
            scanRange(expressionStart,expressionEnd);
            raw+=' ';
            cursor=expressionEnd+1;
            continue;
          }
          raw+=js[cursor++];
        }
        tokens.push({value:raw,quote:'`'});
        index=cursor;previous='v';continue;
      }
      if(char==='/'&&regexStart(previous)){index=skipRegex(index);previous='v';continue;}
      if(!/\s/.test(char))previous=char;
      index++;
    }
  };
  scanRange(0,js.length);
  return tokens;
}

function extractJsSegments(js){
  const found=[];
  const add=value=>{
    const plain=normalize(value);
    if(!looksTurkish(plain)||!shouldTranslate(plain))return;
    found.push({id:segmentId(plain),source:plain,kind:'runtime'});
  };
  for(const token of jsLiteralTokens(js)){
    const value=decodeJsLiteral(token.value,token.quote);
    if(/[<>]/.test(value)){
      for(const item of extractStaticSegments(value))if(looksTurkish(item.source))found.push({...item,kind:'runtime'});
    }else add(value);
  }
  return [...new Map(found.map(item=>[item.id,item])).values()];
}

function referencedRuntimeSegments(html){
  const result=new Map();
  const addAll=items=>items.forEach(item=>result.set(item.id,item));
  for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
    const tag='<script '+match[1]+'>';
    if(/application\/ld\+json/i.test(tag))continue;
    const src=attrValue(tag,'src');
    if(src&&/^\/assets\/js\/[a-z0-9._/-]+\.js(?:\?.*)?$/i.test(src)){
      const file=src.split('?')[0].slice(1);
      if(fs.existsSync(file))addAll(extractJsSegments(fs.readFileSync(file,'utf8')));
    }else if(!src)addAll(extractJsSegments(match[2]));
  }
  return [...result.values()];
}

function localizeAbsolute(value,lang){
  if(typeof value!=='string'||!value.startsWith(SITE+'/'))return value;
  const url=new URL(value);
  if(!/^\/(?:en|de)\//.test(url.pathname))url.pathname='/'+lang+url.pathname;
  else url.pathname=url.pathname.replace(/^\/(?:en|de)/,'/'+lang);
  return url.toString();
}

function localizeHref(value,lang,routes){
  if(!value||/^(?:#|mailto:|tel:|javascript:|data:)/i.test(value))return {value,translated:false,internal:false};
  let url;
  let absolute=false;
  if(value.startsWith(SITE+'/')){url=new URL(value);absolute=true;}
  else if(value.startsWith('/'))url=new URL(value,SITE);
  else return {value,translated:false,internal:false};
  if(/^\/(?:assets|data)\//.test(url.pathname)||/\.[a-z0-9]{2,5}$/i.test(url.pathname))return {value,translated:false,internal:true};
  const clean=url.pathname.replace(/^\/(?:en|de)(?=\/|$)/,'');
  const route=routeFromPath(clean);
  if(!routes.has(route))return {value,translated:false,internal:true};
  url.pathname='/'+lang+'/'+route+'/';
  const localized=url.pathname+url.search+url.hash;
  return {value:absolute?SITE+localized:localized,translated:true,internal:true};
}

function addAttribute(tag,name,value){
  if(new RegExp('\\s'+name+'\\s*=','i').test(tag))return replaceAttribute(tag,name,()=>value);
  return tag.replace(/\s*\/$/, ' '+name+'="'+escapeAttribute(value,'"')+'"/').replace(/>$/, ' '+name+'="'+escapeAttribute(value,'"')+'">');
}

const TURKISH_MONTHS=Object.freeze({
  'Ocak':['January','Januar'],'Şubat':['February','Februar'],
  'Mart':['March','März'],'Nisan':['April','April'],
  'Mayıs':['May','Mai'],'Haziran':['June','Juni'],
  'Temmuz':['July','Juli'],'Ağustos':['August','August'],
  'Eylül':['September','September'],'Ekim':['October','Oktober'],
  'Kasım':['November','November'],'Aralık':['December','Dezember']
});

/**
 * Resolve a reviewed catalog translation or a strictly formatted calendar date.
 * News archive dates are regenerated on every deployment, so date strings must
 * not require new immutable catalog IDs. All other text remains catalog-gated.
 */
// Short news titles, categories and summaries are editorially translated in
// data/news-languages.json. They change with the news cycle and do not belong
// in the frozen 185-route guide translation catalog.
const NEWS_TRANSLATIONS=new Map();
const newsFile=require('node:path').join(__dirname,'../data/news-languages.json');
if(fs.existsSync(newsFile)){
  const newsCatalog=JSON.parse(fs.readFileSync(newsFile,'utf8'));
  const editions=newsCatalog.items||{};
  for(const [slug,article] of Object.entries(editions)){
    for(const field of ['title','description','category']){
      const entry={tr:article.tr?.[field],en:article.en?.[field],de:article.de?.[field]};
      if(!entry.tr||!entry.en||!entry.de)
        throw new Error('Incomplete news '+field+' translation: '+slug);
      const id=segmentId(entry.tr);
      const previous=NEWS_TRANSLATIONS.get(id);
      if(previous&&(previous.en!==entry.en||previous.de!==entry.de))
        throw new Error('Conflicting news translation: '+entry.tr);
      NEWS_TRANSLATIONS.set(id,entry);
    }
  }
  // Source-corrected existing news articles retain reviewable translations
  // for every changed claim and do not contaminate the frozen guide catalog.
  for(const [slug,entries] of Object.entries(newsCatalog.revisions||{})){
    for(const entry of entries){
      if(!entry.tr||!entry.en||!entry.de)
        throw new Error('Incomplete official-status translation: '+slug);
      const id=segmentId(entry.tr);
      const previous=NEWS_TRANSLATIONS.get(id);
      if(previous&&(previous.en!==entry.en||previous.de!==entry.de))
        throw new Error('Conflicting official-status translation: '+entry.tr);
      NEWS_TRANSLATIONS.set(id,entry);
    }
  }
}


const photoFile=require('node:path').join(__dirname,'../data/news-photos.json');
if(fs.existsSync(photoFile)){
  const photoCatalog=JSON.parse(fs.readFileSync(photoFile,'utf8')).items||{};
  for(const [slug,photo] of Object.entries(photoCatalog)){
    if(!photo.altI18n)continue;
    const entry={tr:photo.alt,en:photo.altI18n.en,de:photo.altI18n.de};
    if(!entry.tr||!entry.en||!entry.de)
      throw new Error('Missing localized photo alt: '+slug);
    const id=segmentId(entry.tr);
    const previous=NEWS_TRANSLATIONS.get(id);
    if(previous&&(previous.en!==entry.en||previous.de!==entry.de))
      throw new Error('Conflicting news photo translation: '+slug);
    NEWS_TRANSLATIONS.set(id,entry);
  }
}

function translationEntry(value,translations){
  const text=normalize(value);
  const catalogEntry=translations[segmentId(text)]||NEWS_TRANSLATIONS.get(segmentId(text));
  if(catalogEntry)return catalogEntry;
  const date=text.match(/^(Güncelleme:\s*)?(?:(\d{1,2})\s+)?(Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)\s+(20\d{2})$/u);
  if(!date)return null;
  const [,prefix,day,turkishMonth,year]=date;
  const [englishMonth,germanMonth]=TURKISH_MONTHS[turkishMonth];
  const english=(prefix?'Updated: ':'')+(day?englishMonth+' '+day+', '+year:englishMonth+' '+year);
  const german=(prefix?'Aktualisiert: ':'')+(day?day+'. '+germanMonth+' '+year:germanMonth+' '+year);
  return {tr:text,en:english,de:german};
}

function translatedHtml(source,{lang,translations,routes}){
  const translate=value=>{
    const text=normalize(value);
    if(!shouldTranslate(text))return text;
    const entry=translationEntry(text,translations);
    if(!entry||!entry[lang])throw new Error('Missing '+lang+' translation for: '+text.slice(0,120));
    return entry[lang];
  };
  let html=processJsonLd(source,{translate,lang});
  html=html.replace(/<link\b[^>]*rel\s*=\s*["']alternate["'][^>]*hreflang\s*=\s*["'][^"']+["'][^>]*>\s*/gi,'');
  html=tokenizeHtml(html,{
    text(token){
      const leading=token.match(/^\s*/)[0],trailing=token.match(/\s*$/)[0];
      const text=normalize(token);
      return shouldTranslate(text)?leading+escapeHtml(translate(text))+trailing:token;
    },
    tag(tag){
      let out=tag;
      for(const name of TRANSLATABLE_ATTRIBUTES){if(attrValue(out,name))out=replaceAttribute(out,name,translate);}
      if(/^<meta\b/i.test(out)){
        const name=(attrValue(out,'name')||attrValue(out,'property')||'').toLowerCase();
        if(/^(?:description|og:title|og:description|twitter:title|twitter:description)$/.test(name)&&attrValue(out,'content'))out=replaceAttribute(out,'content',translate);
        if(/^(?:og:url)$/.test(name)&&attrValue(out,'content'))out=replaceAttribute(out,'content',value=>localizeAbsolute(value,lang));
      }
      if(/^<input\b/i.test(out)&&/^(?:submit|button|reset)$/i.test(attrValue(out,'type')||'')&&attrValue(out,'value'))out=replaceAttribute(out,'value',translate);
      if(/^<(?:a|form)\b/i.test(out)){
        const attr=/^<a\b/i.test(out)?'href':'action';
        const value=attrValue(out,attr);
        if(value){
          const localized=localizeHref(value,lang,routes);
          if(localized.translated){out=replaceAttribute(out,attr,()=>localized.value);out=addAttribute(out,'hreflang',lang);out=addAttribute(out,'lang',lang);}
          else if(/^<a\b/i.test(out)&&localized.internal&&!/^\/(?:assets|data)\//.test(value)){out=addAttribute(out,'hreflang','tr');out=addAttribute(out,'lang','tr');}
        }
      }
      return out;
    }
  });
  html=html.replace(/<html\b([^>]*)\blang\s*=\s*(["'])[^"']*\2([^>]*)>/i,'<html$1lang="'+lang+'"$3>');
  const canonical=SITE+'/'+lang+'/'+routeFromPath(attrValue(html.match(/<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>/i)?.[0]||'','href')?.replace(SITE,'')||'')+'/';
  const sourceCanonical=source.match(/<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>/i)?.[0];
  const sourceUrl=sourceCanonical?attrValue(sourceCanonical,'href'):null;
  if(!sourceUrl)throw new Error('Source canonical missing');
  const pathname=new URL(sourceUrl).pathname;
  const localizedCanonical=SITE+'/'+lang+pathname;
  html=html.replace(/<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>/i,tag=>replaceAttribute(tag,'href',()=>localizedCanonical));
  const alternates=['tr','en','de'].map(code=>'<link rel="alternate" hreflang="'+code+'" href="'+SITE+(code==='tr'?'':'/'+code)+pathname+'">').join('')+'<link rel="alternate" hreflang="x-default" href="'+SITE+pathname+'">';
  html=html.replace(/(<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>)/i,'$1'+alternates+'<meta name="ap-i18n-verification" content="catalog-generated">');
  const runtime='<script defer src="/assets/js/bulk-i18n-runtime.js" data-lang="'+lang+'"></script>';
  html=html.replace(/<\/body>/i,runtime+'</body>');
  return html;
}

function numericTokens(value){
  return [...normalize(value).matchAll(/\b\d[\d.,:/–-]*\b/g)].map(match=>match[0].replace(/(?<=\d)[.,](?=\d{3}\b)/g,'')).sort();
}

module.exports={
  SITE,GROUPS,decodeEntities,escapeHtml,normalize,segmentId,shouldTranslate,looksTurkish,
  sourcePaths,routeFromPath,fileFromPath,attrValue,extractStaticSegments,extractJsSegments,referencedRuntimeSegments,
  translatedHtml,translationEntry,numericTokens,localizeHref
};

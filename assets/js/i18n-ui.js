(function(){
"use strict";
const api=window.AlmanyaI18n;
if(!api)return;
const path=location.pathname;
const pageLang=api.languageFromPath(path);
const pref=api.preferred(localStorage,navigator.languages||[navigator.language]);
if(path==="/"&&pref!=="tr"&&!new URLSearchParams(location.search).has("no_lang_redirect")){
  location.replace(api.home(pref)+location.search+location.hash);
  return;
}
if(pageLang)api.setPreference(localStorage,pageLang);
const lang=pageLang||"tr";
document.documentElement.lang=lang;
const labels={tr:{language:"Dil",home:"Ana Sayfa",about:"Almanya Pusulası",intro:"Karar araçları ve resmî kaynaklı rehberler",credit:"Banner fotoğrafı",topics:"Konular",guides:"Rehberler",privacy:"Gizlilik",contact:"İletişim"},en:{language:"Language",home:"Home",about:"Almanya Pusulası",intro:"Practical guidance based on official information",credit:"Banner photo",topics:"Topics",guides:"Guides",privacy:"Privacy",contact:"Contact"},de:{language:"Sprache",home:"Startseite",about:"Almanya Pusulası",intro:"Verständliche Ratgeber auf Grundlage offizieller Informationen",credit:"Bannerfoto",topics:"Themen",guides:"Ratgeber",privacy:"Datenschutz",contact:"Kontakt"}};
const d=labels[lang];
function createPicker(){
 if(document.querySelector(".ap-lang-picker"))return;
 const header=document.querySelector(".site-header .header-inner");
 if(!header)return;
 const box=document.createElement("nav");
 box.className="ap-lang-picker ap-lang-header";
 box.setAttribute("aria-label",d.language);
 // Inline flag SVGs render consistently on Windows, unlike flag emoji.
 const flags={
  tr:'<svg viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#E30A17"/><circle cx="12" cy="10" r="6" fill="#fff"/><circle cx="14" cy="10" r="4.8" fill="#E30A17"/><path fill="#fff" d="m19.2 7 .8 2.3h2.4l-1.9 1.5.7 2.3-2-1.4-1.9 1.4.7-2.3-1.9-1.5h2.4z"/></svg>',
  en:'<svg viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#012169"/><path d="M0 0 30 20M30 0 0 20" stroke="#fff" stroke-width="5"/><path d="M0 0 30 20M30 0 0 20" stroke="#C8102E" stroke-width="2"/><path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="7"/><path d="M15 0v20M0 10h30" stroke="#C8102E" stroke-width="3.5"/></svg>',
  de:'<svg viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#FFCE00"/><rect width="30" height="13.34" fill="#DD0000"/><rect width="30" height="6.67" fill="#000"/></svg>'
 };
 for(const [code,name] of [["tr","Türkçe"],["en","English"],["de","Deutsch"]]){
  const link=document.createElement("a");
  link.className="ap-lang-flag"+(lang===code?" is-current":"");
  link.href=api.equivalent(path,code);
  link.hreflang=code;
  link.lang=code;
  link.title=name;
  link.setAttribute("aria-label",name);
  if(lang===code)link.setAttribute("aria-current","page");
  link.innerHTML=flags[code]+'<span class="sr-only">'+name+'</span>';
  link.addEventListener("click",event=>{
   if(!api.setPreference(localStorage,code))return;
   // Browser handles the navigation; control remains a functioning normal link.
   if(code===lang)event.preventDefault();
  });
  box.appendChild(link);
 }
 // Append after the primary nav, at the right edge of the header.
 header.appendChild(box);
}
function localShell(){
 if(!pageLang)return;
 const home=api.home(lang);
 const tr=(en,de)=>lang==="en"?en:de;
 const unresolved=tr("Available in Turkish","Auf Türkisch verfügbar");
 const categories=[
  ["News","Nachrichten","/haberler/","#news"],
  ["Discrimination & Rights","Diskriminierung & Rechte","/almanyada-irkcilik/",null],
  ["Tools","Rechner","/araclar/","#tools"],
  ["Immigration & Career","Zuwanderung & Beruf","/goc-kariyer/","#guides"],
  ["Work & Income","Arbeit & Einkommen","/is-gelir/","#guides"],
  ["Settling In","Ankommen & Wohnen","/yerlesim/","#start"],
  ["Citizenship","Einbürgerung","/vatandaslik/",null],
  ["Family & Children","Familie & Kinder","/aile-cocuk/",null],
  ["Finance","Finanzen","/finans/",null],
  ["Insurance","Versicherungen","/sigorta/",null],
  ["Healthcare","Gesundheit","/saglik-sigortasi/",null],
  ["Car & Mobility","Auto & Mobilität","/mobilite-arac/",null],
  ["Blue Card","Blaue Karte EU","/blue-card/","/blue-card/"],
  ["Opportunity Card","Chancenkarte","/chancenkarte-firsat-karti/","/chancenkarte-firsat-karti/"],
  ["Kindergeld","Kindergeld","/kindergeld/",null],
  ["Tax","Steuern","/vergi/",null],
  ["Pensions","Rente","/emeklilik/",null],
  ["Housing & Mortgage","Wohnen & Immobilienkredit","/kredi/",null],
  ["Internet & Phone","Internet & Telefon","/telefon-internet/",null]
 ];
 function resolved(item){
  const [en,de,source,anchor]=item;
  const name=tr(en,de);
  if(anchor&&anchor.startsWith("/")&&api.equivalent(anchor,lang)!==home)return {name,href:api.equivalent(anchor,lang),untranslated:false};
  if(source&&api.equivalent(source,lang)!==home)return {name,href:api.equivalent(source,lang),untranslated:false};
  if(anchor&&anchor.startsWith("#"))return {name,href:home+anchor,untranslated:false};
  return {name,href:source,untranslated:true};
 }
 const attr=item=>item.untranslated?' lang="tr" hreflang="tr" title="'+unresolved+'"':'';
 const first=categories.slice(0,6);
 const mainNav=first.map(item=>{const t=resolved(item);return '<a class="site-nav-link" href="'+t.href+'"'+attr(t)+'>'+t.name+(t.untranslated?' <small class="ap-tr-indicator">TR</small>':'')+'</a>';}).join("");
 const mega=categories.map(item=>{const t=resolved(item);return '<a class="mega-link" href="'+t.href+'"'+attr(t)+'><span><strong>'+t.name+'</strong><small>'+(t.untranslated?unresolved:tr("Explore guides","Ratgeber entdecken"))+'</small></span></a>';}).join("");
 const header=document.querySelector(".site-header");
 if(header){
  header.innerHTML='<div class="container header-inner"><a class="site-brand" href="'+home+'"><img class="site-brand-logo" src="/assets/brand/almanya-pusulasi-logo-64.png" alt=""><span class="site-brand-copy"><strong>Almanya Pusulası</strong><small>'+d.intro+'</small></span></a><button type="button" class="mobile-menu-toggle" aria-label="'+tr("Open menu","Menü öffnen")+'" aria-expanded="false" aria-controls="ap-site-nav"><span></span><span></span><span></span></button><nav class="site-nav" id="ap-site-nav" aria-label="'+d.topics+'"><div class="primary-nav-links">'+mainNav+'</div><details class="nav-more"><summary>'+tr("All Guides","Alle Ratgeber")+' <span>⌄</span></summary><div class="nav-mega"><div class="nav-mega-grid">'+mega+'</div></div></details></nav></div>';
  const secondary=categories.slice(0,6).concat([categories[7],categories[8]]).map(item=>{const t=resolved(item);return '<a href="'+t.href+'"'+attr(t)+'>'+t.name+'</a>';}).join("");
  header.insertAdjacentHTML("beforeend",'<nav class="ap-secondary-nav" aria-label="'+tr("Topic categories","Themenkategorien")+'"><div class="container ap-secondary-links">'+secondary+'</div></nav>');
  const toggle=header.querySelector(".mobile-menu-toggle");
  const nav=header.querySelector(".site-nav");
  const close=()=>{toggle.setAttribute("aria-expanded","false");toggle.setAttribute("aria-label",tr("Open menu","Menü öffnen"));nav.classList.remove("is-open");document.body.classList.remove("menu-open");};
  toggle.addEventListener("click",()=>{const open=nav.classList.toggle("is-open");toggle.setAttribute("aria-expanded",String(open));toggle.setAttribute("aria-label",open?tr("Close menu","Menü schließen"):tr("Open menu","Menü öffnen"));document.body.classList.toggle("menu-open",open);});
  document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;if(nav.classList.contains("is-open")){close();toggle.focus();}});
  document.addEventListener("click",e=>{if(nav.classList.contains("is-open")&&!header.contains(e.target))close();});
 }
 const footer=document.querySelector(".footer");
 if(footer){
  const columns=[
   [[tr("Discover","Entdecken"),null],[tr("Guides","Ratgeber"),home+"#guides"],[tr("Tools","Rechner"),home+"#tools"],[tr("News","Nachrichten"),home+"#news"],[tr("Blue Card","Blaue Karte"),"/"+lang+"/blue-card/"],[tr("Opportunity Card","Chancenkarte"),"/"+lang+"/chancenkarte-firsat-karti/"]],
   [[tr("Resources","Ressourcen"),null],[tr("Health insurance (TR)","Krankenversicherung (TR)"),"/saglik-sigortasi/"],[tr("Family benefits (TR)","Familienleistungen (TR)"),"/aile-cocuk/"],[tr("Tax (TR)","Steuern (TR)"),"/vergi/"]],
   [[tr("Information","Informationen"),null],[tr("About (TR)","Über uns (TR)"),"/about/"],[tr("Contact (TR)","Kontakt (TR)"),"/contact/"],[tr("Privacy (TR)","Datenschutz (TR)"),"/privacy/"],["Impressum","/impressum/"]]
  ];
  const renderColumn=items=>'<div><strong class="footer-title">'+items[0][0]+'</strong>'+items.slice(1).map(([label,href])=>'<a href="'+href+'"'+(href.startsWith("/")&&!href.startsWith("/"+lang+"/")?attr({untranslated:true}):"")+'>'+label+'</a>').join("")+'</div>';
  footer.innerHTML='<div class="container footer-grid"><div class="footer-brand"><a href="'+home+'" class="footer-brand-name">Almanya Pusulası</a><p>'+d.intro+'</p></div>'+columns.map(renderColumn).join("")+'</div><div class="container footer-bottom"><span>© 2026 Almanya Pusulası</span><span>'+d.intro+'</span></div>';
  if(path==="/en/"||path==="/de/"){
   const credit=document.createElement("div");credit.className="ap-photo-credit";
   credit.innerHTML='<div class="container">'+d.credit+': <a href="https://commons.wikimedia.org/wiki/File:Rheinpanorama_mit_Hohenzollernbr%C3%BCcke,_K%C3%B6lner_Dom,_Gro%C3%9F_St._Martin_und_Deutzer_Br%C3%BCcke.jpg" target="_blank" rel="noopener noreferrer">Juri Kowski / Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0</a></div>';
   footer.appendChild(credit);
  }
 }
 document.querySelectorAll(".site-context-bar,.hub-return-rail").forEach(el=>el.remove());
}
function start(){localShell();createPicker();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();

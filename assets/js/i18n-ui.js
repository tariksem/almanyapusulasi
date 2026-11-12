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
 const header=document.querySelector(".site-header");
 if(header){
  const homePrefix=api.home(lang);
  const navLabels=lang==="de"?[["Startseite","#start"],["Ratgeber","#guides"],["Rechner","#tools"],["Nachrichten","#news"]]:[["Home","#start"],["Guides","#guides"],["Tools","#tools"],["News","#news"]];
  const navTarget=anchor=>(path==="/en/"||path==="/de/")?anchor:homePrefix+anchor;
  header.innerHTML='<div class="container header-inner"><a class="site-brand" href="'+api.home(lang)+'"><img class="site-brand-logo" src="/assets/brand/almanya-pusulasi-logo-64.png" alt=""><span class="site-brand-copy"><strong>Almanya Pusulası</strong><small>'+d.intro+'</small></span></a><nav class="ap-local-header-nav" aria-label="'+d.topics+'">'+navLabels.map(([label,anchor])=>'<a href="'+navTarget(anchor)+'">'+label+'</a>').join("")+'</nav></div>';
 }
 const footer=document.querySelector(".footer");
 if(footer){
  const creditLink='https://commons.wikimedia.org/wiki/File:Rheinpanorama_mit_Hohenzollernbr%C3%BCcke,_K%C3%B6lner_Dom,_Gro%C3%9F_St._Martin_und_Deutzer_Br%C3%BCcke.jpg';
  footer.innerHTML='<div class="container" style="padding:28px 0"><strong>Almanya Pusulası</strong><p>'+d.intro+'</p><p><a href="'+api.home(lang)+'">'+d.home+'</a> · <a href="/privacy/" lang="tr">'+d.privacy+' (TR)</a> · <a href="/contact/" lang="tr">'+d.contact+' (TR)</a></p><small>'+d.credit+': <a href="'+creditLink+'" target="_blank" rel="noopener noreferrer">Juri Kowski / Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0</a></small></div>';
 }
 document.querySelectorAll(".site-context-bar,.hub-return-rail").forEach(el=>el.remove());
}
function start(){localShell();createPicker();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();

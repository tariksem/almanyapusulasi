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
 const hero=document.querySelector(".hero .hero-inner");
 const header=document.querySelector(".site-header .header-inner");
 const parent=hero||header;
 if(!parent)return;
 const box=document.createElement("div");
 box.className="ap-lang-picker"+(hero?"":" ap-lang-header");
 const id="ap-language-choice";
 const label=document.createElement("label");label.htmlFor=id;label.textContent=d.language;
 const select=document.createElement("select");select.id=id;select.setAttribute("aria-label",d.language);
 for(const [code,name] of [["tr","TR · Türkçe"],["en","EN · English"],["de","DE · Deutsch"]]){
  const option=document.createElement("option");option.value=code;option.textContent=name;select.append(option);
 }
 select.value=lang;
 select.addEventListener("change",()=>{
  const target=select.value;
  if(!api.setPreference(localStorage,target))return;
  if(target===lang)return;
  location.assign(api.home(target));
 });
 box.append(label,select);
 if(hero)hero.prepend(box);else header.append(box);
}
function localShell(){
 if(!pageLang)return;
 const header=document.querySelector(".site-header");
 if(header){
  header.innerHTML='<div class="container header-inner"><a class="site-brand" href="'+api.home(lang)+'"><img class="site-brand-logo" src="/assets/brand/almanya-pusulasi-logo-64.png" alt=""><span class="site-brand-copy"><strong>Almanya Pusulası</strong><small>'+d.intro+'</small></span></a></div>';
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

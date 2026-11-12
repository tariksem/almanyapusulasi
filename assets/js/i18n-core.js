(function(root){
"use strict";
const SUPPORTED=["tr","en","de"];
const KEY="ap_preferred_language";
const HOME={tr:"/",en:"/en/",de:"/de/"};
const normalize=value=>{const code=String(value||"").toLowerCase().split(/[-_]/)[0];return SUPPORTED.includes(code)?code:null;};
const languageFromPath=path=>/^\/en(?:\/|$)/.test(path)?"en":/^\/de(?:\/|$)/.test(path)?"de":null;
const translatedSlugs=new Set(["blue-card","chancenkarte-firsat-karti","blue-card-uygunluk-kontrolu-2026","chancenkarte-puan-hesaplayici-2026","kindergeld","familienversicherung","blue-card-suresiz-oturum","almanyada-ev-kiralama-rehberi","almanya-saglik-sigortasi-gkv-pkv"]);
function equivalent(path,lang){
 const code=normalize(lang)||"tr";
 const clean=String(path||"/").replace(/^\/(en|de)(?=\/|$)/,"");
 const slug=clean.split("/").filter(Boolean)[0];
 if(!slug||!translatedSlugs.has(slug))return home(code);
 return (code==="tr"?"/":"/"+code+"/")+slug+"/";
}
function stored(storage){try{return normalize(storage.getItem(KEY));}catch(_){return null;}}
function preferred(storage,languages){const saved=stored(storage);if(saved)return saved;for(const candidate of (languages||[])){const code=normalize(candidate);if(code)return code;}return "tr";}
function targetLanguage(path,storage,languages){return languageFromPath(path)||preferred(storage,languages);}
function home(lang){return HOME[normalize(lang)||"tr"];}
function setPreference(storage,lang){const code=normalize(lang);if(!code)return false;try{storage.setItem(KEY,code);}catch(_){}return true;}
const api={SUPPORTED,KEY,normalize,languageFromPath,stored,preferred,targetLanguage,home,equivalent,setPreference};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.AlmanyaI18n=api;
})(typeof window!=="undefined"?window:null);

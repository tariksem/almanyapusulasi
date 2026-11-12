(function(){
"use strict";
function init(){
 const form=document.getElementById("findForm");
 const input=document.getElementById("site-search");
 const panel=document.getElementById("searchResults");
 if(!form||!input||!panel)return;
 const lang=document.documentElement.lang==="de"?"de":"en";
 const labels=lang==="de"?{none:"Keine passenden Ergebnisse",type:"Ratgeber",tr:"Auf Türkisch",open:"Öffnen"}:{none:"No matching results",type:"Guide",tr:"In Turkish",open:"Open"};
 const fold=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ß/g,"ss");
 const entries=[...document.querySelectorAll(".journey,.tool,.guide,.ap-live-cards a,.ap-hub-links a,.news-home a.news-card")].map(a=>({
  url:a.getAttribute("href")||"",title:a.textContent.replace(/\s+/g," ").trim(),tr:a.hasAttribute("data-tr-only")
 })).filter(x=>x.title&&x.url&&!x.url.startsWith("#"));
 const extras=[["Blue Card","/"+lang+"/blue-card/"],["Chancenkarte","/"+lang+"/chancenkarte-firsat-karti/"],[lang==="de"?"Blaue Karte prüfen":"Check EU Blue Card","/"+lang+"/blue-card-uygunluk-kontrolu-2026/"],[lang==="de"?"Chancenkarte Punkte":"Opportunity Card points","/"+lang+"/chancenkarte-puan-hesaplayici-2026/"]];
 for(const [title,url] of extras)if(!entries.some(x=>x.url===url))entries.unshift({url,title,tr:false});
 const unique=[...new Map(entries.map(x=>[x.url,x])).values()];
 function render(){
  const query=fold(input.value).trim();
  panel.replaceChildren();
  if(!query){panel.classList.remove("visible");return;}
  const words=query.split(/\s+/).filter(Boolean);
  const found=unique.filter(e=>words.every(w=>fold(e.title).includes(w))).slice(0,9);
  if(!found.length){const p=document.createElement("p");p.className="ap-search-none";p.textContent=labels.none;panel.append(p);}
  for(const item of found){
    const a=document.createElement("a");a.href=item.url;a.className="result";
    const name=document.createElement("strong");name.textContent=item.title;
    const note=document.createElement("small");note.textContent=item.tr?labels.tr:labels.type;
    a.append(name,note);panel.append(a);
  }
  panel.classList.add("visible");
 }
 form.addEventListener("submit",e=>{e.preventDefault();render();const target=panel.querySelector("a.result");if(target)location.assign(target.href);});
 input.addEventListener("input",render);
 input.addEventListener("focus",render);
 document.addEventListener("click",e=>{if(!form.contains(e.target))panel.classList.remove("visible");});
 document.addEventListener("keydown",e=>{if(e.key==="Escape")panel.classList.remove("visible");});
 document.querySelectorAll(".popular button").forEach(button=>button.addEventListener("click",()=>{input.value=button.dataset.term||button.textContent;input.focus();render();}));
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();

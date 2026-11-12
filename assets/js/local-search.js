(function(){
"use strict";
const fold=s=>String(s||"").toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ß/g,"ss").trim();
function init(){
 const form=document.getElementById("ap-local-search");
 if(!form)return;
 const input=document.getElementById("ap-local-search-input");
 const feedback=document.getElementById("ap-search-feedback");
 const cards=Array.from(document.querySelectorAll(".ap-topic-card"));
 const empty=document.getElementById("ap-no-results");
 const lang=document.documentElement.lang==="de"?"de":"en";
 const resultLabel=lang==="de"?"Treffer":"results";
 function filter(){
  const terms=fold(input.value).split(/\s+/).filter(Boolean);
  let shown=0;
  for(const card of cards){
   const matches=terms.every(t=>fold(card.dataset.search).includes(t));
   card.hidden=!matches;
   if(matches)shown++;
  }
  if(empty)empty.hidden=shown!==0||!terms.length;
  feedback.textContent=terms.length?shown+" "+resultLabel:"";
  return shown;
 }
 form.addEventListener("submit",e=>{
  e.preventDefault();
  const count=filter();
  if(count)document.getElementById("guides").scrollIntoView({behavior:"smooth",block:"start"});
 });
 input.addEventListener("input",filter);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();

(function(root){
"use strict";
const BLUE_REGULAR=50700,BLUE_REDUCED=45934.2;
function blueEligibility(x){
 const salary=Math.max(0,Number(x.salary)||0);
 const lowProfile=x.route==="it"||x.low==="shortage"||x.low==="graduate";
 const threshold=lowProfile?BLUE_REDUCED:BLUE_REGULAR;
 const validJob=x.duration==="yes";
 const qualified=x.route==="degree"||(x.route==="it"&&x.itexp==="yes");
 const match=x.match==="yes";
 const licensed=x.regulated!=="yes-no-license";
 const salaryOk=salary>=threshold;
 const baRequired=x.route==="it"||(lowProfile&&salary<BLUE_REGULAR);
 const checks={job:validJob,qualification:qualified,match,license:licensed,salary:salaryOk};
 const blockers=Object.keys(checks).filter(key=>!checks[key]);
 return {salary,threshold,baRequired,checks,blockers,status:blockers.length?(salaryOk?"warn":"stop"):baRequired?"warn":"ok"};
}
function chanceEligibility(x){
 const recognized=x.recognized==="yes";
 const formal=x.formal==="yes";
 const baseLanguage=x.baseLanguage==="yes";
 const finance=x.finance==="yes";
 const points=["partial","shortage","exp","de","en","age","stay","partner"].reduce((sum,k)=>sum+(Number(x[k])||0),0);
 const checks=recognized?{recognized:true,finance}:{formal,baseLanguage,finance,points:points>=6};
 const blockers=Object.keys(checks).filter(key=>!checks[key]);
 const status=recognized?(finance?"ok":"warn"):(blockers.length?"stop":"ok");
 return {recognized,points,checks,blockers,status};
}
const engine={BLUE_REGULAR,BLUE_REDUCED,blueEligibility,chanceEligibility};
if(typeof module!=="undefined"&&module.exports)module.exports=engine;
if(!root)return;
root.APToolEngine=engine;
function money(n){return new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR",maximumFractionDigits:2}).format(n);}
function start(){
 const form=document.getElementById("ap-i18n-tool-form");
 const target=document.getElementById("ap-i18n-result");
 if(!form||!target)return;
 const dict=root.APToolLanguage||{};
 const tool=form.dataset.tool;
 const read=()=>Object.fromEntries([...form.querySelectorAll("input[id],select[id]")].map(el=>[el.id,el.value]));
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 function calculate(){
  const result=tool==="blue"?blueEligibility(read()):chanceEligibility(read());
  let title="",description="";
  if(result.blockers.length){
   title=dict.fixFirst+dict.field[result.blockers[0]];
   description=dict.blocker[result.blockers[0]];
   if(result.blockers[0]==="salary")description+=" "+money(result.threshold-result.salary);
   if(result.blockers[0]==="points")description+=" "+(6-result.points);
  }else if(result.baRequired){
   title=dict.baHeading;
   description=dict.baBody;
  }else{
   title=dict.okHeading;
   description=dict.okBody;
  }
  const rows=Object.entries(result.checks).map(([key,valid])=>'<div class="check">'+(valid?"✓":"✕")+' '+esc(dict.field[key]||key)+'</div>').join("");
  let detail="";
  if(tool==="blue")detail='<p><strong>'+esc(dict.threshold)+':</strong> '+money(result.threshold)+' · '+esc(dict.salary)+': '+money(result.salary)+'</p>'+(result.baRequired?'<p>'+esc(dict.baBody)+'</p>':'');
  else detail='<p><strong>'+esc(dict.route)+':</strong> '+esc(result.recognized?dict.recognizedRoute:dict.pointsRoute)+' · <strong>'+esc(dict.points)+':</strong> '+(result.recognized?esc(dict.notRequired):result.points)+'</p>';
  const failures=result.blockers.length?'<h3>'+esc(dict.blockersHeading)+'</h3><ul>'+result.blockers.map(key=>'<li><strong>'+esc(dict.field[key])+':</strong> '+esc(dict.blocker[key]||"")+'</li>').join("")+'</ul>':"";
  const link=tool==="blue"?"blue-card":"chancenkarte-firsat-karti";
  const locale=document.documentElement.lang==="de"?"de":"en";
  target.className="result "+(result.status==="ok"?"ok":result.status==="warn"?"warn":"stop");
  target.innerHTML='<h2>'+esc(title)+'</h2><p>'+esc(description)+'</p>'+detail+'<div class="checks">'+rows+'</div>'+failures+'<div class="next"><a href="/'+locale+'/'+link+'/">'+esc(dict.fullGuide)+' →</a></div>';
  if(root.APAnalytics&&typeof root.APAnalytics.track==="function")root.APAnalytics.track("tool_calculate",{tool_path:location.pathname,result_blockers:result.blockers.length});
 }
 form.addEventListener("submit",e=>{e.preventDefault();calculate();});
 calculate();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})(typeof window!=="undefined"?window:null);

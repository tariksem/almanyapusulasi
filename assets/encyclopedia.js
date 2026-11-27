(()=>{
'use strict';
const q=document.getElementById('ency-query');
const buttons=[...document.querySelectorAll('[data-filter]')];
const cards=[...document.querySelectorAll('.ency-card')];
const empty=document.getElementById('ency-empty');
const lang=document.documentElement.lang||'tr';
const normalize=s=>(s||'').toLocaleLowerCase(lang).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
let active='all';
function apply(){
 const term=normalize(q?.value?.trim());
 let shown=0;
 for(const card of cards){
  const text=normalize(card.dataset.search+' '+(card.textContent||''));
  const match=(active==='all'||card.dataset.category===active)&&text.includes(term);
  card.hidden=!match;
  if(match)shown++;
 }
 if(empty)empty.hidden=shown!==0;
}
for(const button of buttons){
 button.addEventListener('click',()=>{
  active=button.dataset.filter;
  for(const other of buttons){
   const selected=other===button;
   other.classList.toggle('selected',selected);
   other.setAttribute('aria-pressed',String(selected));
  }
  apply();
 });
}
q?.addEventListener('input',apply);
apply();
document.getElementById('life-random-hero')?.addEventListener('click',()=>{
 const options=cards.filter(card=>!card.hidden);
 const pool=options.length?options:cards;
 if(!pool.length)return;
 const chosen=pool[Math.floor(Math.random()*pool.length)];
 const link=chosen.querySelector('a.life-card-link[href]');
 if(link)window.location.assign(link.href);
});
const quiz=document.getElementById('life-quiz-form');
const result=document.getElementById('life-quiz-result');
if(quiz&&result){
 const messages=JSON.parse(quiz.dataset.scoreMessages||'["","",""]');
 const emptyError={tr:'Önce üç soruyu da yanıtla.',en:'Please answer all three questions first.',de:'Bitte zuerst alle drei Fragen beantworten.'}[lang]||'Please answer all questions.';
 quiz.addEventListener('submit',event=>{
  event.preventDefault();
  const questions=[...quiz.querySelectorAll('.life-question')];
  let score=0,answered=0;
  questions.forEach((question)=>{
   const chosen=question.querySelector('input:checked');
   if(chosen){
    answered++;
    if(Number(chosen.value)===1)score++;
   }
  });
  result.hidden=false;
  if(answered<questions.length){
   result.textContent=emptyError;
   const unanswered=questions.find(item=>!item.querySelector('input:checked'));
   unanswered?.querySelector('input')?.focus();
   return;
  }
  const message=messages[score===3?2:score>=2?1:0]||'';
  result.replaceChildren();
  const strong=document.createElement('strong');
  strong.textContent=score+' / '+questions.length+' — '+message;
  const paragraph=document.createElement('p');
  paragraph.textContent=quiz.dataset.quizExplanation||'';
  result.append(strong,paragraph);
  result.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
 });
 quiz.addEventListener('reset',()=>{result.hidden=true;result.textContent='';});
}
})();
(function(){
  'use strict';

  const LOCAL_DATA='/assets/data/einbuergerungstest.json';
  const FALLBACK_DATA='https://raw.githubusercontent.com/leben-in-deutschland/leben-in-deutschland-scrapper/main/data/question.json';
  const STORE='ap_einbuergerungstest_v1';
  const LETTERS=['a','b','c','d'];
  const STATES={
    bw:'Baden-Württemberg',by:'Bayern',be:'Berlin',bb:'Brandenburg',hb:'Bremen',hh:'Hamburg',he:'Hessen',mv:'Mecklenburg-Vorpommern',ni:'Niedersachsen',nw:'Nordrhein-Westfalen',rp:'Rheinland-Pfalz',sl:'Saarland',sn:'Sachsen',st:'Sachsen-Anhalt',sh:'Schleswig-Holstein',th:'Thüringen'
  };

  let data=[];
  let general=[];
  let state=[];
  let pool=[];
  let index=0;
  let mode='study';
  let exam=null;
  let timerId=null;

  const el=id=>document.getElementById(id);
  const safe=(v)=>String(v==null?'':v);
  const escapeHtml=(s)=>safe(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function loadStore(){
    try{return JSON.parse(localStorage.getItem(STORE)||'{}');}catch(_){return {};}
  }
  function saveStore(s){try{localStorage.setItem(STORE,JSON.stringify(s));}catch(_){}}
  function storePatch(fn){const s=loadStore();fn(s);saveStore(s);return s;}

  function normalize(raw){
    const list=Array.isArray(raw)?raw:(raw.questions||[]);
    return list.map(q=>{
      if(Array.isArray(q.answers))return q;
      const tr=(q.translation||{}).tr||{};
      return {num:safe(q.num).trim(),id:q.id||'',question:q.question||'',answers:[q.a||'',q.b||'',q.c||'',q.d||''],solution:safe(q.solution).trim().toLowerCase(),image:q.image||'',context:q.context||'',category:q.category||'General',tr:{question:tr.question||'',answers:[tr.a||'',tr.b||'',tr.c||'',tr.d||''],context:tr.context||''}};
    }).filter(q=>q.question&&q.answers&&q.answers.length===4);
  }

  async function fetchData(){
    let res;
    try{res=await fetch(LOCAL_DATA,{cache:'no-store'});if(res.ok)return normalize(await res.json());}catch(_){ }
    res=await fetch(FALLBACK_DATA,{cache:'no-store'});
    if(!res.ok)throw new Error('Soru verileri yüklenemedi.');
    return normalize(await res.json());
  }

  function stateCode(){return (el('citizenState')&&el('citizenState').value)||'nw';}
  function splitData(){
    general=data.filter(q=>/^\d+$/.test(q.num)&&Number(q.num)<=300).sort((a,b)=>Number(a.num)-Number(b.num));
    const code=stateCode().toUpperCase()+'-';
    state=data.filter(q=>q.num.toUpperCase().startsWith(code)).sort((a,b)=>Number(a.num.split('-')[1])-Number(b.num.split('-')[1]));
  }
  function key(q){return q.id||q.num+'|'+q.question.slice(0,30);}
  function solutionIndex(q){
    const s=safe(q.solution).toLowerCase();
    if(LETTERS.includes(s))return LETTERS.indexOf(s);
    if(/^[0-3]$/.test(s))return Number(s);
    if(/^[1-4]$/.test(s))return Number(s)-1;
    const text=q.answers.findIndex(a=>a.trim().toLowerCase()===s.trim().toLowerCase());
    return text>=0?text:0;
  }
  function answerRecord(q){return (loadStore().answers||{})[key(q)]||null;}
  function isFav(q){return !!((loadStore().favorites||{})[key(q)]);}
  function isWrong(q){const r=answerRecord(q);return !!(r&&!r.correct);}
  function isCorrect(q){const r=answerRecord(q);return !!(r&&r.correct);}

  function choosePool(){
    splitData();
    const s=loadStore();
    if(mode==='wrong')pool=[...general,...state].filter(isWrong);
    else if(mode==='favorites')pool=[...general,...state].filter(isFav);
    else if(mode==='state')pool=[...state];
    else pool=[...general,...state];
    const filter=el('citizenFilter')?el('citizenFilter').value:'all';
    if(filter==='general')pool=pool.filter(q=>/^\d+$/.test(q.num));
    if(filter==='state')pool=pool.filter(q=>!/^\d+$/.test(q.num));
    const search=(el('citizenSearch')?el('citizenSearch').value:'').trim().toLocaleLowerCase('tr');
    if(search)pool=pool.filter(q=>(q.num+' '+q.question+' '+((q.tr||{}).question||'')).toLocaleLowerCase('tr').includes(search));
    index=Math.max(0,Math.min(index,pool.length-1));
    renderStats();renderQuestion();
  }

  function renderStats(){
    const all=[...general,...state];
    const answered=all.filter(q=>answerRecord(q)).length;
    const correct=all.filter(isCorrect).length;
    const wrong=all.filter(isWrong).length;
    el('citizenAnswered').textContent=answered;
    el('citizenCorrect').textContent=correct;
    el('citizenWrong').textContent=wrong;
    el('citizenTotal').textContent=general.length+' + '+state.length;
    const pct=all.length?Math.round(answered/all.length*100):0;
    el('citizenProgressFill').style.width=pct+'%';
    el('citizenProgressText').textContent='%'+pct+' tamamlandı';
    el('citizenDataCount').textContent=general.length+' genel + '+state.length+' '+STATES[stateCode()]+' sorusu';
  }

  function renderImage(q){
    const src=safe(q.image).trim();
    if(!src)return '';
    if(src.startsWith('http')||src.startsWith('data:image/'))return '<img class="citizen-image" src="'+escapeHtml(src)+'" alt="Soru görseli" loading="lazy">';
    return '';
  }

  function answerButton(q,i,rec){
    const correct=solutionIndex(q);
    let cls='citizen-answer';
    if(rec&&i===correct)cls+=' is-correct';
    if(rec&&i===rec.selected&&i!==correct)cls+=' is-wrong';
    const tr=((q.tr||{}).answers||[])[i]||'';
    return '<button type="button" class="'+cls+'" data-answer="'+i+'" '+(rec?'disabled':'')+'><span class="citizen-answer-letter">'+LETTERS[i].toUpperCase()+'</span><span><span class="citizen-answer-de">'+escapeHtml(q.answers[i])+'</span>'+(tr?'<span class="citizen-answer-tr">'+escapeHtml(tr)+'</span>':'')+'</span></button>';
  }

  function explanation(q,rec){
    if(!rec)return '';
    const correct=solutionIndex(q);
    const trContext=((q.tr||{}).context||'').trim();
    const deContext=(q.context||'').trim();
    return '<div class="citizen-explanation"><strong>'+(rec.correct?'Doğru cevap.':'Doğru cevap: '+LETTERS[correct].toUpperCase()+') '+escapeHtml(q.answers[correct]))+'</strong>'+
      (trContext?'<p><b>Türkçe açıklama:</b> '+escapeHtml(trContext)+'</p>':'')+
      (deContext?'<details><summary>Almanca açıklamayı göster</summary><p>'+escapeHtml(deContext)+'</p></details>':'')+
      '<small>Türkçe çeviri ve açıklamalar çalışma desteğidir; resmî BAMF çevirisi değildir.</small></div>';
  }

  function questionLabel(q){return /^\d+$/.test(q.num)?'Genel soru':'Eyalet · '+STATES[stateCode()];}

  function renderQuestion(){
    const host=el('citizenQuestionHost');
    if(!host)return;
    if(mode==='exam'){renderExam();return;}
    if(!pool.length){host.innerHTML='<div class="citizen-empty"><strong>Bu görünümde soru yok.</strong><p>Filtreyi değiştirin veya diğer sorulara dönün.</p></div>';return;}
    const q=pool[index],rec=answerRecord(q),trq=((q.tr||{}).question||'').trim();
    host.innerHTML='<section class="citizen-question"><div class="citizen-question-head"><div class="citizen-kicker"><span class="citizen-pill">Soru '+escapeHtml(q.num)+'</span><span class="citizen-pill">'+escapeHtml(questionLabel(q))+'</span>'+(q.category?'<span class="citizen-pill">'+escapeHtml(q.category)+'</span>':'')+'</div><button class="citizen-fav" id="citizenFav" type="button" aria-label="Favoriye ekle">'+(isFav(q)?'★':'☆')+'</button></div>'+renderImage(q)+'<p class="citizen-de" lang="de">'+escapeHtml(q.question)+'</p>'+(trq?'<p class="citizen-tr" lang="tr">'+escapeHtml(trq)+'</p>':'')+'<div class="citizen-answers">'+q.answers.map((_,i)=>answerButton(q,i,rec)).join('')+'</div>'+explanation(q,rec)+'<div class="citizen-nav"><div class="citizen-nav-group"><button class="btn btn-secondary" type="button" id="citizenPrev" '+(index===0?'disabled':'')+'>← Önceki</button><button class="btn btn-primary" type="button" id="citizenNext" '+(index===pool.length-1?'disabled':'')+'>Sonraki →</button></div><div class="citizen-jump"><span>'+ (index+1)+' / '+pool.length+'</span><input id="citizenJumpInput" type="number" min="1" max="'+pool.length+'" placeholder="Soru"><button class="btn btn-secondary" id="citizenJump" type="button">Git</button></div></div></section>';
    host.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>submitAnswer(q,Number(b.dataset.answer)));
    el('citizenFav').onclick=()=>toggleFav(q);
    el('citizenPrev').onclick=()=>{if(index>0){index--;renderQuestion();scrollCard();}};
    el('citizenNext').onclick=()=>{if(index<pool.length-1){index++;renderQuestion();scrollCard();}};
    el('citizenJump').onclick=()=>{const n=Math.max(1,Math.min(pool.length,Number(el('citizenJumpInput').value)||1));index=n-1;renderQuestion();scrollCard();};
  }

  function submitAnswer(q,selected){
    const correct=selected===solutionIndex(q);
    storePatch(s=>{s.answers=s.answers||{};s.answers[key(q)]={selected,correct,at:Date.now()};});
    if(typeof window.gtag==='function')window.gtag('event','citizenship_question_answer',{question_num:q.num,correct:correct,state:stateCode()});
    renderStats();renderQuestion();
  }
  function toggleFav(q){storePatch(s=>{s.favorites=s.favorites||{};if(s.favorites[key(q)])delete s.favorites[key(q)];else s.favorites[key(q)]=true;});renderQuestion();}
  function scrollCard(){const h=el('citizenQuestionHost');if(h)h.scrollIntoView({behavior:'smooth',block:'start'});}

  function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function startExam(){
    splitData();
    if(general.length<30||state.length<3){alert('Deneme sınavı için soru verileri henüz tam yüklenmedi.');return;}
    mode='exam';
    exam={questions:[...shuffle(general).slice(0,30),...shuffle(state).slice(0,3)].sort(()=>Math.random()-.5),index:0,answers:{},started:Date.now(),ends:Date.now()+60*60*1000,finished:false};
    setActiveTab('exam');startTimer();renderQuestion();scrollCard();
    if(typeof window.gtag==='function')window.gtag('event','citizenship_exam_start',{state:stateCode()});
  }
  function startTimer(){clearInterval(timerId);timerId=setInterval(()=>{if(!exam||exam.finished)return;const left=Math.max(0,exam.ends-Date.now());const t=el('citizenTimer');if(t)t.textContent=formatTime(left);if(left<=0)finishExam();},1000);}
  function formatTime(ms){const sec=Math.ceil(ms/1000),m=Math.floor(sec/60),s=sec%60;return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');}
  function renderExam(){
    const host=el('citizenQuestionHost');if(!exam){startExam();return;}if(exam.finished){renderExamResult();return;}
    const q=exam.questions[exam.index],selected=exam.answers[exam.index];
    host.innerHTML='<div class="citizen-exam-banner"><div><strong>Gerçek sınav provası</strong><div>33 soru · 30 genel + 3 '+escapeHtml(STATES[stateCode()])+' · Geçme: 17 doğru</div></div><div class="citizen-timer" id="citizenTimer">'+formatTime(exam.ends-Date.now())+'</div></div><section class="citizen-question"><div class="citizen-question-head"><div class="citizen-kicker"><span class="citizen-pill">Soru '+(exam.index+1)+' / 33</span><span class="citizen-pill">'+escapeHtml(questionLabel(q))+'</span></div></div>'+renderImage(q)+'<p class="citizen-de" lang="de">'+escapeHtml(q.question)+'</p>'+(((q.tr||{}).question)?'<p class="citizen-tr" lang="tr">'+escapeHtml(q.tr.question)+'</p>':'')+'<div class="citizen-answers">'+q.answers.map((a,i)=>'<button type="button" class="citizen-answer '+(selected===i?'is-selected':'')+'" data-exam-answer="'+i+'"><span class="citizen-answer-letter">'+LETTERS[i].toUpperCase()+'</span><span><span class="citizen-answer-de">'+escapeHtml(a)+'</span>'+((((q.tr||{}).answers||[])[i])?'<span class="citizen-answer-tr">'+escapeHtml(q.tr.answers[i])+'</span>':'')+'</span></button>').join('')+'</div><div class="citizen-nav"><div class="citizen-nav-group"><button class="btn btn-secondary" id="examPrev" type="button" '+(exam.index===0?'disabled':'')+'>← Önceki</button>'+(exam.index===32?'<button class="btn btn-primary" id="examFinish" type="button">Sınavı bitir</button>':'<button class="btn btn-primary" id="examNext" type="button">Sonraki →</button>')+'</div><span>'+(Object.keys(exam.answers).length)+' / 33 cevaplandı</span></div></section>';
    host.querySelectorAll('[data-exam-answer]').forEach(b=>b.onclick=()=>{exam.answers[exam.index]=Number(b.dataset.examAnswer);renderExam();});
    if(el('examPrev'))el('examPrev').onclick=()=>{exam.index--;renderExam();};
    if(el('examNext'))el('examNext').onclick=()=>{exam.index++;renderExam();};
    if(el('examFinish'))el('examFinish').onclick=finishExam;
  }
  function finishExam(){if(!exam||exam.finished)return;exam.finished=true;clearInterval(timerId);let correct=0;exam.questions.forEach((q,i)=>{if(exam.answers[i]===solutionIndex(q))correct++;});exam.correct=correct;exam.passed=correct>=17;if(typeof window.gtag==='function')window.gtag('event','citizenship_exam_finish',{state:stateCode(),correct:correct,passed:exam.passed});renderExamResult();}
  function renderExamResult(){
    const missed=exam.questions.map((q,i)=>({q,i,ok:exam.answers[i]===solutionIndex(q)})).filter(x=>!x.ok);
    el('citizenQuestionHost').innerHTML='<div class="citizen-result '+(exam.passed?'pass':'fail')+'"><h2>'+(exam.passed?'Deneme sınavını geçtiniz':'Biraz daha çalışma gerekiyor')+'</h2><strong>'+exam.correct+' / 33</strong><p>Resmî Einbürgerungstest için geçme eşiği 17 doğru cevaptır.</p><button class="btn btn-primary" id="examAgain" type="button">Yeni deneme başlat</button><button class="btn btn-secondary" id="examReview" type="button">Yanlışları çalış</button></div>';
    el('examAgain').onclick=startExam;
    el('examReview').onclick=()=>{missed.forEach(x=>storePatch(s=>{s.answers=s.answers||{};s.answers[key(x.q)]={selected:exam.answers[x.i]??-1,correct:false,at:Date.now()};}));mode='wrong';setActiveTab('wrong');choosePool();};
  }

  function setActiveTab(name){document.querySelectorAll('.citizen-tab').forEach(b=>b.classList.toggle('is-active',b.dataset.mode===name));}
  function bind(){
    el('citizenState').onchange=()=>{storePatch(s=>s.state=stateCode());index=0;if(mode==='exam'){exam=null;mode='study';setActiveTab('study');}choosePool();};
    el('citizenFilter').onchange=()=>{index=0;choosePool();};
    el('citizenSearch').oninput=()=>{index=0;choosePool();};
    document.querySelectorAll('.citizen-tab').forEach(b=>b.onclick=()=>{const m=b.dataset.mode;if(m==='exam'){startExam();return;}clearInterval(timerId);exam=null;mode=m;index=0;setActiveTab(m);choosePool();});
    el('citizenReset').onclick=()=>{if(confirm('Bu cihazdaki vatandaşlık testi ilerlemesi, yanlışlar ve favoriler silinsin mi?')){localStorage.removeItem(STORE);index=0;choosePool();}};
  }

  async function init(){
    const host=el('citizenQuestionHost');if(!host)return;
    const s=loadStore();if(s.state&&STATES[s.state])el('citizenState').value=s.state;
    bind();
    try{data=await fetchData();splitData();choosePool();el('citizenLoading').hidden=true;el('citizenAppBody').hidden=false;}catch(err){el('citizenLoading').innerHTML='<strong>Soru verileri şu anda yüklenemedi.</strong><p>Sayfayı yenileyin veya <a href="https://oet.bamf.de/ords/oetut/f?p=514:1:0" target="_blank" rel="noopener">BAMF resmî soru kataloğunu açın</a>.</p>';}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
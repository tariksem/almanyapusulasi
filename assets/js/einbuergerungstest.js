(function(){
  'use strict';

  const DATA_VERSION='20260907-2';
  const LOCAL_DATA='/assets/data/einbuergerungstest.json?v='+DATA_VERSION;
  const FALLBACK_DATA='https://raw.githubusercontent.com/leben-in-deutschland/leben-in-deutschland-scrapper/main/data/question.json';
  const STORE='ap_einbuergerungstest_v1';
  const LETTERS=['a','b','c','d'];
  const STATES={bw:'Baden-WÃ¼rttemberg',by:'Bayern',be:'Berlin',bb:'Brandenburg',hb:'Bremen',hh:'Hamburg',he:'Hessen',mv:'Mecklenburg-Vorpommern',ni:'Niedersachsen',nw:'Nordrhein-Westfalen',rp:'Rheinland-Pfalz',sl:'Saarland',sn:'Sachsen',st:'Sachsen-Anhalt',sh:'Schleswig-Holstein',th:'ThÃ¼ringen'};
  const CATEGORY_TR={
    'Rights & Freedoms':'Haklar ve Ã¶zgÃ¼rlÃ¼kler',
    'Education & Religion':'EÄŸitim ve din',
    'Law & Governance':'Hukuk ve yÃ¶netim',
    'Democracy & Politics':'Demokrasi ve siyaset',
    'Economy & Employment':'Ekonomi ve Ã§alÄ±ÅŸma hayatÄ±',
    'History & Geography':'Tarih ve coÄŸrafya',
    'Elections':'SeÃ§imler',
    'Press Freedom':'BasÄ±n Ã¶zgÃ¼rlÃ¼ÄŸÃ¼',
    'Assembly & Protests':'ToplantÄ± ve gÃ¶steri hakkÄ±',
    'Federal System':'Federal sistem',
    'Constitution':'Anayasa',
    'General':'Genel'
  };

  let data=[],general=[],state=[],pool=[];
  let index=0,mode='study',exam=null,timerId=null;

  const el=id=>document.getElementById(id);
  const safe=v=>String(v==null?'':v);
  const escapeHtml=s=>safe(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function loadStore(){try{return JSON.parse(localStorage.getItem(STORE)||'{}');}catch(_){return {};}}
  function saveStore(s){try{localStorage.setItem(STORE,JSON.stringify(s));}catch(_){}}
  function storePatch(fn){const s=loadStore();fn(s);saveStore(s);return s;}

  function normalize(raw){
    const list=Array.isArray(raw)?raw:(raw.questions||[]);
    return list.map(q=>{
      if(Array.isArray(q.answers))return q;
      // Critical quality rule: the upstream fallback may contain AI-generated Turkish.
      // Never expose that text. Fallback questions remain German-only until reviewed data loads.
      return {num:safe(q.num).trim(),id:q.id||'',question:q.question||'',answers:[q.a||'',q.b||'',q.c||'',q.d||''],solution:safe(q.solution).trim().toLowerCase(),image:q.image||'',context:q.context||'',category:q.category||'General',tr:{question:'',answers:['','','',''],context:'',reviewed:false,source:'TÃ¼rkÃ§e Ã§eviri henÃ¼z editÃ¶r kontrolÃ¼nde'}};
    }).filter(q=>q.question&&q.answers&&q.answers.length===4);
  }

  async function fetchData(){
    let res;
    try{res=await fetch(LOCAL_DATA,{cache:'no-store'});if(res.ok)return normalize(await res.json());}catch(_){ }
    res=await fetch(FALLBACK_DATA,{cache:'no-store'});
    if(!res.ok)throw new Error('Soru verileri yÃ¼klenemedi.');
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
  function categoryLabel(q){return CATEGORY_TR[q.category]||q.category||'';}

  function choosePool(){
    splitData();
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
    el('citizenProgressText').textContent='%'+pct+' tamamlandÄ±';
    el('citizenDataCount').textContent=general.length+' genel + '+state.length+' '+STATES[stateCode()]+' sorusu';
  }

  function renderImage(q){
    const src=safe(q.image).trim();
    if(!src)return '';
    if(src.startsWith('http')||src.startsWith('data:image/'))return '<img class="citizen-image" src="'+escapeHtml(src)+'" alt="Soru gÃ¶rseli" loading="lazy">';
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

  function richExplanation(text){
    const value=safe(text).trim();
    if(!value)return '';
    const marker='SÄ±nav ipucu:';
    const at=value.indexOf(marker);
    if(at<0)return '<p class="citizen-explanation-text">'+escapeHtml(value)+'</p>';
    const main=value.slice(0,at).trim();
    const tip=value.slice(at+marker.length).trim();
    return (main?'<p class="citizen-explanation-text">'+escapeHtml(main)+'</p>':'')+(tip?'<div class="citizen-study-tip"><strong>SÄ±nav ipucu</strong><span>'+escapeHtml(tip)+'</span></div>':'');
  }

  function explanation(q,rec){
    if(!rec)return '';
    const correct=solutionIndex(q);
    const tr=((q.tr||{}).answers||[])[correct]||'';
    const trContext=((q.tr||{}).context||'').trim();
    const deContext=(q.context||'').trim();
    const reviewed=!!((q.tr||{}).reviewed);
    return '<div class="citizen-explanation">'+
      '<div class="citizen-correct-head"><span class="citizen-correct-icon">âœ“</span><div><strong>'+(rec.correct?'DoÄŸru cevap':'DoÄŸru seÃ§enek: '+LETTERS[correct].toUpperCase())+'</strong><div class="citizen-correct-answer" lang="de">'+escapeHtml(q.answers[i])+'</div>'+(tr?'<div class="citizen-correct-tr" lang="tr">'+escapeHtml(tr)+'</div>':'')+'</div></div>'+
      (trContext?'<div class="citizen-learning"><h3>Neden doÄŸru?</h3>'+richExplanation(trContext)+'</div>':'')+
      (deContext?'<details><summary>Almanca kaynak aÃ§Ä±klamasÄ±nÄ± gÃ¶ster</summary><p>'+escapeHtml(deContext)+'</p></details>':'')+
      '<div class="citizen-explanation-meta">'+(reviewed?'<span class="citizen-reviewed">EditÃ¶r kontrollÃ¼ TÃ¼rkÃ§e</span>':'<span>TÃ¼rkÃ§e henÃ¼z editÃ¶r kontrolÃ¼nde</span>')+'<small>ResmÃ® BAMF Ã§evirisi deÄŸildir.</small></div></div>';
  }

  function questionLabel(q){return /^\d+$/.test(q.num)?'Genel soru':'Eyalet Â· '+STATES[stateCode()];}

  function renderQuestion(){
    const host=el('citizenQuestionHost');
    if(!host)return;
    if(mode==='exam'){renderExam();return;}
    if(!pool.length){host.innerHTML='<div class="citizen-empty"><strong>Bu gÃ¶rÃ¼nÃ¼mde soru yok.</strong><p>Filtreyi deÄŸiÅŸtirin veya diÄŸer sorulara dÃ¶nÃ¼n.</p></div>';return;}
    const q=pool[index],rec=answerRecord(q),trq=((q.tr||{}).question||'').trim();
    const trPending=!trq?'<div class="citizen-translation-pending">Bu sorunun TÃ¼rkÃ§e Ã§evirisi editÃ¶r kontrolÃ¼nden geÃ§iyor. YanlÄ±ÅŸ Ã§eviri gÃ¶stermemek iÃ§in geÃ§ici olarak yalnÄ±z Almanca metin gÃ¶steriliyor.</div>':'';
    const nextDisabled=(index===pool.length-1||!rec)?'disabled':'';
    host.innerHTML='<section class="citizen-question"><div class="citizen-question-head"><div class="citizen-kicker"><span class="citizen-pill">Soru '+escapeHtml(q.num)+'</span><span class="citizen-pill">'+escapeHtml(questionLabel(q))+'</span>'+(q.category?'<span class="citizen-pill">'+escapeHtml(categoryLabel(q))+'</span>':'')+'</div><button class="citizen-fav" id="citizenFav" type="button" aria-label="Favoriye ekle">'+(isFab(q)?'â˜…':'â˜†')+'</button></div>'+renderImage(q)+'<p class="citizen-de" lang="de">'+escapeHtml(q.question)+'</p>'+(htrq?'<p class="citizen-tr" lang="tr">'+escapeHtml(trq)+'</p>':trPending)+'<div class="citizen-answers">'+q.answers.map((_,i)=>answerButton(q,i,rec)).join('')+'</div>'+explanation(q,rec)+'<div class="citizen-nav"><div class="citizen-nav-group"><button class="btn btn-secondary" type="button" id="citizenPrev" '+(index===0?'disabled':'')+'>â† Ãnceki</button><button class="btn btn-primary" type="button" id="citizenNext" '+nextDisabled+'>Sonraki â†’</button></div><div class="citizen-jump"><span>'+(index+1)+' / '+pool.length+'</span><input id="citizenJumpInput" type="number" min="1" max="'+pool.length+'" placeholder="Soru"><button class="btn btn-secondary" id="citizenJump" type="button">Git</button></div></div></section>';
    host.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>submitAnswer(q,Number(b.dataset.answer)));
    el('citizenFav').onclick=()=>toggleFav(q);
    el('citizenPrev').onclick=()=>{if(index>0){index--;renderQuestion();scrollCard();}};
    el('citizenNext').onclick=()=>{if(answerRecord(q)&&index<pool.length-1){index++;renderQuestion();scrollCard();}};
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
    if(general.length<30||state.length<3){alert('Deneme sÄ±navÄ± iÃ§in soru verileri henÃ¼z tam yÃ¼klenmedi.');return;}
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
    host.innerHTML='<div class="citizen-exam-banner"><div><strong>GerÃ§ek sÄ±nav provasÄ±</strong><div>33 soru Â· 30 genel + 3 '+escapeHtml(STATES[stateCode()])+' Â· GefÖS¢rFüI÷'SÂöF—cãÂöF—cãÆF—b6Æ73Ò&6—F—¦Vâ×F–ÖW""–CÒ&6—F—¦VåF–ÖW"#âr¶f÷&ÖEF–ÖR†W†ÒæVæG2ÔFFRææ÷r‚’’²sÂöF—cãÂöF—cãÇ6V7F–öâ6Æ73Ò&6—F—¦Vâ×VW7F–öâ#ãÆF—b6Æ73Ò&6—F—¦Vâ×VW7F–öâÖ†VB#ãÆF—b6Æ73Ò&6—F—¦VâÖ¶–6¶W"#ãÇ7â6Æ73Ò&6—F—¦Vâ×–ÆÂ#å6÷'Rr²†W†Òæ–æFW‚³’²rò33Â÷7ããÇ7â6Æ73Ò&6—F—¦Vâ×–ÆÂ#âr¶W66T‡FÖÂ‡VW7F–öäÆ&VÂ‡’’²sÂ÷7ããÂöF—cãÂöF—câr·&VæFW$–ÖvR‡’²sÇ6Æ73Ò&6—F—¦VâÖFR"ÆæsÒ&FR#âr¶W66T‡FÖÂ‡çVW7F–öâ’²sÂ÷âr²‚‚‡çG'ÇÇ·Ò’çVW7F–öâ“òsÇ6Æ73Ò&6—F—¦Vâ×G""ÆæsÒ'G"#âr¶W66T‡FÖÂ‡çG"çVW7F–öâ’²sÂ÷âs¢rr’²sÆF—b6Æ73Ò&6—F—¦VâÖç7vW'2#âr·æç7vW'2æÖ‚†Æ’“ÓâsÆ'WGFöâG—SÒ&'WGFöâ"6Æ73Ò&6—F—¦VâÖç7vW"r²†—6VÆV7FVCÓÓÖ“òv—2×6VÆV7FVBs¢rr’²r"FFÖW†ÒÖç7vW#Ò"r¶’²r#ãÇ7â6Æ73Ò&6—F—¦VâÖç7vW"ÖÆWGFW"#âr´ÄUEDU%5¶•ÒçFõWW$66R‚’²sÂ÷7ããÇ7ããÇ7â6Æ73Ò&6—F—¦VâÖç7vW"ÖFR#âr¶W66T‡FÖÂ†’²sÂ÷7ãâr²‚‚‚‡çG'ÇÇ·Ò’æç7vW'7ÇÅµÒ•¶•Ò“òsÇ7â6Æ73Ò&6—F—¦VâÖç7vW"×G"#âr¶W66T‡FÖÂ‡çG"æç7vW'5¶•Ò’²sÂ÷7ãâs¢rr’²sÂ÷7ããÂö'WGFöãâr’æ¦ö–â‚rr’²sÂöF—cãÆF—b6Æ73Ò&6—F—¦VâÖæb#ãÆF—b6Æ73Ò&6—F—¦VâÖæbÖw&÷W#ãÆ'WGFöâ6Æ73Ò&'Fâ'Fâ×6V6öæF'’"–CÒ&W†Õ&Wb"G—SÒ&'WGFöâ"r²†W†Òæ–æFWƒÓÓÓòvF—6&ÆVBs¢rr’²sî(i8ææ6V¶“Âö'WGFöãâr²†W†Òæ–æFWƒÓÓÓ3#òsÆ'WGFöâ6Æ73Ò&'Fâ'Fâ×&–Ö'’"–CÒ&W†Ôf–æ—6‚"G—SÒ&'WGFöâ#å<KælK&—F—#Âö'WGFöãâs¢sÆ'WGFöâ6Æ73Ò&'Fâ'Fâ×&–Ö'’"–CÒ&W†ÔæW‡B"G—SÒ&'WGFöâ#å6öç&¶’(i#Âö'WGFöãâr’²sÂöF—cãÇ7ãâr´ö&¦V7Bæ¶W—2†W†Òæç7vW'2’æÆVæwF‚²rò326WfÆæLKÂ÷7ããÂöF—cãÂ÷6V7F–öãâs°¢†÷7BçVW'•6VÆV7F÷$ÆÂ‚u¶FFÖW†ÒÖç7vW%Òr’æf÷$V6‚†#Óæ"æöæ6Æ–6³Ò‚“Óç¶W†Òæç7vW'5¶W†Òæ–æFW…ÓÔçVÖ&W"†"æFF6WBæW†Ôç7vW"“·&VæFW$W†Ò‚“·Ò“°¢–b†VÂ‚vW†Õ&Wbr’–VÂ‚vW†Õ&Wbr’æöæ6Æ–6³Ò‚“Óç¶W†Òæ–æFW‚ÒÓ·&VæFW$W†Ò‚“·Ó°¢–b†VÂ‚vW†ÔæW‡Br’–VÂ‚vW†ÔæW‡Br’æöæ6Æ–6³Ò‚“Óç¶W†Òæ–æFW‚²³·&VæFW$W†Ò‚“·Ó°¢–b†VÂ‚vW†Ôf–æ—6‚r’–VÂ‚vW†Ôf–æ—6‚r’æöæ6Æ–6³Öf–æ—6„W†Ó°¢Ğ¢gVæ7F–öâf–æ—6„W†Ò‚—¶–b‚W†×ÇÆW†Òæf–æ—6†VB—&WGW&ã¶W†Òæf–æ—6†VC×G'VS¶6ÆV$–çFW'fÂ‡F–ÖW$–B“¶ÆWB6÷'&V7CÓ¶W†ÒçVW7F–öç2æf÷$V6‚‚‡Æ’“Óç¶–b†W†Òæç7vW'5¶•ÓÓÓ×6öÇWF–öä–æFW‚‡’–6÷'&V7B²³·Ò“¶W†Òæ6÷'&V7CÖ6÷'&V7C¶W†Òç76VCÖ6÷'&V7CãÓs¶–b‡G—Vöbv–æF÷ræwFsÓÓÒvgVæ7F–öâr—v–æF÷ræwFr‚vWfVçBrÂv6—F—¦Vç6†—öW†Õöf–æ—6‚rÇ·7FFS§7FFT6öFR‚’Æ6÷'&V7BÇ76VC¦W†Òç76VGÒ“·&VæFW$W†Õ&W7VÇB‚“·Ğ¢gVæ7F–öâ&VæFW$W†Õ&W7VÇB‚—°¢6öç7BÖ—76VCÖW†ÒçVW7F–öç2æÖ‚‡Æ’“Óâ‡·Æ’Æö³¦W†Òæç7vW'5¶•ÓÓÓ×6öÇWF–öä–æFW‚‡—Ò’’æf–ÇFW"‡ƒÓâ‚æö²“°¢VÂ‚v6—F—¦VåVW7F–öä†÷7Br’æ–ææW$…DÔÃÒsÆF—b6Æ73Ò&6—F—¦Vâ×&W7VÇBr²†W†Òç76VCòw72s¢vf–Âr’²r#ãÆƒ#âr²†W†Òç76VCòtFVæVÖR<KælKìKv\:wF–æ—¢s¢t&—&¢F†:vÌKYöÖvW&V¶—–÷"r’²sÂöƒ#ãÇ7G&öæsâr¶W†Òæ6÷'&V7B²rò33Â÷7G&öæsãÇå&W6Ü:âV–æ,;Ç&vW'Væw7FW7Bœ:v–âv\:†ÖR\Yö±,HMÈñ'ÜHÙ]˜\1,\‹Ü]ÛˆÛ\ÜÏH˜ˆ‹\š[X\HˆYH™^[PYØZ[ˆˆ\OH˜]Ûˆ–Y[šH[™[YH˜qgÛ]Ø]Û]ÛˆÛ\ÜÏH˜ˆ‹\ÙXÛÛ™\HˆYH™^[T™]šY]Èˆ\OH˜]Ûˆ–X[›1,qgÛ\±,H0éØ[1,qgÏØ]ÛÙ]‰ÎÂˆ[
	Ù^[PYØZ[‰ÊK›Û˜ÛXÚÏ\İ\^[NÂˆ[
	Ù^[T™]šY]ÉÊK›Û˜ÛXÚÏJ
OOÛZ\ÜÙY™›Ü‘XXÚ
OœİÜ™T]Ú
ÏOÜË˜[œİÙ\œÏ\Ë˜[œİÙ\œßßNÜË˜[œİÙ\œÖÚÙ^JœJWO^ÜÙ[XİY™^[K˜[œİÙ\œÖŞšWOÏËLKÛÜœ™Xİ™˜[ÙK]‘]K››İÊ
_NßJJNÛ[ÙOIİÜ›Û™ÉÎÜÙ]Xİ]™UXŠ	İÜ›Û™ÉÊNØÚÛÜÙTÛÛ

NßNÂˆB‚ˆ[˜İ[Ûˆ™\Ù]›ÙÜ™\ÜÊ
^ÂˆÛÛœİÏ[ØYİÜ™J
NÂˆÛÛœİ[œİÙ\™YSØš™XİšÙ^\ÊË˜[œİÙ\œßßJK›[™İÂˆYŠX[œİÙ\™Y
^Ø[\
	Ò[°ïˆñ,Y±,\›[˜XØZÈš\ˆÙ]˜\ÙpéÛZqgÚH[ÚË‰ÊNÜ™]\›ßBˆYŠXÛÛ™š\›J	ĞÙ]˜\ÙpéÛZqgÚ[š^‹ñ'ÜKŞX[›1,qgÈØ^q,[\±,H™H8 'X[›1,qgÛ\±,[x 'H\İ\ÚHñ,Y±,\›[˜XØZËˆ˜]›Üš[\š[š^ˆ™H^X[]ÙpéÚ[Z[š^ˆÛÜ[˜XØZËˆ]˜[HY[Ú[ˆZOÉÊJ\™]\›ÂˆÛÛœİÙY\^ßNÂˆYŠËœİ]JZÙY\œİ]O\Ëœİ]NÂˆYŠË™˜]›Üš]\É‰“Øš™XİšÙ^\ÊË™˜]›Üš]\ÊK›[™İ
ZÙY\™˜]›Üš]\Ï\Ë™˜]›Üš]\ÎÂˆØ]™TİÜ™JÙY\
NÂˆÛX\’[\˜[
[Y\’Y
NÙ^[O[[Û[ÙOIÜİYIÎÚ[™^LÜÙ]Xİ]™UXŠ	ÜİYIÊNØÚÛÜÙTÛÛ

NÂˆYŠ\[ÙˆÚ[™İË™İYÏOOIÙ[˜İ[Û‰Ê]Ú[™İË™İYÊ	Ù]™[	Ë	ØÚ]^™[œÚ\Ü›ÙÜ™\Ü×Ü™\Ù]	ËÜİ]Nœİ]PÛÙJ
K[œİÙ\™YØ™Y›Ü™WÜ™\Ù]˜[œİÙ\™YJNÂˆ[\
	ğáØ[1,qgÛXH[\›[Y[š^ˆñ,Y±,\›[™1,Kˆ˜]›Üš[\š[š^ˆ™H^X[]ÙpéÚ[Z[š^ˆÛÜ[™K‰ÊNÂˆB‚ˆ[˜İ[ÛˆÙ]Xİ]™UXŠ˜[YJ^ÙØİ[Y[œ]Y\TÙ[XİÜ[
	Ë˜Ú]^™[‹]X‰ÊK™›Ü‘XXÚ
O˜‹˜Û\ÜÓ\İÙÙÛJ	Ú\ËXXİ]™IË‹™]\Ù]›[ÙOOO[˜[YJJNßBˆ[˜İ[Ûˆš[™

^Âˆ[
	ØÚ]^™[”İ]IÊK›Û˜Ú[™ÙOJ
OOÜİÜ™T]Ú
ÏOœËœİ]O\İ]PÛÙJ
JNÚ[™^LÚYŠ[ÙOOOIÙ^[IÊ^Ù^[O[[Û[ÙOIÜİYIÎÜÙ]Xİ]™UXŠ	ÜİYIÊNßXÚÛÜÙTÛÛ

NßNÂˆ[
	ØÚ]^™[‘š[\‰ÊK›Û˜Ú[™ÙOJ
OOÚ[™^LØÚÛÜÙTÛÛ

NßNÂˆ[
	ØÚ]^™[”ÙX\˜Ú	ÊK›Ûš[œ]J
OOÚ[™^LØÚÛÜÙTÛÛ

NßNÂˆØİ[Y[œ]Y\TÙ[XİÜ[
	Ë˜Ú]^™[‹]X‰ÊK™›Ü‘XXÚ
O˜‹›Û˜ÛXÚÏJ
OOØÛÛœİOX‹™]\Ù]›[ÙNÚYŠOOOIÙ^[IÊ^Üİ\^[J
NÜ™]\›ßXÛX\’[\˜[
[Y\’Y
NÙ^[O[[Û[ÙO[NÚ[™^LÜÙ]Xİ]™UXŠJNØÚÛÜÙTÛÛ

NßJNÂˆ[
	ØÚ]^™[”™\Ù]	ÊK›Û˜ÛXÚÏ\™\Ù]›ÙÜ™\ÜÎÂˆB‚ˆ\Ş[˜È[˜İ[Ûˆ[š]

^ÂˆÛÛœİÜİY[
	ØÚ]^™[”]Y\İ[Û’Üİ	ÊNÚYŠZÜİ
\™]\›ÂˆÛÛœİÏ[ØYİÜ™J
NÚYŠËœİ]I‰”ÕUTÖÜËœİ]WJY[
	ØÚ]^™[”İ]IÊK˜[YO\Ëœİ]NÂˆš[™

NÂˆ^Ù]OX]ØZ]™]Ú]J
NÜÜ]]J
NØÚÛÜÙTÛÛ

NÙ[
	ØÚ]^™[“ØY[™ÉÊKšY[]YNÙ[
	ØÚ]^™[\›ÙIÊKšY[Y˜[ÙNßXØ]Ú
\œŠ^Ù[
	ØÚ]^™[“ØY[™ÉÊKš[›™\’SIÏİ›Û™Ï”ÛÜH™\š[\šH1gİH[™HpïÛ[™[YYKÜİ›Û™Ï”Ø^Y˜^q,HY[š[^Z[ˆ™^XHH™YHšÎ‹ËÛÙ]˜˜[Y‹™KÛÜ™ËÛÙ]]ÙÜMLMŒNŒˆ\™Ù]H—Ø›[šÈˆ™[H››ÛÜ[™\ˆSQˆ™\ÛpëˆÛÜHØ][ñ'İ[Hpéñ,[ØO‹Ü‰ÎßBˆBˆYŠØİ[Y[œ™XYTİ]OOOIÛØY[™ÉÊYØİ[Y[˜Y]™[\İ[™\Š	ÑÓPÛÛ[ØYY	Ë[š]
NÙ[ÙH[š]

NÂŸJJ
N
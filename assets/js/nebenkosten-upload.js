(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const form=$('#nk-form'), card=$('.nk-card'); if(!form||!card)return;
const MAX_FILE_BYTES=15*1024*1024, MAX_PDF_PAGES=12, MAX_OCR_PAGES=6;
let extractedText='', extractionMethod='', currentFile=null;

function analytics(name,params){try{if(typeof window.gtag==='function')window.gtag('event',name,Object.assign({tool_name:'nebenkostencheck'},params||{}));}catch(e){}}
function escapeHtml(v){return String(v==null?'':v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function loadScript(src,test){return new Promise((resolve,reject)=>{if(test())return resolve();const s=document.createElement('script');s.src=src;s.async=true;s.crossOrigin='anonymous';s.onload=()=>test()?resolve():reject(new Error('Kütüphane yüklenemedi'));s.onerror=()=>reject(new Error('Kütüphane yüklenemedi'));document.head.appendChild(s);});}
function fileKind(file){if(file.type==='application/pdf'||/\.pdf$/i.test(file.name))return 'pdf';if(/^image\//.test(file.type)||/\.(png|jpe?g|webp)$/i.test(file.name))return 'image';return 'unsupported';}
function status(msg,kind){const el=$('#nk-upload-status');el.textContent=msg;el.className='nk-upload-status '+(kind||'');}
function progress(p,msg){const bar=$('#nk-upload-progress-bar');bar.style.width=Math.max(0,Math.min(100,p))+'%';bar.parentElement.setAttribute('aria-valuenow',String(Math.round(p)));if(msg)status(msg,'working');}

const upload=document.createElement('section');
upload.className='nk-upload';
upload.innerHTML=`
  <div class="nk-upload-head"><div><span class="nk-upload-badge">Yeni · Belgeden otomatik doldur</span><h2>PDF veya fotoğraf yükleyin</h2><p>Belgedeki tarihleri, ana tutarları ve uygun gider satırlarını cihazınızda okumaya çalışırız. Bulunan kritik değerler analizden önce mutlaka sizin onayınıza sunulur.</p></div><div class="nk-upload-icon" aria-hidden="true">↥</div></div>
  <div class="nk-upload-actions"><button id="nk-upload-file-btn" class="btn btn-primary" type="button">PDF / fotoğraf seç</button><button id="nk-upload-camera-btn" class="btn btn-secondary" type="button">Fotoğraf çek</button><span class="nk-upload-or">veya aşağıdaki formu elle doldurun</span></div>
  <input id="nk-upload-file" class="nk-visually-hidden" type="file" accept="application/pdf,image/jpeg,image/png,image/webp">
  <input id="nk-upload-camera" class="nk-visually-hidden" type="file" accept="image/*" capture="environment">
  <div class="nk-upload-note"><strong>Gizlilik:</strong> Belge sunucuya gönderilmez. PDF metin okuma ve OCR tarayıcınızda çalışır. Ham belge veya çıkarılan metin localStorage'a kaydedilmez.</div>
  <div id="nk-upload-status" class="nk-upload-status" role="status" aria-live="polite">PDF, JPG, PNG veya WEBP · en fazla 15 MB</div>
  <div class="nk-upload-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="nk-upload-progress-bar"></span></div>
  <div id="nk-upload-review" class="nk-upload-review nk-hidden"></div>`;
card.insertBefore(upload,$('.nk-progress'));

$('#nk-upload-file-btn').addEventListener('click',()=>$('#nk-upload-file').click());
$('#nk-upload-camera-btn').addEventListener('click',()=>$('#nk-upload-camera').click());
$('#nk-upload-file').addEventListener('change',e=>{if(e.target.files[0])handleFile(e.target.files[0]);});
$('#nk-upload-camera').addEventListener('change',e=>{if(e.target.files[0])handleFile(e.target.files[0]);});

async function handleFile(file){
 const kind=fileKind(file);$('#nk-upload-review').classList.add('nk-hidden');$('#nk-upload-review').innerHTML='';
 if(kind==='unsupported'){status('Bu dosya türü desteklenmiyor. PDF, JPG, PNG veya WEBP seçin.','error');return;}
 if(file.size>MAX_FILE_BYTES){status('Dosya 15 MB sınırını aşıyor. Daha küçük bir PDF veya fotoğraf kullanın.','error');return;}
 currentFile=file;extractedText='';extractionMethod='';progress(3,'Belge hazırlanıyor…');analytics('upload_started',{file_type:kind});
 try{
   let result;
   if(kind==='pdf')result=await extractPdf(file); else result=await extractImage(file);
   extractedText=result.text;extractionMethod=result.method;
   if(extractedText.replace(/\s/g,'').length<40)throw new Error('Belgeden yeterli okunabilir metin çıkarılamadı. Daha net bir fotoğraf deneyin veya formu elle doldurun.');
   progress(100,'Belge okundu. Bulduğumuz değerleri kontrol edin.');
   analytics('upload_extracted',{file_type:kind,method:extractionMethod,result:'success'});
   renderReview(parseDocument(extractedText),result);
 }catch(err){console.error('Nebenkosten upload extraction failed',err);progress(0);status(err&&err.message?err.message:'Belge okunamadı. Formu elle doldurabilirsiniz.','error');analytics('upload_extracted',{file_type:kind,result:'error'});}
}

async function extractPdf(file){
 await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',()=>!!window.pdfjsLib);
 window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
 const data=new Uint8Array(await file.arrayBuffer()), pdf=await window.pdfjsLib.getDocument({data}).promise;
 const pages=Math.min(pdf.numPages,MAX_PDF_PAGES);let text='', sparse=[];
 for(let i=1;i<=pages;i++){
   progress(5+(i/pages)*35,`PDF okunuyor: ${i}/${pages} sayfa…`);
   const page=await pdf.getPage(i), tc=await page.getTextContent(), pageText=tc.items.map(x=>x.str).join(' ');
   text+='\n'+pageText; if(pageText.replace(/\s/g,'').length<80)sparse.push(i);
 }
 if(text.replace(/\s/g,'').length>=350 && sparse.length<=Math.ceil(pages/2))return {text,method:'pdf_text',pages:pdf.numPages,ocrPages:0};
 const ocrTargets=(sparse.length?sparse:Array.from({length:pages},(_,i)=>i+1)).slice(0,MAX_OCR_PAGES);
 const worker=await createOcrWorker();let ocr='';
 try{
   for(let j=0;j<ocrTargets.length;j++){
     const n=ocrTargets[j],page=await pdf.getPage(n),viewport=page.getViewport({scale:1.7}),canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
     await page.render({canvasContext:canvas.getContext('2d',{alpha:false}),viewport}).promise;
     progress(45+(j/ocrTargets.length)*48,`Taranmış sayfa okunuyor: ${j+1}/${ocrTargets.length}…`);
     const r=await worker.recognize(canvas);ocr+='\n'+(r.data&&r.data.text?r.data.text:'');canvas.width=1;canvas.height=1;
   }
 }finally{await worker.terminate();}
 return {text:(text+'\n'+ocr).trim(),method:text.replace(/\s/g,'').length?'pdf_text+ocr':'pdf_ocr',pages:pdf.numPages,ocrPages:ocrTargets.length};
}

async function extractImage(file){
 const worker=await createOcrWorker();
 try{progress(18,'OCR hazırlanıyor…');const r=await worker.recognize(file);progress(92,'Fotoğraf metni ayrıştırılıyor…');return {text:(r.data&&r.data.text)||'',method:'image_ocr',pages:1,ocrPages:1,confidence:r.data&&Number.isFinite(r.data.confidence)?Math.round(r.data.confidence):null};}
 finally{await worker.terminate();}
}

async function createOcrWorker(){
 await loadScript('https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.1.1/tesseract.min.js',()=>!!window.Tesseract);
 return window.Tesseract.createWorker('deu+eng',1,{logger:m=>{if(m&&m.status==='recognizing text'&&Number.isFinite(m.progress))progress(48+m.progress*44,`Metin okunuyor… %${Math.round(m.progress*100)}`);}});
}

function parseDocument(text){
 const lines=text.split(/\r?\n/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
 const period=findPeriod(lines), total=findMoneyByContext(lines,[/ihr(?:e|en)?\s+(?:anteil|kosten)/i,/mieter(?:anteil|kosten)/i,/umlagef[aä]hige\s+kosten/i,/gesamtkosten/i],[/voraus|abschlag|nachzahlung|guthaben/i]);
 const advances=findMoneyByContext(lines,[/vorauszahlung/i,/geleistet.*voraus/i,/abschlags?zahlung/i,/vorauszahlungen\s+gesamt/i],[/monatlich/i]);
 const bal=findBalance(lines), costs=findCostLines(lines), heating=findPercentPair(lines,/heiz(?:ung|kosten)/i), water=findPercentPair(lines,/warmwasser|warmes wasser/i);
 return {periodStart:period.start,periodEnd:period.end,totalCost:total&&total.value||'',advances:advances&&advances.value||'',balance:bal&&bal.value||'',balanceCredit:bal&&bal.credit||false,costs,heating,warmWater:water};
}
function findPeriod(lines){
 const dateRx=/(\d{1,2}[.\-/]\d{1,2}[.\-/](?:\d{2}|\d{4}))/g;
 for(let i=0;i<lines.length;i++)if(/abrechnungszeitraum|abrechnungsperiode|abrechnungszeit|nutzungszeitraum|zeitraum/i.test(lines[i])){
   const ctx=[lines[i],lines[i+1]||'',lines[i+2]||''].join(' '),ds=ctx.match(dateRx)||[];if(ds.length>=2)return {start:toIso(ds[0]),end:toIso(ds[1])};
 }
 for(let i=0;i<Math.min(lines.length,25);i++){const ds=lines[i].match(dateRx)||[];if(ds.length>=2)return {start:toIso(ds[0]),end:toIso(ds[1])};}
 return {start:'',end:''};
}
function toIso(s){const m=String(s).match(/(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2}|\d{4})/);if(!m)return '';let y=m[3];if(y.length===2)y='20'+y;const mm=String(m[2]).padStart(2,'0'),dd=String(m[1]).padStart(2,'0');return `${y}-${mm}-${dd}`;}
function moneyMatches(line){const rx=/-?\d{1,3}(?:[.\s]\d{3})*(?:,\d{2})|-?\d+(?:[.,]\d{2})/g;return line.match(rx)||[];}
function cleanMoney(v){return String(v||'').replace(/\s/g,'');}
function findMoneyByContext(lines,patterns,exclude){for(const p of patterns){for(let i=0;i<lines.length;i++){const l=lines[i];if(!p.test(l)||(exclude||[]).some(x=>x.test(l)))continue;const ctx=[l,lines[i+1]||''].join(' '),ms=moneyMatches(ctx);if(ms.length)return {value:cleanMoney(ms[ms.length-1]),line:l};}}return null;}
function findBalance(lines){for(let i=0;i<lines.length;i++){const l=lines[i];if(!/nachzahlung|guthaben|erstattung|saldo|zahlbetrag/i.test(l))continue;const ms=moneyMatches([l,lines[i+1]||''].join(' '));if(ms.length)return {value:cleanMoney(ms[ms.length-1]).replace(/^-/,''),credit:/guthaben|erstattung/i.test(l)};}return null;}
function findPercentPair(lines,ctxRx){for(let i=0;i<lines.length;i++){if(!ctxRx.test(lines[i]))continue;const ctx=[lines[i],lines[i+1]||'',lines[i+2]||''].join(' '),ps=Array.from(ctx.matchAll(/(\d{1,3}(?:[.,]\d+)?)\s*%/g)).map(m=>Number(m[1].replace(',','.'))).filter(Number.isFinite);if(ps.length>=2)return {enabled:true,consumption:String(ps[0]),area:String(ps[1])};}return {enabled:false,consumption:'',area:''};}
function findCostLines(lines){
 const known=/grundsteuer|wasser|abwasser|entw[aä]sser|heizung|warmwasser|haus(?:meister|wart)|m[uü]ll|abfall|straßenreinigung|strassenreinigung|geb[aä]udereinigung|gartenpflege|beleuchtung|schornstein|versicherung|aufzug|antenne|kabel|wasch|winterdienst|sonstige betriebskosten/i;
 const skip=/gesamtkosten|vorauszahlung|nachzahlung|guthaben|abrechnungsergebnis|saldo/i, out=[],seen=new Set();
 for(const l of lines){if(!known.test(l)||skip.test(l))continue;const ms=moneyMatches(l);if(!ms.length)continue;const amount=cleanMoney(ms[ms.length-1]);let label=l.replace(ms[ms.length-1],'').replace(/[|:;]+/g,' ').replace(/\s{2,}/g,' ').trim();label=label.slice(0,80);const key=label.toLowerCase()+'|'+amount;if(!label||seen.has(key))continue;seen.add(key);out.push({label,tenantShare:amount});if(out.length>=18)break;}
 return out;
}

function renderReview(data,meta){
 const host=$('#nk-upload-review'), method=meta.method==='pdf_text'?'PDF metin katmanı':meta.method==='image_ocr'?'Fotoğraf OCR':meta.method==='pdf_ocr'?'PDF OCR':'PDF metin + OCR';
 const found=[data.periodStart,data.periodEnd,data.totalCost,data.advances,data.balance].filter(Boolean).length;
 host.innerHTML=`<div class="nk-review-head"><div><h3>Bulunan değerleri doğrulayın</h3><p><strong>${escapeHtml(method)}</strong> ile ${found} ana alan ve ${data.costs.length} olası gider satırı bulundu.${meta.confidence!=null?' OCR güveni yaklaşık %'+meta.confidence+'.':''}</p></div><span class="nk-review-pill">Kullanıcı onayı gerekli</span></div>
 <div class="nk-review-grid">
  <div class="nk-field"><label>Hesap dönemi başlangıcı</label><input id="nk-r-period-start" type="date" value="${escapeHtml(data.periodStart)}"></div>
  <div class="nk-field"><label>Hesap dönemi bitişi</label><input id="nk-r-period-end" type="date" value="${escapeHtml(data.periodEnd)}"></div>
  <div class="nk-field"><label>Size düşen toplam gider (€)</label><input id="nk-r-total" inputmode="decimal" value="${escapeHtml(data.totalCost)}"></div>
  <div class="nk-field"><label>Toplam avans (€)</label><input id="nk-r-advances" inputmode="decimal" value="${escapeHtml(data.advances)}"></div>
  <div class="nk-field"><label>Belgedeki sonuç (€)</label><input id="nk-r-balance" inputmode="decimal" value="${escapeHtml(data.balance)}"></div>
  <div class="nk-field"><label>Sonuç türü</label><select id="nk-r-balance-type"><option value="nachzahlung" ${data.balanceCredit?'':'selected'}>Nachzahlung / ek ödeme</option><option value="guthaben" ${data.balanceCredit?'selected':''}>Guthaben / alacak</option></select></div>
 </div>
 ${data.costs.length?`<h4>Olası gider satırları</h4><div id="nk-review-costs" class="nk-review-costs">${data.costs.map((c,i)=>`<label class="nk-review-cost"><input type="checkbox" checked data-cost-check="${i}"><input data-cost-label="${i}" value="${escapeHtml(c.label)}" aria-label="Gider kalemi"><input data-cost-value="${i}" value="${escapeHtml(c.tenantShare)}" inputmode="decimal" aria-label="Tutar"></label>`).join('')}</div>`:'<p class="nk-review-empty">Gider satırlarını güvenilir biçimde ayıramadık. Ana tutarları aktarabilir, gider kalemlerini formda elle ekleyebilirsiniz.</p>'}
 <div class="nk-review-optional"><label class="nk-check"><input id="nk-r-heating-enabled" type="checkbox" ${data.heating.enabled?'checked':''}> Isıtma yüzdelerini aktar <span>${escapeHtml(data.heating.consumption)} / ${escapeHtml(data.heating.area)}</span></label><label class="nk-check"><input id="nk-r-water-enabled" type="checkbox" ${data.warmWater.enabled?'checked':''}> Sıcak su yüzdelerini aktar <span>${escapeHtml(data.warmWater.consumption)} / ${escapeHtml(data.warmWater.area)}</span></label></div>
 <label class="nk-confirm"><input id="nk-r-confirm" type="checkbox"> Belgedeki değerlerle karşılaştırdım; yukarıdaki kritik alanları onaylıyorum.</label>
 <div class="nk-actions"><button id="nk-review-discard" class="btn nk-btn-ghost" type="button">Belgeyi bırak</button><button id="nk-review-apply" class="btn btn-primary" type="button" disabled>Onayla ve forma aktar</button></div>`;
 host.classList.remove('nk-hidden');
 $('#nk-r-confirm').addEventListener('change',e=>$('#nk-review-apply').disabled=!e.target.checked);
 $('#nk-review-discard').addEventListener('click',discardUpload);
 $('#nk-review-apply').addEventListener('click',()=>applyReview(data));
 host.scrollIntoView({behavior:'smooth',block:'start'});
}

function applyReview(data){
 const put=(id,v)=>{const e=$(id);if(e&&v){e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));}};
 put('#nk-period-start',$('#nk-r-period-start').value);put('#nk-period-end',$('#nk-r-period-end').value);put('#nk-total-cost',$('#nk-r-total').value);put('#nk-advances',$('#nk-r-advances').value);put('#nk-stated-balance',$('#nk-r-balance').value);
 $('#nk-balance-credit').checked=$('#nk-r-balance-type').value==='guthaben';
 const selected=$$('#nk-review-costs [data-cost-check]:checked').map(ch=>{const i=ch.dataset.costCheck;return {label:$(`[data-cost-label="${i}"]`).value.trim(),value:$(`[data-cost-value="${i}"]`).value.trim()};}).filter(x=>x.label||x.value);
 if(selected.length){
   const rows=$$('.nk-cost-item');while(rows.length<selected.length){$('#nk-add-cost').click();rows.push(...$$('.nk-cost-item').slice(rows.length));}
   $$('.nk-cost-item').forEach((row,i)=>{const item=selected[i];if(!item)return;const l=$('.nk-cost-label',row),v=$('.nk-cost-share',row);l.value=item.label;v.value=item.value;l.dispatchEvent(new Event('input',{bubbles:true}));v.dispatchEvent(new Event('input',{bubbles:true}));});
 }
 if($('#nk-r-heating-enabled').checked&&data.heating.enabled){$('#nk-heating-enabled').checked=true;$('#nk-heating-enabled').dispatchEvent(new Event('change',{bubbles:true}));put('#nk-heating-consumption',data.heating.consumption);put('#nk-heating-area',data.heating.area);}
 if($('#nk-r-water-enabled').checked&&data.warmWater.enabled){$('#nk-water-enabled').checked=true;$('#nk-water-enabled').dispatchEvent(new Event('change',{bubbles:true}));put('#nk-water-consumption',data.warmWater.consumption);put('#nk-water-area',data.warmWater.area);}
 form.dataset.documentConfirmed='true';analytics('upload_confirmed',{method:extractionMethod,fields_confirmed:'yes'});status('Onaylanan değerler forma aktarıldı. Şimdi adımları gözden geçirip analizi çalıştırabilirsiniz.','success');
 extractedText='';currentFile=null;$('#nk-upload-file').value='';$('#nk-upload-camera').value='';$('#nk-upload-review').classList.add('nk-hidden');$('.nk-progress').scrollIntoView({behavior:'smooth',block:'start'});
}
function discardUpload(){extractedText='';currentFile=null;extractionMethod='';$('#nk-upload-file').value='';$('#nk-upload-camera').value='';$('#nk-upload-review').innerHTML='';$('#nk-upload-review').classList.add('nk-hidden');progress(0);status('Belge bırakıldı. Yeni belge seçebilir veya formu elle doldurabilirsiniz.','');analytics('upload_discarded');}
})();

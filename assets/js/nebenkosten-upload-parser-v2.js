(function(){
'use strict';

function moneyMatches(line){
  const rx=/-?\d{1,3}(?:[.\s]\d{3})*(?:,\d{2})|-?\d+(?:[.,]\d{2})/g;
  return String(line||'').match(rx)||[];
}
function cleanMoney(v){return String(v||'').replace(/\s/g,'').replace(/^-/, '').replace(/-$/, '');}
function toIso(s){
  const m=String(s||'').match(/(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2}|\d{4})/);
  if(!m)return '';
  let y=m[3];if(y.length===2)y='20'+y;
  return `${y}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;
}
function monthRangeToIso(s){
  const m=String(s||'').match(/(\d{1,2})[.\-/](\d{4})\s*(?:bis|[-–—])\s*(\d{1,2})[.\-/](\d{4})/i);
  if(!m)return null;
  const sm=Number(m[1]),sy=Number(m[2]),em=Number(m[3]),ey=Number(m[4]);
  if(sm<1||sm>12||em<1||em>12)return null;
  const lastDay=new Date(Date.UTC(ey,em,0)).getUTCDate();
  return {start:`${sy}-${String(sm).padStart(2,'0')}-01`,end:`${ey}-${String(em).padStart(2,'0')}-${String(lastDay).padStart(2,'0')}`};
}
function scorePeriodLine(line){
  if(/ihr\s+zeitraum/i.test(line))return 100;
  if(/abrechnungszeitraum|abrechnungsperiode/i.test(line))return 90;
  if(/nutzungszeitraum|abrechnungszeit/i.test(line))return 80;
  if(/nebenkostenabrechnung.*(?:monate|monat)/i.test(line))return 70;
  if(/zeitraum/i.test(line))return 60;
  return 0;
}
function findPeriod(lines){
  const dateRx=/(\d{1,2}[.\-/]\d{1,2}[.\-/](?:\d{2}|\d{4}))/g;
  const candidates=[];
  for(let i=0;i<lines.length;i++){
    const score=scorePeriodLine(lines[i]);
    if(!score)continue;
    const ctx=[lines[i-1]||'',lines[i],lines[i+1]||''].join(' ');
    const full=ctx.match(dateRx)||[];
    if(full.length>=2)candidates.push({score,start:toIso(full[0]),end:toIso(full[1])});
    const mr=monthRangeToIso(ctx);if(mr)candidates.push({score:score-5,start:mr.start,end:mr.end});
  }
  if(candidates.length){candidates.sort((a,b)=>b.score-a.score);return candidates[0];}
  return {start:'',end:''};
}
function findSameLineMoney(lines,patterns){
  for(const p of patterns){
    for(const l of lines){
      if(!p.test(l))continue;
      const ms=moneyMatches(l);if(ms.length)return cleanMoney(ms[ms.length-1]);
    }
  }
  return '';
}
function findBalance(lines){
  for(const l of lines){
    if(!/nachzahlung|guthaben|erstattung|saldo|zahlbetrag/i.test(l))continue;
    const ms=moneyMatches(l);if(ms.length)return {value:cleanMoney(ms[ms.length-1]),credit:/guthaben|erstattung/i.test(l)};
  }
  return {value:'',credit:false};
}
function findPercentPair(lines,ctxRx){
  for(let i=0;i<lines.length;i++){
    if(!ctxRx.test(lines[i]))continue;
    const ctx=[lines[i],lines[i+1]||'',lines[i+2]||''].join(' ');
    const ps=Array.from(ctx.matchAll(/(\d{1,3}(?:[.,]\d+)?)\s*%/g)).map(m=>Number(m[1].replace(',','.'))).filter(Number.isFinite);
    if(ps.length>=2)return {enabled:true,consumption:String(ps[0]),area:String(ps[1])};
  }
  return {enabled:false,consumption:'',area:''};
}
function findCostLines(lines,allText){
  const known=/grundsteuer|wasser|abwasser|entw[aä]sser|heizung|warmwasser|haus(?:meister|wart|reinigung)|m[uü]ll|abfall|straßenreinigung|strassenreinigung|geb[aä]udereinigung|allg(?:em(?:ein)?)?\.?\s*strom|au[sß]enanlagen|gartenpflege|beleuchtung|schornstein|versicherung|aufzug|antenne|kabel|wasch|winterdienst|sonstige betriebskosten/i;
  const skip=/gesamtkosten|vorauszahlung|einzahlungen|nachzahlung|guthaben|abrechnungsergebnis|saldo|summe|anteil netto|anteil brutto|mehrwertsteuer/i;
  const hasVatColumn=/vor\s*st\.?\s*(?:eur)?|vorsteuer/i.test(allText);
  const out=[],seen=new Set();
  for(const l of lines){
    if(!known.test(l)||skip.test(l))continue;
    const ms=moneyMatches(l);if(!ms.length)continue;
    let amountIndex=ms.length-1;
    if(hasVatColumn&&ms.length>=2)amountIndex=ms.length-2;
    const amount=cleanMoney(ms[amountIndex]);
    const firstPos=l.indexOf(ms[0]);
    let label=(firstPos>0?l.slice(0,firstPos):l).replace(/[|:;]+/g,' ').replace(/\s+/g,' ').trim();
    label=label.replace(/[-–—]+$/,'').trim().slice(0,60);
    const key=label.toLowerCase()+'|'+amount;
    if(!label||!amount||seen.has(key))continue;
    seen.add(key);out.push({label,tenantShare:amount});
    if(out.length>=18)break;
  }
  return out;
}
function parseMoneyNumber(v){
  let s=String(v||'').trim().replace(/\s/g,'');
  if(!s)return null;
  if(s.includes(',')&&s.includes('.'))s=s.replace(/\./g,'').replace(',','.');
  else if(s.includes(','))s=s.replace(',','.');
  const n=Number(s);return Number.isFinite(n)?n:null;
}
function formatMoneyNumber(n){return Number(n).toFixed(2).replace('.',',');}
function parse(text){
  const lines=String(text||'').split(/\r?\n/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
  const period=findPeriod(lines);
  let total=findSameLineMoney(lines,[/ihr\s+anteil\s+brutto/i,/mieter(?:anteil|kosten).*brutto/i,/ihr\s+anteil\s+netto/i,/mieter(?:anteil|kosten)/i]);
  const advances=findSameLineMoney(lines,[/abzgl\.?\s*(?:ihre\s+)?einzahlungen/i,/(?:ihre\s+)?einzahlungen/i,/vorauszahlungen?\s+gesamt/i,/geleistet.*voraus/i,/abschlags?zahlung/i]);
  const bal=findBalance(lines);
  if(!total&&advances&&bal.value){const a=parseMoneyNumber(advances),b=parseMoneyNumber(bal.value);if(a!=null&&b!=null)total=formatMoneyNumber(bal.credit?a-b:a+b);}
  return {
    periodStart:period.start,periodEnd:period.end,totalCost:total,advances,
    balance:bal.value,balanceCredit:bal.credit,
    costs:findCostLines(lines,text),
    heating:findPercentPair(lines,/heiz(?:ung|kosten)/i),
    warmWater:findPercentPair(lines,/warmwasser|warmes wasser/i)
  };
}

window.NebenkostenUploadParserV2={parse,moneyMatches,findPeriod,findCostLines};
})();

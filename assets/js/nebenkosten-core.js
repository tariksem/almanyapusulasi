/* Almanya Pusulası — NebenkostenCheck deterministic browser core
 * General information/calculation support, not legal advice.
 * Money calculations use integer cents; date helpers use UTC calendar dates.
 */
(function (root) {
  'use strict';

  const VERSION = '2026.09.08-web.1';
  const SOURCES = Object.freeze({
    BGB_556_3: { label: 'BGB § 556 Abs. 3', url: 'https://www.gesetze-im-internet.de/bgb/__556.html' },
    BGB_556_4: { label: 'BGB § 556 Abs. 4', url: 'https://www.gesetze-im-internet.de/bgb/__556.html' },
    BETRKV_2: { label: 'BetrKV § 2', url: 'https://www.gesetze-im-internet.de/betrkv/__2.html' },
    BETRKV_2_14: { label: 'BetrKV § 2 Nr. 14', url: 'https://www.gesetze-im-internet.de/betrkv/__2.html' },
    HEIZKV_7: { label: 'HeizkostenV § 7', url: 'https://www.gesetze-im-internet.de/heizkostenv/__7.html' },
    HEIZKV_8: { label: 'HeizkostenV § 8', url: 'https://www.gesetze-im-internet.de/heizkostenv/__8.html' }
  });

  function parseMoneyToCents(value) {
    if (value === null || value === undefined || value === '') return null;
    if (Number.isInteger(value)) return value * 100;
    let s = String(value).trim().replace(/\s|€|EUR/gi, '');
    if (!s) return null;
    const comma = s.lastIndexOf(',');
    const dot = s.lastIndexOf('.');
    if (comma >= 0 && dot >= 0) {
      if (comma > dot) s = s.replace(/\./g, '').replace(',', '.');
      else s = s.replace(/,/g, '');
    } else if (comma >= 0) {
      const parts = s.split(',');
      s = parts.length === 2 && parts[1].length <= 2 ? parts[0].replace(/\./g, '') + '.' + parts[1] : s.replace(/,/g, '');
    } else if (dot >= 0) {
      const parts = s.split('.');
      if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) s = s.replace(/\./g, '');
    }
    if (!/^-?\d+(\.\d{1,2})?$/.test(s)) return null;
    const n = Number(s);
    return Number.isFinite(n) ? Math.round(n * 100) : null;
  }

  function centsToNumber(cents) { return cents === null || cents === undefined ? null : cents / 100; }

  function parseNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    let s = String(value).trim().replace(/\s/g, '');
    if (!s) return null;
    const comma = s.lastIndexOf(','), dot = s.lastIndexOf('.');
    if (comma >= 0 && dot >= 0) s = comma > dot ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
    else if (comma >= 0) s = s.replace(',', '.');
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  function parseDate(value) {
    if (!value) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
    if (!m) return null;
    const y = +m[1], mo = +m[2], d = +m[3];
    const dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
    return dt;
  }

  function isoDate(dt) { return dt ? dt.toISOString().slice(0, 10) : null; }
  function endOfMonthUTC(y, monthIndex) { return new Date(Date.UTC(y, monthIndex + 1, 0)); }

  function addMonthsEndOfMonth(date, months) {
    const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
    return endOfMonthUTC(target.getUTCFullYear(), target.getUTCMonth());
  }

  function inclusiveMonthsExceeds12(start, end) {
    if (end < start) return true;
    const anniversary = new Date(Date.UTC(start.getUTCFullYear() + 1, start.getUTCMonth(), start.getUTCDate()));
    // A period 01.01–31.12 is valid; 01.01–01.01 next year exceeds 12 calendar months.
    return end >= anniversary;
  }

  function daysBetween(a, b) { return Math.floor((b.getTime() - a.getTime()) / 86400000); }

  function result(ruleId, status, severity, title, explanation, opts) {
    opts = opts || {};
    return {
      resultId: ruleId + ':' + (opts.key || 'main'),
      ruleId, status, severity, title, explanation,
      evidence: opts.evidence || [],
      calculation: opts.calculation || null,
      sourceIds: opts.sourceIds || []
    };
  }

  function R001(s) {
    const start = parseDate(s.billingPeriodStart), end = parseDate(s.billingPeriodEnd);
    if (!start || !end) return result('R001','missing_data','info','Fatura dönemi tamamlanmalı','Başlangıç ve bitiş tarihini girerseniz hesap döneminin uzunluğunu kontrol edebiliriz.',{sourceIds:['BGB_556_3']});
    if (end < start) return result('R001','review','high','Fatura dönemi tarihlerini kontrol edin','Bitiş tarihi başlangıç tarihinden önce görünüyor.',{sourceIds:['BGB_556_3'],evidence:[isoDate(start),isoDate(end)]});
    if (inclusiveMonthsExceeds12(start,end)) return result('R001','review','high','Fatura dönemi 12 aydan uzun görünüyor','Girilen dönem 12 takvim ayını aşıyor. Belgedeki dönem tarihlerini yeniden kontrol edin.',{sourceIds:['BGB_556_3'],evidence:[isoDate(start),isoDate(end)]});
    return result('R001','pass','info','Fatura dönemi uzunluğu tutarlı görünüyor','Girilen hesap dönemi 12 ayı aşmıyor.',{sourceIds:['BGB_556_3']});
  }

  function R002(s) {
    const end = parseDate(s.billingPeriodEnd), received = parseDate(s.receivedOn);
    if (!end || !received) return result('R002','missing_data','info','Teslim tarihi kontrolü için veri eksik','Hesap döneminin bitişi ve belgenin size ulaştığı tarihi girin.',{sourceIds:['BGB_556_3']});
    const deadline = addMonthsEndOfMonth(end,12);
    if (received > deadline) return result('R002','review','high','Belgenin gönderim zamanını kontrol edin','Belgenin size ulaştığı tarih, hesap döneminin bitiminden sonraki 12. ayın sonundan daha geç görünüyor. İstisnalar olabileceği için kesin hukuki sonuç çıkarılmaz.',{sourceIds:['BGB_556_3'],calculation:{deadline:isoDate(deadline),receivedOn:isoDate(received)}});
    return result('R002','pass','info','Belge teslim zamanı temel süre içinde görünüyor','Girilen tarihlere göre belge, hesap döneminin bitiminden sonraki 12. ayın sonundan önce ulaşmış görünüyor.',{sourceIds:['BGB_556_3'],calculation:{deadline:isoDate(deadline)}});
  }

  function R003(s, todayValue) {
    const received = parseDate(s.receivedOn);
    if (!received) return result('R003','missing_data','info','Kendi kontrol süreniz için teslim tarihi gerekli','Belgenin size ulaştığı tarihi girerseniz 12 aylık kontrol/itiraz penceresi için hatırlatma gösterebiliriz.',{sourceIds:['BGB_556_3']});
    const deadline = addMonthsEndOfMonth(received,12);
    const today = parseDate(todayValue) || new Date();
    const remaining = daysBetween(new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate())),deadline);
    if (remaining < 0) return result('R003','review','high','12 aylık inceleme penceresi geçmiş görünüyor','Girilen teslim tarihine göre genel 12 aylık bildirim/itiraz penceresi geçmiş olabilir. Somut durum ve istisnalar ayrıca değerlendirilmelidir.',{sourceIds:['BGB_556_3'],calculation:{deadline:isoDate(deadline),daysRemaining:remaining}});
    if (remaining <= 30) return result('R003','review','high','Kontrol süresi yaklaşıyor','Genel 12 aylık inceleme penceresinin sonuna 30 gün veya daha az kalmış görünüyor. Belge ve dayanakları gecikmeden incelemek faydalı olabilir.',{sourceIds:['BGB_556_3'],calculation:{deadline:isoDate(deadline),daysRemaining:remaining}});
    return result('R003','pass','info','Kontrol için zaman var görünüyor','Girilen teslim tarihine göre genel 12 aylık pencerenin bitmesine 30 günden fazla var.',{sourceIds:['BGB_556_3'],calculation:{deadline:isoDate(deadline),daysRemaining:remaining}});
  }

  function confirmedLines(s) { return Array.isArray(s.costLines) ? s.costLines.filter(x => x && x.confirmed !== false && parseMoneyToCents(x.tenantShare) !== null) : []; }

  function R004(s) {
    const stated = parseMoneyToCents(s.statedTenantCost), lines = confirmedLines(s);
    if (stated === null || !lines.length) return result('R004','missing_data','info','Gider kalemi toplamı için veri eksik','Belgedeki size düşen toplam gideri ve en az bir doğrulanmış gider kalemini girin.',{sourceIds:[]});
    const sum = lines.reduce((a,x)=>a+parseMoneyToCents(x.tenantShare),0), diff = sum-stated;
    if (Math.abs(diff)>1) return result('R004','review','high','Gider kalemleri toplamı uyuşmuyor','Girdiğiniz kalemlerin toplamı ile belgedeki kiracı toplamı arasında fark var. Eksik/çift girilmiş kalem veya belgedeki toplama satırını kontrol edin.',{calculation:{lineSumCents:sum,statedCents:stated,differenceCents:diff}});
    return result('R004','pass','info','Gider kalemlerinin toplamı uyuşuyor','Girdiğiniz doğrulanmış gider kalemleri belgedeki toplamla eşleşiyor.',{calculation:{lineSumCents:sum,statedCents:stated}});
  }

  function R005(s) {
    const total=parseMoneyToCents(s.statedTenantCost), advance=parseMoneyToCents(s.statedAdvancePayments), balance=parseMoneyToCents(s.statedBalance);
    if (total===null || advance===null) return result('R005','missing_data','info','Nachzahlung/Guthaben hesabı için veri eksik','Toplam gider ve yıl içinde ödediğiniz toplam avans tutarını girin.',{});
    const expected=total-advance;
    if (balance===null) return result('R005','missing_data','info','Belgedeki sonuç tutarını da girin','Bizim hesapladığımız sonucu belgedeki Nachzahlung/Guthaben ile karşılaştırmak için belge sonucunu girin.',{calculation:{expectedBalanceCents:expected}});
    const diff=expected-balance;
    if(Math.abs(diff)>1) return result('R005','review','high','Nachzahlung/Guthaben hesabı uyuşmuyor','Toplam gider eksi avans ödemeleri ile belgedeki sonuç arasında fark var. Ödeme/toplam satırlarını kontrol edin.',{calculation:{expectedBalanceCents:expected,statedBalanceCents:balance,differenceCents:diff}});
    return result('R005','pass','info','Nachzahlung/Guthaben hesabı uyuşuyor','Toplam gider eksi avans ödemeleri, girdiğiniz belge sonucuyla eşleşiyor.',{calculation:{expectedBalanceCents:expected,statedBalanceCents:balance}});
  }

  function R006(s) {
    const out=[];
    (s.costLines||[]).forEach((x,i)=>{
      if (!x || !x.allocationEnabled) return;
      const building=parseMoneyToCents(x.buildingTotal), tenantUnits=parseNumber(x.tenantUnits), totalUnits=parseNumber(x.totalUnits), tenantShare=parseMoneyToCents(x.tenantShare);
      const key=String(i+1);
      if(building===null||tenantUnits===null||totalUnits===null||tenantShare===null||totalUnits===0){out.push(result('R006','missing_data','info','Dağıtım hesabı için veri eksik','“'+(x.label||'Gider kalemi')+'” için bina toplamı, sizin biriminiz, toplam birim ve size düşen tutar gerekli.',{key,sourceIds:[]}));return;}
      const expected=Math.round(building*tenantUnits/totalUnits), diff=tenantShare-expected, tolerance=Math.max(1,Math.round(Math.abs(expected)*0.001));
      if(Math.abs(diff)>tolerance) out.push(result('R006','review','medium','Dağıtım hesabını kontrol edin','“'+(x.label||'Gider kalemi')+'” için girdiğiniz dağıtım değerleriyle hesaplanan pay, belgedeki paydan farklı görünüyor. Bu kontrol dağıtım anahtarının hukuken doğru olup olmadığını değerlendirmez.',{key,calculation:{expectedCents:expected,statedCents:tenantShare,differenceCents:diff,toleranceCents:tolerance}}));
      else out.push(result('R006','pass','info','Dağıtım matematiği tutarlı görünüyor','“'+(x.label||'Gider kalemi')+'” için matematiksel dağıtım hesabı girilen değerlerle uyuşuyor.',{key,calculation:{expectedCents:expected,statedCents:tenantShare}}));
    });
    return out.length?out:[result('R006','not_applicable','info','Dağıtım hesabı seçilmedi','İsterseniz gider kalemlerinde “dağıtımı kontrol et” seçeneğini açabilirsiniz.',{})];
  }

  function percentageRule(id, heating, sourceId, label) {
    if(!heating || !heating.enabled) return result(id,'not_applicable','info',label+' dağılımı girilmedi','Bu kontrolü kullanmak için ilgili yüzde dağılımını ekleyin.',{sourceIds:[sourceId]});
    const c=parseNumber(heating.consumptionBasedPercent), a=parseNumber(heating.areaBasedPercent);
    if(c===null||a===null) return result(id,'missing_data','info',label+' yüzdeleri eksik','Tüketime göre ve alan/sabit kısma göre dağıtım yüzdelerini girin.',{sourceIds:[sourceId]});
    const sum=c+a;
    if(Math.abs(sum-100)>0.1 || c<50 || c>70) return result(id,'review','high',label+' dağılımını kontrol edin','Girdiğiniz dağılım genel 50–70% tüketim aralığının dışında veya yüzdeler toplamı %100 değil. Mevzuatta istisnalar bulunduğundan bu sonuç kesin bir hukuka uygunluk değerlendirmesi değildir.',{sourceIds:[sourceId],calculation:{consumptionPercent:c,otherPercent:a,totalPercent:sum}});
    return result(id,'pass','info',label+' dağılımı temel aralıkta görünüyor','Tüketime dayalı pay %50–70 aralığında ve yüzdeler toplamı %100.',{sourceIds:[sourceId],calculation:{consumptionPercent:c,otherPercent:a,totalPercent:sum}});
  }

  const R007=s=>percentageRule('R007',s.heating,'HEIZKV_7','Isıtma gideri');
  const R008=s=>percentageRule('R008',s.warmWater,'HEIZKV_8','Sıcak su gideri');

  const NON_OPERATING_PATTERNS=[/\bverwaltung(?:skosten)?\b/i,/\binstandhalt(?:ung|ungs\w*)\b/i,/\binstandsetz(?:ung|ungs\w*)\b/i,/\breparatur(?:en|kosten)?\b/i,/\bbankgeb(?:ühr|uehr)(?:en)?\b/i,/\bporto\b/i];
  function R009(s){
    const matches=[];
    (s.costLines||[]).forEach((x,i)=>{const label=String(x&&x.label||'').trim();if(label&&NON_OPERATING_PATTERNS.some(p=>p.test(label)))matches.push({i,label});});
    if(!matches.length)return result('R009','pass','info','Belirgin bir inceleme etiketi bulunmadı','Girdiğiniz kalem adlarında yönetim, bakım/onarım gibi tipik inceleme terimlerinden biri otomatik olarak bulunmadı. Bu, tüm kalemlerin hukuken doğru olduğu anlamına gelmez.',{sourceIds:['BETRKV_2']});
    return result('R009','review','medium','Bazı gider adlarını açıklatmak faydalı olabilir','Şu kalem adları ek kontrol gerektiren terimler içeriyor: '+matches.map(x=>'“'+x.label+'”').join(', ')+'. Belge açıklamasını ve dayanaklarını inceleyin.',{sourceIds:['BETRKV_2'],evidence:matches.map(x=>x.label)});
  }

  function R010(s){
    const caretakers=(s.costLines||[]).filter(x=>/\b(hauswart|hausmeister)\b/i.test(String(x&&x.label||'')));
    if(!caretakers.length)return result('R010','not_applicable','info','Hauswart/Hausmeister kalemi girilmedi','Bu kontrol yalnız Hauswart/Hausmeister gideri varsa uygulanır.',{sourceIds:['BETRKV_2_14']});
    const concerning=caretakers.filter(x=>/reparatur|instandhalt|instandsetz|erneuer|schönheits|schoenheits|verwaltung/i.test(String(x.label||'')+' '+String(x.note||''))||x.breakdownConfirmed===false);
    if(concerning.length)return result('R010','review','medium','Hauswart/Hausmeister giderinin ayrımını kontrol edin','Hauswart maliyetinde bakım, onarım, yenileme, Schönheitsreparatur veya yönetim görevlerinin ayrıştırılıp ayrıştırılmadığını belge üzerinden kontrol edin.',{sourceIds:['BETRKV_2_14']});
    return result('R010','pass','info','Hauswart kaleminde belirgin ayrım sorunu işaretlenmedi','Girdiğiniz bilgiye göre ayrıştırılmamış bakım/onarım/yönetim ibaresi işaretlenmedi.',{sourceIds:['BETRKV_2_14']});
  }

  function R011(s, results){
    const need=(results||[]).some(x=>['R004','R005','R006','R007','R008','R009','R010'].includes(x.ruleId)&&x.status==='review') || !!s.hasUnexplainedCost;
    return need?result('R011','review','info','Dayanak belgelerini görmek yardımcı olabilir','Matematik veya gider kalemlerinde kontrol noktası bulunduğu için nötr bir Belegeinsicht/dayanak belge talebi hazırlayabilirsiniz.',{sourceIds:['BGB_556_4']}):result('R011','not_applicable','info','Şu aşamada belge talebi tetiklenmedi','Girdiğiniz bilgilerde otomatik olarak belge talebi gerektiren bir kontrol noktası işaretlenmedi.',{sourceIds:['BGB_556_4']});
  }

  function analyze(statement, context) {
    const base=[R001(statement),R002(statement),R003(statement,context&&context.today),R004(statement),R005(statement)].concat(R006(statement),[R007(statement),R008(statement),R009(statement),R010(statement)]);
    base.push(R011(statement,base));
    return {version:VERSION,generatedAt:new Date().toISOString(),results:base};
  }

  function runFixtures(){
    const checks=[]; const ok=(name,cond)=>checks.push({name,pass:!!cond});
    ok('money German 1.234,56',parseMoneyToCents('1.234,56')===123456);
    ok('money Turkish 1234,56',parseMoneyToCents('1234,56')===123456);
    ok('money dot decimal',parseMoneyToCents('1234.56')===123456);
    ok('period 01.01-31.12 pass',R001({billingPeriodStart:'2025-01-01',billingPeriodEnd:'2025-12-31'}).status==='pass');
    ok('period >12 review',R001({billingPeriodStart:'2025-01-01',billingPeriodEnd:'2026-01-01'}).status==='review');
    ok('leap year period pass',R001({billingPeriodStart:'2024-02-29',billingPeriodEnd:'2025-02-28'}).status==='pass');
    ok('late receipt review',R002({billingPeriodEnd:'2024-12-31',receivedOn:'2026-01-01'}).status==='review');
    ok('line sum mismatch review',R004({statedTenantCost:'100',costLines:[{tenantShare:'40'},{tenantShare:'50'}]}).status==='review');
    ok('balance pass',R005({statedTenantCost:'1000',statedAdvancePayments:'800',statedBalance:'200'}).status==='pass');
    ok('balance mismatch review',R005({statedTenantCost:'1000',statedAdvancePayments:'800',statedBalance:'250'}).status==='review');
    ok('allocation mismatch',R006({costLines:[{label:'Wasser',allocationEnabled:true,buildingTotal:'1000',tenantUnits:'50',totalUnits:'100',tenantShare:'600'}]})[0].status==='review');
    ok('heating 40/60 review',R007({heating:{enabled:true,consumptionBasedPercent:'40',areaBasedPercent:'60'}}).status==='review');
    ok('heating 70/30 pass',R007({heating:{enabled:true,consumptionBasedPercent:'70',areaBasedPercent:'30'}}).status==='pass');
    ok('missing data stays missing',R005({}).status==='missing_data');
    return {pass:checks.every(x=>x.pass),checks};
  }

  root.NebenkostenCore={VERSION,SOURCES,parseMoneyToCents,centsToNumber,parseNumber,parseDate,analyze,runFixtures};
})(typeof window!=='undefined'?window:globalThis);

(function(){
  'use strict';
  var C=window.CreditCardCore;
  var form=document.getElementById('cc-form');
  var result=document.getElementById('cc-result');
  if(!C||!form||!result)return;
  var started=false;
  function value(id){var el=document.getElementById(id);return el?el.value:'';}
  function analyticsAllowed(){try{return localStorage.getItem('ap_cookie_consent')==='accepted'}catch(e){return false}}
  function track(name,params){
    try{
      if(!analyticsAllowed())return;
      var payload=Object.assign({tool_name:'credit_card_fit_check'},params||{});
      if(window.APAnalytics&&typeof window.APAnalytics.track==='function')window.APAnalytics.track(name,payload);
      else if(typeof window.gtag==='function')window.gtag('event',name,payload);
    }catch(e){}
  }
  form.addEventListener('input',function(){if(!started){started=true;track('tool_start');}},{once:true});
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var x=C.assess({useCase:value('cc-use'),foreign:value('cc-foreign'),rental:value('cc-rental'),cash:value('cc-cash'),repay:value('cc-repay')});
    if(!x.valid)return;
    var title='',copy='',next='';
    if(x.route==='repayment_risk'){
      title='Önce kart borcu riskini çözün';
      copy='Kartı düzenli olarak Teilzahlung ile kullanmayı planlıyorsanız asıl maliyet kart ücreti değil, kalan bakiyeye uygulanan faiz olabilir. Bu profilde sizi doğrudan kart başvurusuna itmek yerine finansman ihtiyacını ayrı değerlendirmek daha doğru.';
      next='<div class="cc-actions"><a class="btn btn-primary" href="/kredi-secim-araci/">Finansman ihtiyacını sınıflandır →</a><a class="btn btn-secondary" href="/kredit-karsilastirma-2026/">Kredi maliyetlerini öğren</a></div>';
    }else if(x.route==='debit_first'){
      title='Günlük kullanım için önce Girokonto + debit kartı kontrol edin';
      copy='Seyahat, araç kiralama veya özel kredi kartı ihtiyacı görünmüyor. Mevcut veya yeni Girokonto ile verilen debit kart günlük kullanım için yeterli olabilir; gereksiz ikinci kart maliyetinden kaçınabilirsiniz.';
      next='<p><strong>Öncelikli kriterler:</strong> '+x.criteria.join(' · ')+'</p><div data-affiliate-slot="bank-comparison" aria-live="polite"></div><div class="cc-actions"><a class="btn btn-secondary" href="/banka-secim-araci/">Banka profilimi çıkar</a></div>';
    }else{
      title='Gerçek kredi kartı karşılaştırması sizin kullanımınıza daha uygun görünüyor';
      copy='Seyahat, yabancı para veya depozito kullanımında kart tipi ve kabul koşulları önem kazanıyor. Teklifleri yalnız yıllık ücrete göre değil, gerçek kullanım maliyetine göre karşılaştırın.';
      next='<p><strong>Öncelikli kriterler:</strong> '+x.criteria.join(' · ')+'</p><div data-affiliate-slot="credit-card-comparison" aria-live="polite"></div>';
    }
    result.className='cc-result show '+(x.route==='repayment_risk'?'warn':'ok');
    result.innerHTML='<span class="section-label">Sonuç</span><h2>'+title+'</h2><p>'+copy+'</p>'+next;
    if(window.APAffiliate)window.APAffiliate.renderAll(result);
    track('credit_card_tool_result',{route:x.route,foreign_use:x.foreign,rental_use:x.rental,cash_use:x.cash,repayment_mode:x.repay});
    result.scrollIntoView({behavior:'smooth',block:'start'});
  });
})();

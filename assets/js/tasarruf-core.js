(function(root){
  "use strict";
  function parseMoney(raw){var s=String(raw||"").trim().replace(/\s/g,"");if(!s)return null;if(s.includes(","))s=s.replace(/\./g,"").replace(",",".");var n=Number(s);return Number.isFinite(n)&&n>=0?n:null;}
  function assess(input){
    var cost=parseMoney(input.cost), annual=cost===null?null:(input.unit==="monthly"?cost*12:cost), status="low", reason="";
    if(cost===null||!input.age){status="missing";reason="Tutar veya son karşılaştırma zamanı eksik. Önce son fatura/poliçeyi açıp bu iki bilgiyi tamamlayın.";}
    else if(input.signal==="price"||input.signal==="renewal"||input.signal==="both"||input.age==="old"){
      status="check";
      if(input.signal==="both")reason="Fiyat artışı ve yaklaşan sözleşme tarihi birlikte güçlü bir yeniden kontrol sinyali oluşturuyor.";
      else if(input.signal==="price")reason="Fiyat/prim artışı yeni teklifleri aynı kapsam ve toplam maliyetle kontrol etmek için güçlü bir sinyal.";
      else if(input.signal==="renewal")reason="Fesih veya uzama tarihi yaklaşırken koşulları karşılaştırmak için uygun zamandasınız.";
      else reason="Bu kategori iki yıldan uzun süredir karşılaştırılmamış; güncel koşulları yeniden kontrol edin.";
    }else if(input.age==="mid"){status="check";reason="Son kontrolün üzerinden 12–24 ay geçmiş. Acil görünmese de güncel koşulları yeniden karşılaştırmaya değer.";}
    else {reason="Son 12 ayda kontrol edilmiş ve yeni fiyat/tarih sinyali yok. Şimdilik daha düşük öncelikte tutabilirsiniz.";}
    return {cost:cost,annual:annual,status:status,reason:reason};
  }
  function runTests(){
    var checks=[
      ["German money",parseMoney("1.234,56")===1234.56],
      ["decimal dot",parseMoney("95.50")===95.5],
      ["empty money",parseMoney("")===null],
      ["monthly annualized",assess({cost:"100",unit:"monthly",age:"recent",signal:"none"}).annual===1200],
      ["recent low",assess({cost:"100",unit:"monthly",age:"recent",signal:"none"}).status==="low"],
      ["price check",assess({cost:"100",unit:"monthly",age:"recent",signal:"price"}).status==="check"],
      ["old check",assess({cost:"100",unit:"monthly",age:"old",signal:"none"}).status==="check"],
      ["missing stays missing",assess({cost:"",unit:"annual",age:"old",signal:"price"}).status==="missing"]
    ];
    return {pass:checks.every(function(x){return x[1];}),checks:checks.map(function(x){return {name:x[0],pass:x[1]};})};
  }
  root.TasarrufCore={parseMoney:parseMoney,assess:assess,runTests:runTests};
})(typeof window!=="undefined"?window:globalThis);

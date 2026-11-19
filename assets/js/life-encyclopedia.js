(function(){
"use strict";
var root=document.querySelector("body[data-lang]");
if(!root)return;
var lang=root.dataset.lang, guides=Array.prototype.slice.call(document.querySelectorAll(".guide"));
var states={persona:"all",category:"all",mode:"",query:""};
function norm(s){return String(s||"").toLocaleLowerCase(lang).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ı/g,"i")}
function update(){
 var count=0;
 guides.forEach(function(g){
  var ok=(states.persona==="all"||g.dataset.personas.split(" ").includes(states.persona))
   &&(states.category==="all"||g.dataset.category===states.category)
   &&(!states.mode||g.dataset.mode===states.mode)
   &&(!states.query||norm(g.textContent).includes(norm(states.query)));
  g.hidden=!ok;if(ok)count++;
 });
 document.getElementById("guide-count").textContent=count+" / "+guides.length;
 document.getElementById("no-results").hidden=count>0;
 [["persona",states.persona],["category",states.category],["mode",states.mode]].forEach(function(pair){
  document.querySelectorAll("[data-"+pair[0]+"]").forEach(function(btn){
   var selected=btn.dataset[pair[0]]===pair[1];
   btn.classList.toggle("selected",selected);
   btn.setAttribute("aria-pressed",String(selected));
  });
 });
}
["persona","category","mode"].forEach(function(kind){
 document.querySelectorAll("[data-"+kind+"]").forEach(function(b){
  b.addEventListener("click",function(){
   var next=b.dataset[kind];
   states[kind]=(kind==="mode"&&states[kind]===next)?"":next;
   update();
  });
 });
});
var search=document.getElementById("guide-search");
search.addEventListener("input",function(){states.query=search.value;update()});
document.getElementById("search-form").addEventListener("submit",function(e){
 e.preventDefault();states.query=search.value;update();
 document.getElementById("guides").scrollIntoView({behavior:"smooth",block:"start"});
});
var items=[["Yoğurt kabı","Yoghurt cup","Joghurtbecher","yellow"],["Şampuan şişesi (boş)","Empty shampoo bottle","Leere Shampooflasche","yellow"],["Süt kutusu","Milk carton","Milchkarton","yellow"],["Meyve suyu kutusu","Juice carton","Saftkarton","yellow"],["Cips paketi","Crisp bag","Chipstüte","yellow"],["Alüminyum folyo","Aluminium foil","Alufolie","yellow"],["Boş deterjan şişesi","Empty detergent bottle","Leere Waschmittelflasche","yellow"],["Konserve kutusu","Food tin","Konservendose","yellow"],["Ambalaj filmi","Packaging film","Verpackungsfolie","yellow"],["Diş macunu tüpü (boş)","Empty toothpaste tube","Leere Zahnpastatube","yellow"],["Karton kutu (temiz)","Clean cardboard box","Sauberer Karton","paper"],["Gazete","Newspaper","Zeitung","paper"],["Dergi","Magazine","Zeitschrift","paper"],["Not defteri","Notebook","Notizheft","paper"],["Kâğıt zarf","Paper envelope","Briefumschlag","paper"],["Fotokopi kâğıdı","Printer paper","Druckerpapier","paper"],["Temiz pizza kutusu","Clean pizza box","Sauberer Pizzakarton","paper"],["Yumurta kartonu (temiz)","Clean egg carton","Sauberer Eierkarton","paper"],["Sebze kabuğu","Vegetable peel","Gemüseschale","bio"],["Meyve kabuğu","Fruit peel","Obstschale","bio"],["Kahve telvesi","Coffee grounds","Kaffeesatz","bio"],["Çay yaprakları","Tea leaves","Teeblätter","bio"],["Yumurta kabuğu","Eggshell","Eierschale","bio"],["Çiçek artığı","Plant trimmings","Pflanzenreste","bio"],["Reçel kavanozu (depozitosuz)","Jam jar, no deposit","Marmeladenglas ohne Pfand","glass"],["Şarap şişesi (depozitosuz)","Wine bottle, no deposit","Weinflasche ohne Pfand","glass"],["Turşu kavanozu","Pickle jar","Gurkenglas","glass"],["Cam sos şişesi","Glass sauce bottle","Saucenflasche aus Glas","glass"],["Kirli mendil","Used tissue","Benutztes Taschentuch","rest"],["Bebek bezi","Disposable nappy","Windel","rest"],["Süpürge torbası","Vacuum cleaner bag","Staubsaugerbeutel","rest"],["Kırık porselen fincan","Broken porcelain cup","Zerbrochene Porzellantasse","rest"],["Yağlı pizza kutusu","Greasy pizza box","Fettiger Pizzakarton","rest"],["Kullanılmış kâğıt havlu","Used kitchen roll","Benutztes Küchenpapier","rest"],["Plastik diş fırçası","Plastic toothbrush","Plastikzahnbürste","rest"],["Sigara izmariti","Cigarette butt","Zigarettenstummel","rest"],["Pil","Battery","Batterie","special"],["Şarjlı pil","Rechargeable battery","Akku","special"],["Eski telefon","Old phone","Altes Handy","special"],["Bozuk dizüstü bilgisayar","Broken laptop","Defekter Laptop","special"],["LED ampul","LED bulb","LED-Lampe","special"],["Boya kalıntısı","Leftover paint","Farbreste","special"],["Eski kanepe","Old sofa","Altes Sofa","special"],["Bozuk su ısıtıcısı","Broken electric kettle","Defekter Wasserkocher","special"],["Depozitolu PET şişe","Deposit PET bottle","PET-Pfandflasche","pfand"],["Depozitolu içecek kutusu","Deposit beverage can","Pfanddose","pfand"],["Depozitolu bira şişesi","Returnable beer bottle","Mehrweg-Bierflasche","pfand"]];
var terms={"tr":{"yellow":"Sarı ambalaj toplama","paper":"Kâğıt / karton","bio":"Organik atık","glass":"Cam ambalaj","rest":"Artık çöp","special":"Özel toplama / Wertstoffhof","pfand":"Pfand iadesi","empty":"Eşya bulunamadı. Almanca adını veya benzer bir kelimeyi deneyin."},"en":{"yellow":"Yellow packaging collection","paper":"Paper / cardboard","bio":"Organic waste","glass":"Glass packaging","rest":"Residual waste","special":"Special collection / recycling centre","pfand":"Deposit return","empty":"No matching item. Try another name or its German name."},"de":{"yellow":"Gelbe Sammlung / Verpackungen","paper":"Altpapier / Pappe","bio":"Biotonne","glass":"Altglasverpackung","rest":"Restmüll","special":"Sammelstelle / Wertstoffhof","pfand":"Pfandrückgabe","empty":"Kein Treffer. Bitte einen anderen Begriff versuchen."}};
var cal={"muenster":"https://awm.stadt-muenster.de/verwertung-entsorgung/online-entsorgungskalender","koeln":"https://www.awbkoeln.de/abfuhrkalender","berlin":"https://www.bsr.de/abfuhrkalender"};
var wq=document.getElementById("waste-search"),out=document.getElementById("waste-results");
function safe(s){return String(s).replace(/[&<>"']/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]})}
function draw(){
 var query=norm(wq.value.trim()),col=lang==="tr"?0:lang==="en"?1:2;
 var hits=items.filter(function(item){return item.slice(0,3).some(function(text){return norm(text).includes(query)})}).slice(0,query?10:5);
 out.innerHTML=hits.length?hits.map(function(item){
  return '<div class="waste-row"><div><strong>'+safe(item[col])+'</strong><small>'+safe(item[2])+'</small></div><span>'+safe(terms[lang][item[3]])+'</span></div>';
 }).join(""):'<p class="hint">'+safe(terms[lang].empty)+'</p>';
}
wq.addEventListener("input",draw);draw();
var city=document.getElementById("city"),citylink=document.getElementById("city-link");
city.addEventListener("change",function(){
 var href=cal[city.value];
 citylink.hidden=!href;
 if(href)citylink.setAttribute("href",href);
 else citylink.removeAttribute("href");
});
update();
})();
(function(root,factory){
  var api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.LetterCore=api;
})(typeof window!=="undefined"?window:globalThis,function(){
  "use strict";
  var TYPES=["landlord","cancellation","authority","school","health"];
  var ISSUE={heating:"Ausfall oder Störung der Heizung",water:"Problem mit der Wasserversorgung oder ein Wasserschaden",mold:"Feuchtigkeit oder Schimmelverdacht",electricity:"Störung der Stromversorgung in der Wohnung",other:"ein Mangel in der Wohnung"};
  var CONTRACT={internet:"Internetvertrag",mobile:"Mobilfunkvertrag",electricity:"Stromvertrag",insurance:"Versicherungsvertrag",other:"Vertrag"};
  var SCHOOL={meeting:"ein persönliches Gespräch",performance:"ein Gespräch über die schulische Entwicklung",absence:"die Mitteilung einer Abwesenheit",support:"ein Gespräch über Unterstützungsbedarf"};
  var HEALTH={status:"den aktuellen Bearbeitungsstand",documents:"die Bestätigung des Eingangs meiner Unterlagen",membership:"eine Klärung meines Versicherungsstatus",family:"den Bearbeitungsstand der Familienversicherung"};
  function clean(v){return String(v==null?"":v).replace(/\s+/g," ").trim();}
  function dateDE(v){var s=clean(v);if(!s)return "";var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);return m?m[3]+"."+m[2]+"."+m[1]:s;}
  function required(type,data){
    var fields={landlord:["sender","address"],cancellation:["sender","recipient"],authority:["sender","recipient"],school:["sender","child"],health:["sender","recipient"]};
    return (fields[type]||[]).filter(function(k){return !clean(data[k]);});
  }
  function header(data,subject){var rows=[clean(data.sender)];if(clean(data.recipient))rows.push("",clean(data.recipient));rows.push("",dateDE(data.letterDate)||new Intl.DateTimeFormat("de-DE").format(new Date()),"","Betreff: "+subject,"","Sehr geehrte Damen und Herren,","");return rows;}
  function reference(data){return clean(data.reference)?"Mein Akten-, Kunden- oder Vertragszeichen lautet: "+clean(data.reference)+".\n\n":"";}
  function create(type,input){
    var data={};Object.keys(input||{}).forEach(function(k){data[k]=clean(input[k]);});
    if(TYPES.indexOf(type)<0)return {valid:false,missing:["type"],text:""};
    var missing=required(type,data);if(missing.length)return {valid:false,missing:missing,text:""};
    var subject="",body="";
    if(type==="landlord"){
      subject="Mängelanzeige für die Wohnung "+data.address;
      body="hiermit informiere ich Sie über folgenden Mangel in der Wohnung: "+(ISSUE[data.issue]||ISSUE.other)+"."+(data.since?" Der Mangel besteht seit dem "+dateDE(data.since)+".":"")+"\n\nBitte prüfen Sie den Sachverhalt und veranlassen Sie die erforderlichen Maßnahmen. Bitte bestätigen Sie mir schriftlich den Eingang dieser Mitteilung und teilen Sie mir das weitere Vorgehen mit.";
    }else if(type==="cancellation"){
      subject="Kündigung: "+(CONTRACT[data.contract]||CONTRACT.other);
      body=reference(data)+"hiermit kündige ich meinen "+(CONTRACT[data.contract]||CONTRACT.other)+" zum nächstmöglichen Zeitpunkt.\n\nBitte bestätigen Sie mir die Kündigung schriftlich und teilen Sie mir das genaue Vertragsende mit.";
    }else if(type==="authority"){
      subject="Anfrage zum Bearbeitungsstand"+(data.reference?" – "+data.reference:"");
      body=reference(data)+(data.submitted?"Am "+dateDE(data.submitted)+" habe ich meinen Antrag beziehungsweise meine Unterlagen eingereicht. ":"")+"Ich bitte um eine kurze Auskunft zum aktuellen Bearbeitungsstand.\n\nSollten noch Unterlagen oder Angaben fehlen, teilen Sie mir bitte mit, was benötigt wird.";
    }else if(type==="school"){
      subject="Anfrage bezüglich "+data.child;
      body="ich möchte Sie wegen "+(SCHOOL[data.topic]||SCHOOL.meeting)+" für "+data.child+" kontaktieren.\n\nBitte teilen Sie mir mit, wann ein Termin oder eine kurze Rückmeldung möglich ist. Vielen Dank für Ihre Unterstützung.";
    }else{
      subject="Anfrage an die Krankenkasse"+(data.reference?" – "+data.reference:"");
      body=reference(data)+(data.submitted?"Am "+dateDE(data.submitted)+" habe ich die betreffenden Unterlagen eingereicht. ":"")+"Ich bitte um "+(HEALTH[data.topic]||HEALTH.status)+".\n\nSollten noch Unterlagen oder Angaben fehlen, teilen Sie mir bitte mit, was benötigt wird.";
    }
    var text=header(data,subject).join("\n")+body+"\n\nMit freundlichen Grüßen\n\n"+data.sender;
    return {valid:true,missing:[],subject:subject,text:text};
  }
  function runTests(){
    var base={sender:"Ayşe Yılmaz",recipient:"Beispiel GmbH",address:"Musterstraße 1",issue:"heating",contract:"internet",child:"Deniz Yılmaz",topic:"status",reference:"ABC-123"};
    var cases=TYPES.map(function(type){var r=create(type,base);return {name:type+" template",ok:r.valid&&r.text.indexOf("undefined")<0&&r.text.indexOf("Mit freundlichen Grüßen")>0};});
    cases.push({name:"required fields",ok:create("cancellation",{sender:""}).valid===false});
    cases.push({name:"unknown type",ok:create("unknown",base).valid===false});
    cases.push({name:"date formatting",ok:dateDE("2026-09-13")==="13.09.2026"});
    cases.push({name:"line breaks collapsed",ok:clean("A\nB")==="A B"});
    return {pass:cases.every(function(x){return x.ok;}),cases:cases};
  }
  return {types:TYPES,clean:clean,dateDE:dateDE,create:create,runTests:runTests};
});

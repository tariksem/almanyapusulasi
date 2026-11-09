// Synthetic PDF and image OCR in the live Chrome browser. No private customer files.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const SITE=process.env.AP_SITE_URL||'https://almanyapusulasi.de';
const REPORT='audit-output/browser-ocr-csp.json';
const rows=[],failures=[],violations=[];
function pdfFixture(){
  const lines=[
    'Nebenkostenabrechnung fiktive Testwohnung.',
    'Abrechnungszeitraum 01.01.2025 bis 31.12.2025.',
    'Gesamtkosten 2700,00 EUR. Vorauszahlungen 2400,00 EUR.',
    'Nachzahlung 300,00 EUR. Hausmeister 240,00 EUR.',
    'Heizung 900,00 EUR. Wasser 360,00 EUR. Grundsteuer 150,00 EUR.',
    ...Array.from({length:18},(_,i)=>'Fiktive Kostenposition '+(i+1)+' aus dem synthetischen Beleg. Keine Personendaten.')
  ];
  const stream='BT\n/F1 10 Tf\n45 790 Td\n13 TL\n'+lines.map(x=>'('+x.replace(/[\\()]/g,c=>'\\'+c)+') Tj T*').join('\n')+'\nET\n';
  const objects=[
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Length '+Buffer.byteLength(stream,'latin1')+' >>\nstream\n'+stream+'endstream'
  ];
  let pdf='%PDF-1.4\n'; const offsets=[];
  for(let i=0;i<objects.length;i++){offsets.push(Buffer.byteLength(pdf,'latin1'));pdf+=(i+1)+' 0 obj\n'+objects[i]+'\nendobj\n';}
  const start=Buffer.byteLength(pdf,'latin1');
  pdf+='xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n';
  for(const offset of offsets)pdf+=String(offset).padStart(10,'0')+' 00000 n \n';
  pdf+='trailer\n<< /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+start+'\n%%EOF\n';
  return Buffer.from(pdf,'latin1');
}
async function imageFixture(page){
  const base64=await page.evaluate(()=>{
    const c=document.createElement('canvas');c.width=1200;c.height=720;
    const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);
    g.fillStyle='#000';g.font='bold 44px Arial';g.fillText('Nebenkostenabrechnung 2025',40,75);
    g.font='34px Arial';
    [
      'Abrechnungszeitraum 01.01.2025 bis 31.12.2025',
      'Gesamtkosten 2700,00 EUR',
      'Vorauszahlungen 2400,00 EUR',
      'Nachzahlung 300,00 EUR',
      'Hausmeister 240,00 EUR',
      'Wasser und Abwasser 610,00 EUR',
      'Fiktive Daten - keine reale Abrechnung'
    ].forEach((text,i)=>g.fillText(text,40,160+70*i));
    return c.toDataURL('image/png').split(',')[1];
  });
  return Buffer.from(base64,'base64');
}
const cases=[
  {name:'pdf-text-layer',expected:'PDF metin katmanı',file:async()=>({name:'synthetic.pdf',mimeType:'application/pdf',buffer:pdfFixture()})},
  {name:'image-ocr',expected:'Fotoğraf OCR',file:async page=>({name:'synthetic.png',mimeType:'image/png',buffer:await imageFixture(page)})}
];
const browser=await chromium.launch({headless:true,channel:process.env.AP_BROWSER_CHANNEL||undefined});
try{
  for(const item of cases){
    const context=await browser.newContext({viewport:{width:1366,height:900},serviceWorkers:'block',locale:'tr-TR'});
    await context.addInitScript(()=>{
      try{localStorage.setItem('ap_cookie_consent','rejected');}catch{}
      window.__apCsp=[];
      document.addEventListener('securitypolicyviolation',e=>{
        let origin='';try{origin=new URL(e.blockedURI).origin;}catch{origin=String(e.blockedURI||'').slice(0,40);}
        window.__apCsp.push({disposition:e.disposition,directive:e.effectiveDirective,blockedOrigin:origin});
      });
    });
    const page=await context.newPage();
    const requests=[],writes=[],errors=[];
    page.on('request',r=>{
      try{
        const u=new URL(r.url());
        if(u.origin!==SITE){
          requests.push({origin:u.origin,type:r.resourceType()});
          if(!['GET','HEAD','OPTIONS'].includes(r.method()))writes.push({origin:u.origin,method:r.method()});
        }
      }catch{}
    });
    page.on('requestfailed',r=>{
      try{errors.push({origin:new URL(r.url()).origin,reason:r.failure()?.errorText||'unknown'});}catch{}
    });
    const row={name:item.name,pass:false,csp:[],externalOrigins:[],externalWrites:[],failedRequests:[]};
    try{
      const response=await page.goto(SITE+'/nebenkosten-abrechnung-kontrolu/',{waitUntil:'domcontentloaded',timeout:30000});
      assert.equal(response.status(),200);
      await page.locator('#nk-upload-file').waitFor({state:'attached',timeout:10000});
      const file=await item.file(page);
      assert(file.buffer.length<15*1024*1024,'Fixture too large');
      await page.locator('#nk-upload-file').setInputFiles(file);
      const outcome=await Promise.race([
        page.locator('#nk-upload-review:not(.nk-hidden)').waitFor({state:'visible',timeout:120000}).then(()=> 'review'),
        page.locator('#nk-upload-status.error').waitFor({state:'visible',timeout:120000}).then(()=> 'error')
      ]);
      const status=await page.locator('#nk-upload-status').innerText();
      assert.equal(outcome,'review','Extraction failed: '+status);
      const review=await page.locator('#nk-upload-review').innerText();
      assert(review.includes(item.expected),'Wrong extraction method: '+review.slice(0,150));
      assert.equal(await page.locator('#nk-r-confirm').count(),1);
      assert(await page.locator('#nk-review-apply').isDisabled(),'Must require explicit review confirmation');
      assert(review.includes('2025')||review.includes('2700')||review.includes('2.700'),'No text recovered');
      row.pass=true;console.log('PASS OCR '+item.name+' real extraction and mandatory confirmation');
    }catch(e){row.error=String(e.message||e).slice(0,500);failures.push(item.name+': '+row.error);console.error('FAIL OCR '+item.name+': '+row.error);}
    finally{
      row.csp=await page.evaluate(()=>window.__apCsp||[]).catch(()=>[]);
      violations.push(...row.csp.map(v=>({...v,scenario:item.name})));
      row.externalOrigins=[...new Set(requests.map(r=>r.origin))].sort();
      row.externalWrites=writes;row.failedRequests=errors.slice(0,20);
      if(writes.length){row.pass=false;failures.push(item.name+': unexpected external upload POST');}
      console.log('OCR NETWORK '+item.name+' '+JSON.stringify({origins:row.externalOrigins,writes,failed:errors.slice(0,10),csp:row.csp.slice(0,10)}));
      rows.push(row);await context.close();
    }
  }
}finally{await browser.close();}
fs.mkdirSync('audit-output',{recursive:true});
fs.writeFileSync(REPORT,JSON.stringify({createdAt:new Date().toISOString(),site:SITE,cases:rows,cspInventory:violations,limits:'Synthetic text PDF and generated image only. Real handwriting/document accuracy is not evaluated.'},null,2)+'\n');
console.log('OCR report saved '+REPORT);
if(failures.length)process.exitCode=1;else console.log('PASS OCR browser/CSP audit '+rows.length+' real synthetic files');

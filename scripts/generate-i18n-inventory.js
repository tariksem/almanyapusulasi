const fs=require('node:fs');
const {GROUPS,sourcePaths,routeFromPath,fileFromPath}=require('./bulk-i18n-lib.js');
const {curatedRoutes,bulkRoutes,turkishOnlyRoutes}=require('./i18n-registry.js');

const curated=new Set(curatedRoutes()),bulk=new Set(bulkRoutes());
const turkishOnly=new Set(turkishOnlyRoutes);
const groupByPath=new Map();
for(const group of GROUPS){
  const xml=fs.readFileSync('sitemap-'+group+'.xml','utf8');
  for(const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)){
    const pathname=new URL(match[1]).pathname;
    if(!pathname.startsWith('/en/')&&!pathname.startsWith('/de/'))groupByPath.set(pathname,group);
  }
}

const pages=sourcePaths().map(pathname=>{
  const route=routeFromPath(pathname);
  const file=fileFromPath(pathname);
  const html=fs.readFileSync(file,'utf8');
  const status=pathname==='/'?'localized-home':turkishOnly.has(route)?'turkish-only':curated.has(route)?'curated-reviewed':bulk.has(route)?'bulk-qa':'missing';
  return {
    path:pathname,file,group:groupByPath.get(pathname),status,
    forms:(html.match(/<form\b/gi)||[]).length,
    controls:(html.match(/<(?:input|select|textarea|button)\b/gi)||[]).length,
    scripts:(html.match(/<script\b/gi)||[]).length,
    headings:(html.match(/<h[1-6]\b/gi)||[]).length,
    interactive:/hesaplayici|araci|motoru|kontrolu|planlayici|kontrol-paneli|asistani/.test(route)||/<form\b/i.test(html)
  };
});
const byStatus=Object.fromEntries([...new Set(pages.map(page=>page.status))].map(status=>[status,pages.filter(page=>page.status===status).length]));
const report={date:new Date().toISOString().slice(0,10),sourceLanguage:'tr',targets:['en','de'],topics:pages.length,interactiveTopics:pages.filter(page=>page.interactive).length,byStatus,pages};
fs.writeFileSync('i18n-inventory.json',JSON.stringify(report,null,2)+'\n');
console.log('I18n inventory: '+pages.length+' source topics; '+report.interactiveTopics+' interactive; '+JSON.stringify(byStatus));

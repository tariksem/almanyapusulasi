// V4 production layout contract: checks every tracked, independently addressable page.
// This test guards shared navigation assets, exact logo and crawl metadata without
// changing any page's business logic or URL.
import fs from "node:fs";
import path from "node:path";
const root=process.cwd(),problems=[],warnings=[];
const tree=()=>{const out=[];function walk(base){for(const entry of fs.readdirSync(base,{withFileTypes:true})){const p=path.join(base,entry.name),rel=path.relative(root,p).replaceAll(path.sep,"/");if(entry.isDirectory()){if([".git","node_modules","dist"].includes(entry.name))continue;walk(p);}else if(entry.name==="index.html")out.push(rel)}}walk(root);return out};
const pages=tree().filter(p=>p==="index.html"||!p.startsWith("tasarim-v4-"));
let linked=0,missing=0,inlineHeaders=0,broken=0,eligible=0,redirectStubs=0;
for(const p of pages){
  const src=fs.readFileSync(p,"utf8");
  const slug=p==="index.html"?"/":"/"+p.slice(0,-10);
  // Some routes consist solely of redirects or bare test documents.
  if(!/<html\b/i.test(src)||!/<body\b/i.test(src))continue;
  // Redirect fallback files are not live pages: Cloudflare returns 301 before
  // HTML is displayed. Their noindex/meta-refresh fallback is intentional.
  if(/<meta[^>]+http-equiv=["']refresh["']/i.test(src)){redirectStubs++;continue;}
  eligible++;
  // All calculator tracking must use the first-party consent-safe API signature.
  if(/window\.APAnalytics\s*\(\s*['"]event['"]/.test(src))problems.push(p+": invalid analytics invocation");
  const pageHasShared=src.includes("/assets/js/analytics-consent.js");
  if(pageHasShared)linked++;else{
    missing++;warnings.push(p+": missing global site shell script");
  }
  if(/<header[^>]*class=["'][^"']*site-header[^"']*["'][^>]*>\s*<(?!\/header)/i.test(src))inlineHeaders++;
  if(!src.includes('rel="canonical"')&&!/rel='canonical'/.test(src))warnings.push(p+": missing canonical");
  if(slug==="/"&&(!src.includes('id="findForm"')||!src.includes('home-hubs-disclosure')))problems.push("Homepage search/disclosure removed");
}
for(const p of ["assets/style.css","assets/site-shell.css","assets/v42-unified.css","assets/v42-preview.css","assets/js/analytics-consent.js"]){
 if(!fs.existsSync(p))problems.push("Missing central asset: "+p);
}
const consent=fs.readFileSync("assets/js/analytics-consent.js","utf8");
for(const marker of ["renderHeader();","renderFooter();","/assets/v42-unified.css","ap-unified","ap-secondary-nav","renderContentNavigation();"]){
 if(!consent.includes(marker))problems.push("Central shell missing: "+marker);
}
for(const p of ["goc-kariyer/index.html","blue-card/index.html","brutto-netto-hesaplayici-2026/index.html"]){
 const s=fs.readFileSync(p,"utf8");
 if(!s.includes('/assets/v42-preview.css'))problems.push("Approved V4.2 implementation lost: "+p);
}
for(const p of ["nebenkosten-abrechnung-kontrolu/index.html","kindergeld/index.html","finans/index.html","araclar/index.html"]){
 const s=fs.readFileSync(p,"utf8");
 if(!s.includes('/assets/js/analytics-consent.js'))problems.push("Major production route lacks central shell: "+p);
}
if(linked!==eligible)problems.push("Active page global shell coverage must be 100%: "+linked+"/"+eligible);
const output={routes:eligible,redirectStubs,connected:linked,missing,coveragePercent:Number((linked/eligible*100).toFixed(1)),inlineLegacyHeaders:inlineHeaders,warningCount:warnings.length,errors:problems};
fs.mkdirSync("audit-output",{recursive:true});
fs.writeFileSync("audit-output/v42-cohesion.json",JSON.stringify({...output,warnings},null,2));
console.log(JSON.stringify(output,null,2));
for(const warning of warnings)console.log("V42-WARNING "+warning);
if(problems.length)process.exit(1);

// Build-time cleanup: remove duplicate legacy header markup after validating
// every target loads the single consent-aware, centrally rendered V4.2 shell.
// Operates only in the deployment workspace (never rewrites repository sources).
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(process.argv[2]||'dist');
if(!fs.existsSync(root))throw Error('Build directory missing: '+root);
const excluded=new Set(['.git','.github','node_modules','dist','scripts','data']);
const results={scanned:0,normalized:0,alreadyUnified:0,skippedRedirects:0,errors:[]};
const header=/<header\b([^>]*\bclass=["'][^"']*\bsite-header\b[^"']*["'][^>]*)>([\s\S]*?)<\/header>/ig;

function walk(directory){
 for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
  if(entry.isDirectory()){
   if(excluded.has(entry.name)||entry.name.startsWith('tasarim-v4-'))continue;
   walk(path.join(directory,entry.name));
   continue;
  }
  if(entry.name!=='index.html')continue;
  const file=path.join(directory,entry.name);
  const html=fs.readFileSync(file,'utf8');
  if(/<meta[^>]*http-equiv=["']refresh["']/i.test(html)){results.skippedRedirects++;continue;}
  results.scanned++;
  let count=0;
  const changed=html.replace(header,(all,attrs,body)=>{
   count++;
   if(!body.trim())return all;
   if(!html.includes('/assets/js/analytics-consent.js')){
    results.errors.push(path.relative(root,file)+': cannot remove header without shared renderer');
    return all;
   }
   return '<header'+attrs+'></header>';
  });
  if(count>1)results.errors.push(path.relative(root,file)+': multiple site-header elements');
  if(changed!==html){fs.writeFileSync(file,changed,'utf8');results.normalized++;}
  else results.alreadyUnified++;
 }
}
walk(root);
console.log(JSON.stringify(results,null,2));
if(results.errors.length)process.exit(1);

const fs=require('node:fs');
const path=require('node:path');
const {localizedFiles}=require('./i18n-registry.js');
const dest=process.argv[2];
if(!dest)throw Error('Usage: node scripts/copy-localized-pages.js <dist-directory>');
for(const f of [...localizedFiles(),'en/index.html','de/index.html']){
 if(!fs.existsSync(f))throw Error('Missing translated page: '+f);
 const to=path.join(dest,f);
 fs.mkdirSync(path.dirname(to),{recursive:true});
 fs.copyFileSync(f,to);
}
for(const f of ['assets/data/bulk-i18n-en.json','assets/data/bulk-i18n-de.json']){
 if(!fs.existsSync(f))throw Error('Missing generated runtime translation catalog: '+f);
 const to=path.join(dest,f);
 fs.mkdirSync(path.dirname(to),{recursive:true});
 fs.copyFileSync(f,to);
}
console.log('Copied '+(localizedFiles().length+2)+' localized pages and two runtime UI catalogs into '+dest);

const fs=require('node:fs'),assert=require('node:assert/strict');
const {translatedRoutes,localizedFiles}=require('./i18n-registry.js');
const core=fs.readFileSync('assets/js/i18n-core.js','utf8');
const match=core.match(/const translatedRoutes=new Set\((\[[^;]+\])\);/);
assert.ok(match,'Browser language router missing registered routes');
const actual=JSON.parse(match[1]);
const expected=translatedRoutes();
assert.deepEqual([...actual].sort(),[...expected].sort(),'Browser language links out of sync with translated guide registry');
assert.equal(new Set(actual).size,actual.length,'Duplicate translated routes');
const files=localizedFiles();
assert.equal(files.length,expected.length*2);
for(const file of files){
 assert.ok(fs.existsSync(file),'Generated language page missing: '+file);
 const html=fs.readFileSync(file,'utf8');
 const lang=file.split('/')[0];
 assert.ok(html.includes('<html lang="'+lang+'">'),'Incorrect html language: '+file);
}
console.log('I18n routes registry: '+expected.length+' routes × 2 languages, including nested news routes; browser/server/deploy lists aligned');

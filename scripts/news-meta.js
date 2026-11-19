// Read HTML metadata with the actual opening quote as its closing delimiter.
// The previous [^"'] pattern truncated double-quoted content at Turkish
// apostrophes such as "Kasım'da", breaking generated news translations.
function metaDescription(html){
  const tags=String(html).match(/<meta\b[^>]*>/gi)||[];
  const tag=tags.find(t=>/\bname\s*=\s*(["'])description\1/i.test(t));
  if(!tag)return '';
  const value=tag.match(/\bcontent\s*=\s*(["'])([\s\S]*?)\1/i);
  return value?value[2]:'';
}
module.exports={metaDescription};

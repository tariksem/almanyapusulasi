import redirects from './scripts/redirect-map.json' with {type:'json'};

const PRIMARY='https://almanyapusulasi.de';
function secure(response,url){
  const out=new Response(response.body,response);
  out.headers.set('X-Content-Type-Options','nosniff');
  out.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  out.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  const embed=url.searchParams.get('embed')==='1';
  out.headers.set('Content-Security-Policy',embed?"frame-ancestors 'self' https:":"frame-ancestors 'self'");
  if(!embed)out.headers.set('X-Frame-Options','SAMEORIGIN');
  // Start with a short policy; extend it only after live HTTPS checks.
  if(url.protocol==='https:')out.headers.set('Strict-Transport-Security','max-age=86400');
  return out;
}
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    const production=['almanyapusulasi.de','www.almanyapusulasi.de'].includes(url.hostname);
    if(production&&redirects[url.pathname]){
      const target=new URL(redirects[url.pathname]);
      target.search=url.search;
      return secure(Response.redirect(target.href,301),url);
    }
    if(production&&(url.protocol!=='https:'||url.hostname!=='almanyapusulasi.de')){
      return secure(Response.redirect(PRIMARY+url.pathname+url.search,308),url);
    }
    const response=await env.ASSETS.fetch(request);
    // Assets' HTML normalization uses 307 by default; these GET/HEAD URLs are permanent.
    if(['GET','HEAD'].includes(request.method)&&response.status===307&&response.headers.has('Location')){
      return secure(new Response(null,{status:308,headers:response.headers}),url);
    }
    return secure(response,url);
  }
};

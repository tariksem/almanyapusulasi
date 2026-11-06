import redirects from './scripts/redirect-map.json' with {type:'json'};

const PRIMARY='https://almanyapusulasi.de';
const EMBED_PATHS=new Set([
  '/almanya-emeklilik-hesaplayici-2026/',
  '/chancenkarte-puan-hesaplayici-2026/',
  '/blue-card-uygunluk-kontrolu-2026/',
  '/brutto-netto-hesaplayici-2026/'
]);
function secure(response,url){
  const out=new Response(response.body,response);
  out.headers.set('X-Content-Type-Options','nosniff');
  out.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  out.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  const embed=url.searchParams.get('embed')==='1'&&EMBED_PATHS.has(url.pathname);
  out.headers.set('Content-Security-Policy',embed?"frame-ancestors 'self' https:":"frame-ancestors 'self'");
  if(!embed)out.headers.set('X-Frame-Options','SAMEORIGIN');
  // Observe source violations before enforcing a policy on uploads, OCR and partner widgets.
  out.headers.set('Content-Security-Policy-Report-Only',[
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://raw.githubusercontent.com https://oet.bamf.de https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://tessdata.projectnaptha.com",
    "frame-src 'self' blob: https://*.check24.net https://*.partner-versicherung.de",
    "worker-src 'self' blob: https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; '));
  // HTTPS-only apex verified in live checks; stage HSTS at 30 days without subdomain preload.
  if(url.protocol==='https:')out.headers.set('Strict-Transport-Security','max-age=2592000');
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

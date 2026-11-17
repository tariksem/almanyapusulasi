(function(){
  'use strict';
  const script=document.currentScript;
  const lang=script&&script.dataset.lang;
  if(lang!=='en'&&lang!=='de')return;
  const skip=new Set(['SCRIPT','STYLE','CODE','PRE','SVG','NOSCRIPT','TEMPLATE']);
  const normalize=value=>String(value||'').replace(/\s+/g,' ').trim();

  fetch('/assets/data/bulk-i18n-'+lang+'.json')
    .then(response=>{if(!response.ok)throw new Error('HTTP '+response.status);return response.json();})
    .then(payload=>{
      const translations=payload.translations||{};
      const routes=new Set(payload.routes||[]);
      const partial=Object.keys(translations).filter(key=>key.length>=5).sort((a,b)=>b.length-a.length);
      const translate=value=>{
        const original=String(value||'');
        const compact=normalize(original);
        if(!compact)return original;
        let result=translations[compact];
        if(!result){
          result=compact;
          for(const source of partial)if(result.includes(source))result=result.split(source).join(translations[source]);
          if(result===compact)return original;
        }
        const leading=original.match(/^\s*/)[0],trailing=original.match(/\s*$/)[0];
        return leading+result+trailing;
      };
      const processElement=element=>{
        if(!element||skip.has(element.tagName))return;
        for(const name of ['aria-label','placeholder','title','alt'])if(element.hasAttribute&&element.hasAttribute(name))element.setAttribute(name,translate(element.getAttribute(name)));
        if(element.matches&&element.matches('input[type="submit"],input[type="button"],input[type="reset"]'))element.value=translate(element.value);
        if(element.matches&&element.matches('a[href],form[action]')){
          const attribute=element.matches('a[href]')?'href':'action';
          const value=element.getAttribute(attribute);
          if(value&&value.startsWith('/')){
            const url=new URL(value,document.baseURI);
            const clean=url.pathname.replace(/^\/(?:en|de)(?=\/|$)/,'');
            const route=clean.replace(/^\/+|\/+$/g,'')||'home';
            if(routes.has(route)&&!/^\/(?:assets|data)\//.test(clean)&&!/\.[a-z0-9]{2,5}$/i.test(clean)){
              url.pathname='/'+lang+'/'+(route==='home'?'':route+'/');
              element.setAttribute(attribute,url.pathname+url.search+url.hash);
            }
          }
        }
      };
      const processNode=node=>{
        if(node.nodeType===Node.TEXT_NODE){
          if(!node.parentElement||skip.has(node.parentElement.tagName))return;
          const next=translate(node.nodeValue);
          if(next!==node.nodeValue)node.nodeValue=next;
          return;
        }
        if(node.nodeType!==Node.ELEMENT_NODE&&node.nodeType!==Node.DOCUMENT_NODE)return;
        if(node.nodeType===Node.ELEMENT_NODE)processElement(node);
        const walker=document.createTreeWalker(node,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
        let current;
        while((current=walker.nextNode()))current.nodeType===Node.TEXT_NODE?processNode(current):processElement(current);
      };
      processNode(document.body);
      const observer=new MutationObserver(records=>{
        for(const record of records){
          if(record.type==='characterData')processNode(record.target);
          for(const node of record.addedNodes)processNode(node);
        }
      });
      observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    })
    .catch(error=>console.error('Almanya Pusulası runtime translation failed',error));
})();

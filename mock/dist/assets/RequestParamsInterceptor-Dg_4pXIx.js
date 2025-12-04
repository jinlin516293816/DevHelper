import{$ as e,Ct as t,Ht as n,Ot as r,T as i,Wt as a,X as o,_t as s,cn as c,et as l,f as u,hn as d,o as f,q as p,wn as m}from"./index-CJ9fb5TV.js";import"./editor.api-BW8rHIkv.js";import"./monaco.contribution-DmGhjs32.js";import{t as h}from"./MonacoEditor-gQCYm3Jh.js";var g={class:`request-params-interceptor-page`},_={class:`toolbar`},v={class:`toolbar-actions`},y={class:`editor-container`},b=i({__name:`RequestParamsInterceptor`,setup(i){let m=c(!1),b=c(`/* 在这里编写请求参数拦截器代码 */

// 示例：修改所有请求的查询参数
/*
function interceptParams(request) {
  // 修改URL查询参数
  const url = new URL(request.url);
  url.searchParams.set('customParam', 'customValue');
  url.searchParams.append('anotherParam', 'anotherValue');
  request.url = url.toString();
  
  // 修改请求体参数（仅适用于POST/PUT等方法）
  if (request.method !== 'GET' && request.body) {
    try {
      // 如果是JSON格式
      const data = JSON.parse(request.body);
      data.newField = 'newValue';
      data.updatedAt = new Date().toISOString();
      request.body = JSON.stringify(data);
      
      // 更新Content-Length
      request.headers['Content-Length'] = request.body.length.toString();
    } catch (e) {
      // 如果不是JSON格式，保持原样
      console.log('请求体不是JSON格式，不处理');
    }
  }
  
  return request;
}
*/
`);s(()=>{S()});let x=((e,t)=>{let n=null;return function(...r){n&&clearTimeout(n),n=setTimeout(()=>e.apply(this,r),t)}})(e=>{typeof chrome<`u`&&chrome.storage?chrome.storage.local.set({requestParamsInterceptor:e},()=>{f.success(`请求参数拦截器代码已自动保存`),m.value&&chrome.runtime.sendMessage({action:`updateRequestParamsInterceptor`,code:e})}):(localStorage.setItem(`requestParamsInterceptor`,e),f.success(`请求参数拦截器代码已自动保存`))},1e3);n(b,e=>{x(e)},{deep:!0});let S=()=>{if(typeof chrome<`u`&&chrome.storage)chrome.storage.local.get([`requestParamsInterceptor`,`requestParamsInterceptorStatus`],e=>{let t=e.requestParamsInterceptor,n=e.requestParamsInterceptorStatus;t&&(b.value=t),n!==void 0&&(m.value=n,m.value&&chrome.runtime.sendMessage({action:`updateRequestParamsInterceptor`,code:b.value}))});else{let e=localStorage.getItem(`requestParamsInterceptor`),t=localStorage.getItem(`requestParamsInterceptorStatus`);e&&(b.value=e),t&&(m.value=t===`true`)}},C=()=>{typeof chrome<`u`&&chrome.storage?chrome.storage.local.set({requestParamsInterceptor:b.value},()=>{f({message:`请求参数拦截器代码已保存`,type:`success`,duration:2e3})}):(localStorage.setItem(`requestParamsInterceptor`,b.value),f({message:`请求参数拦截器代码已保存`,type:`success`,duration:2e3}))},w=e=>{typeof chrome<`u`&&chrome.storage?chrome.storage.local.set({requestParamsInterceptorStatus:e},()=>{e?chrome.runtime.sendMessage({action:`updateRequestParamsInterceptor`,code:b.value},e=>{chrome.runtime.lastError?console.error(`请求参数拦截器启用失败:`,chrome.runtime.lastError):e&&!e.success?console.error(`请求参数拦截器启用失败:`,e.error):f.success(`请求参数拦截器已启用`)}):chrome.runtime.sendMessage({action:`disableRequestParamsInterceptor`},e=>{chrome.runtime.lastError?console.error(`请求参数拦截器禁用失败:`,chrome.runtime.lastError):e&&!e.success?console.error(`请求参数拦截器禁用失败:`,e.error):f.info(`请求参数拦截器已禁用`)})}):(localStorage.setItem(`requestParamsInterceptorStatus`,e.toString()),e?f.success(`请求参数拦截器已启用`):f.info(`请求参数拦截器已禁用`))};return(n,i)=>{let s=r(`el-switch`),c=r(`el-button`);return t(),o(`div`,g,[p(`div`,_,[i[4]||=p(`h2`,{class:`page-title`},`请求参数拦截`,-1),p(`div`,v,[i[3]||=p(`span`,{style:{"margin-right":`10px`,"font-size":`16px`}},`是否启用`,-1),l(s,{modelValue:m.value,"onUpdate:modelValue":i[0]||=e=>m.value=e,onChange:w,size:`large`,"active-color":`#13ce66`,"inactive-color":`#909399`},null,8,[`modelValue`]),l(c,{type:`primary`,onClick:C,size:`large`,icon:d(u),style:{"margin-left":`10px`}},{default:a(()=>[...i[2]||=[e(` 保存 `,-1)]]),_:1},8,[`icon`])])]),p(`div`,y,[l(h,{modelValue:b.value,"onUpdate:modelValue":i[1]||=e=>b.value=e,language:`javascript`,"read-only":!1,theme:`vs-dark`,"enable-save":!0},null,8,[`modelValue`])])])}}},[[`__scopeId`,`data-v-8c795613`]]);export{b as default};
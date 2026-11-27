/* ---------- banco Supabase (versão online, funciona sem internet) ---------- */
const SBURL='https://rjhbsyemsrrrdajepxaq.supabase.co',SBKEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqaGJzeWVtc3JycmRhamVweGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU3MjU5MTIsImV4cCI6MjExMTMwMTkxMn0.MqnXi8RAOjiDTFsFQdyl1iWXjAn9mlwyR4t0DJrjF5A';
const SB=(()=>{const H={apikey:SBKEY,Authorization:'Bearer '+SBKEY,'Content-Type':'application/json'},TB={tracos:'calc_tracos',produtos:'calc_produtos',historico:'calc_historico'},subs={};
 const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
 const ck=col=>'luparo-cache-'+col,fila=()=>LS.get('luparo-fila',[]),setFila=f=>{LS.set('luparo-fila',f);bar()};
 let netOk=navigator.onLine!==false,bloq=false,enviando=false;
 const snap=(rows,fc)=>{const d=rows.map(x=>({id:x.id,exists:true,data:()=>x.dados||{}}));return {docs:d,size:d.length,empty:!d.length,metadata:{fromCache:!!fc,hasPendingWrites:false}}};
 const novoId=()=>{try{if(crypto.randomUUID)return crypto.randomUUID()}catch(e){}return 'id-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10)};
 function aplica(rows,op){const id=op.body.p_id;const o=rows.filter(y=>y.id!==id);if(op.fn!=='calc_salvar')return o;const r={id,dados:op.body.p_dados};return op.col==='historico'?[r,...o]:[...o,r].sort((a,b)=>a.id<b.id?-1:1)}
 function cache(col){return LS.get(ck(col),null)}
 async function load(col){const ord=col==='historico'?'criado.desc':'id.asc';const ctl=typeof AbortController!=='undefined'?new AbortController():null;const tm=setTimeout(()=>ctl&&ctl.abort(),12000);
  let r;try{r=await fetch(`${SBURL}/rest/v1/${TB[col]}?select=id,dados&order=${ord}&limit=500`,{headers:H,signal:ctl?ctl.signal:undefined})}catch(e){netOk=false;bar();throw {code:'unavailable'}}finally{clearTimeout(tm)}
  if(!r.ok)throw {code:'unavailable'};netOk=true;let rows=await r.json();fila().filter(x=>x.col===col).forEach(op=>{rows=aplica(rows,op)});LS.set(ck(col),rows);bar();return rows}
 function local(col){const c=cache(col)||[];(subs[col]||[]).forEach(s=>s.n(snap(c,true)))}
 function refresh(col){(subs[col]||[]).forEach(s=>load(col).then(d=>s.n(snap(d,false))).catch(e=>{const c=cache(col);if(c)s.n(snap(c,true));else s.e&&s.e(e)}))}
 function code(force){let c='';try{c=localStorage.getItem('luparo-codigo')||''}catch(e){}if(!c||force){c=(window.prompt(force?'Código incorreto. Digite o código da equipe Luparo:':'Para salvar, digite o código da equipe Luparo:')||'').trim();if(c)try{localStorage.setItem('luparo-codigo',c)}catch(e){}}return c}
 async function envia(op,c){let r;try{r=await fetch(`${SBURL}/rest/v1/rpc/${op.fn}`,{method:'POST',headers:H,body:JSON.stringify({p_codigo:c,...op.body})})}catch(e){netOk=false;return 'rede'}
  netOk=true;if(r.ok)return 'ok';const tx=await r.text();return tx.includes('codigo_invalido')?'codigo':'erro'}
 function guarda(op){setFila([...fila(),op]);LS.set(ck(op.col),aplica(cache(op.col)||[],op));local(op.col)}
 async function rpc(fn,body,col){const op={fn,col,body};let c=code(false);if(!c)throw {code:'invalid_argument'};
  if(fila().length||navigator.onLine===false){guarda(op);envio();return null}
  for(let t=0;t<3;t++){const r=await envia(op,c);if(r==='ok'){refresh(col);return null}if(r==='rede'){guarda(op);return null}if(r==='erro')throw {code:'unavailable'};c=code(true);if(!c)break}
  throw {code:'invalid_argument'}}
 async function envio(){if(enviando)return;const f0=fila();if(!f0.length){bloq=false;bar();return}enviando=true;bar();const cols=new Set();
  try{while(fila().length){const op=fila()[0],c=code(false);if(!c){bloq=true;break}const r=await envia(op,c);if(r==='rede')break;if(r==='codigo'){bloq=true;break}
   bloq=false;cols.add(op.col);setFila(fila().slice(1))}}finally{enviando=false}
  cols.forEach(refresh);bar()}
 function bar(){let el=document.getElementById('netbar');if(!el){el=document.createElement('div');el.id='netbar';el.className='netbar';el.setAttribute('role','status');document.body.appendChild(el);
   el.addEventListener('click',e=>{if(e.target.closest('[data-nb]')){code(true);bloq=false;envio()}})}
  const n=fila().length,off=navigator.onLine===false||!netOk;let h='';
  if(off)h=`<b>Sem internet</b> · os cálculos funcionam normalmente${n?` · ${n} ${n>1?'itens aguardando':'item aguardando'} envio`:''}`;
  else if(n&&bloq)h=`${n} item(ns) aguardando envio: código da equipe incorreto. <button data-nb>Digitar código</button>`;
  else if(n)h=`Enviando ${n} item(ns) salvos sem internet…`;
  el.innerHTML=h;el.hidden=!h;document.body.style.paddingTop=h?el.offsetHeight+'px':''}
 addEventListener('online',()=>{netOk=true;bar();envio();Object.keys(subs).forEach(refresh)});addEventListener('offline',()=>{netOk=false;bar()});
 setInterval(()=>{if(fila().length)envio();Object.keys(subs).forEach(refresh)},60000);addEventListener('focus',()=>{envio();Object.keys(subs).forEach(refresh)});
 setTimeout(()=>{bar();envio()},800);
 const coll=col=>{const q={onSnapshot(n,e){const s={n,e};(subs[col]||(subs[col]=[])).push(s);const c=cache(col);if(c)n(snap(c,true));load(col).then(d=>n(snap(d,false))).catch(err=>{if(!c)e&&e(err)});return()=>{}},orderBy(){return q},limit(){return q},
  doc(id){const pid=id||novoId();return {set:d=>rpc('calc_salvar',{p_tabela:col,p_id:pid,p_dados:d},col),delete:()=>rpc('calc_excluir',{p_tabela:col,p_id:pid},col)}}};return q};
 return {collection:coll,pendentes:()=>fila().length,offline:()=>navigator.onLine===false||!netOk}})();

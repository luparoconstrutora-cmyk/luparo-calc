/* ---------- lançamento de peças (formulário + lista) ---------- */
const PF={
 conc:{type:()=>cTipo(),F:t=>FF(t),name:t=>CT[t].n,def:t=>CT[t].d,val:r=>volConc(r),fmt:v=>f(v,3)+' m³',ex:t=>({sapata:'S1',pilar:'P1',broca:'E1',laje:'L1',piso:'C1'})[t]||'V1',gen:t=>CT[t].g,tot:L=>{const v=L.reduce((a,r)=>a+volConc(r),0);return f(v,2)+' m³'}},
 est:{type:()=>'est',F:()=>EF,name:()=>'Peça',def:()=>ROWS.est.def,val:r=>estCalc(r).NT,fmt:v=>f(v,0)+' estribos',ex:()=>'V1',gen:()=>'f',info:r=>{const e=estCalc(r);return e.NT?`${e.NT} estribos de ${f(e.comp,0)} cm · ${f(e.kg+e.kgl,1)} kg de aço`:''},
  tot:L=>{let n=0,kg=0;L.forEach(r=>{const e=estCalc(r);n+=e.NT;kg+=e.kg+e.kgl});return n+' estribos · '+f(kg,1)+' kg'}}
};
const EDIT={},FLASH={};
function draft(key){const P=PF[key],t=P.type(),id=key+':'+t;if(!S.v.dr||typeof S.v.dr!=='object')S.v.dr={};if(!S.v.dr[id])S.v.dr[id]={desc:'',...P.def(t)};return S.v.dr[id]}
function renderPF(key){const P=PF[key],t=P.type(),F=P.F(t),d=draft(key),ed=EDIT[key]!=null,nm=P.name(t),fem=P.gen(t)==='f';
 const fld=([k,l,u,o])=>`<label>${l}${o?`<select data-dr="${key}" data-f="${k}">${o.map(x=>`<option ${String(d[k])===x?'selected':''}>${x}</option>`).join('')}</select>`:`<span class="ig"><input inputmode="decimal" data-dr="${key}" data-f="${k}" value="${esc(key==='conc'?dv(t,k,d[k]):d[k])}" aria-label="${l} (${u})"><i>${u}</i></span>`}</label>`;
 const main=F.filter(x=>!x[4]),adv=F.filter(x=>x[4]);
 $('#pf-'+key).innerHTML=`<div class="card pf${ed?' ed':''}"><div class="pfh"><h3>${ed?'Editando':(fem?'Nova':'Novo')} ${nm.toLowerCase()}</h3><input type="text" data-dr="${key}" data-f="desc" value="${esc(d.desc)}" placeholder="Nome (ex.: ${P.ex(t)})" aria-label="Identificação"></div><div class="fc">${main.map(fld).join('')}</div>${adv.length?`<details><summary>Mais ajustes: ${adv.map(x=>x[1].toLowerCase()).join(', ')}</summary><div class="fc">${adv.map(fld).join('')}</div></details>`:''}<div class="pfv" id="pfv-${key}"></div><div class="pfb">${ed?`<button class="pri" data-pfok="${key}">✓ Salvar alteração</button><button data-pfx="${key}">Cancelar</button>`:`<button class="pri" data-pfok="${key}">✓ Adicionar ${fem?'esta':'este'} ${nm.toLowerCase()}</button>`}</div><p class="toast" id="pft-${key}" role="status"></p></div>`;
 pfPrev(key)}
const PFCONF={};
function pfPrev(key){const P=PF[key],t=P.type(),d=draft(key),v=P.val({...d,t});const W=key==='conc'?checkPeca(t,d):[];$('#pfv-'+key).innerHTML=(v>0?`Esta peça: <b>${P.info?P.info(d):P.fmt(v)}</b>`:'Preencha as medidas para ver o resultado desta peça.')+W.map(w=>`<span class="wrn">⚠ ${esc(w)}</span>`).join('')}
const nextName=s=>{const m=String(s||'').match(/^(.*?)(\d+)$/);return m?m[1]+(+m[2]+1):''};
function pfOk(key){const P=PF[key],t=P.type(),d=draft(key),v=P.val({...d,t}),msg=$('#pft-'+key);
 if(!(v>0)){msg.className='toast warn';msg.textContent='Preencha as medidas antes de adicionar.';return}
 if(key==='conc'&&checkPeca(t,d).length&&!PFCONF[key]){PFCONF[key]=true;msg.className='toast warn';msg.textContent='⚠ Confira as medidas destacadas acima. Se estiver certo, toque de novo em adicionar.';return}PFCONF[key]=false;
 const item={...d,t},nm=P.name(t)+(d.desc?' '+d.desc:''),fem=P.gen(t)==='f';let i;
 if(EDIT[key]!=null){i=EDIT[key];S.rows[key][i]=item;EDIT[key]=null}else{S.rows[key].push(item);i=S.rows[key].length-1}
 const was=EDIT[key]===null&&item!==undefined;S.v.dr[key+':'+t]={...d,desc:nextName(d.desc)};FLASH[key]=i;
 renderPF(key);save();calc();const m=$('#pft-'+key);m.className='toast';m.textContent=`✓ ${nm} ${fem?'lançada':'lançado'}. Total: ${P.tot(S.rows[key])}`;}
function pfEdit(key,i){const r=S.rows[key][i];if(!r)return;if(key==='conc'){S.v.concTipo=r.t;renderSeg();renderArt()}const P=PF[key];S.v.dr[key+':'+P.type()]={...r};EDIT[key]=i;renderPF(key);$('#pf-'+key).scrollIntoView({behavior:'smooth',block:'start'})}
function pfCancel(key){const P=PF[key],t=P.type();EDIT[key]=null;S.v.dr[key+':'+t]={desc:'',...P.def(t)};renderPF(key);save()}
function renderList(key){const P=PF[key],L=S.rows[key];const fl=FLASH[key];FLASH[key]=null;
 $('#pl-'+key).innerHTML=L.length?'<div class="lst">'+L.map((r,i)=>{const t=key==='conc'?r.t:'est',F=P.F(t).filter(x=>x[0]!=='q'&&!x[4]&&!x[3]);const dims=key==='est'?`${esc(r.c)} m · ${esc(r.b)}×${esc(r.h)} cm`:F.filter(([k])=>num(r[k])>0).map(([k,l,u])=>`${esc(dv(t,k,r[k]))} ${u}`).join(' × ')+(num(r.q)>1?` · ${f(num(r.q),0)}×`:'')+(key==='est'?` · φ${esc(r.phi)} c/${esc(r.s)} cm`:'');
  return `<div class="li${i===fl?' new':''}${EDIT[key]===i?' on':''}"><div><b>${P.name(t)}${r.desc?' '+esc(r.desc):' '+(i+1)}</b><small>${dims}</small></div><b class="v">${P.info?esc(estCalc(r).NT+' est.'):P.fmt(P.val(r))}</b><button class="x" data-ed="${key}" data-i="${i}" aria-label="Editar">✎</button><button class="x" data-rm="${key}" data-i="${i}" aria-label="Excluir">×</button></div>`}).join('')+`</div><div class="tot"><span>Total (${L.length} peça${L.length>1?'s':''})</span><span>${P.tot(L)}</span></div>`:'<p class="empty">Nenhuma peça lançada ainda. Preencha acima e toque em adicionar.</p>'}
function onDraft(e){const t=e.target;if(!t.dataset||!t.dataset.dr)return;PFCONF[t.dataset.dr]=false;{const K=t.dataset.dr;draft(K)[t.dataset.f]=K==='conc'?sv(PF.conc.type(),t.dataset.f,t.value):t.value}save();pfPrev(t.dataset.dr)}
document.addEventListener('input',onDraft);document.addEventListener('change',e=>{if(e.target.tagName==='SELECT')onDraft(e)});

/* ---------- barra de resultado ---------- */
let RESVIS=false;
function updBar(){const k=(location.hash.slice(1)||'inicio'),L=LAST[k],bar=$('#sumbar');
 if(!L||['inicio','historico','tracos','calculadora'].includes(k)||RESVIS){bar.hidden=true;document.body.classList.remove('hasbar');return}
 bar.hidden=false;document.body.classList.add('hasbar');$('#sbT').innerHTML=`<small>${esc(L.cap)}</small><b>${esc(L.big)} <i>${esc(L.unit)}</i></b>${L.bar?`<small>${esc(L.bar)}</small>`:''}`}
const io=new IntersectionObserver(es=>{es.forEach(en=>{if(en.target.closest('.pane.on'))RESVIS=en.isIntersecting});updBar()},{threshold:.15});

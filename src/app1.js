/* ---------- saída ---------- */
const TXT={},LAST={};
const strip=s=>String(s).replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
function out(id,o){
 $('#r-'+id).innerHTML=`<div class="cap">${o.cap}</div><div class="big">${o.big}<small>${o.unit||''}</small></div>${o.chip||''}${(o.items||[]).map(([l,v,s])=>`<div class="it${s?' s':''}"><span>${l}</span><b>${v}</b></div>`).join('')}${o.html||''}${o.note?`<p class="note">${o.note}</p>`:''}`;
 TXT[id]=['LUPARO · '+strip(o.title),strip(o.cap)+': '+strip(o.big)+' '+strip(o.unit||''),...(o.items||[]).map(([l,v])=>strip(l)+': '+strip(v)),...(o.txt||[])].join('\n');
 LAST[id]={big:strip(o.big),unit:strip(o.unit||''),title:strip(o.title),cap:strip(o.cap),bar:o.bar||''};if(typeof updBar==='function')updBar();
}

/* ---------- cubicagem ---------- */
const LC=[['c','Comprimento','m'],['l','Largura','m'],['e','Espessura','m'],['q','Quantidade','un']],LV=[['c','Comprimento','m'],['b','Largura','m'],['h','Altura','m'],['q','Quantidade','un']];
const CT={
 laje:{n:'Laje',f:LC,d:{c:'',l:'',e:'0,10',q:'1'},v:r=>num(r.c)*num(r.l)*num(r.e)*num(r.q),fo:r=>num(r.c)*num(r.l)*num(r.q),g:'f',cm:['e']},
 viga:{n:'Viga',f:LV,d:{c:'',b:'0,14',h:'0,40',q:'1'},v:r=>num(r.c)*num(r.b)*num(r.h)*num(r.q),fo:r=>num(r.c)*(2*num(r.h)+num(r.b))*num(r.q),g:'f',cm:['b','h']},
 pilar:{n:'Pilar',f:[['b','Lado a','m'],['h','Lado b','m'],['alt','Altura','m'],['q','Quantidade','un']],d:{b:'0,14',h:'0,30',alt:'',q:'1'},v:r=>num(r.b)*num(r.h)*num(r.alt)*num(r.q),fo:r=>2*(num(r.b)+num(r.h))*num(r.alt)*num(r.q),g:'m',cm:['b','h']},
 sapata:{n:'Sapata',f:[['l','L (comprimento)','m'],['b','B (largura)','m'],['h','h base','m'],['hp','h tronco','m'],['pa','Pilar a','m',null,1],['pb','Pilar b','m',null,1],['q','Quantidade','un']],d:{l:'',b:'',h:'0,25',hp:'0',pa:'0,20',pb:'0,20',q:'1'},v:r=>volSap(r),fo:r=>2*(num(r.l)+num(r.b))*num(r.h)*num(r.q),g:'f',cm:['l','b','h','hp','pa','pb']},
 baldrame:{n:'Baldrame',f:LV,d:{c:'',b:'0,15',h:'0,30',q:'1'},v:r=>num(r.c)*num(r.b)*num(r.h)*num(r.q),fo:r=>2*num(r.c)*num(r.h)*num(r.q),g:'m',cm:['b','h']},
 piso:{n:'Contrapiso',f:LC,d:{c:'',l:'',e:'0,05',q:'1'},v:r=>num(r.c)*num(r.l)*num(r.e)*num(r.q),fo:r=>0,g:'m',cm:['e']},
 broca:{n:'Broca',f:[['d','Diâmetro','m'],['p','Profundidade','m'],['q','Quantidade','un']],d:{d:'0,25',p:'',q:'1'},v:r=>Math.PI*(num(r.d)/2)**2*num(r.p)*num(r.q),fo:r=>0,g:'f',cm:['d']}
};
const UN=()=>S.v.unidade==='cm'?'cm':'m';
const isCm=(t,k)=>UN()==='cm'&&CT[t]&&CT[t].cm.includes(k);
const FF=t=>CT[t].f.map(x=>isCm(t,x[0])?[x[0],x[1],'cm',x[3],x[4]]:x);
const dv=(t,k,v)=>{if(v===undefined||v===null||v==='')return '';if(!isCm(t,k))return String(v).replace('.',',');return String(Math.round(num(v)*100*1000)/1000).replace('.',',')};
const sv=(t,k,v)=>isCm(t,k)&&String(v).trim()!==''?String(num(v)/100):v;
function renderUnit(){const h=`<span>Seção e espessura em:</span><button data-un="m" class="${UN()==='m'?'on':''}">metros (m)</button><button data-un="cm" class="${UN()==='cm'?'on':''}">centímetros (cm)</button>`;$$('.unit').forEach(el=>el.innerHTML=h)}
/* faixas normais (em metros) para avisar erro de unidade */
const LIM={c:[0.05,200],l:[0.05,100],e:[0.02,0.5],b:[0.05,1.5],h:[0.05,1.5],alt:[0.3,30],p:[0.3,40],d:[0.1,1.5],pa:[0.05,1.5],pb:[0.05,1.5],hp:[0.01,1.5],q:[1,500]};
const limOf=(t,k)=>t==='sapata'&&(k==='l'||k==='b')?[0.2,6]:t==='sapata'&&k==='h'?[0.1,1.5]:LIM[k];
function checkPeca(t,r){const c=CT[t];if(!c)return [];const W=[];
 FF(t).forEach(([k,l,u])=>{const L=limOf(t,k);if(!L||r[k]===undefined||String(r[k]).trim()==='')return;const v=num(r[k]);if(!(v>0))return;const shown=(k==='q'?f(v,0):dv(t,k,r[k]))+(k==='q'?'':' '+u);
  if(k==='q'){if(v>L[1])W.push(`${l}: ${shown} é um valor muito alto. Confira.`);return}
  if(v>L[1])W.push(isCm(t,k)||!c.cm.includes(k)?`${l}: ${shown} é um valor muito alto. Confira.`:`${l}: ${shown} é um valor muito alto. Se quis dizer ${dv(t,k,v)} cm, digite ${dv(t,k,v/100)} ou troque a unidade para cm.`);
  else if(v<L[0])W.push(isCm(t,k)?`${l}: ${shown} é um valor muito baixo. Se quis dizer ${dv(t,k,r[k])} m, digite ${String(Math.round(v*1e6)/100).replace('.',',')} ou troque a unidade para m.`:`${l}: ${shown} é um valor muito baixo. Confira.`)});
 return W}
const da=k=>CT[k].g==='f'?'da':'do';
function volSap(r){const L=num(r.l),B=num(r.b),A1=L*B,h=num(r.h),hp=num(r.hp),A2=(num(r.pa)+.05)*(num(r.pb)+.05);return (A1*h+(hp>0?hp/3*(A1+A2+Math.sqrt(A1*A2)):0))*num(r.q)}
const volConc=r=>CT[r.t]?CT[r.t].v(r):0;
const cTipo=()=>CT[V('concTipo')]?V('concTipo'):'laje';
function ensureRow(t){}
function renderSeg(){const t=cTipo();$('#seg').innerHTML=Object.entries(CT).map(([k,c])=>{const n=S.rows.conc.filter(r=>r.t===k).length;return `<button data-seg="${k}" class="${k===t?'on':''}" aria-pressed="${k===t}">${art(k)}<span>${c.n}</span>${n?`<span class="n">${n}</span>`:''}</button>`}).join('')}
function renderArt(){}
function renderConc(){renderArt();renderPF('conc');renderList('conc')}
function fillConcSel(){const sel=$('#concTraco');if(!sel)return;const L=TR.filter(t=>t.tipo==='Concreto'||t.tipo==='Graute'||t.tipo==='Contrapiso');const A=L.length?L:TR;const cur=V('concTraco');
 sel.innerHTML=A.map(t=>`<option value="${esc(t.id)}">${esc(t.nome)}</option>`).join('');if(A.some(t=>t.id===cur))sel.value=cur;else{S.v.concTraco=A[0]?A[0].id:'';sel.value=S.v.concTraco}}
let CONC=0;
function cConcreto(){
 const L=S.rows.conc,G={};let t=0,fo=0;
 L.forEach(r=>{const c=CT[r.t];if(!c)return;const v=c.v(r);if(!(v>0))return;t+=v;fo+=c.fo(r);(G[r.t]||(G[r.t]={v:0,n:0})).v+=v;G[r.t].n++});
 const pe=N('perdaC'),tp=t*(1+pe/100);CONC=tp;renderList('conc');renderSeg();
 const items=Object.keys(CT).filter(k=>G[k]).map(k=>[CT[k].n+' · '+G[k].n+' peça'+(G[k].n>1?'s':''),f(G[k].v,3)+' m³']);
 if(fo>0)items.push(['Fôrma (laterais e fundo)',f(fo,1)+' m²']);
 const tr=TR.find(x=>x.id===V('concTraco'))||TR[0];let html='',txt=[];
 if(tr&&tp>0){const m=tp*1000/rendL(tr),q=x=>num(x)*m;const cim=ceil(q(tr.cim)),are=q(tr.are)*BALDE/1000,bri=q(tr.bri)*BALDE/1000;
  html=`<h4>Materiais necessários</h4><div class="mats"><div>${MAT.cim}<span>Cimento</span><b>${cim} sacos</b><small>(50 kg)</small></div><div>${MAT.are}<span>Areia</span><b>${f(are,2)} m³</b><small>${f(q(tr.are),0)} baldes</small></div><div>${MAT.bri}<span>Brita</span><b>${f(bri,2)} m³</b><small>${f(q(tr.bri),0)} baldes</small></div></div><p class="extra">Traço: ${esc(tr.nome)} · água ≈ ${f(q(tr.agu),0)} L${num(tr.cal)?' · cal '+f(q(tr.cal),1)+' sacos':''}${(tr.ads||[]).filter(a=>a&&a.n&&num(a.q)).map(a=>' · '+esc(a.n)+' '+f(q(a.q),1)+' '+esc(a.u||'')).join('')}</p>`;
  txt=['Materiais ('+strip(tr.nome)+'): cimento '+cim+' sacos, areia '+f(are,2)+' m³, brita '+f(bri,2)+' m³, água '+f(q(tr.agu),0)+' L']}
 out('concreto',{title:'Cubicagem de concreto',cap:'Volume de todas as peças',big:f(t,2),unit:'m³ de concreto',chip:`<div class="chip">Com ${f(pe,1)}% de perda: <b>${f(tp,2)} m³</b></div>`,items,html,bar:'com perda '+f(tp,2)+' m³',txt:['Total com perda: '+f(tp,2)+' m³',...txt],note:t>0?'':'Lance as medidas das peças para calcular.'});
}

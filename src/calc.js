/* ---------- calculadora comum ---------- */
const CK=[['C','fn'],['⌫','fn'],['%','fn'],['÷','op'],['7'],['8'],['9'],['×','op'],['4'],['5'],['6'],['−','op'],['1'],['2'],['3'],['+','op'],['±','fn'],['0'],[',' ],['=','eq']];
let CX='',CDONE=false;
const OPS={'+':'+','−':'-','×':'*','÷':'/'};
const showOp=x=>{let o='';for(let i=0;i<x.length;i++){const c=x[i];if('+-*/'.includes(c)&&!(c==='-'&&(i===0||'+-*/'.includes(x[i-1]))))o+=' '+{'+':'+','-':'−','*':'×','/':'÷'}[c]+' ';else o+=c==='.'?',':c}return o.trim()};
function cTok(s){const t=[];let i=0;while(i<s.length){const c=s[i];if('+-*/'.includes(c)&&!(c==='-'&&(i===0||'+-*/'.includes(s[i-1])))){t.push(c);i++;continue}
 let j=i;if(s[j]==='-')j++;while(j<s.length&&/[\d.]/.test(s[j]))j++;const n=parseFloat(s.slice(i,j));if(isNaN(n))return null;t.push(n);i=j}return t}
function cEval(s){s=s.replace(/[+\-*/]+$/,'');if(!s)return null;const t=cTok(s);if(!t||!t.length)return null;
 const out=[],st=[],P={'+':1,'-':1,'*':2,'/':2};for(const x of t){if(typeof x==='number')out.push(x);else{while(st.length&&P[st[st.length-1]]>=P[x])out.push(st.pop());st.push(x)}}while(st.length)out.push(st.pop());
 const v=[];for(const x of out){if(typeof x==='number')v.push(x);else{const b=v.pop(),a=v.pop();if(a===undefined||b===undefined)return null;v.push(x==='+'?a+b:x==='-'?a-b:x==='*'?a*b:b===0?NaN:a/b)}}
 const r=v[0];return isFinite(r)?Math.round(r*1e10)/1e10:NaN}
const cFmt=n=>isNaN(n)?'Erro':n.toLocaleString('pt-BR',{maximumFractionDigits:10});
const lastNum=()=>{let j=CX.length;while(j>0&&/[\d.]/.test(CX[j-1]))j--;if(j>0&&CX[j-1]==='-'&&(j===1||'+-*/'.includes(CX[j-2])))j--;return CX.slice(j)};
let cKey=function(k){
 if(/^\d$/.test(k)){if(CDONE){CX='';CDONE=false}const ln=lastNum();if(ln.replace(/\D/g,'').length>=15)return cRender();if(ln==='0'||ln==='-0')CX=CX.slice(0,-1);CX+=k}
 else if(k===','||k==='.'){if(CDONE){CX='';CDONE=false}const ln=lastNum();if(!ln.includes('.'))CX+=(ln===''||ln==='-'?'0':'')+'.'}
 else if(OPS[k]){CDONE=false;const o=OPS[k];if(CX===''){if(o==='-')CX='-';}else if(/[+\-*/]$/.test(CX)){if(o==='-'&&/[*/]$/.test(CX))CX+='-';else if(CX!=='-')CX=CX.replace(/[+\-*/]+$/,'')+o}else CX+=o}
 else if(k==='C'){CX='';CDONE=false}
 else if(k==='⌫'){if(CDONE){CX='';CDONE=false}else CX=CX.slice(0,-1)}
 else if(k==='±'){const ln=lastNum();if(ln&&ln!=='-'){const base=CX.slice(0,CX.length-ln.length);CX=base+(ln.startsWith('-')?ln.slice(1):'-'+ln);CDONE=false}}
 else if(k==='%'){const ln=lastNum();if(ln&&ln!=='-'){const base=CX.slice(0,CX.length-ln.length);CX=base+String(Math.round(parseFloat(ln)/100*1e10)/1e10);CDONE=false}}
 else if(k==='='){const r=cEval(CX);if(r!==null&&/[+\-*/]/.test(CX.replace(/^-/,''))){const H=Array.isArray(S.v.calcH)?S.v.calcH:[];H.unshift({e:showOp(CX.replace(/[+\-*/]+$/,'')),r:cFmt(r)});S.v.calcH=H.slice(0,20);save();if(!isNaN(r)){CX=String(r);CDONE=true}else CX=''}}
 cRender()}
let cRender=function(){const r=cEval(CX);$('#cxE').textContent=CDONE?'':(CX?showOp(CX):'');$('#cxV').textContent=CDONE?cFmt(+CX):(r===null?(CX===''?'0':showOp(CX)):cFmt(r));$('#cxV').classList.toggle('pre',!CDONE&&r!==null&&/[+\-*/]/.test(CX.replace(/^-/,'')));
 const H=Array.isArray(S.v.calcH)?S.v.calcH:[];$('#cxH').innerHTML=H.length?H.map((h,i)=>`<button data-ch="${i}"><span>${esc(h.e)} =</span><b>${esc(h.r)}</b></button>`).join('')+'<button class="clr" data-chc>Limpar histórico</button>':'<p class="empty">As contas feitas aparecem aqui. Toque numa para reaproveitar o resultado.</p>'}
const BKS='<svg viewBox="0 0 32 24" aria-hidden="true"><path d="M10 2h18a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H10L1 12z" fill="currentColor"/><path d="M15 8l8 8M23 8l-8 8" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>';
$('#keys').innerHTML=CK.map(([k,c])=>`<button class="k ${c||''}" data-ck="${k}" aria-label="${k==='⌫'?'Apagar':k==='±'?'Trocar sinal':k}">${k==='⌫'?BKS:k}</button>`).join('');
$('#keys').addEventListener('click',e=>{const b=e.target.closest('[data-ck]');if(b)cKey(b.dataset.ck)});
$('#cxH').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.chc!==undefined){S.v.calcH=[];save();cRender();return}const h=(S.v.calcH||[])[+b.dataset.ch];if(h&&h.r!=='Erro'){CX=String(num(h.r.replace(/\./g,'').replace(',','.')));CDONE=true;cRender();window.scrollTo({top:0,behavior:'smooth'})}});
$('#cxCopy').addEventListener('click',e=>copyTxt($('#cxV').textContent,e.currentTarget));
document.addEventListener('keydown',e=>{if(!$('#p-calculadora').classList.contains('on')||e.target.closest('input,textarea,select')||e.ctrlKey||e.metaKey)return;const m={'*':'×','/':'÷','-':'−','+':'+','Enter':'=','=':'=','Backspace':'⌫','Escape':'C','Delete':'C','%':'%',',':',','.':','}[e.key]||(/^\d$/.test(e.key)?e.key:null);if(m){e.preventDefault();cKey(m)}});
/* ---------- calculadora de peças (modo obra) ---------- */
let PV={},PI=0,CUR='',PDONE=false,PCONF=false;
const cMode=()=>CT[S.v.cxMode]?S.v.cxMode:'livre';
const CF=t=>FF(t).filter(x=>!x[4]&&x[0]!=='hp');
const tape=()=>Array.isArray(S.v.tape)?S.v.tape:(S.v.tape=[]);
function pReset(){PV={};PI=0;CUR='';PDONE=false}
function pCommit(){const F=CF(cMode());if(CUR!==''&&CUR!=='.'){PV[F[PI][0]]=sv(cMode(),F[PI][0],CUR);CUR='';return true}return false}
function pCalc(){const t=cMode(),F=CF(t);pCommit();const miss=F.find(([k])=>k!=='q'&&!(num(PV[k])>0));if(miss){PI=F.indexOf(miss);$('#cxE').textContent='Falta: '+miss[1].toLowerCase()+' ('+miss[2]+')';return false}
 const r={t,desc:'',...CT[t].d,...PV,q:PV.q||'1'};const W=checkPeca(t,{...PV});if(W.length&&!PCONF){PCONF=true;$('#cxE').textContent='⚠ '+W[0]+(W.length>1?' (e mais '+(W.length-1)+' aviso)':'')+' Toque = de novo para confirmar.';return false}PCONF=false;const v=CT[t].v(r);tape().push({...r,v});save();PDONE=true;renderTape();return true}
function pKey(k){const t=cMode(),F=CF(t);if(k!=='='&&k!=='+')PCONF=false;
 if(/^\d$/.test(k)||k===','||k==='.'){if(PDONE)pReset();if(k===','||k==='.'){if(!CUR.includes('.'))CUR+=(CUR===''?'0':'')+'.'}else if(CUR.replace(/\D/g,'').length<9)CUR=(CUR==='0'?'':CUR)+k}
 else if(k==='⌫'){if(PDONE){pReset()}else if(CUR)CUR=CUR.slice(0,-1);else if(PI>0){PI--;CUR=dv(t,F[PI][0],PV[F[PI][0]]).replace(',','.');delete PV[F[PI][0]]}}
 else if(k==='C')pReset();
 else if(k==='×'){if(PDONE)return;if(pCommit()&&PI<F.length-1)PI++}
 else if(k==='='){if(!PDONE)if(!pCalc())return}
 else if(k==='+'){if(!PDONE&&(CUR!==''||Object.keys(PV).length)){if(!pCalc())return}pReset()}
 else return;
 cRender()}
function pRender(){const t=cMode(),F=CF(t);const parts=F.map(([k,l,u],i)=>{const cur=i===PI&&!PDONE,v=cur?CUR:PV[k];if(i>PI&&v===undefined)return null;return (v===undefined||v===''?(cur?'▌':'—'):(cur?String(v).replace('.',','):dv(t,k,v))+(i===PI&&!PDONE?'▌':''))+' '+u}).filter(Boolean);
 if(PDONE){const it=tape()[tape().length-1];$('#cxE').textContent=CT[t].n+' '+tape().filter(x=>x.t===t).length+': '+parts.join(' × ');$('#cxV').textContent='= '+f(it.v,3)+' m³';$('#cxV').classList.remove('pre')}
 else{if(!$('#cxE').textContent.startsWith('Falta'))$('#cxE').textContent=CT[t].n+' · digite '+F[PI][1].toLowerCase()+' ('+F[PI][2]+')'+(PI<F.length-1?'  então ×':'  e =');$('#cxV').textContent=parts.join(' × ');$('#cxV').classList.add('pre')}}
function renderTape(){const L=tape(),pe=N('perdaC'),tot=L.reduce((a,x)=>a+(x.v||0),0);const cnt={};$('#cxT').innerHTML=cMode()!=='livre'&&L.length?`Total ${L.length} peça${L.length>1?'s':''}: <b>${f(tot,3)} m³</b>`:'';
 $('#cxTape').innerHTML=L.length?L.map((x,i)=>{cnt[x.t]=(cnt[x.t]||0)+1;const F=CF(x.t).filter(([k])=>k!=='q');return `<div class="li"><div><b>${CT[x.t].n} ${cnt[x.t]}</b><small>${F.map(([k,l,u])=>esc(dv(x.t,k,x[k]))+' '+u).join(' × ')}${num(x.q)>1?' · '+f(num(x.q),0)+'×':''}</small></div><b class="v">${f(x.v,3)} m³</b><span></span><button class="x" data-tx="${i}" aria-label="Excluir">×</button></div>`}).join('')+`<div class="tot"><span>Total</span><span>${f(tot,3)} m³</span></div><p class="extra">Com ${f(pe,1)}% de perda: <b>${f(tot*(1+pe/100),2)} m³</b></p><div class="acts"><button class="pri full" data-tsend>Lançar no Concreto e ver materiais</button><button class="ol full" data-tcopy>Copiar lista</button></div>`:'<p class="empty">Escolha a peça acima, digite as medidas separando com ×, e toque em =. Toque em + para a próxima peça.</p>'}
function setMode(m){S.v.cxMode=m;save();pReset();CX='';CDONE=false;$('#cxE').textContent='';cRender()}
const _cRender=cRender;cRender=function(){const m=cMode();renderUnit();$$('#cxModes button').forEach(b=>b.classList.toggle('on',b.dataset.cm===m));document.getElementById('p-calculadora').classList.toggle('obra',m!=='livre');
 $$('#keys .k').forEach(b=>b.classList.toggle('off',m!=='livre'&&['−','÷','%','±'].includes(b.dataset.ck)));
 if(m==='livre')_cRender();else pRender();renderTape();fitCx()};
const _cKey=cKey;cKey=function(k){if(cMode()==='livre')return _cKey(k);if(!k.startsWith('Falta'))$('#cxE').textContent='';pKey(k)};
$('#cxModes').innerHTML=`<button data-cm="livre">Comum</button>`+Object.entries(CT).map(([k,c])=>`<button data-cm="${k}">${c.n}</button>`).join('');
$('#cxModes').addEventListener('click',e=>{const b=e.target.closest('[data-cm]');if(b)setMode(b.dataset.cm)});
function clrArm(b,lab,fn){if(!b)return;if(b.dataset.arm!=='1'){b.dataset.arm='1';b.textContent='Confirmar?';setTimeout(()=>{b.dataset.arm='';b.textContent=lab},2500);return}b.dataset.arm='';b.textContent=lab;fn()}
$('#cxClr').addEventListener('click',e=>clrArm(e.currentTarget.querySelector('span'),'Limpar tudo',()=>{if(cMode()==='livre'){CX='';CDONE=false}else{S.v.tape=[];save();pReset()}cRender()}));
$('#cxTapeCard').addEventListener('click',e=>{const b=e.target.closest('[data-tclr2]');if(b)clrArm(b,'Limpar',()=>{S.v.tape=[];save();pReset();cRender()})});
$('#cxTape').addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset,L=tape();
 if(d.tx!==undefined){L.splice(+d.tx,1);save();renderTape()}
 else if(d.tclr!==undefined){if(b.dataset.arm!=='1'){b.dataset.arm='1';b.textContent='Confirmar';setTimeout(()=>{b.dataset.arm='';b.textContent='Limpar'},2500);return}S.v.tape=[];save();pReset();cRender()}
 else if(d.tcopy!==undefined){const cnt={};copyTxt(['LUPARO · Cubicagem rápida',...L.map(x=>{cnt[x.t]=(cnt[x.t]||0)+1;return CT[x.t].n+' '+cnt[x.t]+': '+CF(x.t).filter(([k])=>k!=='q').map(([k,l,u])=>dv(x.t,k,x[k])+' '+u).join(' × ')+(num(x.q)>1?' · '+x.q+'×':'')+' = '+f(x.v,3)+' m³'}),'Total: '+f(L.reduce((a,x)=>a+x.v,0),3)+' m³'].join('\n'),b)}
 else if(d.tsend!==undefined){L.forEach(x=>{const {v,...r}=x;S.rows.conc.push(r)});S.v.tape=[];save();pReset();calc();renderSeg();renderConc();cRender();go('concreto')}});

/* ---------- visor: diminui a fonte quando o número é grande ---------- */
function fitEl(el,min){if(!el)return;el.style.fontSize='';el.style.whiteSpace='nowrap';const w=el.clientWidth;if(!w)return;let fs=parseFloat(getComputedStyle(el).fontSize);
 if(el.scrollWidth>w){fs=Math.max(min,Math.floor(fs*w/el.scrollWidth));el.style.fontSize=fs+'px';while(el.scrollWidth>w&&fs>min){fs--;el.style.fontSize=fs+'px'}}
 if(el.scrollWidth>w)el.style.whiteSpace='normal'}
function fitCx(){fitEl($('#cxV'),20);fitEl($('#cxE'),12)}
addEventListener('resize',fitCx);addEventListener('hashchange',()=>requestAnimationFrame(fitCx));
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitCx);

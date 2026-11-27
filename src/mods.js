/* ---------- estribos ---------- */
let EST=null;
const PHI_E=['4.2','5.0','6.3','8.0'],PHI_L=['6.3','8.0','10.0','12.5','16.0','20.0','25.0'];
const EF=[['c','Comprimento','m'],['q','Quantidade','un'],['b','Largura b','cm'],['h','Altura h','cm'],['cob','Cobrimento','cm',null,1],['s','Espaçamento','cm'],['phi','φ estribo','mm',PHI_E],['g','Gancho','cm',null,1],['nl','Barras longitudinais','un'],['pl','φ longitudinal','mm',PHI_L],['anc','Ancoragem','cm',null,1]];
function estCalc(r){const C=num(r.c),Q=Math.max(0,Math.round(num(r.q))),b=num(r.b),h=num(r.h),c=num(r.cob),s=num(r.s),phi=num(r.phi),g=num(r.g),bar=N('eBarra')*100;
 const bi=b-2*c,hi=h-2*c,comp=2*bi+2*hi+2*g,n=s>0&&C>0?Math.floor((C*100-2*c)/s)+1:0,NT=n*Q,porBar=comp>0?Math.floor(bar/comp):0,bars=porBar?ceil(NT/porBar):0;
 const m=NT*comp/100,nl=Math.round(num(r.nl))*Q,pl=num(r.pl),cl=C>0?C*100+2*num(r.anc):0,ml=nl*cl/100;
 return {C,Q,bi,hi,comp,n,NT,porBar,bars,m,kg:m*kgm(phi),phi,nl,pl,cl,ml,kgl:ml*kgm(pl),bar}}
function cEstribos(){
 const L=S.rows.est,bar=N('eBarra')*100,T={},TL={};let NT=0,kg=0;const items=[],w=[];
 renderList('est');L.forEach((r,i)=>{const e=estCalc(r);
  if(!e.NT&&!e.nl)return;const nm=r.desc||('Peça '+(i+1));NT+=e.NT;kg+=e.kg+e.kgl;
  items.push([esc(nm)+' · '+e.Q+'× '+f(e.C,2)+' m',e.NT+' est. φ'+f(e.phi,1)+' × '+f(e.comp,0)+' cm']);
  const k=f(e.phi,1);(T[k]||(T[k]={m:0,kg:0,b:0,n:0})).m+=e.m;T[k].kg+=e.kg;T[k].b+=e.bars;T[k].n+=e.NT;
  if(e.nl){const q=f(e.pl,1);(TL[q]||(TL[q]={m:0,kg:0})).m+=e.ml;TL[q].kg+=e.kgl}
  if(e.bi<=0||e.hi<=0)w.push(esc(nm)+': cobrimento maior que a seção.');if(e.cl>bar)w.push(esc(nm)+': longitudinal de '+f(e.cl/100,2)+' m passa da barra, prever transpasse.')});
 let html='';
 if(Object.keys(T).length){html+='<h4>Estribos por bitola</h4>'+Object.entries(T).map(([k,t])=>`<div class="it s"><span>φ${k} · ${t.n} un · ${f(t.m,1)} m</span><b>${t.b} barras · ${f(t.kg,1)} kg</b></div>`).join('')}
 if(Object.keys(TL).length){html+='<h4>Longitudinais por bitola</h4>'+Object.entries(TL).map(([k,t])=>`<div class="it s"><span>φ${k} · ${f(t.m,1)} m</span><b>≈ ${ceil(t.m/(bar/100))} barras · ${f(t.kg,1)} kg</b></div>`).join('')+'<p class="note">Barras longitudinais estimadas pelo comprimento total: mande para o Corte para o plano exato.</p>'}
 EST={rows:L.map(estCalc).map((e,i)=>({...e,desc:L[i].desc||('Peça '+(i+1))}))};
 out('estribos',{title:'Estribos',cap:'Estribos de todas as peças',bar:f(kg,1)+' kg de aço',big:f(NT,0),unit:'un',chip:`<div class="chip">Aço total: <b>${f(kg,1)} kg</b></div>`,items,html,note:w.join(' ')||(items.length?'':'Lance as peças para calcular.'),txt:[...Object.entries(T).map(([k,t])=>'Estribos φ'+k+': '+t.n+' un, '+t.b+' barras, '+f(t.kg,1)+' kg'),...Object.entries(TL).map(([k,t])=>'Longitudinal φ'+k+': '+f(t.m,1)+' m, '+f(t.kg,1)+' kg')]});
}

/* ---------- corte ---------- */
function cCorte(){
 const bar=N('cBar')*100,sob=N('cSobra'),G={};let html='',txt=[],kgT=0,barT=0,lim=0;
 if(bar<=0){out('corte',{title:'Corte',cap:'Informe a barra comercial',big:'0',unit:'barras'});return}
 S.rows.corte.forEach(r=>{const phi=num(r.phi),c=num(r.comp),q=Math.round(num(r.q));if(phi>0&&c>0&&q>0)(G[phi.toFixed(1)]||(G[phi.toFixed(1)]=[])).push({c,q})});
 const keys=Object.keys(G).sort((a,b)=>a-b);
 for(const phi of keys){
  const pcs=[];let over=0;
  for(const it of G[phi]){if(it.c>bar){over+=it.q;continue}for(let i=0;i<it.q&&lim<20000;i++,lim++)pcs.push(it.c)}
  pcs.sort((a,b)=>b-a);
  const bins=[];
  for(const p of pcs){let best=-1,bl=Infinity;for(let i=0;i<bins.length;i++){const l=bins[i].left-p;if(l>=-1e-6&&l<bl){bl=l;best=i}}if(best<0)bins.push({left:bar-p,it:[p]});else{bins[best].left-=p;bins[best].it.push(p)}}
  const P={};bins.forEach(b=>{const k=b.it.join('|');(P[k]||(P[k]={n:0,it:b.it,left:b.left})).n++});
  const used=pcs.reduce((a,b)=>a+b,0),kg=bins.length*bar/100*kgm(+phi),ap=bins.length?used/(bins.length*bar)*100:0;
  const sobras=bins.filter(b=>b.left>=sob).length;
  kgT+=kg;barT+=bins.length;
  html+=`<h4>φ ${f(+phi,1)} mm · ${bins.length} barras · ${f(kg,1)} kg</h4><p>Aproveitamento ${f(ap,1)}% · ${sobras} sobra(s) aproveitável(is) ≥ ${f(sob,0)} cm</p>`;
  txt.push('','φ '+f(+phi,1)+' mm: '+bins.length+' barras ('+f(kg,1)+' kg)');
  Object.values(P).sort((a,b)=>b.n-a.n).forEach(p=>{const cnt={};p.it.forEach(x=>cnt[x]=(cnt[x]||0)+1);const d=Object.entries(cnt).sort((a,b)=>b[0]-a[0]).map(([c,n])=>n+'× '+f(+c,1)).join(' + ');
   html+=`<div class="pat"><b>${p.n}×</b> barra: ${d} cm · sobra ${f(p.left,0)} cm</div>`;txt.push('  '+p.n+'x barra: '+d+' cm | sobra '+f(p.left,0)+' cm')});
  if(over)html+=`<p class="warn">${over} peça(s) maior(es) que a barra: dividir com transpasse e lançar as partes.</p>`;
 }
 if(lim>=20000)html+='<p class="warn">Mais de 20 mil peças: o plano foi limitado.</p>';
 out('corte',{title:'Plano de corte',cap:'Barras de '+f(bar/100,1)+' m a comprar',big:f(barT,0),unit:'barras',items:[['Peso total do aço',f(kgT,1)+' kg',1]],html:html||'<p>Lance as peças com bitola, comprimento e quantidade.</p>',txt});
}

/* ---------- blocos ---------- */
const BT=[['est14','Estrutural 14×19×39',39,19,14,70],['est19','Estrutural 19×19×39',39,19,19,70],['est14m','Estrutural 14×19×29',29,19,14,70],['ved9','Concreto vedação 9×19×39',39,19,9,100],['ved11','Concreto vedação 11,5×19×39',39,19,11.5,100],['cer9','Cerâmico 9×19×19',19,19,9,100],['cer11','Cerâmico 11,5×14×24',24,14,11.5,100],['cer14','Cerâmico 14×19×29',29,19,14,100],['cus','Personalizado']];
$('#bTipo').innerHTML=BT.map(b=>`<option value="${b[0]}">${b[1]}</option>`).join('');
let ARG=0;
function cBlocos(){
 const ap=sum('parede'),av=sum('vao'),al=Math.max(0,ap-av),L=N('bL'),H=N('bH'),E=N('bE'),j=N('bJ'),pe=N('bP');
 const pm2=L>0&&H>0?10000/((L+j)*(H+j)):0,tot=ceil(al*pm2*(1+pe/100));
 const can=L>0?ceil(N('bCinta')*100/(L+j)*(1+pe/100)):0;
 const vm2=(1/((H+j)/100)+1/((L+j)/100))*(j/100)*(E/100)*(N('bFat')/100),arg=al*vm2*1.1;ARG=arg;
 out('blocos',{title:'Blocos',cap:'Blocos com '+f(pe,1)+'% de perda',big:f(tot,0),unit:'blocos',items:[['Área de parede',f(ap,2)+' m²'],['Vãos descontados',f(av,2)+' m²'],['Área líquida',f(al,2)+' m²'],['Blocos por m²',f(pm2,2)],['Canaletas (cintas e vergas)',f(can,0)+' un'],['Argamassa de assentamento (+10%)',f(arg,3)+' m³',1]],note:'Meio-blocos e blocos de amarração dependem da paginação: confira no projeto de alvenaria.'});
}

/* ---------- traços ---------- */
const REF_TR=[
 {id:'ref-est',nome:'Concreto estrutural (vigas, pilares, lajes)',tipo:'Concreto',uso:'Peças estruturais, aprox. 20–25 MPa',cim:1,cal:0,are:4,bri:5.5,agu:25,ads:[],ren:0},
 {id:'ref-fund',nome:'Concreto baldrame e sapata',tipo:'Concreto',uso:'Fundação rasa e baldrame',cim:1,cal:0,are:5,bri:6.5,agu:30,ads:[],ren:0},
 {id:'ref-magro',nome:'Concreto magro (lastro)',tipo:'Concreto',uso:'Lastro de fundo de vala e sapata',cim:1,cal:0,are:8,bri:11,agu:36,ads:[],ren:0},
 {id:'ref-contra',nome:'Contrapiso',tipo:'Contrapiso',uso:'Contrapiso e regularização',cim:1,cal:0,are:7,bri:0,agu:22,ads:[],ren:0},
 {id:'ref-assent',nome:'Argamassa de assentamento de blocos',tipo:'Argamassa',uso:'Alvenaria de bloco',cim:1,cal:0,are:8,bri:0,agu:30,ads:[{n:'Vedalit',q:150,u:'ml'}],ren:0},
 {id:'ref-reboco',nome:'Reboco / emboço',tipo:'Argamassa',uso:'Revestimento interno e externo',cim:1,cal:1,are:9,bri:0,agu:32,ads:[{n:'Vedalit',q:150,u:'ml'}],ren:0},
 {id:'ref-imper',nome:'Argamassa impermeável (baldrame)',tipo:'Argamassa',uso:'Respaldo e laterais do baldrame',cim:1,cal:0,are:6,bri:0,agu:24,ads:[{n:'Vedacit',q:1,u:'L'}],ren:0},
 {id:'ref-chap',nome:'Chapisco',tipo:'Chapisco',uso:'Base para reboco',cim:1,cal:0,are:6,bri:0,agu:26,ads:[],ren:0},
 {id:'ref-graute',nome:'Graute para bloco estrutural',tipo:'Graute',uso:'Pontos de graute e canaletas (brita 0)',cim:1,cal:0,are:3,bri:4,agu:24,ads:[],ren:0}
];
const rendAuto=t=>{const v=num(t.cim)*50/3.1+num(t.cal)*20/2.3+num(t.are)*BALDE*1.35/2.62+num(t.bri)*BALDE*1.42/2.7+num(t.agu);return v/(1-(num(t.bri)>0?0.02:0.05))};
const rendL=t=>num(t.ren)>0?num(t.ren):rendAuto(t);
function compTxt(t,k=1){const p=[];const s=x=>f(x*k,2);
 p.push(s(num(t.cim))+' saco(s) de cimento');if(num(t.cal))p.push(s(num(t.cal))+' saco(s) de cal');
 if(num(t.are))p.push(s(num(t.are))+' balde(s) de areia');if(num(t.bri))p.push(s(num(t.bri))+' balde(s) de brita');
 if(num(t.agu))p.push(f(num(t.agu)*k,1)+' L de água ('+f(num(t.agu)*k/BALDE,2)+' balde)');
 (t.ads||[]).forEach(a=>{if(a&&a.n&&num(a.q))p.push(a.n+' '+f(num(a.q)*k,2)+' '+(a.u||''))});return p}
let TR=REF_TR.slice(),PR=null,DB=null,trRef=true,prRef=true,canWrite=true;

/* ---------- betoneira ---------- */
function fillBetSel(){const sel=$('#betTraco'),cur=V('betTraco');sel.innerHTML=TR.map(t=>`<option value="${esc(t.id)}">${esc(t.nome)}</option>`).join('');if(TR.some(t=>t.id===cur))sel.value=cur;else{S.v.betTraco=TR[0]?TR[0].id:'';sel.value=S.v.betTraco}}
function cBet(){
 const t=TR.find(x=>x.id===V('betTraco'))||TR[0];
 if(!t){out('betoneira',{title:'Betoneira',cap:'Cadastre um traço',big:'0',unit:'betonadas'});$('#betUma').textContent='';return}
 const spb=num(V('betSpb'))||1,cs=num(t.cim)||1,k=spb/cs,vb=rendL(t)*k/1000,vol=N('betVol'),n=vb>0?ceil(vol/vb):0;
 $('#betUma').innerHTML=`<p style="margin:0 0 6px"><b>${esc(t.nome)}</b> · rende ${f(vb*1000,0)} L por betonada</p><ul style="margin:0;padding-left:20px">${compTxt(t,k).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
 const T=x=>num(x)*k*n,are=T(t.are),bri=T(t.bri);
 const items=[['Rendimento por betonada',f(vb*1000,0)+' L'],['Volume produzido',f(n*vb,2)+' m³'],['Cimento',f(T(t.cim),1)+' sacos de 50 kg',1]];
 if(num(t.cal))items.push(['Cal',f(T(t.cal),1)+' sacos de 20 kg']);
 if(are)items.push(['Areia',f(are,1)+' baldes = '+f(are*BALDE/1000,2)+' m³',1]);
 if(bri)items.push(['Brita',f(bri,1)+' baldes = '+f(bri*BALDE/1000,2)+' m³',1]);
 items.push(['Água',f(T(t.agu),0)+' L']);
 (t.ads||[]).forEach(a=>{if(a&&a.n&&num(a.q))items.push([esc(a.n),f(T(a.q),2)+' '+esc(a.u||'')])});
 out('betoneira',{title:'Betonadas · '+esc(t.nome),cap:'Betonadas para '+f(vol,2)+' m³',big:f(n,0),unit:'betonadas',items,note:'Areia e brita medidas soltas; acrescente 10–15% na compra pelo inchamento e perda no canteiro.'+(num(t.ren)>0?'':' Rendimento estimado: depois de medir na obra, informe no cadastro do traço.')});
}

/* ---------- pintura ---------- */
const REF_PR=[
 {id:'ref-sel',nome:'Seladora acrílica',un:'L',rend:8,dem:1,e1:18,e1n:'lata 18 L',e2:3.6,e2n:'galão 3,6 L',o:1},
 {id:'ref-fundo',nome:'Fundo preparador de paredes',un:'L',rend:10,dem:1,e1:18,e1n:'lata 18 L',e2:3.6,e2n:'galão 3,6 L',o:2},
 {id:'ref-mcorr',nome:'Massa corrida PVA (interna)',un:'kg',rend:2,dem:2,e1:25,e1n:'balde 25 kg',e2:5.7,e2n:'galão 5,7 kg',o:3},
 {id:'ref-macr',nome:'Massa acrílica (externa e área úmida)',un:'kg',rend:1.8,dem:2,e1:25,e1n:'balde 25 kg',e2:5.7,e2n:'galão 5,7 kg',o:4},
 {id:'ref-acr',nome:'Tinta acrílica',un:'L',rend:14,dem:2,e1:18,e1n:'lata 18 L',e2:3.6,e2n:'galão 3,6 L',o:5},
 {id:'ref-pva',nome:'Tinta látex PVA',un:'L',rend:11,dem:2,e1:18,e1n:'lata 18 L',e2:3.6,e2n:'galão 3,6 L',o:6},
 {id:'ref-graf',nome:'Grafiato acrílico',un:'kg',rend:0.5,dem:1,e1:25,e1n:'balde 25 kg',e2:0,e2n:'',o:7},
 {id:'ref-text',nome:'Textura acrílica rolada',un:'kg',rend:1,dem:1,e1:25,e1n:'balde 25 kg',e2:0,e2n:'',o:8},
 {id:'ref-esm',nome:'Esmalte sintético',un:'L',rend:12,dem:2,e1:3.6,e1n:'galão 3,6 L',e2:0.9,e2n:'quarto 0,9 L',o:9}
];
PR=REF_PR.slice();
const DEF_ON={'ref-sel':1,'ref-mcorr':1,'ref-acr':1,'p-sel':1,'p-mcorr':1,'p-acr':1};
function embs(q,p){const e1=num(p.e1),e2=num(p.e2);if(e1<=0)return '';let n1=Math.floor(q/e1+1e-9),r=q-n1*e1,n2=0;
 if(e2>0&&r>1e-9){n2=ceil(r/e2);if(n2*e2>=e1*0.9){n1++;n2=0}}else if(r>1e-9)n1++;
 const a=[];if(n1)a.push(n1+'× '+(p.e1n||e1));if(n2)a.push(n2+'× '+(p.e2n||e2));return a.join(' + ')||'—'}
function pSel(p){const s=S.v.pSel[p.id];return {on:s?!!s.on:!!DEF_ON[p.id],dem:s&&s.dem!==undefined?s.dem:String(p.dem??1)}}
function renderPList(){
 $('#pList').innerHTML=PR.map(p=>{const s=pSel(p);return `<div class="prod"><label class="ck"><input type="checkbox" data-p="${esc(p.id)}" data-pf="on" ${s.on?'checked':''}><span>${esc(p.nome)}<span class="m">${f(num(p.rend),2)} m²/${esc(p.un)} por demão · ${f(num(p.rend)*num(p.e1),0)} m² por ${esc(p.e1n||'embalagem')}</span></span></label><label>Demãos<input type="text" inputmode="decimal" data-p="${esc(p.id)}" data-pf="dem" value="${esc(s.dem)}"></label></div>`}).join('');
 $('#prList').innerHTML=prRef&&DB?'':PR.map(p=>`<div class="tr" style="margin-top:8px"><p><b>${esc(p.nome)}</b> · ${f(num(p.rend),2)} m²/${esc(p.un)}/demão · ${esc(p.e1n)}${p.e2n?' / '+esc(p.e2n):''}</p>${prRef?'':`<div class="b"><button data-pe="${esc(p.id)}">Editar</button><button data-pd="${esc(p.id)}">Excluir</button></div>`}</div>`).join('');
}
function cPintura(){
 const amb=sum('pamb'),a=Math.max(0,amb+N('pArea')),pe=N('pPerda');
 const items=[['Ambientes ('+S.rows.pamb.filter(r=>ROWS.pamb.val(r)>0).length+')',f(amb,2)+' m²']],txt=[];let any=0;if(N('pArea'))items.push(['Área extra',f(N('pArea'),2)+' m²']);
 PR.forEach(p=>{const s=pSel(p);if(!s.on)return;any=1;const d=num(s.dem),r=num(p.rend);const q=r>0?a*d/r*(1+pe/100):0;
  items.push([esc(p.nome)+' · '+f(d,1)+' demão(s)',f(q,1)+' '+esc(p.un)+' → '+esc(embs(q,p)),1])});
 out('pintura',{title:'Pintura',cap:'Área de pintura',big:f(a,1),unit:'m²',items,note:(any?'':'Marque os produtos ao lado. ')+'Rendimentos médios de referência, com '+f(pe,1)+'% de perda: confira a ficha técnica do fabricante e ajuste no cadastro.'});
}

/* ---------- piso ---------- */
function cPiso(){
 const a=sum('amb'),C=N('rPC'),L=N('rPL'),pe=N('rPerda'),ap=a*(1+pe/100),cx=N('rCx'),areaP=C*L/10000;
 const pcs=areaP>0?ceil(ap/areaP):0,cxs=cx>0?ceil(ap/cx):0,pcx=areaP>0&&cx>0?Math.round(cx/areaP):0;
 const mx=Math.max(C,L);const auto=mx<=30?5:mx<=60?7.5:10;const cons=V('rCons')!==''&&V('rCons')!=null?N('rCons'):auto;
 const tipoA=mx<=30?'AC-I (interno) ou AC-II, colagem simples':mx<=60?'AC-II / AC-III, dupla colagem':'AC-III, dupla colagem';
 const ag=a*cons*1.05,sac=N('rSaco')>0?ceil(ag/N('rSaco')):0;
 const Cm=C*10,Lm=L*10,rj=Cm>0&&Lm>0?(Cm+Lm)/(Cm*Lm)*N('rE')*N('rJ')*1.58:0,rjT=rj*a*1.1,rjE=N('rRej')>0?ceil(rjT/N('rRej')):0;
 const items=[['Área dos ambientes',f(a,2)+' m²'],['Área com perda',f(ap,2)+' m²'],['Caixas de piso',f(cxs,0)+' cx ('+pcx+' peças/cx)',1],['Peças',f(pcs,0)+' un'],['Argamassa '+f(cons,1)+' kg/m²',f(ag,0)+' kg = '+sac+' sacos',1],['Tipo indicado',tipoA],['Rejunte '+f(rj,3)+' kg/m²',f(rjT,1)+' kg = '+rjE+' emb.']];
 if(V('rNiv')){const ns=N('rNs')||30,cpp=ceil(C/ns)+ceil(L/ns),cl=ceil(pcs*cpp*1.05),cm2=areaP>0?cpp/areaP:0,cu=ceil(cm2*N('rDia'));
  items.push(['Clipes niveladores ('+cpp+'/peça)',f(cl,0)+' un ≈ '+ceil(cl/100)+' pct de 100',1],['Cunhas (reutilizáveis)',f(cu,0)+' un ≈ '+ceil(cu/50)+' pct de 50']);}
 else{const es=ceil(pcs*1.1);items.push(['Espaçador cruzeta '+f(N('rJ'),1)+' mm',f(es,0)+' un ≈ '+ceil(es/100)+' pct de 100',1])}
 out('piso',{title:'Piso',cap:'Caixas de '+f(C,0)+'×'+f(L,0)+' cm',big:f(cxs,0),unit:'caixas',items,note:(V('rNiv')?'O clipe do nivelador já marca a junta; espaçador só onde não houver clipe. ':'')+'Consumo de argamassa automático pelo tamanho da peça; informe o da embalagem para ajustar.'});
}

/* ---------- telhado ---------- */
const TT=[
 {k:'romana',galga:34,n:'Cerâmica romana',t:'pc',pm2:16,cum:3,imin:30},{k:'portuguesa',galga:34,n:'Cerâmica portuguesa',t:'pc',pm2:17,cum:3,imin:30},{k:'francesa',galga:33,n:'Cerâmica francesa',t:'pc',pm2:15,cum:3,imin:32},{k:'americana',galga:36,n:'Cerâmica americana',t:'pc',pm2:12,cum:3,imin:30},{k:'colonial',galga:37,n:'Cerâmica colonial / plan',t:'pc',pm2:25,cum:3,imin:25},{k:'concreto',galga:32,n:'Telha de concreto',t:'pc',pm2:10.5,cum:3,imin:30},
 {k:'fibro6',n:'Fibrocimento ondulada 6 mm (1,10 m)',t:'ch',util:1.05,sizes:[1.22,1.53,1.83,2.13,2.44,3.05,3.66],imin:15},{k:'fibro5',n:'Fibrocimento ondulada 5 mm (1,10 m)',t:'ch',util:1.05,sizes:[1.22,1.53,1.83,2.13,2.44],imin:15},
 {k:'metal',n:'Metálica trapezoidal / sanduíche (sob medida)',t:'mt',util:1.0,imin:5}
];
$('#tTipo').innerHTML=TT.map(t=>`<option value="${t.k}">${t.n}</option>`).join('');
function cTelhado(){
 const t=TT.find(x=>x.k===V('tTipo'))||TT[0],i=N('tInc')/100,fi=Math.sqrt(1+i*i),pe=N('tPerda'),ag=num(V('tAguas'))||2,modo=V('tModo')||'dim';
 const comp=N('tComp'),proj=N('tProj'),aProj=modo==='area'?N('tArea'):comp*proj*ag,aReal=aProj*fi,agua=proj*fi;
 const cum=V('tCum')!==''&&V('tCum')!=null?N('tCum'):(modo==='dim'&&ag===2?comp:0);
 const items=[['Área em planta',f(aProj,2)+' m²'],['Fator de inclinação',f(fi,3)],['Área real do telhado',f(aReal,2)+' m²']];if(modo==='dim')items.push(['Comprimento da água inclinada',f(agua,2)+' m']);
 let big=0,unit='telhas',html='',txt=[],note=N('tInc')<t.imin?'<span class="warn">Inclinação abaixo da mínima usual para este tipo ('+t.imin+'%). Confira com o fabricante.</span>':'Inclinação mínima usual: '+t.imin+'% (referência; confira o catálogo do fabricante).';
 if(t.t==='pc'){const pm2=V('tPm2')!==''&&V('tPm2')!=null?N('tPm2'):t.pm2;big=ceil(aReal*pm2*(1+pe/100));const cu=ceil(cum*t.cum*(1+pe/100));
  items.push(['Telhas por m²',f(pm2,1)],['Telhas com '+f(pe,1)+'% de perda',f(big,0)+' un',1],['Cumeeiras ('+t.cum+'/m · '+f(cum,2)+' m)',f(cu,0)+' un',1]);}
 else if(t.t==='ch'){const u=N('tUtil')||t.util,rec=N('tRec')/100;const rows=t.sizes.map(Lc=>{let n,sob;
   if(modo==='dim'){const along=agua<=Lc?1:ceil((agua-Lc)/(Lc-rec))+1,across=ceil(comp/u);n=along*across*ag;sob=Lc+(along-1)*(Lc-rec)-agua;return {Lc,n,sob,along,m2:n*Lc*1.1}}
   n=ceil(aReal/(u*(Lc-rec))*(1+pe/100));return {Lc,n,sob:null,m2:n*Lc*1.1}});
  const best=rows.reduce((a,b)=>b.m2<a.m2||(b.m2===a.m2&&b.n<a.n)?b:a,rows[0]);big=best.n;unit='chapas '+f(best.Lc,2)+' m';
  html=`<h4>Por tamanho de chapa</h4><div class="scroll"><table class="ttab"><thead><tr><th>Chapa</th><th>Qtd</th>${modo==='dim'?'<th>Por água</th><th>Sobra</th>':''}<th>m² comprado</th></tr></thead><tbody>${rows.map(r=>`<tr class="${r===best?'best':''}"><td>${f(r.Lc,2)} × 1,10</td><td>${r.n}</td>${modo==='dim'?`<td>${r.along} fiada(s)</td><td>${f(r.sob*100,0)} cm</td>`:''}<td>${f(r.m2,1)}</td></tr>`).join('')}</tbody></table></div><p>Destaque: menor área comprada. Sobra = quanto passa da água (vai para o beiral ou corte).</p>`;
  txt=rows.map(r=>'Chapa '+f(r.Lc,2)+' m: '+r.n+' un');const cu=ceil(cum/u);items.push(['Cumeeiras ('+f(cum,2)+' m)',f(cu,0)+' peças',1]);}
 else{const u=N('tUtil')||t.util;if(modo==='dim'){const n=ceil(comp/u)*ag;big=n;unit='telhas';items.push(['Comprimento de cada telha',f(agua,2)+' m',1],['Telhas',n+' un ('+ceil(comp/u)+' por água)',1],['Área de telha',f(n*u*agua,2)+' m²'])}
  else{big=ceil(aReal*(1+pe/100));unit='m²';items.push(['Área de telha com perda',f(big,0)+' m²',1])}
  items.push(['Cumeeira',f(cum,2)+' m',1])}
 const pm=1+N('tPerdaM')/100,vao=V('tTerca')!==''&&V('tTerca')!=null?N('tTerca'):(t.t==='pc'?1.5:t.t==='ch'?1.69:2),mad=[];
 const terc=modo==='dim'?(ceil(agua/vao)+1)*comp*ag:aReal/vao;
 if(t.t==='pc'){const gal=(V('tGalga')!==''&&V('tGalga')!=null?N('tGalga'):t.galga)/100,cb=N('tCaib')/100;
  const rip=gal>0?aReal/gal:0,cai=modo==='dim'&&cb>0?(ceil(comp/cb)+1)*agua*ag:(cb>0?aReal/cb:0);
  mad.push(['Ripas (galga '+f(gal*100,0)+' cm)',f(rip*pm,0)+' m'],['Caibros (a cada '+f(cb*100,0)+' cm)',f(cai*pm,0)+' m'],['Terças (vão '+f(vao,2)+' m)',f(terc*pm,0)+' m'],['Viga de cumeeira',f(cum*pm,1)+' m'])}
 else{mad.push(['Terças (vão '+f(vao,2)+' m)',f(terc*pm,0)+' m'],['Viga de cumeeira',f(cum*pm,1)+' m']);
  const par=t.t==='ch'?ceil(big*N('tParT')):ceil((modo==='dim'?big*(N('tUtil')||t.util)*agua:aReal)*N('tParM2'));
  mad.push(['Parafusos com vedação',par+' un ≈ '+ceil(par/100)+' cx de 100'])}
 html+='<h4>Madeiramento e fixação</h4>'+mad.map(([l,v])=>`<div class="it s"><span>${l}</span><b>${v}</b></div>`).join('')+'<p class="note">Metros lineares com '+f(N('tPerdaM'),0)+'% de perda. Seções usuais: ripa 1,5×5, caibro 5×6, terça 6×12 cm; confira no projeto do telhado.</p>';
 txt=[...txt,...mad.map(([l,v])=>l+': '+v)];
 out('telhado',{title:'Telhado · '+t.n,cap:t.n,big:f(big,0),unit,items,html,note,txt});
}


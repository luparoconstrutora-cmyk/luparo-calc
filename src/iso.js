/* ---------- desenhos isométricos ---------- */
function ISO(){
 const sh=[],pts=[],C=.866,K=4;
 const P=(x,y,z)=>{const p=[(x-y)*C*K,(x+y)*.5*K-z*K];pts.push(p);return p};
 const fx=n=>n.toFixed(1);
 const poly=(ps,fill,ex='')=>sh.push(`<polygon points="${ps.map(p=>fx(p[0])+','+fx(p[1])).join(' ')}" fill="${fill}" ${ex}/>`);
 const line=(a,b,st,w=1.4,ex='')=>sh.push(`<path d="M${fx(a[0])} ${fx(a[1])}L${fx(b[0])} ${fx(b[1])}" stroke="${st}" stroke-width="${w}" fill="none" ${ex}/>`);
 const G=['var(--gt)','var(--gl)','var(--gr)'];
 function box(x,y,z,w,d,h,f){f=f||['var(--it)','var(--il)','var(--ir)'];
  poly([P(x,y+d,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x,y+d,z+h)],f[1]);
  poly([P(x+w,y,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x+w,y,z+h)],f[2]);
  poly([P(x,y,z+h),P(x+w,y,z+h),P(x+w,y+d,z+h),P(x,y+d,z+h)],f[0])}
 function dim2(a,b,txt,side){
  line(a,b,'var(--sk)',1.1);const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,nx=-dy/L*4,ny=dx/L*4;
  line([a[0]-nx,a[1]-ny],[a[0]+nx,a[1]+ny],'var(--sk)',1.1);line([b[0]-nx,b[1]-ny],[b[0]+nx,b[1]+ny],'var(--sk)',1.1);
  const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;let ang=Math.atan2(dy,dx)*180/Math.PI;const w=txt.length*8;
  if(Math.abs(ang)>60&&Math.abs(ang)<120){const tx=side==='r'?mx+8:mx-8;sh.push(`<text x="${fx(tx)}" y="${fx(my+4)}" text-anchor="${side==='r'?'start':'end'}">${txt}</text>`);pts.push(side==='r'?[tx+w,my]:[tx-w,my]);return}
  if(ang>90)ang-=180;if(ang<-90)ang+=180;const r=ang*Math.PI/180,ox=Math.sin(r)*9,oy=-Math.cos(r)*9;const tx=mx+(side==='d'?-ox*1.6:ox),ty=my+(side==='d'?-oy*1.6:oy);
  sh.push(`<text x="${fx(tx)}" y="${fx(ty)}" text-anchor="middle" transform="rotate(${fx(ang)} ${fx(tx)} ${fx(ty)})">${txt}</text>`);pts.push([tx-w/2,ty-12],[tx+w/2,ty+12])}
 const dim=(a,b,txt,side)=>dim2(P(...a),P(...b),txt,side);
 function svg(pad=6){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;pts.forEach(([x,y])=>{x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)});
  return `<svg class="iso" viewBox="${fx(x0-pad)} ${fx(y0-pad)} ${fx(x1-x0+2*pad)} ${fx(y1-y0+2*pad)}" stroke="var(--sk)" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${sh.join('')}</svg>`}
 return {P,poly,line,box,dim,dim2,svg,G,raw:s=>sh.push(s),pts};
}
const OR='var(--or)';
function cyl(g,x,y,z0,z1,r,f){const t=g.P(x,y,z1),b=g.P(x,y,z0),rx=r*4*1.2247,ry=r*4*.7071;g.pts.push([t[0]-rx,t[1]-ry],[b[0]+rx,b[1]+ry]);
 g.raw(`<path d="M${t[0]-rx} ${t[1]}L${b[0]-rx} ${b[1]}A${rx} ${ry} 0 0 0 ${b[0]+rx} ${b[1]}L${t[0]+rx} ${t[1]}Z" fill="${f||'var(--il)'}"/><ellipse cx="${t[0]}" cy="${t[1]}" rx="${rx}" ry="${ry}" fill="var(--it)"/>`);return {t,b,rx,ry}}
const ARTF={
 laje(L){const g=ISO();[[2,2],[35,2],[2,25],[35,25]].forEach(([x,y])=>g.box(x,y,0,3,3,20));g.box(0,0,20,40,30,4);
  if(L){g.dim([0,-5,24],[40,-5,24],'Comprimento');g.dim([47,0,24],[47,30,24],'Largura','d');g.dim([-3,33,20],[-3,33,24],'Espessura','l')}return g.svg(L?8:4)},
 piso(L){const g=ISO();g.box(-4,-4,-3,48,38,3,g.G);g.box(0,0,0,40,30,2.5);
  if(L){g.dim([0,-8,2.5],[40,-8,2.5],'Comprimento');g.dim([49,0,2.5],[49,30,2.5],'Largura','d');g.dim([-6,36,0],[-6,36,2.5],'Espessura','l')}return g.svg(L?8:4)},
 viga(L){const g=ISO();g.box(1,0,0,4,6,12);g.box(55,0,0,4,6,12);g.box(0,0,12,60,6,10);for(let x=3;x<58;x+=4)g.line(g.P(x,6,12.7),g.P(x,6,21.3),OR,1.8);
  if(L){g.dim([0,-5,22],[60,-5,22],'Comprimento');g.dim([69,0,22],[69,6,22],'Largura','d');g.dim([-3,9,12],[-3,9,22],'Altura','l')}return g.svg(L?8:4)},
 baldrame(L){const g=ISO();g.box(-6,-8,-4,72,22,4,g.G);g.box(0,0,0,60,6,9);for(let x=3;x<58;x+=4)g.line(g.P(x,6,.7),g.P(x,6,8.3),OR,1.8);
  if(L){g.dim([0,-5,9],[60,-5,9],'Comprimento');g.dim([69,0,9],[69,6,9],'Largura','d');g.dim([-3,9,0],[-3,9,9],'Altura','l')}return g.svg(L?8:4)},
 sapata(L){const g=ISO();g.box(-6,-6,-3,42,42,3,g.G);g.box(0,0,0,30,30,6);
  g.poly([g.P(0,30,6),g.P(30,30,6),g.P(20,20,14),g.P(10,20,14)],'var(--il)');g.poly([g.P(30,0,6),g.P(30,30,6),g.P(20,20,14),g.P(20,10,14)],'var(--ir)');g.poly([g.P(10,10,14),g.P(20,10,14),g.P(20,20,14),g.P(10,20,14)],'var(--it)');
  g.box(11,11,14,8,8,22);g.line(g.P(13,19,15),g.P(13,19,35),OR,1.6);g.line(g.P(19,13,15),g.P(19,13,35),OR,1.6);
  if(L){g.dim([0,38,0],[30,38,0],'L','d');g.dim([38,0,0],[38,30,0],'B','d');g.dim([-3,33,0],[-3,33,6],'h base','l');g.dim([-3,33,6],[-3,33,14],'h tronco','l')}return g.svg(L?8:4)},
 pilar(L){const g=ISO();g.box(-8,-8,-2,30,30,2,g.G);g.box(0,0,0,8,14,50);for(let z=4;z<50;z+=6){g.line(g.P(.6,14,z),g.P(7.4,14,z),OR,1.6);g.line(g.P(8,.6,z),g.P(8,13.4,z),OR,1.6)}
  if(L){g.dim([0,-6,52],[8,-6,52],'a');g.dim([16,0,46],[16,14,46],'b','d');g.dim([-4,18,0],[-4,18,50],'Altura','l')}return g.svg(L?8:4)},
 broca(L){const g=ISO();g.box(-14,-14,-30,28,28,30,g.G);g.poly([g.P(-14,-14,0),g.P(14,-14,0),g.P(14,14,0),g.P(-14,14,0)],'var(--gt)');
  const c=cyl(g,0,0,-27,3,5);g.line([c.t[0]-6,c.t[1]+4],[c.b[0]-6,c.b[1]],OR,1.6,'stroke-dasharray="5 4"');g.line([c.t[0]+6,c.t[1]+4],[c.b[0]+6,c.b[1]],OR,1.6,'stroke-dasharray="5 4"');
  if(L){g.dim2([c.t[0]-c.rx,c.t[1]-c.ry-26],[c.t[0]+c.rx,c.t[1]-c.ry-26],'Diâmetro');g.dim2([c.t[0]+c.rx+60,c.t[1]+8],[c.t[0]+c.rx+60,c.b[1]],'Profundidade','r')}return g.svg(L?8:4)},
 estribos(){const g=ISO();const bars=(ys)=>ys.forEach(([y,z])=>g.line(g.P(0,y,z),g.P(44,y,z),'var(--ir)',4));bars([[0,10],[0,0]]);
  for(let x=2;x<44;x+=7)g.poly([g.P(x,0,0),g.P(x,7,0),g.P(x,7,10),g.P(x,0,10)],'none',`stroke="${OR}" stroke-width="2.6"`);bars([[7,10],[7,0]]);return g.svg(4)},
 corte(){const g=ISO();[[0,[18,34]],[6,[12,30,44]],[12,[26]]].forEach(([y,cs])=>{g.line(g.P(0,y,0),g.P(52,y,0),'var(--ir)',4.5);cs.forEach(x=>g.line(g.P(x,y,-2.5),g.P(x,y,2.5),OR,2.4))});return g.svg(4)},
 blocos(){const g=ISO();for(let r=0;r<4;r++){const o=r%2?4:0;for(let x=o-(o?8:0);x<32;x+=8){const xs=Math.max(0,x),w=Math.min(x+7.6,32)-xs;if(w>1)g.box(xs,0,r*4,w,3.6,3.8)}}
  for(let x=1;x<32;x+=8){g.poly([g.P(x+1,.8,16),g.P(x+3,.8,16),g.P(x+3,2.8,16),g.P(x+1,2.8,16)],'var(--ir)');g.poly([g.P(x+4.4,.8,16),g.P(x+6.4,.8,16),g.P(x+6.4,2.8,16),g.P(x+4.4,2.8,16)],'var(--ir)')}return g.svg(4)},
 cer(){const g=ISO();for(const y of [0,15])for(const x of [0,15])g.box(x,y,0,14,14,1.2);[[14.5,7],[14.5,22],[7,14.5],[22,14.5]].forEach(([x,y])=>g.box(x-.6,y-.6,1.2,1.2,1.2,1.4,[OR,OR,OR]));return g.svg(4)},
 telhado(){const g=ISO();g.poly([g.P(-3,-3,12.5),g.P(43,-3,12.5),g.P(43,12,24),g.P(-3,12,24)],'#c96a12');g.box(0,0,0,40,24,14);
  g.poly([g.P(40,0,14),g.P(40,24,14),g.P(40,12,24)],'var(--il)');g.poly([g.P(-3,27,12.5),g.P(43,27,12.5),g.P(43,12,24),g.P(-3,12,24)],OR);
  for(let i=1;i<4;i++){const y=27-i*3.75,z=12.5+i*2.875;g.line(g.P(-3,y,z),g.P(43,y,z),'#fff',1,'opacity=".6"')}for(let x=1;x<43;x+=4)g.line(g.P(x,27,12.5),g.P(x,12,24),'#fff',.8,'opacity=".45"');
  g.box(17,24,0,6,.4,9,['var(--ir)','var(--sk)','var(--ir)']);return g.svg(4)},
 predio(){const g=ISO();const st='stroke="#69a8ff" stroke-width="1.1"';const F=['rgba(80,150,255,.18)','rgba(80,150,255,.10)','rgba(80,150,255,.14)'];
  for(let z=0;z<=36;z+=12){g.box(0,0,z,40,24,1,F);if(z<36)for(const [x,y] of [[0,24],[20,24],[40,24],[40,0],[40,12]])g.line(g.P(x,y,z+1),g.P(x,y,z+12),'#69a8ff',1.4)}
  g.box(28,-10,0,5,5,48,F);return g.svg(4).replace('class="iso"','class="iso bld"').replace('stroke="var(--sk)"','stroke="#69a8ff"')}
};
const ART2={
 betoneira:`<svg viewBox="0 0 120 84" aria-hidden="true" stroke="var(--sk)" stroke-width="1.6" stroke-linejoin="round" fill="none"><path d="M30 66L44 44M86 70L74 44" stroke-width="3"/><circle cx="28" cy="70" r="7" fill="var(--il)"/><path d="M36 18L82 8L96 40L50 54Z" fill="${OR}"/><path d="M82 8L90 4l14 32-8 4" fill="var(--it)"/><path d="M44 26L86 17M47 37L91 28" stroke="#fff" stroke-width="1.4" opacity=".7"/><path d="M24 48H96" stroke-width="3"/></svg>`,
 tracos:`<svg viewBox="0 0 120 84" aria-hidden="true" stroke="var(--sk)" stroke-width="1.6" stroke-linejoin="round" fill="none"><path d="M60 26H102L96 76H66Z" fill="var(--il)"/><ellipse cx="81" cy="26" rx="21" ry="6" fill="var(--it)"/><path d="M60 26a21 18 0 0 1 42 0"/><path d="M14 30q22-8 40 0v42q-20 6-40 0Z" fill="#d9a35b"/><path d="M14 40q22-6 40 0" stroke="#8a5a1d"/><rect x="26" y="48" width="16" height="12" rx="2" fill="#fff" stroke="#8a5a1d"/></svg>`,
 calc:`<svg viewBox="0 0 120 84" aria-hidden="true" stroke="var(--sk)" stroke-width="1.6" stroke-linejoin="round"><rect x="34" y="4" width="52" height="76" rx="8" fill="var(--navy)"/><rect x="40" y="10" width="40" height="16" rx="3" fill="#dbe8f7"/><text x="76" y="22" text-anchor="end" font-size="11" font-weight="700" fill="#0e2147" stroke="none">0</text>${[0,1,2].map(r=>[0,1,2].map(c=>`<rect x="${41+c*13}" y="${32+r*15}" width="11" height="11" rx="2.5" fill="${r===2&&c===2?'#f58a1f':'#fff'}" stroke="none"/>`).join('')).join('')}</svg>`,
 pintura:`<svg viewBox="0 0 120 84" aria-hidden="true" stroke="var(--sk)" stroke-width="1.6" stroke-linejoin="round" fill="none"><rect x="30" y="10" width="62" height="20" rx="8" fill="${OR}"/><path d="M92 20h10v22H62v14" stroke-width="3.2"/><rect x="55" y="54" width="14" height="28" rx="5" fill="#1f56b8"/></svg>`
};
const ARTC={};const art=(k,L)=>{if(ARTF[k])return L?ARTF[k](1):(ARTC[k]||(ARTC[k]=ARTF[k](0)));return ART2[k]||''};
const MAT={
 cim:`<svg viewBox="0 0 56 40" aria-hidden="true" stroke="#8a5a1d" stroke-width="1.4"><path d="M12 8q16-5 32 0v26q-16 5-32 0Z" fill="#e0a85a"/><rect x="20" y="16" width="16" height="10" rx="2" fill="#fff"/></svg>`,
 are:`<svg viewBox="0 0 56 40" aria-hidden="true"><path d="M4 34Q28 0 52 34Z" fill="#e2bd83" stroke="#a97f3e" stroke-width="1.2"/><path d="M14 28h4M26 22h3M34 28h4M22 30h3" stroke="#a97f3e"/></svg>`,
 bri:`<svg viewBox="0 0 56 40" aria-hidden="true" stroke="#3f4752" stroke-width="1"><path d="M4 34Q28 2 52 34Z" fill="#8f98a3"/>${[[16,28],[24,22],[32,26],[40,30],[22,31],[30,16],[36,22]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.6" fill="#b7bec7"/>`).join('')}</svg>`
};
const IC={
 back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
 home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9H14v-6h-4v6H3z"/></svg>',
 hist:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
 traco:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 8h14l-2 12H7z"/><path d="M8 8a4 4 0 0 1 8 0"/></svg>',
 ok:'<svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="12" fill="#fff"/><path d="M7.5 13.5l3.6 3.6 7.4-8" fill="none" stroke="#0e2147" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 chev:'<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 2l5 5-5 5"/></svg>',
 save:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
 share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/></svg>',
 calc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h1M12 12h1M16 12h0M8 16h1M12 16h1M16 16h0" stroke-linecap="round"/></svg>'
};

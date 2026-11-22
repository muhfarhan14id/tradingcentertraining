const $=s=>document.querySelector(s),LEV=100;
// [digit,pip,spreadPips,contractSize]
const S={EURUSD:[5,1e-4,1.2,1e5],GBPUSD:[5,1e-4,1.5,1e5],USDJPY:[3,.01,1.3,1e5],AUDUSD:[5,1e-4,1.4,1e5],USDCAD:[5,1e-4,1.6,1e5],USDCHF:[5,1e-4,1.5,1e5],NZDUSD:[5,1e-4,1.8,1e5],EURGBP:[5,1e-4,1.6,1e5],EURJPY:[3,.01,1.8,1e5],GBPJPY:[3,.01,2.4,1e5],XAUUSD:[2,.01,25,100],BTCUSD:[2,1,30,1]};
const TF={M1:['1m','1d'],M5:['5m','5d'],M15:['15m','5d'],M30:['30m','1mo'],H1:['60m','1mo'],H4:['60m','3mo'],D1:['1d','1y']};
const tk=s=>s=='XAUUSD'?'GC=F':s=='BTCUSD'?'BTC-USD':s+'=X';
let P={},B=[],sym='EURUSD',tf='M15',N=100,off=0,mx=-1,my=-1,tab='t';
let A=JSON.parse(localStorage.lv||'null')||{bal:10000,pos:[],pen:[],his:[],id:1000};
const save=()=>localStorage.lv=JSON.stringify(A);
const bid=s=>P[s]-S[s][2]*S[s][1]/2,ask=s=>P[s]+S[s][2]*S[s][1]/2,f=(v,s)=>v==null?'':v.toFixed(S[s||sym][0]);
const usd=c=>c=='USD'?1:P[c+'USD']||(P['USD'+c]?1/P['USD'+c]:0);
const pl=p=>P[p.s]?(p.d?bid(p.s)-p.o:p.o-ask(p.s))*p.v*S[p.s][3]*usd(p.s.slice(3)):0;
const mg=p=>P[p.s]?p.v*S[p.s][3]*usd(p.s.slice(0,3))/LEV:0;
function acct(){const fl=A.pos.reduce((a,p)=>a+pl(p),0),m=A.pos.reduce((a,p)=>a+mg(p),0),eq=A.bal+fl;return{fl,m,eq,fr:eq-m,lv:m?eq/m*100:0}}
function close(p,px){A.bal+=pl(p);A.his.unshift({...p,c:px,pr:pl(p),ct:Date.now()});A.pos=A.pos.filter(x=>x.id!=p.id);save()}
function open(s,d,v,sl,tp,px){const p={id:++A.id,s,d,v,o:px||(d?ask(s):bid(s)),sl,tp,t:Date.now()};if(mg(p)>acct().fr)return alert('Margin tidak cukup');A.pos.push(p);save()}
function tick(){
 for(const p of [...A.pos]){const b=bid(p.s),a=ask(p.s);if(!b)continue;
  if(p.d){if(p.sl&&b<=p.sl)close(p,p.sl);else if(p.tp&&b>=p.tp)close(p,p.tp)}else{if(p.sl&&a>=p.sl)close(p,p.sl);else if(p.tp&&a<=p.tp)close(p,p.tp)}}
 for(const o of [...A.pen]){if(!P[o.s])continue;const pr=o.d?ask(o.s):bid(o.s);
  const hit=o.k=='L'?(o.d?pr<=o.px:pr>=o.px):(o.d?pr>=o.px:pr<=o.px);
  if(hit){A.pen=A.pen.filter(x=>x.id!=o.id);open(o.s,o.d,o.v,o.sl,o.tp,o.px)}}
 const a=acct();if(a.m&&a.lv<50){const w=[...A.pos].sort((x,y)=>pl(x)-pl(y))[0];close(w,w.d?bid(w.s):ask(w.s))}
 if(B.length&&P[sym]){const l=B[B.length-1],m=P[sym];l[4]=m;l[2]=Math.max(l[2],m);l[3]=Math.min(l[3],m)}
 ui()}
function ui(){
 $('#mw').innerHTML='<tr><th>Symbol<th>Bid<th>Ask</tr>'+Object.keys(S).map(k=>`<tr data-s="${k}" class="${k==sym?'on':''}"><td>${k}<td class="dn">${P[k]?f(bid(k),k):'-'}<td class="up">${P[k]?f(ask(k),k):'-'}</tr>`).join('');
 const a=acct(),c=v=>v>=0?'up':'dn';
 $('#acc').innerHTML=`<span>Balance: <b>${A.bal.toFixed(2)}</b></span><span>Equity: <b>${a.eq.toFixed(2)}</b></span><span>Margin: <b>${a.m.toFixed(2)}</b></span><span>Free Margin: <b>${a.fr.toFixed(2)}</b></span><span>Margin Level: <b>${a.m?a.lv.toFixed(1)+'%':'-'}</b></span><span>P/L: <b class="${c(a.fl)}">${a.fl.toFixed(2)}</b></span>`;
 const t=x=>new Date(x).toLocaleString('id-ID');let h='';
 if(tab=='t')h='<table><tr><th>Ticket<th>Waktu<th>Tipe<th>Lot<th>Symbol<th>Harga<th>S/L<th>T/P<th>Sekarang<th>Profit<th></tr>'+A.pos.map(p=>`<tr><td>${p.id}<td>${t(p.t)}<td>${p.d?'buy':'sell'}<td>${p.v}<td>${p.s}<td>${f(p.o,p.s)}<td>${f(p.sl,p.s)}<td>${f(p.tp,p.s)}<td>${P[p.s]?f(p.d?bid(p.s):ask(p.s),p.s):''}<td class="${c(pl(p))}">${pl(p).toFixed(2)}<td><button data-m="${p.id}">SL/TP</button><button data-x="${p.id}">✕</button></tr>`).join('')
  +A.pen.map(o=>`<tr><td>${o.id}<td><td>${o.d?'buy':'sell'} ${o.k=='L'?'limit':'stop'}<td>${o.v}<td>${o.s}<td>${f(o.px,o.s)}<td>${f(o.sl,o.s)}<td>${f(o.tp,o.s)}<td><td><td><button data-p="${o.id}">✕</button></tr>`).join('')+'</table>';
 if(tab=='h'){const w=A.his.filter(x=>x.pr>0),l=A.his.filter(x=>x.pr<0),gp=w.reduce((a,x)=>a+x.pr,0),gl=-l.reduce((a,x)=>a+x.pr,0);
  h=`<p>Trade: ${A.his.length} · Win rate: ${A.his.length?(w.length/A.his.length*100).toFixed(1):0}% · Profit factor: ${gl?(gp/gl).toFixed(2):'-'} · Net: ${(gp-gl).toFixed(2)} <button id="rs">Reset akun</button></p><table><tr><th>Ticket<th>Tipe<th>Lot<th>Symbol<th>Open<th>Close<th>Profit</tr>`+A.his.map(x=>`<tr><td>${x.id}<td>${x.d?'buy':'sell'}<td>${x.v}<td>${x.s}<td>${f(x.o,x.s)}<td>${f(x.c,x.s)}<td class="${c(x.pr)}">${x.pr.toFixed(2)}</tr>`).join('')+'</table>'}
 if(tab=='c'&&!$('#rk')){h='<p>Hitung lot: Risiko % <input id="rk" value="1" size=3> SL (pip) <input id="rp" value="20" size=3> <button id="rc">Hitung</button> <b id="rr"></b></p><p>Rumus: Lot = (Equity × Risiko%) ÷ (SL pip × nilai pip per lot). Jaga risiko 1–2% per trade, RR minimal 1:2.</p>'}
 if(tab!='c'||!$('#rk'))$('#tb').innerHTML=h;draw()}
async function load(){try{const[i,r]=TF[tf],j=await(await fetch(`/api/q?s=${tk(sym)}&i=${i}&r=${r}`)).json();let b=j.bars;
 if(tf=='H4'){const m={};b.forEach(a=>{const k=Math.floor(a[0]/14400),e=m[k];if(!e)m[k]=[k*14400,a[1],a[2],a[3],a[4]];else{e[2]=Math.max(e[2],a[2]);e[3]=Math.min(e[3],a[3]);e[4]=a[4]}});b=Object.values(m)}
 B=b;if(j.price)P[sym]=j.price;off=0;ui()}catch{}}
async function poll(){await Promise.all(Object.keys(S).map(async k=>{try{const j=await(await fetch('/api/q?p=1&s='+tk(k))).json();if(j.price)P[k]=j.price}catch{}}));tick();setTimeout(poll,4000)}
const sma=(a,n,i)=>i<n-1?null:a.slice(i-n+1,i+1).reduce((x,y)=>x+y,0)/n;
function draw(){const c=$('#cv'),d=devicePixelRatio||1,W=c.clientWidth,H=c.clientHeight;if(!W)return;c.width=W*d;c.height=H*d;const x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.fillStyle='#0b1220';x.fillRect(0,0,W,H);
 const e=B.length-off,v=B.slice(Math.max(0,e-N),e);if(!v.length)return;const s0=Math.max(0,e-N);
 let hi=Math.max(...v.map(b=>b[2])),lo=Math.min(...v.map(b=>b[3]));const pd=(hi-lo)*.08||1e-4;hi+=pd;lo-=pd;
 const y=p=>40+(hi-p)/(hi-lo)*(H-60),bw=(W-70)/N;x.font='10px sans-serif';
 for(let k=0;k<=8;k++){const p=lo+(hi-lo)*k/8;x.strokeStyle='#1a2744';x.beginPath();x.moveTo(0,y(p));x.lineTo(W-65,y(p));x.stroke();x.fillStyle='#789';x.fillText(f(p),W-62,y(p)+3)}
 v.forEach((b,k)=>{const X=k*bw+bw/2,up=b[4]>=b[1];x.strokeStyle=x.fillStyle=up?'#35c77a':'#ef5350';x.beginPath();x.moveTo(X,y(b[2]));x.lineTo(X,y(b[3]));x.stroke();x.fillRect(X-bw*.35,Math.min(y(b[1]),y(b[4])),bw*.7,Math.max(1,Math.abs(y(b[1])-y(b[4]))))});
 const cl=B.map(b=>b[4]),ln=(g,col)=>{x.strokeStyle=col;x.beginPath();let st=0;v.forEach((_,k)=>{const q=g(s0+k);if(q==null)return;st?x.lineTo(k*bw+bw/2,y(q)):x.moveTo(k*bw+bw/2,y(q));st=1});x.stroke()};
 if($('#ma').checked){ln(i=>sma(cl,20,i),'#f0c040');ln(i=>sma(cl,50,i),'#4aa3ff')}
 if($('#bb').checked){const sd=i=>{const m=sma(cl,20,i);return m==null?null:Math.sqrt(cl.slice(i-19,i+1).reduce((a,z)=>a+(z-m)**2,0)/20)};ln(i=>{const m=sma(cl,20,i);return m==null?null:m+2*sd(i)},'#a66');ln(i=>{const m=sma(cl,20,i);return m==null?null:m-2*sd(i)},'#a66')}
 const hl=(p,col,t,dash)=>{if(!p||p<lo||p>hi)return;x.strokeStyle=x.fillStyle=col;x.setLineDash(dash?[5,4]:[]);x.beginPath();x.moveTo(0,y(p));x.lineTo(W-65,y(p));x.stroke();x.setLineDash([]);x.fillText(t,70,y(p)-3)};
 if(P[sym]){hl(bid(sym),'#ef5350','');hl(ask(sym),'#4aa3ff','');x.fillStyle='#ef5350';x.fillRect(W-65,y(bid(sym))-8,65,16);x.fillStyle='#fff';x.fillText(f(bid(sym)),W-62,y(bid(sym))+3)}
 A.pos.filter(p=>p.s==sym).forEach(p=>{hl(p.o,p.d?'#35c77a':'#ef5350',`#${p.id} ${p.d?'buy':'sell'} ${p.v}`);hl(p.sl,'#ef5350','SL',1);hl(p.tp,'#35c77a','TP',1)});
 x.fillStyle='#dbe4f3';x.font='bold 13px sans-serif';x.fillText(`${sym}, ${tf}`,150,24);
 if(mx>0&&mx<W-65){x.strokeStyle='#567';x.setLineDash([3,3]);x.beginPath();x.moveTo(mx,0);x.lineTo(mx,H);x.moveTo(0,my);x.lineTo(W-65,my);x.stroke();x.setLineDash([]);x.fillStyle='#567';x.fillRect(W-65,my-8,65,16);x.fillStyle='#fff';x.font='10px sans-serif';x.fillText(f(hi-(my-40)/(H-60)*(hi-lo)),W-62,my+3)}}
// events
$('#tfs').innerHTML=Object.keys(TF).map(k=>`<button data-f="${k}" class="${k==tf?'on':''}">${k}</button>`).join('');
$('#os').innerHTML=Object.keys(S).map(k=>`<option>${k}`).join('');
document.addEventListener('click',e=>{const t=e.target,g=k=>t.dataset[k];
 if(g('f')){tf=g('f');document.querySelectorAll('#tfs button').forEach(b=>b.classList.toggle('on',b==t));load()}
 const r=t.closest('#mw tr');if(r&&r.dataset.s){sym=r.dataset.s;load()}
 if(g('t')){tab=g('t');document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a==t));$('#tb').innerHTML='';ui()}
 if(g('x')){const p=A.pos.find(z=>z.id==g('x'));close(p,p.d?bid(p.s):ask(p.s));ui()}
 if(g('p')){A.pen=A.pen.filter(z=>z.id!=g('p'));save();ui()}
 if(g('m')){const p=A.pos.find(z=>z.id==g('m')),a=prompt('Stop Loss (0 = hapus)',p.sl||0);if(a==null)return;const b=prompt('Take Profit (0 = hapus)',p.tp||0);p.sl=+a||0;p.tp=+b||0;save();ui()}
 if(t.id=='rs'&&confirm('Reset akun ke $10,000?')){A={bal:10000,pos:[],pen:[],his:[],id:1000};save();ui()}
 if(t.id=='rc'){const a=acct(),sp=+$('#rp').value,pv=S[sym][1]*S[sym][3]*usd(sym.slice(3));$('#rr').textContent=sp>0&&pv?'Lot ≈ '+(a.eq*$('#rk').value/100/(sp*pv)).toFixed(2):''}
 if(t.id=='qs'||t.id=='qb'){if(P[sym])open(sym,t.id=='qb'?1:0,+$('#qv').value,0,0);ui()}
 if(t.id=='no'){$('#os').value=sym;$('#dl').showModal()}if(t.id=='dx')$('#dl').close();
 if(t.id=='ds'||t.id=='db'){const s=$('#os').value,d=t.id=='db'?1:0,v=+$('#ov').value,sl=+$('#osl').value||0,tp=+$('#otp').value||0,k=$('#ok').value;
  if(!(v>0)||!P[s])return;if(k=='M')open(s,d,v,sl,tp);else if(+$('#op').value){A.pen.push({id:++A.id,s,d,v,k,px:+$('#op').value,sl,tp});save()}$('#dl').close();ui()}});
const cv=$('#cv');let dr=null;
cv.onwheel=e=>{e.preventDefault();N=Math.max(20,Math.min(400,N+(e.deltaY>0?10:-10)));draw()};
cv.onmousedown=e=>dr=[e.clientX,off];addEventListener('mouseup',()=>dr=null);
cv.onmousemove=e=>{const r=cv.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;if(dr)off=Math.max(0,Math.min(B.length-20,dr[1]+Math.round((e.clientX-dr[0])/((r.width-70)/N))));draw()};
cv.onmouseleave=()=>{mx=-1;draw()};addEventListener('resize',draw);['#ma','#bb'].forEach(s=>$(s).onchange=draw);
load();poll();setInterval(load,20000);ui();

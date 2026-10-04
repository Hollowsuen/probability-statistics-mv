// Deterministic, object-led probability scenes. All drawing stays in the scene window.
const TAU = Math.PI * 2;
const JOINT = [[12,8,3,2],[6,14,8,2],[2,7,13,3],[1,2,6,11]];
const PMF = [.1,.2,.4,.2,.1];
const PDF = x => Math.exp(-x*x/2)/Math.sqrt(2*Math.PI);
const clamp = (x,a=0,b=1) => Math.max(a,Math.min(b,x));
const smooth = x => {x=clamp(x); return x*x*(3-2*x)};
const mix = (a,b,t) => a+(b-a)*t;
const fract = x => x-Math.floor(x);
function rng(seed){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return(s+.5)/4294967296}}
function gauss(r){return Math.sqrt(-2*Math.log(r()))*Math.cos(TAU*r())}
const r0=rng(81726);
const NORMALS=Array.from({length:1200},()=>gauss(r0));
const NORMAL_HIST=Array(24).fill(0);
for(const z of NORMALS){const b=Math.floor((z+4)/8*24);if(b>=0&&b<24)NORMAL_HIST[b]++}
const COINS=[];
for(let k=0;k<3;k++){const r=rng(4021+k*731),a=[];let sum=0;for(let n=1;n<=4000;n++){sum+=r()<.5?1:0;a.push(sum/n)}COINS.push(a)}
const CLT_NS=[1,2,4,16,36];
const CLT_HIST=CLT_NS.map(n=>{const r=rng(1843+n),bins=Array(36).fill(0);for(let i=0;i<5000;i++){let s=0;for(let j=0;j<n;j++)s-=Math.log(r());const z=(s-n)/Math.sqrt(n),b=Math.floor((z+4.5)/9*36);if(b>=0&&b<36)bins[b]++}return bins});
const mcR=rng(940182);
const MC=[];let inside=0;
for(let i=0;i<5000;i++){const x=mcR()*2-1,y=mcR()*2-1,ok=x*x+y*y<=1;inside+=ok?1:0;MC.push({x,y,ok,inside})}
function alpha(c,a,fn){c.save();c.globalAlpha*=clamp(a);fn();c.restore()}
function dash(c,h,x1,y1,x2,y2,color,width=2){c.save();c.setLineDash([8,9]);h.line(c,x1,y1,x2,y2,color,width);c.restore()}
function bar(c,h,x,y,w,height,color,opacity=1){alpha(c,opacity,()=>h.rect(c,x,y-height,w,height,color,null,Math.min(7,w/4)))}
function glowDot(c,h,x,y,r,color){h.circle(c,x,y,r*2.2,color+'14');h.circle(c,x,y,r,color)}
function grid(c,h,x,y,w,hh,nx=5,ny=4){for(let i=1;i<nx;i++)h.line(c,x+i*w/nx,y,x+i*w/nx,y-hh,h.C.muted,1,.1);for(let j=1;j<=ny;j++)h.line(c,x,y-j*hh/ny,x+w,y-j*hh/ny,h.C.muted,1,.12)}
function stageLabel(c,h,t,labels,x=960,y=807){const k=t<5?0:t<11?1:2;h.text(c,labels[k],x,y,26,h.C.muted,'center')}
function block(c,h,x,y,w,d,height,color){
  const gold=color===h.C.gold;
  h.path(c,[[x,y],[x+d*.8,y+d*.45],[x+d*.8,y+d*.45-height],[x,y-height]],color+'aa',1,true,gold?'#967740':'#237c8d');
  h.path(c,[[x+d*.8,y+d*.45],[x+w+d*.8,y],[x+w+d*.8,y-height],[x+d*.8,y+d*.45-height]],color+'88',1,true,gold?'#6c502e':'#155469');
  h.path(c,[[x,y-height],[x+w,y-d*.45-height],[x+w+d*.8,y-height],[x+d*.8,y+d*.45-height]],color,1,true,gold?'#f8c979':'#54c9df');
}

function uniform(c,t,h){
  const {C}=h,p=smooth(t/4),sel=smooth((t-5)/3),end=smooth((t-11)/3);
  // A railway platform makes the interval a literal waiting time.
  h.line(c,145,680,800,680,C.muted,5);h.line(c,145,707,800,707,C.muted,3);
  for(let i=0;i<20;i++)h.line(c,150+i*33,680,142+i*33,707,C.muted,3,.4);
  h.rect(c,155,360,485,19,C.cyan+'bb',null,4);h.line(c,185,379,185,647,C.muted,8);h.line(c,615,379,615,647,C.muted,8);
  h.text(c,'每 10 分钟一班',400,333,31,C.text,'center');
  for(let i=0;i<6;i++)h.person(c,230+i*62,643,2.4,i%2?C.gold:C.cyan);
  const trainX=mix(840,245,smooth(t/5))+Math.sin(t*.6)*8;
  alpha(c,p,()=>{h.rect(c,trainX,493,370,162,'#15344a',C.cyan,24,3);for(let j=0;j<5;j++)h.rect(c,trainX+20+j*68,518,51,54,'#6bd7ee44',C.cyan+'88',6);h.rect(c,trainX+285,586,52,63,C.cyan+'22',C.cyan,5);for(let j=0;j<3;j++)h.circle(c,trainX+65+j*117,661,15,C.bg,C.muted,4);h.text(c,'PROBABILITY EXPRESS',trainX+185,614,17,C.cyan,'center','mono')});
  h.text(c,'随机到站 · 等待 W 分钟',410,758,27,C.muted,'center');
  const x=985,y=735,w=735,hh=295;
  grid(c,h,x,y,w,hh,5,3);h.axes(c,x,y,w,hh,{xLabel:'等待 / 分钟',yLabel:'概率密度',xTicks:[[0,'0'],[.2,'2'],[.5,'5'],[1,'10']],yTicks:[[1,'0.1']]});
  h.rect(c,x,y-hh,w*p,hh,C.cyan+'18',null,0);
  h.line(c,x,y-hh,x+w*p,y-hh,C.cyan,5);
  alpha(c,sel,()=>{h.rect(c,x+w*.2,y-hh,w*.3,hh,C.gold+'44',null,0);h.line(c,x+w*.2,y-hh,x+w*.5,y-hh,C.gold,6);dash(c,h,x+w*.2,y,x+w*.2,y-hh,C.gold);dash(c,h,x+w*.5,y,x+w*.5,y-hh,C.gold)});
  const cursor=fract(t/6);h.circle(c,x+w*cursor,y-hh,8,C.text);h.line(c,x+w*cursor,y-hh,x+w*cursor,y,C.text,1,.22);
  h.text(c,'任意等长区间，机会相同',1355,332,28,C.cyan,'center');
  alpha(c,end,()=>{h.text(c,'30%',1242,582,69,C.gold,'center','mono',600);h.text(c,'等 2–5 分钟的概率',1370,649,27,C.gold,'center')});
}

function normal(c,t,h){
  const {C}=h,p=smooth(t/4),hist=smooth((t-4)/6),band=smooth((t-11)/3);
  h.text(c,'精密加工，也有微小误差',467,318,28,C.muted,'center');
  // Machined disk and measuring caliper.
  h.circle(c,440,533,136,'#182b3e',C.blue,3);h.circle(c,440,533,107,'#09192a',C.blue+'66',3);h.circle(c,440,533,42,'#25425b',C.cyan,3);
  for(let j=0;j<8;j++){const a=j*TAU/8+.06*Math.sin(t*.7);h.circle(c,440+82*Math.cos(a),533+82*Math.sin(a),10,C.bg,C.muted,2)}
  h.rect(c,258,367,358,20,C.muted,null,3);h.rect(c,265,365,22,253,C.text,null,3);h.rect(c,595,365,22,253,C.text,null,3);h.rect(c,286,580,38,18,C.text,null,2);h.rect(c,558,580,38,18,C.text,null,2);
  for(let j=0;j<32;j++)h.line(c,292+j*9,368,292+j*9,j%5?378:385,C.bg,1);
  h.rect(c,360,346,178,62,'#0a2735',C.cyan,8);h.text(c,(20+.2*NORMALS[Math.floor(t*2)%1200]).toFixed(3)+' mm',449,386,26,C.cyan,'center','mono');
  h.arrow(c,310,695,570,695,C.gold,2);h.text(c,'标称直径 20 mm',440,743,29,C.text,'center');
  const x=895,y=749,w=858,hh=336;
  grid(c,h,x,y,w,hh,8,4);h.axes(c,x,y,w,hh,{xLabel:'误差 / mm',yLabel:'密度 / mm⁻¹（模拟）',xTicks:[[.125,'−0.6'],[.25,'−0.4'],[.5,'0'],[.75,'0.4'],[.875,'0.6']]});
  for(let i=0;i<24;i++){const v=NORMAL_HIST[i]/1200/(1.6/24);bar(c,h,x+i*w/24+2,y,w/24-4,v/2.25*hh*hist,C.blue+'77')}
  alpha(c,band,()=>{h.rect(c,x+w*3/8,y-hh,w/4,hh,C.gold+'12',null,0);dash(c,h,x+w*3/8,y,x+w*3/8,y-hh,C.gold,2);dash(c,h,x+w*5/8,y,x+w*5/8,y-hh,C.gold,2);h.label(c,'±1σ 内约 68.27%',x+w/2,387,C.gold)});
  h.curve(c,error=>PDF(error/.2)/.2,x,y,w,hh,-.8,.8,2.25,C.cyan,p);
  const z=Math.sin(t*.8)*2.6;glowDot(c,h,x+(z+4)/8*w,y-(PDF(z)/.2)/2.25*hh,7,C.text);
  h.text(c,'中心最常见 · 两侧渐稀少',1323,315,30,C.cyan,'center');
}

function cdf(c,t,h){
  const {C}=h,threshold=mix(.2,5.7,smooth(t/16)),n=Math.floor(threshold),sum=PMF.slice(0,Math.max(0,Math.min(5,n))).reduce((a,b)=>a+b,0);
  const x=175,y=713,w=815,hh=285;
  h.text(c,'把不超过 x 的概率收集起来',578,315,30,C.text,'center');
  h.axes(c,x,y,w,hh,{xLabel:'取值',yLabel:'单点概率',xTicks:PMF.map((_,i)=>[(i+.5)/5,String(i+1)]),yTicks:[[.5,'0.2'],[1,'0.4']]});
  for(let i=0;i<5;i++){const bx=x+(i+.1)*w/5,bw=.8*w/5,on=i+1<=threshold;bar(c,h,bx,y,bw,PMF[i]/.4*hh,on?C.gold:C.cyan+'55');h.text(c,`${Math.round(PMF[i]*100)}%`,bx+bw/2,y-PMF[i]/.4*hh-17,25,on?C.gold:C.muted,'center');if(on){const phase=fract(t*.65+i*.2);glowDot(c,h,mix(bx+bw/2,1410,phase),mix(590,472,phase)-Math.sin(phase*Math.PI)*110,5,C.gold)}}
  const cursor=x+(threshold-.5)/5*w;h.line(c,clamp(cursor,x,x+w),384,clamp(cursor,x,x+w),738,C.text,2,.8);h.label(c,'x = '+threshold.toFixed(1),clamp(cursor,x+50,x+w-50),369,C.text);
  // A transparent tank's fill level is the cumulative probability.
  const tx=1210,ty=714,tw=415,th=352;
  h.rect(c,tx,ty-th,tw,th,C.blue+'06',C.blue+'77',14,3);
  const level=sum*th;
  if(level>0){const pts=[[tx+3,ty-3],[tx+tw-3,ty-3],[tx+tw-3,ty-level]];for(let j=40;j>=0;j--)pts.push([tx+3+(tw-6)*j/40,ty-level+Math.sin(j*.4+t*2)*4]);h.path(c,pts,null,0,true,C.cyan+'44');for(let j=0;j<9;j++){const bx=tx+34+j*43,by=ty-fract(t*.12+j*.21)*level;h.circle(c,bx,by,4,null,C.cyan+'66',1)}}
  for(let i=0;i<=4;i++){const yy=ty-th*i/4;h.line(c,tx+tw+9,yy,tx+tw+20,yy,C.muted,2);h.text(c,`${i*25}%`,tx+tw+33,yy+8,24,C.muted)}
  h.text(c,`${Math.round(sum*100)}%`,tx+tw/2,565,80,C.text,'center','mono',600);h.text(c,'已累积的概率',tx+tw/2,617,28,C.cyan,'center');
  stageLabel(c,h,t,['先看每一份概率','阈值向右，概率只会累加','分布函数从 0 走到 1']);
}

function transform(c,t,h){
  const {C}=h,p=smooth(t/4),transport=smooth((t-4)/5),hist=smooth((t-10)/5);
  const lx=175,rw=780,top=404,bottom=703;
  h.text(c,'均匀取样的 X',lx,321,31,C.cyan);h.text(c,'平方之后的 Y',lx,bottom+76,31,C.gold);
  h.line(c,lx,top,lx+rw,top,C.cyan,3);h.line(c,lx,bottom,lx+rw,bottom,C.gold,3);
  for(let i=0;i<=10;i++){const u=i/10;h.line(c,lx+u*rw,top-8,lx+u*rw,top+8,C.cyan,2);h.line(c,lx+u*rw,bottom-8,lx+u*rw,bottom+8,C.gold,2);if(i%2===0){h.text(c,u.toFixed(1),lx+u*rw,top-20,23,C.muted,'center');h.text(c,u.toFixed(1),lx+u*rw,bottom+38,23,C.muted,'center')}}
  for(let i=0;i<=24;i++){const u=i/24,xx=lx+u*rw,yy=lx+u*u*rw;alpha(c,p,()=>{h.path(c,[[xx,top+13],[xx,top+108],[yy,bottom-108],[yy,bottom-13]],C.muted+'33',1);const q=clamp(transport+Math.sin(t*.8+i*.3)*.07);glowDot(c,h,mix(xx,yy,smooth(q)),mix(top,bottom,q),6,mix(0,1,q)>.5?C.gold:C.cyan);h.circle(c,xx,top,5,C.cyan);h.circle(c,yy,bottom,5,C.gold)})}
  h.arrow(c,575,501,575,615,C.text,3);h.text(c,'平方',615,571,30,C.text);
  const x=1135,y=709,w=582,hh=330;
  h.text(c,'相同宽度，装入不同概率',1423,322,29,C.gold,'center');
  h.axes(c,x,y,w,hh,{xLabel:'y',yLabel:'区间概率',xTicks:[[0,'0'],[.25,'0.25'],[.5,'0.5'],[1,'1']],yTicks:[[.5,'0.2'],[1,'0.4']]});
  for(let i=0;i<10;i++){const prob=Math.sqrt((i+1)/10)-Math.sqrt(i/10);bar(c,h,x+i*w/10+3,y,w/10-6,prob/.4*hh*hist,i<2?C.gold:C.gold+'77')}
  alpha(c,hist,()=>{h.text(c,'小数平方后更靠近 0',1423,787,28,C.muted,'center')});
}

function joint(c,t,h){
  const {C}=h,p=smooth(t/4),rise=smooth((t-5)/6),cell=Math.floor(t*1.3)%16;
  h.text(c,'一天的温度档 × 冷饮销量档',485,290,27,C.text,'center');
  const x=245,y=720,s=91;
  for(let i=0;i<4;i++)for(let j=0;j<4;j++){const v=JOINT[i][j],xx=x+j*s,yy=y-(i+1)*s;alpha(c,p,()=>{h.rect(c,xx,yy,s-6,s-6,`rgba(84,217,238,${.07+v/14*.6})`,cell===i*4+j?C.gold:C.cyan+'33',7,cell===i*4+j?3:1);h.text(c,v+'%',xx+(s-6)/2,yy+51,29,cell===i*4+j?C.gold:C.text,'center','mono')})}
  h.axes(c,x-15,y+3,s*4+5,s*4+5,{xLabel:'X · 温度档',yLabel:'Y · 销量档',xTicks:[0,1,2,3].map(i=>[(i+.5)/4,String(i+1)]),yTicks:[0,1,2,3].map(i=>[(i+.5)/4,String(i+1)])});
  h.arrow(c,770,552,947,552,C.muted,3);h.text(c,'概率成为高度',858,603,26,C.muted,'center');
  // Isometric extrusion of exactly the same sixteen cell probabilities.
  for(let j=3;j>=0;j--)for(let i=0;i<4;i++){const xx=1070+j*92+i*74,yy=653-j*39+i*41,v=JOINT[i][j],col=cell===i*4+j?C.gold:C.cyan;block(c,h,xx,yy,71,68,v*13*rise,col);if(cell===i*4+j&&t>11)h.text(c,v+'%',xx+46,yy-v*13*rise-36,26,col,'center','mono')}
  h.text(c,'联合概率 · 总和 100%',1400,316,31,C.cyan,'center');
  stageLabel(c,h,t,['每个格子，对应一对同时发生的结果','二维位置说明“是什么”，高度说明“多常见”','这是一张联合分布表（示例）']);
}

function marginal(c,t,h){
  const {C}=h,q=smooth((t-9)/4),sel=2,colSum=JOINT.reduce((s,row)=>s+row[sel],0);
  const changing=q>0&&q<1;
  const x=203,y=713,s=94;
  h.text(c,q<.5?'合并一整行，得到 Y 的概率':'已知 X = 3，重新分配概率',490,300,31,C.text,'center');
  for(let i=0;i<4;i++)for(let j=0;j<4;j++){const v=JOINT[i][j],xx=x+j*s,yy=y-(i+1)*s,on=j===sel;h.rect(c,xx,yy,s-7,s-7,`rgba(84,217,238,${(.08+v/14*.5)*(on?1:1-.8*q)})`,on&&q>.1?C.gold:C.cyan+'33',7,on?2:1);h.text(c,v+'%',xx+(s-7)/2,yy+52,29,on&&q>.1?C.gold:C.text,'center','mono');if(t<9){const ph=fract(t*.3+i*.13+j*.07);glowDot(c,h,mix(xx+43,886,ph),yy+43,3,C.cyan)}}
  h.axes(c,x-11,y+4,s*4,s*4,{xLabel:'X',yLabel:'Y',xTicks:[0,1,2,3].map(i=>[(i+.5)/4,String(i+1)]),yTicks:[0,1,2,3].map(i=>[(i+.5)/4,String(i+1)])});
  alpha(c,q,()=>{h.label(c,'这一列合计 30%',x+s*2.5,790,C.gold)});
  const bx=1030,by=713,bw=626,bh=345;
  h.axes(c,bx,by,bw,bh,{xLabel:'Y 的取值',yLabel:changing?'概率（变换过程）':q<.5?'边缘概率':'条件概率',xTicks:[0,1,2,3].map(i=>[(i+.5)/4,String(i+1)]),yTicks:[[.5,'25%'],[1,'50%']]});
  for(let i=0;i<4;i++){const mar=JOINT[i].reduce((a,b)=>a+b,0)/100,con=JOINT[i][sel]/colSum,v=mix(mar,con,q),xx=bx+(i+.13)*bw/4;bar(c,h,xx,by,bw*.185,v/.5*bh,q>.5?C.gold:C.cyan);alpha(c,changing?0:1,()=>h.text(c,(v*100).toFixed(q>.5?1:0)+'%',xx+bw*.0925,by-v/.5*bh-17,29,q>.5?C.gold:C.cyan,'center','mono'))}
  h.arrow(c,683,531,911,531,q>.5?C.gold:C.cyan,3);
  h.text(c,q<.5?'对 X 求和':'除以 30%',797,587,31,q>.5?C.gold:C.cyan,'center');
  h.text(c,q<.5?'只关心一个变量':'条件改变，参照范围也改变',1339,316,31,q>.5?C.gold:C.cyan,'center');
}

function dependence(c,t,h){
  const {C}=h,q=smooth((t-6)/5),show=smooth(t/4),x=220,y=719,w=1050,hh=362;
  h.axes(c,x,y,w,hh,{xLabel:'X',yLabel:'Y',xTicks:[[0,'−2'],[.25,'−1'],[.5,'0'],[.75,'1'],[1,'2']],yTicks:[[0,'−2'],[1/3,'0'],[2/3,'2'],[1,'4']]});grid(c,h,x,y,w,hh,4,3);
  dash(c,h,x+w/2,y,x+w/2,y-hh,C.muted,1);dash(c,h,x,y-hh/3,x+w,y-hh/3,C.muted,1);
  const mapY=v=>y-(v+2)/6*hh;
  let sx=0,sy=0,sxx=0,syy=0,sxy=0;
  for(let i=0;i<140;i++){const u=(i%70+.5)/70*2,xx=i<70?-u:u,zz=NORMALS[i]*.26,linear=.75*xx+zz,para=xx*xx,yy=mix(linear,para,q);sx+=xx;sy+=yy;sxx+=xx*xx;syy+=yy*yy;sxy+=xx*yy;if(i<140*show)glowDot(c,h,x+(xx+2)/4*w,mapY(yy),4.5,q>.5?C.gold:C.cyan)}
  const rho=(sxy-sx*sy/140)/Math.sqrt((sxx-sx*sx/140)*(syy-sy*sy/140));
  const a=fract(t*.22)*2,yp=a*a;
  alpha(c,q,()=>{dash(c,h,x+(-a+2)/4*w,mapY(yp),x+(a+2)/4*w,mapY(yp),C.gold,2);h.circle(c,x+(-a+2)/4*w,mapY(yp),11,null,C.gold,2);h.circle(c,x+(a+2)/4*w,mapY(yp),11,null,C.gold,2)});
  h.text(c,q===0?'同升同降：正相关':q<1?'依赖关系，从直线变成曲线':'对称抛物线：相关系数为 0',744,318,31,q<.5?C.cyan:C.gold,'center');
  h.text(c,q===0?'明显的线性方向':q<1?'线性方向逐渐减弱':'没有线性方向',1533,439,32,C.text,'center');
  h.text(c,q===0?'↗':q<1?'r ≈ '+rho.toFixed(2):'ρ = 0',1533,560,q===0?115:q<1?52:69,q<.5?C.cyan:C.gold,'center','mono',600);
  h.text(c,q===0?'X 增加时，Y 往往增加':q<1?'当前散点的样本相关系数':'知道 X，仍能确定 Y',1533,646,28,C.muted,'center');
  alpha(c,smooth((t-11)/2),()=>h.label(c,'不相关 ≠ 独立',1533,731,C.red));
  stageLabel(c,h,t,['散点的方向，显示共同变化','把直线依赖逐渐弯曲','X 关于 0 对称且 Y 是 X² 的函数；依赖仍在']);
}

function expectation(c,t,h){
  const {C}=h,p=smooth(t/5),tilt=.11*Math.exp(-t*.5)*Math.cos(t*1.6),x=247,y=570,step=219,cx=x+2*step;
  h.text(c,'让每个取值承载它的概率重量',824,321,32,C.text,'center');
  h.path(c,[[cx-45,742],[cx+45,742],[cx,584]],C.muted,3,true,'#1a3048');h.circle(c,cx,579,13,C.gold);
  c.save();c.translate(cx,y);c.rotate(tilt);h.line(c,-2.4*step,0,2.4*step,0,C.text,10);
  for(let i=0;i<5;i++){const xx=(i-2)*step;h.line(c,xx,-8,xx,-91,C.muted,3);h.path(c,[[xx-73,-60],[xx-55,-25],[xx+55,-25],[xx+73,-60]],C.cyan,2,true,C.cyan+'19');const n=Math.round(PMF[i]*50*p);for(let k=0;k<n;k++){const cols=5,row=Math.floor(k/cols),col=k%cols;h.circle(c,xx+(col-2)*20,-42-row*21,9,i===2?C.gold:C.cyan)}}
  c.restore();
  for(let i=0;i<5;i++){h.text(c,String(i+1),x+i*step,641,38,C.text,'center','mono');h.text(c,`${PMF[i]*100}%`,x+i*step,689,25,C.muted,'center','mono')}
  h.text(c,'平衡支点',cx,791,27,C.muted,'center');
  const a=smooth((t-7)/4);alpha(c,a,()=>{h.text(c,'3',1525,557,160,C.gold,'center','mono',600);h.text(c,'概率加权的中心',1525,644,31,C.text,'center');h.label(c,'期望',1525,713,C.gold)});
  // A steady pulse through the beam preserves motion once balanced.
  const moving=x-80+fract(t*.15)*(step*4+160);glowDot(c,h,moving,y-7,4,C.gold);
}

function variance(c,t,h){
  const {C}=h,p=smooth(t/12),centers=[493,1426],cy=542,scale=50;
  for(let j=0;j<2;j++){const cx=centers[j],col=j?C.gold:C.cyan;
    for(let r=4;r>=1;r--)h.circle(c,cx,cy,r*49,r%2?'#13233a':'#0b172a',col+'55',2);
    h.line(c,cx-217,cy,cx+217,cy,C.muted,1,.5);h.line(c,cx,cy-217,cx,cy+217,C.muted,1,.5);
    h.circle(c,cx,cy,10,C.red);h.text(c,j?'散布更宽':'散布更集中',cx,302,32,col,'center');
    for(let i=0;i<90*p;i++){const pair=Math.floor(i/2),sg=i%2?1:-1,s=j?2:.5,dx=sg*NORMALS[pair*2]*s*scale,dy=sg*NORMALS[pair*2+1]*s*scale;if(Math.abs(dx)<217&&Math.abs(dy)<217){h.line(c,cx+dx-6,cy+dy-6,cx+dx+6,cy+dy+6,col,2);h.line(c,cx+dx-6,cy+dy+6,cx+dx+6,cy+dy-6,col,2);h.circle(c,cx+dx,cy+dy,3,C.text)}}
    h.text(c,j?'σ = 2.0 cm':'σ = 0.5 cm',cx,785,32,col,'center','mono');
    const rr=(j?100:25)*(1+.08*Math.sin(t*2));h.circle(c,cx,cy,rr,null,col,3);
  }
  h.text(c,'同一靶心',960,471,29,C.text,'center');h.text(c,'不同波动',960,527,29,C.muted,'center');
  h.arrow(c,805,581,1115,581,C.muted,2);h.text(c,'方差 ×16',960,638,31,C.gold,'center');
  alpha(c,smooth((t-11)/3),()=>h.label(c,'沿任一坐标方向比较（模拟）',960,809,C.muted));
}

function convolution(c,t,h){
  const {C}=h,p=smooth(t/4),rise=smooth((t-5)/6),seven=smooth((t-11)/3),roll=Math.floor(t*2.2)%36,a=roll%6,b=Math.floor(roll/6);
  const x=227,y=350,s=65;
  h.text(c,'两颗独立的公平骰子',446,306,31,C.text,'center');
  for(let i=0;i<6;i++){h.die(c,x+i*s+7,y-3,44,i+1,C.cyan);h.die(c,x-70,y+62+i*s+7,44,i+1,C.gold)}
  for(let i=0;i<6;i++)for(let j=0;j<6;j++){const sum=i+j+2,xx=x+j*s,yy=y+62+i*s,on=(a===j&&b===i)||sum===7&&seven>.1;alpha(c,p,()=>{h.rect(c,xx,yy,s-6,s-6,on?C.gold+'44':C.blue+'15',on?C.gold:C.blue+'33',7,on?2:1);h.text(c,String(sum),xx+(s-6)/2,yy+39,26,on?C.gold:C.text,'center','mono')})}
  h.text(c,'36 个等可能组合',444,824,27,C.muted,'center');
  const bx=919,by=729,bw=811,bh=337;
  h.axes(c,bx,by,bw,bh,{xLabel:'点数之和',yLabel:'组合数量',xTicks:Array.from({length:11},(_,i)=>[(i+.5)/11,String(i+2)]),yTicks:[[1/3,'2'],[2/3,'4'],[1,'6']]});
  for(let i=0;i<11;i++){const count=6-Math.abs(i-5),xx=bx+(i+.1)*bw/11;bar(c,h,xx,by,bw*.072,count/6*bh*rise,i===5?C.gold:C.cyan+'99');if(t>8)h.text(c,String(count),xx+bw*.036,by-count/6*bh*rise-12,24,i===5?C.gold:C.muted,'center','mono')}
  h.text(c,'相加后的新分布',1325,306,31,C.cyan,'center');
  alpha(c,seven,()=>h.label(c,'和为 7：6 / 36 = 1 / 6',1330,818,C.gold));
}

function lln(c,t,h){
  const {C}=h,progress=clamp((t-1)/15),n=Math.max(1,Math.floor(1+3999*progress**1.55)),x=364,y=728,w=1390,hh=335;
  h.axes(c,x,y,w,hh,{xLabel:'投掷次数 n',yLabel:'正面频率',xTicks:[[0,'0'],[.25,'1000'],[.5,'2000'],[.75,'3000'],[1,'4000']],yTicks:[[0,'0'],[.5,'0.5'],[1,'1']]});
  grid(c,h,x,y,w,hh,4,4);dash(c,h,x,y-hh*.5,x+w,y-hh*.5,C.gold,3);
  for(let k=2;k>=0;k--){const pts=[],arr=COINS[k];for(let i=1;i<=n;i+=i<100?1:4)pts.push([x+i/4000*w,y-arr[i-1]*hh]);pts.push([x+n/4000*w,y-arr[n-1]*hh]);h.path(c,pts,[C.cyan,C.violet,C.blue][k],k?2:3.5);if(!k)glowDot(c,h,x+n/4000*w,y-arr[n-1]*hh,7,C.cyan)}
  h.coin(c,215,512,74,t*3,C.gold,'正');h.text(c,'独立重复',215,639,28,C.text,'center');h.text(c,'公平硬币',215,688,28,C.muted,'center');
  h.text(c,n.toLocaleString('en-US'),527,319,50,C.text,'center','mono',600);h.text(c,'次投掷',683,315,27,C.muted);
  h.text(c,(COINS[0][n-1]*100).toFixed(2)+'%',1454,319,50,C.cyan,'center','mono',600);h.text(c,'当前正面频率',1664,315,27,C.muted,'center');
  stageLabel(c,h,t,['开头的波动可以很大','三条独立模拟路径，都在不断起伏','稳定的是长期频率；下一次仍然不可预知']);
}

function clt(c,t,h){
  const {C}=h,z=clamp((t-1)/3.4,0,4),k=Math.min(3,Math.floor(z)),q=smooth(clamp((z-k-.7)/.3)),n=CLT_NS[Math.min(4,Math.floor(z))],x=786,y=739,w=948,hh=345;
  h.text(c,'总体：偏斜的等待时间',382,309,31,C.gold,'center');
  const px=158,py=577,pw=420,ph=210;
  h.axes(c,px,py,pw,ph,{xLabel:'等待时间',yLabel:'指数密度',xTicks:[[0,'0'],[.5,'2'],[1,'4']]});h.curve(c,v=>Math.exp(-v),px,py,pw,ph,0,4,1,C.gold,1,true);
  for(let j=0;j<9;j++){const q0=fract(t*.3+j*.11),xx=174+j*44;h.circle(c,xx,668+Math.sin(q0*TAU)*8,7,C.gold)}
  h.text(c,'独立同分布 · 有限非零方差',396,781,24,C.muted,'center');
  h.arrow(c,622,521,735,521,C.muted,3);h.text(c,'取平均',678,573,24,C.muted,'center');
  h.axes(c,x,y,w,hh,{xLabel:'标准化后的样本均值 z',yLabel:'密度',xTicks:[[1/6,'−3'],[.5,'0'],[5/6,'3']],yTicks:[[.5,'0.25'],[1,'0.50']]});grid(c,h,x,y,w,hh,6,4);
  const b1=CLT_HIST[k],b2=CLT_HIST[k+1];for(let i=0;i<36;i++){const v=mix(b1[i],b2[i],q)/5000/.25;bar(c,h,x+i*w/36+1.5,y,w/36-3,Math.min(v/.5,1.1)*hh,C.cyan+'99')}
  h.curve(c,PDF,x,y,w,hh,-4.5,4.5,.5,C.text,1);
  const nLabel=q>0&&q<1?CLT_NS[k]+' → '+CLT_NS[k+1]:String(n);
  h.text(c,'n = '+nLabel,1192,309,q>0&&q<1?43:52,C.cyan,'center','mono',600);h.text(c,q>0&&q<1?'增加每组样本量':'每组 '+n+' 个样本',1572,309,29,C.muted,'center');
  h.label(c,'白线：标准正态密度',1260,820,C.text);
  // A moving dot follows the bell outline, even after the final histogram settles.
  const scan=Math.sin(t*.7)*2.7;glowDot(c,h,x+(scan+4.5)/9*w,y-PDF(scan)/.5*hh,6,C.text);
}

function characteristic(c,t,h){
  const {C}=h,omega=mix(.2,3.4,smooth(t/17)),cx=484,cy=554,R=177,values=[-2,-1,0,1,2],weights=[.1,.2,.4,.2,.1];
  h.text(c,'每一个数，变成一个旋转指针',485,311,31,C.text,'center');
  h.circle(c,cx,cy,R,null,C.muted+'77',2);h.line(c,cx-R-35,cy,cx+R+35,cy,C.muted,1,.5);h.line(c,cx,cy-R-35,cx,cy+R+35,C.muted,1,.5);
  let re=0,im=0;
  for(let j=0;j<5;j++){const a=omega*values[j],xx=cx+R*Math.cos(a),yy=cy-R*Math.sin(a),col=[C.violet,C.blue,C.gold,C.cyan,C.green][j];h.arrow(c,cx,cy,xx,yy,col,3);h.circle(c,xx,yy,7,col);h.text(c,'x='+values[j],260+j*110,354,22,col,'center','mono');re+=weights[j]*Math.cos(a);im+=weights[j]*Math.sin(a)}
  h.text(c,'ω = '+omega.toFixed(2),484,810,31,C.cyan,'center','mono');
  h.arrow(c,770,550,953,550,C.muted,3);h.text(c,'概率加权平均',862,607,27,C.muted,'center');
  const ox=1271,oy=548,scale=204;
  h.line(c,ox-scale-30,oy,ox+scale+90,oy,C.muted,2);h.line(c,ox,oy+scale+24,ox,oy-scale-25,C.muted,2);h.circle(c,ox,oy,scale,null,C.muted+'55',2);
  h.text(c,'Re',ox+scale+99,oy+8,24,C.muted,'left','mono');h.text(c,'Im',ox+20,oy-scale+25,24,C.muted,'left','mono');
  const pts=[];for(let i=0;i<=100;i++){const om=omega*i/100,real=weights.reduce((s,p,j)=>s+p*Math.cos(om*values[j]),0);pts.push([ox+real*scale,oy])}h.path(c,pts,C.gold,5);
  h.arrow(c,ox,oy,ox+re*scale,oy-im*scale,C.gold,8);glowDot(c,h,ox+re*scale,oy-im*scale,10,C.gold);
  h.text(c,'特征函数',1349,311,34,C.gold,'center');h.text(c,'分布的频率视角',1349,794,31,C.text,'center');
  h.text(c,'对称分布示例：虚部相消',1563,670,25,C.muted,'center');
}

function monteCarlo(c,t,h){
  const {C}=h,p=clamp((t-.5)/16),n=Math.max(1,Math.floor(1+4999*p**1.4)),cx=508,cy=552,R=218;
  h.rect(c,cx-R,cy-R,R*2,R*2,C.blue+'07',C.muted,0,2);h.circle(c,cx,cy,R,C.cyan+'09',C.cyan,3);
  h.line(c,cx-R,cy,cx+R,cy,C.muted,1,.2);h.line(c,cx,cy-R,cx,cy+R,C.muted,1,.2);
  for(let i=0;i<n;i++){const v=MC[i];h.circle(c,cx+v.x*R,cy-v.y*R,2.5,v.ok?C.cyan+'bb':C.gold+'aa')}
  const v=MC[n-1];h.circle(c,cx+v.x*R,cy-v.y*R,8,null,C.text,2);
  h.text(c,'在正方形中独立均匀投点',508,302,30,C.text,'center');h.text(c,'边长 2 · 圆半径 1',508,816,28,C.muted,'center');
  const est=4*v.inside/n;
  h.text(c,est.toFixed(4),1320,449,115,C.cyan,'center','mono',600);h.text(c,'对 π 的估计',1320,512,31,C.text,'center');
  h.text(c,'圆内 '+v.inside.toLocaleString('en-US'),1157,603,35,C.cyan,'center','mono');h.text(c,'总计 '+n.toLocaleString('en-US'),1511,603,35,C.gold,'center','mono');
  const gx=969,gy=750,gw=746,gh=98;
  const trueY=gy-(Math.PI-2.8)/.68*gh;dash(c,h,gx,trueY,gx+gw,trueY,C.text,2);h.text(c,'π',gx+gw+20,trueY+8,25,C.text,'left','serif');
  const pts=[];for(let i=10;i<=n;i+=12){const v2=MC[i-1],est2=4*v2.inside/i;pts.push([gx+i/5000*gw,gy-clamp((est2-2.8)/.68)*gh])}h.path(c,pts,C.cyan,2.5);
  h.text(c,'随机取样，把面积变成可计算的概率',1335,819,29,C.muted,'center');
}

export function draw(ctx,id,t,h){
  const scenes={12:uniform,13:normal,14:cdf,15:transform,16:joint,17:marginal,18:dependence,19:expectation,20:variance,21:convolution,22:lln,23:clt,24:characteristic,25:monteCarlo};
  ctx.save();ctx.beginPath();ctx.rect(90,265,1740,565);ctx.clip();
  (scenes[id]||uniform)(ctx,t,h);
  ctx.restore();
}

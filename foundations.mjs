// Original probability scenes. Timeline/motion vocabulary informed by Bemly/408.
export function draw(c,id,t,h){const {C,text,line,circle,rect,path,arrow,axes,curve,label,person,coin,die,panel,ease,out,clamp,lerp,rnd}=h;
const phase=ease((t-1)/4), late=ease((t-9)/4), pulse=1+.035*Math.sin(t*Math.PI*4);
if(id===0){
 // A living, rainy city; the camera ascends from concrete events into probability.
 const floor=794;line(c,85,floor,1835,floor,C.blue,2,.5);
 for(let i=0;i<31;i++){const w=35+rnd(i)*58,x=75+i*60,height=100+rnd(i+4)*330;c.save();c.globalAlpha=.8;rect(c,x,floor-height,w,height,i%3?'#12233a':'#1c3047',null,2);for(let xx=9;xx<w-6;xx+=14)for(let yy=14;yy<height-8;yy+=21){const on=rnd(i*173+xx+yy)>.42;rect(c,x+xx,floor-height+yy,5,8,on?'#f8c97999':'#203550',null,0)}c.restore()}
 for(let i=0;i<150;i++){const x=(rnd(i+50)*1900+t*(50+rnd(i)*20))%1900,y=260+((rnd(i+900)*560+t*(210+rnd(i)*160))%560);line(c,x,y,x-8,y+25,C.cyan,1.2,.22)}
 for(let lane=0;lane<3;lane++)for(let i=0;i<9;i++){const x=((i*224+t*(55+lane*30))%1850)+35,y=770+lane*14;line(c,x-20,y,x+22,y,lane%2?C.red:C.gold,3,.85)}
 c.save();c.globalAlpha=ease(t/3);text(c,'在无数偶然之间',960,387,63,C.text,'center','serif',600);text(c,'寻找秩序',960,480,95,C.gold,'center','serif',700);c.restore();
 const labs=[['一场雨',260,625],['一次到达',1500,610],['一个观测',1040,715]];for(let i=0;i<3;i++){const a=ease((t-5-i*1.6)/1.4);c.save();c.globalAlpha=a;circle(c,labs[i][1],labs[i][2],9,C.gold);line(c,labs[i][1],labs[i][2]-14,labs[i][1],labs[i][2]-49,C.gold,1);text(c,labs[i][0],labs[i][1],labs[i][2]-64,27,C.gold,'center');c.restore()}
}else if(id===1){
 const x=960,y=455-55*Math.sin(t*.95),r=122;coin(c,x,y,r,t*3.4,C.gold,Math.cos(t*3.4)>0?'正':'反');
 for(const [xx,v,col]of [[530,'正面',C.gold],[1390,'反面',C.cyan]]){path(c,[[960,590],[960,630],[xx,630],[xx,708]],col,3);circle(c,xx,742,54,col+'15',col,2);text(c,v,xx,750,31,col,'center');text(c,'1 / 2',xx,826,35,col,'center','mono');const p=(t*.33)%1;circle(c,lerp(960,xx,ease(p)),lerp(591,710,p),6,col)}
 label(c,'理想公平硬币',960,280,C.muted);
 for(let i=0;i<20;i++){const xx=245+i*75,v=rnd(i)>0.5;coin(c,xx,310,15,0,v?C.gold:C.cyan,v?'正':'反')}
}else if(id===2){
 for(let i=0;i<6;i++){const a=i*Math.PI/3-.5,px=lerp(960+340*Math.cos(a),250+i*280,phase),py=lerp(520+200*Math.sin(a),475,phase);c.save();c.translate(px,py);c.rotate((1-phase)*t*.15);die(c,-60,-60,120,i+1,i%2?C.cyan:C.text);c.restore();text(c,String(i+1),px,py+125,37,C.muted,'center','mono');if(i%2&&late){c.save();c.globalAlpha=late;circle(c,px,py,91,null,C.cyan,4);c.restore()}}
 text(c,'六种等可能结果',960,305,32,C.muted,'center');c.save();c.globalAlpha=late;label(c,'事件 A：出现偶数',960,752,C.cyan);text(c,'3 / 6 = 1 / 2',960,821,43,C.cyan,'center','mono');c.restore();
}else if(id===3){
 const x1=780,x2=1110,yy=520,rr=208;rect(c,375,282,1150,527,'#0a1424',C.muted+'55',25);text(c,'Ω',411,331,30,C.muted,'left','serif');circle(c,x1,yy,rr,C.cyan+'27',C.cyan,3);circle(c,x2,yy,rr,C.gold+'27',C.gold,3);
 c.save();c.beginPath();c.arc(x1,yy,rr,0,Math.PI*2);c.clip();circle(c,x2,yy,rr,C.green+'5a');c.restore();
 for(let i=0;i<8;i++){line(c,690+i*24,456,680+i*24,480,C.cyan,3);rect(c,1050+i%3*48,470+Math.floor(i/3)*34,30,16,C.gold,null,5)}
 text(c,'A 下雨',680,647,34,C.cyan,'center');text(c,'B 堵车',1200,647,34,C.gold,'center');text(c,'A ∩ B',947,535,32,C.green,'center','serif');
 const scan=lerp(405,1470,(t*.1)%1);line(c,scan,309,scan,783,C.text,1,.1);label(c,late>.5?'合并时，交集只算一次':'交集：两个事件同时发生',960,785,C.green);
}else if(id===4){
 const blueX=990,yy=342,bw=500,bh=365,focus=ease((t-5)/4);c.save();c.globalAlpha=1-.75*focus;panel(c,360,yy,bw,bh,C.gold);text(c,'盒子 Ⅰ',610,yy+59,34,C.gold,'center');for(let i=0;i<10;i++)circle(c,440+(i%5)*84,yy+142+Math.floor(i/5)*119,27,i<2?C.red:C.gold);text(c,'2 红 / 10 球',610,yy+338,31,C.muted,'center');c.restore();
 panel(c,blueX,yy,bw,bh,C.cyan);text(c,'盒子 Ⅱ',blueX+250,yy+59,34,C.cyan,'center');for(let i=0;i<10;i++){const x=blueX+80+(i%5)*84,y=yy+142+Math.floor(i/5)*119;circle(c,x,y+3*Math.sin(t+i),27,i<6?C.red:C.cyan);if(focus&&i<6)circle(c,x,y,33,null,C.red+'aa',2)}text(c,'6 红 / 10 球',blueX+250,yy+338,31,C.text,'center');
 c.save();c.globalAlpha=focus;rect(c,blueX-16,yy-16,bw+32,bh+32,null,C.cyan,30,3);arrow(c,610,760,1040,760,C.cyan);text(c,'已知 B：抽到盒子 Ⅱ',790,817,32,C.cyan,'center');text(c,'P(红 | Ⅱ) = 0.6',1325,807,39,C.red,'center','mono');c.restore();
}else if(id===5){
 const p=ease((t-2)/4),q=ease((t-8)/3);text(c,'10,000 件产品',175,304,40,C.text);text(c,'次品率 1%  ·  检出率 99%  ·  误报率 5%',175,349,27,C.muted);
 for(let i=0;i<1000;i++){const isBad=i<10;rect(c,180+(i%50)*11,393+Math.floor(i/50)*16,7,9,isBad?C.red:'#314a65',null,2)}text(c,'每个小格代表 10 件',444,762,25,C.muted,'center');
 arrow(c,775,545,900,545,C.gold,4);c.save();c.globalAlpha=p;panel(c,944,363,330,380,C.red);panel(c,1313,363,330,380,C.gold);text(c,'真阳性',1109,415,29,C.red,'center');text(c,'假阳性',1478,415,29,C.gold,'center');
 for(let i=0;i<99;i++)circle(c,990+i%11*23,468+Math.floor(i/11)*16,5,C.red);for(let i=0;i<495;i++)circle(c,1350+i%25*10.5,463+Math.floor(i/25)*9,3,C.gold);text(c,'99',1109,714,51,C.red,'center','mono',600);text(c,'495',1478,714,51,C.gold,'center','mono',600);c.restore();
 c.save();c.globalAlpha=q;text(c,'阳性 ≠ 确定为次品',1110,806,36,C.text,'center');text(c,'16.7%',1575,808,54,C.red,'center','mono');c.restore();text(c,'数量均为模型下的期望值',175,812,25,C.muted);
}else if(id===6){
 const xs=[480,1100],ys=[333,590];for(let j=0;j<2;j++)for(let i=0;i<2;i++){const k=j*2+i,x=xs[i],y=ys[j];panel(c,x,y,360,205,k%2?C.cyan:C.gold);coin(c,x+106,y+91,48,0,j?C.cyan:C.gold,j?'反':'正');coin(c,x+254,y+91,48,0,i?C.cyan:C.gold,i?'反':'正');text(c,'1 / 4',x+180,y+175,32,C.text,'center','mono');if(Math.floor(t*.6)%4===k)rect(c,x-5,y-5,370,215,null,C.text+'88',25,3)}
 text(c,'第一枚 × 第二枚',960,300,31,C.muted,'center');label(c,'知道第一枚，第二枚的概率仍然是 1/2',960,830,C.green);
}else if(id===7){
 const cols=[C.red,C.gold,C.cyan,C.green,C.violet];for(let i=0;i<5;i++){circle(c,550+i*205,355,45,cols[i]);text(c,String(i+1),550+i*205,366,32,C.bg,'center','mono',600)}
 let k=0;for(let i=0;i<5;i++)for(let j=i+1;j<5;j++){const x=350+k%5*280,y=525+Math.floor(k/5)*183,p=ease((t-2-k*.5)/1);c.save();c.globalAlpha=p;panel(c,x-102,y-57,214,127,C.muted);circle(c,x-43,y,28,cols[i]);circle(c,x+42,y,28,cols[j]);text(c,String(i+1),x-43,y+10,25,C.bg,'center','mono');text(c,String(j+1),x+42,y+10,25,C.bg,'center','mono');c.restore();k++}label(c,'不计顺序：{1,2} 与 {2,1} 是同一个组合',960,826,C.gold);
}else if(id===8){
 const y=628;line(c,200,y+35,1700,y+35,C.muted,5);for(let i=0;i<25;i++){const xx=200+((i*65+t*45)%1500);circle(c,xx,y+56,13,'#233850',C.muted+'66',1)}
 const xs=Array.from({length:7},(_,i)=>150+((i*1550/7+t*92)%1550));const nearest=xs.reduce((best,x,i)=>Math.abs(x+50-960)<Math.abs(xs[best]+50-960)?i:best,0);for(let i=0;i<7;i++){const xx=xs[i],bh=64+rnd(i)*48;rect(c,xx,y-bh,100,bh,'#9d7043',C.gold,5,2);line(c,xx+50,y-bh,xx+50,y,C.gold,2);rect(c,xx+12,y-bh+20,31,23,'#f1dfb0',null,2);if(i===nearest){line(c,xx+50,y-bh-10,960,397,C.cyan,2,.65);text(c,(1.2+rnd(i)*3).toFixed(2)+' kg',960,370,66,C.cyan,'center','mono')}}
 path(c,[[788,665],[788,470],[1138,470],[1138,665]],C.cyan,6);text(c,'观测',438,382,38,C.gold,'center');text(c,'赋值',1456,382,38,C.cyan,'center');arrow(c,550,369,733,369,C.gold);arrow(c,1185,369,1357,369,C.cyan);
 label(c,'重量 · 时间 · 次数',960,787,C.cyan);
}else if(id===9){
 // Exactly Bin(10,.3), shown through independent lamp trials.
 for(let i=0;i<10;i++){const x=242+i*160,on=rnd(i+Math.floor(t*1.2)*81)<.3;circle(c,x,372,35,on?C.gold:'#253648',on?C.gold:C.muted,2);rect(c,x-15,407,30,20,C.muted,null,3);if(on){c.save();c.globalAlpha=.17;circle(c,x,372,54,C.gold);c.restore()}}
 const probs=Array.from({length:11},(_,k)=>{let choose=1;for(let j=1;j<=k;j++)choose*=((11-j)/j);return choose*.3**k*.7**(10-k)});axes(c,292,781,1350,280,{xLabel:'成功次数 k',yLabel:'概率',xTicks:Array.from({length:11},(_,i)=>[(i+.5)/11,String(i)]),yTicks:[[0,'0'],[.5,'.15'],[1,'.30']]});
 for(let k=0;k<=10;k++){const ht=probs[k]/.3*280*ease((t-2-k*.13)/3);rect(c,292+(k+.5)/11*1350-31,781-ht,62,ht,k===3?C.gold:C.cyan+'aa',null,7)}text(c,'n = 10     p = 0.3',1500,483,30,C.gold,'right','mono');
}else if(id===10){
 // Poisson count histogram, linked to an actual arrival time-line.
 const arrivals=[.15,.78,1.13,2.04,2.31,2.75,3.88,4.26,4.55,5.13,5.91,6.02,6.4,7.81,8.3,8.52,9.17,9.9,10.5,11.8,12.04,12.4,13.12,13.61,13.9,15.0,15.45,16.13,17.7];
 line(c,185,393,1740,393,C.muted,3);for(const a of arrivals){const xx=200+a/18*1500;const age=t-a;c.save();c.globalAlpha=age>=0?1:.14;line(c,xx,383,xx,403,C.gold,3);rect(c,xx-15,347-Math.max(0,25*(1-clamp(age))),30,19,C.gold,null,5);c.restore()}const scan=200+((t/18)%1)*1500;line(c,scan,318,scan,415,C.text,3);text(c,'一条到达时间线',200,290,28,C.muted);
 const probs=[];for(let k=0;k<13;k++){let fact=1;for(let j=1;j<=k;j++)fact*=j;probs.push(Math.exp(-4)*4**k/fact)}axes(c,320,780,1240,270,{xLabel:'一个时间窗内的次数',yLabel:'概率',xTicks:[0,2,4,6,8,10,12].map(i=>[(i+.5)/13,String(i)]),yTicks:[[0,'0'],[.5,'.1'],[1,'.2']]});for(let k=0;k<13;k++){const ht=probs[k]/.2*270*ease((t-2)/4);rect(c,320+(k+.5)/13*1240-33,780-ht,66,ht,k===4?C.gold:C.cyan+'99',null,5)}label(c,'λ = 4',1590,526,C.gold);
}else if(id===11){
 const cx=465,cy=540;circle(c,cx,cy,179,'#0c1b2d',C.cyan,3);for(let i=0;i<60;i++){const a=i*Math.PI/30;line(c,cx+157*Math.sin(a),cy-157*Math.cos(a),cx+(i%5?166:174)*Math.sin(a),cy-(i%5?166:174)*Math.cos(a),C.muted,i%5?1:3)}const a=t*.9;line(c,cx,cy,cx+135*Math.sin(a),cy-135*Math.cos(a),C.gold,6);circle(c,cx,cy,10,C.gold);text(c,'等待时间 T',cx,783,35,C.cyan,'center');
 axes(c,827,752,836,347,{xLabel:'t / 分钟',yLabel:'f(t)',xTicks:[[0,'0'],[.25,'1'],[.5,'2'],[.75,'3'],[1,'4']],yTicks:[[0,'0'],[.5,'.5'],[1,'1']]});curve(c,x=>Math.exp(-x),827,752,836,347,0,4,1,C.cyan,ease(t/5),true);
 const s=1.2,q=ease((t-8)/3);c.save();c.globalAlpha=q;const xx=827+s/4*836;line(c,xx,752,xx,385,C.gold,2);text(c,'已经等过 s',xx,354,28,C.gold,'center');label(c,'剩余等待的分布，不因已等时长而改变',1250,826,C.gold);c.restore();
}else if(id===40){
 const names=['事件','随机变量','分布','数字特征','极限定理','抽样','估计','检验','回归','设计','决策','随机过程'];const cs=[C.gold,C.cyan,C.cyan,C.violet,C.violet,C.red,C.red,C.red,C.green,C.green,C.green,C.blue];const nodes=names.map((name,i)=>{const a=i/12*Math.PI*2-Math.PI/2;return{x:960+610*Math.cos(a),y:549+221*Math.sin(a),name,col:cs[i]}});
 for(let i=0;i<12;i++){const a=nodes[i],b=nodes[(i+1)%12];line(c,a.x,a.y,b.x,b.y,a.col,2,.5);const u=(t*.22+i*.18)%1;circle(c,lerp(a.x,b.x,u),lerp(a.y,b.y,u),5,a.col);if(i%3===0)line(c,a.x,a.y,960,550,a.col,1,.24)}
 for(let i=0;i<12;i++){const n=nodes[i],s=ease((t-i*.25)/2);c.save();c.globalAlpha=s;circle(c,n.x,n.y,43,'#132138',n.col,2);text(c,n.name,n.x,n.y+8,26,n.col,'center');c.restore()}text(c,'概率 × 统计',960,535,62,C.text,'center','serif',600);text(c,'在不确定中，建立可靠的认识',960,602,30,C.muted,'center');
}else if(id===41){
 const y=403;coin(c,960,y,90,t*.5,C.gold,'π');text(c,'随机之美',960,595,95,C.text,'center','serif',700);text(c,'一部关于概率与统计的视觉旅程',960,660,31,C.blue,'center');
 c.save();c.globalAlpha=ease((t-4)/2);text(c,'内容参考',960,719,22,C.muted,'center');text(c,'《概率统计讲义》第三版 · 陈家鼎 / 刘婉如 / 汪仁官',960,759,26,C.muted,'center');text(c,'《概率论与数理统计教程》第四版 · 茆诗松 / 程依明 / 濮晓龙 / 倪葎',960,795,26,C.muted,'center');text(c,'动画架构参考 Bemly/408  ·  原创场景 / 旁白 / 程序化配乐',960,830,23,C.muted,'center');c.restore();
}
}

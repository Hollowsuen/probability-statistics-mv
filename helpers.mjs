// Timeline/camera/easing design adapted from Bemly/408 (src/theme.ts, components/Shot.tsx).
export const W=1920,H=1080;
export const C={bg:'#050b18',text:'#edf5ff',muted:'#8da2bd',cyan:'#54d9ee',gold:'#f8c979',violet:'#af9bff',red:'#ff728b',green:'#5fe0b1',blue:'#73a9ff'};
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const lerp=(a,b,p)=>a+(b-a)*p;
export const ease=p=>{p=clamp(p);return p*p*(3-2*p)};
export const out=p=>1-(1-clamp(p))**3;
export const rnd=seed=>{const x=Math.sin(seed*127.1+311.7)*43758.5453123;return x-Math.floor(x)};
export const normal=seed=>Math.sqrt(-2*Math.log(Math.max(1e-8,rnd(seed))))*Math.cos(2*Math.PI*rnd(seed+434));
export function text(c,str,x,y,size=30,color=C.text,align='left',font='sans',weight=500){c.save();c.fillStyle=color;c.textAlign=align;c.font=`${weight} ${size}px "${font==='mono'?'JetBrains Mono':font==='serif'?'Noto Serif SC':weight>=600?'Noto Sans SC Semibold':'Noto Sans SC'}", "Noto Sans", "Noto Sans Math"`;c.fillText(str,x,y);c.restore()}
export function line(c,x1,y1,x2,y2,color=C.muted,width=2,alpha=1){c.save();c.globalAlpha*=alpha;c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.restore()}
export function circle(c,x,y,r,fill,stroke=null,width=2){if(r<=0)return;c.save();c.beginPath();c.arc(x,y,r,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}c.restore()}
export function rect(c,x,y,w,h,fill,stroke=null,r=12,width=2){if(w<=0||h<=0)return;c.save();c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}c.restore()}
export function path(c,pts,color=C.cyan,width=3,closed=false,fill=null){if(!pts.length)return;c.save();c.lineWidth=width;c.strokeStyle=color;c.lineJoin='round';c.lineCap='round';c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));if(closed)c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(color)c.stroke();c.restore()}
export function arrow(c,x1,y1,x2,y2,color=C.cyan,width=3){line(c,x1,y1,x2,y2,color,width);const a=Math.atan2(y2-y1,x2-x1),l=13;path(c,[[x2-l*Math.cos(a-.5),y2-l*Math.sin(a-.5)],[x2,y2],[x2-l*Math.cos(a+.5),y2-l*Math.sin(a+.5)]],color,width)}
export function axes(c,x,y,w,h,{xLabel='',yLabel='',xTicks=[],yTicks=[],color=C.muted}={}){arrow(c,x,y,x+w+12,y,color,2);arrow(c,x,y,x,y-h-12,color,2);text(c,xLabel,x+w,y+46,25,color,'right');text(c,yLabel,x,y-h-28,25,color);for(const [f,l] of xTicks){line(c,x+f*w,y,x+f*w,y+8,color);text(c,l,x+f*w,y+32,23,color,'center')}for(const [f,l] of yTicks){line(c,x-7,y-f*h,x,y-f*h,color);text(c,l,x-16,y-f*h+8,22,color,'right');line(c,x,y-f*h,x+w,y-f*h,color,1,.12)}}
export function curve(c,fn,x,y,w,h,xmin,xmax,ymax,color=C.cyan,progress=1,fill=false){const n=220,pts=[];for(let i=0;i<=n*clamp(progress);i++){const u=i/n;pts.push([x+u*w,y-h*fn(lerp(xmin,xmax,u))/ymax])}if(fill&&pts.length){path(c,[[x,y],...pts,[pts.at(-1)[0],y]],null,1,true,color+'22')}path(c,pts,color,4)}
export function label(c,str,x,y,color=C.cyan){c.save();c.font='500 25px "Noto Sans SC"';const w=c.measureText(str).width;rect(c,x-w/2-18,y-31,w+36,45,color+'14',color+'66',22,1);text(c,str,x,y,25,color,'center');c.restore()}
export function person(c,x,y,s=1,color=C.cyan){circle(c,x,y-25*s,6*s,color);rect(c,x-6*s,y-17*s,12*s,15*s,color,null,4*s);line(c,x-3*s,y-4*s,x-4*s,y,color,3*s);line(c,x+3*s,y-4*s,x+4*s,y,color,3*s)}
export function coin(c,x,y,r,angle=0,color=C.gold,value='1'){c.save();c.translate(x,y);c.scale(Math.max(.12,Math.abs(Math.cos(angle))),1);circle(c,5,5,r,'#9e7135');circle(c,0,0,r,color);circle(c,0,0,r*.83,null,'#846136',2);text(c,value,0,r*.29,r*.82,'#5b401a','center','serif',700);c.restore()}
export function die(c,x,y,size,value=1,color=C.text){rect(c,x+7,y+8,size,size,'#456175',null,size*.16);rect(c,x,y,size,size,color,null,size*.16);const p={1:[[.5,.5]],2:[[.27,.27],[.73,.73]],3:[[.27,.27],[.5,.5],[.73,.73]],4:[[.27,.27],[.73,.27],[.27,.73],[.73,.73]],5:[[.27,.27],[.73,.27],[.5,.5],[.27,.73],[.73,.73]],6:[[.27,.25],[.73,.25],[.27,.5],[.73,.5],[.27,.75],[.73,.75]]}[value];for(const [a,b]of p)circle(c,x+a*size,y+b*size,size*.075,'#15253b')}
export function panel(c,x,y,w,h,color=C.cyan){rect(c,x,y,w,h,'#0c192bd9',color+'33',20,1)}
export default {W,H,C,clamp,lerp,ease,out,rnd,normal,text,line,circle,rect,path,arrow,axes,curve,label,person,coin,die,panel};

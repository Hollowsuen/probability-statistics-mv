import h from './helpers.mjs';
import {SHOTS,ACTS,TOTAL,FPS} from './timeline.mjs';
import {draw as drawFoundations} from './scenes/foundations.mjs';
import {draw as drawDistribution} from './scenes/distributions.mjs';
import {draw as drawStatistics} from './scenes/statistics.mjs';
// Shared deterministic film engine: Node offline renderer and Remotion browser renderer.
export function createFilm(canvas,createCanvas){
const {W,H,C,text,line,circle,rect,clamp,ease,lerp,rnd}=h;
const ctx=canvas.getContext('2d');const bg=createCanvas(W,H),bc=bg.getContext('2d');
const grd=bc.createLinearGradient(0,0,W,H);grd.addColorStop(0,'#050b18');grd.addColorStop(.55,'#0b192a');grd.addColorStop(1,'#071120');bc.fillStyle=grd;bc.fillRect(0,0,W,H);
const rg=bc.createRadialGradient(1200,400,0,1200,400,1050);rg.addColorStop(0,'#1a365533');rg.addColorStop(1,'#00000000');bc.fillStyle=rg;bc.fillRect(0,0,W,H);
for(let y=255;y<900;y+=55)line(bc,60,y,1860,y,C.muted,.6,.08);for(let x=80;x<1920;x+=85)line(bc,x,255,x,900,C.muted,.6,.045);
const vg=bc.createRadialGradient(960,540,380,960,540,1160);vg.addColorStop(0,'#00000000');vg.addColorStop(1,'#02050cbb');bc.fillStyle=vg;bc.fillRect(0,0,W,H);
function wrap(str,size,maxW){ctx.save();ctx.font=`500 ${size}px "Noto Sans SC", "Noto Sans", "Noto Sans Math"`;const lines=[];let s='';for(const ch of str){if(ctx.measureText(s+ch).width>maxW){lines.push(s);s=ch}else s+=ch}if(s)lines.push(s);ctx.restore();return lines}
function scene(id,t,alpha=1,zoom=1,dx=0){const shot=SHOTS[id];if(!shot)return;const act=ACTS[shot.act],color=C[act.color];ctx.save();ctx.globalAlpha=alpha;ctx.translate(960+dx,530);ctx.scale(zoom,zoom);ctx.translate(-960,-530);
 // Typography is bound to the same scene-time as the diagrams.
 const reveal=ease((t+.1)/1.25);ctx.save();ctx.globalAlpha*=reveal;ctx.translate(0,14*(1-reveal));text(ctx,shot.en,104,173,24,color,'left','mono',500);text(ctx,shot.title,102,246,58,C.text,'left','sans',600);text(ctx,String(id+1).padStart(2,'0'),1818,241,67,color+'77','right','mono');ctx.restore();
 ctx.save();const cameradrift=1+.005*Math.sin(t*.2);ctx.translate(960,547);ctx.scale(cameradrift,cameradrift);ctx.translate(-960,-547);
 if(id<12||id>=40)drawFoundations(ctx,id,clamp(t,0,18),h);else if(id<26)drawDistribution(ctx,id,clamp(t,0,18),h);else drawStatistics(ctx,id,clamp(t,0,18),h);ctx.restore();
 // Permanent equation rail: readable while the narrated scene evolves.
 line(ctx,105,863,1815,863,color,1,.35);let size=30;ctx.font=`500 ${size}px "Noto Sans SC", "Noto Sans", "Noto Sans Math"`;while(ctx.measureText(shot.formula).width>1675&&size>22){size--;ctx.font=`500 ${size}px "Noto Sans SC", "Noto Sans", "Noto Sans Math"`}text(ctx,shot.formula,960,908,size,color,'center');
 const ni=t>=9.35?1:0,nt=ni?9.35:1.3,na=ease((t-nt)/.35)*(1-ease((t-(ni?17.1:8.85))/.45));if(na>0){ctx.save();ctx.globalAlpha*=na;const ls=wrap(shot.narration[ni],31,1690);for(let j=0;j<ls.length;j++)text(ctx,ls[j],960,971+(j-(ls.length-1)/2)*43,31,C.text,'center');ctx.restore()}
 ctx.restore();}
function drawFrame(frame){const time=frame/FPS,id=Math.min(41,Math.floor(time/18)),t=time-id*18,shot=SHOTS[id],act=ACTS[shot.act];ctx.clearRect(0,0,W,H);ctx.drawImage(bg,0,0);
 // Ambient perspective particles and restrained rhythmic light.
 for(let i=0;i<44;i++){const xx=(rnd(i+77)*1920+time*(2+rnd(i)*5))%1920,yy=275+rnd(i+600)*560;circle(ctx,xx,yy,.8+rnd(i+2)*1.2,C[act.color]+'32')}
 const span=.8;
 if(t<span&&id>0){const p=ease((t+span)/(2*span));scene(id-1,18+t,1-p,1+p*.035,-p*28);scene(id,t,p,.965+p*.035,(1-p)*28)}
 else if(t>18-span&&id<41){const p=ease((t-(18-span))/(2*span));scene(id,t,1-p,1+p*.035,-p*28);scene(id+1,t-18,p,.965+p*.035,(1-p)*28)}
 else scene(id,t);
 // Widescreen framing and an honest, navigable chapter strip.
 rect(ctx,0,0,1920,55,'#02050c',null,0);rect(ctx,0,1032,1920,48,'#02050c',null,0);text(ctx,'PROBABILITY / STATISTICS',103,92,20,C.muted,'left','mono');text(ctx,act.name,1817,92,23,C[act.color],'right');line(ctx,103,114,1817,114,C.muted,1,.3);
 for(let a=0;a<ACTS.length;a++){const x=104+a*290,col=C[ACTS[a].color];line(ctx,x,1055,x+254,1055,col,2,a===shot.act?.8:.18);const p=clamp((time-ACTS[a].start*18)/((ACTS[a].end-ACTS[a].start)*18));line(ctx,x,1055,x+254*p,1055,col,3,.85)}
 if(time<2||time>TOTAL-2){const fade=time<2?1-ease(time/2):ease((time-(TOTAL-2))/2);ctx.save();ctx.globalAlpha=fade;ctx.fillStyle='#02050c';ctx.fillRect(0,0,W,H);ctx.restore()}
 return canvas;
}
return {drawFrame,canvas};
}

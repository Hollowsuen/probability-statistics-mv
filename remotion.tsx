import React, {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {AbsoluteFill,Audio,Composition,continueRender,delayRender,registerRoot,staticFile,useCurrentFrame} from 'remotion';
import {createFilm} from './film.mjs';
import {FPS,TOTAL} from './timeline.mjs';
let fontPromise: Promise<void>|undefined;
const loadFonts=()=>fontPromise??=Promise.all([
 ['Noto Sans SC','NotoSansSC.ttf'],['Noto Sans SC Semibold','NotoSansSC-Semibold.ttf'],['Noto Serif SC','NotoSerifSC.ttf'],['JetBrains Mono','JetBrainsMono.ttf'],['Noto Sans','NotoSans-Regular.ttf'],['Noto Sans Math','NotoSansMath-Regular.ttf']
].map(async([family,file])=>{const f=new FontFace(family,`url(${staticFile('fonts/'+file)})`);await f.load();document.fonts.add(f)})).then(()=>{});
const Film: React.FC=()=>{
 const frame=useCurrentFrame(),ref=useRef<HTMLCanvasElement>(null),engine=useRef<any>(null);
 const [ready,setReady]=useState(false);const [handle]=useState(()=>delayRender('Load bundled probability-film fonts'));
 useEffect(()=>{loadFonts().then(()=>{setReady(true);continueRender(handle)}).catch(e=>{console.error(e);continueRender(handle)})},[handle]);
 useLayoutEffect(()=>{if(!ref.current||!ready)return;if(!engine.current)engine.current=createFilm(ref.current,(w:number,h:number)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c});engine.current.drawFrame(frame)},[frame,ready]);
 return <AbsoluteFill style={{background:'#02050c'}}><canvas width={1920} height={1080} ref={ref}/><Audio src={staticFile('master.m4a')}/></AbsoluteFill>;
};
const Root:React.FC=()=> <Composition id="RandomBeauty" component={Film} durationInFrames={Math.round(TOTAL*FPS)} fps={FPS} width={1920} height={1080}/>;
registerRoot(Root);

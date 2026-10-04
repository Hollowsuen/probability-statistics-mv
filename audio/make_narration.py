#!/usr/bin/env python3
"""Generate all 84 original film narration lines using Microsoft Edge neural TTS.
Only spoken pronunciation is adapted; captions preserve timeline text exactly.
Usage: python audio/make_narration.py --timeline audio/timeline.json
"""
import argparse, asyncio, hashlib, json, pathlib, subprocess, time
import numpy as np
import soundfile as sf
import edge_tts
ROOT=pathlib.Path.cwd()
WORK=ROOT/'work/audio'; WORK.mkdir(parents=True,exist_ok=True)
SR=48000
VOICE='zh-CN-YunxiNeural'
RATE='+6%'

def duration(p):
 return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(p)]))
def speak_text(s):
 return s.replace('p 值','P值').replace('t 分布','T分布').replace('F 分布','F分布')

def decode(path):
 raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-ac','1','-ar',str(SR),'-f','f32le','-'])
 x=np.frombuffer(raw,np.float32).copy()
 active=np.flatnonzero(np.abs(x)>.0015)
 if len(active): x=x[max(0,active[0]-int(.045*SR)):min(len(x),active[-1]+int(.10*SR))]
 return x
async def synth_one(sem,item):
 async with sem:
  idx=item['index'];path=WORK/f'voice_{idx:03}.mp3'
  sig=hashlib.sha256((VOICE+RATE+item['voice_text']).encode()).hexdigest()
  meta=WORK/f'voice_{idx:03}.json'
  if path.exists() and meta.exists() and json.loads(meta.read_text()).get('hash')==sig:
   print(f'TTS cached {idx:02}',flush=True);return
  for attempt in range(5):
   try:
    await edge_tts.Communicate(item['voice_text'],VOICE,rate=RATE).save(str(path))
    if path.stat().st_size<1000:raise ValueError('Empty TTS output')
    meta.write_text(json.dumps({'hash':sig,'voice':VOICE,'rate':RATE,'text':item['text'],'voice_text':item['voice_text']},ensure_ascii=False,indent=2))
    print(f'TTS saved {idx:02} ({duration(path):.2f}s)',flush=True);return
   except Exception as e:
    print(f'TTS retry {idx:02} {attempt+1}: {type(e).__name__} {e}',flush=True)
    if attempt==4:raise
    await asyncio.sleep(1.7*(attempt+1))
def tc(t):
 ms=round(t*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000)
 return f'{h:02}:{m:02}:{s:02},{ms:03}'
async def main():
 p=argparse.ArgumentParser();p.add_argument('--timeline',default='audio/timeline.json');args=p.parse_args()
 tl=json.loads(pathlib.Path(args.timeline).read_text());shots=tl['SHOTS'];total=max(s['start']+s['duration'] for s in shots)
 items=[]
 for s in shots:
  for j,tx in enumerate(s['narration']):
   a=s['start']+(1.5 if j==0 else 9.5);b=s['start']+(8.6 if j==0 else 16.9)
   items.append({'index':len(items),'shot':s['id'],'part':j,'text':tx,'voice_text':speak_text(tx),'start':a,'end':b})
 assert len(items)==84
 (WORK/'narration_manifest.json').write_text(json.dumps(items,ensure_ascii=False,indent=2))
 await asyncio.gather(*(synth_one(asyncio.Semaphore(1),x) for x in []))
 sem=asyncio.Semaphore(4)
 await asyncio.gather(*(synth_one(sem,x) for x in items))
 # 756 seconds, mono master written incrementally as 18-second shot blocks.
 peak=0.;energy=0.;samples=0
 with sf.SoundFile(WORK/'narration.wav','w',samplerate=SR,channels=2,subtype='PCM_24') as f:
  for s in shots:
   buf=np.zeros((int(s['duration']*SR),2),np.float32)
   for item in [x for x in items if x['shot']==s['id']]:
    x=decode(WORK/f"voice_{item['index']:03}.mp3");available=item['end']-item['start'];target=available-.08
    original_duration=len(x)/SR;speed=max(1.,original_duration/target)
    if speed>1.35:
     # A slow/long line gets a modest native rate increase, then rechecked.
     await edge_tts.Communicate(item['voice_text'],VOICE,rate='+14%').save(str(WORK/f"voice_{item['index']:03}_faster.mp3"))
     x=decode(WORK/f"voice_{item['index']:03}_faster.mp3");speed=max(1.,len(x)/SR/target)
    if speed>1.35:raise RuntimeError(f"Line {item['index']} exceeds safe speed: {speed}")
    if speed>1.001:
     tmp=WORK/f"trim_{item['index']:03}.wav";sf.write(tmp,x,SR,subtype='FLOAT')
     raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(tmp),'-af',f'atempo={speed:.6f}','-ac','1','-ar',str(SR),'-f','f32le','-'])
     x=np.frombuffer(raw,np.float32).copy()
    # Stable speech level; cap both RMS normalization and peak for clean delivery.
    rms=float(np.sqrt(np.mean(x*x)));gain=min(.115/max(rms,1e-5),.68/max(float(np.max(np.abs(x))),1e-5));x*=gain
    nfade=min(int(.012*SR),len(x)//2);x[:nfade]*=np.linspace(0,1,nfade);x[-nfade:]*=np.linspace(1,0,nfade)
    offset=round((item['start']-s['start'])*SR);end=offset+len(x)
    assert end<=len(buf), (item['index'],end,len(buf))
    buf[offset:end,0]+=x;buf[offset:end,1]+=x
    item.update({'original_seconds':original_duration,'tempo_factor':speed,'final_seconds':len(x)/SR,'actual_voice_end':item['start']+len(x)/SR,'peak':float(np.max(np.abs(x))),'rms':float(np.sqrt(np.mean(x*x)))})
   f.write(buf);peak=max(peak,float(np.max(np.abs(buf))));energy+=float(np.sum(buf.astype(np.float64)**2));samples+=buf.size
 (WORK/'narration_manifest.json').write_text(json.dumps(items,ensure_ascii=False,indent=2))
 subs='\n\n'.join(f"{i+1}\n{tc(v['start'])} --> {tc(v['end'])}\n{v['text']}" for i,v in enumerate(items))+'\n'
 dest=ROOT/'captions';dest.mkdir(parents=True,exist_ok=True)
 (dest/'zh-CN.srt').write_text(subs)
 stats={'duration_seconds':total,'sample_rate':SR,'channels':2,'lines':len(items),'peak':peak,'rms':(energy/samples)**.5,'max_atempo':max(x['tempo_factor'] for x in items)}
 (WORK/'narration_stats.json').write_text(json.dumps(stats,indent=2));print(json.dumps(stats),flush=True)
if __name__=='__main__':asyncio.run(main())

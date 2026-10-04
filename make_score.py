#!/usr/bin/env python3
"""Original six-act, 120-BPM procedural film score, 42 x 18-second shots.
Inspired by the offline instrument-synthesis workflow in Bemly/408,
with a new composition, voicings, six-act arrangement and speech-aware mix.
No external samples or copyrighted recordings are used.
"""
from functools import lru_cache
import pathlib,json,math
import numpy as np
import soundfile as sf
from scipy import signal
SR=48000;SHOT=18.;TAIL=6.;BEAT=.5;BAR=2.
ROOT=pathlib.Path.cwd();OUT=ROOT/'work/audio';OUT.mkdir(parents=True,exist_ok=True)
TL=json.loads((ROOT/'audio/timeline.json').read_text())['SHOTS']
rng=np.random.default_rng(20261005)

def midi(m):return 440.*2**((m-69)/12.)
def tm(d):return np.arange(round(d*SR),dtype=np.float64)/SR
def low(x,hz):return signal.sosfilt(signal.butter(2,hz,fs=SR,output='sos'),x,axis=0)
def band(x,lo,hi):return signal.sosfilt(signal.butter(2,[lo,hi],btype='bandpass',fs=SR,output='sos'),x,axis=0)
def env(t,a,d,hold=0):
 return np.minimum(1,t/max(.001,a))*np.exp(-np.maximum(0,t-hold)/max(.001,d))
@lru_cache(maxsize=160)
def piano(m,dur=2.8,soft=True):
 t=tm(dur);f=midi(m);x=np.zeros(len(t))
 for k in range(1,9):
  # Piano-like inharmonic partials with high harmonics decaying sooner.
  fk=f*k*np.sqrt(1+.00009*k*k)
  x+=(1/k**1.6)*np.sin(2*np.pi*fk*t+.08*k)*np.exp(-t*(1.6+.53*k))
 x*=np.minimum(1,t/.005);x*=np.minimum(1,(dur-t)/.07)
 return (x*.62).astype('float32')
@lru_cache(maxsize=160)
def mallet(m,dur=1.4):
 t=tm(dur);f=midi(m)
 x=(np.sin(2*np.pi*f*t)*np.exp(-3.7*t)+.23*np.sin(2*np.pi*2.01*f*t)*np.exp(-8*t)+.09*np.sin(2*np.pi*3.96*f*t)*np.exp(-12*t))
 return (x*np.minimum(1,t/.004)*.65).astype('float32')
@lru_cache(maxsize=140)
def strings(m,dur=2.,bright=.7):
 t=tm(dur+2.3);f=midi(m);x=np.zeros((len(t),2))
 for v,detune in enumerate([-.055,.028,.076]):
  fv=f*2**(detune/12);wave=np.zeros(len(t))
  for k in range(1,11):
   wave+=np.sin(2*np.pi*k*fv*t+.57*v+.08*k)/(k**(1.5 if bright>.8 else 1.9))
  x[:,0]+=wave*[.7,.45,.17][v];x[:,1]+=wave*[.2,.45,.65][v]
 e=np.minimum(1,t/.48)*np.exp(-np.maximum(0,t-dur)/.7)
 e*=.95+.05*np.sin(2*np.pi*4.8*t)
 x=low(x,1800+bright*1700)
 return (x*e[:,None]*.25).astype('float32')
@lru_cache(maxsize=120)
def bass(m,dur=.8):
 t=tm(dur+.15);f=midi(m)
 x=np.sin(2*np.pi*f*t)+.25*np.sin(2*np.pi*2*f*t)+.075*np.sin(2*np.pi*3*f*t)
 e=np.minimum(1,t/.012)*np.exp(-t/1.0)*np.minimum(1,np.maximum(0,dur+.15-t)/.16)
 return (x*e*.70).astype('float32')
@lru_cache(maxsize=4)
def kick():
 t=tm(.7);fq=43+90*np.exp(-t/.025);x=np.sin(2*np.pi*np.cumsum(fq)/SR)*np.exp(-t/.2)
 click=band(rng.normal(size=len(t)),1300,3900)*np.exp(-t/.005)*.13
 return (np.tanh((x+click)*1.2)*.7).astype('float32')
@lru_cache(maxsize=4)
def snare():
 t=tm(.28);x=band(rng.normal(size=len(t)),800,6000)*np.exp(-t/.062)*.42
 x+=np.sin(2*np.pi*182*t)*np.exp(-t/.052)*.2
 return x.astype('float32')
@lru_cache(maxsize=4)
def hat(opened=False):
 d=.25 if opened else .075;t=tm(d)
 x=band(rng.normal(size=len(t)),6300,13000)*np.exp(-t/(.05 if opened else .014))*.18
 return x.astype('float32')
@lru_cache(maxsize=4)
def taiko():
 t=tm(1.4);x=np.sin(2*np.pi*(72*t+4*(1-np.exp(-12*t))))*np.exp(-3*t)
 x+=.17*band(rng.normal(size=len(t)),90,900)*np.exp(-14*t)
 return (x*.5).astype('float32')
def whoosh(dur=1.1,up=True):
 t=tm(dur);noise=rng.normal(size=(len(t),2));out=np.zeros_like(noise)
 indices=np.linspace(0,len(t),28).astype(int)
 for j in range(27):
  frac=j/26;fc=350+(2600*frac if up else 2600*(1-frac));z=noise[indices[j]:indices[j+1]]
  out[indices[j]:indices[j+1]]=band(z,max(130,fc/2),min(7000,fc*2))
 e=np.sin(np.pi*t/dur)**2
 return (out*e[:,None]*.055).astype('float32')

# New harmony; all chords voiced as root/third/fifth/color rather than pure drones.
# Each row is an act: wonder, distributions, convergence, inference, action, resolution.
PROG=[
 [(50,53,57,64),(46,53,57,60),(53,57,60,67),(48,55,58,64)], # Dm9 Bbmaj9 Fmaj9 C(add9)
 [(53,57,60,67),(48,55,60,64),(50,57,60,65),(46,53,57,62)], # F C Dm Bb
 [(57,60,64,67),(53,57,60,65),(48,55,60,64),(55,59,62,69)], # Am F C G
 [(55,58,62,65),(51,58,62,67),(46,53,58,62),(50,57,60,66)], # Gm Eb Bb D7
 [(46,53,57,62),(53,57,60,65),(55,58,62,69),(48,55,60,64)], # Bb F Gm C
 [(50,54,57,64),(45,52,57,61),(47,54,57,62),(43,50,54,59)]  # D A Bm G
]
ACT_GAIN=[.60,.73,.86,.70,.95,1.]
ACT_NAMES=['偶然的微光','分布的形状','极限的交响','证据的尺度','行动的抉择','与不确定性同行']

def stereo_place(bus,sec,s,gain=1,pan=0):
 start=round(sec*SR)
 if s.ndim==1:
  ang=(pan+1)*np.pi/4;s=np.stack([s*np.cos(ang),s*np.sin(ang)],axis=1)*np.sqrt(2)
 if start<0:s=s[-start:];start=0
 n=min(len(s),len(bus)-start)
 if n>0:bus[start:start+n]+=s[:n]*gain

def render(shot):
 act=shot['act'];sid=shot['id'];n=round((SHOT+TAIL)*SR)
 tonal=np.zeros((n,2),np.float32);drum=np.zeros_like(tonal);lead=np.zeros_like(tonal);fx=np.zeros_like(tonal)
 section=[s['id'] for s in TL if s['act']==act];local=sid-section[0]
 progression=PROG[act]
 # 9 bars per shot. Chords change at bars 0,2,4,6,8; movement flows through shots.
 for bar in range(0,9,2):
  chord=progression[((local*9+bar)//2)%4];d=min(4.,SHOT-bar*BAR)
  for j,m in enumerate(chord):
   stereo_place(tonal,bar*BAR,strings(m,d,.45+.1*act),.105 if act!=3 else .082,(j-1.5)*.25)
  if act in [2,4,5]:stereo_place(tonal,bar*BAR,strings(chord[0]+12,d,.9),.053,-.1)
 # Pulse: changing bass line, varied percussion and counter-rhythms.
 for bar in range(9):
  bt=bar*BAR;chord=progression[((local*9+bar)//2)%4];root=chord[0]-12
  if sid==0 and bar<4:continue
  for beat in [0,2]:
   m=root if beat==0 else root+(7 if bar%3==1 else 0)
   stereo_place(tonal,bt+beat*BEAT,bass(m, .75 if act<2 else .9),.11)
  if act==0:
   stereo_place(drum,bt,kick(),.13 if sid>2 else .08)
   if sid>3:stereo_place(drum,bt+1,taiko(),.045)
  elif act==3:
   stereo_place(drum,bt,kick(),.10)
   if bar%2==1:stereo_place(drum,bt+1.,snare(),.12)
  else:
   for beat in [0,2]:stereo_place(drum,bt+beat*BEAT,kick(),.17)
   for beat in [1,3]:stereo_place(drum,bt+beat*BEAT,snare(),.13 if act==1 else .18, .08)
  if act>0:
   steps=8 if act in [2,4,5] else 4
   for st in range(steps):stereo_place(drum,bt+st*(2/steps),hat(st==steps-1 and bar%4==3),.32 if st%2==0 else .19,(-1)**st*.35)
  # 8th-note musical ostinato with deliberate rests, changing registers and chord inversions.
  pattern=[0,2,1,3,2,1,3,2] if act%2==0 else [0,1,2,3,1,2,0,3]
  for st,degree in enumerate(pattern):
   if act==0 and (st%2 or (sid<2 and bar%2)):continue
   if act==3 and st not in [0,3,4,7]:continue
   if sid==41 and bar>=6:continue
   note=chord[degree]+(12 if act in [1,2,4,5] else 0)
   gain=.060 if act in [1,2,4] else .040
   ins=mallet(note) if act in [1,3] else piano(note)
   stereo_place(lead,bt+st*.25,ins,gain,(-.35 if st%2==0 else .35))
  # Main lyrical motif enters in breathing gaps, transformed for each chord.
  for beat,deg in [(0,2),(1.5,3),(3,1)]:
   if act==0 and local<2 and bar%2:continue
   if act==3 and bar%2:continue
   m=chord[deg]+12
   stereo_place(lead,bt+beat*BEAT,piano(m,3.4),.072 if act in [0,3] else .095,(deg-1.5)*.13)
  # Every ninth bar acts as a punctuation / transition bar, with a soft tom fill.
  if bar==8 and sid<41:
   for off,g in [(0,.12),(.75,.08),(1.25,.075),(1.5,.09),(1.75,.11)]:
    stereo_place(drum,bt+off,taiko(),g)
 # Intro/act openings and transitions have their own arrangement.
 if local==0:
  stereo_place(fx,0,taiko(),.21)
  stereo_place(fx,0,whoosh(2.8,False),.8)
 if sid<41:stereo_place(fx,17.,whoosh(1.2,True),.85)
 if sid==41:
  # Final cadence resolves on D major, with enough tail for the end slate.
  for j,m in enumerate([38,50,54,57,62,66]):stereo_place(tonal,12,piano(m,5.7),.11 if j else .10,(j-2.5)*.1)
  stereo_place(fx,12,taiko(),.10)
 # Stereo reflection/delay, finite and deterministic; carry extends beyond the shot.
 dry=(tonal+lead).copy()
 for delay,g,swap in [(.23,.12,True),(.49,.10,False),(.79,.075,True),(1.13,.06,False),(1.61,.042,True)]:
  k=round(delay*SR);source=dry[:-k,::-1] if swap else dry[:-k];tonal[k:]+=source*g
 music=(tonal+lead+drum+fx)*ACT_GAIN[act]
 # A mild high-frequency ceiling keeps percussion comfortable for long listening.
 music=low(music,11500).astype('float32')
 return music

def main():
 carry=np.zeros((round(TAIL*SR),2),np.float32);peak=0.;en=0.;count=0
 with sf.SoundFile(OUT/'music_raw.wav','w',samplerate=SR,channels=2,subtype='FLOAT') as f:
  for shot in TL:
   m=render(shot);m[:len(carry)]+=carry
   body=m[:round(SHOT*SR)];carry=m[round(SHOT*SR):]
   if shot['id']==0:body*=np.clip(np.arange(len(body))/SR/2.7,0,1)[:,None]
   if shot['id']==41:
    t=tm(SHOT);body*=np.minimum(1,np.maximum(0,(SHOT-t)/5.0))[:,None]
   peak=max(peak,float(np.max(np.abs(body))));en+=float(np.sum(body.astype(np.float64)**2));count+=body.size
   f.write(body);print(f"Score {shot['id']:02}: {ACT_NAMES[shot['act']]} peak={np.max(np.abs(body)):.3f}",flush=True)
 # First-pass score level is calibrated globally, not independently per shot.
 gain=min(.70/max(peak,1e-6),.085/max((en/count)**.5,1e-6))
 manifest=json.loads((OUT/'narration_manifest.json').read_text()) if (OUT/'narration_manifest.json').exists() else []
 peak_out=0.;energy=0.;cnt=0
 with sf.SoundFile(OUT/'music_raw.wav') as src,sf.SoundFile(OUT/'music.wav','w',samplerate=SR,channels=2,subtype='PCM_24') as dst:
  frame=0
  while True:
   x=src.read(SR*6,dtype='float32',always_2d=True)
   if not len(x):break
   ts=(np.arange(len(x))+frame)/SR;envelope=np.ones(len(x),np.float32)
   for v in manifest:
    a=v['start'];b=v.get('actual_voice_end',v['end'])
    if b+.8<ts[0] or a-.13>ts[-1]:continue
    attack=np.clip((ts-(a-.13))/.16,0,1);release=np.clip(((b+.58)-ts)/.58,0,1)
    mask=np.minimum(attack,release);mask=np.maximum(0,mask)
    # -9 dB under speech; smooth release exposes transitions between sentences.
    envelope=np.minimum(envelope,1-.64*mask)
   x*=gain*envelope[:,None]
   dst.write(x);peak_out=max(peak_out,float(np.max(np.abs(x))));energy+=float(np.sum(x.astype(np.float64)**2));cnt+=x.size;frame+=len(x)
 stats={'title':'随机之美：六幕组曲','composer':'Original procedural score generated for this film','bpm':120,'time_signature':'4/4','bars_per_shot':9,'duration_seconds':756,'sample_rate':SR,'channels':2,'six_acts':ACT_NAMES,'peak':peak_out,'rms':(energy/cnt)**.5,'global_gain':gain,'ducking_db':20*math.log10(.36),'random_seed':20261005,'source_method_inspiration':'Bemly/408 audio/make_music2.py; newly composed notes, harmony and arrangement; no external audio samples'}
 (OUT/'music_stats.json').write_text(json.dumps(stats,ensure_ascii=False,indent=2));print(json.dumps(stats,ensure_ascii=False),flush=True)
if __name__=='__main__':main()

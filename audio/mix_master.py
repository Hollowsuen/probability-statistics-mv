#!/usr/bin/env python3
"""Mix narration and original score, then two-pass EBU R128 loudness normalize."""
import pathlib,json,re,subprocess,hashlib
import numpy as np
import soundfile as sf
R=pathlib.Path.cwd();W=R/'work/audio';SR=48000

def measure(path):
 peak=0.;sumsq=0.;count=0;clip=0
 with sf.SoundFile(path) as f:
  props={'frames':len(f),'duration_seconds':len(f)/f.samplerate,'sample_rate':f.samplerate,'channels':f.channels}
  while True:
   x=f.read(SR*10,dtype='float32',always_2d=True)
   if not len(x):break
   peak=max(peak,float(np.max(np.abs(x))));sumsq+=float(np.sum(x.astype(np.float64)**2));count+=x.size;clip+=int(np.sum(np.abs(x)>=.999999))
 return {**props,'sample_peak':peak,'sample_peak_dbfs':20*np.log10(max(peak,1e-12)),'rms':float((sumsq/count)**.5),'rms_dbfs':float(10*np.log10(sumsq/count)),'clipped_samples':clip}
def ff(args):
 proc=subprocess.run(['ffmpeg','-hide_banner','-y',*args],capture_output=True,text=True)
 if proc.returncode:raise RuntimeError(proc.stderr)
 return proc.stderr
def get_json(log):
 found=re.findall(r'\{\s*"input_i".*?\}',log,re.S)
 if not found:raise RuntimeError('No loudnorm JSON')
 return json.loads(found[-1])
def main():
 with sf.SoundFile(W/'narration.wav') as v,sf.SoundFile(W/'music.wav') as m,sf.SoundFile(W/'master_raw.wav','w',samplerate=SR,channels=2,subtype='FLOAT') as out:
  assert len(v)==len(m)==756*SR and v.channels==m.channels==2
  while True:
   x=v.read(SR*8,dtype='float32',always_2d=True);y=m.read(len(x),dtype='float32',always_2d=True)
   if not len(x):break
   out.write(x+y*.75)
 target='I=-16.5:TP=-1.2:LRA=10'
 log=ff(['-i',str(W/'master_raw.wav'),'-af',f'loudnorm={target}:print_format=json','-f','null','-'])
 first=get_json(log);(W/'loudnorm_first.json').write_text(json.dumps(first,indent=2))
 filt=f"loudnorm={target}:measured_I={first['input_i']}:measured_TP={first['input_tp']}:measured_LRA={first['input_lra']}:measured_thresh={first['input_thresh']}:offset={first['target_offset']}:linear=true:print_format=json"
 log2=ff(['-i',str(W/'master_raw.wav'),'-af',filt,'-ar',str(SR),'-ac','2','-c:a','pcm_s24le',str(W/'master.wav')])
 final=get_json(log2);(W/'loudnorm_final.json').write_text(json.dumps(final,indent=2))
 report={'narration':measure(W/'narration.wav'),'music':measure(W/'music.wav'),'master':measure(W/'master.wav'),'loudnorm':final,'master_music_gain':.75,'all_84_lines':len(json.loads((W/'narration_manifest.json').read_text()))==84}
 assert report['master']['clipped_samples']==0
 assert report['master']['duration_seconds']==756
 (W/'audio_qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
 # Compact review excerpts; not final public artifacts.
 for name,start,dur in [('opening',0,36),('bayes',90,18),('clt',414,18),('inference',540,54),('finale',720,36)]:
  ff(['-ss',str(start),'-i',str(W/'master.wav'),'-t',str(dur),'-c:a','libmp3lame','-b:a','192k',str(W/f'preview_{name}.mp3')])
 # Save reproducibility evidence alongside source, with source text hashes.
 src=R/'audio'
 for name in ['narration_manifest.json','narration_stats.json','music_stats.json','audio_qa.json']:(src/name).write_bytes((W/name).read_bytes())
 print(json.dumps(report,ensure_ascii=False,indent=2),flush=True)
if __name__=='__main__':main()

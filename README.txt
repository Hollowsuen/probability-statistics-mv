随机之美 · 音频源码

仓库已提供 public/master.m4a，可直接渲染影片，不必重建音轨。
以下命令均在仓库根目录运行；需要 Python 3、ffmpeg 和 ffprobe。

1. 安装依赖：
   python3 -m venv .venv
   .venv/bin/pip install -r audio/requirements.txt
2. 生成中文旁白（Microsoft Edge 神经 TTS，zh-CN-YunxiNeural，需要网络）：
   .venv/bin/python audio/make_narration.py --timeline audio/timeline.json
3. 生成原创配乐：
   .venv/bin/python audio/make_score.py
4. 混合并做两遍 EBU R128 响度归一化：
   .venv/bin/python audio/mix_master.py
5. 将新母带编码到影片使用的位置：
   ffmpeg -y -i work/audio/master.wav -c:a aac -b:a 256k public/master.m4a

make_narration.py 生成 84 句中文男声，默认语速 +6%，保留自然停顿，必要时轻微 atempo；带原文校验的缓存保存在 work/audio。
make_score.py 生成六幕 120 BPM 程序化配乐，每镜头 18 秒、9 小节；包括钢琴、木琴、弦垫、低音、鼓与转场，并按实际配音区间降低音乐音量。
mix_master.py 输出 48 kHz 立体声 24-bit WAV，目标 -16.5 LUFS、-1.2 dBTP。

中间音频、复核片段和 WAV 母带保存在 work/audio，不纳入版本控制。
字幕保存到 captions/zh-CN.srt，重建会覆盖该文件。
旁白时长、响度等实测记录更新到 audio/ 下对应 JSON 文件。

修改 timeline.mjs 的旁白后，须先同步 audio/timeline.json，再重建音轨。
可运行以下命令同步：
node --input-type=module -e "import fs from 'node:fs'; import {SHOTS} from './timeline.mjs'; fs.writeFileSync('audio/timeline.json', JSON.stringify({SHOTS}, null, 2));"

谱曲与编排为此影片新写；离线乐器合成与分轨方法参考 Bemly/408 audio/make_music2.py，没有使用外部录音或商业歌曲采样。
配音对 p/t/F 字母仅作发音文本适配，字幕保持分镜原文。
实际音频测量见 audio_qa.json，逐句时间与压缩比例见 narration_manifest.json。

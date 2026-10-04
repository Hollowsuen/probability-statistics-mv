# 随机之美 · 概率统计

**The Beauty of Chance** — 一部从偶然走向证据与行动的概率统计学习 MV。

[![随机之美封面](docs/cover.png)](https://github.com/Hollowsuen/probability-statistics-mv/releases/latest)

**12 分 36 秒 · 1920 × 1080 · 60 fps · 六幕 42 镜头 · 84 段中文旁白 · 原创配乐**

从硬币、骰子和到站等待，进入分布、期望、极限定理与统计推断，再走向回归、试验设计、决策和随机过程。动画以具体模型、数据和公式串联概率统计的主干知识。

[**下载完整影片与材料 →**](https://github.com/Hollowsuen/probability-statistics-mv/releases/latest) · [中文字幕](captions/zh-CN.srt) · [观影与学习索引](docs/chapters.txt) · [42 镜头教材页码对应](references/教材镜头索引.json)

## 观看与学习

完整 MP4 发布在 **[Releases](https://github.com/Hollowsuen/probability-statistics-mv/releases)**，采用 H.264 视频和 AAC 立体声音频，画面内已包含中文字幕与公式，并提供 42 个 MP4 章节。支持章节的本地播放器可以按知识点跳转。

| 时间 | 幕 | 内容 |
| --- | --- | --- |
| 00:00 | 世界充满偶然 | 随机事件、条件概率、贝叶斯、独立性与计数 |
| 02:24 | 随机的语言 | 随机变量、常见分布、分布函数与多维分布 |
| 05:24 | 混沌中的秩序 | 相关、期望、方差、卷积、大数定律、中心极限定理与蒙特卡洛 |
| 07:48 | 让数据成为证据 | 抽样、统计量、似然、估计、置信区间与假设检验 |
| 10:30 | 理解，然后行动 | 回归、方差分析、试验设计、贝叶斯决策与随机过程 |
| 12:00 | 与不确定性同行 | 学科联系与片尾 |

本片是学科导览；学习时可结合字幕、公式和教材索引暂停回看。建模条件保留在画面与来源索引中，例如独立同分布、有限非零方差、重复抽样覆盖，以及 p 值所依赖的原假设模型。

## 本地预览与重新渲染

准备 Node.js、npm，以及可从命令行运行的 `ffmpeg` 和 `ffprobe`。在仓库根目录执行：

```bash
npm install
npm run studio
```

`studio` 打开 Remotion 预览。渲染完整影片：

```bash
npm run render
```

成片保存到 `outputs/随机之美_概率统计_1080p60.mp4`，包含画面、现成音轨和 42 个章节。渲染会生成 `work/picture.mp4` 等中间文件；建议预留足够磁盘空间。

也可以执行：

```bash
npm run poster           # 生成封面帧
npm run render:frames    # 只渲染无声画面
npm run render:remotion  # 通过 Remotion 渲染
```

Canvas 离线渲染与 Remotion 共用同一套绘图和场景代码。Remotion 渲染需要 Chrome 或其管理的 Chrome Headless Shell；不同渲染器的文字抗锯齿可能略有差异。

仓库已包含 `public/master.m4a` 母带，可以直接渲染。若修改旁白，请同步音频时间轴并重建音轨；步骤见 [音频说明](audio/README.txt)。中文配音使用 Microsoft Edge 神经 TTS（`zh-CN-YunxiNeural`），重新生成配音需要网络。配乐由程序合成，包含钢琴、木琴、弦垫、低音、鼓与转场，没有使用外部录音或商业歌曲采样。

## 文件结构

```text
film.mjs                  逐帧绘图与转场引擎
helpers.mjs               字体、图形、相机与插值辅助
scenes/                   概率基础、分布、统计与应用场景
timeline.mjs              42 镜头时间轴、标题、公式与旁白
render.mjs / export.mjs   Canvas 离线渲染与最终音画封装
remotion.tsx              Remotion 预览与渲染入口
public/master.m4a         全片立体声母带
public/fonts/             随附字体与 SIL OFL 许可文本
audio/                    配音、谱曲、混音脚本及音频测量记录
captions/zh-CN.srt        中文字幕
docs/                     封面与观影学习索引
references/               教材核验与镜头页码对应
```

`references/教材镜头索引.json` 对应最终 **42 镜头、756 秒**影片。`references/教材核验.json` 保留教材信息、数学核验与早期 **34 镜头备选创意**，其中备选时间轴不代表最终成片。

## 参考与致谢

动画架构与创作方法参考 **[Bemly/408](https://github.com/Bemly/408)**，对应提交 [`db7ed83f9f271edf7830a74dfd037eabc37928c2`](https://github.com/Bemly/408/tree/db7ed83f9f271edf7830a74dfd037eabc37928c2)。参考范围包括时间轴与分镜组织、缓动与镜头进出、确定性随机函数，以及程序化配乐方法；本片场景、图形示例与叙述围绕概率统计重新编写。

知识范围与数学条件参考以下教材：

- 陈家鼎、刘婉如、汪仁官：《概率统计讲义》第三版，高等教育出版社，2004 年。
- 茆诗松、程依明、濮晓龙、倪葎：《概率论与数理统计教程》第四版，高等教育出版社。

参考资料用于知识定位和公式条件核验，仓库与发布包不包含教材原 PDF 或教材扫描页。

字体使用 Noto Sans SC、Noto Serif SC、JetBrains Mono、Noto Sans 和 Noto Sans Math，随附许可见 [public/fonts](public/fonts)。其中部分中文可变字体已固定字重，用于保持渲染一致性。本仓库保留现有来源说明与字体许可证，没有额外授予原参考仓库代码新的许可证；依赖软件遵循各自许可。

/* Original deterministic animations for the statistical-inference act.
 * Coordinates are deliberately restricted to the scene stage, y = 265..830.
 * Textbook examples are illustrative data, not observations from a real study.
 */
const TAU = Math.PI * 2;
const pdf = z => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
const cdf = x => {
  const s = x < 0 ? -1 : 1, a = Math.abs(x) / Math.sqrt(2), q = 1 / (1 + .3275911 * a);
  const e = 1 - (((((1.061405429 * q - 1.453152027) * q) + 1.421413741) * q - .284496736) * q + .254829592) * q * Math.exp(-a * a);
  return (1 + s * e) / 2;
};
const seeded = seed => { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123; return x - Math.floor(x); };
const normal = seed => Math.sqrt(-2 * Math.log(Math.max(1e-8, seeded(seed)))) * Math.cos(TAU * seeded(seed + 434));
function alpha(ctx, a, fn) { ctx.save(); ctx.globalAlpha *= a; fn(); ctx.restore(); }
function dashed(ctx, h, x1, y1, x2, y2, col, width = 2, dash = [8, 8]) {
  ctx.save(); ctx.setLineDash(dash); h.line(ctx, x1, y1, x2, y2, col, width); ctx.restore();
}
function shade(ctx, h, fn, lo, hi, x, y, w, ht, xmin, xmax, ymax, color) {
  const pts = [[x + (lo - xmin) / (xmax - xmin) * w, y]];
  for (let j = 0; j <= 90; j++) { const v = lo + (hi - lo) * j / 90; pts.push([x + (v - xmin) / (xmax - xmin) * w, y - ht * fn(v) / ymax]); }
  pts.push([x + (hi - xmin) / (xmax - xmin) * w, y]); h.path(ctx, pts, null, 1, true, color);
}
function plant(ctx, h, x, ground, height, color, t = 0, leaves = 4) {
  const sway = Math.sin(t * 1.3 + x * .006) * Math.min(5, height * .03);
  h.path(ctx, [[x, ground], [x - sway * .35, ground - height * .48], [x + sway, ground - height]], color, 5);
  for (let j = 0; j < leaves; j++) {
    const yy = ground - height * (.22 + j * .16), side = j % 2 ? 1 : -1, size = Math.max(8, Math.min(30, height * .17));
    const xx = x + sway * (.22 + j * .16);
    ctx.save(); ctx.fillStyle = color; ctx.translate(xx, yy); ctx.rotate(side * -.6);
    ctx.beginPath(); ctx.ellipse(side * size * .48, -size * .25, size * .75, size * .30, side * -.45, 0, TAU); ctx.fill(); ctx.restore();
  }
  h.circle(ctx, x + sway, ground - height, Math.max(3, height * .027), h.C.gold);
}
function sun(ctx, h, x, y, r, t) {
  for (let i = 0; i < 12; i++) { const a = TAU * i / 12 + t * .035; h.line(ctx, x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 1.3, x + Math.cos(a) * r * 1.75, y + Math.sin(a) * r * 1.75, h.C.gold, 3, .65); }
  h.circle(ctx, x, y, r, h.C.gold + '24', h.C.gold, 3); h.circle(ctx, x, y, r * .7, h.C.gold + '44');
}
function greenhouse(ctx, h, x, y, w, ht, color) {
  const roof = Math.min(65, ht * .23);
  h.path(ctx, [[x, y + ht], [x, y + roof], [x + w / 2, y], [x + w, y + roof], [x + w, y + ht]], color + '88', 3, false, color + '09');
  h.line(ctx, x, y + roof, x + w, y + roof, color, 2, .25);
  for (let k = 1; k < 4; k++) h.line(ctx, x + w * k / 4, y + roof, x + w * k / 4, y + ht, color, 1, .15);
  h.line(ctx, x, y + ht, x + w, y + ht, color, 3, .7);
}

// 26 — Sampling is a physical operation on a population, not an abstract bag.
const sampleIDs = Array.from({ length: 96 }, (_, id) => id).sort((a, b) => seeded(a + 278) - seeded(b + 278)).slice(0, 12);
function sampling(ctx, t, h) {
  const { C } = h, randomP = h.ease((t - 3.4) / 5.3), convenientP = h.ease((t - 10) / 4.1);
  h.text(ctx, '城市总体 · 96 人', 170, 307, 30, C.text, 'left', 'sans', 600);
  h.text(ctx, '两类居民各 48 人（示意）', 170, 342, 25, C.muted);
  h.panel(ctx, 120, 365, 850, 413, C.blue);
  // Eight neighbourhood blocks, with a street and a marked city entrance.
  for (let row = 0; row < 2; row++) for (let col = 0; col < 4; col++) {
    h.rect(ctx, 144 + col * 204, 387 + row * 187, 179, 157, '#12243a', '#45617544', 15, 1);
    h.rect(ctx, 161 + col * 204, 397 + row * 187, 30, 43, '#28405c', null, 4);
    h.rect(ctx, 199 + col * 204, 407 + row * 187, 41, 33, '#233b55', null, 4);
    h.rect(ctx, 249 + col * 204, 392 + row * 187, 46, 48, '#1e344c', null, 4);
    for (let win = 0; win < 3; win++) h.rect(ctx, 254 + col * 204 + win * 12, 403 + row * 187, 6, 7, C.gold + '45', null, 1);
  }
  const pos = id => {
    const row = Math.floor(id / 48), block = Math.floor((id % 48) / 12), inside = id % 12;
    return [167 + block * 204 + (inside % 4) * 38, 478 + row * 187 + Math.floor(inside / 4) * 31];
  };
  const peopleProgress = h.clamp(t / 2.8);
  for (let id = 0; id < 96; id++) {
    const [x, y] = pos(id), a = h.clamp(peopleProgress * 2 - id / 96);
    alpha(ctx, a, () => h.person(ctx, x, y + Math.sin(t * .8 + id) * .9, .75, id < 48 ? C.gold : C.cyan));
    if (sampleIDs.includes(id) && t > 3.4) alpha(ctx, randomP, () => h.circle(ctx, x, y - 12, 16 + Math.sin(t * 2 + id) * 1.1, null, C.green, 2));
  }
  h.label(ctx, '入口', 912, 794, C.red);
  h.arrow(ctx, 947, 753, 920, 705, C.red, 2);
  h.panel(ctx, 1040, 365, 750, 188, C.green);
  h.panel(ctx, 1040, 585, 750, 188, C.red);
  h.text(ctx, '让每位居民都有同等入选机会', 1070, 404, 27, C.green);
  h.text(ctx, '只访问入口附近的人', 1070, 624, 27, C.red);
  sampleIDs.forEach((id, j) => {
    const [sx, sy] = pos(id), tx = 1100 + j * 56, ty = 476;
    const p = h.ease((t - 3.8 - j * .15) / 2.6);
    if (p > 0) h.person(ctx, h.lerp(sx, tx, p), h.lerp(sy, ty, p) - Math.sin(Math.PI * p) * 110, 1.0, id < 48 ? C.gold : C.cyan);
  });
  for (let j = 0; j < 12; j++) {
    const [sx, sy] = pos(84 + j), p = h.ease((t - 10.2 - j * .13) / 2.4);
    if (p > 0) h.person(ctx, h.lerp(sx, 1100 + j * 56, p), h.lerp(sy, 696, p) + Math.sin(Math.PI * p) * 50, 1.0, C.cyan);
  }
  alpha(ctx, randomP, () => h.text(ctx, `一次随机样本：金色 ${sampleIDs.filter(n => n < 48).length} 人 / 青色 ${sampleIDs.filter(n => n >= 48).length} 人`, 1070, 527, 24, C.muted));
  alpha(ctx, convenientP, () => h.text(ctx, '样本再大，也可能保留选择偏差', 1070, 747, 25, C.red));
}

// 27 — Five measured parts travel from a production belt to sample statistics.
function statistics(ctx, t, h) {
  const { C } = h, values = [6, 8, 10, 12, 14], residuals = [-4, -2, 0, 2, 4];
  h.text(ctx, '示例 n = 5：从测量值提取可比较的信息', 150, 305, 29, C.muted);
  h.rect(ctx, 150, 426, 1050, 44, '#263a52', '#456175', 20, 2);
  for (let j = 0; j < 20; j++) h.circle(ctx, 180 + j * 52, 449, 12, '#0d1727', '#456175', 2);
  for (let j = 0; j < 19; j++) { const x = 170 + ((j * 57 + t * 33) % 1000); h.line(ctx, x, 439, x + 24, 439, C.cyan, 2, .35); }
  values.forEach((v, i) => {
    const p = h.out((t - i * .45) / 2), x = 235 + i * 200;
    alpha(ctx, p, () => { h.rect(ctx, x - 65, 334 - Math.sin(Math.PI * p) * 55, 130, 90, C.cyan + '18', C.cyan, 15, 2); h.text(ctx, String(v), x, 393 - Math.sin(Math.PI * p) * 55, 43, C.text, 'center', 'mono', 600); });
    h.text(ctx, `x${i + 1}`, x, 511, 24, C.muted, 'center', 'mono');
  });
  h.arrow(ctx, 1220, 410, 1350, 410, C.gold, 4);
  h.panel(ctx, 1380, 335, 380, 160, C.gold);
  alpha(ctx, h.ease((t - 3) / 2), () => { h.text(ctx, '样本均值', 1570, 378, 27, C.gold, 'center'); h.text(ctx, '10', 1570, 457, 68, C.text, 'center', 'mono', 600); });
  const p2 = h.ease((t - 5.2) / 4);
  h.text(ctx, '每项偏差的平方', 155, 563, 25, C.muted);
  const base = 755;
  residuals.forEach((r, i) => {
    const x = 235 + i * 200, bh = r * r * 9 * p2;
    alpha(ctx, p2, () => {
      h.line(ctx, x - 55, base, x + 55, base, C.muted, 2, .5);
      h.rect(ctx, x - 45, base - bh, 90, Math.max(3, bh), C.violet + '44', C.violet, 8, 2);
      h.text(ctx, `(${r > 0 ? '+' : ''}${r})²`, x, 794, 25, C.muted, 'center', 'mono');
      h.text(ctx, String(r * r), x, base - bh - 14, 30, C.violet, 'center', 'mono', 600);
    });
  });
  h.panel(ctx, 1380, 574, 380, 192, C.violet);
  alpha(ctx, h.ease((t - 10) / 3), () => {
    h.text(ctx, '无偏样本方差', 1570, 620, 27, C.violet, 'center');
    h.text(ctx, '40 ÷ 4 = 10', 1570, 681, 37, C.text, 'center', 'mono', 600);
    h.text(ctx, '分母是 n − 1', 1570, 729, 25, C.muted, 'center');
    h.arrow(ctx, 1220, 683, 1350, 683, C.violet, 3);
  });
}

// 28 — A likelihood is a function of the model parameter after the data are fixed.
function likelihood(ctx, t, h) {
  const { C } = h, peak = .7 ** 7 * .3 ** 3, fn = p => p ** 7 * (1 - p) ** 3 / peak;
  h.text(ctx, '观察结果固定：10 次独立投掷，7 正 3 反', 150, 306, 30, C.text);
  for (let i = 0; i < 10; i++) {
    const p = h.out((t - i * .25) / 1.25), x = 235 + i * 151, y = 385 - Math.sin(Math.PI * p) * 47;
    alpha(ctx, p, () => h.coin(ctx, x, y, 39, p < 1 ? t * 8 + i : 0, i < 7 ? C.gold : C.blue, i < 7 ? '正' : '反'));
  }
  h.axes(ctx, 240, 747, 1070, 245, { xLabel: '参数 p', yLabel: '相对似然', xTicks: [[0, '0'], [.2, '0.2'], [.4, '0.4'], [.6, '0.6'], [.8, '0.8'], [1, '1']], yTicks: [[0, '0'], [.5, '0.5'], [1, '1']] });
  h.curve(ctx, fn, 240, 747, 1070, 245, 0, 1, 1, C.gold, h.ease((t - 3.3) / 4.1), true);
  const scan = t < 11 ? h.lerp(.1, .7, h.ease((t - 5) / 6)) : .7;
  const px = 240 + scan * 1070, py = 747 - fn(scan) * 245;
  alpha(ctx, h.ease((t - 4.5) / 1.4), () => {
    dashed(ctx, h, px, 747, px, py, C.cyan, 2); h.circle(ctx, px, py, 9 + Math.sin(t * 2.6) * 1.2, C.cyan);
    h.label(ctx, `p = ${scan.toFixed(2)}`, px, Math.max(485, py - 20), C.cyan);
  });
  h.panel(ctx, 1420, 499, 360, 250, C.gold);
  h.text(ctx, t < 11 ? '当前候选参数' : '最契合这次观察', 1600, 552, 28, C.gold, 'center');
  h.text(ctx, scan.toFixed(2), 1600, 638, 72, C.text, 'center', 'mono', 600);
  alpha(ctx, h.ease((t - 10.5) / 2), () => h.text(ctx, '最大似然估计', 1600, 710, 27, C.muted, 'center'));
  h.text(ctx, '曲线纵轴已按最大值归一化；不是 p 的概率密度', 240, 820, 24, C.muted);
}

// 29 — Exponential waiting times, with units carried through the estimate.
function pointEstimate(ctx, t, h) {
  const { C } = h, obs = [2, 3, 4, 5, 6], grow = h.ease((t - 2) / 4), base = 735;
  h.text(ctx, '5 个独立等待时间 · 指数分布模型（示例）', 150, 306, 29, C.text);
  const start = 240, gap = 243;
  for (let i = 0; i < 5; i++) {
    const x = start + i * gap, r = 48, p = h.out((t - i * .3) / 2);
    alpha(ctx, p, () => {
      h.circle(ctx, x, 396, r, '#152b40', C.cyan, 3); h.rect(ctx, x - 9, 334, 18, 13, C.cyan, null, 3);
      for (let k = 0; k < 12; k++) { const a = k * TAU / 12; h.line(ctx, x + Math.sin(a) * 39, 396 - Math.cos(a) * 39, x + Math.sin(a) * 43, 396 - Math.cos(a) * 43, C.muted, 2); }
      const a = obs[i] / 12 * TAU * p + (t < 3 ? t * .8 : 0); h.line(ctx, x, 396, x + Math.sin(a) * 30, 396 - Math.cos(a) * 30, C.gold, 4); h.circle(ctx, x, 396, 4, C.text);
    });
    const bh = obs[i] * 35 * grow;
    h.rect(ctx, x - 51, base - bh, 102, bh, C.cyan + '22', C.cyan, 10, 2);
    alpha(ctx, grow, () => h.text(ctx, `${obs[i]} 分钟`, x, base - bh - 19, 30, C.cyan, 'center'));
    h.line(ctx, x - 77, base, x + 77, base, C.muted, 2, .5);
  }
  alpha(ctx, h.ease((t - 5.5) / 2.7), () => {
    dashed(ctx, h, 145, base - 140, 1300, base - 140, C.gold, 3);
    h.label(ctx, '平均等待 4 分钟', 710, 792, C.gold);
  });
  h.panel(ctx, 1400, 355, 380, 390, C.gold);
  h.text(ctx, '单位时间的发生速率', 1590, 405, 27, C.gold, 'center');
  alpha(ctx, h.ease((t - 8.4) / 2.3), () => {
    h.text(ctx, '0.25', 1590, 493, 72, C.text, 'center', 'mono', 600);
    h.text(ctx, '次 / 分钟', 1590, 537, 29, C.muted, 'center');
    h.line(ctx, 1440, 565, 1740, 565, C.gold, 1, .35);
    h.text(ctx, '最大似然估计', 1590, 614, 27, C.text, 'center');
    h.text(ctx, '与矩估计在此一致', 1590, 662, 25, C.muted, 'center');
    for (let j = 0; j < 5; j++) { const x = 1450 + ((t * 45 + j * 63) % 280); h.circle(ctx, x, 708, 4, C.gold + '99'); }
  });
}

// 30 — Every mean comes from a seeded normal draw. No forced coverage count.
// Teaching demonstration seed 2026: all 24 generated means are retained.
// The resulting coverage is 23/24, not a forced 95% count.
const intervalMeans = Array.from({ length: 24 }, (_, i) => 2 * normal(2026 + i));
function confidence(ctx, t, h) {
  const { C } = h, muX = 818, xScale = 62, half = 1.96 * 2, nShow = Math.min(24, Math.floor(Math.max(0, t - 1) * 2.3));
  h.text(ctx, '正态总体 · σ = 10 已知 · 每次抽取 n = 25', 145, 304, 28, C.text);
  h.text(ctx, '重复抽样模拟示例 · 24 个区间', 145, 342, 25, C.muted);
  h.line(ctx, muX, 355, muX, 797, C.gold, 3);
  h.label(ctx, '固定真值 μ = 0', muX, 811, C.gold);
  let covered = 0;
  for (let i = 0; i < 24; i++) {
    const m = intervalMeans[i], hit = Math.abs(m) <= half, col = hit ? C.cyan : C.red;
    const p = h.ease((t - 1 - i / 2.3) * 2), y = 371 + i * 16.6;
    if (i < nShow && hit) covered++;
    if (p <= 0) continue;
    alpha(ctx, p, () => {
      h.text(ctx, String(i + 1).padStart(2, '0'), 200, y + 5, 18, C.muted, 'right', 'mono');
      const cx = muX + m * xScale, x1 = cx - half * xScale * p, x2 = cx + half * xScale * p;
      h.line(ctx, x1, y, x2, y, col, i === Math.min(23, nShow - 1) ? 4 : 2.3, .9);
      h.line(ctx, x1, y - 5, x1, y + 5, col, 2); h.line(ctx, x2, y - 5, x2, y + 5, col, 2); h.circle(ctx, cx, y, 3.7, col);
    });
  }
  h.panel(ctx, 1420, 369, 365, 395, C.cyan);
  h.text(ctx, '区间在变', 1603, 430, 34, C.cyan, 'center');
  h.text(ctx, '真值不变', 1603, 478, 34, C.gold, 'center');
  const seen = Math.max(0, nShow);
  h.text(ctx, `${covered} / ${seen}`, 1603, 563, 56, C.text, 'center', 'mono', 600);
  h.text(ctx, '当前已出现区间的覆盖数', 1603, 607, 24, C.muted, 'center');
  alpha(ctx, h.ease((t - 11) / 2.5), () => {
    h.line(ctx, 1450, 637, 1755, 637, C.cyan, 1, .3);
    h.text(ctx, '95% 指方法的', 1603, 683, 28, C.text, 'center');
    h.text(ctx, '长期覆盖率', 1603, 727, 30, C.cyan, 'center');
  });
}

// 31 — Both tails are shaded, conditional on H0 and the assumed model.
function hypothesis(ctx, t, h) {
  const { C } = h, x = 230, y = 749, w = 1195, ht = 337, xmin = -4, xmax = 4, ymax = .42;
  h.text(ctx, 'H₀ 与正态模型成立时，Z 的参考分布', 160, 305, 29, C.text);
  h.axes(ctx, x, y, w, ht, { xLabel: 'Z', xTicks: [[0, '−4'], [.25, '−2'], [.5, '0'], [.75, '2'], [1, '4']], yTicks: [[0, '0'], [.2 / ymax, '0.2'], [.4 / ymax, '0.4']] });
  const tailP = h.ease((t - 5) / 3.5);
  alpha(ctx, tailP, () => {
    shade(ctx, h, pdf, -4, -2, x, y, w, ht, xmin, xmax, ymax, C.red + '60');
    shade(ctx, h, pdf, 2, 4, x, y, w, ht, xmin, xmax, ymax, C.red + '60');
    for (const z of [-2, 2]) { const xx = x + (z + 4) / 8 * w; dashed(ctx, h, xx, y, xx, y - ht * pdf(z) / ymax, C.red, 3); }
  });
  h.curve(ctx, pdf, x, y, w, ht, xmin, xmax, ymax, C.cyan, h.ease(t / 4), false);
  const z = 2 * h.ease((t - 3) / 5), zx = x + (z + 4) / 8 * w;
  alpha(ctx, h.ease((t - 3) / 1), () => { h.circle(ctx, zx, y - ht * pdf(z) / ymax, 8, C.gold); h.label(ctx, `观测 z = ${z.toFixed(2)}`, zx + 70, 387, C.gold); });
  alpha(ctx, tailP, () => {
    h.arrow(ctx, x + w * .125, 636, x + w * .18, 719, C.red, 2);
    h.arrow(ctx, x + w * .88, 636, x + w * .82, 719, C.red, 2);
    h.text(ctx, '同样或更极端', x + w * .5, 802, 26, C.red, 'center');
  });
  h.panel(ctx, 1482, 384, 310, 360, C.red);
  h.text(ctx, '双侧 p 值', 1637, 444, 29, C.red, 'center');
  alpha(ctx, tailP, () => {
    h.text(ctx, '0.0455', 1637, 523, 52, C.text, 'center', 'mono', 600);
    h.text(ctx, '两尾面积之和', 1637, 571, 25, C.muted, 'center');
  });
  alpha(ctx, h.ease((t - 11) / 2), () => { h.text(ctx, '预设 α = 0.05', 1637, 644, 25, C.muted, 'center'); h.text(ctx, '此例拒绝 H₀', 1637, 697, 30, C.red, 'center'); });
}

// 32 — Type II error is always relative to a specified alternative.
function errors(ctx, t, h) {
  const { C } = h, x = 170, y = 744, w = 1250, ht = 340, lo = -3, hi = 6, ymax = .43;
  const threshold = 1.6 + .65 * Math.sin(Math.max(0, t - 4) * .45);
  const xx = v => x + (v - lo) / (hi - lo) * w, H1 = z => pdf(z - 2.5);
  h.text(ctx, '检测仪器的报警阈值：向右移动，误报减少，漏检增加', 145, 305, 28, C.text);
  h.axes(ctx, x, y, w, ht, { xLabel: '检测读数', xTicks: [[1 / 9, '−2'], [3 / 9, '0'], [5 / 9, '2'], [7 / 9, '4'], [1, '6']] });
  alpha(ctx, h.ease((t - 3) / 3), () => {
    shade(ctx, h, pdf, threshold, hi, x, y, w, ht, lo, hi, ymax, C.red + '55');
    shade(ctx, h, H1, lo, threshold, x, y, w, ht, lo, hi, ymax, C.violet + '44');
  });
  h.curve(ctx, pdf, x, y, w, ht, lo, hi, ymax, C.cyan, h.ease(t / 3), false);
  h.curve(ctx, H1, x, y, w, ht, lo, hi, ymax, C.gold, h.ease((t - 1.5) / 3), false);
  h.label(ctx, 'H₀：合格', xx(0), 371, C.cyan); h.label(ctx, '指定 H₁：有缺陷', xx(2.5), 371, C.gold);
  const tx = xx(threshold);
  h.line(ctx, tx, 395, tx, y, C.text, 3, .8); h.rect(ctx, tx - 15, y - 7, 30, 14, C.text, null, 4);
  h.label(ctx, `阈值 ${threshold.toFixed(2)}`, tx, 805, C.text);
  h.panel(ctx, 1485, 377, 305, 368, C.red);
  h.text(ctx, '第一类错误 α', 1637, 430, 27, C.red, 'center');
  h.text(ctx, `${((1 - cdf(threshold)) * 100).toFixed(1)}%`, 1637, 492, 48, C.red, 'center', 'mono');
  h.text(ctx, 'H₀ 为真时误拒绝', 1637, 532, 23, C.muted, 'center');
  h.line(ctx, 1520, 561, 1755, 561, C.muted, 1, .3);
  h.text(ctx, '第二类错误 β', 1637, 606, 27, C.violet, 'center');
  h.text(ctx, `${(cdf(threshold - 2.5) * 100).toFixed(1)}%`, 1637, 668, 48, C.violet, 'center', 'mono');
  h.text(ctx, '此 H₁ 下未拒绝 H₀', 1637, 712, 23, C.muted, 'center');
}

function gamma(z) {
  const p = [.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -.13857109526572012, 9.984369578019572e-6, 1.5056327351493116e-7];
  if (z < .5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  z -= 1; let a = p[0]; for (let k = 1; k < p.length; k++) a += p[k] / (z + k);
  const b = z + 7.5; return Math.sqrt(2 * Math.PI) * b ** (z + .5) * Math.exp(-b) * a;
}
const beta58 = gamma(2.5) * gamma(4) / gamma(6.5);
const chi4 = x => x <= 0 ? 0 : x * Math.exp(-x / 2) / 4;
const t4 = x => .375 * (1 + x * x / 4) ** -2.5;
const f58 = x => x <= 0 ? 0 : (5 / 8) ** 2.5 * x ** 1.5 / (beta58 * (1 + 5 * x / 8) ** 6.5);
// 33 — Three explicit constructions; independent ingredients are labelled.
function samplingDistributions(ctx, t, h) {
  const { C } = h;
  h.text(ctx, '独立标准正态变量，搭建推断所需的三种分布', 145, 307, 29, C.text);
  const cards = [
    { x: 120, name: 'χ²₄', col: C.cyan, sub: '4 个独立 Z 的平方相加', fn: chi4, lo: 0, hi: 14, max: .2, ticks: [[0, '0'], [.5, '7'], [1, '14']] },
    { x: 705, name: 't₄', col: C.gold, sub: '标准正态 / 独立尺度估计', fn: t4, lo: -4, hi: 4, max: .4, ticks: [[0, '−4'], [.5, '0'], [1, '4']] },
    { x: 1290, name: 'F₅,₈', col: C.violet, sub: '两个独立 χ² 的标准化比值', fn: f58, lo: 0, hi: 5, max: .8, ticks: [[0, '0'], [.4, '2'], [.8, '4']] }
  ];
  cards.forEach((c, index) => {
    const p = h.ease((t - index * .8) / 2.5);
    alpha(ctx, p, () => {
      h.panel(ctx, c.x, 338, 510, 464, c.col);
      h.text(ctx, c.name, c.x + 255, 392, 43, c.col, 'center', 'serif', 600);
      h.text(ctx, c.sub, c.x + 255, 437, 24, C.muted, 'center');
      if (index === 0) {
        for (let k = 0; k < 4; k++) { const xx = c.x + 110 + k * 97; h.circle(ctx, xx, 480 + Math.sin(t * 1.5 + k) * 3, 20, c.col + '18', c.col, 1.5); h.text(ctx, `Z${k + 1}²`, xx, 487 + Math.sin(t * 1.5 + k) * 3, 21, c.col, 'center', 'mono'); if (k < 3) h.text(ctx, '+', xx + 48, 489, 25, C.muted, 'center'); }
      } else if (index === 1) {
        h.label(ctx, 'Z ⟂ U', c.x + 135, 487, c.col); h.text(ctx, 'U ~ χ²₄', c.x + 335, 487, 27, c.col, 'center', 'serif');
      } else {
        h.text(ctx, 'U ~ χ²₅', c.x + 135, 486, 26, c.col, 'center', 'serif'); h.text(ctx, 'V ~ χ²₈', c.x + 365, 486, 26, c.col, 'center', 'serif'); h.text(ctx, 'U ⟂ V', c.x + 255, 527, 24, C.muted, 'center', 'serif');
      }
      h.axes(ctx, c.x + 60, 736, 395, 176, { xLabel: '', xTicks: c.ticks });
      h.curve(ctx, c.fn, c.x + 60, 736, 395, 176, c.lo, c.hi, c.max, c.col, h.ease((t - 4 - index) / 4.5), true);
      if (index === 1 && t > 11) { ctx.save(); ctx.setLineDash([6, 7]); h.curve(ctx, pdf, c.x + 60, 736, 395, 176, -4, 4, .4, C.muted, 1, false); ctx.restore(); }
      alpha(ctx, h.ease((t - 11) / 2), () => h.text(ctx, ['非负 · 平方和', '虚线：标准正态，t 尾更厚', '非负 · 方差之比'][index], c.x + 255, 785, 23, c.col, 'center'));
    });
  });
}

// 34 — The Pearson statistic is exactly 2.8 for these six counts.
function goodness(ctx, t, h) {
  const { C } = h, observed = [8, 12, 9, 11, 7, 13], base = 755, scale = 22, p = h.ease((t - 2) / 5.5);
  h.text(ctx, '公平骰子的 60 次投掷 · 一组示例计数', 145, 305, 30, C.text);
  h.axes(ctx, 187, base, 1300, 330, { xLabel: '', yLabel: '次数', yTicks: [[0, '0'], [1 / 3, '5'], [2 / 3, '10'], [1, '15']] });
  observed.forEach((v, i) => {
    const x = 303 + i * 209;
    h.die(ctx, x - 32, 349 + Math.sin(t * .8 + i) * 1.4, 63, i + 1, i % 2 ? '#d6e9f7' : '#f3ebd6');
    h.rect(ctx, x - 57, base - v * scale * p, 114, v * scale * p, C.cyan + '33', C.cyan, 10, 2);
    h.text(ctx, String(Math.round(v * p)), x, base - v * scale * p - 17, 34, C.cyan, 'center', 'mono', 600);
    h.text(ctx, String(i + 1), x, base + 36, 25, C.muted, 'center', 'mono');
    alpha(ctx, h.ease((t - 9) / 2.5), () => {
      const obsY = base - v * scale, expY = base - 10 * scale;
      h.line(ctx, x + 77, obsY, x + 77, expY, C.gold, 3); h.line(ctx, x + 69, obsY, x + 85, obsY, C.gold, 2); h.line(ctx, x + 69, expY, x + 85, expY, C.gold, 2);
    });
  });
  alpha(ctx, h.ease((t - 6) / 2.5), () => { dashed(ctx, h, 192, base - 220, 1480, base - 220, C.gold, 3); h.label(ctx, '公平假设下，每面期望 10 次', 852, 473, C.gold); });
  h.panel(ctx, 1535, 415, 270, 309, C.gold);
  h.text(ctx, 'χ² 统计量', 1670, 471, 29, C.gold, 'center');
  alpha(ctx, h.ease((t - 10) / 3), () => { h.text(ctx, '2.8', 1670, 565, 76, C.text, 'center', 'mono', 600); h.text(ctx, '自由度 5', 1670, 625, 29, C.muted, 'center'); h.text(ctx, '偏差平方 / 期望', 1670, 682, 24, C.muted, 'center'); });
}

// 35 — Vertical residuals; the line is the actual OLS solution of these points.
const regX = [2, 3, 4, 5, 6, 7, 8, 9], regY = [8, 11, 13, 18, 17, 23, 24, 29];
const regXM = 5.5, regYM = regY.reduce((a, b) => a + b, 0) / 8;
const regB = regX.reduce((v, x, i) => v + (x - regXM) * (regY[i] - regYM), 0) / regX.reduce((v, x) => v + (x - regXM) ** 2, 0);
const regA = regYM - regB * regXM, regSSE = regX.reduce((v, x, i) => v + (regY[i] - regA - regB * x) ** 2, 0);
function regression(ctx, t, h) {
  const { C } = h, x = 792, y = 747, w = 966, ht = 365;
  h.text(ctx, '同一批植物：光照时长与株高（示例）', 145, 303, 29, C.text);
  greenhouse(ctx, h, 135, 370, 500, 405, C.green);
  sun(ctx, h, 253, 460, 34, t);
  for (let i = 0; i < 3; i++) { const ground = 751, px = 284 + i * 105; h.rect(ctx, px - 32, ground - 8, 64, 26, '#715346', '#aa7c54', 7, 1); plant(ctx, h, px, ground - 7, (140 + i * 52) * h.ease((t - i * .5) / 5), C.green, t + i, 5); }
  for (let k = 0; k < 4; k++) { const yy = 490 + ((t * 22 + k * 66) % 210); h.line(ctx, 205 + k * 82, yy, 193 + k * 82, yy + 29, C.gold, 2, .17); }
  h.axes(ctx, x, y, w, ht, { xLabel: '光照（小时）', yLabel: '株高（cm）', xTicks: [[0, '0'], [.2, '2'], [.4, '4'], [.6, '6'], [.8, '8'], [1, '10']], yTicks: [[0, '0'], [10 / 35, '10'], [20 / 35, '20'], [30 / 35, '30']] });
  const tx = v => x + v / 10 * w, ty = v => y - v / 35 * ht;
  regX.forEach((v, i) => {
    const p = h.ease((t - 1.5 - i * .4) / 1.7), xx = tx(v), yy = ty(regY[i]);
    alpha(ctx, p, () => h.circle(ctx, xx, h.lerp(y, yy, p), 9, C.green + '66', C.green, 2));
  });
  const lineP = h.ease((t - 6) / 3.8);
  alpha(ctx, lineP, () => h.line(ctx, tx(1), ty(regA + regB), tx(1 + 8.5 * lineP), ty(regA + regB * (1 + 8.5 * lineP)), C.gold, 4));
  const residualP = h.ease((t - 10) / 3);
  alpha(ctx, residualP, () => {
    regX.forEach((v, i) => { const xx = tx(v), yy = ty(regY[i]), fitY = ty(regA + regB * v); h.line(ctx, xx, yy, xx, h.lerp(yy, fitY, residualP), C.red, 3); h.line(ctx, xx - 5, fitY, xx + 5, fitY, C.red, 2); });
    h.label(ctx, '竖直残差', 1490, 347, C.red);
    h.text(ctx, `残差平方和 ${regSSE.toFixed(2)}`, 385, 345, 26, C.red, 'center');
    h.text(ctx, '关联并不自动证明因果', 135, 815, 25, C.muted);
  });
}

// 36 — Balanced one-way ANOVA, explicit within/between decomposition.
function anova(ctx, t, h) {
  const { C } = h, groups = [[9, 11, 10, 8, 12], [13, 15, 14, 12, 16], [17, 19, 18, 16, 20]], means = [10, 14, 18], colors = [C.cyan, C.gold, C.violet], base = 730, unit = 13;
  h.text(ctx, '三个温室处理组 · 每组 5 株（示例）', 150, 302, 29, C.text);
  for (let g = 0; g < 3; g++) {
    const gx = 155 + g * 565, col = colors[g];
    greenhouse(ctx, h, gx, 363, 478, 383, col);
    h.label(ctx, `处理 ${String.fromCharCode(65 + g)}`, gx + 239, 348, col);
    groups[g].forEach((value, j) => {
      const p = h.ease((t - .4 - g * .5 - j * .13) / 4), px = gx + 63 + j * 89;
      plant(ctx, h, px, base, value * unit * p, col, t + g + j, 4);
      alpha(ctx, p, () => h.text(ctx, String(value), px, base + 40, 24, col, 'center', 'mono'));
      alpha(ctx, h.ease((t - 9) / 3), () => {
        const yy = base - value * unit, my = base - means[g] * unit;
        h.line(ctx, px + 17, yy, px + 17, my, C.red, 2, .85);
      });
    });
    alpha(ctx, h.ease((t - 4.5) / 3), () => {
      const yy = base - means[g] * unit;
      h.line(ctx, gx + 27, yy, gx + 452, yy, col, 3);
      h.label(ctx, `组均值 ${means[g]}`, gx + 239, yy - 19, col);
      if (g !== 1) { h.line(ctx, gx + 454, yy, gx + 454, base - 14 * unit, C.text, 2, .7); h.circle(ctx, gx + 454, yy, 4, C.text); }
    });
  }
  alpha(ctx, h.ease((t - 7.5) / 3), () => {
    dashed(ctx, h, 127, base - 14 * unit, 1785, base - 14 * unit, C.text, 2, [6, 10]);
    h.text(ctx, '总均值 14', 1710, base - 14 * unit - 18, 25, C.text, 'center');
  });
  alpha(ctx, h.ease((t - 11) / 2.5), () => {
    h.text(ctx, '组间 160', 493, 817, 31, C.gold, 'center', 'sans', 600);
    h.text(ctx, '＋', 695, 817, 30, C.muted, 'center');
    h.text(ctx, '组内 30', 905, 817, 31, C.red, 'center', 'sans', 600);
    h.text(ctx, '＝', 1100, 817, 30, C.muted, 'center');
    h.text(ctx, '总平方和 190', 1350, 817, 31, C.text, 'center', 'sans', 600);
  });
}

// 37 — All 2^3 combinations, then two complete randomized blocks.
const factorialOrders = [[6, 1, 4, 3, 0, 7, 2, 5], [3, 7, 0, 5, 2, 4, 6, 1]];
function field(ctx, h, x, y, w, ht, id, t, progress, tiny = false) {
  const { C } = h, bits = [id >> 2 & 1, id >> 1 & 1, id & 1], color = bits[2] ? C.green : C.gold;
  h.rect(ctx, x, y, w, ht, '#4d423128', '#8b75515a', 10, 1);
  for (let row = 0; row < 3; row++) {
    const yy = y + 36 + row * (ht - 66) / 3;
    h.line(ctx, x + 13, yy + 12, x + w - 13, yy + 12, '#8b7551', 2, .35);
    for (let k = 0; k < 4; k++) {
      const xx = x + w * (.16 + k * .225), grow = (12 + bits[0] * 4 + bits[1] * 5) * progress;
      plant(ctx, h, xx, yy + 11, grow, color, t + id, 2);
    }
  }
  const code = bits.map((b, i) => `${'ABC'[i]}${b ? '+' : '−'}`).join(' ');
  h.text(ctx, code, x + w / 2, y + ht - 12, tiny ? 21 : 26, C.text, 'center', 'mono');
  if (bits[1]) for (let j = 0; j < 4; j++) { const yy = y + 16 + ((t * 18 + j * 18) % (ht - 53)); h.line(ctx, x + w - 19, yy, x + w - 22, yy + 8, C.cyan, 1.5, .6); }
}
function design(ctx, t, h) {
  const { C } = h, p = h.ease((t - 9.5) / 4);
  h.text(ctx, 'A 温度 · B 水量 · C 肥料：每个因素各取两个水平', 145, 305, 29, C.text);
  alpha(ctx, 1 - p, () => h.label(ctx, '2³ 全因子：8 种组合全部出现', 960, 354, C.gold));
  alpha(ctx, p, () => {
    h.text(ctx, '区组 1', 151, 427, 25, C.cyan); h.text(ctx, '区组 2', 151, 648, 25, C.violet);
    h.text(ctx, '每个区组内完整重复 8 种组合，并独立随机排列', 960, 349, 26, C.text, 'center');
    h.rect(ctx, 266, 374, 1485, 181, '#54d9ee05', '#54d9ee33', 14, 1);
    h.rect(ctx, 266, 595, 1485, 181, '#af9bff05', '#af9bff33', 14, 1);
  });
  for (let i = 0; i < 8; i++) {
    const originalX = 160 + (i % 4) * 410, originalY = 389 + Math.floor(i / 4) * 209;
    const finalIndex = factorialOrders[0].indexOf(i), finalX = 279 + finalIndex * 182.5;
    field(ctx, h, h.lerp(originalX, finalX, p), h.lerp(originalY, 389, p), h.lerp(368, 166, p), h.lerp(183, 149, p), i, t, h.ease((t - i * .17) / 3), p > .4);
  }
  alpha(ctx, p, () => {
    for (let i = 0; i < 8; i++) field(ctx, h, 279 + i * 182.5, 610, 166, 149, factorialOrders[1][i], t, p, true);
    h.text(ctx, '随机化减少系统偏差 · 区组控制地块差异', 960, 818, 28, C.green, 'center');
  });
}

// 38 — Posterior risks for release = 20p and detect = 1-p.
function decision(ctx, t, h) {
  const { C } = h, threshold = 1 / 21, posterior = .017 + .087 * h.ease((t - 3) / 9), lateWiggle = t > 12 ? .006 * Math.sin((t - 12) * .8) : 0;
  const p = posterior + lateWiggle, release = 20 * p, detect = 1 - p, action = p > threshold;
  h.text(ctx, '一次质检决策：漏检坏品的代价是误报的 20 倍', 145, 305, 29, C.text);
  h.text(ctx, '损失表', 503, 359, 29, C.muted, 'center');
  const gx = 157, gy = 385, cols = [190, 231, 231], rh = 75;
  const rows = [['行动 / 实际', '好品', '坏品'], ['放行', '0', '20'], ['检出', '1', '0']];
  let yy = gy;
  for (let row = 0; row < 3; row++) { let xx = gx; for (let col = 0; col < 3; col++) { h.rect(ctx, xx, yy, cols[col] - 4, rh - 4, row === 0 ? '#24344b' : (row === 1 ? C.cyan + '10' : C.red + '10'), '#45617544', 6, 1); h.text(ctx, rows[row][col], xx + cols[col] / 2 - 2, yy + 48, row && col ? 35 : 26, row === 1 && col === 2 ? C.red : C.text, 'center', col && row ? 'mono' : 'sans', row && col ? 600 : 400); xx += cols[col]; } yy += rh; }
  alpha(ctx, h.ease((t - 3) / 3), () => {
    h.text(ctx, `坏品后验概率  ${(p * 100).toFixed(1)}%`, 482, 674, 31, C.gold, 'center');
    h.text(ctx, `放行风险 ${release.toFixed(2)}`, 328, 738, 28, C.cyan, 'center');
    h.text(ctx, `检出风险 ${detect.toFixed(2)}`, 668, 738, 28, C.red, 'center');
    h.label(ctx, action ? '检出：后验期望损失更小' : '放行：后验期望损失更小', 491, 804, action ? C.red : C.cyan);
  });
  const x = 1035, y = 741, w = 697, ht = 305, maxP = .15, maxLoss = 3;
  h.axes(ctx, x, y, w, ht, { xLabel: '坏品后验概率 p', yLabel: '后验期望损失', xTicks: [[0, '0'], [1 / 3, '0.05'], [2 / 3, '0.10'], [1, '0.15']], yTicks: [[0, '0'], [1 / 3, '1'], [2 / 3, '2'], [1, '3']] });
  const tx = v => x + v / maxP * w, ty = v => y - v / maxLoss * ht;
  alpha(ctx, h.ease((t - 2) / 4), () => {
    h.line(ctx, tx(0), ty(0), tx(.15), ty(3), C.cyan, 4); h.line(ctx, tx(0), ty(1), tx(.15), ty(.85), C.red, 4);
    h.text(ctx, '放行', 1719, 426, 26, C.cyan, 'right'); h.text(ctx, '检出', 1730, 633, 26, C.red, 'right');
    dashed(ctx, h, tx(threshold), y, tx(threshold), 409, C.gold, 2);
    h.label(ctx, '阈值 1/21 ≈ 4.76%', tx(threshold) + 20, 366, C.gold);
    h.circle(ctx, tx(threshold), ty(20 * threshold), 7, C.gold);
  });
  alpha(ctx, h.ease((t - 5) / 3), () => {
    h.line(ctx, tx(p), y, tx(p), ty(Math.max(release, detect)), C.text, 2, .5);
    h.circle(ctx, tx(p), ty(release), 9, action ? C.cyan : C.text, C.cyan, 3);
    h.circle(ctx, tx(p), ty(detect), 9, action ? C.text : C.red, C.red, 3);
  });
}

// 39 — A genuine four-neighbour random walk and a row-stochastic weather chain.
const walk = [[0, 0]];
for (let k = 0; k < 180; k++) { const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]], d = dirs[Math.floor(seeded(924 + k) * 4)], last = walk.at(-1); walk.push([last[0] + d[0], last[1] + d[1]]); }
const weather = [0];
for (let k = 0; k < 22; k++) { const last = weather.at(-1), u = seeded(k + 2089); weather.push(u < (last === 0 ? .8 : .4) ? 0 : 1); }
function cloud(ctx, h, x, y, s, t, raining = true) {
  const C = h.C; h.circle(ctx, x - s * .7, y, s * .55, '#375778'); h.circle(ctx, x, y - s * .26, s * .77, '#496d91'); h.circle(ctx, x + s * .7, y, s * .53, '#375778'); h.rect(ctx, x - s, y, s * 2, s * .55, '#496d91', null, s * .2);
  if (raining) for (let j = 0; j < 6; j++) { const yy = y + s * .7 + ((t * 45 + j * 17) % (s * 1.0)); const xx = x - s * .8 + j * s * .3; h.line(ctx, xx, yy, xx - 5, yy + 14, C.cyan, 2, .8); }
}
function arcArrow(ctx, h, cx, cy, r, a1, a2, color, width = 3) {
  const pts = []; for (let i = 0; i <= 45; i++) { const a = h.lerp(a1, a2, i / 45); pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } h.path(ctx, pts, color, width); const n = pts.length; h.arrow(ctx, ...pts[n - 2], ...pts[n - 1], color, width);
}
function processes(ctx, t, h) {
  const { C } = h;
  h.text(ctx, '随机游走：每一步等概率向四个方向移动', 135, 305, 28, C.text);
  h.text(ctx, '马尔可夫天气：只依赖今天的状态', 1081, 305, 27, C.text);
  h.panel(ctx, 123, 341, 801, 448, C.cyan);
  const minX = Math.min(...walk.map(p => p[0])), maxX = Math.max(...walk.map(p => p[0])), minY = Math.min(...walk.map(p => p[1])), maxY = Math.max(...walk.map(p => p[1]));
  const scale = Math.min(680 / Math.max(1, maxX - minX), 345 / Math.max(1, maxY - minY), 23), cx = 523 - (minX + maxX) * scale / 2, cy = 561 + (minY + maxY) * scale / 2;
  const wx = v => cx + v * scale, wy = v => cy - v * scale;
  for (let j = Math.floor(minX) - 1; j <= Math.ceil(maxX) + 1; j++) h.line(ctx, wx(j), 369, wx(j), 751, C.muted, 1, .12);
  for (let j = Math.floor(minY) - 1; j <= Math.ceil(maxY) + 1; j++) h.line(ctx, 151, wy(j), 897, wy(j), C.muted, 1, .12);
  const progress = h.clamp((t - .8) / 16.5) * 180, n = Math.floor(progress), frac = progress - n;
  const pts = walk.slice(0, n + 1).map(p => [wx(p[0]), wy(p[1])]);
  if (n < 180) pts.push([wx(h.lerp(walk[n][0], walk[n + 1][0], frac)), wy(h.lerp(walk[n][1], walk[n + 1][1], frac))]);
  h.path(ctx, pts, C.cyan, 3); h.circle(ctx, wx(0), wy(0), 6, C.gold); h.text(ctx, '起点', wx(0) + 14, wy(0) - 14, 23, C.gold);
  const end = pts.at(-1); if (end) { h.circle(ctx, end[0], end[1], 16 + Math.sin(t * 4) * 2, C.cyan + '18'); h.circle(ctx, end[0], end[1], 6, C.text); }
  h.text(ctx, `第 ${n} 步 · 一条模拟路径`, 154, 774, 24, C.muted);
  const sx = 1240, rx = 1623, nodeY = 514, step = Math.min(21, Math.floor(Math.max(0, t - 2) / .72)), current = weather[step];
  h.circle(ctx, sx, nodeY, 77, C.gold + (current === 0 ? '18' : '05'), C.gold + (current === 0 ? 'ff' : '55'), current === 0 ? 3 : 1);
  h.circle(ctx, rx, nodeY, 77, C.blue + (current === 1 ? '18' : '05'), C.blue + (current === 1 ? 'ff' : '55'), current === 1 ? 3 : 1);
  sun(ctx, h, sx, nodeY - 4, 31, t); cloud(ctx, h, rx, nodeY - 12, 35, t, true);
  h.text(ctx, '晴', sx, 647, 32, C.gold, 'center'); h.text(ctx, '雨', rx, 647, 32, C.blue, 'center');
  alpha(ctx, h.ease((t - 2) / 3), () => {
    h.path(ctx, [[sx + 55, 462], [1390, 396], [1480, 396], [rx - 56, 462]], C.cyan, 3);
    h.arrow(ctx, 1539, 441, rx - 56, 462, C.cyan, 3); h.label(ctx, '0.2', 1430, 390, C.cyan);
    h.path(ctx, [[rx - 58, 569], [1490, 615], [1383, 615], [sx + 57, 569]], C.cyan, 3);
    h.arrow(ctx, 1326, 583, sx + 57, 569, C.cyan, 3); h.label(ctx, '0.4', 1430, 656, C.cyan);
    arcArrow(ctx, h, sx - 45, 424, 49, .2, Math.PI * 1.72, C.gold, 2); h.text(ctx, '0.8', sx - 105, 378, 27, C.gold, 'center', 'mono');
    arcArrow(ctx, h, rx + 46, 424, 49, Math.PI * 1.27, TAU + 2.7, C.blue, 2); h.text(ctx, '0.6', rx + 106, 378, 27, C.blue, 'center', 'mono');
  });
  alpha(ctx, h.ease((t - 6) / 3), () => {
    for (let k = 0; k < 15; k++) { const state = weather[Math.max(0, step - 14) + k]; if (k > step) continue; h.rect(ctx, 1105 + k * 44, 715, 34, 34, state ? C.blue + '77' : C.gold + '77', state ? C.blue : C.gold, 7, 1); }
    h.text(ctx, '一次天气序列（模拟）', 1431, 793, 25, C.muted, 'center');
  });
}

const scenes = { 26: sampling, 27: statistics, 28: likelihood, 29: pointEstimate, 30: confidence, 31: hypothesis, 32: errors, 33: samplingDistributions, 34: goodness, 35: regression, 36: anova, 37: design, 38: decision, 39: processes };
export function draw(ctx, id, t, h) {
  const fn = scenes[id]; if (!fn) return;
  ctx.save(); ctx.beginPath(); ctx.rect(90, 265, 1740, 565); ctx.clip(); fn(ctx, Math.max(0, Math.min(18, t)), h); ctx.restore();
}

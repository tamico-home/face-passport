import type { DiagnosisResult } from '../types';
import { SERVICE_NAME, SHARE_HASHTAG, SITE_URL } from '../config';

const W = 1080;
const H = 1920;

const COLOR = {
  sky: '#47B5E5',
  skyLight: '#EAF7FD',
  skyDeep: '#2B93C4',
  paper: '#FFFDF7',
  sun: '#FFC53D',
  coral: '#FF6B57',
  coralDeep: '#E14F3C',
  mint: '#3ECFA0',
  ink: '#2B3542',
  inkSoft: '#5C6A78',
  line: '#D8ECF5',
};

const BAR_COLORS = [COLOR.coral, COLOR.sun, COLOR.mint, COLOR.sky, '#B892E8'];

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawAirmailStripes(ctx: CanvasRenderingContext2D, y: number, height: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, y, W, height);
  ctx.clip();
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, y, W, height);
  const stripeW = 26;
  const period = stripeW * 4;
  for (let x = -H; x < W + H; x += period) {
    ctx.fillStyle = COLOR.coral;
    ctx.beginPath();
    ctx.moveTo(x, y + height * 2);
    ctx.lineTo(x + height * 2, y - height);
    ctx.lineTo(x + height * 2 + stripeW, y - height);
    ctx.lineTo(x + stripeW, y + height * 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = COLOR.sky;
    ctx.beginPath();
    const x2 = x + stripeW * 2;
    ctx.moveTo(x2, y + height * 2);
    ctx.lineTo(x2 + height * 2, y - height);
    ctx.lineTo(x2 + height * 2 + stripeW, y - height);
    ctx.lineTo(x2 + stripeW, y + height * 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 70 * scale, 38 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + 55 * scale, cy - 16 * scale, 50 * scale, 34 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(cx - 55 * scale, cy + 4 * scale, 42 * scale, 26 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function wrapCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const chars = text.split('');
  let line = '';
  let curY = y;
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, cx, curY);
      line = ch;
      curY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, cx, curY);
    curY += lineHeight;
  }
  return curY;
}

export async function renderShareCanvas(result: DiagnosisResult): Promise<HTMLCanvasElement> {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    await document.fonts.ready;
  }

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context unavailable');

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, COLOR.skyLight);
  bg.addColorStop(0.55, COLOR.paper);
  bg.addColorStop(1, COLOR.paper);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  drawAirmailStripes(ctx, 0, 22);
  drawAirmailStripes(ctx, H - 22, 22);

  drawCloud(ctx, 150, 150, 1);
  drawCloud(ctx, 900, 230, 0.8);
  drawCloud(ctx, 950, 110, 0.5);

  ctx.textAlign = 'center';
  ctx.fillStyle = COLOR.ink;
  ctx.font = '700 58px "Dela Gothic One"';
  ctx.fillText(SERVICE_NAME, W / 2, 210);

  ctx.fillStyle = COLOR.skyDeep;
  ctx.font = '700 34px "Zen Maru Gothic"';
  ctx.fillText('キミの顔、何カ国製?', W / 2, 264);

  const first = result.top5[0];
  const stampCx = W / 2;
  const stampCy = 600;
  const stampSize = 480;
  ctx.save();
  ctx.translate(stampCx, stampCy);
  ctx.rotate((-6 * Math.PI) / 180);
  ctx.fillStyle = 'rgba(255,107,87,0.06)';
  ctx.strokeStyle = COLOR.coral;
  ctx.lineWidth = 10;
  roundRect(ctx, -stampSize / 2, -stampSize / 2, stampSize, stampSize, 42);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = COLOR.coral;
  ctx.font = '150px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(first.flag, 0, -120);

  ctx.font = '700 64px "Dela Gothic One"';
  ctx.fillText(first.name, 0, -8);

  ctx.font = '700 88px "Dela Gothic One"';
  ctx.fillText(`${first.percent}%`, 0, 90);

  ctx.font = '600 30px "Zen Maru Gothic"';
  ctx.fillText(first.title, 0, 170);
  ctx.restore();
  ctx.textBaseline = 'alphabetic';

  ctx.textAlign = 'left';
  ctx.fillStyle = COLOR.ink;
  ctx.font = '700 40px "Zen Maru Gothic"';
  ctx.fillText('内訳', 90, 940);

  const rows = [
    ...result.top5.map((c, i) => ({
      label: `${c.flag} ${c.name}`,
      percent: c.percent,
      color: BAR_COLORS[i],
    })),
    { label: '🌍 その他', percent: result.otherPercent, color: COLOR.line },
  ];

  // ドーナツグラフ
  const donutCx = W / 2;
  const donutCy = 1170;
  const donutR = 210;
  const donutStroke = 84;
  let cumulative = 0;
  ctx.lineCap = 'butt';
  for (const row of rows) {
    const startAngle = -Math.PI / 2 + (cumulative / 100) * Math.PI * 2;
    cumulative += row.percent;
    const endAngle = -Math.PI / 2 + (cumulative / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(donutCx, donutCy, donutR, startAngle, endAngle);
    ctx.strokeStyle = row.color;
    ctx.lineWidth = donutStroke;
    ctx.stroke();
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = COLOR.coral;
  ctx.font = '150px sans-serif';
  ctx.fillText(first.flag, donutCx, donutCy - 60);
  ctx.font = '700 78px "Dela Gothic One"';
  ctx.fillText(`${first.percent}%`, donutCx, donutCy + 50);
  ctx.textBaseline = 'alphabetic';

  // 凡例リスト
  const legendStartY = 1470;
  const legendRowHeight = 56;
  rows.forEach((row, i) => {
    const y = legendStartY + i * legendRowHeight;
    ctx.fillStyle = row.color;
    ctx.beginPath();
    ctx.arc(120, y - 12, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLOR.ink;
    ctx.font = '700 34px "Zen Maru Gothic"';
    ctx.textAlign = 'left';
    ctx.fillText(row.label, 160, y);

    ctx.font = '700 34px "Dela Gothic One"';
    ctx.textAlign = 'right';
    ctx.fillText(`${row.percent}%`, W - 90, y);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = COLOR.inkSoft;
  ctx.font = '600 30px "Zen Maru Gothic"';
  wrapCenteredText(ctx, `${SITE_URL}　${SHARE_HASHTAG}`, W / 2, 1820, 900, 42);

  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('toBlob failed'));
    }, 'image/png');
  });
}

export async function shareOrDownloadCanvas(canvas: HTMLCanvasElement): Promise<'shared' | 'downloaded'> {
  const blob = await canvasToBlob(canvas);
  const file = new File([blob], 'face-passport-result.png', { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: SERVICE_NAME,
        text: `${SERVICE_NAME} ${SHARE_HASHTAG}`,
      });
      return 'shared';
    } catch (err) {
      if ((err as DOMException).name === 'AbortError') return 'shared';
      // フォールバックへ続行
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'face-passport-result.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return 'downloaded';
}

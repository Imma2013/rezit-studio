import type { DesignNode } from './types';

export async function exportCanvasToDataUrl(
  nodes: DesignNode[],
  canvasWidth: number,
  canvasHeight: number,
  format: 'png' | 'jpeg' = 'png',
  scale: number = 2
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth * scale;
  canvas.height = canvasHeight * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas 2D context');

  // Scale for high-res retina export
  ctx.scale(scale, scale);

  // Background fill
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Sort nodes by zIndex / order
  const sortedNodes = [...nodes].filter((n) => !n.hidden);

  for (const node of sortedNodes) {
    ctx.save();

    // Opacity
    if (typeof node.opacity === 'number') {
      ctx.globalAlpha = node.opacity;
    }

    // Translate & Rotate around center
    const cx = node.x + node.width / 2;
    const cy = node.y + node.height / 2;
    ctx.translate(cx, cy);

    if (node.rotation) {
      ctx.rotate((node.rotation * Math.PI) / 180);
    }

    if (node.flipX || node.flipY) {
      ctx.scale(node.flipX ? -1 : 1, node.flipY ? -1 : 1);
    }

    ctx.translate(-cx, -cy);

    // Render node kinds
    if (node.kind === 'shape') {
      ctx.fillStyle = node.backgroundColor || node.color || '#7c3aed';
      const r = node.borderRadius || 0;
      const x = node.x;
      const y = node.y;
      const w = node.width;
      const h = node.height;

      // Rounded rectangle path
      ctx.beginPath();
      if (r > 0) {
        ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
      } else {
        ctx.rect(x, y, w, h);
      }
      ctx.fill();

      if (node.borderColor && node.borderWidth) {
        ctx.strokeStyle = node.borderColor;
        ctx.lineWidth = node.borderWidth;
        ctx.stroke();
      }
    } else if (node.kind === 'text') {
      const fontSize = node.fontSize || 24;
      const fontFamily = node.fontFamily || 'Plus Jakarta Sans, sans-serif';
      const fontWeight = node.fontWeight || '700';
      const fontStyle = node.fontStyle || 'normal';

      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = node.color || '#0f172a';
      ctx.textAlign = (node.textAlign || 'left') as CanvasTextAlign;
      ctx.textBaseline = 'top';

      const tx = node.textAlign === 'center' ? node.x + node.width / 2 : node.textAlign === 'right' ? node.x + node.width : node.x;
      const ty = node.y;

      let displayText = node.text || '';
      if (node.textTransform === 'uppercase') displayText = displayText.toUpperCase();
      if (node.textTransform === 'lowercase') displayText = displayText.toLowerCase();

      // Multi-line wrap
      const words = displayText.split(' ');
      let line = '';
      let currentY = ty;
      const lineHeight = (node.lineHeight || 1.2) * fontSize;

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > node.width && i > 0) {
          ctx.fillText(line, tx, currentY);
          line = words[i] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, tx, currentY);
    } else if (node.kind === 'image' && node.src) {
      try {
        const img = await loadImage(node.src);
        const r = node.borderRadius || 0;
        const x = node.x;
        const y = node.y;
        const w = node.width;
        const h = node.height;

        if (r > 0) {
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
          ctx.clip();
        }

        ctx.drawImage(img, x, y, w, h);
      } catch {
        // Fallback rectangle if image failed to load with CORS
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(node.x, node.y, node.width, node.height);
      }
    }

    ctx.restore();
  }

  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  return canvas.toDataURL(mimeType, 0.95);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

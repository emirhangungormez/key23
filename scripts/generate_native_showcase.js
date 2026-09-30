import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function main() {
  console.log('1. Bundling src/keycap.ts using Vite...');
  await build({
    root: rootDir,
    configFile: false,
    plugins: [],
    logLevel: 'error',
    build: {
      lib: {
        entry: path.resolve(rootDir, 'src/keycap.ts'),
        formats: ['es'],
        fileName: () => 'keycap-bundled.mjs',
      },
      outDir: path.resolve(__dirname, 'temp'),
      emptyOutDir: true,
      minify: false,
    },
  });

  const bundledPath = path.resolve(__dirname, 'temp/keycap-bundled.mjs');
  const keycapMod = await import(`file://${bundledPath.replace(/\\/g, '/')}`);
  const { renderKeycap, getPodContainerStyle, pbtThemes, themeTokenRegistry } = keycapMod;

  console.log('2. keycap.ts loaded successfully!');

  // Desktop Wallpaper SVG background (Dark Slate / Deep Navy Windows 11 Flow inspired)
  function makeWallpaperSvg(width, height) {
    return `
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="50%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#090d16"/>
        </linearGradient>
        <radialGradient id="glowG" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.18"/>
          <stop offset="60%" stop-color="#1e1b4b" stop-opacity="0.05"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
        <filter id="deskBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="60"/>
        </filter>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
      <ellipse cx="${width * 0.5}" cy="${height * 0.45}" rx="${width * 0.45}" ry="${height * 0.4}" fill="url(#glowG)"/>
      <path d="M-100 ${height * 0.75} C ${width * 0.25} ${height * 0.55}, ${width * 0.45} ${height * 0.85}, ${width * 0.8} ${height * 0.6} C ${width * 1.0} ${height * 0.45}, ${width * 1.1} ${height * 0.65}, ${width + 100} ${height * 0.6} L ${width + 100} ${height + 100} L -100 ${height + 100} Z" fill="#1e3a8a" opacity="0.25" filter="url(#deskBlur)"/>
      <path d="M-50 ${height * 0.65} C ${width * 0.3} ${height * 0.45}, ${width * 0.6} ${height * 0.8}, ${width + 50} ${height * 0.5} L ${width + 50} ${height + 100} L -50 ${height + 100} Z" fill="#2563eb" opacity="0.18" filter="url(#deskBlur)"/>
    `;
  }

  // Mouse follower pill SVG from src/mouse.ts
  function makeMousePillSvg(leftClick = true, rightClick = false, middleClick = false) {
    return `
      <g filter="drop-shadow(0 10px 24px rgba(0,0,0,0.5))">
        <!-- Capsule Outer Body -->
        <rect x="0" y="0" width="34" height="50" rx="17" ry="17" fill="rgba(10, 12, 16, 0.88)" stroke="rgba(255, 255, 255, 0.22)" stroke-width="1.5"/>
        <defs>
          <clipPath id="mouseClip">
            <rect x="1" y="1" width="32" height="48" rx="16" ry="16"/>
          </clipPath>
        </defs>
        <!-- Button Fills inside Clip -->
        <g clip-path="url(#mouseClip)">
          ${leftClick ? `<path d="M0 0 H17 V25 H0 Z" fill="rgba(255,255,255,0.95)" />` : ''}
          ${rightClick ? `<path d="M17 0 H34 V25 H17 Z" fill="rgba(255,255,255,0.95)" />` : ''}
        </g>
        <!-- Center Divider & Horizontal Divider -->
        <line x1="17" y1="2" x2="17" y2="25" stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>
        <line x1="2" y1="25" x2="32" y2="25" stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/>
        <!-- Scroll Wheel Slot -->
        <rect x="14" y="6" width="6" height="12" rx="3" fill="${middleClick ? 'rgba(255,255,255,0.95)' : 'none'}" stroke="rgba(255,255,255,0.7)" stroke-width="1.2"/>
      </g>
    `;
  }

  // Helper to render an SVG with resvg and save to file
  function saveSvgToPng(svgStr, outPath, zoom = 2.0) {
    const resvg = new Resvg(svgStr, {
      fitTo: { mode: 'zoom', value: zoom },
      font: {
        loadSystemFonts: true,
        defaultFontFamily: 'Segoe UI',
      },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    fs.writeFileSync(outPath, pngBuffer);
    console.log(`Saved PNG: ${outPath} (${pngData.width}x${pngData.height})`);
  }

  // =========================================================================
  // SHOWCASE 1: Keyboard + Mouse HUD (Classic PBT: Ctrl + Shift + K)
  // =========================================================================
  {
    console.log('Generating Keyboard Showcase with Key23 native renderKeycap...');
    const ctrlSvg = renderKeycap('ctrl', 'ctrl', 'ctrl', true, false, false, 'pbt', 'classic');
    const shiftSvg = renderKeycap('shift', 'shift', 'shift', true, false, false, 'pbt', 'classic');
    const kSvg = renderKeycap('k', 'K', null, false, false, false, 'pbt', 'classic');

    const W = 1000;
    const H = 540;

    const clusterW = 342;
    const clusterH = 100;
    const padX = 14;
    const padY = 10;
    const podW = clusterW + padX * 2;
    const podH = clusterH + padY * 2;

    const podX = (W - podW) / 2 - 20;
    const podY = (H - podH) / 2;

    const mouseX = podX + podW + 30;
    const mouseY = podY + (podH - 50) / 2;

    const finalSvg = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        ${makeWallpaperSvg(W, H)}

        <!-- App Brand Watermark subtle -->
        <text x="${W / 2}" y="${podY - 42}" text-anchor="middle" fill="rgba(255,255,255,0.45)" font-family="Segoe UI, -apple-system, sans-serif" font-size="14" font-weight="600" letter-spacing="3px">KEY23 · LIVE INPUT HUD</text>

        <!-- Pod Chassis Container (From getPodContainerStyle) -->
        <g transform="translate(${podX}, ${podY})">
          <!-- Pod Outer Drop Shadow -->
          <rect x="-1" y="2" width="${podW + 2}" height="${podH + 2}" rx="20" ry="20" fill="none" filter="drop-shadow(0 20px 40px rgba(0,0,0,0.85)) drop-shadow(0 6px 14px rgba(0,0,0,0.6))"/>
          <!-- Pod Dark Glass Fill -->
          <rect x="0" y="0" width="${podW}" height="${podH}" rx="18" ry="18" fill="rgba(18, 19, 23, 0.94)" stroke="rgba(255, 255, 255, 0.14)" stroke-width="1.5"/>
          <!-- Inner Pod border highlight -->
          <rect x="1" y="1" width="${podW - 2}" height="${podH - 2}" rx="17" ry="17" fill="none" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1"/>

          <!-- Rendered Native Keycaps from keycap.ts -->
          <g transform="translate(14, 10)">
            ${ctrlSvg}
          </g>
          <g transform="translate(122, 10)">
            ${shiftSvg}
          </g>
          <g transform="translate(256, 10)">
            ${kSvg}
          </g>
        </g>

        <!-- Floating Mouse Cursor Companion (Left Click Active) -->
        <g transform="translate(${mouseX}, ${mouseY})">
          ${makeMousePillSvg(true, false, false)}
          <path d="M-8 -6 L-8 12 L-3 7 L2 16 L5 14 L0 5 L6 5 Z" fill="#ffffff" stroke="#000000" stroke-width="1.2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))"/>
        </g>

        <!-- Caption -->
        <text x="${W / 2}" y="${podY + podH + 52}" text-anchor="middle" fill="rgba(255,255,255,0.65)" font-family="Segoe UI, -apple-system, sans-serif" font-size="14" font-weight="400">Authentic 3D PBT Mechanical Keycaps with Low-Latency OS Hooks</text>
      </svg>
    `;

    const outPath = path.resolve(rootDir, 'docs/screenshots/keyboard_showcase.png');
    saveSvgToPng(finalSvg, outPath, 1.5);
  }

  // =========================================================================
  // SHOWCASE 2: Multi-Keys Combination Resolution (Shift + 4 = +)
  // =========================================================================
  {
    console.log('Generating Multi-Keys Combination Showcase...');
    const shiftSvg = renderKeycap('shift', 'shift', 'shift', true, false, false, 'pbt', 'classic');
    const fourSvg = renderKeycap('4', '4', null, false, false, false, 'pbt', 'classic');
    const plusSvg = renderKeycap('+', '+', null, false, true, false, 'pbt', 'classic');

    const W = 1000;
    const H = 500;

    const clusterW = 374;
    const clusterH = 100;
    const padX = 14;
    const padY = 10;
    const podW = clusterW + padX * 2;
    const podH = clusterH + padY * 2;

    const podX = (W - podW) / 2;
    const podY = (H - podH) / 2;

    const finalSvg = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        ${makeWallpaperSvg(W, H)}

        <text x="${W / 2}" y="${podY - 42}" text-anchor="middle" fill="rgba(255,255,255,0.45)" font-family="Segoe UI, -apple-system, sans-serif" font-size="14" font-weight="600" letter-spacing="3px">KEY23 · COMBINATION EVALUATION</text>

        <!-- Pod Chassis -->
        <g transform="translate(${podX}, ${podY})">
          <rect x="-1" y="2" width="${podW + 2}" height="${podH + 2}" rx="20" ry="20" fill="none" filter="drop-shadow(0 20px 40px rgba(0,0,0,0.85)) drop-shadow(0 6px 14px rgba(0,0,0,0.6))"/>
          <rect x="0" y="0" width="${podW}" height="${podH}" rx="18" ry="18" fill="rgba(18, 19, 23, 0.94)" stroke="rgba(255, 255, 255, 0.14)" stroke-width="1.5"/>

          <!-- Shift -->
          <g transform="translate(14, 10)">
            ${shiftSvg}
          </g>
          <!-- 4 -->
          <g transform="translate(148, 10)">
            ${fourSvg}
          </g>
          <!-- = Sign -->
          <g transform="translate(256, 10)">
            <text x="12" y="56" text-anchor="middle" fill="rgba(255,255,255,0.45)" font-family="Segoe UI, -apple-system, sans-serif" font-size="28" font-weight="bold">=</text>
          </g>
          <!-- Result: + -->
          <g transform="translate(288, 10)">
            ${plusSvg}
          </g>
        </g>

        <text x="${W / 2}" y="${podY + podH + 52}" text-anchor="middle" fill="rgba(255,255,255,0.65)" font-family="Segoe UI, -apple-system, sans-serif" font-size="14" font-weight="400">Automatic Windows Keyboard Layout &amp; Modifier Evaluation (Shift + 4 = +)</text>
      </svg>
    `;

    const outPath = path.resolve(rootDir, 'docs/screenshots/multi_keys_showcase.png');
    saveSvgToPng(finalSvg, outPath, 1.5);
  }

  // =========================================================================
  // SHOWCASE 3: 5 Keycap Styles Comparison (PBT, Apple, Retro, Minimal, M0116)
  // =========================================================================
  {
    console.log('Generating 5 Styles Comparison...');
    const styles = ['pbt', 'apple', 'retro', 'minimal', 'm0116'];
    const styleLabels = ['PBT Mechanical', 'Apple Modern', 'Retro Vintage', 'Minimal Pill', 'M0116 Classic'];

    const W = 1600;
    const H = 700;

    let itemsSvg = '';
    const itemGap = 40;
    const itemWidth = 180;
    const totalW = styles.length * itemWidth + (styles.length - 1) * itemGap;
    const startX = (W - totalW) / 2;

    styles.forEach((st, idx) => {
      const keySvg = renderKeycap('k', 'K', null, false, false, false, st, 'classic');
      const x = startX + idx * (itemWidth + itemGap);
      const y = 240;

      itemsSvg += `
        <g transform="translate(${x}, ${y})">
          <!-- Style label above -->
          <text x="${itemWidth / 2}" y="-24" text-anchor="middle" fill="#93c5fd" font-family="Segoe UI, sans-serif" font-size="15" font-weight="600">${styleLabels[idx]}</text>
          <!-- Individual Pod Container -->
          <g filter="drop-shadow(0 14px 28px rgba(0,0,0,0.65))">
            <rect x="0" y="0" width="${itemWidth}" height="140" rx="16" fill="rgba(20, 23, 28, 0.9)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
            <!-- Center Keycap inside pod -->
            <g transform="translate(${(itemWidth - 100) / 2}, 20)">
              ${keySvg}
            </g>
          </g>
        </g>
      `;
    });

    const finalSvg = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        ${makeWallpaperSvg(W, H)}

        <text x="${W / 2}" y="110" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, -apple-system, sans-serif" font-size="28" font-weight="700">5 Authentic Keycap Rendering Engines</text>
        <text x="${W / 2}" y="146" text-anchor="middle" fill="rgba(255,255,255,0.55)" font-family="Segoe UI, -apple-system, sans-serif" font-size="15">Rendered with pure mathematical vector lighting and perspective in Key23</text>

        ${itemsSvg}
      </svg>
    `;

    const outPath = path.resolve(rootDir, 'docs/screenshots/styles_comparison.png');
    saveSvgToPng(finalSvg, outPath, 1.25);
  }

  // =========================================================================
  // SHOWCASE 4: Background Toggle (Pod Container vs Pure Floating)
  // =========================================================================
  {
    console.log('Generating Background Toggle Demo...');
    const ctrlSvg = renderKeycap('ctrl', 'ctrl', 'ctrl', true, false, false, 'pbt', 'classic');
    const cSvg = renderKeycap('c', 'C', null, false, false, false, 'pbt', 'classic');

    const W = 1600;
    const H = 720;

    const clusterW = 208; // 100 + 8 + 100
    const podW = clusterW + 28;
    const podH = 120;

    const leftX = W * 0.28 - podW / 2;
    const rightX = W * 0.72 - podW / 2;
    const centerY = (H - podH) / 2 + 30;

    const finalSvg = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        ${makeWallpaperSvg(W, H)}

        <text x="${W / 2}" y="90" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, -apple-system, sans-serif" font-size="28" font-weight="700">Customizable Key Background Container</text>
        <text x="${W / 2}" y="126" text-anchor="middle" fill="rgba(255,255,255,0.55)" font-family="Segoe UI, -apple-system, sans-serif" font-size="15">Toggle between the iconic dark pod chassis or pure floating keycaps</text>

        <!-- LEFT: Pod Enabled -->
        <g transform="translate(${leftX}, ${centerY})">
          <text x="${podW / 2}" y="-30" text-anchor="middle" fill="#34d399" font-family="Segoe UI, sans-serif" font-size="16" font-weight="600">✓ Kapsül Arka Plan Açık (Default)</text>
          <!-- Pod Body -->
          <g filter="drop-shadow(0 20px 40px rgba(0,0,0,0.8))">
            <rect x="0" y="0" width="${podW}" height="${podH}" rx="18" fill="rgba(18, 19, 23, 0.94)" stroke="rgba(255,255,255,0.14)" stroke-width="1.5"/>
            <g transform="translate(14, 10)">
              ${ctrlSvg}
            </g>
            <g transform="translate(122, 10)">
              ${cSvg}
            </g>
          </g>
        </g>

        <!-- RIGHT: Pod Disabled (Pure Floating) -->
        <g transform="translate(${rightX}, ${centerY})">
          <text x="${podW / 2}" y="-30" text-anchor="middle" fill="#94a3b8" font-family="Segoe UI, sans-serif" font-size="16" font-weight="600">✕ Kapsül Kapalı (Sadece Tuşlar)</text>
          <g transform="translate(14, 10)">
            ${ctrlSvg}
          </g>
          <g transform="translate(122, 10)">
            ${cSvg}
          </g>
        </g>
      </svg>
    `;

    const outPath = path.resolve(rootDir, 'docs/screenshots/background_toggle_demo.png');
    saveSvgToPng(finalSvg, outPath, 1.25);
  }

  // Clean temp
  try {
    fs.rmSync(path.resolve(__dirname, 'temp'), { recursive: true, force: true });
  } catch {}

  console.log('ALL SCREENSHOTS GENERATED WITH 100% NATIVE KEY23 CODE!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

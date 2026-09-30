import {
  type AppSettings,
  defaultSettings,
  getPodContainerStyle,
  getSizeNormalization,
  renderKeycap,
  setCustomDualColorTheme,
} from './keycap';

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem('winkeyty_settings');
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {}
  return defaultSettings;
}

const currentSettings = loadSettings();
if (currentSettings.theme === 'custom') {
  const modC = currentSettings.customModColor || currentSettings.customColor || '#FF4740';
  const alphaC = currentSettings.customAlphaColor || currentSettings.customColor || '#F59E0B';
  setCustomDualColorTheme(modC, alphaC);
}

const app = document.getElementById('app')!;
app.style.cssText =
  'width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.45); user-select: none; overflow: hidden; cursor: crosshair; position: relative; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
app.className = 'select-none overflow-hidden cursor-crosshair relative';

const podStyle = getPodContainerStyle(currentSettings.style, currentSettings.theme, currentSettings);

app.innerHTML = `
  <!-- Top instructions pill -->
  <div class="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 rounded-xl bg-[#17171d]/95 border border-white/10 text-white shadow-2xl backdrop-blur-md pointer-events-none select-none">
    <div class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
    <div class="text-xs font-medium">Ekran görüntüsü alır gibi tuşların konumunu ve genişliğini sürükleyerek seçin</div>
    <div class="text-[10px] text-zinc-400 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-mono">ESC: İptal</div>
  </div>

  <!-- Dynamic selection box (Snipping Tool style) -->
  <div id="selection-box" style="display: none; position: absolute; border: 2px dashed #3b82f6; background: rgba(59, 130, 246, 0.08); border-radius: 12px; pointer-events: none; overflow: hidden; box-sizing: border-box; align-items: center; justify-content: center; flex-direction: row;">
    <!-- Top badge inside box -->
    <div style="position: absolute; top: 6px; left: 6px; padding: 2px 7px; border-radius: 5px; background: rgba(0, 0, 0, 0.85); border: 1px solid rgba(59, 130, 246, 0.4); font-family: monospace; font-size: 11px; color: #93c5fd; pointer-events: none; z-index: 10;">
      <span id="box-dimensions">0 × 0 px</span>
    </div>
    
    <!-- Exact Pod & Keycaps Preview matching HUD -->
    <div id="box-pod-container" style="
      background: ${podStyle.background};
      border: ${podStyle.border};
      border-radius: ${podStyle.borderRadius};
      padding: ${podStyle.padding};
      gap: ${podStyle.gap};
      box-shadow: ${podStyle.boxShadow};
      display: inline-flex;
      flex-direction: row;
      flex-wrap: nowrap;
      white-space: nowrap;
      align-items: center;
      justify-content: center;
      transform-origin: center center;
      pointer-events: none;
    ">
      <div id="preview-key-ctrl" class="inline-flex">
        ${renderKeycap('ctrl', 'ctrl', 'ctrl', true, false, false, currentSettings.style, currentSettings.theme, currentSettings.keyboardLayout)}
      </div>
      <div id="preview-key-shift" class="inline-flex">
        ${renderKeycap('shift', 'shift', 'shift', true, false, false, currentSettings.style, currentSettings.theme, currentSettings.keyboardLayout)}
      </div>
      <div id="preview-key-k" class="inline-flex">
        ${renderKeycap('4', '4', null, false, false, false, currentSettings.style, currentSettings.theme, currentSettings.keyboardLayout)}
      </div>
    </div>
  </div>
`;

const selectionBox = document.getElementById('selection-box')!;
const boxDimensions = document.getElementById('box-dimensions')!;
const boxPodContainer = document.getElementById('box-pod-container')!;
const keyCtrl = document.getElementById('preview-key-ctrl')!;
const keyShift = document.getElementById('preview-key-shift')!;

let isDragging = false;
let startX = 0;
let startY = 0;

function invokeBackend(cmd: string, args: Record<string, any> = {}) {
  if ((window as any).__TAURI__) {
    return (window as any).__TAURI__.core.invoke(cmd, args);
  }
  return Promise.resolve();
}

window.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return; // Only left click
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;

  selectionBox.style.left = `${startX}px`;
  selectionBox.style.top = `${startY}px`;
  selectionBox.style.width = '0px';
  selectionBox.style.height = '0px';
  selectionBox.style.display = 'flex';
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  const currentX = e.clientX;
  const currentY = e.clientY;

  const left = Math.min(startX, currentX);
  const top = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);

  selectionBox.style.left = `${left}px`;
  selectionBox.style.top = `${top}px`;
  selectionBox.style.width = `${width}px`;
  selectionBox.style.height = `${height}px`;

  // Scale key preview proportionally to the dragged box
  const previewScale = Math.min(1.4, Math.max(0.65, height / 110));
  const effectiveScale = previewScale * getSizeNormalization(currentSettings.style);
  boxPodContainer.style.transform = `scale(${effectiveScale})`;
  boxDimensions.textContent = `${width} × ${height} px (${previewScale.toFixed(2)}x)`;

  // Dynamically show 1, 2, or 3 keys depending on dragged box width
  if (width < 160) {
    keyCtrl.style.display = 'none';
    keyShift.style.display = 'none';
  } else if (width < 260) {
    keyCtrl.style.display = 'none';
    keyShift.style.display = 'inline-flex';
  } else {
    keyCtrl.style.display = 'inline-flex';
    keyShift.style.display = 'inline-flex';
  }
});

window.addEventListener('mouseup', async (e) => {
  if (!isDragging) return;
  isDragging = false;
  selectionBox.style.display = 'none';

  const endX = e.clientX;
  const endY = e.clientY;

  const dragWidth = Math.abs(endX - startX);
  const dragHeight = Math.abs(endY - startY);

  let targetLeft: number;
  let targetTop: number;
  let targetWidth: number;
  let targetHeight: number;
  let calculatedScale: number;

  if (dragWidth > 50 && dragHeight > 40) {
    const rawLeft = Math.min(startX, endX);
    const rawTop = Math.min(startY, endY);
    calculatedScale = Math.min(1.4, Math.max(0.65, dragHeight / 110));
    
    // Maintain ample height (min 160px) centered on user selection so max-scale keys never clip
    targetWidth = Math.max(220, dragWidth);
    targetHeight = Math.max(160, dragHeight);
    targetLeft = rawLeft - (targetWidth - dragWidth) / 2;
    targetTop = (rawTop + dragHeight / 2) - targetHeight / 2;
  } else {
    // Single click: center default 540x160 box at click point
    targetWidth = 540;
    targetHeight = 160;
    targetLeft = startX - targetWidth / 2;
    targetTop = startY - targetHeight / 2;
    calculatedScale = 1.0;
  }

  // Clamp within viewport
  targetLeft = Math.max(5, Math.min(window.innerWidth - targetWidth - 5, targetLeft));
  targetTop = Math.max(5, Math.min(window.innerHeight - targetHeight - 5, targetTop));

  // Convert to physical coordinates for Tauri
  const dpr = window.devicePixelRatio || 1;
  const physicalX = Math.round(targetLeft * dpr);
  const physicalY = Math.round(targetTop * dpr);
  const physicalW = Math.round(targetWidth * dpr);
  const physicalH = Math.round(targetHeight * dpr);

  await invokeBackend('set_hud_exact_position', {
    x: physicalX,
    y: physicalY,
    width: physicalW,
    height: physicalH,
    scale: calculatedScale,
  });
});

// ESC or Right Click to cancel
window.addEventListener('keydown', async (e) => {
  if (e.key === 'Escape') {
    isDragging = false;
    selectionBox.style.display = 'none';
    await invokeBackend('close_position_picker');
  }
});

window.addEventListener('contextmenu', async (e) => {
  e.preventDefault();
  isDragging = false;
  selectionBox.style.display = 'none';
  await invokeBackend('close_position_picker');
});

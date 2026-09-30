import './style.css';
import {
  type AppSettings,
  defaultSettings,
  type KeyEventPayload,
  renderKeycap,
  getPodContainerStyle,
  getSizeNormalization,
  setCustomColorTheme,
  setCustomDualColorTheme,
} from './keycap';

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem('winkeyty_settings');
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {}
  return defaultSettings;
}

function invokeBackend(cmd: string, args: Record<string, any> = {}) {
  if ((window as any).__TAURI__) {
    return (window as any).__TAURI__.core.invoke(cmd, args).catch(() => {});
  }
  return Promise.resolve();
}

let currentSettings = loadSettings();
if (currentSettings.theme === 'custom') {
  const modC = currentSettings.customModColor || currentSettings.customColor || '#FF4740';
  const alphaC = currentSettings.customAlphaColor || currentSettings.customColor || '#F59E0B';
  setCustomDualColorTheme(modC, alphaC);
}
let isCapsStateOn = false;
let isPositionPreview = false;

const app = document.getElementById('app')!;
app.className = 'w-full h-full bg-transparent flex items-center justify-center p-0 select-none pointer-events-none overflow-visible';
app.style.cssText = 'width: 100vw; height: 100vh; background: transparent !important; display: flex; align-items: center; justify-content: center; overflow: visible;';

app.innerHTML = `
  <div id="key-pod" class="transition-opacity duration-150 opacity-0 pointer-events-none" style="background: transparent !important; border: none !important; box-shadow: none !important; display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important; align-items: center !important; justify-content: center !important; transform-origin: center center;">
    <div id="key-cluster" style="background: transparent !important; border: none !important; box-shadow: none !important; display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important; white-space: nowrap !important; align-items: center !important; justify-content: center !important; gap: 8px;">
    </div>
  </div>
`;

const pod = document.getElementById('key-pod')!;
const cluster = document.getElementById('key-cluster')!;
let activeKeys: Map<string, KeyEventPayload> = new Map();
let clusterDismissTimer: any = null;
let modifierPressed = false;

function getMaxFittingKeys(): number {
  const norm = getSizeNormalization(currentSettings.style);
  const effectiveScale = (currentSettings.scale || 1.0) * norm;

  let baseKeyWidth = 74; // apple
  if (currentSettings.style === 'pbt') baseKeyWidth = 96;
  else if (currentSettings.style === 'minimal') baseKeyWidth = 64;
  else if (currentSettings.style === 'retro') baseKeyWidth = 96;
  else if (currentSettings.style === 'm0116') baseKeyWidth = 80;

  const gapPx = 8 * effectiveScale;
  const paddingPx = 20 * effectiveScale;
  const availW = Math.max(70, window.innerWidth - paddingPx);
  const singleKeyW = (baseKeyWidth + 6) * effectiveScale;

  const fit = Math.floor((availW + gapPx) / singleKeyW);
  return Math.max(1, Math.min(8, fit));
}

function applyClusterStyle() {
  cluster.style.background = 'transparent';
  cluster.style.border = 'none';
  cluster.style.boxShadow = 'none';
  cluster.style.borderRadius = '0';
  cluster.style.padding = '0';
  cluster.style.gap = '8px';
  cluster.style.display = 'flex';
  cluster.style.flexDirection = 'row';
  cluster.style.flexWrap = 'nowrap';
  cluster.style.whiteSpace = 'nowrap';
  cluster.style.alignItems = 'center';
  cluster.style.justifyContent = 'center';
  (cluster.style as any).backdropFilter = 'none';
  (cluster.style as any).webkitBackdropFilter = 'none';
}

applyClusterStyle();

async function updateCluster() {
  applyClusterStyle();

  if (isPositionPreview) {
    const maxKeys = getMaxFittingKeys();
    let previewHtml = '';
    if (maxKeys >= 3) {
      previewHtml = `
        ${renderKeycap('ctrl', 'ctrl', 'ctrl', true, false, false, currentSettings.style, currentSettings.theme, currentSettings.keyboardLayout)}
        ${renderKeycap('shift', 'shift', 'shift', true, false, false, currentSettings.style, currentSettings.theme, currentSettings.keyboardLayout)}
        ${renderKeycap('4', '4', null, false, false, false, currentSettings.style, currentSettings.theme, currentSettings.keyboardLayout)}
      `;
    } else if (maxKeys === 2) {
      previewHtml = `
        ${renderKeycap('shift', 'shift', 'shift', true, false, false, currentSettings.style, currentSettings.theme, currentSettings.keyboardLayout)}
        ${renderKeycap('4', '4', null, false, false, false, currentSettings.style, currentSettings.theme, currentSettings.keyboardLayout)}
      `;
    } else {
      previewHtml = `
        ${renderKeycap('4', '4', null, false, false, false, currentSettings.style, currentSettings.theme, currentSettings.keyboardLayout)}
      `;
    }
    cluster.innerHTML = previewHtml;
    const effectiveScale = currentSettings.scale * getSizeNormalization(currentSettings.style);
    pod.style.transform = `scale(${effectiveScale})`;
    pod.classList.remove('opacity-0');
    pod.classList.add('opacity-100');
    invokeBackend('show_hud');
    return;
  }

  if (!currentSettings.enabled || activeKeys.size === 0) {
    pod.classList.remove('opacity-100');
    pod.classList.add('opacity-0');
    setTimeout(() => {
      if (activeKeys.size === 0 && !isPositionPreview) {
        cluster.innerHTML = '';
        invokeBackend('hide_hud');
      }
    }, 150);
    return;
  }

  // If only shortcuts is enabled, only display if at least one modifier is active
  if (currentSettings.onlyShortcuts && !modifierPressed && !Array.from(activeKeys.values()).some(v => v.is_modifier)) {
    pod.classList.remove('opacity-100');
    pod.classList.add('opacity-0');
    setTimeout(() => {
      if (activeKeys.size === 0 && !isPositionPreview) {
        cluster.innerHTML = '';
        invokeBackend('hide_hud');
      }
    }, 150);
    return;
  }

  const TR_SHIFT_MAP: Record<string, string> = {
    '0': '=', '1': '!', '2': "'", '3': '^', '4': '+', '5': '%',
    '6': '&', '7': '/', '8': '(', '9': ')', '*': '?', '-': '_',
    '<': '>', '.': ':', ',': ';', '"': 'é',
  };

  const TR_ALTGR_MAP: Record<string, string> = {
    '1': '>', '2': '£', '3': '#', '4': '$', '5': '½',
    '7': '{', '8': '[', '9': ']', '0': '}', '*': '\\',
    '-': '|', '<': '|', 'q': '@', 'e': '€', 't': '₺',
    's': 'ß', 'a': 'æ',
  };

  const items = Array.from(activeKeys.values());
  let combinationResultHtml = '';

  if (currentSettings.showCombinationResult) {
    const hasModifier = items.some(k => k.is_modifier);
    const nonModifiers = items.filter(k => !k.is_modifier);

    if (hasModifier && nonModifiers.length > 0) {
      const lastKey = nonModifiers[nonModifiers.length - 1];
      let resultChar = lastKey.result_char;

      if (!resultChar) {
        const isAltGr = items.some(k => k.key === 'altgr' || k.key === 'option');
        const isShift = items.some(k => k.key === 'shift');
        if (isAltGr) {
          resultChar = TR_ALTGR_MAP[lastKey.key.toLowerCase()] || null;
        } else if (isShift) {
          resultChar = TR_SHIFT_MAP[lastKey.key.toLowerCase()] || null;
        }
      }

      if (resultChar && resultChar !== lastKey.key && resultChar !== lastKey.label) {
        combinationResultHtml = `
          <div class="combination-equals flex items-center justify-center text-white/50 font-bold px-1.5 text-base select-none">
            =
          </div>
          <div class="keycap-wrapper is-pressed">
            ${renderKeycap(
              resultChar,
              resultChar,
              null,
              false,
              true,
              false,
              currentSettings.style,
              currentSettings.theme,
              currentSettings.keyboardLayout
            )}
          </div>
        `;
      }
    }
  }

  // Synchronize keycap elements in DOM without destroying sibling nodes
  const existingKeyEls = new Map<string, HTMLElement>();
  cluster.querySelectorAll<HTMLElement>('.keycap-wrapper[data-key]').forEach(el => {
    const k = el.getAttribute('data-key');
    if (k) existingKeyEls.set(k, el);
  });

  const activeKeySet = new Set(items.map(k => k.key));

  // 1. Remove keys no longer active
  existingKeyEls.forEach((el, key) => {
    if (!activeKeySet.has(key)) {
      el.remove();
      existingKeyEls.delete(key);
    }
  });

  // 2. Add or update each key
  items.forEach(k => {
    const isPressedStr = String(k.is_down);
    let el = existingKeyEls.get(k.key);
    const svgHtml = renderKeycap(
      k.key,
      k.label,
      k.symbol,
      k.is_modifier,
      k.is_down,
      isCapsStateOn,
      currentSettings.style,
      currentSettings.theme,
      currentSettings.keyboardLayout
    );

    if (el) {
      const prevPressed = el.getAttribute('data-pressed');
      if (prevPressed !== isPressedStr) {
        el.setAttribute('data-pressed', isPressedStr);
        el.className = `keycap-wrapper ${k.is_down ? 'is-pressed' : ''}`;
        el.innerHTML = svgHtml;
      }
    } else {
      el = document.createElement('div');
      el.className = `keycap-wrapper ${k.is_down ? 'is-pressed' : ''}`;
      el.style.cssText = 'display: inline-flex !important; flex-direction: row !important; flex-shrink: 0 !important; align-items: center !important; justify-content: center !important;';
      el.setAttribute('data-key', k.key);
      el.setAttribute('data-pressed', isPressedStr);
      el.innerHTML = svgHtml;

      const comboEl = cluster.querySelector('.combination-container');
      if (comboEl) {
        cluster.insertBefore(el, comboEl);
      } else {
        cluster.appendChild(el);
      }
      existingKeyEls.set(k.key, el);
    }
  });

  // 3. Handle combination result container
  let comboEl = cluster.querySelector<HTMLElement>('.combination-container');
  if (combinationResultHtml) {
    if (!comboEl) {
      comboEl = document.createElement('div');
      comboEl.className = 'combination-container inline-flex items-center';
      cluster.appendChild(comboEl);
    }
    if (comboEl.innerHTML !== combinationResultHtml) {
      comboEl.innerHTML = combinationResultHtml;
    }
  } else if (comboEl) {
    comboEl.remove();
  }

  const effectiveScale = currentSettings.scale * getSizeNormalization(currentSettings.style);
  pod.style.transform = `scale(${effectiveScale})`;
  pod.classList.remove('opacity-0');
  pod.classList.add('opacity-100');

  // BRING WINDOW TO TOP OF Z-ORDER VIA WIN32 SETWINDOWPOS
  invokeBackend('show_hud');
}

function handleKeyEvent(item: KeyEventPayload) {
  if (!currentSettings.enabled) return;

  if (item.is_caps_on !== undefined) {
    isCapsStateOn = item.is_caps_on;
  }

  if (item.is_modifier) {
    modifierPressed = item.is_down;
  }

  if (clusterDismissTimer) {
    clearTimeout(clusterDismissTimer);
    clusterDismissTimer = null;
  }

  if (item.is_down) {
    // If all previous keys were already released, start a fresh sequence
    const anyStillDown = Array.from(activeKeys.values()).some(k => k.is_down);
    if (!anyStillDown && activeKeys.size > 0) {
      activeKeys.clear();
    }
    // Dynamically limit keys based on exact container width to prevent overflow
    const maxKeys = getMaxFittingKeys();
    while (activeKeys.size >= maxKeys) {
      const firstKey = activeKeys.keys().next().value;
      if (firstKey) activeKeys.delete(firstKey);
      else break;
    }
    activeKeys.set(item.key, item);
  } else {
    // Key released: mark as released so it visually pops up
    if (activeKeys.has(item.key)) {
      const existing = activeKeys.get(item.key)!;
      existing.is_down = false;
      activeKeys.set(item.key, existing);
    }
    // Check if all keys are released
    const anyStillDown = Array.from(activeKeys.values()).some(k => k.is_down);
    if (!anyStillDown && activeKeys.size > 0) {
      // Dismiss the entire group together after fadeDelay
      const delayMs = Math.max(400, (currentSettings.fadeDelay || 1.2) * 1000);
      clusterDismissTimer = setTimeout(() => {
        activeKeys.clear();
        updateCluster();
      }, delayMs);
    }
  }

  updateCluster();
}

if ((window as any).__TAURI__) {
  const { listen } = (window as any).__TAURI__.event;
  listen('key-event', (event: any) => handleKeyEvent(event.payload));
  listen('sync-settings', (event: any) => {
    currentSettings = event.payload;
    if (currentSettings.theme === 'custom') {
      const modC = currentSettings.customModColor || currentSettings.customColor || '#FF4740';
      const alphaC = currentSettings.customAlphaColor || currentSettings.customColor || '#F59E0B';
      setCustomDualColorTheme(modC, alphaC);
    }
    cluster.innerHTML = '';
    const effectiveScale = currentSettings.scale * getSizeNormalization(currentSettings.style);
    pod.style.transform = `scale(${effectiveScale})`;
    if (!currentSettings.enabled) {
      activeKeys.clear();
      pod.classList.remove('opacity-100');
      pod.classList.add('opacity-0');
      invokeBackend('hide_hud');
    }
    updateCluster();
  });
  listen('hud-position-selected', (event: any) => {
    if (event.payload) {
      if (event.payload.scale) {
        currentSettings.scale = event.payload.scale;
      }
      if (event.payload.width) currentSettings.customWidth = event.payload.width;
      if (event.payload.height) currentSettings.customHeight = event.payload.height;
      currentSettings.position = 'custom';
      currentSettings.customX = event.payload.x;
      currentSettings.customY = event.payload.y;
      const effectiveScale = currentSettings.scale * getSizeNormalization(currentSettings.style);
      pod.style.transform = `scale(${effectiveScale})`;
      updateCluster();
    }
  });
  listen('show-position-preview', () => {
    isPositionPreview = true;
    updateCluster();
  });
  listen('hide-position-preview', () => {
    isPositionPreview = false;
    updateCluster();
  });
}

// Window starts completely hidden
invokeBackend('hide_hud');

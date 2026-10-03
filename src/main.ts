import './style.css';
import {
  type AppSettings,
  defaultSettings,
  type KeycapStyle,
  type KeycapTheme,
  renderKeycap,
  setCustomDualColorTheme,
  getPodContainerStyle,
} from './keycap';
import { getCurrentWindow } from '@tauri-apps/api/window';

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem('key23_settings') || localStorage.getItem('winkeyty_settings');
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {}
  return defaultSettings;
}

function saveSettings(settings: AppSettings) {
  localStorage.setItem('key23_settings', JSON.stringify(settings));
  if ((window as any).__TAURI__) {
    try {
      (window as any).__TAURI__.core.invoke('sync_settings', { settings });
    } catch {}
    try {
      const { emitTo } = (window as any).__TAURI__.event;
      if (emitTo) {
        emitTo('overlay', 'sync-settings', settings);
        emitTo('mouse', 'sync-settings', settings);
      }
    } catch {}
  }
}

let currentSettings: AppSettings = loadSettings();
let isCustomColorPanelOpen = false;

if (currentSettings.theme === 'custom') {
  const modC = currentSettings.customModColor || currentSettings.customColor || '#FF4740';
  const alphaC = currentSettings.customAlphaColor || currentSettings.customColor || '#F59E0B';
  setCustomDualColorTheme(modC, alphaC);
}



// 10 Zengin Hazır Çift Renk Teması
const dualThemes: { id: KeycapTheme; label: string; modColor: string; alphaColor: string }[] = [
  { id: 'classic', label: 'Classic', modColor: '#FF4740', alphaColor: '#F59E0B' },
  { id: 'black', label: 'Black', modColor: '#18181b', alphaColor: '#3f3f46' },
  { id: 'blue', label: 'Blue', modColor: '#2563eb', alphaColor: '#93c5fd' },
  { id: 'white', label: 'White', modColor: '#ffffff', alphaColor: '#94a3b8' },
  { id: 'green', label: 'Emerald', modColor: '#059669', alphaColor: '#a7f3d0' },
  { id: 'purple', label: 'Purple', modColor: '#7c3aed', alphaColor: '#ddd6fe' },
  { id: 'rose', label: 'Rose', modColor: '#e11d48', alphaColor: '#fecdd3' },
  { id: 'orange', label: 'Amber', modColor: '#d97706', alphaColor: '#fde68a' },
  { id: 'citrus', label: 'Citrus', modColor: '#65a30d', alphaColor: '#fef08a' },
  { id: 'indigo', label: 'Indigo', modColor: '#4338ca', alphaColor: '#c7d2fe' },
];

function renderApp() {
  const app = document.getElementById('app')!;
  app.className = 'w-full h-full bg-[#0e0e12] text-zinc-100 flex flex-col select-none overflow-hidden font-sans';

  const modHex = currentSettings.customModColor || currentSettings.customColor || '#FF4740';
  const alphaHex = currentSettings.customAlphaColor || currentSettings.customColor || '#F59E0B';
  const isCustomTheme = currentSettings.theme === 'custom';

  app.innerHTML = `
    <!-- 1. CLEAN CAPTION BAR: Just Key23 title (No v2.0, no extra badges) -->
    <div id="cap-drag-header" data-tauri-drag-region class="flex items-center justify-between px-3.5 py-2.5 bg-[#121216] select-none flex-shrink-0 cursor-grab active:cursor-grabbing">
      <div class="flex items-center pointer-events-none">
        <span class="text-xs font-semibold text-white tracking-wide">Key23</span>
      </div>
      <div class="flex items-center gap-1">
        <button id="cap-minimize" title="Simge Durumuna Küçült" class="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition text-xs font-mono cursor-pointer">
          ─
        </button>
        <button id="cap-close" title="Kapat" class="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-rose-400 hover:bg-rose-500/20 transition text-xs cursor-pointer">
          ✕
        </button>
      </div>
    </div>

    <!-- 2. MAIN CONTENT BODY: Tight, compact, zero dead space -->
    <div class="p-2.5 flex-1 flex flex-col justify-start gap-1.5 overflow-y-auto">
      
      <!-- ÖNİZLEME BÖLÜMÜ (Renkli Arka Plan & Doğrudan Süzülen Tuşlar) -->
      <div class="flex gap-2 items-stretch">
        
        <!-- Sol: Renkli Canlı Önizleme Kutusu (Gradient Arka Plan) -->
        <div id="preview-box" class="flex-1 h-28 rounded-xl flex items-center justify-center p-2 relative overflow-hidden transition-all duration-300" style="background: linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 50%, #0f172a 100%); box-shadow: inset 0 0 35px rgba(59, 130, 246, 0.25); border: 1.5px solid rgba(255, 255, 255, 0.16);">
          <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(circle at 50% 50%, rgba(96, 165, 250, 0.22), transparent 70%);"></div>
          <div id="preview-pod" class="inline-flex items-center gap-2.5 relative z-10" style="width: max-content !important; max-width: none !important; box-sizing: border-box !important;">
            <!-- Caps Lock ve K -->
          </div>
        </div>

        <!-- Sağ: Klavye HUD Aç/Kapat + Özel Renk Açma Butonu -->
        <div class="w-[120px] flex-none flex flex-col justify-between gap-1">
          
          <!-- Klavye HUD Toggle -->
          <div class="cap-card p-1.5 flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-[10px] font-semibold text-zinc-200">Klavye HUD</span>
              <span class="text-[9px] ${currentSettings.enabled ? 'text-blue-400 font-medium' : 'text-zinc-500'}">
                ${currentSettings.enabled ? 'Açık' : 'Kapalı'}
              </span>
            </div>
            <button id="toggle-hud" class="cap-toggle ${currentSettings.enabled ? 'is-active' : ''}" role="switch">
              <span class="cap-toggle-thumb"></span>
            </button>
          </div>

          <!-- Özel Renk Butonu -->
          <button id="btn-toggle-custom-color" class="cap-card p-1.5 text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
            isCustomTheme || isCustomColorPanelOpen ? 'cap-card-active' : 'hover:border-white/20'
          }">
            <div class="flex items-center gap-1">
              <span class="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm" style="background: ${modHex};"></span>
              <span class="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm -ml-1.5" style="background: ${alphaHex};"></span>
            </div>
            <span class="text-[9px] font-medium text-zinc-200">
              ${isCustomColorPanelOpen ? 'Gizle' : 'Özel Renk'}
            </span>
          </button>

        </div>

      </div>

      <!-- ÖZEL RENK PANELİ (Kullanıcı açtığında görünür, tıklayınca asla kaybolmaz, Tamam butonu ile kapanır) -->
      ${
        isCustomColorPanelOpen
          ? `
        <div class="cap-card p-2 space-y-1.5">
          <div class="flex items-center justify-between border-b border-white/[0.06] pb-1">
            <span class="text-[10px] font-semibold text-zinc-200">İkili Renk Düzenleyici (Mod & Tuş)</span>
            <button id="btn-close-custom-color" class="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-medium transition cursor-pointer">
              Tamam
            </button>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <!-- Sol: Modifier Tuş Rengi (Ctrl, Shift, Caps Lock vb.) -->
            <div class="bg-[#121216] p-2 rounded-lg space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-medium text-zinc-300">Mod Tuşları</span>
                <input type="color" id="picker-mod-color" value="${modHex}" class="w-5 h-5 rounded cursor-pointer border border-white/20 p-0 bg-transparent" />
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-4 h-4 rounded-full border border-white/30 flex-shrink-0" id="preview-mod-swatch" style="background: ${modHex};"></span>
                <input type="text" id="input-mod-hex" value="${modHex}" maxlength="7" class="w-full bg-[#181820] text-zinc-200 text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/10 outline-none uppercase" />
              </div>
              <!-- Hızlı Renk Seçiciler -->
              <div class="flex items-center gap-1 pt-0.5">
                ${['#FF4740', '#2563eb', '#059669', '#7c3aed', '#18181b', '#ffffff']
                  .map(
                    (c) => `
                  <button data-quick-mod="${c}" class="w-3.5 h-3.5 rounded-full border border-white/20 transition hover:scale-110 cursor-pointer" style="background: ${c};"></button>
                `
                  )
                  .join('')}
              </div>
            </div>

            <!-- Sağ: Karakter Tuş Rengi (Harfler, Rakamlar) -->
            <div class="bg-[#121216] p-2 rounded-lg space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-medium text-zinc-300">Karakter Tuşları</span>
                <input type="color" id="picker-alpha-color" value="${alphaHex}" class="w-5 h-5 rounded cursor-pointer border border-white/20 p-0 bg-transparent" />
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-4 h-4 rounded-full border border-white/30 flex-shrink-0" id="preview-alpha-swatch" style="background: ${alphaHex};"></span>
                <input type="text" id="input-alpha-hex" value="${alphaHex}" maxlength="7" class="w-full bg-[#181820] text-zinc-200 text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/10 outline-none uppercase" />
              </div>
              <!-- Hızlı Renk Seçiciler -->
              <div class="flex items-center gap-1 pt-0.5">
                ${['#F59E0B', '#93c5fd', '#a7f3d0', '#ddd6fe', '#3f3f46', '#94a3b8']
                  .map(
                    (c) => `
                  <button data-quick-alpha="${c}" class="w-3.5 h-3.5 rounded-full border border-white/20 transition hover:scale-110 cursor-pointer" style="background: ${c};"></button>
                `
                  )
                  .join('')}
              </div>
            </div>
          </div>
        </div>
      `
          : ''
      }

      <!-- 10 ÇİFT RENKLİ HAZIR TEMA GALERİSİ -->
      <div class="space-y-1">
        <span class="text-[10px] font-semibold tracking-wider uppercase text-zinc-400">Renk Temaları</span>
        <div class="grid grid-cols-5 gap-1">
          ${dualThemes
            .map(
              (t) => `
            <button data-set-theme="${t.id}" title="${t.label}" class="py-1 px-1 rounded-lg border text-center transition flex items-center justify-center gap-1 cursor-pointer ${
              !isCustomTheme && currentSettings.theme === t.id ? 'cap-card-active' : 'cap-card hover:border-white/20'
            }">
              <span class="w-3 h-3 rounded-full flex-shrink-0 shadow-sm border border-white/20" style="background: linear-gradient(135deg, ${t.modColor} 50%, ${t.alphaColor} 50%);"></span>
              <span class="text-[10px] font-medium text-zinc-200 truncate">${t.label}</span>
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- KLAVYE STİLİ (5 Stil) -->
      <div class="space-y-1">
        <span class="text-[10px] font-semibold tracking-wider uppercase text-zinc-400">Klavye Stili</span>
        <div class="grid grid-cols-5 gap-1.5">
          
          <!-- 1. PBT -->
          <button data-set-style="pbt" class="h-14 py-1 px-1 rounded-xl text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
            currentSettings.style === 'pbt' ? 'cap-card-active' : 'cap-card hover:border-white/20'
          }">
            <div class="h-7 flex items-center justify-center">
              <div class="scale-[0.26] origin-center">
                ${renderKeycap('pbt', 'K', null, false, false, false, 'pbt', currentSettings.theme, 'en')}
              </div>
            </div>
            <span class="text-[10px] font-medium text-zinc-200 leading-none">PBT</span>
          </button>

          <!-- 2. Apple -->
          <button data-set-style="apple" class="h-14 py-1 px-1 rounded-xl text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
            currentSettings.style === 'apple' ? 'cap-card-active' : 'cap-card hover:border-white/20'
          }">
            <div class="h-7 flex items-center justify-center">
              <div class="scale-[0.35] origin-center">
                ${renderKeycap('apple', 'K', null, false, false, false, 'apple', currentSettings.theme, 'en')}
              </div>
            </div>
            <span class="text-[10px] font-medium text-zinc-200 leading-none">Apple</span>
          </button>

          <!-- 3. Retro -->
          <button data-set-style="retro" class="h-14 py-1 px-1 rounded-xl text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
            currentSettings.style === 'retro' ? 'cap-card-active' : 'cap-card hover:border-white/20'
          }">
            <div class="h-7 flex items-center justify-center">
              <div class="scale-[0.27] origin-center">
                ${renderKeycap('retro', 'K', null, false, false, false, 'retro', currentSettings.theme, 'en')}
              </div>
            </div>
            <span class="text-[10px] font-medium text-zinc-200 leading-none">Retro</span>
          </button>

          <!-- 4. Minimal -->
          <button data-set-style="minimal" class="h-14 py-1 px-1 rounded-xl text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
            currentSettings.style === 'minimal' ? 'cap-card-active' : 'cap-card hover:border-white/20'
          }">
            <div class="h-7 flex items-center justify-center">
              <div class="scale-[0.38] origin-center">
                ${renderKeycap('minimal', 'K', null, false, false, false, 'minimal', currentSettings.theme, 'en')}
              </div>
            </div>
            <span class="text-[10px] font-medium text-zinc-200 leading-none">Minimal</span>
          </button>

          <!-- 5. M0116 -->
          <button data-set-style="m0116" class="h-14 py-1 px-1 rounded-xl text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
            currentSettings.style === 'm0116' ? 'cap-card-active' : 'cap-card hover:border-white/20'
          }">
            <div class="h-7 flex items-center justify-center">
              <div class="scale-[0.28] origin-center">
                ${renderKeycap('m0116', 'K', null, false, false, false, 'm0116', currentSettings.theme, 'en')}
              </div>
            </div>
            <span class="text-[10px] font-medium text-zinc-200 leading-none">M0116</span>
          </button>

        </div>
      </div>

      <!-- AYARLAR & KONTROLLER (Ekran Konumu, Boyut, Süre, İmleç) -->
      <div class="cap-card p-2.5 space-y-2">
        
        <!-- Ekran Konumu -->
        <div class="flex items-center justify-between">
          <div>
            <span class="text-[11px] text-zinc-300 font-medium">Ekran Konumu</span>
            <div class="text-[9px] text-zinc-400">
              ${currentSettings.position === 'custom' && currentSettings.customX !== undefined
                ? `<span class="text-blue-400 font-medium">Özel (${currentSettings.customX}, ${currentSettings.customY})${currentSettings.customWidth ? ` • ${currentSettings.customWidth}×${currentSettings.customHeight}px` : ''}</span>`
                : 'Varsayılan (Alt Orta)'}
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <button id="btn-reset-pos" title="Varsayılan konuma sıfırla" class="px-2 py-1 rounded-lg text-[10px] bg-[#1a1a22] hover:bg-[#23232e] text-zinc-300 hover:text-white border border-white/[0.08] transition flex items-center gap-1 cursor-pointer">
              <svg class="w-3 h-3 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
              <span>Sıfırla</span>
            </button>
            <button id="btn-pick-pos" class="px-2.5 py-1 rounded-lg text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-medium border border-blue-400/30 shadow-none transition flex items-center gap-1.5 cursor-pointer">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="9"/>
                <line x1="12" y1="3" x2="12" y2="7"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
                <line x1="3" y1="12" x2="7" y2="12"/>
                <line x1="17" y1="12" x2="21" y2="12"/>
              </svg>
              <span>Konum Ayarla</span>
            </button>
          </div>
        </div>

        <!-- Sliders: Boyut & Kalma Süresi -->
        <div class="grid grid-cols-2 gap-4 pt-0.5">
          <div>
            <div class="flex justify-between items-center text-[10px] mb-1">
              <span class="text-zinc-400">Boyut</span>
              <span id="txt-scale" class="font-mono text-blue-400 font-medium">${currentSettings.scale.toFixed(1)}x</span>
            </div>
            <input id="slider-scale" type="range" min="0.7" max="1.4" step="0.05" value="${currentSettings.scale}" class="w-full" />
          </div>

          <div>
            <div class="flex justify-between items-center text-[10px] mb-1">
              <span class="text-zinc-400">Süre</span>
              <span id="txt-delay" class="font-mono text-blue-400 font-medium">${currentSettings.fadeDelay.toFixed(1)}s</span>
            </div>
            <input id="slider-delay" type="range" min="0.5" max="3.0" step="0.1" value="${currentSettings.fadeDelay}" class="w-full" />
          </div>
        </div>

        <!-- Options: İmleç Yanı Fare & Kısayollar -->
        <div class="pt-0.5 space-y-1.5 pb-0.5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] text-zinc-300 font-medium">İmleç Yanı Fare Simgesi</span>
            <button id="toggle-pointer" class="cap-toggle ${currentSettings.pointerIconEnabled ? 'is-active' : ''}" role="switch">
              <span class="cap-toggle-thumb"></span>
            </button>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-[11px] text-zinc-300 font-medium">Yalnızca Kısayollar</span>
            <button id="toggle-shortcuts" class="cap-toggle ${currentSettings.onlyShortcuts ? 'is-active' : ''}" role="switch">
              <span class="cap-toggle-thumb"></span>
            </button>
          </div>
        </div>

        <!-- Tuş Arka Plan Rengi (HUD Zemin) -->
        <div class="pt-1.5 border-t border-white/[0.06] space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] text-zinc-300 font-medium">Tuş Arka Planı (Zemin)</span>
            <div class="flex items-center gap-1.5">
              <span id="txt-pod-opacity" class="text-[10px] font-mono text-blue-400 font-medium">${currentSettings.podBgMode === 'none' ? 'Şeffaf' : `%${currentSettings.podBgOpacity ?? 95}`}</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-1.5">
            <div class="flex items-center gap-1">
              <!-- Siyah -->
              <button data-set-pod-bg="#121216" title="Siyah Zemin" class="w-6 h-6 rounded-md border flex items-center justify-center transition cursor-pointer ${currentSettings.podBgMode !== 'none' && (currentSettings.podBgCustomColor || '#121216') === '#121216' ? 'border-blue-400 ring-1 ring-blue-400' : 'border-white/20 hover:border-white/40'}" style="background: #121216;">
                <span class="w-2 h-2 rounded-full bg-white/70"></span>
              </button>
              <!-- Koyu Gri -->
              <button data-set-pod-bg="#27272a" title="Grafit Koyu Gri" class="w-6 h-6 rounded-md border flex items-center justify-center transition cursor-pointer ${currentSettings.podBgMode !== 'none' && currentSettings.podBgCustomColor === '#27272a' ? 'border-blue-400 ring-1 ring-blue-400' : 'border-white/20 hover:border-white/40'}" style="background: #27272a;">
              </button>
              <!-- Gece Mavisi -->
              <button data-set-pod-bg="#0f172a" title="Gece Mavisi" class="w-6 h-6 rounded-md border flex items-center justify-center transition cursor-pointer ${currentSettings.podBgMode !== 'none' && currentSettings.podBgCustomColor === '#0f172a' ? 'border-blue-400 ring-1 ring-blue-400' : 'border-white/20 hover:border-white/40'}" style="background: #0f172a;">
              </button>
              <!-- Şeffaf -->
              <button id="btn-pod-transparent" title="Şeffaf (Zeminsiz)" class="px-1.5 h-6 rounded-md border text-[9px] font-medium flex items-center justify-center transition cursor-pointer ${currentSettings.podBgMode === 'none' ? 'border-blue-400 bg-blue-500/20 text-blue-300 ring-1 ring-blue-400' : 'border-white/20 text-zinc-400 hover:text-white hover:border-white/40 bg-white/[0.04]'}">
                Şeffaf
              </button>
            </div>

            <!-- Özel Renk Seçici & Opaklık -->
            <div class="flex items-center gap-1.5">
              <span class="text-[9px] text-zinc-400">Renk:</span>
              <input type="color" id="picker-pod-color" value="${currentSettings.podBgCustomColor || '#121216'}" class="w-5 h-5 rounded cursor-pointer border border-white/20 p-0 bg-transparent" />
              <input id="slider-pod-opacity" type="range" min="20" max="100" step="5" value="${currentSettings.podBgOpacity ?? 95}" title="Zemin Opaklığı" class="w-14 cursor-pointer" />
            </div>
          </div>
        </div>

      </div>

    </div>
  `;

  updatePreviewArea();
  attachEventListeners();
}

function updatePreviewArea() {
  const pod = document.getElementById('preview-pod');
  if (!pod) return;

  const style = currentSettings.style;
  const theme = currentSettings.theme;

  // Sabit ve temiz önizleme ölçeği (Göz dolduran, tam ortalanmış net tuşlar)
  const scaleMap: Record<KeycapStyle, number> = {
    pbt: 0.65,
    retro: 0.65,
    m0116: 0.68,
    apple: 0.72,
    minimal: 0.75,
  };
  const effectiveScale = scaleMap[style] || 0.65;

  // Ön izleme kutusunun arkaplanını renkli ve canlı yap
  const previewBox = document.getElementById('preview-box');
  if (previewBox) {
    let c1 = '#1e3a8a';
    let c2 = '#1e1b4b';
    if (theme === 'blue') { c1 = '#1d4ed8'; c2 = '#172554'; }
    else if (theme === 'green') { c1 = '#047857'; c2 = '#064e3b'; }
    else if (theme === 'purple') { c1 = '#6d28d9'; c2 = '#3b0764'; }
    else if (theme === 'rose') { c1 = '#be123c'; c2 = '#4c0519'; }
    else if (theme === 'orange') { c1 = '#b45309'; c2 = '#451a03'; }
    else if (theme === 'citrus') { c1 = '#4d7c0f'; c2 = '#1a2e05'; }
    else if (theme === 'indigo') { c1 = '#3730a3'; c2 = '#1e1b4b'; }
    else if (theme === 'custom') {
      const modHex = currentSettings.customModColor || '#FF4740';
      c1 = modHex;
      c2 = '#0f172a';
    }
    previewBox.style.background = `linear-gradient(135deg, ${c1} 0%, ${c2} 60%, #090d16 100%)`;
  }

  // Canlı ön izleme pod zemin stili (Kullanıcının belirlediği zemin rengi ve kenarlık)
  const isBgEnabled = currentSettings.showKeyBackground !== false && currentSettings.podBgMode !== 'none';
  if (isBgEnabled) {
    const podStyle = getPodContainerStyle(style, theme, currentSettings);
    pod.style.background = podStyle.background;
    pod.style.border = 'none';
    pod.style.outline = 'none';
    pod.style.borderRadius = podStyle.borderRadius;
    pod.style.padding = podStyle.padding || '12px 18px';
    pod.style.boxShadow = podStyle.boxShadow;
    pod.style.gap = podStyle.gap || '8px';
  } else {
    pod.style.background = 'transparent';
    pod.style.border = 'none';
    pod.style.borderRadius = '0';
    pod.style.padding = '0';
    pod.style.boxShadow = 'none';
    pod.style.gap = '8px';
  }

  pod.style.boxSizing = 'border-box';
  pod.style.width = 'max-content';
  pod.style.maxWidth = 'none';
  pod.style.flexShrink = '0';
  pod.style.transform = `scale(${effectiveScale})`;
  pod.style.transformOrigin = 'center center';

  // EXACTLY TWO KEYS: Caps Lock + K (Büyük, net ve ortalı)
  pod.innerHTML = `
    ${renderKeycap('caps', 'caps lock', 'caps', false, false, true, style, theme, currentSettings.keyboardLayout)}
    ${renderKeycap('k', 'K', null, false, false, false, style, theme, currentSettings.keyboardLayout)}
  `;
}

function updateCustomColors(modHex: string, alphaHex: string) {
  currentSettings.theme = 'custom';
  currentSettings.customModColor = modHex;
  currentSettings.customAlphaColor = alphaHex;
  setCustomDualColorTheme(modHex, alphaHex);
  saveSettings(currentSettings);
  updatePreviewArea();

  const previewModSwatch = document.getElementById('preview-mod-swatch');
  const previewAlphaSwatch = document.getElementById('preview-alpha-swatch');
  const inputModHex = document.getElementById('input-mod-hex') as HTMLInputElement;
  const inputAlphaHex = document.getElementById('input-alpha-hex') as HTMLInputElement;
  const pickerMod = document.getElementById('picker-mod-color') as HTMLInputElement;
  const pickerAlpha = document.getElementById('picker-alpha-color') as HTMLInputElement;

  if (previewModSwatch) previewModSwatch.style.background = modHex;
  if (previewAlphaSwatch) previewAlphaSwatch.style.background = alphaHex;
  if (inputModHex && inputModHex.value !== modHex) inputModHex.value = modHex;
  if (inputAlphaHex && inputAlphaHex.value !== alphaHex) inputAlphaHex.value = alphaHex;
  if (pickerMod && pickerMod.value !== modHex) pickerMod.value = modHex;
  if (pickerAlpha && pickerAlpha.value !== alphaHex) pickerAlpha.value = alphaHex;
}

function attachEventListeners() {
  const appWindow = getCurrentWindow();

  // Cap Caption Bar Controls (Dragging, Minimize & Close)
  document.getElementById('cap-drag-header')?.addEventListener('mousedown', (e) => {
    if ((e.target as HTMLElement).closest('button, input, a, label')) return;
    if (e.buttons === 1) {
      try {
        if ((window as any).__TAURI__) {
          (window as any).__TAURI__.core.invoke('drag_window');
        }
        appWindow.startDragging();
      } catch {}
    }
  });

  document.getElementById('cap-minimize')?.addEventListener('click', () => {
    appWindow.minimize();
  });
  document.getElementById('cap-close')?.addEventListener('click', () => {
    if ((window as any).__TAURI__) {
      (window as any).__TAURI__.core.invoke('app_exit');
    }
  });

  // Toggle Custom Color Panel
  document.getElementById('btn-toggle-custom-color')?.addEventListener('click', () => {
    isCustomColorPanelOpen = !isCustomColorPanelOpen;
    renderApp();
  });

  document.getElementById('btn-close-custom-color')?.addEventListener('click', () => {
    isCustomColorPanelOpen = false;
    renderApp();
  });

  // Style selector buttons
  document.querySelectorAll('[data-set-style]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      currentSettings.style = (e.currentTarget as HTMLElement).getAttribute('data-set-style') as any;
      saveSettings(currentSettings);
      renderApp();
    });
  });

  // Dual Theme Presets
  document.querySelectorAll('[data-set-theme]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const themeId = (e.currentTarget as HTMLElement).getAttribute('data-set-theme') as KeycapTheme;
      const themeObj = dualThemes.find((t) => t.id === themeId);
      currentSettings.theme = themeId;
      if (themeObj) {
        currentSettings.customModColor = themeObj.modColor;
        currentSettings.customAlphaColor = themeObj.alphaColor;
        setCustomDualColorTheme(themeObj.modColor, themeObj.alphaColor);
      }
      saveSettings(currentSettings);
      renderApp();
    });
  });

  // Custom Color Event Listeners (Does NOT destroy DOM on click/drag)
  const pickerMod = document.getElementById('picker-mod-color') as HTMLInputElement;
  pickerMod?.addEventListener('input', (e) => {
    const val = (e.target as HTMLInputElement).value;
    const alpha = currentSettings.customAlphaColor || '#F59E0B';
    updateCustomColors(val, alpha);
  });

  const pickerAlpha = document.getElementById('picker-alpha-color') as HTMLInputElement;
  pickerAlpha?.addEventListener('input', (e) => {
    const val = (e.target as HTMLInputElement).value;
    const mod = currentSettings.customModColor || '#FF4740';
    updateCustomColors(mod, val);
  });

  const inputModHex = document.getElementById('input-mod-hex') as HTMLInputElement;
  inputModHex?.addEventListener('input', (e) => {
    let val = (e.target as HTMLInputElement).value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      const alpha = currentSettings.customAlphaColor || '#F59E0B';
      updateCustomColors(val, alpha);
    }
  });

  const inputAlphaHex = document.getElementById('input-alpha-hex') as HTMLInputElement;
  inputAlphaHex?.addEventListener('input', (e) => {
    let val = (e.target as HTMLInputElement).value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      const mod = currentSettings.customModColor || '#FF4740';
      updateCustomColors(mod, val);
    }
  });

  // Quick Swatches
  document.querySelectorAll('[data-quick-mod]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const val = (e.currentTarget as HTMLElement).getAttribute('data-quick-mod');
      if (val) {
        const alpha = currentSettings.customAlphaColor || '#F59E0B';
        updateCustomColors(val, alpha);
      }
    });
  });

  document.querySelectorAll('[data-quick-alpha]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const val = (e.currentTarget as HTMLElement).getAttribute('data-quick-alpha');
      if (val) {
        const mod = currentSettings.customModColor || '#FF4740';
        updateCustomColors(mod, val);
      }
    });
  });

  // Position Picker & Reset
  document.getElementById('btn-pick-pos')?.addEventListener('click', () => {
    if ((window as any).__TAURI__) {
      (window as any).__TAURI__.core.invoke('open_position_picker');
    }
  });

  document.getElementById('btn-reset-pos')?.addEventListener('click', () => {
    currentSettings.position = 'bottom_center';
    delete currentSettings.customX;
    delete currentSettings.customY;
    saveSettings(currentSettings);
    if ((window as any).__TAURI__) {
      (window as any).__TAURI__.core.invoke('reset_hud_position');
    }
    renderApp();
  });

  // Sliders
  let scalePreviewTimer: any = null;
  const sliderScale = document.getElementById('slider-scale') as HTMLInputElement;
  sliderScale?.addEventListener('input', (e) => {
    currentSettings.scale = parseFloat((e.target as HTMLInputElement).value);
    const txt = document.getElementById('txt-scale');
    if (txt) txt.textContent = `${currentSettings.scale.toFixed(1)}x`;
    saveSettings(currentSettings); // sync-settings'i overlay'e gönderir

    // Ekranda canlı boyut önizlemesi göster
    if ((window as any).__TAURI__) {
      const { emitTo } = (window as any).__TAURI__.event;
      if (emitTo) {
        emitTo('overlay', 'show-position-preview', {});
      }
      if (scalePreviewTimer) clearTimeout(scalePreviewTimer);
      scalePreviewTimer = setTimeout(() => {
        if (emitTo) emitTo('overlay', 'hide-position-preview', {});
      }, 1500);
    }
  });

  const sliderDelay = document.getElementById('slider-delay') as HTMLInputElement;
  sliderDelay?.addEventListener('input', (e) => {
    currentSettings.fadeDelay = parseFloat((e.target as HTMLInputElement).value);
    const txt = document.getElementById('txt-delay');
    if (txt) txt.textContent = `${currentSettings.fadeDelay.toFixed(1)}s`;
    saveSettings(currentSettings);
  });

  // Main Active HUD Toggle
  document.getElementById('toggle-hud')?.addEventListener('click', () => {
    currentSettings.enabled = !currentSettings.enabled;
    saveSettings(currentSettings);
    renderApp();
  });

  // Pointer and Shortcuts Toggles
  document.getElementById('toggle-pointer')?.addEventListener('click', () => {
    currentSettings.pointerIconEnabled = !currentSettings.pointerIconEnabled;
    saveSettings(currentSettings);
    renderApp();
  });

  document.getElementById('toggle-shortcuts')?.addEventListener('click', () => {
    currentSettings.onlyShortcuts = !currentSettings.onlyShortcuts;
    saveSettings(currentSettings);
    renderApp();
  });

  // Pod Background Color, Presets and Opacity
  document.querySelectorAll('[data-set-pod-bg]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const color = (e.currentTarget as HTMLElement).getAttribute('data-set-pod-bg');
      if (color) {
        currentSettings.podBgMode = 'custom';
        currentSettings.podBgCustomColor = color;
        currentSettings.showKeyBackground = true;
        saveSettings(currentSettings);
        renderApp();
      }
    });
  });

  document.getElementById('btn-pod-transparent')?.addEventListener('click', () => {
    currentSettings.podBgMode = 'none';
    currentSettings.showKeyBackground = false;
    saveSettings(currentSettings);
    renderApp();
  });

  const pickerPodColor = document.getElementById('picker-pod-color') as HTMLInputElement;
  pickerPodColor?.addEventListener('input', (e) => {
    const val = (e.target as HTMLInputElement).value;
    currentSettings.podBgMode = 'custom';
    currentSettings.podBgCustomColor = val;
    currentSettings.showKeyBackground = true;
    saveSettings(currentSettings);
    updatePreviewArea();
  });

  const sliderPodOpacity = document.getElementById('slider-pod-opacity') as HTMLInputElement;
  sliderPodOpacity?.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    currentSettings.podBgOpacity = val;
    if (currentSettings.podBgMode === 'none') {
      currentSettings.podBgMode = 'custom';
      currentSettings.showKeyBackground = true;
    }
    const txt = document.getElementById('txt-pod-opacity');
    if (txt) txt.textContent = `%${val}`;
    saveSettings(currentSettings);
    updatePreviewArea();
  });
}

// Background Event Listeners
if ((window as any).__TAURI__) {
  const { listen } = (window as any).__TAURI__.event;

  listen('hud-position-selected', (event: any) => {
    if (event.payload) {
      currentSettings.position = 'custom';
      currentSettings.customX = event.payload.x;
      currentSettings.customY = event.payload.y;
      if (event.payload.width) currentSettings.customWidth = event.payload.width;
      if (event.payload.height) currentSettings.customHeight = event.payload.height;
      if (event.payload.scale) {
        currentSettings.scale = Math.round(event.payload.scale * 100) / 100;
      }
      saveSettings(currentSettings);
      renderApp();
    }
  });

  listen('hud-position-reset', () => {
    currentSettings.position = 'bottom_center';
    delete currentSettings.customX;
    delete currentSettings.customY;
    delete currentSettings.customWidth;
    delete currentSettings.customHeight;
    currentSettings.scale = 1.0;
    saveSettings(currentSettings);
    renderApp();
  });
}

renderApp();

import './style.css';

let leftActive = false;
let rightActive = false;
let middleActive = false;
let wheelUpActive = false;
let wheelDownActive = false;

let hideTimer: any = null;
let wheelTimer: any = null;

// Settings state
let isEnabled = true;
try {
  const saved = localStorage.getItem('key23_settings') || localStorage.getItem('winkeyty_settings');
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.pointerIconEnabled === false) {
      isEnabled = false;
    }
  }
} catch (e) {}

const app = document.getElementById('app')!;

function invokeBackend(cmd: string, args: Record<string, any> = {}) {
  if ((window as any).__TAURI__) {
    return (window as any).__TAURI__.core.invoke(cmd, args).catch(() => {});
  }
  return Promise.resolve();
}

function renderMouse() {
  const isAnyActive = leftActive || rightActive || middleActive || wheelUpActive || wheelDownActive;

  if (!isEnabled || !isAnyActive) {
    app.innerHTML = '';
    return;
  }

  // Ultra-minimal mouse indicator
  app.innerHTML = `
    <div id="mouse-pill" style="
      width: 32px;
      height: 46px;
      border-radius: 9999px;
      background: rgba(12, 14, 18, 0.88);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
      pointer-events: none;
      opacity: 1;
    ">
      <svg width="16" height="28" viewBox="0 0 16 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="mc">
            <rect x="1" y="1" width="14" height="26" rx="7" ry="7" />
          </clipPath>
        </defs>

        <!-- Left click fill -->
        ${leftActive ? `
          <g clip-path="url(#mc)">
            <path d="M0 0 H8 V14 H0 Z" fill="rgba(255,255,255,0.9)" />
          </g>
        ` : ''}

        <!-- Right click fill -->
        ${rightActive ? `
          <g clip-path="url(#mc)">
            <path d="M8 0 H16 V14 H8 Z" fill="rgba(255,255,255,0.9)" />
          </g>
        ` : ''}

        <!-- Middle click fill -->
        ${middleActive ? `
          <rect x="6.5" y="3.5" width="3" height="7" rx="1.5" fill="rgba(255,255,255,0.9)" />
        ` : ''}

        <!-- Outer capsule -->
        <rect x="1" y="1" width="14" height="26" rx="7" ry="7" stroke="rgba(255,255,255,0.85)" stroke-width="1.5" fill="none" />

        <!-- Scroll wheel slot -->
        <rect x="6.5" y="3.5" width="3" height="7" rx="1.5"
          fill="${middleActive ? 'rgba(255,255,255,0.9)' : 'none'}"
          stroke="rgba(255,255,255,0.7)"
          stroke-width="1.2"
        />

        <!-- Scroll up arrow -->
        ${wheelUpActive ? `
          <polyline points="5.5,9 8,6.5 10.5,9" fill="none" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        ` : ''}

        <!-- Scroll down arrow -->
        ${wheelDownActive ? `
          <polyline points="5.5,5 8,7.5 10.5,5" fill="none" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        ` : ''}
      </svg>
    </div>
  `;
}

renderMouse();
invokeBackend('hide_mouse');

if ((window as any).__TAURI__) {
  const { listen } = (window as any).__TAURI__.event;

  // Listen for settings update from main settings window
  const updateSettingsListener = (event: any) => {
    if (event.payload) {
      isEnabled = event.payload.pointerIconEnabled !== false;
      if (!isEnabled) {
        leftActive = false;
        rightActive = false;
        middleActive = false;
        wheelUpActive = false;
        wheelDownActive = false;
        renderMouse();
        invokeBackend('hide_mouse');
      }
    }
  };

  listen('settings-updated', updateSettingsListener);
  listen('sync-settings', updateSettingsListener);

  // Listen for mouse inputs
  listen('mouse-event', (event: any) => {
    if (!isEnabled) {
      invokeBackend('hide_mouse');
      return;
    }

    const { button, is_down } = event.payload;

    if (button === 'mouse_left') {
      leftActive = is_down;
    } else if (button === 'mouse_right') {
      rightActive = is_down;
    } else if (button === 'mouse_middle') {
      middleActive = is_down;
    } else if (button === 'wheel_up') {
      wheelUpActive = true;
      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        wheelUpActive = false;
        renderMouse();
        if (!leftActive && !rightActive && !middleActive && !wheelDownActive) {
          invokeBackend('hide_mouse');
        }
      }, 300);
    } else if (button === 'wheel_down') {
      wheelDownActive = true;
      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        wheelDownActive = false;
        renderMouse();
        if (!leftActive && !rightActive && !middleActive && !wheelUpActive) {
          invokeBackend('hide_mouse');
        }
      }, 300);
    }

    const isAnyActive = leftActive || rightActive || middleActive || wheelUpActive || wheelDownActive;

    if (isAnyActive) {
      renderMouse();
      invokeBackend('show_mouse');
    }

    if (hideTimer) clearTimeout(hideTimer);

    if (button.startsWith('wheel')) {
      hideTimer = setTimeout(() => {
        if (!leftActive && !rightActive && !middleActive) {
          wheelUpActive = false;
          wheelDownActive = false;
          renderMouse();
          invokeBackend('hide_mouse');
        }
      }, 350);
    } else if (!is_down) {
      // Button release: smoothly hide after short delay
      hideTimer = setTimeout(() => {
        leftActive = false;
        rightActive = false;
        middleActive = false;
        wheelUpActive = false;
        wheelDownActive = false;
        renderMouse();
        invokeBackend('hide_mouse');
      }, 250);
    }
  });
}

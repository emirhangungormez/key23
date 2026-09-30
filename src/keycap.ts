export interface KeyEventPayload {
  vk: number;
  is_down: boolean;
  key: string;
  label: string;
  symbol: string | null;
  is_modifier: boolean;
  is_caps_on?: boolean;
  result_char?: string | null;
}

export type KeycapStyle = 'pbt' | 'apple' | 'retro' | 'minimal' | 'm0116';
export type KeycapTheme =
  | 'classic'
  | 'black'
  | 'white'
  | 'citrus'
  | 'indigo'
  | 'rose'
  | 'red'
  | 'green'
  | 'blue'
  | 'purple'
  | 'yellow'
  | 'orange'
  | 'pink'
  | 'custom';

export type PodBgMode = 'auto' | 'dark' | 'glass' | 'translucent' | 'none' | 'custom';

export interface AppSettings {
  enabled: boolean;
  onlyShortcuts: boolean;
  showCombinationResult: boolean;
  pointerIconEnabled: boolean;
  style: KeycapStyle;
  theme: KeycapTheme;
  customColor?: string;
  customModColor?: string;
  customAlphaColor?: string;
  scale: number;
  fadeDelay: number;
  position: 'bottom_center' | 'top_center' | 'bottom_left' | 'bottom_right' | 'custom';
  customX?: number;
  customY?: number;
  customWidth?: number;
  customHeight?: number;
  showKeyBackground: boolean;
  podBgMode: PodBgMode;
  podBgCustomColor: string;
  podBgOpacity: number;
  keyboardLayout: string;
}

export const defaultSettings: AppSettings = {
  enabled: true,
  onlyShortcuts: false,
  showCombinationResult: true,
  pointerIconEnabled: true,
  showKeyBackground: true,
  style: 'pbt',
  theme: 'classic',
  customColor: '#3b82f6',
  scale: 1.0,
  fadeDelay: 1.5,
  position: 'bottom_center',
  podBgMode: 'auto',
  podBgCustomColor: '#171717',
  podBgOpacity: 92,
  keyboardLayout: 'auto',
};

// Color manipulation helpers matching NSColor+Blend.swift
function parseHex(hex: string): [number, number, number] {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const num = parseInt(hex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function toHex([r, g, b]: [number, number, number]): string {
  return '#' + [r, g, b].map(x => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
}

export function blend(c1: string, c2: string, fraction: number): string {
  const [r1, g1, b1] = parseHex(c1);
  const [r2, g2, b2] = parseHex(c2);
  return toHex([
    r1 + (r2 - r1) * fraction,
    g1 + (g2 - g1) * fraction,
    b1 + (b2 - b1) * fraction,
  ]);
}

export function lightened(c: string, fraction: number): string {
  return blend(c, '#ffffff', fraction);
}

export function darkened(c: string, fraction: number): string {
  return blend(c, '#000000', fraction);
}

export interface KeycapThemeTokens {
  swatch: string;
  textColor: string;
  groupBg: string;
  groupStroke: string;
  surfaceHighlight: string;
  surfaceBase: string;
  surfaceShadow: string;
  surfaceBorder: string;
  recess: string;
  undersideEdge: string;
  undersideCenter: string;
}

// 100% Exact color tokens from KeyboardVisualizerTheme.swift
export const themeTokenRegistry: Record<string, KeycapThemeTokens> = {
  black: {
    swatch: '#141414',
    textColor: '#ffffff',
    groupBg: 'rgba(23, 23, 23, 0.95)',
    groupStroke: 'rgba(61, 61, 61, 0.62)',
    surfaceHighlight: '#383838',
    surfaceBase: '#090909',
    surfaceShadow: '#0D0D0D',
    surfaceBorder: '#474747',
    recess: '#1C1C1C',
    undersideEdge: '#090909',
    undersideCenter: '#1C1C1C',
  },
  white: {
    swatch: '#F5F5F5',
    textColor: '#63625D',
    groupBg: 'rgba(230, 230, 230, 0.92)',
    groupStroke: 'rgba(191, 191, 191, 0.70)',
    surfaceHighlight: '#FCFCFC',
    surfaceBase: '#F0F0F0',
    surfaceShadow: '#E0E0E0',
    surfaceBorder: '#C7C7C7',
    recess: '#DBDBDB',
    undersideEdge: '#DBDBDB',
    undersideCenter: '#F0F0F0',
  },
  citrus: {
    swatch: '#F1EFC0',
    textColor: '#63625D',
    groupBg: 'rgba(205, 205, 133, 0.90)',
    groupStroke: 'rgba(174, 172, 102, 0.65)',
    surfaceHighlight: '#FAFAF5',
    surfaceBase: '#F1EFBF',
    surfaceShadow: '#E6E3A8',
    surfaceBorder: '#9E9A5C',
    recess: '#C6C27C',
    undersideEdge: '#C6C27C',
    undersideCenter: '#F1EFBF',
  },
  indigo: {
    swatch: '#9098B0',
    textColor: '#3B3F44',
    groupBg: 'rgba(56, 64, 80, 0.92)',
    groupStroke: 'rgba(120, 132, 161, 0.65)',
    surfaceHighlight: '#9FA7BF',
    surfaceBase: '#9098B0',
    surfaceShadow: '#7D859D',
    surfaceBorder: '#7C88A3',
    recess: '#50586E',
    undersideEdge: '#50586E',
    undersideCenter: '#9098B0',
  },
  rose: {
    swatch: '#F0E0E0',
    textColor: '#595655',
    groupBg: 'rgba(194, 175, 171, 0.90)',
    groupStroke: 'rgba(205, 185, 186, 0.65)',
    surfaceHighlight: '#F8EAEB',
    surfaceBase: '#F0E0E0',
    surfaceShadow: '#E4D0D2',
    surfaceBorder: '#B09B9C',
    recess: '#CCB7B9',
    undersideEdge: '#CCB7B9',
    undersideCenter: '#F0E0E0',
  },
  red: {
    swatch: '#FF4740',
    textColor: '#ffffff',
    groupBg: 'rgba(43, 22, 19, 0.95)',
    groupStroke: 'rgba(128, 47, 38, 0.62)',
    surfaceHighlight: '#FF635B',
    surfaceBase: '#FF4B44',
    surfaceShadow: '#EC3733',
    surfaceBorder: '#C22E26',
    recess: '#C2261F',
    undersideEdge: '#C2261F',
    undersideCenter: '#FF4B44',
  },
  green: {
    swatch: '#78E700',
    textColor: '#ffffff',
    groupBg: 'rgba(31, 37, 15, 0.95)',
    groupStroke: 'rgba(92, 166, 15, 0.60)',
    surfaceHighlight: '#92F710',
    surfaceBase: '#75E600',
    surfaceShadow: '#59B800',
    surfaceBorder: '#67C204',
    recess: '#458200',
    undersideEdge: '#458200',
    undersideCenter: '#75E600',
  },
  blue: {
    swatch: '#386BFF',
    textColor: '#ffffff',
    groupBg: 'rgba(20, 26, 42, 0.95)',
    groupStroke: 'rgba(62, 110, 230, 0.62)',
    surfaceHighlight: '#5492FF',
    surfaceBase: '#3B74FF',
    surfaceShadow: '#1C50F0',
    surfaceBorder: '#4C8BFF',
    recess: '#1745D1',
    undersideEdge: '#1745D1',
    undersideCenter: '#3B74FF',
  },
  purple: {
    swatch: '#5C2EB0',
    textColor: '#ffffff',
    groupBg: 'rgba(31, 3, 64, 0.94)',
    groupStroke: 'rgba(64, 31, 117, 0.72)',
    surfaceHighlight: '#874FDC',
    surfaceBase: '#733DC9',
    surfaceShadow: '#6333BA',
    surfaceBorder: '#5C30B0',
    recess: '#6938BF',
    undersideEdge: '#6938BF',
    undersideCenter: '#733DC9',
  },
  yellow: {
    swatch: '#FEB931',
    textColor: '#ffffff',
    groupBg: 'rgba(41, 31, 13, 0.95)',
    groupStroke: 'rgba(111, 82, 29, 0.62)',
    surfaceHighlight: '#FFCC4A',
    surfaceBase: '#FEB62F',
    surfaceShadow: '#EC9C1F',
    surfaceBorder: '#B4750F',
    recess: '#C78516',
    undersideEdge: '#C78516',
    undersideCenter: '#FEB62F',
  },
  orange: {
    swatch: '#FE721F',
    textColor: '#ffffff',
    groupBg: 'rgba(45, 27, 13, 0.95)',
    groupStroke: 'rgba(133, 65, 24, 0.62)',
    surfaceHighlight: '#FF8532',
    surfaceBase: '#FF7423',
    surfaceShadow: '#EC5716',
    surfaceBorder: '#CB4B0E',
    recess: '#CA450C',
    undersideEdge: '#CA450C',
    undersideCenter: '#FF7423',
  },
  pink: {
    swatch: '#E634C8',
    textColor: '#ffffff',
    groupBg: 'rgba(41, 19, 37, 0.95)',
    groupStroke: 'rgba(116, 42, 101, 0.62)',
    surfaceHighlight: '#EE4ED5',
    surfaceBase: '#E739CC',
    surfaceShadow: '#D127B5',
    surfaceBorder: '#A61F8F',
    recess: '#B3239C',
    undersideEdge: '#B3239C',
    undersideCenter: '#E739CC',
  },
};

// PBT Mechanical Token Sets (Dual layer body & dish)
export interface PBTTokenSet {
  BodyTop: string;
  BodyMid: string;
  BodyBottom: string;
  BodyStroke: string;
  UnderDish: string;
  DishTop: string;
  DishMid: string;
  DishBottom: string;
  TextColor: string;
  swatch: string;
}

export const pbtTokens: Record<string, PBTTokenSet> = {
  red: {
    BodyTop: '#FF5A53',
    BodyMid: '#EC3D39',
    BodyBottom: '#D9322F',
    BodyStroke: '#C22E26',
    UnderDish: '#FF615A',
    DishTop: '#FF544D',
    DishMid: '#FF564F',
    DishBottom: '#ED413D',
    TextColor: '#ffffff',
    swatch: '#FF4740',
  },
  yellow: {
    BodyTop: '#FEBC3F',
    BodyMid: '#EC9F25',
    BodyBottom: '#D98F1C',
    BodyStroke: '#B4750F',
    UnderDish: '#FEBF47',
    DishTop: '#FEBA39',
    DishMid: '#FEBA3B',
    DishBottom: '#EDA12A',
    TextColor: '#ffffff',
    swatch: '#FEB931',
  },
  black: {
    BodyTop: '#1D1D1D',
    BodyMid: '#141414',
    BodyBottom: '#0C0C0C',
    BodyStroke: '#474747',
    UnderDish: '#262626',
    DishTop: '#151515',
    DishMid: '#181818',
    DishBottom: '#191919',
    TextColor: '#ffffff',
    swatch: '#141414',
  },
  white: {
    BodyTop: '#F1F1F1',
    BodyMid: '#E1E1E1',
    BodyBottom: '#CECECE',
    BodyStroke: '#C7C7C7',
    UnderDish: '#F2F2F2',
    DishTop: '#F0F0F0',
    DishMid: '#F1F1F1',
    DishBottom: '#E2E2E2',
    TextColor: '#63625D',
    swatch: '#F5F5F5',
  },
  blue: {
    BodyTop: '#4A7FFF',
    BodyMid: '#2356F0',
    BodyBottom: '#1A4ADD',
    BodyStroke: '#4C8BFF',
    UnderDish: '#5285FF',
    DishTop: '#447BFF',
    DishMid: '#467CFF',
    DishBottom: '#2759F0',
    TextColor: '#ffffff',
    swatch: '#386BFF',
  },
  green: {
    BodyTop: '#80E814',
    BodyMid: '#5EBA08',
    BodyBottom: '#52A900',
    BodyStroke: '#67C204',
    UnderDish: '#86E91F',
    DishTop: '#7CE70D',
    DishMid: '#7EE70F',
    DishBottom: '#62BB0D',
    TextColor: '#ffffff',
    swatch: '#75E600',
  },
  purple: {
    BodyTop: '#7E4DCE',
    BodyMid: '#6839BC',
    BodyBottom: '#5B2FAB',
    BodyStroke: '#5C30B0',
    UnderDish: '#8454D0',
    DishTop: '#7A47CC',
    DishMid: '#7B49CD',
    DishBottom: '#6B3DBE',
    TextColor: '#ffffff',
    swatch: '#5C2EB0',
  },
  orange: {
    BodyTop: '#FF7F34',
    BodyMid: '#EC5C1D',
    BodyBottom: '#D95014',
    BodyStroke: '#CB4B0E',
    UnderDish: '#FF853D',
    DishTop: '#FF7B2D',
    DishMid: '#FF7C30',
    DishBottom: '#ED5F21',
    TextColor: '#ffffff',
    swatch: '#FE721F',
  },
};

export function makePbtTokens(hex: string): PBTTokenSet {
  const [r, g, b] = parseHex(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const textColor = luminance > 0.6 ? '#18181b' : '#ffffff';
  return {
    BodyTop: lightened(hex, 0.15),
    BodyMid: hex,
    BodyBottom: darkened(hex, 0.22),
    BodyStroke: darkened(hex, 0.35),
    UnderDish: lightened(hex, 0.2),
    DishTop: lightened(hex, 0.12),
    DishMid: hex,
    DishBottom: darkened(hex, 0.18),
    TextColor: textColor,
    swatch: hex,
  };
}

export const pbtThemes: Record<KeycapTheme, {
  name: string;
  mod: PBTTokenSet;
  alpha: PBTTokenSet;
}> = {
  classic: {
    name: 'Keyty Classic (Kırmızı & Sarı)',
    mod: pbtTokens.red,
    alpha: pbtTokens.yellow,
  },
  black: {
    name: 'Stealth Dark',
    mod: pbtTokens.black,
    alpha: makePbtTokens('#3f3f46'),
  },
  white: {
    name: 'Pure White',
    mod: pbtTokens.white,
    alpha: pbtTokens.white,
  },
  blue: {
    name: 'Ocean Blue',
    mod: makePbtTokens('#2563eb'),
    alpha: makePbtTokens('#93c5fd'),
  },
  green: {
    name: 'Emerald Green',
    mod: makePbtTokens('#059669'),
    alpha: makePbtTokens('#a7f3d0'),
  },
  purple: {
    name: 'Deep Purple',
    mod: makePbtTokens('#7c3aed'),
    alpha: makePbtTokens('#ddd6fe'),
  },
  rose: {
    name: 'Rose Quartz',
    mod: makePbtTokens('#e11d48'),
    alpha: makePbtTokens('#fecdd3'),
  },
  orange: {
    name: 'Amber Orange',
    mod: makePbtTokens('#d97706'),
    alpha: makePbtTokens('#fde68a'),
  },
  citrus: {
    name: 'Citrus Lime',
    mod: makePbtTokens('#65a30d'),
    alpha: makePbtTokens('#fef08a'),
  },
  indigo: {
    name: 'Indigo Slate',
    mod: makePbtTokens('#4338ca'),
    alpha: makePbtTokens('#c7d2fe'),
  },
  yellow: {
    name: 'Amber Yellow',
    mod: pbtTokens.yellow,
    alpha: makePbtTokens('#fef08a'),
  },
  red: {
    name: 'Vibrant Red',
    mod: pbtTokens.red,
    alpha: makePbtTokens('#fca5a5'),
  },
  pink: {
    name: 'Hot Pink',
    mod: makePbtTokens('#db2777'),
    alpha: makePbtTokens('#fbcfe8'),
  },
  custom: {
    name: 'Özel Çift Renk',
    mod: pbtTokens.red,
    alpha: pbtTokens.yellow,
  },
};

export function setCustomDualColorTheme(modHex: string, alphaHex: string) {
  const modPbt = makePbtTokens(modHex);
  const alphaPbt = makePbtTokens(alphaHex);

  (pbtThemes as any)['custom'] = {
    name: 'Özel Çift Renk',
    mod: modPbt,
    alpha: alphaPbt,
  };

  const [r, g, b] = parseHex(alphaHex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const textColor = luminance > 0.6 ? '#18181b' : '#ffffff';

  (themeTokenRegistry as any)['custom'] = {
    swatch: alphaHex,
    textColor: textColor,
    groupBg: alphaHex,
    groupStroke: darkened(alphaHex, 0.3),
    surfaceHighlight: lightened(alphaHex, 0.2),
    surfaceBase: alphaHex,
    surfaceShadow: darkened(alphaHex, 0.25),
    surfaceBorder: darkened(alphaHex, 0.35),
    recess: darkened(alphaHex, 0.3),
    undersideEdge: darkened(alphaHex, 0.3),
    undersideCenter: alphaHex,
  };
}

export function setCustomColorTheme(hex: string) {
  setCustomDualColorTheme(hex, hex);
}

export function getThemeTokens(theme: KeycapTheme): KeycapThemeTokens {
  return themeTokenRegistry[theme] || themeTokenRegistry.black;
}

// Exact size normalization factor from KeycapStyle+SizeNormalization.swift
export function getSizeNormalization(style: KeycapStyle): number {
  switch (style) {
    case 'apple':
      return 1.0;
    case 'pbt':
      return 94 / 120; // 0.78333
    case 'minimal':
      return 94 / 64; // 1.46875
    case 'retro':
      return 94 / 124; // 0.75806
    case 'm0116':
      return 94 / 98; // 0.95918
    default:
      return 1.0;
  }
}

export function formatKeyLabel(label: string, layout: string = 'auto'): string {
  if (!label) return '';
  const locale = layout === 'auto' ? undefined : (layout === 'tr' ? 'tr-TR' : layout);
  try {
    return label.toLocaleUpperCase(locale);
  } catch {
    return label.toUpperCase();
  }
}

// Container pod style matching KeyboardVisualizerGroupView.swift per style & theme with customizable background
export function getPodContainerStyle(
  style: KeycapStyle,
  theme: KeycapTheme,
  settings?: Partial<AppSettings>
): {
  background: string;
  border: string;
  borderRadius: string;
  padding: string;
  gap: string;
  boxShadow: string;
  backdropFilter?: string;
} {
  const tokens = getThemeTokens(theme);
  const bgMode = settings?.podBgMode || 'auto';
  const customColor = settings?.podBgCustomColor || '#171717';
  const opacity = (settings?.podBgOpacity ?? 95) / 100;

  let bg = tokens.groupBg;
  let border = `1.5px solid ${tokens.groupStroke}`;
  let boxShadow = '0 16px 36px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)';
  let backdropFilter = 'blur(20px) saturate(180%)';

  if (bgMode === 'dark') {
    bg = `rgba(18, 18, 20, ${opacity})`;
    border = '1.5px solid rgba(255, 255, 255, 0.12)';
  } else if (bgMode === 'glass') {
    bg = `rgba(255, 255, 255, ${Math.min(0.28, opacity * 0.22)})`;
    border = '1.5px solid rgba(255, 255, 255, 0.25)';
    backdropFilter = 'blur(28px) saturate(200%)';
  } else if (bgMode === 'translucent') {
    bg = `rgba(0, 0, 0, ${opacity * 0.45})`;
    border = '1.5px solid rgba(255, 255, 255, 0.08)';
    backdropFilter = 'blur(16px)';
  } else if (bgMode === 'none') {
    bg = 'transparent';
    border = 'none';
    boxShadow = 'none';
    backdropFilter = 'none';
  } else if (bgMode === 'custom') {
    const [r, g, b] = parseHex(customColor);
    bg = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    border = `1.5px solid rgba(${Math.min(255, r + 45)}, ${Math.min(255, g + 45)}, ${Math.min(255, b + 45)}, 0.45)`;
  }

  let borderRadius = '18px';
  let padding = '10px 14px';
  let gap = '6px';

  if (style === 'minimal') {
    borderRadius = '9999px';
    padding = '8px 14px';
    gap = '-8px';
    if (bgMode === 'auto') {
      boxShadow = '0 12px 28px rgba(0,0,0,0.5)';
    }
  } else if (style === 'retro') {
    borderRadius = '24px';
    padding = '12px 14px';
    gap = '10px';
    if (bgMode === 'auto') {
      boxShadow = '0 20px 40px rgba(0,0,0,0.65), 0 6px 16px rgba(0,0,0,0.4)';
    }
  } else if (style === 'm0116') {
    borderRadius = '12px';
    padding = '8px 12px';
    gap = '6px';
  }

  return {
    background: bg,
    border,
    borderRadius,
    padding,
    gap,
    boxShadow,
    backdropFilter,
  };
}

let gradCounter = 0;

export function renderKeycap(
  key: string,
  label: string,
  _symbol: string | null,
  isModifier: boolean,
  isPressed: boolean,
  isCapsOn: boolean,
  style: KeycapStyle,
  theme: KeycapTheme,
  keyboardLayout: string = 'auto'
): string {
  gradCounter++;
  const uid = `k_${gradCounter}_${Math.floor(Math.random() * 100000)}`;
  const normKey = key.toLowerCase();
  const isCapsKey = normKey === 'caps' || normKey === 'capslock';
  const isSpaceKey = normKey === 'space';
  const isShiftKey = normKey === 'shift';
  const isTabKey = normKey === 'tab';
  const isEscKey = normKey === 'escape' || normKey === 'esc';
  const isReturnKey = normKey === 'return' || normKey === 'enter';
  const isDeleteKey = normKey === 'delete' || normKey === 'backspace';

  const isArrowUp = normKey === 'up' || normKey === 'arrowup' || normKey === 'uparrow';
  const isArrowDown = normKey === 'down' || normKey === 'arrowdown' || normKey === 'downarrow';
  const isArrowLeft = normKey === 'left' || normKey === 'arrowleft' || normKey === 'leftarrow';
  const isArrowRight = normKey === 'right' || normKey === 'arrowright' || normKey === 'rightarrow';
  const isArrowKey = isArrowUp || isArrowDown || isArrowLeft || isArrowRight;
  const isPageUp = normKey === 'pageup' || normKey === 'pgup';
  const isPageDown = normKey === 'pagedown' || normKey === 'pgdn';
  const isHome = normKey === 'home';
  const isEnd = normKey === 'end';
  const isMouseLeft = normKey === 'mouse_left' || normKey === 'left_click';
  const isMouseRight = normKey === 'mouse_right' || normKey === 'right_click';
  const isMouseMiddle = normKey === 'mouse_middle' || normKey === 'middle_click';
  const isMouseKey = isMouseLeft || isMouseRight || isMouseMiddle;
  const isPrtSc = normKey === 'prtsc' || normKey === 'printscreen' || normKey === 'prt sc';

  let displayLabel = label.toLowerCase();
  if (isCapsKey) displayLabel = 'caps lock';
  if (normKey === 'command' || normKey === 'cmd' || normKey === 'win') displayLabel = 'win';
  if (normKey === 'option' || normKey === 'alt') displayLabel = 'alt';
  if (normKey === 'control' || normKey === 'ctrl') displayLabel = 'ctrl';
  if (normKey === 'altgr') displayLabel = 'altgr';
  if (isEscKey) displayLabel = 'esc';
  if (isTabKey) displayLabel = 'tab';
  if (isReturnKey) displayLabel = 'enter';
  if (isDeleteKey) displayLabel = 'backspace';
  if (isPageUp) displayLabel = 'page up';
  if (isPageDown) displayLabel = 'page down';
  if (isHome) displayLabel = 'home';
  if (isEnd) displayLabel = 'end';
  if (isMouseLeft) displayLabel = 'Left Click';
  if (isMouseRight) displayLabel = 'Right Click';
  if (isMouseMiddle) displayLabel = 'Scroll';
  if (isPrtSc) displayLabel = 'prt sc';
  if (normKey === 'menu') displayLabel = 'menu';
  if (normKey === 'numlock') displayLabel = 'num lock';
  if (normKey === 'scrolllock') displayLabel = 'scroll';
  if (normKey === 'pause') displayLabel = 'pause';

  const isSpecial = [
    'space', 'caps', 'capslock', 'command', 'cmd', 'win', 'shift', 'option', 'alt',
    'control', 'ctrl', 'return', 'enter', 'delete', 'backspace', 'tab', 'escape', 'esc',
    'up', 'arrowup', 'uparrow', 'down', 'arrowdown', 'downarrow',
    'left', 'arrowleft', 'leftarrow', 'right', 'arrowright', 'rightarrow',
    'pageup', 'pgup', 'pagedown', 'pgdn', 'home', 'end',
    'mouse_left', 'mouse_right', 'mouse_middle', 'left_click', 'right_click', 'middle_click',
    'prtsc', 'printscreen', 'menu', 'numlock', 'scrolllock', 'pause',
    'mute', 'volumedown', 'volumeup', 'next', 'prev', 'stop', 'playpause'
  ].includes(normKey);

  const tokens = getThemeTokens(theme);

  // =========================================================================
  // 1. PBT MECHANICAL STYLE (100% Exact AppKit Bezier Paths & Dual Dish)
  // =========================================================================
  if (style === 'pbt') {
    const themeData = pbtThemes[theme] || pbtThemes.classic;
    const pbtTok = (isModifier || isSpecial) && !isArrowKey ? themeData.mod : themeData.alpha;

    let widthPx = 100;
    if (isSpaceKey) widthPx = 282;
    else if (isCapsKey) widthPx = 170;
    else if (isReturnKey) widthPx = 154;
    else if (isTabKey || isDeleteKey) widthPx = 138;
    else if (isEscKey) widthPx = 118;
    else if (isShiftKey) widthPx = 126;
    else if (normKey === 'command' || normKey === 'cmd' || normKey === 'win') widthPx = 114;
    else if (isPrtSc) widthPx = 110;
    else if (normKey === 'option' || normKey === 'alt') widthPx = 98;
    else if (isArrowKey || isMouseKey) widthPx = 100;
    else if (isModifier) widthPx = 100;

    const heightPx = 100;
    // Mechanical keycap perspective matching Keyty PBTKeycapMetrics (dishLift = 8, rim = 13):
    // Top dish surface is lifted upwards towards the top, revealing the angled front skirt.
    const dishY = isPressed ? 8.5 : 6.0;
    const underDishY = isPressed ? 11.0 : 8.5;
    const dishW = widthPx - 28;
    const dishH = 74;
    const dishCenterX = widthPx / 2;
    const dishCenterY = dishY + dishH / 2;

    let legendContent = '';
    if (isShiftKey) {
      const contentRight = widthPx - 24;
      legendContent = `
        <path d="M${contentRight - 10} ${dishCenterY - 14} L${contentRight - 20} ${dishCenterY - 4.5} H${contentRight - 14} V${dishCenterY + 3} H${contentRight - 6} V${dishCenterY - 4.5} H${contentRight} Z" fill="none" stroke="${pbtTok.TextColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="${contentRight}" y="${dishCenterY + 18}" text-anchor="end" fill="${pbtTok.TextColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" font-size="13" font-weight="500" letter-spacing="-0.2px">${displayLabel}</text>
      `;
    } else if (normKey === 'command' || normKey === 'cmd' || normKey === 'win') {
      legendContent = `
        <g transform="translate(${dishCenterX - 10}, ${dishCenterY - 18})">
          <path d="M14 2a2.5 2.5 0 0 0-2.5 2.5v11A2.5 2.5 0 0 0 14 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 14 13h-8a2.5 2.5 0 0 0-2.5 2.5A2.5 2.5 0 0 0 6 18a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 6 2a2.5 2.5 0 0 0-2.5 2.5A2.5 2.5 0 0 0 6 7h8a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 14 2z" fill="none" stroke="${pbtTok.TextColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <text x="${dishCenterX}" y="${dishCenterY + 16}" text-anchor="middle" fill="${pbtTok.TextColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" font-size="13" font-weight="500" letter-spacing="-0.2px">${displayLabel}</text>
      `;
    } else if (normKey === 'option' || normKey === 'alt') {
      legendContent = `
        <g transform="translate(${dishCenterX - 10}, ${dishCenterY - 18})">
          <path d="M3 4h3.5l6 12h4.5M12.5 4H17" fill="none" stroke="${pbtTok.TextColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <text x="${dishCenterX}" y="${dishCenterY + 16}" text-anchor="middle" fill="${pbtTok.TextColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" font-size="13" font-weight="500" letter-spacing="-0.2px">${displayLabel}</text>
      `;
    } else if (normKey === 'control' || normKey === 'ctrl') {
      legendContent = `
        <g transform="translate(${dishCenterX - 9}, ${dishCenterY - 17})">
          <path d="M4 12l5-5 5 5" fill="none" stroke="${pbtTok.TextColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <text x="${dishCenterX}" y="${dishCenterY + 16}" text-anchor="middle" fill="${pbtTok.TextColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" font-size="13" font-weight="500" letter-spacing="-0.2px">${displayLabel}</text>
      `;
    } else if (isCapsKey) {
      legendContent = `
        <circle cx="${14 + 10 + 4}" cy="${dishCenterY - 14}" r="4" fill="${isCapsOn ? '#34d399' : 'rgba(0,0,0,0.35)'}" stroke="rgba(0,0,0,0.2)" stroke-width="1" />
        <g transform="translate(${dishCenterX - 9}, ${dishCenterY - 18})">
          <path d="M9 2L3 8h3v4h6V8h3zM3 15h12" fill="none" stroke="${pbtTok.TextColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <text x="${dishCenterX}" y="${dishCenterY + 16}" text-anchor="middle" fill="${pbtTok.TextColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" font-size="13" font-weight="500" letter-spacing="-0.2px">${displayLabel}</text>
      `;
    } else if (isEscKey) {
      legendContent = `
        <g transform="translate(${dishCenterX - 9}, ${dishCenterY - 18})">
          <path d="M5.5 2.5 A 5.5 5.5 0 1 1 2.5 5.5" fill="none" stroke="${pbtTok.TextColor}" stroke-width="2" stroke-linecap="round"/>
          <path d="M2.5 2.5 L 6.5 6.5" fill="none" stroke="${pbtTok.TextColor}" stroke-width="2" stroke-linecap="round"/>
          <path d="M6 2 H 2 V 6" fill="none" stroke="${pbtTok.TextColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <text x="${dishCenterX}" y="${dishCenterY + 16}" text-anchor="middle" fill="${pbtTok.TextColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" font-size="13" font-weight="500" letter-spacing="-0.2px">esc</text>
      `;
    } else if (isTabKey) {
      legendContent = `
        <g transform="translate(${dishCenterX - 9}, ${dishCenterY - 17})">
          <path d="M2 9 h9 M7.5 5.5 L11 9 l-3.5 3.5 M15 5 v8" fill="none" stroke="${pbtTok.TextColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <text x="${dishCenterX}" y="${dishCenterY + 16}" text-anchor="middle" fill="${pbtTok.TextColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" font-size="13" font-weight="500" letter-spacing="-0.2px">tab</text>
      `;
    } else if (isArrowUp) {
      legendContent = `
        <g transform="translate(${dishCenterX - 11}, ${dishCenterY - 11})">
          <path d="M11 20 V3 M4 10 L11 3 L18 10" fill="none" stroke="${pbtTok.TextColor}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isArrowDown) {
      legendContent = `
        <g transform="translate(${dishCenterX - 11}, ${dishCenterY - 11})">
          <path d="M11 3 V20 M4 13 L11 20 L18 13" fill="none" stroke="${pbtTok.TextColor}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isArrowLeft) {
      legendContent = `
        <g transform="translate(${dishCenterX - 11}, ${dishCenterY - 11})">
          <path d="M20 11 H3 M10 4 L3 11 L10 18" fill="none" stroke="${pbtTok.TextColor}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isArrowRight) {
      legendContent = `
        <g transform="translate(${dishCenterX - 11}, ${dishCenterY - 11})">
          <path d="M3 11 H20 M13 4 L20 11 L13 18" fill="none" stroke="${pbtTok.TextColor}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isPageUp) {
      legendContent = `
        <g transform="translate(${dishCenterX - 10}, ${dishCenterY - 18})">
          <path d="M10 17 V5 M4 11 L10 5 L16 11 M3 3 H17" fill="none" stroke="${pbtTok.TextColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <text x="${dishCenterX}" y="${dishCenterY + 16}" text-anchor="middle" fill="${pbtTok.TextColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" font-size="12" font-weight="500" letter-spacing="-0.2px">page up</text>
      `;
    } else if (isPageDown) {
      legendContent = `
        <g transform="translate(${dishCenterX - 10}, ${dishCenterY - 18})">
          <path d="M10 3 V15 M4 9 L10 15 L16 9 M3 17 H17" fill="none" stroke="${pbtTok.TextColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <text x="${dishCenterX}" y="${dishCenterY + 16}" text-anchor="middle" fill="${pbtTok.TextColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" font-size="12" font-weight="500" letter-spacing="-0.2px">page down</text>
      `;
    } else if (isHome) {
      legendContent = `
        <g transform="translate(${dishCenterX - 10}, ${dishCenterY - 18})">
          <path d="M15 15 L5 5 M5 11 V5 H11 M3 3 H8 M3 3 V8" fill="none" stroke="${pbtTok.TextColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <text x="${dishCenterX}" y="${dishCenterY + 16}" text-anchor="middle" fill="${pbtTok.TextColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" font-size="12" font-weight="500" letter-spacing="-0.2px">home</text>
      `;
    } else if (isEnd) {
      legendContent = `
        <g transform="translate(${dishCenterX - 10}, ${dishCenterY - 18})">
          <path d="M5 5 L15 15 M15 9 V15 H9 M17 17 H12 M17 17 V12" fill="none" stroke="${pbtTok.TextColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <text x="${dishCenterX}" y="${dishCenterY + 16}" text-anchor="middle" fill="${pbtTok.TextColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" font-size="12" font-weight="500" letter-spacing="-0.2px">end</text>
      `;
    } else if (isSpaceKey) {
      legendContent = `
        <path d="M${dishCenterX - 24} ${dishCenterY} h48 v5" fill="none" stroke="${pbtTok.TextColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    } else if (isReturnKey) {
      legendContent = `
        <g transform="translate(${dishCenterX - 10}, ${dishCenterY - 18})">
          <polyline points="7 8 3 12 7 16" fill="none" stroke="${pbtTok.TextColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M17 3v6a3 3 0 0 1-3 3H3" fill="none" stroke="${pbtTok.TextColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <text x="${dishCenterX}" y="${dishCenterY + 16}" text-anchor="middle" fill="${pbtTok.TextColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" font-size="13" font-weight="500" letter-spacing="-0.2px">${displayLabel}</text>
      `;
    } else if (isDeleteKey) {
      legendContent = `
        <g transform="translate(${dishCenterX - 10}, ${dishCenterY - 18})">
          <path d="M17 3H6l-5 7 5 7h11a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" fill="none" stroke="${pbtTok.TextColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="13" y1="7" x2="9" y2="13" stroke="${pbtTok.TextColor}" stroke-width="1.8" stroke-linecap="round"/>
          <line x1="9" y1="7" x2="13" y2="13" stroke="${pbtTok.TextColor}" stroke-width="1.8" stroke-linecap="round"/>
        </g>
        <text x="${dishCenterX}" y="${dishCenterY + 16}" text-anchor="middle" fill="${pbtTok.TextColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" font-size="13" font-weight="500" letter-spacing="-0.2px">${displayLabel}</text>
      `;
    } else if (isMouseKey) {
      legendContent = `
        <rect x="${dishCenterX - 11}" y="${dishCenterY - 21}" width="22" height="32" rx="11" ry="11" fill="none" stroke="${pbtTok.TextColor}" stroke-width="2" />
        <path d="M${dishCenterX - 11} ${dishCenterY - 9} H${dishCenterX + 11}" stroke="${pbtTok.TextColor}" stroke-width="1.8" />
        <path d="M${dishCenterX} ${dishCenterY - 21} V${dishCenterY - 9}" stroke="${pbtTok.TextColor}" stroke-width="1.8" />
        ${isMouseLeft ? `
          <path d="M${dishCenterX - 11} ${dishCenterY - 9} H${dishCenterX} V${dishCenterY - 21} A 11 11 0 0 0 ${dishCenterX - 11} ${dishCenterY - 9} Z" fill="#3b82f6" opacity="0.9" />
        ` : ''}
        ${isMouseRight ? `
          <path d="M${dishCenterX} ${dishCenterY - 21} V${dishCenterY - 9} H${dishCenterX + 11} A 11 11 0 0 0 ${dishCenterX} ${dishCenterY - 21} Z" fill="#3b82f6" opacity="0.9" />
        ` : ''}
        ${isMouseMiddle ? `
          <rect x="${dishCenterX - 2}" y="${dishCenterY - 18}" width="4" height="8" rx="2" fill="#3b82f6" stroke="${pbtTok.TextColor}" stroke-width="1" />
        ` : `
          <rect x="${dishCenterX - 1.5}" y="${dishCenterY - 17}" width="3" height="6" rx="1.5" fill="${pbtTok.TextColor}" opacity="0.6" />
        `}
        <text x="${dishCenterX}" y="${dishCenterY + 22}" text-anchor="middle" fill="${pbtTok.TextColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" font-size="11" font-weight="600" letter-spacing="-0.2px">${displayLabel}</text>
      `;
    } else if (isPrtSc) {
      legendContent = `
        <g transform="translate(${dishCenterX - 10}, ${dishCenterY - 18})">
          <path d="M4 7h3l1.5-2.5h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" fill="none" stroke="${pbtTok.TextColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="13" r="3.5" fill="none" stroke="${pbtTok.TextColor}" stroke-width="1.8"/>
        </g>
        <text x="${dishCenterX}" y="${dishCenterY + 16}" text-anchor="middle" fill="${pbtTok.TextColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" font-size="12" font-weight="500" letter-spacing="-0.2px">prt sc</text>
      `;
    } else {
      legendContent = `
        <text x="${dishCenterX}" y="${dishCenterY}" text-anchor="middle" dominant-baseline="central" fill="${pbtTok.TextColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" font-size="26" font-weight="500">${formatKeyLabel(label, keyboardLayout)}</text>
      `;
    }

    return `
      <svg width="${widthPx}" height="${heightPx}" viewBox="0 0 ${widthPx} ${heightPx}" class="select-none flex-shrink-0 transition-transform duration-75" style="overflow: visible;">
        <defs>
          <filter id="pbtDrop_${uid}" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.72"/>
          </filter>
          <linearGradient id="bodyGrad_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${pbtTok.BodyTop}"/>
            <stop offset="48%" stop-color="${pbtTok.BodyMid}"/>
            <stop offset="100%" stop-color="${pbtTok.BodyBottom}"/>
          </linearGradient>
          <linearGradient id="dishGrad_${uid}" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="${pbtTok.DishTop}"/>
            <stop offset="32%" stop-color="${pbtTok.DishMid}"/>
            <stop offset="100%" stop-color="${pbtTok.DishBottom}"/>
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="${widthPx - 4}" height="96" rx="18" ry="18" fill="url(#bodyGrad_${uid})" filter="url(#pbtDrop_${uid})" stroke="${pbtTok.BodyStroke}" stroke-width="1.5" stroke-opacity="0.75" />
        <rect x="14" y="${underDishY}" width="${dishW}" height="${dishH}" rx="10" ry="10" fill="${pbtTok.UnderDish}" />
        <rect x="14" y="${dishY}" width="${dishW}" height="${dishH}" rx="10" ry="10" fill="url(#dishGrad_${uid})" />
        ${legendContent}
      </svg>
    `;
  }

  // =========================================================================
  // 2. APPLE MAGIC KEYBOARD STYLE (100% Exact 1:1 Image 1 & Keyty AppKit)
  // =========================================================================
  if (style === 'apple') {
    let widthPx = 74;
    if (isSpaceKey) widthPx = 250;
    else if (isCapsKey) widthPx = 140;
    else if (isReturnKey) widthPx = 120;
    else if (isTabKey || isEscKey || isDeleteKey) widthPx = 110;
    else if (isShiftKey) widthPx = 92;
    else if (normKey === 'command' || normKey === 'cmd' || normKey === 'win') widthPx = 86;
    else if (isPrtSc) widthPx = 86;
    else if (isMouseKey) widthPx = 78;
    else if (normKey === 'option' || normKey === 'alt') widthPx = 74;
    else if (isModifier) widthPx = 74;

    const heightPx = 74;
    const isDark = theme !== 'white';
    
    // 3D Underside shelf parameters
    const underY = 8;
    const underH = 63;
    const capW = widthPx - 4;
    
    // Top keycap parameters (moves down by 5px when pressed matching Keyty AppleKeycapRenderer.swift)
    const capY = isPressed ? 7 : 2;
    const capH = 63;
    const capCenterX = 2 + capW / 2;

    const themeData = pbtThemes[theme] || pbtThemes.classic;
    const pbtTok = (isModifier || isSpecial) && !isArrowKey ? themeData.mod : themeData.alpha;

    // Palette tokens derived from theme
    const underEdge = pbtTok.BodyBottom;
    const underCenter = pbtTok.BodyMid;
    const underStroke = pbtTok.BodyStroke;

    const capTop = pbtTok.DishTop;
    const capBottom = pbtTok.DishBottom;
    const capStroke = pbtTok.BodyStroke;
    const textColor = pbtTok.TextColor;

    let legendContent = '';

    if (normKey === 'command' || normKey === 'cmd' || normKey === 'win') {
      // Win / Command: 'win' at bottom-left, ⌘ at top-right
      const textY = isPressed ? 58 : 53;
      const symY = isPressed ? 14 : 9;
      legendContent = `
        <text x="12" y="${textY}" text-anchor="start" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="11.5" font-weight="500" letter-spacing="-0.2px">win</text>
        <g transform="translate(${widthPx - 28}, ${symY})">
          <path d="M12 2a2 2 0 0 0-2 2v9A2 2 0 0 0 12 15a2 2 0 0 0 2-2A2 2 0 0 0 12 11h-7a2 2 0 0 0-2 2A2 2 0 0 0 5 15a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2h7a2 2 0 0 0 2-2A2 2 0 0 0 12 2z" fill="none" stroke="${textColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isShiftKey) {
      // Shift: 'shift' at bottom-right, ⇧ at top-right (directly above shift text)
      const textY = isPressed ? 58 : 53;
      const symY = isPressed ? 13 : 8;
      legendContent = `
        <text x="${widthPx - 12}" y="${textY}" text-anchor="end" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="11.5" font-weight="500" letter-spacing="-0.2px">shift</text>
        <g transform="translate(${widthPx - 26}, ${symY})">
          <path d="M7 2 L1 8.5 H4.5 V15 H9.5 V8.5 H13 Z" fill="none" stroke="${textColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (normKey === 'altgr') {
      // AltGr: 'altgr' at bottom-left, ⎇ / ⌥ at top-right
      const textY = isPressed ? 58 : 53;
      const symY = isPressed ? 14 : 9;
      legendContent = `
        <text x="12" y="${textY}" text-anchor="start" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="11.5" font-weight="500" letter-spacing="-0.2px">altgr</text>
        <g transform="translate(${widthPx - 26}, ${symY})">
          <path d="M2 3h3.5l5 9h3.5M10.5 3H14" fill="none" stroke="${textColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (normKey === 'option' || normKey === 'alt') {
      // Alt: 'alt' at bottom-left, ⌥ at top-right
      const textY = isPressed ? 58 : 53;
      const symY = isPressed ? 14 : 9;
      legendContent = `
        <text x="12" y="${textY}" text-anchor="start" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="11.5" font-weight="500" letter-spacing="-0.2px">alt</text>
        <g transform="translate(${widthPx - 26}, ${symY})">
          <path d="M2 3h3.5l5 9h3.5M10.5 3H14" fill="none" stroke="${textColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (normKey === 'control' || normKey === 'ctrl') {
      // Ctrl: 'ctrl' at bottom-left, ⌃ at top-right
      const textY = isPressed ? 58 : 53;
      const symY = isPressed ? 14 : 9;
      legendContent = `
        <text x="12" y="${textY}" text-anchor="start" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="11.5" font-weight="500" letter-spacing="-0.2px">ctrl</text>
        <g transform="translate(${widthPx - 24}, ${symY})">
          <path d="M2 8l4-4 4 4" fill="none" stroke="${textColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isCapsKey) {
      // Caps Lock: real Apple green LED indicator on top-left, 'caps lock' at bottom-left
      const textY = isPressed ? 58 : 53;
      const ledY = isPressed ? 20 : 15;
      legendContent = `
        <!-- Caps LED -->
        <circle cx="16" cy="${ledY}" r="3" fill="${isCapsOn ? '#34d399' : (isDark ? '#232326' : '#C8C8CC')}" stroke="${isCapsOn ? '#10b981' : (isDark ? '#141416' : '#B0B0B4')}" stroke-width="0.8" />
        ${isCapsOn ? `<circle cx="16" cy="${ledY}" r="5" fill="#34d399" opacity="0.35" filter="url(#appleGlow_${uid})" />` : ''}
        <text x="12" y="${textY}" text-anchor="start" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="11.5" font-weight="500" letter-spacing="-0.2px">caps lock</text>
        <g transform="translate(${widthPx - 26}, ${isPressed ? 15 : 10})">
          <path d="M7 2L2 7h3v3h4V7h3zM2 13h10" fill="none" stroke="${textColor}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isSpaceKey) {
      const symY = isPressed ? 37 : 32;
      legendContent = `
        <path d="M${capCenterX - 22} ${symY} h44 v5" fill="none" stroke="${textColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    } else if (isReturnKey) {
      const textY = isPressed ? 58 : 53;
      const symY = isPressed ? 14 : 9;
      legendContent = `
        <text x="12" y="${textY}" text-anchor="start" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="11.5" font-weight="500" letter-spacing="-0.2px">enter</text>
        <g transform="translate(${widthPx - 28}, ${symY})">
          <polyline points="5 5 1 9 5 13" fill="none" stroke="${textColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 2v7H1" fill="none" stroke="${textColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isDeleteKey) {
      const textY = isPressed ? 58 : 53;
      const symY = isPressed ? 14 : 9;
      legendContent = `
        <text x="12" y="${textY}" text-anchor="start" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="11.5" font-weight="500" letter-spacing="-0.2px">backspace</text>
        <g transform="translate(${widthPx - 28}, ${symY})">
          <path d="M13 2H5l-4 6 4 6h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" fill="none" stroke="${textColor}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="10" y1="5" x2="6" y2="9" stroke="${textColor}" stroke-width="1.6" stroke-linecap="round"/>
          <line x1="6" y1="5" x2="10" y2="9" stroke="${textColor}" stroke-width="1.6" stroke-linecap="round"/>
        </g>
      `;
    } else if (isEscKey) {
      const textY = isPressed ? 58 : 53;
      const symY = isPressed ? 14 : 9;
      legendContent = `
        <text x="12" y="${textY}" text-anchor="start" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="11.5" font-weight="500" letter-spacing="-0.2px">esc</text>
        <g transform="translate(${widthPx - 26}, ${symY})">
          <path d="M5.5 2.5 A 5.5 5.5 0 1 1 2.5 5.5" fill="none" stroke="${textColor}" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M2.5 2.5 L 6.5 6.5" fill="none" stroke="${textColor}" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M6 2 H 2 V 6" fill="none" stroke="${textColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isTabKey) {
      const textY = isPressed ? 58 : 53;
      const symY = isPressed ? 14 : 9;
      legendContent = `
        <text x="12" y="${textY}" text-anchor="start" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="11.5" font-weight="500" letter-spacing="-0.2px">tab</text>
        <g transform="translate(${widthPx - 26}, ${symY})">
          <path d="M2 8 h9 M7.5 4.5 L11 8 l-3.5 3.5 M14 4 v8" fill="none" stroke="${textColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isArrowUp) {
      const charY = isPressed ? 37 : 32;
      legendContent = `
        <g transform="translate(${capCenterX - 10}, ${charY - 10})">
          <path d="M10 18 V4 M4 9.5 L10 3.5 L16 9.5" fill="none" stroke="${textColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isArrowDown) {
      const charY = isPressed ? 37 : 32;
      legendContent = `
        <g transform="translate(${capCenterX - 10}, ${charY - 10})">
          <path d="M10 2 V16 M4 10.5 L10 16.5 L16 10.5" fill="none" stroke="${textColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isArrowLeft) {
      const charY = isPressed ? 37 : 32;
      legendContent = `
        <g transform="translate(${capCenterX - 10}, ${charY - 10})">
          <path d="M18 10 H4 M9.5 4 L3.5 10 L9.5 16" fill="none" stroke="${textColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isArrowRight) {
      const charY = isPressed ? 37 : 32;
      legendContent = `
        <g transform="translate(${capCenterX - 10}, ${charY - 10})">
          <path d="M2 10 H16 M10.5 4 L16.5 10 L10.5 16" fill="none" stroke="${textColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isPageUp) {
      const textY = isPressed ? 58 : 53;
      const symY = isPressed ? 14 : 9;
      legendContent = `
        <text x="12" y="${textY}" text-anchor="start" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="11" font-weight="500" letter-spacing="-0.2px">page up</text>
        <g transform="translate(${widthPx - 26}, ${symY})">
          <path d="M8 14 V4 M4 8 L8 4 L12 8 M2 2 H14" fill="none" stroke="${textColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isPageDown) {
      const textY = isPressed ? 58 : 53;
      const symY = isPressed ? 14 : 9;
      legendContent = `
        <text x="12" y="${textY}" text-anchor="start" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="11" font-weight="500" letter-spacing="-0.2px">page down</text>
        <g transform="translate(${widthPx - 26}, ${symY})">
          <path d="M8 2 V12 M4 8 L8 12 L12 8 M2 14 H14" fill="none" stroke="${textColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isHome) {
      const textY = isPressed ? 58 : 53;
      const symY = isPressed ? 14 : 9;
      legendContent = `
        <text x="12" y="${textY}" text-anchor="start" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="11" font-weight="500" letter-spacing="-0.2px">home</text>
        <g transform="translate(${widthPx - 26}, ${symY})">
          <path d="M12 12 L4 4 M4 9 V4 H9" fill="none" stroke="${textColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isEnd) {
      const textY = isPressed ? 58 : 53;
      const symY = isPressed ? 14 : 9;
      legendContent = `
        <text x="12" y="${textY}" text-anchor="start" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="11" font-weight="500" letter-spacing="-0.2px">end</text>
        <g transform="translate(${widthPx - 26}, ${symY})">
          <path d="M4 4 L12 12 M12 7 V12 H7" fill="none" stroke="${textColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isMouseKey) {
      const textY = isPressed ? 58 : 53;
      const symY = isPressed ? 14 : 9;
      legendContent = `
        <text x="10" y="${textY}" text-anchor="start" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="10.5" font-weight="600" letter-spacing="-0.2px">${displayLabel}</text>
        <g transform="translate(${widthPx - 24}, ${symY})">
          <rect x="0" y="0" width="14" height="22" rx="7" ry="7" fill="none" stroke="${textColor}" stroke-width="1.6" />
          <path d="M0 8 H14" stroke="${textColor}" stroke-width="1.4" />
          <path d="M7 0 V8" stroke="${textColor}" stroke-width="1.4" />
          ${isMouseLeft ? `<path d="M0 8 H7 V0 A 7 7 0 0 0 0 8 Z" fill="#0A84FF" />` : ''}
          ${isMouseRight ? `<path d="M7 0 V8 H14 A 7 7 0 0 0 7 0 Z" fill="#0A84FF" />` : ''}
          ${isMouseMiddle ? `<rect x="5.5" y="2" width="3" height="5" rx="1.5" fill="#0A84FF" />` : ''}
        </g>
      `;
    } else if (isPrtSc) {
      const textY = isPressed ? 58 : 53;
      const symY = isPressed ? 14 : 9;
      legendContent = `
        <text x="12" y="${textY}" text-anchor="start" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="11" font-weight="500" letter-spacing="-0.2px">prt sc</text>
        <g transform="translate(${widthPx - 28}, ${symY})">
          <path d="M3 5h2.5l1.2-2h5.6l1.2 2H16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill="none" stroke="${textColor}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="9.5" cy="10" r="2.8" fill="none" stroke="${textColor}" stroke-width="1.6"/>
        </g>
      `;
    } else {
      // Single character or digit (like '4', 'N', 'A') - centered and bold/medium like Image 1
      const charY = isPressed ? 37 : 32;
      legendContent = `
        <text x="${capCenterX}" y="${charY}" text-anchor="middle" dominant-baseline="central" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" font-size="26" font-weight="500">${formatKeyLabel(label, keyboardLayout)}</text>
      `;
    }

    return `
      <svg width="${widthPx}" height="${heightPx}" viewBox="0 0 ${widthPx} ${heightPx}" class="select-none flex-shrink-0 transition-transform duration-75" style="overflow: visible;">
        <defs>
          <filter id="appleShadow_${uid}" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.75"/>
          </filter>
          <filter id="appleGlow_${uid}" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <!-- Horizontal underside gradient -->
          <linearGradient id="appleUnderGrad_${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${underEdge}"/>
            <stop offset="50%" stop-color="${underCenter}"/>
            <stop offset="100%" stop-color="${underEdge}"/>
          </linearGradient>
          <!-- Vertical top keycap gradient -->
          <linearGradient id="appleMainGrad_${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${capTop}"/>
            <stop offset="100%" stop-color="${capBottom}"/>
          </linearGradient>
        </defs>

        <!-- 1. 3D Underside Shelf Base (8px radius, horizontal gradient, shadow, stroke) -->
        <rect x="2" y="${underY}" width="${capW}" height="${underH}" rx="8" ry="8" fill="url(#appleUnderGrad_${uid})" filter="url(#appleShadow_${uid})" stroke="${underStroke}" stroke-width="1" />

        <!-- 2. Main Top Keycap Surface (8px radius, vertical gradient, stroke 1.0) -->
        <rect x="2" y="${capY}" width="${capW}" height="${capH}" rx="8" ry="8" fill="url(#appleMainGrad_${uid})" stroke="${capStroke}" stroke-width="1" />

        <!-- 3. Legends -->
        ${legendContent}
      </svg>
    `;
  }

  // =========================================================================
  // 3. RETRO IBM / VINTAGE STYLE (100% Exact RetroKeycapRenderer.swift)
  // =========================================================================
  if (style === 'retro') {
    // RetroKeycapMetrics: height = 96, minWidth = 96, extraWidth = 8, bodyRadius = 24, faceRadius = 20
    let widthPx = 96;
    if (isSpaceKey) widthPx = 270;
    else if (isCapsKey) widthPx = 160;
    else if (isReturnKey) widthPx = 150;
    else if (isShiftKey) widthPx = 135;
    else if (normKey === 'command' || normKey === 'cmd' || normKey === 'win') widthPx = 115;
    else if (normKey === 'option' || normKey === 'alt') widthPx = 100;
    else if (isTabKey || isEscKey || isDeleteKey) widthPx = 130;
    else if (isModifier) widthPx = 100;

    const heightPx = 96;
    const press = isPressed ? 3 : 0;

    // Body: bodyRect = rect.offsetBy(dx: 0, dy: press)
    const bodyY = press;
    const bodyW = widthPx;
    const bodyH = 96;

    // Base Lip in SVG (AppKit: minY + 2, height: bodyH - 18 = 78):
    // In SVG (Y down), lip peeks out at the bottom: y = bodyY + 16, height = 78
    const lipX = 5;
    const lipY = bodyY + 16;
    const lipW = bodyW - 10;
    const lipH = 78;

    // Sculpted Inset Face:
    // faceSideInset: 4, faceTopInset: 7, faceBottomInset: 14, height: 96 - 7 - 14 = 75
    const faceX = 4;
    const faceY = bodyY + 7;
    const faceW = bodyW - 8;
    const faceH = 75;
    const faceCenterX = faceX + faceW / 2;
    const faceCenterY = faceY + faceH / 2;

    // Colors derived with Keyty color math:
    const bodyEdge = darkened(tokens.surfaceShadow, 0.08);
    const bodyCenter = darkened(tokens.surfaceBase, 0.10);
    const darkFaceTop = lightened(tokens.surfaceBase, 0.03);
    const darkFaceBottom = darkened(tokens.surfaceBase, 0.01);
    const lipEdge = darkened(tokens.recess, 0.34);
    const lipCenter = darkened(tokens.recess, 0.12);
    const strokeColor = tokens.surfaceBorder;
    const textColor = tokens.textColor;

    let legendContent = '';
    if (isArrowUp) {
      legendContent = `
        <g transform="translate(${faceCenterX - 11}, ${faceCenterY - 7})">
          <path d="M11 19 V3 M4 10 L11 3 L18 10" fill="none" stroke="${textColor}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isArrowDown) {
      legendContent = `
        <g transform="translate(${faceCenterX - 11}, ${faceCenterY - 7})">
          <path d="M11 3 V19 M4 12 L11 19 L18 12" fill="none" stroke="${textColor}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isArrowLeft) {
      legendContent = `
        <g transform="translate(${faceCenterX - 11}, ${faceCenterY - 7})">
          <path d="M19 11 H3 M10 4 L3 11 L10 18" fill="none" stroke="${textColor}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isArrowRight) {
      legendContent = `
        <g transform="translate(${faceCenterX - 11}, ${faceCenterY - 7})">
          <path d="M3 11 H19 M12 4 L19 11 L12 18" fill="none" stroke="${textColor}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      `;
    } else if (isEscKey) {
      legendContent = `
        <g transform="translate(${faceCenterX - 9}, ${faceCenterY - 14})">
          <path d="M5.5 2.5 A 5.5 5.5 0 1 1 2.5 5.5" fill="none" stroke="${textColor}" stroke-width="2" stroke-linecap="round"/>
          <path d="M2.5 2.5 L 6.5 6.5" fill="none" stroke="${textColor}" stroke-width="2" stroke-linecap="round"/>
          <path d="M6 2 H 2 V 6" fill="none" stroke="${textColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <text x="${faceCenterX}" y="${faceCenterY + 16}" text-anchor="middle" fill="${textColor}" font-family="-apple-system, 'SF Pro Display', sans-serif" font-size="11" font-weight="700">ESC</text>
      `;
    } else if (isTabKey) {
      legendContent = `
        <g transform="translate(${faceCenterX - 9}, ${faceCenterY - 14})">
          <path d="M2 9 h9 M7.5 5.5 L11 9 l-3.5 3.5 M15 5 v8" fill="none" stroke="${textColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <text x="${faceCenterX}" y="${faceCenterY + 16}" text-anchor="middle" fill="${textColor}" font-family="-apple-system, 'SF Pro Display', sans-serif" font-size="11" font-weight="700">TAB</text>
      `;
    } else if (isSpecial || isModifier) {
      legendContent = `
        <text x="${faceCenterX}" y="${faceCenterY + 4}" text-anchor="middle" dominant-baseline="central" fill="${textColor}" font-family="-apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="0.5px">${formatKeyLabel(displayLabel, keyboardLayout)}</text>
      `;
    } else {
      legendContent = `
        <text x="${faceCenterX}" y="${faceCenterY + 4}" text-anchor="middle" dominant-baseline="central" fill="${textColor}" font-family="-apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="26" font-weight="700">${formatKeyLabel(label, keyboardLayout)}</text>
      `;
    }

    return `
      <svg width="${widthPx}" height="${heightPx}" viewBox="0 0 ${widthPx} ${heightPx}" class="select-none flex-shrink-0 transition-transform duration-75" style="overflow: visible;">
        <defs>
          <filter id="retroShadow_${uid}" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="1" stdDeviation="3" flood-color="#000000" flood-opacity="0.6"/>
          </filter>
          <!-- Horizontal lip gradient -->
          <linearGradient id="retroLipGrad_${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${lipEdge}" stop-opacity="0.96"/>
            <stop offset="50%" stop-color="${lipCenter}" stop-opacity="0.86"/>
            <stop offset="100%" stop-color="${lipEdge}" stop-opacity="0.96"/>
          </linearGradient>
          <!-- Horizontal body gradient: edge (0%) -> center (32%) -> center (68%) -> edge (100%) -->
          <linearGradient id="retroBodyGrad_${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${bodyEdge}"/>
            <stop offset="32%" stop-color="${bodyCenter}"/>
            <stop offset="68%" stop-color="${bodyCenter}"/>
            <stop offset="100%" stop-color="${bodyEdge}"/>
          </linearGradient>
          <!-- Vertical face gradient: angle -90 in AppKit (top to bottom) -->
          <linearGradient id="retroFaceGrad_${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${darkFaceTop}"/>
            <stop offset="100%" stop-color="${darkFaceBottom}"/>
          </linearGradient>
        </defs>

        <!-- 1. Base Lip (24px corner radius) -->
        <rect x="${lipX}" y="${lipY}" width="${lipW}" height="${lipH}" rx="24" ry="24" fill="url(#retroLipGrad_${uid})" />

        <!-- 2. Body Path (24px corner radius, shadow, 1.5px stroke at 0.20 opacity) -->
        <rect x="0" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="24" ry="24" fill="url(#retroBodyGrad_${uid})" filter="url(#retroShadow_${uid})" stroke="${strokeColor}" stroke-opacity="0.20" stroke-width="1.5" />

        <!-- 3. Sculpted Face Path (20px corner radius, 1.25px stroke at 0.20 opacity) -->
        <rect x="${faceX}" y="${faceY}" width="${faceW}" height="${faceH}" rx="20" ry="20" fill="url(#retroFaceGrad_${uid})" stroke="${strokeColor}" stroke-opacity="0.20" stroke-width="1.25" />

        <!-- 4. Legends -->
        ${legendContent}
      </svg>
    `;
  }

  // =========================================================================
  // 4. MINIMAL FLOATING STYLE (100% Exact MinimalKeycapRenderer.swift)
  // =========================================================================
  if (style === 'minimal') {
    const themeData = pbtThemes[theme] || pbtThemes.classic;
    const pbtTok = (isModifier || isSpecial) && !isArrowKey ? themeData.mod : themeData.alpha;
    const heightPx = 64;

    let symbolOrText = '';
    if (isShiftKey) symbolOrText = '⇧';
    else if (normKey === 'command' || normKey === 'cmd' || normKey === 'win') symbolOrText = '⌘';
    else if (normKey === 'option' || normKey === 'alt') symbolOrText = '⌥';
    else if (normKey === 'control' || normKey === 'ctrl') symbolOrText = '⌃';
    else if (isCapsKey) symbolOrText = '⇪';
    else if (isReturnKey) symbolOrText = '↵';
    else if (isDeleteKey) symbolOrText = '⌫';
    else if (isTabKey) symbolOrText = '⇥';
    else if (isEscKey) symbolOrText = '⎋';
    else if (isArrowUp) symbolOrText = '↑';
    else if (isArrowDown) symbolOrText = '↓';
    else if (isArrowLeft) symbolOrText = '←';
    else if (isArrowRight) symbolOrText = '→';
    else if (isPageUp) symbolOrText = '⇞';
    else if (isPageDown) symbolOrText = '⇟';
    else if (isHome) symbolOrText = '↖';
    else if (isEnd) symbolOrText = '↘';
    else if (isSpaceKey) symbolOrText = '␣';
    else symbolOrText = formatKeyLabel(label, keyboardLayout);

    const isSymbol = ['⇧', '⌘', '⌥', '⌃', '⇪', '↵', '⌫', '⇥', '⎋', '↑', '↓', '←', '→', '⇞', '⇟', '↖', '↘', '␣'].includes(symbolOrText);
    
    let widthPx = 64;
    let fontSize = 24;
    if (isSpaceKey) {
      widthPx = 220;
      fontSize = 26;
    } else if (isCapsKey) {
      widthPx = 110;
      fontSize = 24;
    } else if (isReturnKey || isTabKey || isDeleteKey || isShiftKey) {
      widthPx = 86;
      fontSize = 24;
    } else if (symbolOrText.length > 2) {
      widthPx = Math.max(64, symbolOrText.length * 14 + 20);
      fontSize = 16;
    } else if (isSymbol) {
      widthPx = 64;
      fontSize = 28;
    }

    const scaleStyle = isPressed ? 'transform: scale(0.92); transform-origin: center center;' : '';
    const capBg = isPressed ? pbtTok.DishBottom : pbtTok.DishTop;
    const capStroke = pbtTok.BodyStroke;
    const textColor = pbtTok.TextColor;

    return `
      <svg width="${widthPx}" height="${heightPx}" viewBox="0 0 ${widthPx} ${heightPx}" class="select-none flex-shrink-0 transition-transform duration-75" style="overflow: visible; ${scaleStyle}">
        <rect x="2" y="2" width="${widthPx - 4}" height="${heightPx - 4}" rx="14" ry="14" fill="${capBg}" stroke="${capStroke}" stroke-width="1.2"/>
        <text x="${widthPx / 2}" y="${heightPx / 2}" text-anchor="middle" dominant-baseline="central" fill="${textColor}" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" font-size="${fontSize}" font-weight="600">${symbolOrText}</text>
      </svg>
    `;
  }

  // =========================================================================
  // 5. APPLE M0116 STYLE (100% Exact M0116KeycapRenderer.swift 1987)
  // =========================================================================
  // Apple Standard Keyboard 1987 vintage sculpted keycap:
  // height = 88, minWidth = 80, bodyRadius = 9, faceRadius = 7
  let widthPx = 80;
  if (isSpaceKey) widthPx = 240;
  else if (isCapsKey) widthPx = 140;
  else if (isReturnKey) widthPx = 130;
  else if (isShiftKey) widthPx = 115;
  else if (normKey === 'command' || normKey === 'cmd' || normKey === 'win') widthPx = 95;
  else if (normKey === 'option' || normKey === 'alt') widthPx = 85;
  else if (isTabKey || isEscKey || isDeleteKey) widthPx = 105;
  else if (isArrowKey) widthPx = 80;
  else if (isModifier) widthPx = 85;

  const heightPx = 88;
  const press = isPressed ? 2 : 0;
  const bodyY = 2 + press;
  const bodyW = widthPx - 4;
  const bodyH = 82;

  // Face rect: faceSideInset = 5, faceTopInset = 4, faceBottomInset = 15
  const faceX = 2 + 5;
  const faceY = bodyY + 4;
  const faceW = bodyW - 10;
  const faceH = bodyH - 19;
  const faceCenterX = faceX + faceW / 2;
  const faceCenterY = faceY + faceH / 2;

  const wellColor = darkened(tokens.recess, 0.45);
  const bodyHighlight = blend(tokens.surfaceHighlight, tokens.surfaceBase, 0.35);
  const bodyEdge = darkened(tokens.surfaceShadow, 0.28);
  const legendTextColor = darkened(tokens.textColor, 0.18);
  const creaseColor = tokens.surfaceBorder;

  let legendContent = '';
  if (isArrowUp) {
    legendContent = `
      <g transform="translate(${faceCenterX - 10}, ${faceCenterY - 6})">
        <path d="M10 17 V3 M4 9 L10 3 L16 9" fill="none" stroke="${legendTextColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    `;
  } else if (isArrowDown) {
    legendContent = `
      <g transform="translate(${faceCenterX - 10}, ${faceCenterY - 6})">
        <path d="M10 3 V17 M4 11 L10 17 L16 11" fill="none" stroke="${legendTextColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    `;
  } else if (isArrowLeft) {
    legendContent = `
      <g transform="translate(${faceCenterX - 10}, ${faceCenterY - 6})">
        <path d="M17 10 H3 M9 4 L3 10 L9 16" fill="none" stroke="${legendTextColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    `;
  } else if (isArrowRight) {
    legendContent = `
      <g transform="translate(${faceCenterX - 10}, ${faceCenterY - 6})">
        <path d="M3 10 H17 M11 4 L17 10 L11 16" fill="none" stroke="${legendTextColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    `;
  } else if (isEscKey) {
    legendContent = `
      <g transform="translate(${faceX + 8}, ${faceY + 8})">
        <path d="M5.5 2.5 A 5.5 5.5 0 1 1 2.5 5.5" fill="none" stroke="${legendTextColor}" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M2.5 2.5 L 6.5 6.5" fill="none" stroke="${legendTextColor}" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M6 2 H 2 V 6" fill="none" stroke="${legendTextColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <text x="${faceX + 8}" y="${faceY + faceH - 10}" text-anchor="start" fill="${legendTextColor}" font-family="-apple-system, 'Helvetica Neue', Arial, sans-serif" font-style="italic" font-size="13" font-weight="600">esc</text>
    `;
  } else if (isSpecial || isModifier) {
    legendContent = `
      <text x="${faceX + 8}" y="${faceY + faceH - 10}" text-anchor="start" fill="${legendTextColor}" font-family="-apple-system, 'Helvetica Neue', Arial, sans-serif" font-style="italic" font-size="13" font-weight="600">${displayLabel}</text>
    `;
  } else {
    legendContent = `
      <text x="${faceX + 8}" y="${faceY + faceH - 12}" text-anchor="start" fill="${legendTextColor}" font-family="-apple-system, 'Helvetica Neue', Arial, sans-serif" font-style="italic" font-size="20" font-weight="600">${formatKeyLabel(label, keyboardLayout)}</text>
    `;
  }

  return `
    <svg width="${widthPx}" height="${heightPx}" viewBox="0 0 ${widthPx} ${heightPx}" class="select-none flex-shrink-0 transition-transform duration-75" style="overflow: visible;">
      <defs>
        <!-- Directional Body gradient lit from left -->
        <linearGradient id="m0116Body_${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${tokens.surfaceHighlight}"/>
          <stop offset="14%" stop-color="${bodyHighlight}"/>
          <stop offset="55%" stop-color="${tokens.surfaceBase}"/>
          <stop offset="92%" stop-color="${tokens.surfaceShadow}"/>
          <stop offset="100%" stop-color="${bodyEdge}"/>
        </linearGradient>
        <!-- Front skirt vertical gradient -->
        <linearGradient id="m0116Skirt_${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${bodyEdge}"/>
          <stop offset="45%" stop-color="${tokens.surfaceBase}"/>
          <stop offset="100%" stop-color="${tokens.surfaceHighlight}"/>
        </linearGradient>
        <!-- Top face vertical gradient -->
        <linearGradient id="m0116Face_${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${tokens.surfaceHighlight}"/>
          <stop offset="58%" stop-color="${tokens.surfaceBase}"/>
          <stop offset="100%" stop-color="${tokens.surfaceShadow}"/>
        </linearGradient>
      </defs>

      <!-- 1. Dark Plate Well (recessColor darkened by 45%) -->
      <rect x="0" y="0" width="${widthPx}" height="${heightPx}" rx="11" ry="11" fill="${wellColor}" />

      <!-- 2. Sculpted Body (9px corner radius) -->
      <rect x="2" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="9" ry="9" fill="url(#m0116Body_${uid})" stroke="${creaseColor}" stroke-opacity="0.3" stroke-width="1" />

      <!-- 3. Front Skirt (lit front) -->
      <rect x="2" y="${bodyY + bodyH - 18}" width="${bodyW}" height="18" rx="7" ry="7" fill="url(#m0116Skirt_${uid})" />

      <!-- 4. Top Face (7px corner radius) -->
      <rect x="${faceX}" y="${faceY}" width="${faceW}" height="${faceH}" rx="7" ry="7" fill="url(#m0116Face_${uid})" stroke="${creaseColor}" stroke-opacity="0.4" stroke-width="1" />

      <!-- 5. Vintage Lower-Left Oblique Legends -->
      ${legendContent}
    </svg>
  `;
}

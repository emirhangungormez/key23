# Key23 — UI & Arayüz Tasarım Kuralları (UI Design System Rules)

Bu doküman, Key23 projesinin görsel bütünlüğünü, pencere şeffaflığını ve arayüz tutarlılığını garanti altına alan temel kuralları tanımlar. Keyty, Cap ve Apple HIG / Windows 11 DWM HUD standartları baz alınarak hazırlanmıştır.

---

## 1. TEMEL FELSEFE & HUD PRENSİPLERİ

1. **Sıfır Çerçeve Kirliliği (Zero Box Clutter):**
   - Ekranda yüzen (floating) HUD ve fare göstergeleri, içeriklerinin etrafında gereksiz veya çift katmanlı dış çerçeveler ("kutunun içinde kutu") barındırmamalıdır.
   - Dış pod gövdesi (`#key-cluster`, `#preview-pod`), tuşları saran bir zemin görevi görür; belirgin bir `border` (kenarlık) çizgisine sahip olmamalıdır (`border: none !important`).

2. **İçeriğe Kilitlenen Dinamik Genişlik (Content-Hugged Bounds):**
   - HUD konteyneri statik veya rastgele genişliklere sahip olamaz.
   - Her zaman `display: inline-flex; width: fit-content; max-width: max-content;` kullanılmalı; yalnızca basılı olan tuş veya fare göstergesi kadar yer kaplamalıdır.
   - Basılı tuşun sağında veya solunda ölü boşluk (dead space) bırakılamaz.

3. **Yumuşak Gölgelendirme (Soft Ambient Shadows):**
   - Ayrışma sert kenarlıklarla değil, yumuşak çok kademeli gölgelerle sağlanır:
     `box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2);`

---

## 2. WINDOWS 11 DWM & TAURİ ŞEFFAFLIK KURALLARI

1. **Zorunlu `.shadow(false)` Kuralı:**
   - Windows 11 Desktop Window Manager (DWM), şeffaf (`transparent: true`) ve kenarlıksız (`decorations: false`) pencerelerde varsayılan olarak pencere etrafına otomatik dikdörtgen kenarlık/gölge çizer.
   - Bu nedenle HUD (`overlay`), fare takipçisi (`mouse`) ve konum seçici (`picker`) pencerelerinin tamamında builder'a mutlaka `.shadow(false)` eklenmelidir.

2. **Win32 Genişletilmiş Pencere Stilleri:**
   - Ekranda tıklanamayan ve oyun/uygulama performansını etkilemeyen şeffaf HUD'lar için şu Win32 bayrakları korunmalıdır:
     `WS_EX_TOPMOST | WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE | WS_EX_TRANSPARENT`

3. **HTML/Body Temizliği:**
   - `overlay.html` ve `mouse.html` şablonlarında `html, body` her zaman `background: transparent !important; margin: 0; padding: 0;` olmalı ve tarayıcı varsayılan kenarlıkları tamamen sıfırlanmalıdır.

---

## 3. BİLEŞEN TASARIM STANDARTLARI

### 3.1 Fare Takipçisi (`#mouse-pill`)
- **Format:** 32px × 46px dikey elips/kapsül (`border-radius: 9999px`).
- **Kenarlık:** Asla kalın veya mat beyaz olmamalıdır; en fazla `1px solid rgba(255, 255, 255, 0.12)`.
- **Arka Plan:** `rgba(12, 14, 18, 0.88)` + `backdrop-filter: blur(12px)`.
- **Tıklama Efekti:** Aktif olan sol/sağ/orta buton yumuşak beyaz/vurgulu renkle SVG üzerinden doldurulur.

### 3.2 Tuş Takımı Gövdesi (`#key-cluster` / Pod Chassis)
- **Border:** `none` (Dış kenar çizgisi tamamen yasaktır).
- **Border Radius:**
  - PBT & Apple: `18px`
  - Minimal: `9999px` (hap)
  - Retro: `24px`
  - M0116: `12px`
- **Padding:** Dikey `8-10px`, yatay `12-14px`.

### 3.3 Boyut Normalizasyonu (Scale Normalization)
- Farklı tuş stillerinin (PBT, Apple, Retro, Minimal, M0116) görsel ağırlık farkı `getSizeNormalization(style)` katsayısı ile dengelenir. Hiçbir stil diğerinden kontrolsüz şekilde devasa veya minik görünemez.

---

## 4. KOD SADELEŞTİRME & TEMİZLİK KURALLARI

1. **Ölü Kod Yasağı:**
   - Kullanılmayan tema anahtarları, eski test fonksiyonları ve tekrar eden inline stiller silinmelidir.
2. **Doğrudan Token Kullanımı:**
   - Renk ve gölge hesaplamaları merkezi `keycap.ts` token havuzundan beslenmelidir.
3. **Senkron DOM Yönetimi:**
   - Tuş ekleme ve kaldırma işlemlerinde tüm DOM ağacını yıkıp yeniden inşa etmek yerine diffing (`existingKeyEls`) korunmalı; boşaldığı anda HUD gecikmesiz gizlenmelidir.

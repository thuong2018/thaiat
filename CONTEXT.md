# CONTEXT — Thái Ất Thần Kinh App
> Paste file này vào đầu mỗi chat mới để AI hiểu ngay kiến trúc, không cần đọc lại code.

---

## Tổng quan
Single-file app (`index.html`, ~6100 dòng). Không có framework, không có build step.
Giao diện dark, mobile-first. Background là Three.js 3D cosmos.
API proxy: `https://thuongvip.shadowthuong.workers.dev` (Cloudflare Worker) — dùng model `claude-sonnet-4-20250514`.

---

## Cấu trúc file (theo thứ tự dòng)

| Vùng | Dòng | Nội dung |
|---|---|---|
| CSS | 11–2500 | Toàn bộ style, CSS variables, dark theme |
| HTML | 2200–2500 | Layout: input form, result panel, khay chat cố định trái |
| Section 1 | 2543–2906 | Three.js 3D background — rings, nodes, animation |
| Section 2 | 2908–4467 | **Computation Engine** (xem chi tiết bên dưới) |
| AI Fetch | 4468–5059 | Proxy calls, luận giải, Khầy chatbot |
| Render | 5060–5972 | Toàn bộ hàm render UI |
| Export | 5973–6108 | Xuất báo cáo text |

---

## Computation Engine (Section 2) — các hàm cốt lõi

### Hằng số quan trọng
```
THAN_INFO       — map 16 ô địa bàn → [cung số, "1st/2nd/3rd"]
DIA_BAN         — vòng 16 ô địa bàn (Càn→Hợi→...→Tuất)
DIA_CHI         — 12 địa chi (Tý→Hợi)
DUONG_PALACES   — [1,2,3,4,6,7,8,9] — 8 cung bỏ cung 5
VONG_8_CUNG     — [1,2,3,4,6,7,8,9]
VONG_9_CUNG     — [1,2,3,4,5,6,7,8,9]
CUNG_NAME       — {1:"Càn", 2:"Ly", 3:"Cấn", 4:"Chấn", 6:"Đoài", 7:"Khôn", 8:"Khảm", 9:"Tốn"}
VX_BDS_MAP      — map cung Văn Xương → nhận định BĐS
VANG_CUNG_MAP   — map cung Khách Đại → nhận định Vàng
```

### Pipeline tính toán chính
```
compute(nam, thang, ngay, gio)
  └─ tinhCuc(tichSo, cucSo, donHe, tichSoNam)   × 4 cục
  └─ tinhHungTinh(tichSoNam)                     → hung tinh vĩ mô
  └─ quetThamHoaDanCo(tichSoNam, anChu, anKhach) → 11 lưới lọc thảm họa
```

### tinhCuc() — trả về object `d` (data của 1 cục)
```
d.thaiAt        — cung Thái Ất (1–9, bỏ 5)
d.vanXuong      — địa bàn Văn Xương
d.keThan        — địa bàn Kế Thần
d.thuyKich      — địa bàn Thủy Kích
d.toanChu       — toán số Chủ
d.toanKhach     — toán số Khách
d.chuDai/chuTham/khachDai/khachTham — cung 4 tướng
d.anChuDai/anChuTham/anKhachDai/anKhachTham — kết quả giaiPhauAnTuong()
d.thanCo/danCo  — địa chi Thần Cơ, Dân Cơ (chỉ có ở Tuế Cục/Nguyệt Cục)
```

### tinhHungTinh(tichSoNam) — trả về object hung tinh vĩ mô
```
tucThan         — cung Tứ Thần (chu kỳ 360 năm)
thienAt         — cung Thiên Ất
diaAt           — cung Địa Ất
trucPhu         — cung Trực Phù (= thaiAtNam)
daiDu           — cung Đại Du Thái Ất (chu kỳ 2880 năm)
tieuDu          — cung Tiểu Du (chu kỳ 24 năm)
danCo/diaChiDanCo — cung & địa chi Dân Cơ (chu kỳ 12 năm)
thaiAtNam       — cung Thái Ất năm
cungThuyKich    — cung Thủy Kích năm
toanChuNam/toanKhachNam
nguPhuc         — { cung, tenVung, soNamDaO, soNamConLai, giaiDoan }
tamCo           — { quanCo:{diaChi,cung,soNamDaO,conLai}, thanCo:{...}, danCo:{...} }
thaiAm          — { diaChi, cung, hopThan, thaiTue,       ← MỚI THÊM
                    gapThaiAt, gapVanXuong, gapThuyKich, gapTucThan,
                    phanDoan }
```

### Thái Âm — thuật toán tính (MỚI, thêm gần đây)
```
thaiTue = DIA_CHI[(tichSoNam + 8) % 12]   // offset 8 → năm 2020=Tý, 2025=Tỵ đúng
hopThan = LUC_HOP_MAP[thaiTue]             // lục hợp
thaiAm  = DIA_CHI[(indexOf(hopThan) - 3 + 12) % 12]  // lùi 3 bước = "qua hai cung về sau"

Phán đoán:
  gapThaiAt      → ✨ Vua-Hậu hòa mục, đại cát
  gapVanXuong/gapThuyKich → 🔴 Hậu cung sinh biến
  gapTucThan     → ⚠️ Tử địa
  else           → 🟡 Bình thường
```

### 11 Lưới Lọc Thảm Họa (quetThamHoaDanCo)
```
Lưới 1  — Án Yểm (ThủyKích == ThaiAtNam)                    2đ
Lưới 2  — Toán số cực đoan (Thuần/Cô/Vô Địa)                1đ
Lưới 3  — Thời tiết cực đoan (ThaiAt âm/dương + toán cap)   1đ
Lưới 4  — Dân Cơ ∩ Sát Tinh (TứThần/ĐạiDu/ThiênẤt)        2đ / 1đ
Lưới 4.2— ThaiAt ∩ ThiênẤt/TứThần                           2đ
Lưới 5  — Đại Du xung/kề ThaiAt                             2đ / 1đ
Lưới 5.1— Đại Du ∩ TứThần/TrựcPhù/ĐịaẤt                   2đ / 1đ
Lưới 6  — Vô Thiên / Thiên Thể Sai Lệch                     1đ
Lưới 7  — Bẫy Trung Cung (Tướng Đỗ Cung 5)                 2đ
Lưới 8  — Quân Cơ ∩ Đại Du                                  3đ
Lưới 9  — Thần Cơ ∩ Thủy Kích                               2đ
Lưới 10 — Thần Cơ ∩ Hung Tinh                               2đ / 1đ
Lưới 11 — Quân Cơ ∩ Thủy Kích                               2đ
Ngưỡng kích hoạt: tổng ≥ 2đ
Ngũ Phúc: hệ số nhân (0.0–1.0) để giảm điểm thực tế
```

### Án Tướng (giaiPhauAnTuong)
```
ĐỖ CỐ    — tướng Trung Cung + VânXương cũng Trung Cung (nặng nhất)
ĐỖ       — tướng Trung Cung (cung 5)
TỨ QUÁCH CỐ — VânXương trùng tướng + kề ThaiAt
TÙ       — tướng trùng ThaiAt
QUAN     — tướng trùng VânXương (không kẹp ThaiAt)
YỂM      — tướng trùng ThủyKích
CÁCH     — khoảng cách ThaiAt = 4 (đối xung)
BÁCH     — kề ThaiAt + cả 2 phía có địch
BÁCH ĐƠN — kề ThaiAt + 1 phía có địch
HIỆP     — bị 2 tướng địch kẹp
ĐỀ       — mượn sức ThaiAt ép
HƯU/PHẾ — lực yếu
PHÁT     — đại cát, không dính án nào
```

### Án Văn Xương BĐS (xacDinhAnVanXuong)
```
TÙ       — VânXương trùng ThaiAt
ĐỐI      — VânXương cách ThaiAt 4 bước
NGOẠI BÁCH — kề ngoài ThaiAt
NỘI BÁCH — kề trong ThaiAt
QUAN     — VânXương trùng ThủyKích
```

---

## AI / Chatbot

### Khầy Chatbot
```
_khayChatContext  — global, set sau mỗi lần compute()
                    { meta, cucs, hungTinh, canhBaoThamHoa, batMon }
khayFetch()       — gọi API với system prompt đầy đủ (tọa độ vũ trụ + 4 cục + hung tinh)
khaySend()        — parse input, gọi compute() nếu nhập ngày mới, rồi khayFetch()
```

### System prompt Khầy (trong khayFetch) — cấu trúc
```
[Phần cố định]   — vai trò, luật cấm ngôn ngữ crypto, bảng tra cứu cung/môn/án/toán
[Phần động]      — TỌA ĐỘ VŨ TRỤ ĐẦY ĐỦ (4 cục chi tiết + Bát Môn + Hung Tinh Vĩ Mô)
                   + THUẬT TOÁN LUẬN GIẢI 4 LỚP (Tuế/Nguyệt Kế)
                   + hướng dẫn trả lời
```

### fetchLuanGiai / fetchTongLuan
```
fetchLuanGiai(cucTen, d, meta, hungTinh, canhBao)
  — gọi API tự động viết luận giải 120–180 chữ cho từng cục
  — Tuế Cục nhận thêm: NgũPhúc, TamCơ, TháiÂm, CảnhBáo
  — trả về { body, verdict:"cat|hung|warn", tags:[...] }

fetchTongLuan(cucs, meta, hungTinh, canhBao)
  — tổng hợp 4 cục, 150–200 chữ
```

---

## Render pipeline

```
calculate()
  └─ compute(nam, thang, ngay, gio) → r
  └─ renderResults(r)
       ├─ renderDashboard(cucs, meta, hungTinh, canhBao)  — summary cards
       ├─ renderThamHoa(hungTinh, canhBao, meta)          — hung tinh + thần sát tọa độ vĩ mô
       ├─ renderTongLuanSection()                         — tổng luận AI
       ├─ renderCuc(cucs[0], 0, hungTinh)                 — Tuế Cục ★ (có TháiÂm)
       ├─ renderCuc(cucs[2], 2, null)                     — Nhật Cục
       ├─ renderCuc(cucs[1], 1, null)                     — Nguyệt Cục
       ├─ renderCuc(cucs[3], 3, null)                     — Thời Cục
       └─ renderBatMon(batMon)

renderCuc(c, idx, hungTinh)
  — Thần Sát Tọa Độ: ThaiAt, KếThần, VănXương, AnVânXương, BĐS, ThủyKích,
                      ThầnCơ, DânCơ, TháiÂm (chỉ idx===0 && hungTinh)
  — Sa Bàn (renderSaBan)
  — Tam Cơ Grid (chỉ idx===0)
  — Toán Số
  — Tướng Tinh & Án Phạt (renderTuong)
  — Vàng badge (chỉ idx===0)
  — Radar chart
  — Luận giải AI (renderLuanGiaiSection)

renderThamHoa(hungTinh, canhBao, meta)
  — toaDo grid: ThaiAtNăm, ThủyKíchNăm, TháiÂm (màu động), TứThần,
                ThiênẤt, ĐịaẤt, TrựcPhù, ĐạiDu, TiểuDu
  — NgũPhúc row (full width, vàng nếu hội tụ ThaiAt, đỏ nếu kẹt cung 5)
  — Danh sách cảnh báo thảm họa
```

---

## Thuật toán 4 Lớp (Khầy dùng khi luận Tuế/Nguyệt Kế)
```
Lớp 1 — Binh lực & Tướng Soái (Toán Chủ/Khách, án Tướng)
Lớp 2 — Nội trị (Tam Cơ + Thái Âm)
Lớp 3 — Thiên tai & Phản nghịch (11 Lưới Lọc)
Lớp 4 — Tìm đường sống (Ngũ Phúc)
Giọng điệu: Tuế/Nguyệt → cổ phong | Thời/Nhật → thực chiến (Long/Short)
```

---

## Cấu trúc repo (GitHub Pages)

```
repo/
  index.html      ← app chính (~6100 dòng)
  manifest.json   ← PWA manifest
  sw.js           ← Service Worker
  icon-192.png    ← PWA icon
  icon-512.png    ← PWA icon
  CONTEXT.md      ← file này
```

## PWA Setup

App đã được cài PWA. Khi deploy lên GitHub Pages, user có thể:
- **iOS Safari**: Share → Add to Home Screen
- **Android Chrome**: banner "Cài ứng dụng" tự hiện, hoặc menu → Install

**Service Worker** (`sw.js`) — chiến lược cache:
- API calls (`thuongvip.shadowthuong.workers.dev`, `api.anthropic.com`) → **Network Only** (không cache AI responses)
- Google Fonts → **Network First**, fallback cache
- App shell (`index.html`, `manifest.json`) → **Cache First**, fallback network
- Offline: trả về `index.html` cho mọi navigation request

**Cập nhật cache**: đổi `CACHE_NAME = 'thai-at-v2'` trong `sw.js` khi muốn force refresh.

---

## Lịch sử thay đổi gần đây
- ✅ Tích hợp Thuật toán 4 Lớp vào system prompt Khầy
- ✅ Thêm Thái Âm (Hậu Cung): engine tính toán + hiển thị UI
  - Thần Sát Tọa Độ trong Tuế Cục (renderCuc idx===0)
  - Panel Hung Tinh Vĩ Mô (renderThamHoa)
  - Context fetchLuanGiai, fetchTongLuan, khayFetch
- ✅ Fix: renderCuc nhận hungTinh qua tham số thứ 3 (không phải closure)
- ✅ PWA: thêm manifest.json, sw.js, icon-192/512.png, SW registration trong index.html

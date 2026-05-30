# 🏛 Cổ Thư Bách Việt — Hướng Dẫn Cài Đặt & Quản Lý

## Cấu Trúc Thư Mục

```
/
├── index.html          ← Trang chủ (blog + tool Thái Ất)
├── post.html           ← Trang đọc bài viết
├── admin.html          ← Trang đăng/sửa bài (có mật khẩu)
├── data/
│   └── posts.json      ← Dữ liệu bài viết ← FILE NÀY BẠN TỰ QUẢN LÝ
└── assets/
    ├── style.css       ← CSS chung
    └── background.js   ← Hiệu ứng 3D nền
```

---

## Cài Đặt Lên Hosting

1. **Upload toàn bộ thư mục** lên host (Hostinger, Namecheap, cPanel...)
2. Trỏ domain vào thư mục đó
3. Xong! Website chạy ngay.

> ⚠️ **Lưu ý:** Website cần chạy trên **web server** (http:// hoặc https://),  
> không mở trực tiếp file `index.html` bằng cách double-click (file://) sẽ không load được JSON.

---

## Đăng Bài Viết Mới

### Bước 1 — Mở trang Admin
Truy cập: `https://yourdomain.com/admin.html`

### Bước 2 — Đăng nhập
Mật khẩu mặc định: **`cothubackviet2025`**

> Để đổi mật khẩu: mở `admin.html`, tìm dòng:
> ```js
> const ADMIN_PASSWORD = 'cothubackviet2025';
> ```
> Đổi thành mật khẩu bạn muốn, rồi upload lại file `admin.html`.

### Bước 3 — Viết bài
- Nhấn **✍️ Viết Bài Mới**
- Điền: Tiêu đề, Danh mục, Tags, Tóm tắt, Nội dung (HTML)
- Nhấn **💾 Lưu Bài Viết**

### Bước 4 — Upload file JSON
Sau khi lưu, file `posts.json` sẽ **tự động tải về máy bạn**.

Upload file này lên server vào đúng thư mục `data/posts.json` (ghi đè file cũ).

**Cách upload:**
- Dùng **FileZilla FTP** → kéo thả file vào thư mục `data/`
- Dùng **cPanel File Manager** → Upload → chọn file → overwrite
- Dùng **Hostinger File Manager** tương tự

---

## Viết Nội Dung HTML

Nội dung bài viết dùng HTML đơn giản:

```html
<h2>Tiêu đề mục lớn</h2>
<h3>Tiêu đề mục nhỏ</h3>
<p>Đoạn văn bình thường...</p>

<blockquote>
  Câu trích dẫn cổ thư, sấm ký...
</blockquote>

<ul>
  <li><strong>Điểm 1:</strong> Nội dung...</li>
  <li>Điểm 2...</li>
</ul>

<p>Chữ <strong>đậm</strong> và chữ <em>nghiêng vàng</em>.</p>
```

Dùng các nút toolbar trong editor để chèn nhanh mà không cần nhớ HTML.

---

## Chỉnh Sửa / Xóa Bài

1. Vào `admin.html` → đăng nhập
2. Nhấn **✏️** để sửa hoặc **🗑** để xóa bài
3. Sau khi lưu → upload lại `posts.json` lên server

---

## Đổi Mật Khẩu

Mở file `admin.html`, tìm đoạn:
```js
const ADMIN_PASSWORD = 'cothubackviet2025';
```
Sửa thành mật khẩu mạnh hơn, upload lại file.

---

*Cổ Thư Bách Việt · Phi Lợi Nhuận · Từ Tâm · Hữu Duyên*

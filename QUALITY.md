## 1. Test matrix

| # | Nhóm | Các bước | Mong đợi | Kết quả |
|---|------|----------|----------|---------|
| 1 | Editor | Add section → Featured Collection Tabs, chọn 3 collection | Section có trong danh sách; tab theo thứ tự block | Pass |
| 2 | Editor | Đổi collection và Custom tab label | Preview cập nhật đúng; label trống dùng tên collection | Pass |
| 3 | Editor | Xóa và kéo đổi thứ tự block khi đang ở tab 3 | Không lỗi; tab active hợp lệ (giữ hoặc về tab đầu) | Pass |
| 4 | Multi-instance | Thêm section thứ 2, chuyển tab ở cả hai | Hai section độc lập | Pass |
| 5 | Empty | Tab chọn collection "Coming soon" | Thông báo rỗng, không lỗi Liquid/JS | Pass |
| 6 | Empty | Block chưa chọn collection; xem editor và storefront | Editor: placeholder. Storefront: tab bị ẩn | Pass - chỉ editor nhìn thấy các block chưa chọn collection |
| 7 | Storefront | Chuyển tab; đổi Products per collection 4 → 8 | Đúng panel, đúng số sản phẩm, không reload | Pass |
| 8 | Editor | Đổi Heading khi đang ở tab 2 (re-render) | Vẫn ở tab 2, vẫn bấm được | Pass |
| 9 | Editor | Bấm block 3 ở sidebar | Preview mở tab 3 | Pass |
| 10 | Storefront | 390px và 1200px (thêm 768, 1440) | 2 cột / 4 cột; không tràn ngang | Pass |
| 11 | Keyboard | Tab, Enter, Space, ←, →, Home, End; xem Console | Thao tác được, focus rõ, không lỗi JS | Pass |
| 12 | Storefront | Show vendor / compare-at / Image ratio, 2 cấu hình | Hiển thị đúng theo setting | Pass |

## 2. Theme Check
### 2.1 Tổng quan
**Lệnh:** `shopify theme check` (chạy ở thư mục gốc theme)
**Ảnh:** `docs/screenshots/` (ảnh 1 + 2)

156 file được kiểm tra: **0 error, 12 warning** trong 9 file.
- 3 warning thuộc file được tạo phục vụ cho bài test, giữ lại có chủ đích (mục 2.2).
- 9 warning thuộc file gốc Dawn, ngoài phạm vi 
- Các file khác đã tạo/sửa (`assets/featured-collection-tabs.js`, `assets/section-featured-collection-tabs.css`, `snippets/card-product.liquid`, `snippets/price.liquid`) không có warning.
### 2.2 Warning trong 3 file được tạo – giữ lại có chủ đích

| File | Dòng | Check |
|---|---|---|
| sections/featured-collection-tabs.liquid | 52, 89, 119 | BlockIdUsage |

**Check Cảnh báo:** `block.id` do Shopify tự sinh và có thể thay đổi, nên không nên so sánh nó với một giá trị viết cứng, ví dụ `block.id == 'tab_abc123'`.

**Lý do không ảnh hưởng đến code trong bài test:** `first_block_id` không phải giá trị viết cứng. Nó được gán từ chính `block.id` của tab hợp lệ đầu tiên, trong khối `{%- liquid -%}` ở đầu file, và được tính lại trong **mỗi lần render**. Nếu Shopify đổi id của block, `first_block_id` cũng đổi theo, nên phép so sánh luôn đúng.

**Đã kiểm chứng:** test matrix dòng 1, 3 và 6 (đổi thứ tự, xóa block, block trống nằm đầu) đều cho tab mặc định đúng.

## 4. Lighthouse
**Công cụ:** Chrome DevTools Lighthouse
**Ảnh:** `docs/screenshots/lighthouse.png`

# Featured Collection Tabs – Shopify Theme Developer Test

Section **Featured Collection Tabs** cho theme Dawn: hiển thị sản phẩm của nhiều collection theo dạng tab, merchant cấu hình hoàn toàn trong Theme Editor.
---

## Theme

- **Theme gốc:** Dawn `<phiên bản: 16.0.0>` – nguồn: https://github.com/Shopify/dawn
- **Store:** `https://astro-vclt4n9y.myshopify.com/`
- **Link preview:** `https://astro-vclt4n9y.myshopify.com/?preview_theme_id=193025048857`

## Cách chạy

1. Cài Node.js LTS và Shopify CLI:
```bash
   npm install -g @shopify/cli@latest
```
2. Clone repo, chuyển sang branch `feature/featured-collection-tabs`.
3. Chạy theme ở chế độ phát triển:
```bash
   shopify theme dev --store astro-vclt4n9y.myshopify.com --theme-editor-sync
```
4. Mở Theme Editor → **Add section** → **Featured Collection Tabs**, chọn collection cho từng tab.
5. Kiểm tra chất lượng:
```bash
   shopify theme check
```

## Cấu trúc code và file đã sửa

| File | Loại | Mô tả |
|---|---|---|
| `sections/featured-collection-tabs.liquid` | Mới | Section, schema, render tab và panel, xử lý trường hợp rỗng |
| `assets/featured-collection-tabs.js` | Mới | Custom Element `<featured-tabs>`: chuyển tab, bàn phím, hỗ trợ Theme Editor |
| `assets/section-featured-collection-tabs.css` | Mới | CSS có scope `.fct`, responsive, trạng thái hover/focus |
| `snippets/card-product.liquid` | Sửa | Thêm tham số tùy chọn `hide_compare_at_price`, truyền xuống snippet giá |
| `snippets/price.liquid` | Sửa | Ẩn giá gạch khi `hide_compare_at_price` là `true` |
| `DEBUGGING.md` | Mới | Phân tích đoạn JavaScript lỗi của đề |
| `QUALITY.md` | Mới | Test matrix, vấn đề thực tế, Theme Check, Lighthouse |
| `docs/screenshots/` | Mới | Ảnh minh chứng |

### Cấu hình của section

| Setting | Loại | Mô tả |
|---|---|---|
| Heading | text | Tiêu đề section; dùng làm tên cho tablist (`aria-labelledby`) |
| Products per collection | range 4–8 | Số sản phẩm mỗi tab |
| Image ratio | select | Square / Portrait, truyền vào `media_aspect_ratio` của card |
| Show vendor | checkbox | Hiện tên vendor trên card |
| Show compare-at price | checkbox | Bật/tắt giá gạch khi sản phẩm giảm giá |

Mỗi tab là một block **Collection tab** (tối đa 4) gồm: Collection và Custom tab label (để trống thì dùng tên collection).

---

## Phần A – Liquid & Architecture

### Kết quả

- 3 setting mới: **Image ratio**, **Show vendor**, **Show compare-at price**, nằm trong nhóm "Product card" của sidebar.
- Xử lý đủ trường hợp biên:
  - Collection rỗng: hiện dòng thông báo, không lỗi Liquid.
  - Block chưa chọn collection: trong editor hiện tab placeholder; ngoài storefront tab bị ẩn hoàn toàn.
  - Không còn tab hợp lệ: storefront không in gì, editor hiện dòng hướng dẫn.

### Cách kiểm thử

- Test matrix dòng 1, 2, 5, 6, 12 trong `QUALITY.md`.
- Tắt Show compare-at price trong section, rồi mở `/collections/sale` và section Featured collection gốc của Dawn: giá gạch ở các nơi đó vẫn hiện như cũ, chứng minh không ảnh hưởng tính năng khác.

## Phần B – JavaScript

### Kết quả

- Bấm tab đổi panel ngay, không tải lại trang; chỉ một panel hiển thị, `aria-selected` luôn khớp với panel đang mở.
- Bàn phím theo W3C tabs pattern: ←/→ (quay vòng), Home/End, Enter/Space; roving tabindex nên phím Tab chỉ dừng một lần trong hàng tab.
- Nhiều section cùng loại trên một trang hoạt động độc lập.
- Theme Editor:
  - Đổi setting (section render lại): vẫn giữ tab đang chọn và vẫn bấm được.
  - Xóa block đang được chọn: quay về tab hợp lệ đầu tiên.
  - Bấm block ở sidebar: preview mở đúng tab đó.

### Cơ chế init và cleanup

- Section là Custom Element `<featured-tabs>`. Trình duyệt tự gọi `connectedCallback()` khi phần tử được gắn vào trang (tải trang, thêm section, editor render lại) và `disconnectedCallback()` khi phần tử bị gỡ.
- Listener `click` và `keydown` gắn một lần trên tablist (event delegation), kèm `signal` của `AbortController`. `disconnectedCallback()` gọi `abort()` để gỡ toàn bộ listener cùng lúc.
- Mọi truy vấn DOM chỉ tìm trong `this`, nên các section không ảnh hưởng nhau.
- File được bọc trong hàm tự chạy và có guard `customElements.get('featured-tabs')`, nên tải nhiều lần cũng chỉ đăng ký một lần. Listener `shopify:block:select` trên `document` nằm sau guard nên chỉ được gắn đúng một lần.
- Tab đang chọn được lưu trong một `Map` (khóa `section.id`, giá trị `block.id`) nằm ngoài class. Map còn nguyên qua các lần editor render lại, nhưng mất khi tải lại trang, nên khách luôn thấy tab đầu tiên. Vì lý do này tôi không dùng `sessionStorage`.
- Chọn tab ngay khi di chuyển bằng phím mũi tên (automatic activation), vì nội dung panel đã có sẵn trong trang, đổi ngay không tốn thêm request.

Phân tích đoạn JavaScript lỗi của đề: xem [DEBUGGING.md](DEBUGGING.md).

---

## Phần C – CSS & UI

### Kết quả

- Ảnh ở 4 kích thước: `docs/screenshots/390px.png`, `docs/screenshots/768px.png`, `docs/screenshots/1200px.png`, `docs/screenshots/1440.png`.
- Grid 2 cột trên mobile/tablet, 4 cột trên desktop; trang không tràn ngang.
- Tab có hover, trạng thái đang chọn rõ ràng, focus ring nhìn thấy đủ; card có hiệu ứng hover nhẹ.
- Tên sản phẩm dài tối đa 2 dòng; giá cũ và giá mới không bị ngắt giữa con số.

### 3 quyết định thiết kế

1. **Hàng tab cuộn ngang thay vì xuống dòng.** Hàng tab luôn một dòng nên không đẩy grid xuống; chỉ tablist cuộn nên cả trang không tràn. Label dài bị cắt "…", tên đầy đủ vẫn có trong `title` và được trình đọc màn hình đọc đủ. `scroll-snap` giúp vuốt dừng đúng đầu mỗi tab.
2. **Dùng lại grid, card và biến màu của Dawn.** Section đồng bộ phong cách với theme, tự đổi theo color scheme (`--color-foreground`), ít CSS phải bảo trì. Ở 768px giữ 2 cột theo Dawn: số sản phẩm là 4–8, nên 2 cột luôn chia hết, còn 3 cột sẽ để lại card lẻ ở hàng cuối.
3. **CSS có scope bằng tiền tố `.fct` và focus ring vẽ vào trong.** Mọi selector bắt đầu bằng `.fct` nên không rò rỉ sang section khác. Focus ring dùng `outline-offset` âm vì tablist có `overflow-x: auto`, outline mặc định của Dawn sẽ bị cắt mất.

---

## Phần D – Quality

Chi tiết trong [QUALITY.md](QUALITY.md). Tóm tắt:

- **Test matrix:** 12 trường hợp gồm storefront, editor, bàn phím, empty states, multi-instance.
- **Theme Check:** 0 error. 3 warning `BlockIdUsage` trong file đã tạp để phục vụ cho bài test được giữ lại có giải thích; 9 warning còn lại thuộc file gốc Dawn.
- **Lighthouse (Mobile):** Performance 71, Accessibility 97, CLS 0, TBT 40 ms.

---

## Công cụ AI đã dùng

- **Công cụ:** `Claude`
- **Phạm vi sử dụng:** 
    - Phân thích yêu cầu
    - Tổng hợp tài liệu
    - Giải đáp thắc mắc, đề xuất phương án xử lý vấn đề
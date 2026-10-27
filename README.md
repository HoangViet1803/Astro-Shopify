## Section Custom Slider

### File

| File | Loại | Mô tả |
|---|---|---|
| `sections/custom-slider.liquid` | Mới | Markup, schema, chuyển setting thành biến CSS, ảnh responsive |
| `assets/section-custom-slider.js` | Mới | Custom Element `<custom-slider>`: chuyển slide, autoplay, vuốt, bàn phím, Theme Editor |
| `assets/section-custom-slider.css` | Mới | CSS có scope tiền tố `.cs-`, hiệu ứng slide/fade, điều hướng, responsive |
| `locales/en.default.json`, `locales/vi.json` | Sửa | Chuỗi hiển thị trên storefront (nhãn ARIA, bộ đếm, nút) |
| `locales/en.default.schema.json` | Sửa | Nhãn và mô tả setting trong Theme Editor |

### Tính năng

- **Hai kiểu chuyển slide:** trượt ngang (slide) hoặc mờ dần (fade). Chỉnh được thời lượng và easing.
- **Autoplay** có nút Phát/Tạm dừng:
  - Tự dừng khi hover, khi người dùng đang thao tác bằng bàn phím, khi đang kéo, khi slider ra khỏi màn hình và khi tab trình duyệt bị ẩn.
  - Chạy tiếp từ đúng thời gian còn lại, không đếm lại từ đầu.
- **Điều hướng:**
  - Mũi tên: đặt hai bên hoặc góc dưới phải, có thể ẩn trên mobile.
  - Dot với 3 kiểu: chấm, gạch, thanh tiến trình chạy theo thời gian autoplay.
  - Bộ đếm dạng `1 / 3`.
  - Trên mobile chọn hiển thị dot, bộ đếm hoặc ẩn hết.
- **Vuốt và kéo** bằng chuột hoặc cảm ứng. Ở chế độ slide, slider chạy theo ngón tay. Cuộn dọc trang vẫn hoạt động bình thường.
- **Bàn phím:** ←/→ chuyển slide, Home/End về slide đầu/cuối.
- **Vòng lặp hoặc dừng ở slide cuối** (khi đó mũi tên ở hai đầu bị vô hiệu hoá).
- **Hiệu ứng nội dung:** fade hoặc fade-up, từng dòng xuất hiện lần lượt với độ trễ cấu hình được.
- **Theme Editor:** bấm block ở sidebar thì preview chuyển tới đúng slide đó và tạm dừng autoplay trong lúc chỉnh.

### Cấu hình

**Section** (áp dụng cho mọi slide):

| Nhóm | Setting |
|---|---|
| Layout | Độ rộng (full / page width); chiều cao desktop (adapt theo ảnh, nhỏ, vừa, lớn, full màn hình, tuỳ chỉnh 30–100vh); chiều cao mobile (tương tự, không có full màn hình); image fit (cover/contain); bo góc; lề hai bên; padding trên/dưới riêng desktop và mobile |
| Màu | Color scheme của theme |
| Typography | Font heading/body riêng (tuỳ chọn, mặc định dùng font theme); cỡ chữ heading/subheading/text riêng desktop và mobile; độ đậm, letter-spacing, line-height của heading; subheading viết hoa; thẻ heading của slide đầu (H1/H2); khoảng cách giữa các phần tử |
| Hộp nội dung | Độ rộng tối đa, padding, bo góc |
| Nút | Bo góc, độ dày viền, padding, cỡ chữ, hiệu ứng hover (đổi màu / đảo màu / gạch chân) |
| Chuyển động | Kiểu chuyển, thời lượng, easing; hiệu ứng nội dung, thời lượng, độ trễ |
| Autoplay | Bật/tắt, tốc độ 3–10s, dừng khi hover, lặp vòng, dừng hẳn khi người dùng tương tác |
| Điều hướng | Mũi tên (màu, nền, kích thước, bo góc, vị trí, ẩn trên mobile); dot (kiểu, màu, màu đang chọn, kích thước); bộ đếm; điều hướng trên mobile; vị trí cụm điều hướng (dưới giữa / trái / phải / bên ngoài slider); ngưỡng vuốt |

**Block "Slide"** (tối đa 5):

| Nhóm | Setting |
|---|---|
| Ảnh | Ảnh desktop, ảnh mobile (không bắt buộc), màu và độ đậm lớp phủ |
| Nội dung | Bật/tắt chữ; subheading, heading (inline richtext), đoạn văn (richtext) |
| Nút | 0 / 1 / 2 nút. Mỗi nút có nhãn, link, kiểu (solid / outline / link) và tuỳ chọn mở tab mới. Khi chọn 0 nút có thể đặt link cho cả slide |
| Vị trí | 9 vị trí trên desktop, 3 vị trí trên mobile; căn lề chữ riêng desktop và mobile |
| Màu riêng | Màu heading, subheading, text, nền nút, chữ nút, viền nút, hover; hộp nền phía sau nội dung (màu và độ trong suốt) |

Setting chỉ hiện khi liên quan (`visible_if`), ví dụ cài đặt nút thứ 2 chỉ hiện khi chọn 2 nút.

### Vấn đề kỹ thuật và quyết định

1. **Slider vẫn dùng được khi chưa có JavaScript.**
   - Trước khi JS chạy, track là vùng cuộn ngang có `scroll-snap`, vẫn vuốt được.
   - Khi JS khởi tạo xong, class `is-ready` được thêm vào và slider chuyển sang chế độ `transform`.
   - Mũi tên và dot bị ẩn bằng `visibility` (vẫn giữ chỗ) cho tới khi sẵn sàng, nên không bị nhảy layout.

2. **Ảnh responsive và LCP.**
   - Dùng `<picture>`: thẻ `<source>` cho ảnh mobile (≤749px), `srcset` 375–3000px.
   - `sizes` tính theo page width của theme khi section ở chế độ page width.
   - Chỉ ảnh slide đầu được tải ngay, mức ưu tiên dựa vào `section.index`:
     - Section đầu tiên dưới header (hoặc khi `section.index` là `nil`, như lúc editor render lại): `eager` + `fetchpriority="high"`.
     - Section thứ 2: `eager`.
     - Từ section thứ 3: `lazy`.
   - Mục đích: khi trang có nhiều slider, các slider phía dưới không tranh băng thông với ảnh LCP. Mỗi trang có tối đa một ảnh slider mang `fetchpriority="high"`.

3. **Chiều cao không cần JavaScript.**
   - Dùng đơn vị `svh` để tránh bị nhảy khi thanh địa chỉ trên mobile co giãn.
   - Chế độ full màn hình trừ đi chiều cao header (`--header-height` của Dawn).
   - Chế độ adapt dùng `aspect-ratio` lấy từ ảnh slide đầu, Liquid xuất sẵn ra biến CSS.

4. **Setting chuyển thành biến CSS ngay trong Liquid.**
   - Mọi giá trị cấu hình (kích thước, màu, thời lượng, easing, tốc độ autoplay) được xuất thành biến CSS inline trên section và từng slide.
   - CSS chỉ đọc biến, JS không ghi lại giá trị cấu hình nào. Mỗi giá trị chỉ có một nguồn.
   - Mỗi section có bộ biến riêng, nên nhiều slider trên một trang có thể cấu hình khác nhau mà không ảnh hưởng nhau.

5. **Autoplay quản lý bằng trạng thái thay vì cờ rời rạc.**
   - Tách hai loại dừng:
     - `userPaused`: người dùng chủ động bấm tạm dừng.
     - `suspendReasons` (một `Set`): dừng tạm thời vì `hover`, `focus`, `drag`, `offscreen`, `hidden`, `editor`.
   - Autoplay chỉ chạy khi không bị người dùng dừng và tập lý do dừng tạm thời đang rỗng. Nhờ vậy các nguyên nhân chồng nhau không làm autoplay chạy lại sai lúc.
   - Thời gian còn lại được lưu khi bị dừng tạm thời.
   - Thanh progress của dot dùng `animation-play-state: paused` nên luôn khớp với bộ đếm giờ.

6. **Accessibility theo WAI-ARIA Carousel Pattern.**
   - Ngữ nghĩa: slider là `role="region"` có `aria-roledescription`. Mỗi slide là `role="group"` với nhãn "Slide x of y".
   - Slide không hiển thị được đặt `inert` nên phím Tab và trình đọc màn hình bỏ qua link ẩn.
   - Live region chỉ thông báo khi người dùng tự chuyển slide và tắt trong lúc autoplay chạy, tránh đọc liên tục.
   - Có nút Phát/Tạm dừng theo WCAG 2.2.2. Trên thiết bị có chuột, nút này ẩn cho tới khi được focus bằng bàn phím, vì người dùng chuột đã có tính năng dừng khi hover.
   - Khi người dùng bật `prefers-reduced-motion`: autoplay mặc định tạm dừng, các transition bị tắt bằng CSS.

7. **Vuốt bằng Pointer Events.**
   - Dùng một bộ xử lý chung cho chuột, cảm ứng và bút.
   - Khoá hướng: nếu cử chỉ thiên về chiều dọc thì nhường cho trình duyệt cuộn trang (`touch-action: pan-y`).
   - Vượt ngưỡng vuốt thì chuyển slide. Kéo quá nửa ngưỡng thì chặn click, để không vô tình mở link của slide.

8. **Hiệu năng khi kéo.**
   - Biến `--cs-drag` được khai báo bằng `@property` với `inherits: false` và gán trực tiếp lên track.
   - Mỗi frame khi kéo, trình duyệt chỉ tính lại style cho một phần tử thay vì cả cây slide.
   - Trình duyệt không hỗ trợ `@property` tự quay về biến CSS thường, vẫn hoạt động đúng.

9. **Vòng đời trong Theme Editor và nhiều slider trên một trang.**
   - Custom Element tự khởi tạo khi được gắn vào trang và dọn dẹp khi bị gỡ (`AbortController` gỡ toàn bộ listener, ngắt `IntersectionObserver`, xoá timer).
   - Guard `customElements.get('custom-slider')` đảm bảo chỉ đăng ký một lần, dù script được nhúng ở nhiều section.
   - File JS cùng URL nên trình duyệt chỉ tải một lần.
   - Section chỉ có 1 slide thì không nhúng JS.

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
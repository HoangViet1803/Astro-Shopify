document.addEventListener('DOMContentLoaded', () => {
const root = document.querySelector('[data-featured-tabs]')
if (!root) return
root.querySelectorAll('[data-tab]').forEach((tab) => {
tab.addEventListener('click', () => {
root.querySelectorAll('[data-panel]').forEach((panel) => {
panel.hidden = panel.dataset.panel !== tab.dataset.tab
})
})
})
})

# Các vấn đề kỹ thuật trong đoạn code:

# 1: Chỉ khởi tạo section đầu tiên

- document.querySelector('[data-featured-tabs]') chỉ trả về phần tử khớp đầu tiên. Nếu trang có nhiều hơn 1 secrion Featured Tabs, chỉ section đầu hoạt động. Click tab ở các section còn lại không có tác dụng

# 2: Không chạy lại khi Theme Editor render lại section

- Vấn đề: Sau khi người dùng đổi setting, thêm, xoá hoặc sắp xếp lại block, hoặc thêm section mới, tab ngừng hoạt động.
- Nguyên nhân: Khi có thay đổi, Theme Editor không tải lại cả trang. Nó lấy HTML mới của section qua AJAX rồi thay thế DOM cũ. Các phần tử mới chưa được gắn event listener nào. DOMContentLoaded chỉ bắn một lần trong vòng đời trang nên sẽ không chạy lại.

Shopify cung cấp các event riêng cho trường hợp này: shopify:section:load và shopify:section:unload. Code hiện tại không lắng nghe event nào trong số đó.

# 3: Selector không được giới hạn đúng phạm vi

- Vấn đề: Nếu bên trong panel có component khác cũng dùng data-tab/data-panel (product card, tab lồng nhau), chúng sẽ bị bật/tắt nhầm.

- Nguyên nhân: root.querySelectorAll('[data-panel]') lấy mọi phần tử con cháu có thuộc tính đó.

# Cách sửa:

1. Bọc component trong Custom Element (<featured-tabs>). Mỗi section là một instance độc lập, nên nhiều section cùng loại trên một trang không ảnh hưởng nhau.

2. Khởi tạo và dọn dẹp theo vòng đời của phần tử, không dựa vào DOMContentLoaded.

- Class `featured-tabs` chỉ cần đăng ký (`customElements.define`) một lần. Sau đó, bất cứ khi nào HTML chứa `<featured-tabs>` được chèn vào DOM, trình duyệt tự gọi `connectedCallback()`. Điều này áp dụng cả khi Theme Editor thay HTML của section qua AJAX (đổi setting, thêm/xoá/sắp xếp block, thêm section mới), nên tab luôn được khởi tạo lại.
- `connectedCallback()` / `disconnectedCallback()` đóng vai trò tương đương `shopify:section:load` / `shopify:section:unload`, nhưng không cần tự lắng nghe các event này. Chúng cũng chạy được ngoài Theme Editor, ví dụ khi HTML được nạp bằng Section Rendering API.
- Các listener được gắn kèm `signal` của `AbortController` và được gỡ hết bằng `abort()` trong `disconnectedCallback()`. Khi section bị di chuyển (sắp xếp lại section), phần tử bị gỡ ra rồi gắn lại, tức là `connectedCallback()` chạy thêm lần nữa. Nếu không dọn dẹp thì listener sẽ bị gắn trùng.
- File JS được nhúng trong section, nên có thể được nạp nhiều lần (nhiều section, hoặc lúc Theme Editor thêm section mới). Lệnh kiểm tra `if (customElements.get('featured-tabs')) return;` ở đầu file ngăn việc `define` lại, vì `define` lần hai sẽ báo lỗi.
- Giữ trạng thái khi render lại: tab đang chọn được lưu theo `data-section-id` (`activeTabBySection`). Sau khi Theme Editor render lại, section mở lại đúng tab cũ thay vì luôn quay về tab đầu tiên.
- Chọn block ở sidebar Theme Editor: lắng nghe `shopify:block:select` (gắn trên `document` đúng một lần) để mở đúng tab tương ứng với block đó.

3. Giới hạn selector chặt theo cấu trúc của chính component, không quét toàn bộ con cháu.

- Panel: không dùng `querySelectorAll('[data-panel]')` nữa mà tìm đúng panel từ từng tab qua `aria-controls` → `#id`. Mỗi panel có id duy nhất theo block (`FctPanel-{{ block.id }}`), nên chỉ đúng các panel của section này bị bật/tắt.

Code trong bài: [assets/featured-collection-tabs.js](assets/featured-collection-tabs.js).

### Các bước kiểm thử hồi quy

(thao tác -> kết quả mong đợi)

## Vấn đề 1: Nhiều section trên cùng trang

- 1.1 Click tab thứ 2 ở section đầu tiên -> Section 1 chuyển sang tab 2
- 1.2 Click tab thứ 3 ở section thứ hai và thứ ba -> Mỗi section chuyển đúng tab
- 1.3 Sau bước 1.2, nhìn lại section 1 -> Section 1 vẫn ở tab 2, không bị ảnh hưởng
- 1.4 Lặp lại 1.1–1.3 ở storefront (Preview, ngoài Theme Editor) -> Kết quả giống hệt

## Vấn đề 2: Theme Editor render lại section

- 2.1 Đổi một setting của section (heading, màu, số sản phẩm…) -> Tab vẫn hoạt động
- 2.2 Thêm block mới -> Tab mới click được, mở đúng panel
- 2.3 Xoá một block -> Các tab còn lại vẫn hoạt động
- 2.4 Kéo thả sắp xếp lại thứ tự block -> Mỗi tab mở đúng panel của nó (không lệch)
- 2.5 Thêm một section Featured Tabs mới -> Section mới hoạt động ngay, section cũ không bị ảnh hưởng
- 2.6 Kéo section lên/xuống vài lần (≥3 lần) -> Tab vẫn hoạt động; click 1 lần chỉ chuyển tab 1 lần (không giật/nhảy)
- 2.7 Xoá một section rồi Undo (Ctrl/Cmd+Z) -> Section khôi phục và hoạt động bình thường
- 2.8 Trong suốt 2.1–2.7, xem Console -> Không có lỗi, đặc biệt không có lỗi kiểu 'featured-tabs' has already been defined

# Giữ trạng thái khi render lại

- 2.9 Chọn tab 3 ở section A, tab 2 ở section B, rồi đổi một setting của section A -> Section A vẫn mở tab 3 (không quay về tab 1); section B vẫn ở tab 2
- 2.10 Đang mở tab 3, xoá block của tab 3 -> Section mở về tab mặc định, không bị trống panel

# Chọn block ở sidebar

- 2.11 Ở sidebar, click vào block thứ 3 của section A -> Preview của section A tự chuyển sang tab 3; các section khác không đổi
- 2.12 Thêm block mới rồi click chọn block đó ở sidebar -> Mở đúng tab mới

## Vấn đề 3: Selector đúng phạm vi

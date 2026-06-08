# MAD Game Hub Shared

Hub tĩnh cho game chạy trên trình duyệt và sample Unity dùng cho portfolio.

Repo này ưu tiên tài liệu và trang showcase. Nó chứa trang hub công khai, source game đã giải nén, asset dùng chung, và metadata cho showcase. Source Unity của từng sample vẫn nằm ở repo ngoài, không lưu trực tiếp trong repo này.

Bản tiếng Anh: [README.md](README.md)

## Chạy nhanh

Chạy site local trên port `13000`:

```bat
run.bat
```

Sau đó mở:

```text
http://localhost:13000/
```

Script dùng HTTP server có sẵn của Python để serve thư mục `docs/`. Không cần Node.js.

## Hub game

40 game HTML nằm trong:

```text
docs/hubgames/
```

Trang chính đọc [docs/data/hub-games.json](docs/data/hub-games.json) và trỏ từng game tới file `index.html` riêng, ví dụ:

```text
http://localhost:13000/hubgames/000001_10_Ten/index.html
```

Khi publish bằng GitHub Pages từ thư mục `docs/`, link relative này vẫn chạy đúng.

## Mục tiêu dự án

- Có một hub gọn cho game chạy trên trình duyệt.
- Sẵn sàng publish lên GitHub Pages.
- Giữ phần showcase Unity rõ ràng, dễ đọc, thân thiện với người mới.
- Gom link chơi, link source, learning outcomes, và metadata về một chỗ.
- Giữ dependency nhẹ: chỉ HTML, CSS, JavaScript, JSON tĩnh.

## Cấu trúc repo

```text
mad-game-hub-shared/
  README.md
  README.VN.md
  run.bat
  AGENTS.md
  CONTRIBUTING.md
  docs/
    index.html
    PROJECT_FORMAT.md
    assets/
      hubmad.png
    hubgames/
      000001_10_Ten/
      ...
    Share001_Ludo.html
    Share002_PixelShooter3D.html
    Share003_AgeOfBattle.html
    data/
      games.json
      hub-games.json
```

Quy ước chi tiết nằm trong [docs/PROJECT_FORMAT.md](docs/PROJECT_FORMAT.md).
Quy tắc làm việc cho coding agent nằm trong [AGENTS.md](AGENTS.md).

## File dữ liệu

- [docs/data/hub-games.json](docs/data/hub-games.json): danh sách hub game.
- [docs/data/games.json](docs/data/games.json): metadata phần showcase Unity.

Mỗi hub game nên có `number`, `title`, `folder`, và `playPath` trỏ tới `hubgames/<folder>/index.html`.

## Format showcase Unity

Sample Unity dùng pattern tên:

```text
ShareNNN_GameName
```

Ví dụ:

```text
docs/Share001_Ludo.html
docs/Share002_PixelShooter3D.html
docs/Share003_AgeOfBattle.html
```

Mỗi sample Unity nên có:

- Một metadata entry trong [docs/data/games.json](docs/data/games.json)
- Một trang chi tiết trong `docs/`
- Link source repository bên ngoài hợp lệ
- Link demo nếu có
- Mô tả learning outcomes rõ ràng

## Sample Unity hiện có

| Sample | Thể loại | Độ khó | Trọng tâm | Source | Demo |
| --- | --- | --- | --- | --- | --- |
| `Share001_Ludo` | Board Game | Beginner | Logic bàn cờ theo lượt, deterministic | [GitHub](https://github.com/hoatv2211/Share001_Ludo) | [Play](https://hoatv2211.github.io/Share001_Ludo/) |
| `Share002_PixelShooter3D` | Action Shooter | Intermediate | Di chuyển, combat loop, spawn enemy, scoring | [GitHub](https://github.com/hoatv2211/Share002_PixelShooter3D) | [Play](https://hoatv2211.github.io/Share002_PixelShooter3D/) |
| `Share003_AgeOfBattle` | Strategy / Battle | Intermediate | Unit waves, positioning, combat flow, progression | [GitHub](https://github.com/hoatv2211/Share003_AgeOfBattle) | [Play](https://hoatv2211.github.io/Share003_AgeOfBattle/) |

## Thêm hub game

1. Thêm folder game vào `docs/hubgames/<folder>/`.
2. Kiểm tra game có `index.html` ở root folder.
3. Thêm entry vào [docs/data/hub-games.json](docs/data/hub-games.json).
4. Dùng `playPath` dạng `hubgames/<folder>/index.html`.
5. Chạy `run.bat` rồi test card game tại `http://localhost:13000/`.

## Thêm sample Unity

1. Thêm object mới vào [docs/data/games.json](docs/data/games.json).
2. Thêm trang chi tiết tương ứng trong `docs/`, ví dụ `docs/Share004_NewGame.html`.
3. Kiểm tra `sampleDoc`, `sourceRepo`, `liveDemo` đúng link.
4. Cập nhật bảng sample trong README khi entry sẵn sàng.
5. Giữ phần mô tả ngắn, dẫn người đọc sang repo nguồn để xem triển khai chi tiết.

## Checklist kiểm tra

Trước khi publish thay đổi:

- Chạy `run.bat` và kiểm tra `http://localhost:13000/`.
- Xác nhận [docs/data/hub-games.json](docs/data/hub-games.json) là JSON hợp lệ.
- Xác nhận mỗi folder trong `docs/hubgames/` có file `index.html`.
- Xác nhận [docs/data/games.json](docs/data/games.json) là JSON hợp lệ.
- Xác nhận link source và demo của Unity vẫn mở được.
- Tránh commit file sinh ra không liên quan hoặc Unity build artifact lớn.

## GitHub Pages

Thiết lập Pages khuyên dùng:

```text
Branch: main
Folder: /docs
```

Với cấu hình này, `docs/index.html` sẽ thành homepage và link hub game sẽ chạy qua `docs/hubgames/`.

## Đóng góp

Đọc [CONTRIBUTING.md](CONTRIBUTING.md) trước khi mở pull request.

## License

Repo này dùng Apache License 2.0. Xem [LICENSE](LICENSE).

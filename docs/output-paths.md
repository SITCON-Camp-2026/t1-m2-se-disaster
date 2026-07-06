# 成果放置路徑與 GitHub Pages 展示規則

本專案會被 build 成 GitHub Pages 網頁。學員的前端成果必須能從部署後的首頁看到或操作。

主要入口是：

```text
src/main.tsx
src/app/App.tsx
```

如果成果沒有被 `src/app/App.tsx` 使用，或沒有被 `App.tsx` 匯入的元件使用，GitHub Pages demo 就看不到它；這樣不算完成前端成果。

## 核心規則

1. 可展示成果必須接進 Vite app。
2. 主流程必須能從 GitHub Pages 首頁進入。
3. 只新增 `docs/`、`tests/`、`events/` 或未被引用的 component，不算完成前端 demo。
4. `events/**` 是外部 dirty input，不可直接當內部資料使用。
5. 若需要讓 event data 出現在 demo，請先透過 `src/adapters/` 轉換，並把 normalized result 放到 `src/fixtures/workspace/` 或由程式產生後再顯示。
6. `src/fixtures/shared/` 是 starter 內建資料，不應被小組拿來覆蓋自己的成果。
7. `src/fixtures/workspace/` 是小組整理後的 normalized data 放置位置。
8. GitHub Pages 展示前，請至少確認 `pnpm build` 能成功。

## 產物放置位置

| 產物                | 放置位置                                            | 是否必須接到 UI        | 說明                                            |
| ------------------- | --------------------------------------------------- | ---------------------- | ----------------------------------------------- |
| 主流程畫面          | `src/app/App.tsx` 或由它匯入的 component            | 是                     | GitHub Pages 首頁必須能看見或操作               |
| 新 UI 元件          | `src/components/` 或 `src/features/<feature-name>/` | 是                     | 新增後要從 `App.tsx` 接進去                     |
| 小組功能區          | `src/features/<feature-name>/`                      | 是                     | 若功能較大，可用 feature folder 管理            |
| normalized data     | `src/fixtures/workspace/`                           | 若 demo 需要使用，則是 | 小組轉換後可被 app 使用的資料                   |
| starter shared data | `src/fixtures/shared/`                              | 既有 starter 使用      | 不要把小組成果覆蓋到這裡                        |
| phase-0 dirty data  | `src/fixtures/phase-0/`                             | starter 會讀取         | 初始混亂體驗資料，不代表 clean model            |
| event dirty input   | `events/event-1535/`                                | 否                     | staff PR 釋出的外部輸入，不可直接當內部資料     |
| adapter             | `src/adapters/`                                     | 視情況                 | event injection 後通常要接到 app 或測試         |
| schema / type       | `src/contracts/`                                    | 視情況                 | 可擴充 family schema，不可任意改 `CommonRecord` |
| 測試                | `tests/`                                            | 否                     | 用來驗證 schema、adapter、UI 行為               |
| spec                | `docs/spec.md`                                      | 否                     | 說明需求與完成條件（AC），但不能取代 demo       |
| data contract       | `docs/data-contract.md`                             | 否                     | 說明資料輸入輸出與 schema 取捨                  |
| decision log        | `docs/decisions.md`                                 | 否                     | 記錄重大工程取捨                                |
| AI log              | `docs/ai-log.md`                                    | 否                     | 記錄 AI 協作與人類判斷                          |
| handoff             | `docs/handoff.md`                                   | 否                     | 交接說明，不能取代 demo                         |

## 常見不算完成的情況

以下都不算完成前端成果：

- 新增了 component，但沒有被 `App.tsx` 匯入或 render。
- 新增了 fixture，但 UI 沒有使用。
- 寫了 adapter，但沒有測試，也沒有讓 demo 使用轉換結果。
- 只更新 `docs/spec.md`，但 Build Sprint 階段沒有任何可操作畫面。
- 只把 event data 放進 `events/`，但沒有轉換、標示不確定性或接到 UI。
- 本機某個檔案存在，但 GitHub Pages 首頁看不到。

## 建議開發流程

```text
讀 task card
  → 找到資料來源
  → 更新 spec / data contract
  → 寫 adapter 或整理 workspace fixture
  → 接進 App.tsx / component
  → 補測試
  → pnpm build
  → 確認 GitHub Pages 首頁可展示
```

## Demo 檢核點

交付前請回答：

- [ ] 打開 GitHub Pages 首頁，是否能看到本階段成果？
- [ ] 使用者是否能看出資料來源與查核狀態？
- [ ] 不確定資料是否被清楚標示？
- [ ] event input 是否沒有被直接當成 verified data？
- [ ] `docs/data-contract.md` 是否說明資料如何進入 UI？
- [ ] `docs/decisions.md` 是否記錄重要取捨？
- [ ] `docs/ai-log.md` 是否記錄重要 AI 協作？

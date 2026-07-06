# Build Sprint 1：完成主流程

## 時間

13:50–15:20

## 你現在拿到的來源

- `docs/spec.md`
- `docs/data-contract.md`
- `docs/output-paths.md`
- `src/contracts/`
- `src/fixtures/shared/`
- staff 10:50 釋出的 `src/fixtures/released/1050/`

## 你要做什麼

根據已鎖定的 spec，完成一條可操作的主流程前端 demo。

先做最小形狀：一個列表或表格、一個 detail / action 區塊、清楚的狀態 badge。

最低要求：

1. 使用 normalized fixtures
2. 預設使用既有 schema；只有 decision 說明缺少 domain meaning 時才擴充 family schema
3. 顯示 source、status、updatedAt
4. 顯示至少 3 種狀態，且每種狀態有簡短原因
5. UI 對應至少 2 條完成條件（AC）
6. 至少 1 個測試
7. `pnpm build` 後首頁看得到成果

如果 shared / released fixtures 不足以展示完成條件、狀態或 failure case，請補 `src/fixtures/workspace/` 的 normalized mock data，並在 `docs/data-contract.md` 說明。不要只渲染少量 starter rows 就算完成。

## 成果放哪裡

- UI：`src/app/App.tsx`、`src/components/` 或 `src/features/`
- data：`src/fixtures/shared/`、`src/fixtures/released/1050/` 或 `src/fixtures/workspace/`
- adapter：`src/adapters/`，只做純 TypeScript 轉換函式
- test：`tests/`
- docs：`docs/spec.md`、`docs/data-contract.md`、`docs/decisions.md`、`docs/ai-log.md`

新增檔案要被畫面、函式或測試使用；不要留下孤兒檔。

## 不做什麼

- 不擴大 scope
- 不接外部 API、後端、登入、地圖 SDK、geocoding、routing
- 不把 `events/**` 當內部資料
- 不隨意改 `CommonRecord`
- 不改 Vite、Pages 或 deploy 設定，除非 build 明確壞掉

## 可以怎麼使用 Coding Agent

請 Agent 先列出：要改的檔案、demo render path、測試、資料來源、哪些不做。確認後再實作。

第一次寫測試時，先請 Agent 寫 schema validation test 或畫面 render test，再跑 `pnpm test`。

## 必須交付

- [ ] 主流程可操作
- [ ] 首頁能看到主流程
- [ ] 至少 2 條完成條件（AC）可展示，並寫出畫面 / path / 測試或文件
- [ ] UI 顯示 source / status / updatedAt
- [ ] 若有補 workspace data，文件說明它支援哪個完成條件或狀態
- [ ] 至少 1 個測試
- [ ] `pnpm build` 成功
- [ ] 一個 commit，建議訊息：`Implement main flow`

## 停止條件

15:10 後停止新增主要功能，只修 demo blocker、補文件或準備 event injection。

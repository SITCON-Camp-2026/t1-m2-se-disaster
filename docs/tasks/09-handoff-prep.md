# Handoff Prep：準備交接

## 時間

18:20–18:40

## 你現在拿到的來源

- `docs/spec.md`
- `docs/data-contract.md`
- `docs/output-paths.md`
- `docs/decisions.md`
- `docs/handoff.md`
- repo code
- demo 或本機 build 結果
- event injection response

## 你要做什麼

整理 repo，讓另一組能在有限時間內接手。

`docs/handoff.md` 請寫清楚：

1. 如何啟動專案
2. demo URL 或本機入口
3. 主流程從哪裡進入
4. 資料從哪裡進來
5. 目前完成哪些完成條件（AC）
6. 已知問題與限制
7. 哪些地方不能自動推論，必須保留人工確認或 `needs_review`
8. 下一位接手者可以做的一個小任務，且要來自未完成條件、已知限制或 feedback

## 成果放哪裡

- 交接文件：`docs/handoff.md`
- 若啟動方式或 demo 入口有變：`README.md`
- 若 demo 沒接上成果，只做最小修正到 `src/app/App.tsx`、`src/components/` 或 `src/features/`

## 不做什麼

- 不新增功能
- 不重寫 README 成完整報告
- 不隱藏未完成事項
- 不只寫「請看 code」，要指出具體路徑
- 不新增 Docker Compose、Makefile、Nginx 設定或替代部署方式

## 必須交付

- [ ] `docs/handoff.md` 完成
- [ ] 寫出 demo 入口與 render path
- [ ] 寫出主流程、fixture / adapter、test、known limits
- [ ] `README.md` 若有啟動方式變更，需要更新
- [ ] `docs/spec.md` 標記已完成與未完成的完成條件
- [ ] `docs/decisions.md` 至少有重要決策
- [ ] 記錄最後驗證結果，例如 `pnpm build: pass`
- [ ] 一個 commit，建議訊息：`Prepare handoff`

## 停止條件

18:40 停止整理，進入 Handoff Challenge。

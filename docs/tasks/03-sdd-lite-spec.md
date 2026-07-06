# SDD-lite：寫出元件規格

## 時間

11:10–12:00

## 你現在拿到的來源

- `docs/spec.md`
- `docs/data-contract.md`
- `docs/user-flow.md`
- `docs/output-paths.md`
- `docs/phase0-observations.md`
- staff 10:50 釋出的 focus card / family brief / baseline fixtures

## 你要做什麼

把 Phase 0 的混亂經驗收斂成一個可開發、可展示、可交接的前端元件 spec。

先寫清楚：

```text
Task line: Line A / Line B / Line C
Core model: Report / Site + SiteStatusReport / Task + Assignment
```

spec 至少包含：

1. 問題一句話
2. 使用者與責任角色
3. 主要操作流程
4. input / output contract
5. 狀態
6. 完成條件（Acceptance Criteria，簡稱 AC），請編號成 `AC-1`
7. out of scope
8. failure / uncertain cases
9. human confirmation points
10. demo path

roles 是 demo 裡的責任視角，不是登入、權限或帳號系統。output 若只是 UI 顯示，也要明說。

每條完成條件（AC）都要想一下：需要哪種資料才看得出來？如果 starter fixture 太少，請在 data contract 寫出下午需要補哪些 workspace mock data。

## 成果放哪裡

- `docs/spec.md`
- `docs/data-contract.md`
- `docs/user-flow.md`
- `docs/decisions.md`
- `docs/ai-log.md`

若已知道下午會改哪些 UI / data / test，也寫進 spec 或 data contract。

## 不做什麼

- 不繼續堆 Phase 0 UI
- 不做完整災害平台、後端、登入、地圖、部署流程、Docker、CI/CD
- 不改 `CommonRecord`
- 不提前處理尚未釋出的 event injection
- 不把 input / output contract 設計成 HTTP API 或資料庫

## 可以怎麼使用 Coding Agent

可以請 Agent 產生 spec 草稿，但 scope 和取捨由小組決定。請它標出：

1. 哪些會出現在前端 demo
2. 哪些只是文件或測試
3. 哪些資料會進 `src/fixtures/workspace/`

## 必須交付

- [ ] `docs/spec.md` 完成初稿
- [ ] `docs/data-contract.md` 寫出 input / output
- [ ] `docs/user-flow.md` 有主流程
- [ ] spec 寫清楚 demo 入口
- [ ] 至少 4 條完成條件（AC），例如 `AC-1`
- [ ] 至少 3 個 failure / uncertain cases
- [ ] 寫出哪些資料情境會用來展示完成條件
- [ ] `docs/ai-log.md` 紀錄 AI 協作

## 停止條件

12:00 前停止討論新功能。交出可照著開發與驗證的 spec 草稿。

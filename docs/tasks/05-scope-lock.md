# Scope Lock

## 時間

13:30–13:50

## 你現在拿到的來源

- `docs/spec.md`
- `docs/data-contract.md`
- `docs/output-paths.md`
- `docs/decisions.md`
- Spec 市集回饋
- mentor feedback

## 你要做什麼

鎖定下午只做一條主流程，並寫清楚不做什麼。

請決定：

1. 我們只做哪一條主流程？
2. 哪些功能今天不做？
3. 哪些 schema 欄位是必須？
4. 哪些狀態一定要呈現？
5. 哪些資料不能自動判斷？
6. 下午主要修改哪些檔案？
7. demo 從哪個入口看到成果？
8. workspace data 要放哪裡？

一條主流程可以是：列表 → 點一筆資料 → 看狀態與來源 → 標示需要人工確認。

## 成果放哪裡

- `docs/spec.md`
- `docs/data-contract.md`
- `docs/decisions.md`

scope lock decision 要寫出 UI entry、data path、test target 和 out of scope。

## 不做什麼

- 不新增第二條主流程
- 不把所有想做的功能都放進 scope
- 不為了漂亮 UI 犧牲資料契約
- 不讓 AI 決定 scope
- 不做登入、安全工具、地圖服務、GitHub workflow 或 issue automation

## 必須交付

- [ ] `docs/spec.md` 有明確 `In scope`
- [ ] `docs/spec.md` 有明確 `Out of scope`
- [ ] `docs/data-contract.md` 有 input / output
- [ ] `docs/decisions.md` 有一筆 scope lock decision
- [ ] 建立 3 到 5 個 issue 或 checklist item

每個 task 至少寫：完成條件（AC）、資料來源、可能修改檔案、demo 會看到什麼、今天不做什麼。

## 停止條件

13:50 後不再換題，不再新增主要功能。進入 Build Sprint 1。

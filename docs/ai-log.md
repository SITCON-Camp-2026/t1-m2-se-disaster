# AI Log

這份紀錄用來留下小組如何使用 AI / Coding Agent 的操作脈絡。重點不是逐字保存所有對話，而是記錄重要協作、取捨與人類判斷。

## 什麼時候要記錄

請在以下情況更新本檔案：

- AI 協助分析原始資訊。
- AI 協助找出不能判斷處。
- AI 協助判斷哪些資訊不能直接相信。
- AI 協助判斷哪些資訊不能直接變成任務。
- AI 協助修改畫面標示或前端工作台。
- AI 可能補了原文沒有的資訊。
- AI 建議被小組拒絕，且拒絕原因和安全 / 正確性 / scope 有關
- AI 輸出可能造成誤導，例如把未確認資料寫成已確認事實

## 不需要記錄

- 不需要逐字貼完整對話
- 不需要記錄每一次小型 autocomplete
- 不需要記錄單純修 typo 或格式化

## 紀錄格式

| 時間 | 階段 | 任務 | AI / Agent 建議 | 採用 / 拒絕 | 人類判斷理由 | 相關檔案 / commit |
| ---- | ---- | ---- | --------------- | ----------- | ------------ | ----------------- |
|      |      |      |                 |             |              |                   |

## 範例

| 時間  | 階段       | 任務                                 | AI / Agent 建議                                                                                                   | 採用 / 拒絕        | 人類判斷理由                                                                                                     | 相關檔案 / commit                                                                                                                                                   |
| ----- | ---------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 09:45 | Phase 0    | 分析原始資訊                         | 建議把社群貼文直接轉成 verified report                                                                            | 拒絕               | 社群貼文來源未確認，應保持 `needs_review`                                                                        | `docs/phase0-observations.md`                                                                                                                                       |
| 11:20 | Phase 0    | UI 文案調整                          | 將表單欄位「需要志工特長」改為「建議志工特長」，並簡化 hero 標題                                                  | 採用               | 使用者要求直接改文案，且改動僅屬 UI 顯示，依然保持資料判斷原則不變                                               | `docs/ai-log.md`, `src/app/App.tsx`, `src/features/phase-0/TrustAssessmentPage.tsx`, `tests/app-smoke.test.tsx`, commit `c713b48`                                   |
| 13:51 | Release 01 | 使用 sub-agent 模擬三種 persona 訪談 | 三個 sub-agent 分別指出回報者、資訊整理者、行動者都可能把「任務欄」「高可信度」「可直接使用」誤讀成可派工或已查核 | 採用為需求分析草稿 | 這些回饋具體對應目前 Phase 0 畫面，但仍是 AI 模擬訪談，不是最終人類決策；採用它們來修正訪談紀錄與 v1 取捨草稿    | `docs/interview-notes.md`, `docs/interview-summary.md`, `docs/decisions.md`, `docs/ai-log.md`                                                                       |
| 13:51 | Release 01 | 判斷 v1 是否應繼續強化任務欄         | AI 回饋顯示任務欄可能讓使用者以為可以直接行動                                                                     | 部分採用           | 採用風險判斷，但不直接決定實作；先記錄為 v1 需要人類確認的取捨，後續再決定移除、改名或降級任務欄                 | `docs/interview-summary.md`, `docs/decisions.md`                                                                                                                    |
| 14:10 | Release 01 | 整理使用者訪談                       | 建議把三個 persona 的回饋統整成一份完整需求摘要與 v1 決策草稿                                                     | 採用               | 這一步是文件整理與需求分析，AI 的草稿有助於快速形成結構，但仍由人類刪改與確認                                    | `docs/interview-notes.md`, `docs/interview-summary.md`, `docs/decisions.md`                                                                                         |
| 14:20 | Release 01 | 判斷是否把不確定資訊轉成任務草稿     | 建議把未確認資訊直接放進任務欄                                                                                    | 拒絕               | 這會把「線索」誤當作「可執行任務」，與本階段的安全原則衝突                                                       | `docs/interview-summary.md`, `docs/decisions.md`                                                                                                                    |
| 15:10 | Release 01 | 補充災民填表與審核回覆決策           | 建議把使用者補充整理成「表單要簡潔」「生命安全情境需備註」「審核成功不等於派工」三個決策重點                      | 採用               | 這些補充讓 v1 更貼近最終受益者災民，同時保留人工審核邊界，避免把送出或審核狀態誤顯示成已派工                     | `docs/decisions.md`, `docs/ai-log.md`                                                                                                                               |
| 16:25 | Release 02 | 依 flow design kit 繪製 v1 流程圖    | 建議把流程拆成原始回報、審核中、需要補充、暫時不能處理、候選行動，並標示 AI 只能提示風險不能派工                  | 採用               | 這讓流程從原始資訊開始，保留人工確認點與不能自動處理分支，也避免把「審核成功」誤寫成「已派工」                   | `docs/flow.md`, `docs/ai-log.md`                                                                                                                                    |
| 17:04 | Release 03 | 依 v1 流程實作前端工作台             | 將 `/v1/` 做成簡潔求助表單、人工審核佇列、狀態摘要與流程邊界提示；AI 只顯示缺漏與風險提示草稿                     | 採用               | 實作對齊 `docs/flow.md`，仍只使用 Phase 0 原始資訊與本頁暫存草稿，不新增後端、資料庫、外部 API 或 runtime LLM    | `src/app/App.tsx`, `src/features/v1/V1FlowWorkbench.tsx`, `src/styles/global.css`, `tests/app-smoke.test.tsx`, `docs/ai-log.md`                                     |
| 17:39 | Release 03 | 調整 v1 審核工作流                   | 將 `/v1/` 改成資訊整理者專用：新增資料先進審核中，點選審核中任務回填表單，編修後送出審核才進正式任務欄            | 採用               | 使用者明確要求正式任務必須由資訊整理者審核後才出現，因此移除「直接候選行動」的操作，保留未派工邊界               | `src/features/v1/V1FlowWorkbench.tsx`, `src/styles/global.css`, `tests/app-smoke.test.tsx`, `docs/ai-log.md`                                                        |
| 17:52 | Release 03 | 串接災民表單到 v1 審核中             | 將可信度判斷頁的災民現場回報改成送審表單，資料先進「審核中」，v1 資訊整理者審核後才建立正式任務                   | 採用               | 使用者指出「審核中」應該代表災民表單送出後等待可信度判斷，不是直接輸出任務；因此改成共享送審狀態並保留未派工標示 | `src/app/App.tsx`, `src/features/phase-0/TrustAssessmentPage.tsx`, `src/features/v1/V1FlowWorkbench.tsx`, `src/features/v1/v1-types.ts`, `tests/app-smoke.test.tsx` |
| 18:34 | Release 03 | 清空首頁整理工作台分頁               | 移除首頁「整理工作台」分頁內的 Phase 0 整理介面，並拿掉原始資訊卡片的「送到整理工作台」操作                       | 採用               | 使用者明確要求刪掉整理工作台內容；保留原始資訊、可信度判斷與 v1 審核流程，避免清空後仍有按鈕導向空分頁           | `src/app/App.tsx`, `src/features/phase-0/Phase0RawInfoPanel.tsx`, `tests/app-smoke.test.tsx`, `docs/ai-log.md`                                                      |
| 20:12 | Release 03 | 移除整理工作台分頁選項               | 將首頁分頁列中的「整理工作台」選項完全移除，只保留「原始資訊」與「可信度判斷」                                    | 採用               | 使用者明確要求刪掉選項；先前已清空內容，這次同步移除入口，避免出現空分頁                                         | `src/app/App.tsx`, `tests/app-smoke.test.tsx`, `docs/ai-log.md`                                                                                                     |
| 20:16 | Release 03 | 移除 v1 流程階段列                   | 刪除 `/v1/` 頁面上方的「原始求助、審核中、表單編修、送出審核、正式任務欄」流程條                                  | 採用               | 使用者指出該區塊需要移除；保留實際審核功能與狀態摘要，不改變人工審核邊界                                         | `src/features/v1/V1FlowWorkbench.tsx`, `src/styles/global.css`, `docs/ai-log.md`                                                                                    |
| 20:22 | Release 03 | 增加 v1 編修刪除功能                 | 在 v1 編修表單載入審核中資料後，新增「刪除審核中資料」操作，刪除只移出審核佇列，不建立正式任務                    | 採用               | 使用者要求在編修處增加刪除；此操作不修改 Phase 0 原始資料，也不把未確認資料標成已確認                            | `src/app/App.tsx`, `src/features/v1/V1FlowWorkbench.tsx`, `src/styles/global.css`, `tests/app-smoke.test.tsx`, `docs/ai-log.md`                                     |

## 課後反思

### AI 幫助最大的地方

-

### AI 最容易誤導的地方

-

### 下次使用 AI 開發前，我們會先準備

-

# Build Sprint Prompt

```text
請閱讀 docs/spec.md、docs/data-contract.md、docs/output-paths.md、src/contracts/，以及目前可用的 normalized fixtures。

請根據完成條件（Acceptance Criteria，簡稱 AC）幫我們實作主流程 UI。

限制：
- 不新增後端
- 不使用 localStorage
- 不呼叫外部 API
- 不修改 CommonRecord
- 使用 src/fixtures/released/1050/ 或 src/fixtures/shared/ 的 normalized data
- 小組整理後的 normalized data 放在 src/fixtures/workspace/
- 每個畫面狀態都要能對應一條完成條件（AC）
- needs_review / unverified 必須清楚呈現，不可看起來像 verified
- 可展示成果必須接進 src/app/App.tsx 或由 App.tsx 匯入的 component / feature
- 不要新增未被使用的 component、fixture 或 adapter

請先列出：
1. 你會修改哪些檔案
2. 每個檔案為什麼要改
3. 哪些完成條件（AC）會被滿足
4. UI 從 src/app/App.tsx 如何進入
5. 哪些資料會放在 src/fixtures/workspace/
6. 哪些成果會出現在 GitHub Pages demo，哪些只屬於文件或測試

等小組確認後再開始實作。
```

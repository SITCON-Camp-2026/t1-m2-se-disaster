import { type FormEvent, type MouseEvent, useMemo, useState } from "react";
import { SourceLabel } from "../../components/SourceLabel";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime } from "../../lib/date";
import type { Phase0MessyRecord } from "../phase-0/phase0-types";
import type { V1ReviewItem } from "./v1-types";

const commonSituations = [
  "需要食物或飲水",
  "需要醫療協助",
  "受困或失聯",
  "需要交通協助",
  "需要住宿",
  "需要清理協助",
  "其他",
];

const supportTypes = [
  "一般志工",
  "醫療人員",
  "水電或修繕人員",
  "交通接送",
  "心理支持",
  "不確定",
];

function inferLifeSafety(rawText: string) {
  return (
    rawText.includes("藥") ||
    rawText.includes("醫療") ||
    rawText.includes("受困") ||
    rawText.includes("失聯")
  );
}

function createHints(item: V1ReviewItem): string[] {
  const hints: string[] = [];
  const rawText = item.rawText;

  if (
    rawText.includes("不知道") ||
    rawText.includes("不確定") ||
    rawText.includes("尚未")
  ) {
    hints.push("內容明確出現不確定，需要人工確認。");
  }

  if (
    rawText.includes("附近") ||
    rawText.includes("後面") ||
    rawText.includes("老街") ||
    item.location.trim() === ""
  ) {
    hints.push("地點可能不完整，不能直接派工。");
  }

  if (item.sourceType === "social_post" || item.sourceType === "phone_call") {
    hints.push("來源可能是轉述，需保留原文並確認當事人狀況。");
  }

  if (item.lifeSafety && item.note.trim() === "") {
    hints.push("標示生命安全，但缺少備註，不能只靠選項判斷。");
  }

  if (hints.length === 0) {
    hints.push("可進入人工審核；審核成功仍不等於已派工。");
  }

  return hints;
}

function createSubmissionText(
  situation: string,
  supportType: string,
  location: string,
  duration: string,
  note: string,
  lifeSafety: boolean,
) {
  const locationText = location.trim() || "未填寫明確地點";
  const durationText = duration.trim() || "未填寫受困或等待時間";
  const noteText = note.trim() || "沒有補充備註";
  const safetyText = lifeSafety ? "涉及生命安全" : "未標示生命安全";

  return `${situation}；需要：${supportType}；位置：${locationText}；時間：${durationText}；${safetyText}；備註：${noteText}`;
}

function createFixtureItem(record: Phase0MessyRecord): V1ReviewItem {
  return {
    id: record.id,
    rawText: record.rawText,
    situation: "其他",
    supportType: "不確定",
    location: "",
    duration: "",
    note: record.rawText,
    lifeSafety: inferLifeSafety(record.rawText),
    sourceType: record.sourceType,
    verificationStatus: record.verificationStatus,
    updatedAt: record.updatedAt,
    originLabel: "Phase 0 原始資訊",
  };
}

function createEmptyForm() {
  return {
    situation: commonSituations[0],
    supportType: supportTypes[0],
    location: "",
    duration: "",
    note: "",
    lifeSafety: false,
  };
}

type V1FlowWorkbenchProps = {
  records: Phase0MessyRecord[];
  pendingSubmissions: V1ReviewItem[];
  approvedTasks: V1ReviewItem[];
  onSubmitForReview: (item: V1ReviewItem) => void;
  onApproveTask: (item: V1ReviewItem) => void;
  onDeleteReviewItem: (itemId: string) => void;
  onBackToPhase0?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function V1FlowWorkbench({
  records,
  pendingSubmissions,
  approvedTasks,
  onSubmitForReview,
  onApproveTask,
  onDeleteReviewItem,
  onBackToPhase0,
}: V1FlowWorkbenchProps) {
  const [form, setForm] = useState(createEmptyForm);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [closedReviewIds, setClosedReviewIds] = useState<string[]>([]);

  const fixtureItems = useMemo(() => records.map(createFixtureItem), [records]);

  const pendingItems = [...pendingSubmissions, ...fixtureItems].filter(
    (item) => !closedReviewIds.includes(item.id),
  );
  const selectedItem =
    pendingItems.find((item) => item.id === selectedItemId) ?? null;

  function updateForm<Key extends keyof typeof form>(
    key: Key,
    value: (typeof form)[Key],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  }

  function resetForm() {
    setForm(createEmptyForm());
    setSelectedItemId(null);
  }

  function loadForReview(item: V1ReviewItem) {
    setSelectedItemId(item.id);
    setForm({
      situation: item.situation,
      supportType: item.supportType,
      location: item.location,
      duration: item.duration,
      note: item.note,
      lifeSafety: item.lifeSafety,
    });
  }

  function createItemFromForm(id: string, originLabel: string): V1ReviewItem {
    const rawText = createSubmissionText(
      form.situation,
      form.supportType,
      form.location,
      form.duration,
      form.note,
      form.lifeSafety,
    );

    return {
      id,
      rawText,
      situation: form.situation,
      supportType: form.supportType,
      location: form.location,
      duration: form.duration,
      note: form.note,
      lifeSafety: form.lifeSafety,
      sourceType: "v1_form_draft",
      verificationStatus: "needs_review",
      updatedAt: new Date().toISOString(),
      originLabel,
    };
  }

  function closeReviewItem(itemId: string) {
    setClosedReviewIds((currentIds) =>
      currentIds.includes(itemId) ? currentIds : [...currentIds, itemId],
    );
  }

  function deleteSelectedItem() {
    if (!selectedItem) {
      return;
    }

    onDeleteReviewItem(selectedItem.id);
    closeReviewItem(selectedItem.id);
    resetForm();
  }

  function submitToPending(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedItem) {
      const approvedTask = createItemFromForm(
        selectedItem.id,
        "資訊整理者審核後任務",
      );
      onApproveTask(approvedTask);
      closeReviewItem(selectedItem.id);
      resetForm();
      return;
    }

    const v1SubmissionCount = [...pendingSubmissions, ...approvedTasks].filter(
      (item) => item.id.startsWith("V1-"),
    ).length;
    const id = `V1-${String(v1SubmissionCount + 1).padStart(3, "0")}`;
    const pendingItem = createItemFromForm(id, "資訊整理者新增求助");
    onSubmitForReview(pendingItem);
    resetForm();
  }

  return (
    <section className="v1-page" aria-labelledby="v1-title">
      <div className="v1-hero">
        <p className="eyebrow">v1 流程工作台</p>
        <h1 id="v1-title">從原始求助到人工審核</h1>
        <p>
          這個畫面專門給資訊整理者使用。新增或載入災民求助後，資料會先留在審核中；整理者修改並送出審核後，才會進入正式任務欄。
        </p>
        <a href="/" className="v1-back-link" onClick={onBackToPhase0}>
          回到災害資訊整理工作台
        </a>
      </div>

      <div className="v1-summary-grid" aria-label="審核狀態摘要">
        <div>
          <dt>審核中</dt>
          <dd>{pendingItems.length} 筆</dd>
        </div>
        <div>
          <dt>正在編修</dt>
          <dd>{selectedItem ? selectedItem.id : "無"}</dd>
        </div>
        <div>
          <dt>正式任務</dt>
          <dd>{approvedTasks.length} 筆</dd>
        </div>
        <div>
          <dt>派工狀態</dt>
          <dd>未派工</dd>
        </div>
      </div>

      <div className="v1-triage-layout">
        <section className="v1-card" aria-labelledby="intake-title">
          <h2 id="intake-title">
            {selectedItem ? `編修 ${selectedItem.id}` : "新增災民求助"}
          </h2>
          <p>
            資訊整理者可以先輸入災民需求，或點選審核中任務後回填到這份表單。送出審核後才會正式進入任務欄。
          </p>

          <form className="intake-form" onSubmit={submitToPending}>
            <label className="field">
              <span>災民現在遇到的困難</span>
              <select
                value={form.situation}
                onChange={(event) =>
                  updateForm("situation", event.target.value)
                }
              >
                {commonSituations.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>需要哪一類協助</span>
              <select
                value={form.supportType}
                onChange={(event) =>
                  updateForm("supportType", event.target.value)
                }
              >
                {supportTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>大概位置或附近線索</span>
              <input
                value={form.location}
                onChange={(event) => updateForm("location", event.target.value)}
                placeholder="例如：老街附近、車站東側、溪邊第二排"
              />
            </label>

            <label className="field">
              <span>受困或等待協助多久</span>
              <input
                value={form.duration}
                onChange={(event) => updateForm("duration", event.target.value)}
                placeholder="例如：約 2 小時、今天早上開始"
              />
            </label>

            <label className="v1-check">
              <input
                checked={form.lifeSafety}
                type="checkbox"
                onChange={(event) =>
                  updateForm("lifeSafety", event.target.checked)
                }
              />
              <span>這件事可能和生命安全有關</span>
            </label>

            <label className="field">
              <span>災民原始描述與整理備註</span>
              <textarea
                value={form.note}
                onChange={(event) => updateForm("note", event.target.value)}
                placeholder="請保留災民原意；如果地點不完整、有人受困、需要醫療或專業人員，請補充細節。"
                rows={6}
              />
            </label>

            <div className="v1-form-actions">
              <button type="submit" className="submit-button">
                {selectedItem ? "送出審核並建立正式任務" : "送到審核中"}
              </button>
              {selectedItem ? (
                <button type="button" onClick={resetForm}>
                  取消編修
                </button>
              ) : null}
              {selectedItem ? (
                <button
                  type="button"
                  className="v1-danger-button"
                  onClick={deleteSelectedItem}
                >
                  刪除審核中資料
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="v1-card" aria-labelledby="pending-title">
          <h2 id="pending-title">審核中</h2>
          <p>
            新增的求助和 Phase 0
            原始資訊都先停在這裡。點選任務後，表單會出現災民輸入或原始描述，資訊整理者可以修改後送出審核。
          </p>

          <div className="v1-review-list">
            {pendingItems.map((item) => (
              <article className="v1-review-card" key={item.id}>
                <div className="v1-review-card__header">
                  <div>
                    <p className="eyebrow">{item.originLabel}</p>
                    <h3>{item.id}</h3>
                  </div>
                  <span className="v1-state">審核中</span>
                </div>

                <p>{item.rawText}</p>

                <div className="v1-meta">
                  {item.sourceType === "v1_form_draft" ? (
                    <span className="source-label">本頁表單草稿</span>
                  ) : item.sourceType === "survivor_form" ? (
                    <span className="source-label">災民表單送審</span>
                  ) : (
                    <SourceLabel sourceType={item.sourceType} />
                  )}
                  <StatusBadge status={item.verificationStatus} />
                  <span>更新：{formatDateTime(item.updatedAt)}</span>
                </div>

                <div className="v1-hints">
                  <h4>AI 風險提示草稿</h4>
                  <ul>
                    {createHints(item).map((hint) => (
                      <li key={hint}>{hint}</li>
                    ))}
                  </ul>
                </div>

                <div className="v1-actions">
                  <button type="button" onClick={() => loadForReview(item)}>
                    載入表單審核
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="v1-card" aria-labelledby="formal-task-title">
          <h2 id="formal-task-title">正式任務欄</h2>
          <p>
            只有資訊整理者編修並送出審核後，任務才會出現在這裡。這仍不代表已派工。
          </p>

          {approvedTasks.length === 0 ? (
            <div className="trust-page__empty">
              目前沒有正式任務，請先從審核中載入一筆資料並送出審核。
            </div>
          ) : (
            <ul className="task-list">
              {approvedTasks.map((task) => (
                <li className="task-card" key={task.id}>
                  <div className="task-card__header">
                    <strong>{task.situation}</strong>
                    <span>審核完成</span>
                  </div>
                  <span className="task-priority">正式任務，尚未派工</span>
                  <p>{task.rawText}</p>
                  <dl className="task-card__meta">
                    <div>
                      <dt>需要的協助</dt>
                      <dd>{task.supportType}</dd>
                    </div>
                    <div>
                      <dt>地點線索</dt>
                      <dd>{task.location || "未填寫"}</dd>
                    </div>
                    <div>
                      <dt>受困或等待時間</dt>
                      <dd>{task.duration || "未填寫"}</dd>
                    </div>
                    <div>
                      <dt>生命安全</dt>
                      <dd>{task.lifeSafety ? "可能相關" : "未標示"}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="v1-card v1-notes" aria-labelledby="boundary-title">
        <h2 id="boundary-title">流程邊界</h2>
        <ul>
          <li>審核中資料不會出現在正式任務欄。</li>
          <li>送出審核只代表資訊整理完成，不代表已派工。</li>
          <li>資訊整理者可以修改內容，但必須保留災民原意。</li>
          <li>本頁不新增後端、不呼叫外部 API、不使用 runtime LLM。</li>
        </ul>
      </section>
    </section>
  );
}

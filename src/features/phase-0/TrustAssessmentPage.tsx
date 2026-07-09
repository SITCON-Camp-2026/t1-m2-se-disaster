import { type FormEvent, useState } from "react";
import type { V1ReviewItem } from "../v1/v1-types";
import type { Phase0MessyRecord } from "./phase0-types";
import {
  hasInternalContrast,
  hasUncertaintyLanguage,
  hasVagueLocationLanguage,
  isSecondHandSource,
  mentionsThirdPartyRelay,
} from "./phase0-signals";

type TrustLevel = "high" | "medium" | "low";

type TrustAssessment = {
  level: TrustLevel;
  label: string;
  summary: string;
  reasons: string[];
  canUseDirectly: boolean;
  canBecomeTask: boolean;
  nextStep: string;
  record: Phase0MessyRecord;
};

function assessTrust(record: Phase0MessyRecord): TrustAssessment {
  const reasons: string[] = [];
  let level: TrustLevel = "low";
  let label = "不建議直接採用";
  let summary = "目前仍屬待確認訊息，不能直接當作任務依據。";
  let canUseDirectly = false;
  const canBecomeTask = false;
  let nextStep = "請先由現場確認或查出更完整來源。";

  if (record.verificationStatus === "verified") {
    level = "medium";
    label = "可作為線索";
    summary = "這筆資訊已被標記為查核，但仍要確認現場狀況是否還有效。";
    canUseDirectly = true;
    nextStep = "再確認現場與時間是否仍然有效。";
  } else if (record.sourceType === "official_notice") {
    level = "medium";
    label = "可作為線索";
    summary = "來源看似正式，但還缺少公告時間、有效性與最新狀態的佐證。";
    canUseDirectly = true;
    nextStep = "確認公告是否仍在有效期間。";
  } else if (record.sourceType === "field_report") {
    level = "medium";
    label = "需人工確認";
    summary = "來自現場回報，內容有價值，但仍需核對地點與時效。";
    nextStep = "由現場志工或聯絡窗口確認地點與狀態。";
  } else if (record.sourceType === "volunteer_update") {
    level = "medium";
    label = "需人工確認";
    summary = "志工更新有現場脈絡，但仍需要確認是否為最新資訊。";
    nextStep = "請確認更新時間與是否仍然適用。";
  } else if (
    record.sourceType === "social_post" ||
    record.sourceType === "phone_call"
  ) {
    level = "low";
    label = "不建議直接採用";
    summary = "社群或口述來源容易受到轉述、時效與情緒影響。";
    nextStep = "先由正式來源或現場確認後再判斷。";
  }

  if (record.rawText.includes("確認") || record.rawText.includes("現場更新")) {
    reasons.push("內容提到確認或現場更新，顯示有現場脈絡。");
  }

  if (hasUncertaintyLanguage(record.rawText)) {
    reasons.push("訊息仍有缺口，例如時間、地點或是否為最新。");
  }

  if (
    record.verificationStatus === "needs_review" ||
    record.verificationStatus === "unverified"
  ) {
    reasons.push("目前狀態仍為待人工確認。");
  }

  if (isSecondHandSource(record.sourceType)) {
    reasons.push("來源類型容易受到轉述與時效影響。");
  }

  if (mentionsThirdPartyRelay(record.rawText)) {
    reasons.push(
      "內容像是代他人轉述，需留意當事人是否同意公開、內容是否被正確轉達。",
    );
  }

  if (hasVagueLocationLanguage(record.rawText)) {
    reasons.push("地點描述偏向概略，需要更精確的地點才能派工或確認。");
  }

  if (hasInternalContrast(record.rawText)) {
    reasons.push(
      "內容包含轉折語氣（例如「但」），前後可能有出入，需要看完整句子再判斷。",
    );
  }

  if (reasons.length === 0) {
    reasons.push("缺少足夠證據可直接判定。");
  }

  // 來源標籤看似正式，但內容自己透露不確定，代表標籤和實際證據不一致，
  // 這是根據內容特徵判斷，不是針對特定一筆資料寫死的例外。
  if (
    record.sourceType === "official_notice" &&
    hasUncertaintyLanguage(record.rawText)
  ) {
    level = "low";
    label = "不建議直接採用";
    summary =
      "來源類型標記為官方公告，但內容本身透露日期或真實性不明，需先查核來源。";
    canUseDirectly = false;
    nextStep = "請找到原始公告連結或官方帳號確認日期後再採用。";
  }

  return {
    level,
    label,
    summary,
    reasons,
    canUseDirectly,
    canBecomeTask,
    nextStep,
    record,
  };
}

function normalizeSituationForReview(situation: string) {
  if (situation === "需要食物") {
    return "需要食物或飲水";
  }

  if (situation === "需要清理淤泥") {
    return "需要清理協助";
  }

  if (situation === "需要心理支持") {
    return "其他";
  }

  return situation;
}

function normalizeSupportTypeForReview(taskType: string, skill: string) {
  if (skill.includes("醫療")) {
    return "醫療人員";
  }

  if (taskType.includes("交通")) {
    return "交通接送";
  }

  if (taskType.includes("心理") || skill.includes("心理")) {
    return "心理支持";
  }

  return "一般志工";
}

export function TrustAssessmentPage({
  records,
  pendingReviewItems = [],
  approvedReviewItems = [],
  onSubmitForReview = () => undefined,
}: {
  records: Phase0MessyRecord[];
  pendingReviewItems?: V1ReviewItem[];
  approvedReviewItems?: V1ReviewItem[];
  onSubmitForReview?: (item: V1ReviewItem) => void;
}) {
  const assessments = records.map(assessTrust);
  const mediumCount = assessments.filter(
    (item) => item.level === "medium",
  ).length;
  const lowCount = assessments.filter((item) => item.level === "low").length;
  const [situation, setSituation] = useState("需要食物");
  const [status, setStatus] = useState("仍需要協助");
  const [taskType, setTaskType] = useState("人力幫助");
  const [skill, setSkill] = useState("搬運");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("2026-07-10");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [item, setItem] = useState("");
  const [otherSituation, setOtherSituation] = useState("");
  const [otherSkill, setOtherSkill] = useState("");
  const [note, setNote] = useState("");
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const resolvedSituation =
      situation === "其他" ? otherSituation.trim() || "其他" : situation;
    const resolvedSkill =
      skill === "其他" ? otherSkill.trim() || "其他" : skill;
    const trimmedLocation = location.trim();
    const trimmedItem = item.trim();
    const trimmedNote = note.trim();
    const timeLabel = `${date} ${startTime} - ${endTime}`;

    if (
      !resolvedSituation &&
      !resolvedSkill &&
      !trimmedLocation &&
      !trimmedItem &&
      !trimmedNote
    ) {
      return;
    }

    const submittedAt = new Date();
    const id = `FORM-${submittedAt.getTime()}`;
    const lifeSafety =
      resolvedSituation.includes("醫療") ||
      trimmedNote.includes("受困") ||
      trimmedNote.includes("失聯") ||
      trimmedNote.includes("生命") ||
      trimmedNote.includes("危險");
    const rawText = [
      `現場情況：${resolvedSituation}`,
      `目前狀況：${status}`,
      `需要的協助類型：${taskType}`,
      `需要的協助專長：${resolvedSkill}`,
      `地點：${trimmedLocation || "未填寫"}`,
      `希望協助時間：${timeLabel}`,
      `需要的物資或協助：${trimmedItem || "未填寫"}`,
      `補充說明：${trimmedNote || "未填寫"}`,
    ].join("；");

    const newSubmission: V1ReviewItem = {
      id,
      rawText,
      situation: normalizeSituationForReview(resolvedSituation),
      supportType: normalizeSupportTypeForReview(taskType, resolvedSkill),
      location: trimmedLocation,
      duration: timeLabel,
      note: trimmedNote,
      lifeSafety,
      sourceType: "survivor_form",
      verificationStatus: "needs_review",
      updatedAt: submittedAt.toISOString(),
      originLabel: "災民現場回報表單",
    };

    onSubmitForReview(newSubmission);
    setLastSubmittedId(id);
    setSituation("需要食物");
    setStatus("仍需要協助");
    setTaskType("人力幫助");
    setSkill("搬運");
    setLocation("");
    setDate("2026-07-10");
    setStartTime("09:00");
    setEndTime("09:30");
    setItem("");
    setOtherSituation("");
    setOtherSkill("");
    setNote("");
  }

  return (
    <section className="trust-page">
      <div className="trust-page__intro">
        <p className="eyebrow">可信度判斷</p>
        <h2>先看來源與查核狀態，再判斷這筆資訊能不能當作可採用線索。</h2>
        <p>
          這裡用簡單規則把每筆原始資訊標成「可信、待確認、或不建議直接採用」，方便後續討論。
        </p>
        <p>
          以下判斷都是 agent
          依內容特徵產生的草稿，不是最終定論，需要人類覆核；如果多筆資訊描述同一地點或同一項資源，也請人工比對是否互相衝突。
        </p>
      </div>

      <div className="trust-legend" aria-label="判斷說明">
        <div>
          <span className="trust-pill trust-pill--medium">可作為線索</span>
          <p>有現場脈絡，但還需要再確認。</p>
        </div>
        <div>
          <span className="trust-pill trust-pill--low">不建議直接採用</span>
          <p>來源與時效風險較高，不能直接當作任務依據。</p>
        </div>
      </div>

      <div className="trust-page__layout">
        <aside className="trust-page__tasks" aria-label="審核中表單">
          <div className="trust-page__tasks-header">
            <h3>審核中</h3>
            <p>
              災民送出的表單會先留在這裡，等待資訊整理者到 v1
              工作台審核；不會直接變成志工任務。
            </p>
          </div>
          {pendingReviewItems.length === 0 ? (
            <div className="trust-page__empty">
              目前沒有審核中表單，災民送出後會先停在這裡。
            </div>
          ) : (
            <ul className="task-list">
              {pendingReviewItems.map((task) => (
                <li className="task-card" key={task.id}>
                  <div className="task-card__header">
                    <strong>{task.situation}</strong>
                    <span>審核中</span>
                  </div>
                  <span className="task-priority">
                    審核中，尚未進入正式任務欄
                  </span>
                  <p>{task.note || task.rawText}</p>
                  <dl className="task-card__meta">
                    <div>
                      <dt>現場情況</dt>
                      <dd>{task.situation}</dd>
                    </div>
                    <div>
                      <dt>需要的協助類型</dt>
                      <dd>{task.supportType}</dd>
                    </div>
                    <div>
                      <dt>地點線索</dt>
                      <dd>{task.location || "未填寫"}</dd>
                    </div>
                    <div>
                      <dt>時間</dt>
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

          {approvedReviewItems.length > 0 ? (
            <div className="reviewed-task-panel">
              <h4>已審核任務</h4>
              <ul className="task-list">
                {approvedReviewItems.map((task) => (
                  <li className="task-card" key={task.id}>
                    <div className="task-card__header">
                      <strong>{task.situation}</strong>
                      <span>已審核</span>
                    </div>
                    <span className="task-priority">正式任務，尚未派工</span>
                    <p>{task.rawText}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>

        <section className="trust-page__form" aria-label="災民現場回報表單">
          <h3>災民現場回報</h3>
          <p>
            請描述你目前的狀況與需要的協助。送出後會先由資訊整理者審核，不會直接派工。
          </p>
          <form onSubmit={handleSubmit} className="intake-form">
            <label className="field">
              <span>現場情況</span>
              <select
                value={situation}
                onChange={(event) => setSituation(event.target.value)}
              >
                <option value="需要食物">需要食物</option>
                <option value="需要醫療協助">需要醫療協助</option>
                <option value="需要交通協助">需要交通協助</option>
                <option value="需要住宿">需要住宿</option>
                <option value="需要心理支持">需要心理支持</option>
                <option value="需要清理淤泥">需要清理淤泥</option>
                <option value="其他">其他</option>
              </select>
            </label>
            {situation === "其他" ? (
              <label className="field">
                <span>其他現場情況</span>
                <input
                  value={otherSituation}
                  onChange={(event) => setOtherSituation(event.target.value)}
                  placeholder="請填寫其他情況"
                />
              </label>
            ) : null}

            <label className="field">
              <span>目前狀況</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="仍需要協助">仍需要協助</option>
                <option value="已有人來但仍需要協助">
                  已有人來但仍需要協助
                </option>
                <option value="狀況已緩解">狀況已緩解</option>
              </select>
            </label>

            <label className="field">
              <span>需要的協助類型</span>
              <select
                value={taskType}
                onChange={(event) => setTaskType(event.target.value)}
                aria-label="需要的協助類型"
              >
                <option value="人力幫助">人力幫助</option>
                <option value="心理幫助">心理幫助</option>
                <option value="交通幫助">交通幫助</option>
                <option value="其他">其他</option>
              </select>
            </label>

            <label className="field">
              <span>需要的協助專長</span>
              <select
                value={skill}
                onChange={(event) => setSkill(event.target.value)}
              >
                <option value="搬運">搬運</option>
                <option value="翻譯">翻譯</option>
                <option value="醫療支援">醫療支援</option>
                <option value="心理支持">心理支持</option>
                <option value="通訊協助">通訊協助</option>
                <option value="其他">其他</option>
              </select>
            </label>
            {skill === "其他" ? (
              <label className="field">
                <span>其他志工特長</span>
                <input
                  value={otherSkill}
                  onChange={(event) => setOtherSkill(event.target.value)}
                  placeholder="請填寫需要的特長"
                />
              </label>
            ) : null}

            <label className="field">
              <span>地點在哪裡</span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="請手動輸入地點"
              />
            </label>

            <label className="field">
              <span>希望什麼時候得到協助</span>
              <div className="time-grid">
                <label className="field field--inline">
                  <span>日期</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                  />
                </label>
                <label className="field field--inline">
                  <span>開始</span>
                  <select
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                  >
                    {Array.from({ length: 48 }, (_, index) => {
                      const hours = String(Math.floor(index / 2)).padStart(
                        2,
                        "0",
                      );
                      const minutes = index % 2 === 0 ? "00" : "30";
                      return `${hours}:${minutes}`;
                    }).map((timeValue) => (
                      <option key={timeValue} value={timeValue}>
                        {timeValue}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field field--inline">
                  <span>結束</span>
                  <select
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                  >
                    {Array.from({ length: 48 }, (_, index) => {
                      const hours = String(Math.floor(index / 2)).padStart(
                        2,
                        "0",
                      );
                      const minutes = index % 2 === 0 ? "00" : "30";
                      return `${hours}:${minutes}`;
                    }).map((timeValue) => (
                      <option key={timeValue} value={timeValue}>
                        {timeValue}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </label>

            <label className="field">
              <span>需要哪些物資或協助</span>
              <input
                value={item}
                onChange={(event) => setItem(event.target.value)}
                placeholder="例如：藥品、食物、毛毯"
              />
            </label>

            <label className="field">
              <span>補充說明</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                placeholder="請簡短描述目前需求、地點或注意事項"
              />
            </label>

            <button type="submit" className="submit-button">
              送出審核
            </button>
            {lastSubmittedId ? (
              <p className="form-status" role="status">
                已送出審核：{lastSubmittedId}
              </p>
            ) : null}
          </form>
        </section>
      </div>

      <div className="trust-summary" aria-label="可信度摘要">
        <div>
          <dt>建議狀態</dt>
          <dd>需要人工確認</dd>
        </div>
        <div>
          <dt>可作為線索</dt>
          <dd>{mediumCount} 筆</dd>
        </div>
        <div>
          <dt>不建議直接採用</dt>
          <dd>{lowCount} 筆</dd>
        </div>
      </div>

      <div className="trust-list">
        {assessments.map((item) => (
          <article className="trust-card" key={item.record.id}>
            <div className="trust-card__header">
              <h3>{item.record.id}</h3>
              <span className={`trust-pill trust-pill--${item.level}`}>
                {item.label}
              </span>
            </div>
            <p>{item.summary}</p>
            <div className="trust-card__meta">
              <span>來源：{item.record.sourceType}</span>
              <span>查核：{item.record.verificationStatus}</span>
            </div>
            <div className="trust-card__facts">
              <div>
                <dt>可直接使用</dt>
                <dd>{item.canUseDirectly ? "是" : "否"}</dd>
              </div>
              <div>
                <dt>可直接變成任務</dt>
                <dd>{item.canBecomeTask ? "是" : "否"}</dd>
              </div>
              <div>
                <dt>下一步</dt>
                <dd>{item.nextStep}</dd>
              </div>
            </div>
            <ul>
              {item.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

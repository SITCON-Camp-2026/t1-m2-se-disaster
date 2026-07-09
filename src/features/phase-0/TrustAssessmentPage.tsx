import { useState } from "react";
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

type VolunteerTask = {
  id: string;
  title: string;
  summary: string;
  situation: string;
  confidence: string;
  skill: string;
  location: string;
  timeSlot: string;
  item: string;
  createdAt: string;
  priority: number;
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

export function TrustAssessmentPage({
  records,
}: {
  records: Phase0MessyRecord[];
}) {
  const assessments = records.map(assessTrust);
  const mediumCount = assessments.filter(
    (item) => item.level === "medium",
  ).length;
  const lowCount = assessments.filter((item) => item.level === "low").length;
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [situation, setSituation] = useState("需要食物");
  const [confidence, setConfidence] = useState("中");
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const resolvedSituation =
      situation === "其他"
        ? otherSituation.trim() || "其他"
        : situation;
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

    const createdAt = new Date().toLocaleString("zh-TW", {
      hour12: false,
    });

    const priorityScore =
      (confidence === "高" ? 2 : confidence === "中" ? 1 : 0) +
      (resolvedSituation.includes("醫療") || resolvedSituation.includes("交通") || resolvedSituation.includes("住宿") ? 1 : 0) +
      (trimmedNote && trimmedNote.length > 6 ? 1 : 0);

    const newTask: VolunteerTask = {
      id: `${Date.now()}`,
      title: `${resolvedSituation}｜${resolvedSkill}`,
      summary:
        trimmedNote || `現場狀況：${resolvedSituation}；所需特長：${resolvedSkill}`,
      situation: resolvedSituation,
      confidence,
      skill: resolvedSkill,
      location: trimmedLocation || "未填寫",
      timeSlot: timeLabel,
      item: trimmedItem || "未填寫",
      createdAt,
      priority: priorityScore,
    };

    setTasks((currentTasks) => [newTask, ...currentTasks]);
    setSituation("需要食物");
    setConfidence("中");
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

  const sortedTasks = [...tasks].sort((a, b) => b.priority - a.priority);

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
        <aside className="trust-page__tasks" aria-label="志工任務欄">
          <div className="trust-page__tasks-header">
            <h3>志工任務欄</h3>
            <p>左側會依序顯示目前收到的需求，方便志工直接查看。</p>
          </div>
          {tasks.length === 0 ? (
            <div className="trust-page__empty">
              目前還沒有任務，請先由右側表單新增。
            </div>
          ) : (
            <ul className="task-list">
              {sortedTasks.map((task) => (
                <li className="task-card" key={task.id}>
                  <div className="task-card__header">
                    <strong>{task.title}</strong>
                    <span>{task.createdAt}</span>
                  </div>
                  <span className="task-priority">
                    {task.priority >= 3 ? "高可信度" : task.priority === 2 ? "中可信度" : "低可信度"}
                  </span>
                  <p>{task.summary}</p>
                  <dl className="task-card__meta">
                    <div>
                      <dt>現場情況</dt>
                      <dd>{task.situation}</dd>
                    </div>
                    <div>
                      <dt>信心程度</dt>
                      <dd>{task.confidence}</dd>
                    </div>
                    <div>
                      <dt>所需特長</dt>
                      <dd>{task.skill}</dd>
                    </div>
                    <div>
                      <dt>地點</dt>
                      <dd>{task.location}</dd>
                    </div>
                    <div>
                      <dt>時間</dt>
                      <dd>{task.timeSlot}</dd>
                    </div>
                    <div>
                      <dt>要帶的東西</dt>
                      <dd>{task.item}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="trust-page__form" aria-label="難民現場回報表單">
          <h3>難民現場回報</h3>
          <p>請用下列選項快速填寫現場狀況，方便志工分派支援。</p>
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
              <span>信心程度</span>
              <select
                value={confidence}
                onChange={(event) => setConfidence(event.target.value)}
              >
                <option value="高">高</option>
                <option value="中">中</option>
                <option value="低">低</option>
              </select>
            </label>

            <label className="field">
              <span>志工任務類型</span>
              <select
                value={taskType}
                onChange={(event) => setTaskType(event.target.value)}
                aria-label="志工任務類型"
              >
                <option value="人力幫助">人力幫助</option>
                <option value="心理幫助">心理幫助</option>
                <option value="交通幫助">交通幫助</option>
                <option value="其他">其他</option>
              </select>
            </label>

            <label className="field">
              <span>建議志工特長</span>
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
              <span>可以來幫忙的時間</span>
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
                      const hours = String(Math.floor(index / 2)).padStart(2, "0");
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
                      const hours = String(Math.floor(index / 2)).padStart(2, "0");
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
              <span>要來幫忙什麼東西</span>
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
              新增到任務欄
            </button>
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

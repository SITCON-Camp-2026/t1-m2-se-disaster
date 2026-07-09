import { SourceLabel } from "../../components/SourceLabel";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime } from "../../lib/date";
import type { Phase0MessyRecord } from "./phase0-types";

export function Phase0RawInfoPanel({
  records,
}: {
  records: Phase0MessyRecord[];
}) {
  return (
    <div className="phase0-raw">
      <div className="panel__header">
        <div>
          <h2>原始資訊</h2>
          <p>這些還不是整理後資料，不能直接當成行動依據。</p>
        </div>
        <p>{records.length} 筆資料</p>
      </div>

      <div className="grid">
        {records.map((record) => (
          <article className="record-card" key={record.id}>
            <div className="record-card__header">
              <h3>{record.id}</h3>
              <StatusBadge status={record.verificationStatus} />
            </div>
            <p>{record.rawText}</p>
            <div className="record-card__meta">
              <SourceLabel sourceType={record.sourceType} />
              <span>更新：{formatDateTime(record.updatedAt)}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

import type { Phase0JudgementDraft, Phase0MessyRecord } from "./phase0-types";
import {
  hasUncertaintyLanguage,
  hasVagueLocationLanguage,
  isSecondHandSource,
  mentionsThirdPartyRelay,
} from "./phase0-signals";

// This reads content *features* (wording, sourceType), not record.id, so it
// stays a safety-boundary scaffold rather than a per-record answer key.
export function createPhase0Judgement(
  record: Phase0MessyRecord,
): Phase0JudgementDraft {
  const isVerified = record.verificationStatus === "verified";
  const evidence: string[] = [];
  const blockers: string[] = [];

  if (hasUncertaintyLanguage(record.rawText)) {
    evidence.push(
      "內容出現「不知道／不確定／尚未／可能」等字眼，顯示回報者自己也沒有把握。",
    );
  }

  if (isSecondHandSource(record.sourceType)) {
    blockers.push(
      "來源類型（社群或電話轉述）容易受到轉述、時效或情緒影響，需要找到更原始的來源。",
    );
  }

  if (mentionsThirdPartyRelay(record.rawText)) {
    blockers.push(
      "內容像是代他人轉述，需先確認當事人是否同意公開、內容是否被正確轉達。",
    );
  }

  if (hasVagueLocationLanguage(record.rawText)) {
    blockers.push(
      "地點描述偏向概略（例如「附近」「後面」），需要更精確的地點才能派工。",
    );
  }

  if (!isVerified) {
    blockers.push("目前不是已確認資訊，不能直接行動或當成事實發布。");
  }

  if (evidence.length === 0) {
    evidence.push("尚未看出明確的內容線索，請由小組從原文標出判斷依據。");
  }

  if (blockers.length === 0) {
    blockers.push("仍需確認這筆資訊適合進入哪個後續流程。");
  }

  return {
    messyRecordId: record.id,
    possibleKind: "unknown",
    confidence: isVerified ? "medium" : "low",
    evidence,
    blockers,
    suggestedNextStep: isVerified ? "keep_raw" : "send_to_human_review",
    unsafeToActDirectly: !isVerified,
  };
}

// Generic, content-based signals shared by phase0-heuristics.ts and
// TrustAssessmentPage.tsx. These read *features* of the text (wording,
// sourceType), never record.id, so the same rules still make sense if the
// fixture data changes.

export function hasUncertaintyLanguage(text: string): boolean {
  return /不知道|不確定|尚未|可能|疑似/.test(text);
}

export function hasVagueLocationLanguage(text: string): boolean {
  return /附近|後面|側|大概|某(?!區)|一帶/.test(text);
}

export function isSecondHandSource(sourceType: string): boolean {
  return sourceType === "social_post" || sourceType === "phone_call";
}

export function mentionsThirdPartyRelay(text: string): boolean {
  return /代.{0,20}轉述|家屬來電|家屬表示|來電表示/.test(text);
}

export function hasInternalContrast(text: string): boolean {
  return /但|不過|然而/.test(text);
}

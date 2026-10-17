export const DOCUMENT_CATEGORIES = [
  { value: "tax", label: "Tax and Form 990", reporting: true },
  { value: "policy", label: "Governance policy", reporting: true },
  { value: "governance", label: "Governance", reporting: true },
  { value: "financial", label: "Financial", reporting: true },
  { value: "legal", label: "Legal and corporate", reporting: true },
  { value: "meeting", label: "Meeting materials", reporting: true },
  { value: "other", label: "Other", reporting: false },
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]["value"];

export const RETENTION_CLASSES = [
  { value: "permanent", label: "Permanent (minutes, articles)" },
  { value: "7y", label: "7 years" },
  { value: "3y", label: "3 years" },
  { value: "1y", label: "1 year" },
] as const;

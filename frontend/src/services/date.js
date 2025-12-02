// frontend/src/services/date.js

export function formatTimestampToLocal(ts) {
  if (!ts) return "";

  // If timestamp is a number
  if (typeof ts === "number") {
    // If seconds timestamp (10 digits), convert to milliseconds
    if (String(ts).length === 10) ts = ts * 1000;
    const d = new Date(ts);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(d);
  }

  let s = String(ts).trim();

  // If timestamp is missing timezone (e.g. "2025-12-02T15:14:34")
  const isoNoTZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;
  if (isoNoTZ.test(s)) {
    s = s + "Z"; // treat as UTC
  }

  const d = new Date(s);
  if (isNaN(d.getTime())) return s;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(d);
}

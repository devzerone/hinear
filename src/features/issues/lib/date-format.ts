const ISSUE_TIME_ZONE = "Asia/Seoul";

export function formatIssueTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
    day: "numeric",
    month: "numeric",
    timeZone: ISSUE_TIME_ZONE,
    year: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("en-CA", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    timeZone: ISSUE_TIME_ZONE,
  });
  const dateParts = dateFormatter.formatToParts(date);
  const timeParts = timeFormatter.formatToParts(date);
  const year = dateParts.find((part) => part.type === "year")?.value;
  const month = dateParts.find((part) => part.type === "month")?.value;
  const day = dateParts.find((part) => part.type === "day")?.value;
  const hour24 = Number(timeParts.find((part) => part.type === "hour")?.value);
  const minute = timeParts.find((part) => part.type === "minute")?.value;

  if (!Number.isFinite(hour24) || !minute) {
    return "-";
  }

  const period = hour24 < 12 ? "AM" : "PM";
  const hour12 = hour24 % 12 || 12;

  return `${year}. ${month}. ${day}. ${period} ${hour12}:${minute}`;
}

export function formatIssueRelativeTime(
  value: string,
  now = Date.now(),
  locale = "en"
) {
  const targetTime = new Date(value).getTime();
  const referenceTime = Number.isFinite(now) ? now : Date.now();

  if (!Number.isFinite(targetTime)) {
    return "-";
  }

  const diffInHours = Math.round(
    (targetTime - referenceTime) / (1000 * 60 * 60)
  );

  if (!Number.isFinite(diffInHours)) {
    return "-";
  }

  if (Math.abs(diffInHours) < 24) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      diffInHours,
      "hour"
    );
  }

  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
    Math.round(diffInHours / 24),
    "day"
  );
}

export function formatIssueCompactDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: ISSUE_TIME_ZONE,
    year: "numeric",
  }).format(date);
}

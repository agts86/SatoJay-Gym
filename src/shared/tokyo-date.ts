const tokyoDateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const tokyoDateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatTokyoDateKey(date: Date): string {
  const parts = getParts(tokyoDateFormatter, date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function addDaysTokyo(dateKey: string, days: number): string {
  const { year, month, day } = parseDateKey(dateKey);
  const utcNoon = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));
  return formatTokyoDateKey(utcNoon);
}

export function createTokyoSlotUtc(dateKey: string, hour: number): Date {
  const { year, month, day } = parseDateKey(dateKey);
  return new Date(Date.UTC(year, month - 1, day, hour - 9, 0, 0));
}

export function toTokyoDisplay(date: string | Date): string {
  const parts = getParts(tokyoDateTimeFormatter, new Date(date));
  return `${parts.year}/${parts.month}/${parts.day} ${parts.hour}:${parts.minute}`;
}

export function formatTokyoTime(date: string | Date): string {
  const parts = getParts(tokyoDateTimeFormatter, new Date(date));
  return `${parts.hour}:${parts.minute}`;
}

export function getTokyoDateRange(now: Date): { from: Date; to: Date } {
  const todayKey = formatTokyoDateKey(now);
  const lastDayKey = addDaysTokyo(todayKey, 29);
  return {
    from: createTokyoSlotUtc(todayKey, 0),
    to: createTokyoSlotUtc(lastDayKey, 24),
  };
}

function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
  const [yearText, monthText, dayText] = dateKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new Error(`Invalid Tokyo date key: ${dateKey}`);
  }

  return { year, month, day };
}

function getParts(formatter: Intl.DateTimeFormat, date: Date): Record<string, string> {
  return Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
}

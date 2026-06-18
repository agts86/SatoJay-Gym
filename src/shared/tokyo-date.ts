const tokyoOffsetMs = 9 * 60 * 60 * 1000;

export function formatTokyoDateKey(date: Date): string {
  const parts = toTokyoParts(date);
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
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
  const parts = toTokyoParts(new Date(date));
  return `${parts.year}/${pad2(parts.month)}/${pad2(parts.day)} ${pad2(parts.hour)}:${pad2(parts.minute)}`;
}

export function formatTokyoTime(date: string | Date): string {
  const parts = toTokyoParts(new Date(date));
  return `${pad2(parts.hour)}:${pad2(parts.minute)}`;
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

function toTokyoParts(date: Date): { year: number; month: number; day: number; hour: number; minute: number } {
  const tokyoDate = new Date(date.getTime() + tokyoOffsetMs);
  return {
    year: tokyoDate.getUTCFullYear(),
    month: tokyoDate.getUTCMonth() + 1,
    day: tokyoDate.getUTCDate(),
    hour: tokyoDate.getUTCHours(),
    minute: tokyoDate.getUTCMinutes(),
  };
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

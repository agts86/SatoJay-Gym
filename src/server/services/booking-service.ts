import { createBooking, type BookingPersistenceError } from "~/server/repositories/booking-repository";
import { createBookingInputSchema, type CreateBookingInput } from "~/shared/reservation-schema";
import { SLOT_ALREADY_BOOKED_MESSAGE, type Result } from "~/shared/reservation-types";
import { formatTokyoDateKey } from "~/shared/tokyo-date";

export type BookingError =
  | { type: "VALIDATION_ERROR"; fields: Record<string, string> }
  | { type: "SLOT_ALREADY_BOOKED"; message: typeof SLOT_ALREADY_BOOKED_MESSAGE }
  | { type: "PERSISTENCE_ERROR"; message: string };

export interface CreateBookingOutput {
  bookingId: string;
  bookingNumber: string;
}

const maxBookingNumberAttempts = 5;

export async function createReservation(input: unknown, now = new Date()): Promise<Result<CreateBookingOutput, BookingError>> {
  const parsed = createBookingInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: { type: "VALIDATION_ERROR", fields: zodFields(parsed.error) } };
  }

  return createWithRetry(parsed.data, formatTokyoDateKey(now));
}

async function createWithRetry(input: CreateBookingInput, dateKey: string): Promise<Result<CreateBookingOutput, BookingError>> {
  for (let attempt = 0; attempt < maxBookingNumberAttempts; attempt += 1) {
    const bookingNumber = generateBookingNumber(dateKey);
    const result = await createBooking({ ...input, bookingNumber });
    if (result.ok) {
      return {
        ok: true,
        value: {
          bookingId: result.value.id,
          bookingNumber: result.value.bookingNumber,
        },
      };
    }
    const mapped = mapPersistenceError(result.error);
    if (mapped.type !== "PERSISTENCE_ERROR" || result.error.type !== "BOOKING_NUMBER_CONFLICT") {
      return { ok: false, error: mapped };
    }
  }

  return { ok: false, error: { type: "PERSISTENCE_ERROR", message: "予約番号の生成に失敗しました" } };
}

export function generateBookingNumber(dateKey: string): string {
  const numericDate = dateKey.replaceAll("-", "");
  const suffix = String(Math.floor(Math.random() * 10_000)).padStart(4, "0");
  return `GYM-${numericDate}-${suffix}`;
}

function mapPersistenceError(error: BookingPersistenceError): BookingError {
  if (error.type === "UNIQUE_SLOT_CONFLICT") {
    return { type: "SLOT_ALREADY_BOOKED", message: SLOT_ALREADY_BOOKED_MESSAGE };
  }
  return { type: "PERSISTENCE_ERROR", message: "予約の保存に失敗しました" };
}

function zodFields(error: { issues: { path: PropertyKey[]; message: string }[] }): Record<string, string> {
  return Object.fromEntries(error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]));
}

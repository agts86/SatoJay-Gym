"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createReservation } from "~/server/services/booking-service";
import { adminSessionCookieName, createSessionCookie, verifyPassword } from "~/server/services/admin-auth-service";
import { adminLoginSchema, createBookingInputSchema } from "~/shared/reservation-schema";

export interface ActionState {
  ok: boolean;
  message: string;
  bookingNumber?: string;
}

export async function loginAdmin(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = adminLoginSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) {
    return { ok: false, message: "管理者パスワードを入力してください" };
  }

  const verified = await verifyPassword(parsed.data.password);
  if (!verified.ok) {
    return { ok: false, message: "認証に失敗しました" };
  }

  const sessionCookie = createSessionCookie(verified.value);
  if (!sessionCookie.ok) {
    return { ok: false, message: "管理ログインの設定を確認してください" };
  }

  const cookieStore = await cookies();
  cookieStore.set(adminSessionCookieName, sessionCookie.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  redirect("/admin/bookings");
}

export async function submitBooking(_state: ActionState, formData: FormData): Promise<ActionState> {
  const raw = Object.fromEntries(formData);
  const parsed = createBookingInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "入力内容を確認してください" };
  }

  const result = await createReservation(parsed.data);
  if (result.ok) {
    return { ok: true, message: "予約を受け付けました", bookingNumber: result.value.bookingNumber };
  }

  if (result.error.type === "SLOT_ALREADY_BOOKED" || result.error.type === "PERSISTENCE_ERROR") {
    return { ok: false, message: result.error.message };
  }

  return { ok: false, message: "入力内容を確認してください" };
}

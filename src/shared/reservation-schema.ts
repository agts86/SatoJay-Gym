import { z } from "zod";

const phoneRegex = /^[0-9+\-\s()]{10,20}$/;

export const reservationCustomerSchema = z.object({
  customerName: z.string().trim().min(1, "氏名を入力してください"),
  customerEmail: z.string().trim().email("メールアドレスの形式を確認してください"),
  customerPhone: z
    .string()
    .trim()
    .regex(phoneRegex, "電話番号の形式を確認してください"),
  trainingGoal: z.string().trim().min(1, "トレーニング目的を入力してください"),
  customerNote: z.string().trim().optional().default(""),
});

export const createBookingInputSchema = reservationCustomerSchema.extend({
  submissionToken: z.string().trim().min(16).max(128),
  storeId: z.string().min(1),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1, "管理者パスワードを入力してください"),
});

export type ReservationCustomerInput = z.infer<typeof reservationCustomerSchema>;
export type CreateBookingInput = z.infer<typeof createBookingInputSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

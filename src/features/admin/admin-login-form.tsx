"use client";

import { LogIn } from "lucide-react";
import { useActionState } from "react";
import { loginAdmin, type ActionState } from "~/server/actions";
import { scrapeIds } from "~/shared/scrape-ids";

const initialState: ActionState = { ok: false, message: "" };

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, initialState);

  return (
    <form action={action} className="card grid" id={scrapeIds.admin.loginForm}>
      <label className="field" htmlFor={scrapeIds.admin.password}>
        管理者パスワード
        <input id={scrapeIds.admin.password} name="password" type="password" />
      </label>
      {state.message ? <p style={{ color: "#b91c1c" }}>{state.message}</p> : null}
      <button className="button" disabled={pending} id={scrapeIds.admin.loginButton} type="submit">
        <LogIn size={18} aria-hidden />
        {pending ? "確認中" : "ログイン"}
      </button>
    </form>
  );
}

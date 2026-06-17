import { ArrowRight, Dumbbell } from "lucide-react";
import Link from "next/link";
import { scrapeIds } from "~/shared/scrape-ids";

export function LandingPage() {
  return (
    <main>
      <section id={scrapeIds.lp.hero} className="page-shell" style={{ minHeight: "84vh", display: "grid", alignContent: "center" }}>
        <p className="muted">SatoJay Gym 体験トレーニング</p>
        <h1 className="section-title">SatoJay Gym</h1>
        <p style={{ maxWidth: 620, fontSize: "1.15rem", lineHeight: 1.8 }}>
          関東の架空店舗で試せる、1時間の体験トレーニング。店舗と日時を選び、フォームから予約できます。
        </p>
        <div id={scrapeIds.lp.reservationCta} style={{ marginTop: 28 }}>
          <Link className="button bot_open" href="/reservation">
            体験予約へ進む
            <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </section>

      <section id={scrapeIds.lp.programs} className="band">
        <div className="page-shell grid three">
          {["姿勢改善", "筋力アップ", "ダイエット"].map((program) => (
            <article className="card" key={program}>
              <Dumbbell size={24} aria-hidden />
              <h2>{program}</h2>
              <p className="muted">体験枠では目的を確認し、無理なく始めるメニューを提案します。</p>
            </article>
          ))}
        </div>
      </section>

      <section id={scrapeIds.lp.pricing} className="band">
        <div className="page-shell">
          <h2>料金</h2>
          <p>体験トレーニング 0円 / 月額 12,800円</p>
        </div>
      </section>

      <section id={scrapeIds.lp.trainers} className="band">
        <div className="page-shell">
          <h2>指導体制</h2>
          <p className="muted">目的、現在の運動習慣、通いやすさを確認して体験メニューを組みます。</p>
        </div>
      </section>

      <section id={scrapeIds.lp.access} className="band">
        <div className="page-shell">
          <h2>アクセス</h2>
          <p className="muted">関東地方の駅近店舗を想定した、スクレイピング練習用の架空LPです。</p>
        </div>
      </section>

      <section id={scrapeIds.lp.faq} className="band">
        <div className="page-shell grid two">
          <article>
            <h2>FAQ</h2>
            <p>体験は1時間です。予約可能枠は10:00から20:00までです。</p>
          </article>
          <Link className="button secondary" href="/reservation">
            予約画面へ
            <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </section>
    </main>
  );
}

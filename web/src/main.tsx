// Animated, narrated payment-flow explainers for the demo pages, built with
// Remotion and played in-page by @remotion/player. Bundled once into
// public/flow.js (`npm run build` here); the Go server only serves the file.
//
// Each case plays as: an opening card (what this integration is, who it
// suits, what you write) → the flow, one captioned step at a time → a
// closing card (what you get, what to watch).
//
// A page opts in with <div data-flow data-case="webhook">. Add
// data-switcher to get case tabs above the player (the home page). Colors
// come from the page's CSS variables, so the theme toggle just works; the
// language follows i18n.js's lang() and its "langchange" event.
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Player, type PlayerRef } from "@remotion/player";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

type Lang = "id" | "en";
type Node = "buyer" | "shop" | "fintar";
type Txt = { id: string; en: string };
type State = { phone: "cart" | "qris" | "paid" | "back" | "done"; order: "none" | "pending" | "paid" | "unknown" | "active"; fintar: "idle" | "pending" | "succeeded" };
type Step = { at: number; from: Node; to: Node; text: Txt; say: Txt; reply?: boolean; set?: Partial<State>; warn?: boolean };
type CaseId = "nocode" | "redirect" | "webhook" | "polling" | "subscription";
type Case = { shop?: Txt; title: Txt; what: Txt; fit: Txt; code: Txt; good: Txt; watch: Txt; steps: Step[] };

declare const lang: (() => Lang) | undefined;

const FPS = 30;
const TRAVEL = 36; // frames a message takes to cross
const SLOW = 3.4; // step timings below are written at 1x; this stretches them for reading
const INTRO = 210; // opening card
const SETTLE = 75; // final state stays up before the closing card
const OUTRO = 270; // closing card

// The shared opening: buyer orders, shop asks Fintar, buyer pays on the
// hosted checkout. Cases differ only in how the shop learns about it.
const open: Step[] = [
  {
    at: 0, from: "buyer", to: "shop", set: { order: "pending" },
    text: { id: "klik Beli · POST /api/orders", en: "click Buy · POST /api/orders" },
    say: { id: "Pembeli klik Beli. Browser hanya mengirim barang yang dipilih ke backend toko — harganya ditentukan server, bukan browser.", en: "The buyer clicks Buy. The browser only sends the chosen item to the shop backend — the server sets the price, not the browser." },
  },
  {
    at: 35, from: "shop", to: "fintar", set: { fintar: "pending" },
    text: { id: "POST /v1/transactions", en: "POST /v1/transactions" },
    say: { id: "Backend toko membuat transaksi di Fintar memakai API key rahasia. Key ini tidak pernah sampai ke browser.", en: "The shop backend creates a transaction at Fintar with its secret API key. That key never reaches the browser." },
  },
  {
    at: 70, from: "fintar", to: "shop", reply: true,
    text: { id: "checkout_url", en: "checkout_url" },
    say: { id: "Fintar membalas dengan checkout_url — halaman bayar yang sudah disiapkan Fintar.", en: "Fintar answers with a checkout_url — a payment page Fintar hosts for you." },
  },
  {
    at: 105, from: "shop", to: "buyer", reply: true, set: { phone: "qris" },
    text: { id: "redirect ke checkout", en: "redirect to checkout" },
    say: { id: "Pembeli diarahkan ke checkout Fintar. Toko tidak perlu membuat halaman bayar sendiri.", en: "The buyer is sent to Fintar's checkout. The shop builds no payment page of its own." },
  },
  {
    at: 140, from: "buyer", to: "fintar", set: { fintar: "succeeded", phone: "paid" },
    text: { id: "scan QRIS · bayar", en: "scan QRIS · pay" },
    say: { id: "Pembeli scan QRIS dan membayar. Sekarang Fintar tahu transaksinya succeeded.", en: "The buyer scans the QRIS and pays. Fintar now knows the transaction succeeded." },
  },
];

const CASES: Record<CaseId, Case> = {
  nocode: {
    shop: { id: "Anda (dashboard)", en: "You (dashboard)" },
    title: { id: "Case 0 · Tanpa kode", en: "Case 0 · No code" },
    what: { id: "Tanpa satu baris kode pun: buat permintaan pembayaran di dashboard Fintar, lalu kirim linknya ke pembeli.", en: "Not a single line of code: create a payment request in the Fintar dashboard and send the link to the buyer." },
    fit: { id: "Jualan lewat WhatsApp atau Instagram, jasa, tagihan satuan.", en: "Selling over WhatsApp or Instagram, services, one-off bills." },
    code: { id: "Tidak ada — semuanya di dashboard.", en: "Nothing — it all happens in the dashboard." },
    good: { id: "Bisa dipakai hari ini juga, tanpa developer.", en: "Usable today, no developer needed." },
    watch: { id: "Dibuat satu per satu. Kalau pesanan sudah banyak, sambungkan lewat API (Case 1–4).", en: "Made one at a time. Once orders pile up, connect through the API (Cases 1–4)." },
    steps: [
      {
        at: 0, from: "shop", to: "fintar", set: { fintar: "pending", order: "pending" },
        text: { id: "Buat permintaan pembayaran", en: "Create payment request" },
        say: { id: "Anda membuat permintaan pembayaran di dashboard Fintar: pilih barangnya, nominalnya ikut terhitung.", en: "You create a payment request in the Fintar dashboard: pick the items, the amount adds itself up." },
      },
      {
        at: 35, from: "fintar", to: "shop", reply: true,
        text: { id: "link pembayaran /p/…", en: "payment link /p/…" },
        say: { id: "Fintar memberi Anda link pembayaran.", en: "Fintar gives you a payment link." },
      },
      {
        at: 70, from: "shop", to: "buyer", reply: true, set: { phone: "qris" },
        text: { id: "kirim lewat WhatsApp", en: "send over WhatsApp" },
        say: { id: "Anda kirim link itu ke pembeli — lewat WhatsApp, email, atau tempel di invoice.", en: "You send that link to the buyer — over WhatsApp, email, or on an invoice." },
      },
      { ...open[4], at: 105 },
      {
        at: 145, from: "fintar", to: "shop", set: { order: "paid" },
        text: { id: "notifikasi · lunas", en: "notification · paid" },
        say: { id: "Fintar memberi tahu Anda, dan statusnya di dashboard jadi lunas.", en: "Fintar lets you know, and the status in the dashboard turns paid." },
      },
    ],
  },
  redirect: {
    title: { id: "Case 1 · Redirect saja", en: "Case 1 · Redirect only" },
    what: { id: "Integrasi paling cepat: backend Anda membuat transaksi, lalu pembeli diarahkan ke checkout Fintar.", en: "The quickest integration: your backend creates a transaction and sends the buyer to Fintar's checkout." },
    fit: { id: "Coba-coba, atau toko yang mengecek pembayaran manual di dashboard.", en: "Trying things out, or shops that check payments by hand in the dashboard." },
    code: { id: "1 panggilan API: POST /v1/transactions", en: "1 API call: POST /v1/transactions" },
    good: { id: "Terpasang dalam hitungan menit, tanpa halaman bayar sendiri.", en: "Live in minutes, no payment page of your own." },
    watch: { id: "Toko tidak pernah diberi tahu pembayaran masuk, dan ?status=succeeded di URL bisa dipalsukan. Tambahkan webhook (Case 2) atau polling (Case 3).", en: "The shop is never told about the payment, and ?status=succeeded in the URL can be faked. Add a webhook (Case 2) or polling (Case 3)." },
    steps: [
      ...open,
      {
        at: 180, from: "fintar", to: "buyer", reply: true, set: { phone: "back" },
        text: { id: "return_url?status=succeeded", en: "return_url?status=succeeded" },
        say: { id: "Fintar mengembalikan pembeli ke return_url toko dengan ?status=succeeded. Ini hanya untuk tampilan — siapa pun bisa mengetiknya.", en: "Fintar sends the buyer back to the shop's return_url with ?status=succeeded. That is display only — anyone can type it." },
      },
      {
        at: 220, from: "buyer", to: "shop", warn: true, set: { order: "unknown" },
        text: { id: "toko tidak tahu pesanan sudah dibayar", en: "the shop never learns it was paid" },
        say: { id: "Masalahnya: backend toko tidak pernah diberi tahu. Status pesanan tetap tidak jelas.", en: "The catch: the shop backend is never told. The order status stays unknown." },
      },
    ],
  },
  webhook: {
    title: { id: "Case 2 · Webhook", en: "Case 2 · Webhook" },
    what: { id: "Cara produksi: Fintar memanggil server Anda begitu pembayaran masuk, dengan tanda tangan yang bisa dicek.", en: "The production way: Fintar calls your server the moment payment lands, signed so you can verify it." },
    fit: { id: "Toko online dengan server yang bisa diakses publik (https).", en: "Online shops with a publicly reachable (https) server." },
    code: { id: "1 panggilan API + 1 endpoint POST /webhook yang mengecek Fintar-Signature", en: "1 API call + 1 POST /webhook endpoint that checks Fintar-Signature" },
    good: { id: "Pesanan langsung lunas begitu dibayar, tanpa bertanya berulang kali.", en: "Orders turn paid the moment they are paid, no repeated asking." },
    watch: { id: "Butuh URL https publik. Selalu cek tanda tangan sebelum percaya isinya, dan balas 2xx dengan cepat.", en: "Needs a public https URL. Always check the signature before trusting the body, and answer 2xx fast." },
    steps: [
      ...open,
      {
        at: 180, from: "fintar", to: "shop", set: { order: "paid" },
        text: { id: "payment.paid · Fintar-Signature ✓", en: "payment.paid · Fintar-Signature ✓" },
        say: { id: "Fintar mengirim event payment.paid ke URL webhook toko. Toko mengecek Fintar-Signature, lalu menandai pesanan lunas.", en: "Fintar sends a payment.paid event to the shop's webhook URL. The shop checks Fintar-Signature, then marks the order paid." },
      },
      {
        at: 215, from: "shop", to: "fintar", reply: true,
        text: { id: "200 OK", en: "200 OK" },
        say: { id: "Toko membalas 200 OK. Kalau tidak, Fintar mengirim ulang nanti — jadi event tidak hilang.", en: "The shop answers 200 OK. Otherwise Fintar retries later — so no event is lost." },
      },
      {
        at: 250, from: "buyer", to: "shop", set: { phone: "done" },
        text: { id: "halaman pesanan → paid", en: "order page → paid" },
        say: { id: "Halaman pesanan pembeli langsung menampilkan lunas.", en: "The buyer's order page shows paid right away." },
      },
    ],
  },
  polling: {
    title: { id: "Case 3 · Polling", en: "Case 3 · Polling" },
    what: { id: "Server Anda bertanya ke Fintar \"sudah dibayar?\" sampai jawabannya succeeded.", en: "Your server asks Fintar \"paid yet?\" until the answer is succeeded." },
    fit: { id: "Server tanpa URL publik — aplikasi internal, kasir, atau development lokal.", en: "Servers with no public URL — internal apps, cashier systems, local development." },
    code: { id: "POST /v1/transactions untuk membuat + GET /v1/transactions/:id untuk mengecek", en: "POST /v1/transactions to create + GET /v1/transactions/:id to check" },
    good: { id: "Tidak perlu URL publik sama sekali.", en: "No public URL needed at all." },
    watch: { id: "Ada jeda sampai pengecekan berikutnya, dan tiap cek memakai request. Untuk produksi, gabungkan dengan webhook.", en: "There is a lag until the next check, and every check costs a request. In production, pair it with a webhook." },
    steps: [
      ...open.slice(0, 4),
      {
        at: 140, from: "shop", to: "fintar",
        text: { id: "GET /v1/transactions/:id → pending", en: "GET /v1/transactions/:id → pending" },
        say: { id: "Backend toko bertanya ke Fintar: sudah dibayar? Belum — masih pending.", en: "The shop backend asks Fintar: paid yet? Not yet — still pending." },
      },
      { ...open[4], at: 175 },
      {
        at: 215, from: "shop", to: "fintar", set: { order: "paid" },
        text: { id: "GET /v1/transactions/:id → succeeded", en: "GET /v1/transactions/:id → succeeded" },
        say: { id: "Backend toko bertanya lagi — sekarang jawabannya succeeded. Pesanan ditandai lunas.", en: "The shop backend asks again — now the answer is succeeded. The order is marked paid." },
      },
      {
        at: 255, from: "buyer", to: "shop", set: { phone: "done" },
        text: { id: "halaman pesanan → paid", en: "order page → paid" },
        say: { id: "Halaman pesanan pembeli menampilkan lunas.", en: "The buyer's order page shows paid." },
      },
    ],
  },
  subscription: {
    title: { id: "Case 4 · Langganan", en: "Case 4 · Subscription" },
    what: { id: "Tagihan berulang: Anda membuat plan dan subscription sekali, Fintar menerbitkan tagihan tiap periode.", en: "Recurring billing: you create a plan and a subscription once, Fintar issues an invoice every period." },
    fit: { id: "Membership, kelas bulanan, SaaS.", en: "Memberships, monthly classes, SaaS." },
    code: { id: "3 panggilan API saat mendaftar + endpoint webhook untuk invoice.paid", en: "3 API calls at sign-up + a webhook endpoint for invoice.paid" },
    good: { id: "Fintar yang mengingat jadwal dan menerbitkan tagihan — Anda tidak perlu cron.", en: "Fintar keeps the schedule and issues the invoices — no cron on your side." },
    watch: { id: "Status member ikuti event invoice.paid, jangan ditebak dari tanggal.", en: "Drive member status from invoice.paid events, never guess it from dates." },
    steps: [
      {
        at: 0, from: "shop", to: "fintar",
        text: { id: "POST /v1/subscription_plans", en: "POST /v1/subscription_plans" },
        say: { id: "Toko membuat plan bulanan sekali saja, misalnya Member Rp 49.000 per bulan.", en: "The shop creates a monthly plan once, say Member at Rp 49.000 a month." },
      },
      {
        at: 35, from: "shop", to: "fintar",
        text: { id: "POST /v1/subscription_customers", en: "POST /v1/subscription_customers" },
        say: { id: "Saat pembeli mendaftar, toko membuat customer dengan nama dan email.", en: "When the buyer signs up, the shop creates a customer with a name and email." },
      },
      {
        at: 70, from: "shop", to: "fintar", set: { fintar: "pending", order: "pending" },
        text: { id: "POST /v1/subscriptions", en: "POST /v1/subscriptions" },
        say: { id: "Toko membuat subscription: customer + plan. Fintar langsung menerbitkan tagihan pertama.", en: "The shop creates a subscription: customer + plan. Fintar issues the first invoice at once." },
      },
      {
        at: 105, from: "fintar", to: "buyer", reply: true, set: { phone: "qris" },
        text: { id: "tagihan #1 · halaman bayar", en: "invoice #1 · pay page" },
        say: { id: "Pembeli menerima link tagihan #1 dan membuka halaman bayar Fintar.", en: "The buyer gets the link to invoice #1 and opens Fintar's pay page." },
      },
      {
        at: 140, from: "buyer", to: "fintar", set: { fintar: "succeeded", phone: "paid" },
        text: { id: "bayar tagihan #1", en: "pay invoice #1" },
        say: { id: "Pembeli membayar tagihan #1.", en: "The buyer pays invoice #1." },
      },
      {
        at: 175, from: "fintar", to: "shop", set: { order: "active" },
        text: { id: "invoice.paid", en: "invoice.paid" },
        say: { id: "Fintar mengirim event invoice.paid ke toko — member jadi aktif.", en: "Fintar sends invoice.paid to the shop — the member is now active." },
      },
      {
        at: 210, from: "shop", to: "fintar", set: { fintar: "pending" },
        text: { id: "majukan jam sandbox +1 bulan", en: "advance sandbox clock +1 month" },
        say: { id: "Di sandbox, jam langganan bisa dimajukan 1 bulan untuk mensimulasikan perpanjangan.", en: "In sandbox, the subscription clock can be moved a month ahead to simulate a renewal." },
      },
      {
        at: 245, from: "fintar", to: "buyer", reply: true, set: { phone: "qris" },
        text: { id: "tagihan #2 terbit", en: "invoice #2 issued" },
        say: { id: "Fintar menerbitkan tagihan #2 sendiri, tanpa cron di sisi toko.", en: "Fintar issues invoice #2 on its own, no cron on the shop's side." },
      },
    ],
  },
};

// Stretch the 1x timings and push them past the opening card. Copy, not
// mutate: the shared opening steps sit in three cases.
for (const c of Object.values(CASES)) c.steps = c.steps.map((s) => ({ ...s, at: INTRO + Math.round(s.at * SLOW) }));

const flowEnd = (c: CaseId) => {
  const s = CASES[c].steps;
  return s[s.length - 1].at + TRAVEL + SETTLE;
};
const durationOf = (c: CaseId) => flowEnd(c) + OUTRO;

// ---- geometry (canvas 960×540) ----
const W = 960, H = 540;
const X: Record<Node, number> = { buyer: 160, shop: 480, fintar: 800 };
const Y = 175, NW = 200, NH = 160;

// Messages between neighbours run straight across; buyer↔Fintar arcs over the shop.
function pathOf(from: Node, to: Node) {
  const arc = (from === "buyer" && to === "fintar") || (from === "fintar" && to === "buyer");
  const dir = X[to] > X[from] ? 1 : -1;
  if (arc) {
    const p0 = { x: X[from], y: Y - NH / 2 }, p2 = { x: X[to], y: Y - NH / 2 }, c = { x: 480, y: -50 };
    return { at: (t: number) => ({ x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * c.x + t * t * p2.x, y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * c.y + t * t * p2.y }), d: `M${p0.x},${p0.y} Q${c.x},${c.y} ${p2.x},${p2.y}` };
  }
  const y = Y + (dir > 0 ? -22 : 22); // outbound above, replies below
  const x0 = X[from] + dir * NW / 2, x1 = X[to] - dir * NW / 2;
  return { at: (t: number) => ({ x: x0 + (x1 - x0) * t, y }), d: `M${x0},${y} L${x1},${y}` };
}

function stateAt(steps: Step[], frame: number): State {
  const s: State = { phone: "cart", order: "none", fintar: "idle" };
  for (const st of steps) if (frame >= st.at + TRAVEL && st.set) Object.assign(s, st.set);
  return s;
}

const L = (t: Txt, l: Lang) => t[l];
const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";
const sans = "var(--body)";
const display = "var(--display)";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

function Pill({ x, y, label, tone }: { x: number; y: number; label: string; tone: "muted" | "amber" | "accent" | "red" }) {
  const fill = { muted: "var(--code-bg)", amber: "var(--pending-bg)", accent: "var(--paid-bg)", red: "var(--expired-bg)" }[tone];
  const ink = { muted: "var(--muted)", amber: "var(--amber)", accent: "var(--ink)", red: "var(--red)" }[tone];
  const w = label.length * 7 + 22;
  return (
    <g>
      <rect x={x - w / 2} y={y - 12} width={w} height={24} rx={12} fill={fill} />
      <text x={x} y={y + 4.5} textAnchor="middle" fontFamily={sans} fontSize={12} fontWeight={700} fill={ink}>{label}</text>
    </g>
  );
}

function NodeCard({ node, state, lang: l, pulse, shop }: { node: Node; state: State; lang: Lang; pulse: number; shop?: Txt }) {
  const cx = X[node];
  const title = { buyer: { id: "Pembeli", en: "Buyer" }, shop: shop ?? { id: "Backend toko", en: "Shop backend" }, fintar: { id: "Fintar", en: "Fintar" } }[node];
  const isFintar = node === "fintar";
  let body;
  if (node === "buyer") {
    const screen = { cart: ["🛒", "Rp 189.000"], qris: ["▦ QRIS", "Rp 189.000"], paid: ["✓", l === "id" ? "Berhasil" : "Paid"], back: ["↩", "?status=succeeded"], done: ["✓", l === "id" ? "Pesanan lunas" : "Order paid"] }[state.phone];
    body = (
      <g>
        <rect x={cx - 34} y={Y - 34} width={68} height={100} rx={12} fill="var(--bg)" stroke="var(--ink)" strokeWidth={2} />
        <text x={cx} y={Y + 12} textAnchor="middle" fontFamily={sans} fontSize={state.phone === "qris" ? 15 : 22} fontWeight={800} fill={state.phone === "paid" || state.phone === "done" ? "var(--accent)" : "var(--ink)"}>{screen[0]}</text>
        <text x={cx} y={Y + 36} textAnchor="middle" fontFamily={state.phone === "back" ? mono : sans} fontSize={state.phone === "back" ? 7.5 : 9.5} fill="var(--muted)">{screen[1]}</text>
      </g>
    );
  } else {
    const m = node === "shop"
      ? ({ none: ["—", "muted"], pending: ["pending", "amber"], paid: ["paid", "accent"], active: ["active", "accent"], unknown: ["???", "red"] } as const)[state.order]
      : ({ idle: ["—", "muted"], pending: ["pending", "amber"], succeeded: ["succeeded", "accent"] } as const)[state.fintar];
    body = (
      <g>
        <text x={cx} y={Y + 4} textAnchor="middle" fontFamily={mono} fontSize={11} fill="var(--muted)">{node === "shop" ? (shop ? "INV-0612" : "order #06f7") : "payreq_6fab…"}</text>
        <Pill x={cx} y={Y + 32} label={m[0]} tone={m[1]} />
      </g>
    );
  }
  return (
    <g>
      <rect x={cx - NW / 2 - pulse * 6} y={Y - NH / 2 - pulse * 6} width={NW + pulse * 12} height={NH + pulse * 12} rx={22 + pulse * 6} fill="none" stroke="var(--accent)" strokeOpacity={0.35 * pulse} strokeWidth={2} />
      <rect x={cx - NW / 2} y={Y - NH / 2} width={NW} height={NH} rx={20} fill={isFintar ? "var(--plum)" : "var(--card)"} stroke={isFintar ? "var(--citron)" : "var(--line)"} strokeOpacity={isFintar ? 0.5 : 1} strokeWidth={1.5} />
      {isFintar && <rect x={cx - NW / 2 + 12} y={Y - 24} width={NW - 24} height={84} rx={12} fill="var(--card)" />}
      {isFintar
        ? <image href="brand/logo-white.svg" x={cx - 46} y={Y - NH / 2 + 14} width={92} height={20} />
        : <text x={cx} y={Y - NH / 2 + 28} textAnchor="middle" fontFamily={display} fontSize={15} fontWeight={700} fill="var(--ink)">{L(title, l)}</text>}
      {body}
    </g>
  );
}

// The lockup, theme-aware through the page's .logo-light / .logo-dark rules.
function Logo() {
  return (
    <div style={{ position: "absolute", top: 34, left: 80 }}>
      <img className="logo-light" src="brand/logo.svg" width={120} height={26} alt="" style={{ display: "block" }} />
      <img className="logo-dark" src="brand/logo-white.svg" width={120} height={26} alt="" />
    </div>
  );
}

// Opening and closing cards: plain HTML over the canvas, so text wraps.
function Card({ opacity, lift, children }: { opacity: number; lift: number; children: React.ReactNode }) {
  return (
    <AbsoluteFill style={{ background: "var(--card)", opacity, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 80px" }}>
      <Logo />
      <div style={{ transform: `translateY(${lift}px)`, fontFamily: sans, color: "var(--ink)", width: "100%" }}>{children}</div>
    </AbsoluteFill>
  );
}

function Row({ k, v, frame, at, tone }: { k: string; v: string; frame: number; at: number; tone?: "good" | "watch" }) {
  const o = interpolate(frame, [at, at + 14], [0, 1], clamp);
  const color = tone === "watch" ? "var(--red)" : "var(--accent)";
  return (
    <div style={{ opacity: o, transform: `translateX(${(1 - o) * -16}px)`, display: "grid", gridTemplateColumns: "190px 1fr", gap: 18, padding: "14px 0", borderTop: "1px solid var(--line)" }}>
      <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: tone ? color : "var(--muted)" }}>{k}</div>
      <div style={{ fontSize: 22, lineHeight: 1.35, fontFamily: v.includes("/v1") ? mono : sans, fontWeight: 500 }}>{v}</div>
    </div>
  );
}

function Flow({ caseId, lang: l }: { caseId: CaseId; lang: Lang }) {
  const frame = useCurrentFrame();
  const c = CASES[caseId];
  const { steps } = c;
  const state = stateAt(steps, frame);
  const live = steps.filter((s) => frame >= s.at);
  const current = live[live.length - 1];
  const end = flowEnd(caseId);
  const id = l === "id";

  // A node pulses for a moment when a message lands on it.
  const pulse = (n: Node) => {
    const hit = steps.filter((s) => s.to === n && frame >= s.at + TRAVEL).pop();
    return hit ? interpolate(frame - hit.at - TRAVEL, [0, 18], [1, 0], clamp) : 0;
  };

  // The tech label stays readable until the next message leaves.
  const next = steps[live.length];
  const labelEnd = next ? next.at : end;

  const introOut = interpolate(frame, [INTRO - 20, INTRO], [1, 0], clamp);
  const outroIn = interpolate(frame, [end, end + 20], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: "var(--card)" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="var(--line)" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#dots)" opacity={0.6} />

        {steps.map((s, i) => (
          frame >= s.at && <path key={"t" + i} d={pathOf(s.from, s.to).d} fill="none" stroke={s.warn ? "var(--red)" : "var(--line)"} strokeWidth={1.6} strokeDasharray={s.reply || s.warn ? "5 6" : undefined} />
        ))}

        {(["buyer", "shop", "fintar"] as Node[]).map((n) => <NodeCard key={n} node={n} state={state} lang={l} pulse={pulse(n)} shop={c.shop} />)}

        {current && frame < labelEnd && (() => {
          const p = pathOf(current.from, current.to);
          const t = interpolate(frame, [current.at, current.at + TRAVEL], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
          const pt = p.at(t);
          const fade = interpolate(frame, [labelEnd - 15, labelEnd], [1, 0], clamp);
          const label = L(current.text, l);
          const w = label.length * 6.9 + 26;
          const color = current.warn ? "var(--red)" : "var(--accent)";
          return (
            <g opacity={fade}>
              <circle cx={pt.x} cy={pt.y} r={7} fill={color} />
              <circle cx={pt.x} cy={pt.y} r={13} fill={color} opacity={0.2} />
              <g transform={`translate(${Math.min(Math.max(pt.x, w / 2 + 8), W - w / 2 - 8)}, ${pt.y + (current.reply ? 24 : -24)})`}>
                <rect x={-w / 2} y={-14} width={w} height={28} rx={14} fill="var(--ink)" />
                <text y={5} textAnchor="middle" fontFamily={mono} fontSize={12} fontWeight={600} fill="var(--card)">{label}</text>
              </g>
            </g>
          );
        })()}
      </svg>

      {/* Caption: what this step means, in plain words. */}
      {current && (() => {
        const n = steps.indexOf(current) + 1;
        const enter = interpolate(frame - current.at, [0, 12], [0, 1], clamp);
        const who = { buyer: id ? "pembeli" : "buyer", shop: c.shop ? (id ? "anda" : "you") : id ? "toko" : "shop", fintar: "fintar" };
        return (
          <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 200, borderRadius: 18, background: "var(--bg)", border: `1px solid ${current.warn ? "var(--red)" : "var(--line)"}`, padding: "22px 28px", fontFamily: sans, boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "var(--muted)", fontWeight: 700 }}>
              <span style={{ background: current.warn ? "var(--red)" : "var(--citron)", color: current.warn ? "#fff" : "var(--plum)", borderRadius: 999, padding: "3px 11px" }}>{id ? "Langkah" : "Step"} {n}/{steps.length}</span>
              <span style={{ fontFamily: mono, fontWeight: 500 }}>{who[current.from]} → {who[current.to]} · {L(current.text, l)}</span>
            </div>
            <div style={{ marginTop: 16, fontSize: 25, lineHeight: 1.38, fontWeight: 600, fontFamily: display, letterSpacing: "-.01em", color: current.warn ? "var(--red)" : "var(--ink)", opacity: enter, transform: `translateY(${(1 - enter) * 8}px)` }}>
              {L(current.say, l)}
            </div>
          </div>
        );
      })()}

      {/* Waiting for step 1 under the fading opening card. */}
      {!current && (
        <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 200, borderRadius: 18, background: "var(--bg)", border: "1px solid var(--line)" }} />
      )}

      {frame < INTRO && (
        <Card opacity={introOut} lift={interpolate(frame, [0, 18], [14, 0], clamp)}>
          <span style={{ display: "inline-block", fontSize: 14, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", background: "var(--citron)", color: "var(--plum)", borderRadius: 999, padding: "6px 14px" }}>{id ? "Jenis integrasi" : "Integration type"}</span>
          <div style={{ fontFamily: display, fontSize: 46, fontWeight: 600, margin: "6px 0 10px", letterSpacing: "-.025em" }}>{L(c.title, l)}</div>
          <div style={{ fontSize: 24, lineHeight: 1.4, color: "var(--muted)", marginBottom: 22, opacity: interpolate(frame, [12, 30], [0, 1], clamp) }}>{L(c.what, l)}</div>
          <Row k={id ? "Cocok untuk" : "Good for"} v={L(c.fit, l)} frame={frame} at={45} />
          <Row k={id ? "Yang Anda tulis" : "What you write"} v={L(c.code, l)} frame={frame} at={75} />
        </Card>
      )}

      {frame >= end && (
        <Card opacity={outroIn} lift={(1 - outroIn) * 14}>
          <span style={{ display: "inline-block", fontSize: 14, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", background: "var(--citron)", color: "var(--plum)", borderRadius: 999, padding: "6px 14px" }}>{id ? "Ringkasnya" : "In short"}</span>
          <div style={{ fontFamily: display, fontSize: 42, fontWeight: 600, margin: "6px 0 22px", letterSpacing: "-.025em" }}>{L(c.title, l)}</div>
          <Row k={id ? "✓ Yang didapat" : "✓ You get"} v={L(c.good, l)} frame={frame} at={end + 20} tone="good" />
          <Row k={id ? "⚠ Perhatikan" : "⚠ Watch out"} v={L(c.watch, l)} frame={frame} at={end + 50} tone="watch" />
        </Card>
      )}
    </AbsoluteFill>
  );
}

function currentLang(): Lang {
  try { return typeof lang === "function" ? lang() : "id"; } catch { return "id"; }
}

function FlowBlock({ initial, switcher }: { initial: CaseId; switcher: boolean }) {
  const [caseId, setCase] = useState<CaseId>(initial);
  const [l, setLang] = useState<Lang>(currentLang());
  const [frame, setFrame] = useState(0);
  const ref = useRef<PlayerRef>(null);

  useEffect(() => {
    const on = () => setLang(currentLang());
    document.addEventListener("langchange", on);
    return () => document.removeEventListener("langchange", on);
  }, []);
  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    const on = (e: { detail: { frame: number } }) => setFrame(e.detail.frame);
    // With tabs, a finished case hands over to the next one (Case 0 → 4, then round again).
    const ended = () => { const ids = Object.keys(CASES) as CaseId[]; setCase(ids[(ids.indexOf(caseId) + 1) % ids.length]); setFrame(0); };
    p.addEventListener("frameupdate", on);
    p.addEventListener("ended", ended);
    return () => { p.removeEventListener("frameupdate", on); p.removeEventListener("ended", ended); };
  }, [caseId]);

  const { steps } = CASES[caseId];
  const end = flowEnd(caseId);
  const id = l === "id";
  // Chips: the opening card, every step, the closing card.
  const chips = [
    { at: 0, label: id ? "Pengantar" : "Intro", cls: "" },
    ...steps.map((s, i) => ({ at: s.at + TRAVEL, label: `${String(i + 1).padStart(2, "0")} ${L(s.text, l)}`, cls: s.warn ? "warn" : "" })),
    { at: end + 40, label: id ? "Ringkasan" : "Summary", cls: "" },
  ];
  let active = 0;
  chips.forEach((c, i) => { if (frame >= (i === 0 ? 0 : i === chips.length - 1 ? end : steps[i - 1].at)) active = i; });

  return (
    <div className="flow-player">
      {switcher && (
        <div className="flow-tabs" role="tablist">
          {(Object.keys(CASES) as CaseId[]).map((c) => (
            <button key={c} role="tab" aria-selected={c === caseId} className={c === caseId ? "on" : ""} onClick={() => { setCase(c); setFrame(0); }}>
              {L(CASES[c].title, l)}
            </button>
          ))}
        </div>
      )}
      <Player
        key={caseId}
        ref={ref}
        component={Flow}
        inputProps={{ caseId, lang: l }}
        durationInFrames={durationOf(caseId)}
        fps={FPS}
        compositionWidth={W}
        compositionHeight={H}
        style={{ width: "100%", borderRadius: 18, overflow: "hidden", border: "1px solid var(--line)" }}
        controls
        loop={!switcher}
        autoPlay
        clickToPlay
        initiallyMuted
      />
      <ol className="flow-steps">
        {chips.map((c, i) => (
          <li key={i}>
            <button className={(i === active ? "on " : "") + c.cls} onClick={() => { ref.current?.seekTo(c.at); ref.current?.play(); }}>
              {c.label}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

for (const el of document.querySelectorAll<HTMLElement>("[data-flow]")) {
  const want = el.dataset.case || new URLSearchParams(location.search).get("case") || "redirect";
  const c = (want in CASES ? want : "webhook") as CaseId;
  createRoot(el).render(<FlowBlock initial={c} switcher={"switcher" in el.dataset} />);
}

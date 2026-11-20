// Two-language dictionary (Indonesian default, English) for every static
// string on the site. Elements opt in with data-i18n="key"; applyI18n()
// swaps their content. Values may contain markup — they are our own strings
// from this file, never user input, so innerHTML is safe here.
//
// Per-case explainer paragraphs are page-specific and live in each page's
// own <script>, keyed by lang() the same way; they re-render on the
// "langchange" event applyI18n() dispatches.

const I18N = {
  // --- shared: nav + footer + toggles ---------------------------------
  "nav.case0": { id: `0 · Tanpa kode`, en: `0 · No code` },
  "nav.case1": { id: `1 · Redirect`, en: `1 · Redirect` },
  "nav.case2": { id: `2 · Webhook`, en: `2 · Webhook` },
  "nav.case3": { id: `3 · Polling`, en: `3 · Polling` },
  "nav.case4": { id: `4 · Langganan`, en: `4 · Subscription` },
  "theme.dark": { id: `Gelap`, en: `Dark` },
  "theme.light": { id: `Terang`, en: `Light` },
  "footer.tag": { id: `Toko demo Fintar`, en: `Fintar demo shop` },
  "footer.page": { id: `kode halaman ini`, en: `this page's source` },
  "footer.repo": { id: `repo GitHub`, en: `GitHub repo` },

  // --- index.html ------------------------------------------------------
  "title.index": {
    id: `Demo Fintar — lima cara menerima pembayaran`,
    en: `Fintar demo — five ways to get paid`,
  },
  "home.eyebrow": {
    id: `Simulasi fitur pembayaran`,
    en: `Payment feature simulation`,
  },
  "home.h1": {
    id: `Semua cara menerima <span class="hl">pembayaran</span> dengan
      Fintar, dalam satu tempat untuk dicoba.`,
    en: `Every way to get <span class="hl">paid</span> with Fintar,
      in one place to try.`,
  },
  "home.lede": {
    id: `Pilih satu kasus dan lihat langsung cara kerjanya — tanpa
      mendaftar, tanpa uang sungguhan. Anda tahu persis bagaimana
      <strong>Fintar</strong> masuk ke alur pembayaran Anda sebelum
      menulis satu baris kode pun.`,
    en: `Pick a case and see it in action — no sign-up, no real money.
      You'll know exactly how <strong>Fintar</strong> fits your payment
      flow before you write a single line of code.`,
  },
  "home.sandbox": {
    id: `Demo ini berjalan di mode sandbox — pembayaran tidak memakai uang sungguhan.`,
    en: `This demo runs in sandbox mode — payments never move real money.`,
  },
  "home.anim.k": { id: `LIHAT ALURNYA`, en: `SEE THE FLOW` },
  "home.anim.h2": { id: `Setiap pesan, dari klik Beli sampai lunas`, en: `Every message, from Buy to paid` },
  "home.anim.lede": {
    id: `Pilih kasus, putar, atau klik satu langkah untuk berhenti di sana.`,
    en: `Pick a case, play it, or click a step to stop right there.`,
  },
  "home.cta": { id: `Coba demo →`, en: `Try the demo →` },
  "home.src": {
    id: `Kode sumber di GitHub →`,
    en: `Source code on GitHub →`,
  },
  "home.badge": { id: `Demo interaktif`, en: `Interactive demo` },
  "home.badge0": { id: `Panduan singkat`, en: `Quick guide` },
  "home.badge2": { id: `Cara produksi`, en: `The production way` },
  "home.shop.k": { id: `TOKO DEMONYA`, en: `THE DEMO SHOP` },
  "home.shop.lede": {
    id: `Toko kaos yang benar-benar berjalan — tiap tombol Beli membuat payment
      request sungguhan di mode sandbox.`,
    en: `A shirt shop that actually runs — every Buy button creates a real
      payment request in sandbox mode.`,
  },
  "home.shop.cta": { id: `Buka toko →`, en: `Open the shop →` },
  "home.try": { id: `Coba demo →`, en: `Try demo →` },
  "home.try0": { id: `Lihat panduan →`, en: `See the guide →` },
  "home.flow.k": { id: `CARA KERJANYA`, en: `HOW IT WORKS` },
  "home.flow.s1.t": { id: `1 · Buat payment request`, en: `1 · Create a payment request` },
  "home.flow.s1.p": {
    id: `Backend Anda memanggil <code>POST /v1/transactions</code>.`,
    en: `Your backend calls <code>POST /v1/transactions</code>.`,
  },
  "home.flow.s2.t": { id: `2 · Pembeli scan QRIS`, en: `2 · Buyer scans QRIS` },
  "home.flow.s2.p": {
    id: `Checkout yang di-host Fintar — dari aplikasi bank atau e-wallet mana pun.`,
    en: `On Fintar's hosted checkout — from any banking or e-wallet app.`,
  },
  "home.flow.s3.t": { id: `3 · Fintar memberi tahu`, en: `3 · Fintar tells you` },
  "home.flow.s3.p": {
    id: `Webhook <code>payment.paid</code> bertanda tangan — atau server Anda
      yang bertanya.`,
    en: `A signed <code>payment.paid</code> webhook — or your server asks.`,
  },
  "home.flow.s4.t": { id: `4 · Pesanan lunas`, en: `4 · Order paid` },
  "home.flow.s4.p": {
    id: `Status berubah menjadi <strong class="hl">paid</strong> — uang menuju
      rekening Anda.`,
    en: `The status flips to <strong class="hl">paid</strong> — money heads to
      your bank account.`,
  },
  "home.cases.k": { id: `LIMA KASUSNYA`, en: `THE FIVE CASES` },
  "home.cases.h2": {
    id: `Dari nol kode sampai alur produksi`,
    en: `From zero code to the production flow`,
  },
  "home.cases.lede": {
    id: `Toko yang sama dibangun lima kali — satu untuk tiap cara integrasi, termasuk langganan bulanan.`,
    en: `The same shop, built five times — once per way of integrating, including a monthly subscription.`,
  },
  "home.case0.t": { id: `Tanpa API sama sekali`, en: `No API at all` },
  "home.case0.p": {
    id: `Buat tautan pembayaran dari dashboard dan bagikan. Nol kode.`,
    en: `Create payment links from the dashboard and share them. Zero code.`,
  },
  "home.case1.t": { id: `Redirect saja`, en: `Redirect only` },
  "home.case1.p": {
    id: `Backend Anda membuat payment request lalu mengarahkan pembeli ke
      checkout. Pemakaian API paling sederhana.`,
    en: `Your backend creates a payment request and sends the buyer to
      checkout. The simplest possible API use.`,
  },
  "home.case2.t": { id: `Webhook`, en: `Webhook` },
  "home.case2.p": {
    id: `Fintar memanggil server Anda begitu pembayaran masuk — bertanda
      tangan, terverifikasi, at-least-once. Cara produksi.`,
    en: `Fintar calls your server the moment payment lands — signed,
      verified, at-least-once. The production way.`,
  },
  "home.case3.t": { id: `Polling`, en: `Polling` },
  "home.case3.p": {
    id: `Server Anda bertanya ke Fintar "sudah dibayar?" sampai terjawab.
      Tanpa URL publik — pas untuk pengembangan lokal.`,
    en: `Your server asks Fintar "paid yet?" until it is. No public URL
      needed — good for local dev.`,
  },
  "home.case4.t": { id: `Langganan`, en: `Subscription` },
  "home.case4.p": {
    id: `Plan bulanan, customer, subscription — Fintar menerbitkan tagihan
      tiap periode. Majukan jam sandbox dan lihat perpanjangannya hari ini.`,
    en: `A monthly plan, a customer, a subscription — Fintar issues an invoice
      per period. Advance the sandbox clock and watch a renewal today.`,
  },
  // --- langganan.html (case 4) ------------------------------------------
  "title.sub": { id: `Langganan · demo Fintar`, en: `Subscription · Fintar demo` },
  "sub.h1": { id: `Member Fintar Threads`, en: `Fintar Threads membership` },
  "sub.name": { id: `Nama`, en: `Name` },
  "sub.email": { id: `Email`, en: `Email` },
  "sub.signup": { id: `Langganan Rp 49.000 / bulan`, en: `Subscribe for Rp 49,000 / month` },
  "sub.signupHint": {
    id: `Tidak ada uang sungguhan: ini langganan sandbox. Fintar langsung
      menerbitkan tagihan pertama beserta halaman bayarnya.`,
    en: `No real money: this is a sandbox subscription. Fintar issues the first
      invoice at once, with a page to pay it on.`,
  },
  "sub.subH2": { id: `Langganan`, en: `Subscription` },
  "sub.who": { id: `Member`, en: `Member` },
  "sub.id": { id: `ID langganan Fintar`, en: `Fintar subscription id` },
  "sub.status": { id: `Status`, en: `Status` },
  "sub.period": { id: `Periode berjalan`, en: `Current period` },
  "sub.clock": { id: `Jam sandbox`, en: `Sandbox clock` },
  "sub.clockNow": { id: `belum dimajukan (jam sungguhan)`, en: `not moved yet (wall clock)` },
  "sub.invH2": { id: `Tagihan`, en: `Invoices` },
  "sub.invHint": {
    id: `Setiap periode punya satu tagihan. Yang pertama terbit saat mendaftar;
      berikutnya diterbitkan sweep perpanjangan Fintar begitu jam langganan
      melewati akhir periode.`,
    en: `One invoice per period. The first is issued at sign-up; the next ones
      by Fintar's renewal sweep once the subscription's clock passes the period end.`,
  },
  "sub.invNo": { id: `No.`, en: `No.` },
  "sub.invPeriod": { id: `Periode`, en: `Period` },
  "sub.invTotal": { id: `Total`, en: `Total` },
  "sub.invStatus": { id: `Status`, en: `Status` },
  "sub.pay": { id: `Bayar →`, en: `Pay →` },
  "sub.advance": { id: `Majukan sebulan`, en: `Advance a month` },
  "sub.advanceHint": {
    id: `Hanya ada untuk langganan sandbox: memindahkan jam langganan ini satu
      bulan ke depan, lalu sweep perpanjangan Fintar menerbitkan tagihan
      berikutnya — persis seperti di produksi, tanpa menunggu sebulan.`,
    en: `Sandbox subscriptions only: moves this subscription's clock one month
      ahead, and Fintar's renewal sweep then issues the next invoice — exactly
      as in production, without waiting a month.`,
  },
  "sub.waiting": {
    id: `Jam sudah maju. Menunggu sweep perpanjangan Fintar menerbitkan tagihan
      berikutnya (paling lama 5 menit)…`,
    en: `Clock moved. Waiting for Fintar's renewal sweep to issue the next invoice
      (up to 5 minutes)…`,
  },
  "sub.waitedOut": {
    id: `Belum muncul juga — muat ulang halaman ini sebentar lagi.`,
    en: `Not there yet — reload this page in a moment.`,
  },
  "sub.evH2": { id: `Event webhook yang diterima toko ini`, en: `Webhook events this shop received` },
  "sub.evHint": {
    id: `Inilah yang dipakai toko sungguhan: <code>subscription.activated</code>
      membuka akses, <code>invoice.overdue</code> menagih,
      <code>subscription.canceled</code> mencabut akses. Setiap event
      ditandatangani dan diverifikasi di <code>POST /webhook</code>, sama
      seperti <code>payment.paid</code>.`,
    en: `This is what a real shop acts on: <code>subscription.activated</code>
      opens access, <code>invoice.overdue</code> chases,
      <code>subscription.canceled</code> revokes. Every event is signed and
      verified in <code>POST /webhook</code>, just like <code>payment.paid</code>.`,
  },
  "sub.evNone": { id: `Belum ada event yang masuk.`, en: `No events yet.` },
  "sub.again": { id: `Buat langganan lain →`, en: `Start another subscription →` },
  "sub.gone": {
    id: `Member tidak ditemukan. Member hidup di memori backend demo dan hilang
      saat backend di-restart — buat yang baru di atas.`,
    en: `Member not found. Members live in the demo backend's memory and vanish
      on restart — start a new one above.`,
  },
  "sub.failed": { id: `Gagal:`, en: `Failed:` },
  // --- store.html + store.js -------------------------------------------
  "title.store": {
    id: `Fintar Threads · demo Fintar`,
    en: `Fintar Threads · Fintar demo`,
  },
  "store.buy": { id: `Beli`, en: `Buy` },
  "store.creating": { id: `Membuat pesanan…`, en: `Creating order…` },
  "store.fail": { id: `Gagal membuat pesanan: `, en: `Could not create the order: ` },

  // --- order.html -------------------------------------------------------
  "title.order": {
    id: `Status pesanan · demo Fintar`,
    en: `Order status · Fintar demo`,
  },
  "order.h1": { id: `Pesanan Anda`, en: `Your order` },
  "order.loading": { id: `Memuat…`, en: `Loading…` },
  "order.item": { id: `Barang`, en: `Item` },
  "order.amount": { id: `Jumlah`, en: `Amount` },
  "order.id": { id: `ID pesanan`, en: `Order ID` },
  "order.mref": { id: `Ref merchant`, en: `Merchant ref` },
  "order.payreq": { id: `Payment request Fintar`, en: `Fintarment request` },
  "order.status": { id: `Status`, en: `Status` },
  "order.pay": {
    id: `Bayar sekarang — buka checkout Fintar`,
    en: `Pay now — opens Fintar checkout`,
  },
  "order.payhint": {
    id: `Bayar di tab satunya, lalu pantau halaman ini — status di bawah
      diperbarui otomatis.`,
    en: `Pay in the other tab, then watch this page — the status below
      updates on its own.`,
  },
  "order.gone": {
    id: `Pesanan tidak ditemukan. Pesanan hidup di memori backend demo dan
      hilang saat backend di-restart — kembali ke
      <a href="store.html?case=webhook">toko</a> dan buat yang baru.`,
    en: `Order not found. Orders live in the demo backend's memory and
      vanish when it restarts — go back to the
      <a href="store.html?case=webhook">store</a> and make a new one.`,
  },

  // --- nonapi.html ------------------------------------------------------
  "title.nonapi": {
    id: `Case 0 — tanpa kode · demo Fintar`,
    en: `Case 0 — no code at all · Fintar demo`,
  },
  "nonapi.h1": {
    id: `Case 0 — untuk ini Anda tidak butuh kode`,
    en: `Case 0 — you don't need any code for this`,
  },
  "nonapi.lede": {
    id: `Sebelum menulis satu baris kode integrasi pun, ketahuilah bahwa
      seluruh alurnya sudah jalan dari dashboard:`,
    en: `Before writing a single line of integration code, know that the
      whole loop already works from the dashboard:`,
  },
  "nonapi.step1": {
    id: `Buka <strong>dashboard Fintar</strong> dan buat payment
      request: jumlah, deskripsi, selesai.`,
    en: `Open the <strong>Fintar dashboard</strong> and create a payment
      request: amount, description, done.`,
  },
  "nonapi.step2": {
    id: `Dashboard memberi Anda <strong>tautan checkout</strong> dan
      <strong>kode QRIS</strong>.`,
    en: `The dashboard gives you a <strong>checkout link</strong> and a
      <strong>QRIS code</strong>.`,
  },
  "nonapi.step3": {
    id: `Bagikan tautannya lewat WhatsApp, tempel di invoice, atau cetak
      QR-nya dan tempel di meja kasir.`,
    en: `Share the link over WhatsApp, paste it in an invoice, or print the
      QR and tape it to the counter.`,
  },
  "nonapi.step4": {
    id: `Pembeli membayar; di dashboard status berubah menjadi
      <span class="status paid">paid</span>, dan Anda bisa menerima
      notifikasi.`,
    en: `The buyer pays; the dashboard shows the request flip to
      <span class="status paid">paid</span>, and you can get notified.`,
  },
  "nonapi.note": {
    id: `<strong>Coba langsung:</strong> tautan pembayaran yang dibagikan
      berbentuk <code>https://app.fintar.id/p/&lt;token&gt;</code> — untuk
      stack dev lokal, <code>http://localhost:8888/p/&lt;token&gt;</code>.
      <em>(Placeholder: buat satu di dashboard Anda dan tempel di sini.)</em>`,
    en: `<strong>Try it live:</strong> a shared payment link looks like
      <code>https://app.fintar.id/p/&lt;token&gt;</code> — for a local dev
      stack, <code>http://localhost:8888/p/&lt;token&gt;</code>.
      <em>(Placeholder: create one in your dashboard and paste it here.)</em>`,
  },
  "nonapi.outro": {
    id: `Inilah "integrasi" yang pas untuk warung, bazar kue, atau siapa pun
      yang volume pesanannya masih muat di kepala. Kasus API (1–3) ada untuk
      saat Anda ingin <em>situs Anda sendiri</em> yang membuat tautan ini
      dan bereaksi terhadap pembayaran secara otomatis — persis yang
      ditunjukkan sisa demo ini.`,
    en: `This is the right "integration" for a warung, a bake sale, or
      anyone whose order volume fits in their head. The API cases (1–3)
      exist for when you want <em>your own website</em> to create these
      links and react to payment automatically — which is exactly what the
      rest of this demo shows.`,
  },
  "nonapi.next": {
    id: `Berikutnya: Case 1, integrasi API paling sederhana →`,
    en: `Next: Case 1, the simplest API integration →`,
  },
};

// Current language: saved choice, else Indonesian.
function lang() {
  return localStorage.getItem("lang") || "id";
}

// t: look a key up in the current language (missing key shows the key
// itself — an obvious bug marker, better than silence).
function t(key) {
  const entry = I18N[key];
  return entry ? entry[lang()] : key;
}

function setLang(l) {
  localStorage.setItem("lang", l);
  applyI18n();
}

function applyI18n() {
  document.documentElement.lang = lang();
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.innerHTML = t(el.dataset.i18n);
  });
  // The toggle shows the language you would switch TO.
  document.getElementById("lang-toggle").textContent =
    lang() === "id" ? "EN" : "ID";
  // Pages with dynamic copy (the per-case explainers) re-render on this.
  document.dispatchEvent(new Event("langchange"));
}

document.getElementById("lang-toggle").addEventListener("click", () => {
  setLang(lang() === "id" ? "en" : "id");
});
applyI18n();

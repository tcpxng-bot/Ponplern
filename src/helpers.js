
const {
  useState,
  useEffect,
  useRef
} = React;

/* ============================================================
   ผ่อนเพลิน — Cashflow & Installment Forecaster
   ล็อกรหัส 4 หลัก + มาสคอต "น้องผ่อนเพลิน"
   เงินเดือน − ค่าใช้จ่ายประจำ − ผ่อนรวม = เหลือใช้
   ============================================================ */

const ITEMS_KEY = "pon:items:v1"; // รายการผ่อน (ชุดเดิม)
const BUDGET_KEY = "pon:budget:v1"; // เงินเดือน + ค่าใช้จ่ายประจำ
const PIN_KEY = "pon:pin:v1"; // รหัสล็อก 4 หลัก

const EMOJIS = ["📱", "💻", "⌚", "🎧", "👜", "👟", "🛋️", "🛏️", "🚗", "🏍️", "💍", "📷", "🎮", "📺", "🪑", "🍳", "❄️", "🚲"];
const PLATFORMS = [{
  id: "shopee",
  label: "Shopee",
  emoji: "🛍️",
  color: "#EE4D2D"
}, {
  id: "lazada",
  label: "Lazada",
  emoji: "🛒",
  color: "#2E3192"
}, {
  id: "tiktok",
  label: "TikTok",
  emoji: "🎵",
  color: "#1C2733"
}, {
  id: "store",
  label: "ห้าง/ร้าน",
  emoji: "🏬",
  color: "#7A6A8A"
}, {
  id: "other",
  label: "อื่นๆ",
  emoji: "🏷️",
  color: "#6B7785"
}];
const platMeta = id => PLATFORMS.find(p => p.id === id) || PLATFORMS[4];
const baht = n => "฿\u2009" + Math.round(Number(n) || 0).toLocaleString("th-TH");
const bahtExact = n => "฿\u2009" + (Number(n) || 0).toLocaleString("th-TH", {
  maximumFractionDigits: 2
});
const todayStr = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 9);
const paidOf = it => (it.payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
const remainingOf = it => Math.max(0, (Number(it.total) || 0) - paidOf(it));
const isDone = it => remainingOf(it) <= 0.0001 && (Number(it.total) || 0) > 0;
const totalMonthsOf = it => {
  if (it.months && it.months > 0) return Math.round(it.months);
  const m = Number(it.monthly) || 0,
    t = Number(it.total) || 0;
  return m > 0 ? Math.max(1, Math.ceil(t / m)) : 1;
};
const paidMonthsOf = it => {
  if (isDone(it)) return totalMonthsOf(it);
  const m = Number(it.monthly) || 0;
  return m > 0 ? Math.min(totalMonthsOf(it), Math.round(paidOf(it) / m)) : 0;
};
const monthsLeftOf = it => {
  const r = remainingOf(it),
    m = Number(it.monthly) || 0;
  return r > 0 && m > 0 ? Math.ceil(r / m) : 0;
};
const paidInYM = (items, ym) => items.reduce((s, it) => s + (it.payments || []).filter(p => (p.date || "").slice(0, 7) === ym).reduce((a, p) => a + (Number(p.amount) || 0), 0), 0);
const countPaidInYM = (items, ym) => items.reduce((c, it) => c + (it.payments || []).filter(p => (p.date || "").slice(0, 7) === ym).length, 0);
const SAMPLE_ITEMS = () => {
  const sm = todayStr().slice(0, 7);
  return [{
    id: uid(),
    name: "iPhone 16",
    emoji: "📱",
    platform: "shopee",
    card: "KBank",
    total: 36000,
    monthly: 3000,
    months: 12,
    startMonth: sm,
    payments: [{
      id: uid(),
      date: todayStr(),
      amount: 3000,
      note: "งวดที่ 1",
      kind: "normal"
    }]
  }, {
    id: uid(),
    name: "โซฟา",
    emoji: "🛋️",
    platform: "lazada",
    card: "SCB",
    total: 18000,
    monthly: 1500,
    months: 12,
    startMonth: sm,
    payments: [{
      id: uid(),
      date: todayStr(),
      amount: 4500,
      note: "ดาวน์",
      kind: "prepay"
    }]
  }, {
    id: uid(),
    name: "หูฟัง",
    emoji: "🎧",
    platform: "tiktok",
    card: "KBank",
    total: 7000,
    monthly: 1000,
    months: 7,
    startMonth: sm,
    payments: []
  }];
};
const SAMPLE_BUDGET = () => ({
  salary: 32000,
  income: [{
    id: uid(),
    name: "ค่า พ.ต.ส.",
    amount: 1500
  }, {
    id: uid(),
    name: "ค่า OT",
    amount: 2500
  }],
  fixed: [{
    id: uid(),
    name: "ค่าหอ/บ้าน",
    amount: 6500
  }, {
    id: uid(),
    name: "ค่าน้ำ-ไฟ-เน็ต",
    amount: 1800
  }, {
    id: uid(),
    name: "ค่ากิน",
    amount: 6000
  }]
});
const THMONTH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const thMonth = () => {
  const d = new Date();
  return `${THMONTH[d.getMonth()]} ${d.getFullYear() + 543}`;
};
// ทักทายตามช่วงเวลาของวัน
const greetingText = () => {
  const h = new Date().getHours();
  if (h < 11) return "สวัสดีตอนเช้า";
  if (h < 14) return "สวัสดีตอนเที่ยง";
  if (h < 17) return "สวัสดีตอนบ่าย";
  if (h < 20) return "สวัสดีตอนเย็น";
  return "สวัสดีตอนค่ำ";
};

// ป้ายเดือนของงวดที่ i (นับจากเดือนเริ่มผ่อน)
function monthOfInstallment(startMonth, i) {
  let y, m;
  if (startMonth && /^\d{4}-\d{2}$/.test(startMonth)) {
    const [yy, mm] = startMonth.split("-").map(Number);
    y = yy;
    m = mm - 1;
  } else {
    const d = new Date();
    y = d.getFullYear();
    m = d.getMonth();
  }
  const idx = m + i,
    mo = (idx % 12 + 12) % 12,
    year = y + Math.floor(idx / 12);
  return {
    mo,
    year,
    label: THMONTH[mo],
    beShort: String((year + 543) % 100).padStart(2, "0")
  };
}

/* ============================================================
   insights.js — เฟส 3/4 ของผ่อนเพลิน
   • เอนจินคำแนะนำโอกาสการเงิน (InsightDeck) — ฟีเจอร์เรือธง
   • Monthly Reflection + อารมณ์ประจำเดือน (เฟส 4)
   • Financial Journey timeline (เฟส 4)
   ใช้ token/helper ร่วมกับไฟล์เดิม: ink, muted, bg, line, teal, amber,
   red, slate, baht, S, ProgressRing, THMONTH, thMonthYear, dreamCat,
   dreamCalc, dreamNearest, calcStreak, isDone, remainingOf, monthsLeftOf,
   paidInYM, countPaidInYM, Coin
   โหลดไฟล์นี้ "หลัง" dreams.js / items.js / analytics.js และ "ก่อน" app.js
   ============================================================ */

/* ---------- โทนของการ์ดคำแนะนำ ---------- */
const INSIGHT_TONES = {
  alert:     { c: "#EF4444", icon: "🚨" },
  warn:      { c: "#FF8A4C", icon: "⚠️" },
  good:      { c: "#22C55E", icon: "✅" },
  tip:       { c: "#A78BFA", icon: "💡" },
  celebrate: { c: "#FF9EB0", icon: "🎉" }
};

/* ปัดเลขให้ดูสวย (สำหรับยอดที่แนะนำให้ออม) */
function niceStep(v) {
  v = Number(v) || 0;
  if (v <= 0) return 0;
  if (v < 2000) return Math.max(100, Math.round(v / 100) * 100);
  return Math.round(v / 500) * 500;
}

/* ============================================================
   เอนจิน: วิเคราะห์ข้อมูลทั้งหมด → คืนการ์ดคำแนะนำที่จัดอันดับแล้ว
   ctx = { salary, totalIn, fixedTotal, instTotal, free, freeSafe,
           irregularTotal, irregularNames, items, goals, streak, score }
   การ์ด = { id, tone, icon?, title, body, action?:{label, tab} }
   ============================================================ */
function buildInsights(ctx) {
  const cards = [];
  const push = (priority, c) => cards.push(Object.assign({ priority }, c));

  const salary = Number(ctx.salary) || 0;
  const totalIn = Number(ctx.totalIn) || 0;
  const fixed = Number(ctx.fixedTotal) || 0;
  const inst = Number(ctx.instTotal) || 0;
  const free = Number(ctx.free) || 0;
  const freeSafe = Number(ctx.freeSafe) || 0;
  const items = ctx.items || [];
  const goals = ctx.goals || [];
  const active = items.filter((it) => !isDone(it));
  const instRatio = salary > 0 ? inst / salary : 0;
  const fixedRatio = salary > 0 ? fixed / salary : 0;

  /* 1) รายจ่ายเกินรายรับ — เร่งด่วนสุด */
  if (free < 0) {
    push(100, {
      id: "overspend", tone: "alert",
      title: "เดือนนี้จ่ายเกินรายรับ " + baht(-free),
      body: "ลองชะลอผ่อนของชิ้นใหม่ หรือดูค่าใช้จ่ายประจำที่พอตัดได้ก่อนน้า เดี๋ยวเงินก้อนสำรองจะร่อยหรอ",
      action: { label: "ดูรายการผ่อน", tab: "installments" }
    });
  } else if (freeSafe < 0) {
    /* 2) บวกได้เพราะรายรับไม่แน่นอน */
    push(86, {
      id: "irregular-risk", tone: "warn",
      title: "เดือนนี้บวกได้เพราะรายรับไม่แน่นอน",
      body: "ถ้าเดือนไหนไม่มี " + (ctx.irregularNames || "OT/ขายเวร") + " จะติดลบ " + baht(-freeSafe) + " ค่อยๆ กันเผื่อไว้สักหน่อยน้า"
    });
  }

  /* 3) ผ่อนหนักเกิน 40% ของเงินเดือน */
  if (instRatio > 0.4) {
    push(80, {
      id: "inst-heavy", tone: "warn",
      title: "ผ่อนรวมกินไป " + Math.round(instRatio * 100) + "% ของเงินเดือน",
      body: "เดือนนึงผ่อนตั้ง " + baht(inst) + " เกินเกณฑ์สบายใจ (40%) แล้วน้า ผ่อนหมดชิ้นไหนแล้วอย่าเพิ่งก่อใหม่ทันที"
    });
  }

  /* 4) ค่าใช้จ่ายประจำหนักเกินครึ่ง */
  if (fixedRatio > 0.5) {
    push(68, {
      id: "fixed-heavy", tone: "warn",
      title: "ค่าใช้จ่ายประจำสูงถึง " + Math.round(fixedRatio * 100) + "%",
      body: "ค่าประจำ " + baht(fixed) + "/เดือน ค่อนข้างหนัก ลองไล่ดูว่ามีบิลไหนลดหรือยกเลิกได้บ้างน้า"
    });
  }

  /* 5) อีกงวดเดียวก็ปลด + เงินที่จะคืนกลับมา */
  const almost = active
    .filter((it) => monthsLeftOf(it) === 1 && (Number(it.monthly) || 0) > 0)
    .sort((a, b) => (Number(b.monthly) || 0) - (Number(a.monthly) || 0))[0];
  if (almost) {
    push(78, {
      id: "almost-done", tone: "good",
      title: "อีกงวดเดียว “" + almost.name + "” ก็ปลดแล้ว!",
      body: "จ่ายอีกครั้งก็หมด แล้วจะมีเงินคืนมา " + baht(almost.monthly) + "/เดือน เอาไปออมความฝันต่อได้เลยน้า",
      action: { label: "ไปจ่ายงวด", tab: "installments" }
    });
  }

  /* 6) ความฝันใกล้ถึง (>=80%) */
  const near = dreamNearest(goals);
  const nearActive = near && (Number(near.saved) || 0) < (Number(near.target) || 1) ? near : null;
  if (nearActive) {
    const pct = Math.round((Number(near.saved) || 0) / (Number(near.target) || 1) * 100);
    if (pct >= 80) {
      push(74, {
        id: "dream-close", tone: "celebrate",
        title: "อีก " + (100 - pct) + "% “" + near.name + "” ก็ถึงฝันแล้ว!",
        body: "เหลืออีกแค่ " + baht(Math.max(0, (Number(near.target) || 0) - (Number(near.saved) || 0))) + " เก็บอีกนิดเดียวน้า ✨",
        action: { label: "ออมเพิ่ม", tab: "savings" }
      });
    }
  }

  /* 7) ของที่จะผ่อนหมดเร็วๆ นี้ → วางแผนเอาเงินไปต่อ */
  const soon = active
    .filter((it) => { const m = monthsLeftOf(it); return m >= 2 && m <= 3 && (Number(it.monthly) || 0) > 0; })
    .sort((a, b) => monthsLeftOf(a) - monthsLeftOf(b))[0];
  if (soon && !almost) {
    push(60, {
      id: "freeing-soon", tone: "tip",
      title: "อีก " + monthsLeftOf(soon) + " เดือน “" + soon.name + "” จะผ่อนหมด",
      body: "พอหมดแล้วจะมี " + baht(soon.monthly) + "/เดือนว่างขึ้นมา วางแผนเอาไปออมต่อตั้งแต่ตอนนี้เลยน้า"
    });
  }

  /* 8) มีเงินเหลือแต่ยังไม่มีเป้าหมายออม */
  if (free > 0 && goals.length === 0) {
    push(66, {
      id: "no-goal", tone: "tip",
      title: "เหลือใช้ " + baht(free) + "/เดือน — ลองตั้งเป้าออมดูไหม",
      body: "มีเงินเหลือแบบนี้ ถ้าตั้งความฝันสักอย่าง น้องเพลินจะช่วยคำนวณให้ว่าต้องออมเดือนละเท่าไหร่ถึงจะถึง",
      action: { label: "ตั้งความฝัน", tab: "savings" }
    });
  }

  /* 9) เงินเหลือช่วยให้ถึงฝันเร็วขึ้น */
  if (nearActive && free > 0) {
    const calc = dreamCalc(near);
    const monthly = Number(near.monthly) || 0;
    const remaining = Math.max(0, (Number(near.target) || 0) - (Number(near.saved) || 0));
    if (remaining > 0) {
      const step = niceStep(free * 0.3);
      const baseM = monthly > 0 ? Math.ceil(remaining / monthly) : null;
      const fastM = Math.ceil(remaining / (monthly + step));
      if (step > 0 && baseM && baseM - fastM >= 1) {
        push(58, {
          id: "dream-boost", tone: "tip",
          title: "เร่งถึงฝัน “" + near.name + "” ได้อีกน้า",
          body: "ถ้าเติมจากเงินเหลืออีกเดือนละ " + baht(step) + " จะถึงฝันเร็วขึ้น " + (baseM - fastM) + " เดือน",
          action: { label: "ออมเพิ่ม", tab: "savings" }
        });
      }
    }
  }

  /* 10) ยังไม่มีเงินก้อนฉุกเฉิน */
  const hasEmergency = goals.some((g) => g.category === "emergency");
  if (free > 0 && !hasEmergency) {
    const target = niceStep((fixed + inst) * 3);
    if (target > 0) {
      push(54, {
        id: "emergency", tone: "tip",
        title: "ลองกันเงินก้อนฉุกเฉินไว้สักหน่อย",
        body: "เผื่อเดือนที่รายได้สะดุด ตั้งเป้าสัก 3 เดือนของรายจ่าย (~" + baht(target) + ") จะอุ่นใจขึ้นเยอะน้า",
        action: { label: "ตั้งเป้าฉุกเฉิน", tab: "savings" }
      });
    }
  }

  /* 11) จ่ายตรงเวลาต่อเนื่อง */
  if ((ctx.streak || 0) >= 3) {
    push(50, {
      id: "streak", tone: "celebrate",
      title: "จ่ายตรงเวลา " + ctx.streak + " เดือนติด! 🔥",
      body: "วินัยดีมากเลยน้า ความสม่ำเสมอแบบนี้แหละที่ทำให้คะแนนการเงินค่อยๆ ขึ้น"
    });
  }

  /* 12) ออมได้สัดส่วนดี */
  if (free > 0 && totalIn > 0) {
    const rate = free / totalIn;
    if (rate >= 0.2) {
      push(46, {
        id: "save-rate", tone: "good",
        title: "เหลือเก็บได้ตั้ง " + Math.round(rate * 100) + "% ของรายรับ",
        body: "สุขภาพการเงินแข็งแรงมาก ส่วนที่เหลือนี้แบ่งไปลงทุนหรือออมความฝันต่อได้สบายๆ น้า"
      });
    } else if (rate < 0.1 && inst === 0) {
      push(44, {
        id: "save-low", tone: "tip",
        title: "เหลือเก็บแค่ " + Math.round(rate * 100) + "% ของรายรับ",
        body: "ลองตั้งโอนอัตโนมัติเข้าเงินออมทันทีวันเงินเดือนออก ค่อยๆ ขยับให้ถึงสัก 10% ก่อนน้า"
      });
    }
  }

  /* 13) สบายๆ ไม่มีหนี้ */
  if (inst === 0 && free > 0 && salary > 0) {
    push(40, {
      id: "debt-free", tone: "good",
      title: "ตอนนี้ไม่มีภาระผ่อนเลย เบาสบาย",
      body: "จังหวะดีที่จะสะสมเงินก้อน หรือเริ่มความฝันใหม่โดยไม่ต้องกังวลเรื่องงวดน้า"
    });
  }

  /* fallback — ให้มีการ์ดอย่างน้อยหนึ่งใบเสมอ */
  if (!cards.length) {
    push(10, {
      id: "welcome", tone: "tip",
      title: "ใส่ข้อมูลให้น้องเพลินช่วยวิเคราะห์น้า",
      body: salary > 0
        ? "เพิ่มรายการผ่อนหรือความฝัน แล้วน้องเพลินจะคอยส่องโอกาสการเงินมาบอกเรื่อยๆ"
        : "เริ่มจากใส่เงินเดือน แล้วน้องเพลินจะช่วยมองหาช่องทางออม-ปลดหนี้ให้น้า"
    });
  }

  return cards.sort((a, b) => b.priority - a.priority);
}

/* ---------- การ์ดคำแนะนำหนึ่งใบ ---------- */
function InsightCard({ card, onNav, index }) {
  const e = React.createElement;
  const tone = INSIGHT_TONES[card.tone] || INSIGHT_TONES.tip;
  const c = tone.c;
  return e("div", {
    className: "card-in",
    style: {
      position: "relative", display: "flex", gap: 12,
      background: "#fff", border: "1px solid " + line, borderRadius: 18,
      padding: "14px 14px 14px 16px", boxShadow: "0 4px 14px #5a4a5210",
      overflow: "hidden", animationDelay: (index * 0.05) + "s"
    }
  },
    e("span", { style: { position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: c, borderRadius: "0 4px 4px 0" } }),
    e("div", { style: { width: 38, height: 38, flexShrink: 0, borderRadius: 12, background: c + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 } }, card.icon || tone.icon),
    e("div", { style: { flex: 1, minWidth: 0 } },
      e("div", { style: { fontSize: 14.5, fontWeight: 700, color: ink, lineHeight: 1.35 } }, card.title),
      e("div", { style: { fontSize: 12.5, color: muted, lineHeight: 1.55, marginTop: 3 } }, card.body),
      card.action && onNav && e("button", {
        onClick: () => onNav(card.action.tab),
        style: { marginTop: 10, background: c + "14", color: c, border: "none", borderRadius: 10, padding: "7px 13px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }
      }, card.action.label + " →")));
}

/* ---------- เด็คคำแนะนำ (เรือธง) — วางบนหน้าหลัก ---------- */
function InsightDeck({ ctx, onNav, max = 4 }) {
  const e = React.createElement;
  const [open, setOpen] = useState(false);
  const all = React.useMemo(() => buildInsights(ctx), [JSON.stringify(ctx)]);
  if (!all.length) return null;
  const shown = open ? all : all.slice(0, max);
  return e("section", { style: { marginBottom: 16 } },
    e("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 } },
      e("span", { style: { fontSize: 15, fontWeight: 700, color: ink } }, "💡 น้องเพลินแนะนำ"),
      e("span", { style: { fontSize: 11.5, color: muted } }, "วิเคราะห์จากข้อมูลของคุณ")),
    e("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
      shown.map((card, i) => e(InsightCard, { key: card.id, card: card, onNav: onNav, index: i }))),
    all.length > max && e("button", {
      onClick: () => setOpen(!open),
      style: { width: "100%", marginTop: 10, background: "#fff", border: "1px solid " + line, borderRadius: 12, padding: "9px", fontSize: 13, fontWeight: 600, color: muted, cursor: "pointer" }
    }, open ? "ย่อกลับ" : "ดูคำแนะนำอีก " + (all.length - max) + " ข้อ"));
}

/* ============================================================
   เฟส 4 — Monthly Reflection + อารมณ์ประจำเดือน
   moods (ไม่บังคับ): แมป { "YYYY-MM": "happy"|"ok"|"meh"|"down" }
   onSetMood (ไม่บังคับ): (ym, mood) => void  — ถ้าไม่ส่งมาจะใช้อารมณ์ที่คำนวณให้อัตโนมัติ
   ============================================================ */
const MOODS = [
  { id: "happy", emoji: "😄", label: "สดใส", c: "#22C55E" },
  { id: "ok",    emoji: "🙂", label: "โอเค", c: "#FF8A4C" },
  { id: "meh",   emoji: "😐", label: "เฉยๆ", c: "#A78BFA" },
  { id: "down",  emoji: "😟", label: "เครียด", c: "#EF4444" }
];
const moodMeta = (id) => MOODS.find((m) => m.id === id) || MOODS[1];
function autoMood(score, free) {
  if (free < 0) return "down";
  if (score >= 80) return "happy";
  if (score >= 60) return "ok";
  if (score >= 40) return "meh";
  return "down";
}

function MonthlyReflection({ items, score, free, instTotal, moods, onSetMood }) {
  const e = React.createElement;
  const now = new Date();
  const ym = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
  const thisYM = ym(now);

  const paidThis = paidInYM(items, thisYM);
  const cntThis = countPaidInYM(items, thisYM);
  const lastDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const paidLast = paidInYM(items, ym(lastDate));

  const userMood = moods ? moods[thisYM] : null;
  const moodId = userMood || autoMood(score, free);
  const mm = moodMeta(moodId);

  /* แถบ 6 เดือนย้อนหลัง: อารมณ์ที่บันทึก (หรือคำนวณจากการจ่าย) */
  const history = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = ym(d);
    const paid = paidInYM(items, key);
    const logged = moods ? moods[key] : null;
    history.push({ key, label: THMONTH[d.getMonth()], paid, mood: logged });
  }
  const maxPaid = Math.max(1, ...history.map((h) => h.paid));

  let reflectText;
  if (paidThis <= 0) reflectText = "เดือนนี้ยังไม่ได้ลงงวดเลย ถ้าจ่ายแล้วอย่าลืมกดบันทึกไว้น้า จะได้เห็นเส้นทางชัดๆ";
  else if (paidThis >= paidLast && paidLast > 0) reflectText = "เดือนนี้จ่ายไป " + baht(paidThis) + " (" + cntThis + " งวด) เดินหน้าได้ดีกว่าเดือนก่อนเลยน้า";
  else reflectText = "เดือนนี้จ่ายไป " + baht(paidThis) + " ใน " + cntThis + " งวด ค่อยเป็นค่อยไป ทำได้ดีแล้วน้า";

  return e("section", { style: S.card },
    e("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
      e(Coin, { mood: moodId === "happy" ? "happy" : moodId === "down" ? "panic" : "worry", size: 50 }),
      e("div", { style: { flex: 1, minWidth: 0 } },
        e("div", { style: { fontSize: 13, fontWeight: 700, color: muted } }, "🪞 ทบทวนเดือนนี้"),
        e("div", { style: { fontSize: 17, fontWeight: 700, color: ink } }, THMONTH[now.getMonth()] + " " + (now.getFullYear() + 543))),
      e("span", { style: { fontSize: 13, fontWeight: 700, color: mm.c, background: mm.c + "14", borderRadius: 999, padding: "5px 11px" } }, mm.emoji + " " + mm.label)),

    e("div", { style: { fontSize: 13, color: ink, lineHeight: 1.55, marginTop: 12, background: "#FFF7EF", borderRadius: 12, padding: "11px 13px" } }, reflectText),

    /* ตัวเลือกอารมณ์ (เฉพาะเมื่อ app ส่ง onSetMood มา) */
    onSetMood && e("div", { style: { marginTop: 12 } },
      e("div", { style: { fontSize: 12, color: muted, marginBottom: 7 } }, "เดือนนี้รู้สึกยังไงกับการเงินบ้าง?"),
      e("div", { style: { display: "flex", gap: 8 } }, MOODS.map((m) =>
        e("button", {
          key: m.id, onClick: () => onSetMood(thisYM, m.id),
          style: {
            flex: 1, background: userMood === m.id ? m.c + "16" : "#fff",
            border: "2px solid " + (userMood === m.id ? m.c : line),
            borderRadius: 14, padding: "9px 4px", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2
          }
        }, e("span", { style: { fontSize: 22 } }, m.emoji),
           e("span", { style: { fontSize: 10.5, fontWeight: 600, color: userMood === m.id ? m.c : muted } }, m.label))))),

    /* สรุปตัวเลขเดือนนี้ */
    e("div", { style: S.aStatRow },
      e("div", { style: S.aStat }, e("div", { style: Object.assign({}, S.aStatNum, { color: teal }) }, baht(paidThis)), e("div", { style: S.aStatLbl }, "จ่ายงวดเดือนนี้")),
      e("div", { style: S.aStat }, e("div", { style: S.aStatNum }, cntThis), e("div", { style: S.aStatLbl }, "จำนวนงวด")),
      e("div", { style: S.aStat }, e("div", { style: Object.assign({}, S.aStatNum, { color: free >= 0 ? amber : red }) }, (free < 0 ? "−" : "") + baht(Math.abs(free))), e("div", { style: S.aStatLbl }, "เหลือใช้"))),

    /* แถบ 6 เดือน — จังหวะการจ่าย + อารมณ์ที่บันทึก */
    e("div", { style: { marginTop: 16 } },
      e("div", { style: { fontSize: 12, color: muted, marginBottom: 8 } }, "ย้อนหลัง 6 เดือน"),
      e("div", { style: { display: "flex", alignItems: "flex-end", gap: 6, height: 70 } }, history.map((h, i) => {
        const hPct = Math.round(h.paid / maxPaid * 100);
        const col = h.mood ? moodMeta(h.mood).c : (h.paid > 0 ? amber : line);
        return e("div", { key: i, style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 } },
          h.mood && e("span", { style: { fontSize: 13 } }, moodMeta(h.mood).emoji),
          e("div", { style: { width: "100%", maxWidth: 28, height: Math.max(6, hPct * 0.5) + "px", background: col, borderRadius: 6, transition: "height .4s ease" } }),
          e("span", { style: { fontSize: 10, color: muted } }, h.label));
      }))));
}

/* ============================================================
   เฟส 4 — Financial Journey (ไทม์ไลน์ก้าวสำคัญ)
   สร้างจากข้อมูลจริง: เริ่มจ่ายงวดแรก, ปลดหนี้แต่ละชิ้น,
   ถึงฝันแต่ละอัน, สถิติจ่ายตรงเวลา, ยอดรวมที่จ่ายไปแล้ว
   ============================================================ */
function buildJourney(items, goals, streak) {
  const ms = [];
  const allPays = [];
  items.forEach((it) => (it.payments || []).forEach((p) => { if (p.date) allPays.push({ date: p.date, it: it }); }));
  allPays.sort((a, b) => (a.date < b.date ? -1 : 1));

  if (allPays.length) {
    ms.push({ date: allPays[0].date, icon: "🚩", c: "#A78BFA", title: "ออกเดินทาง", sub: "จ่ายงวดแรก — " + (allPays[0].it.name || "รายการแรก") });
  }
  /* ปลดหนี้แต่ละชิ้น (ใช้วันจ่ายล่าสุดของชิ้นนั้น) */
  items.filter((it) => isDone(it)).forEach((it) => {
    const ps = (it.payments || []).filter((p) => p.date).map((p) => p.date).sort();
    const d = ps.length ? ps[ps.length - 1] : null;
    ms.push({ date: d, icon: "🎊", c: "#22C55E", title: "ปลดหนี้ “" + (it.name || "รายการ") + "”", sub: "ผ่อนครบ " + baht(it.total) + " แล้ว" });
  });
  /* ถึงฝัน (ไม่มีวันที่ — วางไว้ตามลำดับท้าย) */
  goals.filter((g) => (Number(g.saved) || 0) >= (Number(g.target) || 0) && (Number(g.target) || 0) > 0).forEach((g) => {
    ms.push({ date: null, icon: (dreamCat(g.category).emoji || "⭐"), c: dreamCat(g.category).c2, title: "ถึงฝัน “" + (g.name || "ความฝัน") + "”", sub: "ออมครบ " + baht(g.target) + " 🎉" });
  });
  /* สถิติจ่ายตรงเวลา */
  [12, 6, 3].forEach((n) => { if ((streak || 0) >= n) ms.push({ date: null, icon: "🔥", c: "#F59E0B", title: "จ่ายตรงเวลา " + n + " เดือนติด", sub: "วินัยการเงินสุดยอด" }); });

  /* เรียง: รายการมีวันที่ขึ้นก่อน (เก่า→ใหม่) แล้วต่อด้วยรายการไม่มีวันที่ */
  const dated = ms.filter((m) => m.date).sort((a, b) => (a.date < b.date ? -1 : 1));
  const undated = ms.filter((m) => !m.date);
  /* กันซ้ำสถิติ streak — เอาอันสูงสุดพอ */
  const seenStreak = undated.filter((m) => m.icon === "🔥").slice(0, 1);
  const noStreak = undated.filter((m) => m.icon !== "🔥");
  return dated.concat(noStreak, seenStreak);
}

function FinancialJourney({ items, goals, streak }) {
  const e = React.createElement;
  const ms = buildJourney(items, goals, streak);
  const totalPaid = items.reduce((s, it) => s + (it.payments || []).reduce((a, p) => a + (Number(p.amount) || 0), 0), 0);

  if (!ms.length) {
    return e("section", { style: S.card },
      e("div", { style: S.cardLabel }, "🗺️ เส้นทางการเงิน"),
      e("div", { style: { textAlign: "center", padding: "16px 8px" } },
        e("div", { style: { fontSize: 30, marginBottom: 6 } }, "🌱"),
        e("div", { style: { fontWeight: 700, color: ink } }, "เส้นทางเพิ่งเริ่มต้น"),
        e("div", { style: { fontSize: 13, color: muted, marginTop: 4, lineHeight: 1.5 } }, "พอเริ่มจ่ายงวดหรือออมถึงฝัน ก้าวสำคัญต่างๆ จะมาเรียงเป็นเส้นทางตรงนี้น้า")));
  }

  const dot = (m, i, last) => e("div", { key: i, style: { display: "flex", gap: 12, position: "relative" } },
    e("div", { style: { display: "flex", flexDirection: "column", alignItems: "center" } },
      e("div", { style: { width: 34, height: 34, borderRadius: 999, background: m.c + "18", border: "2px solid " + m.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, zIndex: 1 } }, m.icon),
      !last && e("div", { style: { width: 2, flex: 1, minHeight: 18, background: line, margin: "2px 0" } })),
    e("div", { style: { paddingBottom: last ? 0 : 16, flex: 1, minWidth: 0 } },
      e("div", { style: { fontSize: 14, fontWeight: 700, color: ink, lineHeight: 1.35 } }, m.title),
      e("div", { style: { fontSize: 12, color: muted, marginTop: 1 } }, m.sub),
      m.date && e("div", { style: { fontSize: 11, color: muted, marginTop: 2 } }, thDateFull(m.date))));

  /* ปลายทาง = สถานะวันนี้ */
  const today = e("div", { key: "now", style: { display: "flex", gap: 12 } },
    e("div", { style: { width: 34, height: 34, borderRadius: 999, background: amber, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, boxShadow: "0 4px 12px " + amber + "66" } }, "📍"),
    e("div", null,
      e("div", { style: { fontSize: 14, fontWeight: 700, color: amber } }, "วันนี้"),
      e("div", { style: { fontSize: 12, color: muted, marginTop: 1 } }, "จ่ายไปแล้วทั้งหมด " + baht(totalPaid))));

  return e("section", { style: S.card },
    e("div", { style: { fontSize: 15, fontWeight: 700, color: ink, marginBottom: 14 } }, "🗺️ เส้นทางการเงินของคุณ"),
    e("div", null, ms.map((m, i) => dot(m, i, false)), today));
}

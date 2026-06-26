/* ============================ Dream Board (Phase 1) ============================ */
const DREAM_CATS = [
  { id: "camera", label: "กล้อง", emoji: "📷", c1: "#A78BFA", c2: "#7C3AED" },
  { id: "car", label: "รถ", emoji: "🚗", c1: "#60A5FA", c2: "#2563EB" },
  { id: "travel", label: "เที่ยว", emoji: "🏝", c1: "#2DD4BF", c2: "#0EA5E9" },
  { id: "home", label: "บ้าน", emoji: "🏠", c1: "#FBBF24", c2: "#F59E0B" },
  { id: "study", label: "เรียน", emoji: "🎓", c1: "#F472B6", c2: "#DB2777" },
  { id: "wedding", label: "แต่งงาน", emoji: "💍", c1: "#FDA4AF", c2: "#FB7185" },
  { id: "emergency", label: "ฉุกเฉิน", emoji: "🛟", c1: "#34D399", c2: "#059669" },
  { id: "other", label: "อื่นๆ", emoji: "⭐", c1: "#C4B5FD", c2: "#8B5CF6" }
];
const dreamCat = (id) => DREAM_CATS.find((c) => c.id === id) || DREAM_CATS[7];
const PRIOS = [{ id: "high", label: "สูง", c: "#EF4444" }, { id: "mid", label: "กลาง", c: "#F59E0B" }, { id: "low", label: "ต่ำ", c: "#10B981" }];
const prioMeta = (id) => PRIOS.find((p) => p.id === id) || PRIOS[1];
const dreamGhost = { background: "#F1F5F9", color: "#334155", border: "none", borderRadius: 12, padding: "10px 12px", fontWeight: 600, fontSize: 13.5, cursor: "pointer" };
const dreamCatChip = { background: "#fff", border: "2px solid #F1F5F9", borderRadius: 999, padding: "7px 12px", fontSize: 13, fontWeight: 600, color: "#64748B", cursor: "pointer" };
const dreamChip = { background: "#fff", border: "2px solid #F1F5F9", borderRadius: 999, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "#1E293B", cursor: "pointer" };
function addMonthsD(d, n) { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; }
function monthsUntil(toStr) { if (!toStr) return 0; const to = new Date(toStr.length === 7 ? toStr + "-01" : toStr); const f = new Date(); return (to.getFullYear() - f.getFullYear()) * 12 + (to.getMonth() - f.getMonth()); }
function thMonthYear(d) { const x = (d instanceof Date) ? d : new Date(d); return THMONTH[x.getMonth()] + " " + (x.getFullYear() + 543); }
function thDateFull(d) { const x = (d instanceof Date) ? d : new Date(d.length === 7 ? d + "-01" : d); return x.getDate() + " " + THMONTH[x.getMonth()] + " " + (x.getFullYear() + 543); }
function dreamCalc(g) {
  const target = Number(g.target) || 0, saved = Number(g.saved) || 0;
  const remaining = Math.max(0, target - saved), monthly = Number(g.monthly) || 0;
  const r = { remaining: remaining, done: target > 0 && remaining <= 0 };
  if (remaining > 0 && monthly > 0) { r.monthsLeft = Math.ceil(remaining / monthly); r.completion = addMonthsD(new Date(), r.monthsLeft); }
  if (remaining > 0 && g.targetDate) { const m = Math.max(1, monthsUntil(g.targetDate)); r.required = Math.ceil(remaining / m); r.monthsToDate = m; }
  if (r.monthsLeft && r.required) { r.onTrack = monthly >= r.required; }
  return r;
}
function dreamCalcText(g, c) {
  if (c.done) return "ออมครบเป้าแล้ว ยินดีด้วยน้า 🎉";
  const monthly = Number(g.monthly) || 0; const parts = ["เหลืออีก " + baht(c.remaining)];
  if (monthly > 0 && c.monthsLeft) parts.push("ออมเดือนละ " + baht(monthly) + " → ถึงฝันใน " + c.monthsLeft + " เดือน (~" + thMonthYear(c.completion) + ")");
  if (c.required && monthly <= 0) parts.push("อยากได้ภายใน " + thDateFull(g.targetDate) + " → ต้องออม " + baht(c.required) + "/เดือน");
  if (c.required && monthly > 0 && c.onTrack === false) parts.push("⚠️ ออมเท่านี้จะช้ากว่ากำหนด ต้องออม " + baht(c.required) + "/เดือนถึงจะทัน");
  if (c.required && monthly > 0 && c.onTrack === true) parts.push("✓ อัตรานี้ทันวันเป้าหมายสบายๆ");
  if (monthly <= 0 && !c.required) parts.push("ใส่ยอดออม/เดือน หรือวันเป้าหมาย เพื่อคำนวณวันถึงฝันได้น้า");
  return parts.join(" · ");
}
function dreamMotivation(goals) {
  const active = goals.filter((g) => (Number(g.saved) || 0) < (Number(g.target) || 0));
  const base = ["ทุกการวางแผน คือก้าวเล็กๆ สู่อนาคตที่ยิ่งใหญ่", "ออมวันนี้ พรุ่งนี้ฝันใกล้เข้ามาอีกนิด", "ค่อยๆ เก็บ ค่อยๆ โต เดี๋ยวก็ถึงฝันน้า", "เก่งมากที่เริ่มวางแผน — อนาคตขอบคุณเลย"];
  let msg = base[new Date().getMonth() % base.length];
  if (active.length) {
    const near = active.slice().sort((a, b) => ((Number(b.saved) || 0) / (Number(b.target) || 1)) - ((Number(a.saved) || 0) / (Number(a.target) || 1)))[0];
    const pct = Math.round((Number(near.saved) || 0) / (Number(near.target) || 1) * 100);
    if (pct > 0) msg = "อีก " + (100 - pct) + "% ก็ถึงฝัน “" + near.name + "” แล้วน้า ✨";
  }
  return msg;
}
function dreamAccounts(goals) { var s = []; goals.forEach(function (g) { var a = (g.account || "").trim(); if (a && s.indexOf(a) < 0) s.push(a); }); return s; }
function dreamAccountTotals(goals) { var m = {}; goals.forEach(function (g) { var a = (g.account || "").trim(); if (!a) return; m[a] = (m[a] || 0) + (Number(g.saved) || 0); }); return Object.keys(m).map(function (k) { return { account: k, saved: m[k] }; }); }
function DreamOverlay({ title, children, onClose }) {
  const e = React.createElement;
  return e("div", { style: { position: "fixed", inset: 0, background: "rgba(30,41,51,.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 60, backdropFilter: "blur(2px)" }, onClick: onClose },
    e("div", { onClick: (ev) => ev.stopPropagation(), style: { background: bg, width: "100%", maxWidth: 460, borderRadius: "24px 24px 0 0", padding: "10px 18px 26px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 -8px 30px rgba(0,0,0,.18)" } },
      e("div", { style: { width: 44, height: 5, background: "rgba(0,0,0,.12)", borderRadius: 999, margin: "4px auto 12px" } }),
      e("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 } },
        e("h2", { style: { fontSize: 18, fontWeight: 700, margin: 0, color: ink } }, title),
        e("button", { onClick: onClose, style: { background: "#fff", border: "2px solid " + line, width: 32, height: 32, borderRadius: 10, fontSize: 13, color: ink, cursor: "pointer" } }, "✕")),
      children));
}
function DreamBoard({ goals, onAdd, onUpdate, onAddSaved, onRemove }) {
  const e = React.createElement;
  const [modal, setModal] = useState(null);
  return e("div", null,
    e("section", { style: S.card },
      e("div", { style: S.cardLabel }, "✨ กระดานความฝัน"),
      e("div", { style: { fontSize: 13, color: muted, marginTop: 6, lineHeight: 1.5 } }, dreamMotivation(goals)), (function () { var tt = dreamAccountTotals(goals); return tt.length ? e("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 } }, tt.map(function (t, i) { return e("span", { key: i, style: { fontSize: 11.5, fontWeight: 600, color: "#475569", background: "#F1F5F9", borderRadius: 999, padding: "4px 10px" } }, "🏦 " + t.account + " " + baht(t.saved)); })) : null; })()),
    e("button", { style: Object.assign({}, S.addBtn, { width: "100%", justifyContent: "center", marginBottom: 14 }), onClick: () => setModal({ mode: "add" }) }, "+ เพิ่มความฝัน"),
    goals.length === 0
      ? e("div", { style: S.emptyCard }, e("div", { style: { fontSize: 34 } }, "🌈"), e("div", { style: { fontWeight: 700 } }, "ยังไม่มีความฝัน"), e("div", { style: S.emptyText }, "เพิ่มสิ่งที่อยากได้หรืออยากทำ แล้วมาดูว่าต้องออมเดือนละเท่าไหร่ถึงจะถึงฝัน"))
      : e("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, goals.map((g) => e(DreamCard, { key: g.id, g: g, onSave: () => setModal({ mode: "save", id: g.id }), onEdit: () => setModal({ mode: "edit", id: g.id }), onRemove: () => onRemove(g.id) }))),
    modal && (modal.mode === "save"
      ? e(QuickSaveModal, { g: goals.find((x) => x.id === modal.id), onClose: () => setModal(null), onSave: (amt) => { onAddSaved(modal.id, amt); setModal(null); } })
      : e(DreamModal, { initial: modal.mode === "edit" ? goals.find((x) => x.id === modal.id) : null, accounts: dreamAccounts(goals), onClose: () => setModal(null), onSubmit: (data) => { if (modal.mode === "edit") onUpdate(modal.id, data); else onAdd(data); setModal(null); } })));
}
function DreamCard({ g, onSave, onEdit, onRemove }) {
  const e = React.createElement;
  const cat = dreamCat(g.category);
  const target = Number(g.target) || 0, saved = Number(g.saved) || 0;
  const pct = target > 0 ? Math.min(100, saved / target * 100) : 0;
  const c = dreamCalc(g);
  const prio = g.priority ? prioMeta(g.priority) : null;
  return e("div", { style: { background: "#fff", border: "2px solid " + line, borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 14px #5a4a5212" } },
    e("div", { style: { position: "relative", height: 96, background: "linear-gradient(135deg," + cat.c1 + "," + cat.c2 + ")", display: "flex", alignItems: "center", justifyContent: "center" } },
      e("span", { style: { fontSize: 46, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.2))" } }, g.emoji || cat.emoji),
      e("span", { style: { position: "absolute", top: 10, left: 12, background: "rgba(255,255,255,.85)", color: "#334155", fontWeight: 600, fontSize: 11, padding: "3px 9px", borderRadius: 999 } }, cat.label),
      prio && e("span", { style: { position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,.92)", color: prio.c, fontWeight: 700, fontSize: 11, padding: "3px 9px", borderRadius: 999 } }, "★ " + prio.label)),
    e("div", { style: { padding: 14 } },
      e("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
        e("div", { style: { flex: 1, minWidth: 0 } },
          e("div", { style: { fontSize: 16, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, g.name || "ความฝัน"),
          e("div", { style: { fontSize: 12.5, color: muted, marginTop: 2 } }, "ออมแล้ว " + baht(saved) + " / " + baht(target)),
          g.account ? e("div", { style: { display: "inline-block", marginTop: 5, fontSize: 11, fontWeight: 600, color: "#475569", background: "#F1F5F9", borderRadius: 999, padding: "2px 9px" } }, "🏦 " + g.account) : null),
        e(ProgressRing, { pct: pct, size: 54, stroke: 6, color: cat.c2, label: Math.round(pct) + "%" })),
      e("div", { style: { marginTop: 10, background: "#FAFAFB", border: "1px solid " + line, borderRadius: 12, padding: "10px 12px", fontSize: 12.5, color: "#475569", lineHeight: 1.55 } }, dreamCalcText(g, c)),
      e("div", { style: { display: "flex", gap: 8, marginTop: 12 } },
        c.done
          ? e("div", { style: { flex: 1, textAlign: "center", color: "#10B981", fontWeight: 700, fontSize: 14, padding: "9px" } }, "🎉 ถึงเป้าแล้ว!")
          : e("button", { style: { flex: 1, background: cat.c2, color: "#fff", border: "none", borderRadius: 12, padding: "10px", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }, onClick: onSave }, "+ ออมเร็ว"),
        e("button", { style: dreamGhost, onClick: onEdit }, "แก้ไข"),
        e("button", { style: Object.assign({}, dreamGhost, { color: "#EF4444" }), onClick: onRemove }, "ลบ"))));
}
function QuickSaveModal({ g, onClose, onSave }) {
  const e = React.createElement;
  const [amt, setAmt] = useState("");
  const remaining = Math.max(0, (Number(g.target) || 0) - (Number(g.saved) || 0));
  const chips = [Number(g.monthly) || 0, 500, 1000, remaining].filter((v, i, a) => v > 0 && a.indexOf(v) === i);
  return e(DreamOverlay, { title: "ออมเข้า “" + (g.name || "ความฝัน") + "”", onClose: onClose },
    e("div", { style: { fontSize: 13, color: muted, marginBottom: 12 } }, "ออมแล้ว " + baht(g.saved || 0) + " · เหลือ " + baht(remaining)),
    e("input", { style: S.input, type: "number", inputMode: "numeric", autoFocus: true, value: amt, onChange: (ev) => setAmt(ev.target.value), placeholder: "จำนวนเงินที่ออม" }),
    e("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" } }, chips.map((v, i) => e("button", { key: i, style: dreamChip, onClick: () => setAmt(String(v)) }, (v === remaining ? "เต็มเป้า " : "+") + baht(v)))),
    e("button", { style: Object.assign({}, S.saveBtn, { opacity: Number(amt) > 0 ? 1 : .5 }), disabled: !(Number(amt) > 0), onClick: () => onSave(Number(amt)) }, "บันทึกการออม"));
}
function DreamModal({ initial, accounts = [], onSubmit, onClose }) {
  const e = React.createElement;
  const f = (label, child) => e(Field, { label: label }, child);
  const [name, setName] = useState(initial?.name || "");
  const [category, setCategory] = useState(initial?.category || "other");
  const [emoji, setEmoji] = useState(initial?.emoji || "");
  const [priority, setPriority] = useState(initial?.priority || "mid");
  const [target, setTarget] = useState(initial?.target ?? "");
  const [saved, setSaved] = useState(initial?.saved ?? "");
  const [monthly, setMonthly] = useState(initial?.monthly ?? "");
  const [targetDate, setTargetDate] = useState(initial?.targetDate || "");
  const [account, setAccount] = useState(initial?.account || "");
  const curCat = dreamCat(category);
  const canSave = name.trim() && Number(target) > 0;
  return e(DreamOverlay, { title: initial ? "แก้ไขความฝัน" : "เพิ่มความฝัน", onClose: onClose },
    f("หมวด", e("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, DREAM_CATS.map((c) => e("button", { key: c.id, onClick: () => setCategory(c.id), style: Object.assign({}, dreamCatChip, category === c.id ? { borderColor: c.c2, color: c.c2, background: c.c2 + "12" } : {}) }, c.emoji + " " + c.label)))),
    f("ชื่อความฝัน", e("input", { style: S.input, value: name, onChange: (ev) => setName(ev.target.value), placeholder: "เช่น กล้อง Fujifilm X-T50" })),
    f("ออมไว้บัญชีไหน", e("div", null, e("input", { style: S.input, value: account, onChange: (ev) => setAccount(ev.target.value), placeholder: "เช่น SCB, KBank, เงินสด" }), accounts.length ? e("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 } }, accounts.map((ac) => e("button", { key: ac, onClick: () => setAccount(ac), style: dreamChip }, "🏦 " + ac))) : null)),
    f("ไอคอน (เว้นว่างได้ ใช้ของหมวด " + curCat.emoji + ")", e("input", { style: S.input, value: emoji, onChange: (ev) => setEmoji(ev.target.value), placeholder: curCat.emoji, maxLength: 4 })),
    f("ความสำคัญ", e("div", { style: { display: "flex", gap: 8 } }, PRIOS.map((pr) => e("button", { key: pr.id, onClick: () => setPriority(pr.id), style: Object.assign({}, dreamCatChip, priority === pr.id ? { borderColor: pr.c, color: pr.c, background: pr.c + "12" } : {}) }, "★ " + pr.label)))),
    e("div", { style: { display: "flex", gap: 12 } },
      f("ยอดเป้าหมาย", e("input", { style: S.input, type: "number", inputMode: "numeric", value: target, onChange: (ev) => setTarget(ev.target.value), placeholder: "45000" })),
      f("ออมแล้ว", e("input", { style: S.input, type: "number", inputMode: "numeric", value: saved, onChange: (ev) => setSaved(ev.target.value), placeholder: "0" }))),
    e("div", { style: { fontSize: 12, color: muted, margin: "-4px 0 12px", lineHeight: 1.5 } }, "ใส่ “ออม/เดือน” หรือ “วันเป้าหมาย” อย่างใดอย่างหนึ่ง อีกอันจะคำนวณให้"),
    e("div", { style: { display: "flex", gap: 12 } },
      f("ออม/เดือน", e("input", { style: S.input, type: "number", inputMode: "numeric", value: monthly, onChange: (ev) => setMonthly(ev.target.value), placeholder: "เช่น 4000" })),
      f("วันเป้าหมาย", e("input", { style: S.input, type: "date", value: targetDate, onChange: (ev) => setTargetDate(ev.target.value) }))),
    e("button", { style: Object.assign({}, S.saveBtn, { opacity: canSave ? 1 : .5 }), disabled: !canSave, onClick: () => onSubmit({ name: name.trim(), category: category, emoji: emoji.trim(), priority: priority, target: Number(target) || 0, saved: Number(saved) || 0, monthly: Number(monthly) || 0, targetDate: targetDate, account: account.trim() }) }, "บันทึกความฝัน"));
}

/* ============================ Phase 2: Dream widgets & Score ============================ */

/* --- helpers --- */
function dreamNearest(goals) {
  var active = goals.filter(function(g){ return (Number(g.saved)||0) < (Number(g.target)||1); });
  if (!active.length) return goals.length ? goals[goals.length-1] : null;
  return active.slice().sort(function(a,b){ return (Number(b.saved)||0)/(Number(b.target)||1) - (Number(a.saved)||0)/(Number(a.target)||1); })[0];
}
function calcStreak(items) {
  var now = new Date(), streak = 0;
  for (var m = 0; m < 12; m++) {
    var d = new Date(now.getFullYear(), now.getMonth()-m, 1);
    var ym = d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
    var hasPay = items.some(function(it){ return (it.payments||[]).some(function(p){ return (p.date||"").slice(0,7)===ym; }); });
    if (hasPay) streak++; else if (m>0) break;
  }
  return streak;
}
function calcFinancialScore(salary, fixed, inst, free, goals, items) {
  if (!salary) return 0;
  var s = 100;
  var ratio = (fixed+inst)/(salary||1);
  if (ratio > 0.8) s -= 35; else if (ratio > 0.6) s -= 20; else if (ratio > 0.4) s -= 10;
  if (free < 0) s -= 25;
  var streak = calcStreak(items); s += Math.min(streak*3, 15);
  var dreamPct = goals.length ? goals.reduce(function(a,g){ return a+(Number(g.saved)||0)/(Number(g.target)||1); },0)/goals.length : 0;
  s += Math.round(dreamPct*10);
  return Math.max(0, Math.min(100, Math.round(s)));
}
function scoreColor(n) {
  if (n>=80) return "#22C55E";
  if (n>=60) return "#FF8A4C";
  return "#EF4444";
}
function scoreLabel(n) {
  if (n>=80) return "สุขภาพการเงินดีมาก";
  if (n>=60) return "อยู่ในเกณฑ์ดี";
  if (n>=40) return "พอไหว ระวังหน่อย";
  return "ต้องปรับสมดุลแล้ว";
}

/* --- DreamWidget on home --- */
function DreamWidget({ goals, onSave, onGoToDreams }) {
  var e = React.createElement;
  var g = dreamNearest(goals);
  if (!g) return e("div", { style: { background:"#fff", border:"2px solid "+"#F1F5F9", borderRadius:18, padding:16, marginBottom:14, textAlign:"center" } },
    e("div", { style:{ fontSize:28, marginBottom:6 } }, "🌈"),
    e("div", { style:{ fontWeight:700, marginBottom:4 } }, "ยังไม่มีความฝัน"),
    e("div", { style:{ fontSize:13, color:"#64748B", marginBottom:12 } }, "เพิ่มความฝันแล้วดูว่าต้องออมเท่าไหร่"),
    e("button", { style:{ background:"#FF8A4C", color:"#fff", border:"none", borderRadius:999, padding:"9px 20px", fontWeight:700, fontSize:13.5, cursor:"pointer" }, onClick:onGoToDreams }, "เพิ่มความฝันแรก →"));
  var cat = dreamCat(g.category);
  var target = Number(g.target)||0, saved = Number(g.saved)||0;
  var pct = target>0 ? Math.min(100, saved/target*100) : 0;
  var calc = dreamCalc(g);
  return e("div", { style:{ background:"#fff", border:"2px solid "+"#F1F5F9", borderRadius:18, overflow:"hidden", marginBottom:14, boxShadow:"0 4px 14px #5a4a5210" } },
    e("div", { style:{ background:"linear-gradient(135deg,"+cat.c1+","+cat.c2+")", padding:"12px 16px", display:"flex", alignItems:"center", gap:12 } },
      e("span", { style:{ fontSize:32 } }, g.emoji||cat.emoji),
      e("div", { style:{ flex:1, minWidth:0 } },
        e("div", { style:{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.8)", marginBottom:2 } }, "✨ ความฝันที่ใกล้ถึง"),
        e("div", { style:{ fontSize:17, fontWeight:700, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" } }, g.name||"ความฝัน"),
        e("div", { style:{ fontSize:12, color:"rgba(255,255,255,.85)", marginTop:1 } }, Math.round(pct)+"% · เหลือ "+baht(calc.remaining))),
      e(ProgressRing, { pct:pct, size:52, stroke:5, color:"rgba(255,255,255,.9)", label:Math.round(pct)+"%" })),
    e("div", { style:{ padding:"10px 14px" } },
      e("div", { style:{ height:8, background:"#F1F5F9", borderRadius:999, overflow:"hidden", marginBottom:10 } },
        e("div", { style:{ height:"100%", width:pct+"%", background:"linear-gradient(90deg,"+cat.c1+","+cat.c2+")", borderRadius:999, transition:"width .5s ease" } })),
      calc.monthsLeft
        ? e("div", { style:{ fontSize:12.5, color:"#64748B", marginBottom:10 } }, "ออมเดือนละ "+baht(g.monthly)+" → ถึงฝันใน "+calc.monthsLeft+" เดือน (~"+thMonthYear(calc.completion)+")")
        : calc.required
          ? e("div", { style:{ fontSize:12.5, color:"#64748B", marginBottom:10 } }, "ต้องออม "+baht(calc.required)+"/เดือน ถึงจะทันวันเป้าหมาย")
          : e("div", { style:{ fontSize:12.5, color:"#64748B", marginBottom:10 } }, "ใส่ยอดออม/เดือน เพื่อดูว่าจะถึงฝันเมื่อไหร่"),
      e("div", { style:{ display:"flex", gap:8 } },
        e("button", { style:{ flex:1, background:"linear-gradient(135deg,"+cat.c1+","+cat.c2+")", color:"#fff", border:"none", borderRadius:12, padding:"10px", fontWeight:700, fontSize:13.5, cursor:"pointer" }, onClick:onSave }, "+ ออมเร็ว"),
        e("button", { style:{ background:"#F1F5F9", color:"#1E293B", border:"none", borderRadius:12, padding:"10px 14px", fontWeight:600, fontSize:13, cursor:"pointer" }, onClick:onGoToDreams }, "ดูทั้งหมด"))));
}

/* --- Score + widget strip --- */
function FinancialScoreCard({ score, streak, nextItem, goals, salary, free }) {
  var e = React.createElement;
  var c = scoreColor(score);
  var near = dreamNearest(goals);
  var nearPct = near && Number(near.target)>0 ? Math.round((Number(near.saved)||0)/(Number(near.target)||1)*100) : 0;
  function Widget(icon, val, lbl, col) {
    return e("div", { style:{ flex:1, minWidth:0, textAlign:"center", padding:"8px 4px" } },
      e("div", { style:{ fontSize:20, marginBottom:1 } }, icon),
      e("div", { style:{ fontFamily:"'Prompt',sans-serif", fontSize:13, fontWeight:700, color:col||"#1E293B", lineHeight:1.1 } }, val),
      e("div", { style:{ fontSize:10, color:"#64748B", marginTop:2, lineHeight:1.2 } }, lbl));
  }
  return e("div", { style:{ background:"#fff", border:"2px solid "+"#F1F5F9", borderRadius:18, overflow:"hidden", marginBottom:14, boxShadow:"0 4px 14px #5a4a5210" } },
    e("div", { style:{ background:"linear-gradient(135deg,"+c+"22,"+c+"08)", padding:"14px 16px", display:"flex", alignItems:"center", gap:14 } },
      e("div", { style:{ position:"relative", width:62, height:62, flexShrink:0 } },
        e("svg", { width:62, height:62, style:{ transform:"rotate(-90deg)" } },
          e("circle", { cx:31, cy:31, r:26, fill:"none", stroke:"#F1F5F9", strokeWidth:6 }),
          e("circle", { cx:31, cy:31, r:26, fill:"none", stroke:c, strokeWidth:6, strokeDasharray:(2*Math.PI*26), strokeDashoffset:(2*Math.PI*26*(1-score/100)), strokeLinecap:"round", style:{ transition:"stroke-dashoffset .6s ease" } })),
        e("div", { style:{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" } },
          e("div", { style:{ fontFamily:"'Prompt',sans-serif", fontSize:16, fontWeight:700, color:c, lineHeight:1 } }, score),
          e("div", { style:{ fontSize:9, color:"#64748B" } }, "/ 100"))),
      e("div", { style:{ flex:1 } },
        e("div", { style:{ fontSize:11, color:"#64748B", marginBottom:2 } }, "⭐ คะแนนการเงิน"),
        e("div", { style:{ fontSize:15, fontWeight:700, color:c } }, scoreLabel(score)),
        salary > 0 && e("div", { style:{ fontSize:12, color:"#64748B", marginTop:3 } }, free >= 0 ? "เหลือใช้ "+baht(free)+"/เดือน" : "รายจ่ายเกินงบ "+baht(-free)))),
    e("div", { style:{ display:"flex", borderTop:"1px solid "+"#F1F5F9" } },
      Widget("🔥", streak ? streak+" เดือน" : "-", "Streak จ่ายงวด", streak>=3?"#F59E0B":"#1E293B"),
      e("div", { style:{ width:1, background:"#F1F5F9" } }),
      Widget("💰", near ? nearPct+"%" : "-", near ? "ความฝัน: "+near.name.slice(0,8) : "ยังไม่มีฝัน", near && nearPct>=50?"#22C55E":"#1E293B"),
      e("div", { style:{ width:1, background:"#F1F5F9" } }),
      Widget("📅", nextItem ? nextItem.emoji+" "+baht(nextItem.monthly) : "-", nextItem ? nextItem.name.slice(0,7) : "ไม่มีงวด", "#1E293B")));
}
const NAV_ITEMS = [{
  id: "home",
  icon: "🏠",
  label: "หน้าหลัก"
}, {
  id: "installments",
  icon: "💳",
  label: "ผ่อน"
}, {
  id: "analytics",
  icon: "📈",
  label: "วิเคราะห์"
}, {
  id: "savings",
  icon: "🌈",
  label: "ฝัน"
}, {
  id: "settings",
  icon: "⚙️",
  label: "ตั้งค่า"
}];

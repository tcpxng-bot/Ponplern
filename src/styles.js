function BottomNav({
  tab,
  setTab,
  onFab
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    style: S.fab,
    onClick: onFab,
    "aria-label": "เพิ่มรายการ"
  }, "+"), /*#__PURE__*/React.createElement("nav", {
    style: S.bottomNav
  }, NAV_ITEMS.map(it => {
    const on = tab === it.id;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      onClick: () => setTab(it.id),
      style: S.navItem,
      "aria-label": it.label
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...S.navIcon,
        transform: on ? "translateY(-2px) scale(1.12)" : "none",
        filter: on ? "none" : "grayscale(0.4) opacity(0.55)"
      }
    }, it.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        ...S.navLabel,
        color: on ? amber : muted,
        fontWeight: on ? 700 : 500
      }
    }, it.label), /*#__PURE__*/React.createElement("span", {
      style: {
        ...S.navDot,
        opacity: on ? 1 : 0
      }
    }));
  })));
}
function FabSheet({
  onClose,
  onPick
}) {
  const actions = [{
    id: "installment",
    icon: "💳",
    label: "เพิ่มรายการผ่อน",
    sub: "ของที่กำลังผ่อนชำระ"
  }, {
    id: "income",
    icon: "💰",
    label: "เพิ่มรายรับ",
    sub: "พ.ต.ส. · OT · ขายเวร"
  }, {
    id: "expense",
    icon: "🧾",
    label: "เพิ่มค่าใช้จ่ายประจำ",
    sub: "ค่าหอ · ค่ากิน · บิล"
  }, {
    id: "saving",
    icon: "🎯",
    label: "เพิ่มเป้าหมายออม",
    sub: "ตั้งเป้าเก็บเงิน"
  }];
  return /*#__PURE__*/React.createElement(Sheet, {
    title: "เพิ่มรายการ",
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, actions.map(a => /*#__PURE__*/React.createElement("button", {
    key: a.id,
    style: S.fabAction,
    onClick: () => onPick(a.id)
  }, /*#__PURE__*/React.createElement("span", {
    style: S.fabActionIcon
  }, a.icon), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: S.fabActionLabel
  }, a.label), /*#__PURE__*/React.createElement("span", {
    style: S.fabActionSub
  }, a.sub)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: muted
    }
  }, "→")))));
}
function ProgressRing({
  pct,
  size = 56,
  stroke = 6,
  color = amber,
  label
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: size,
      height: size,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    style: {
      transform: "rotate(-90deg)"
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: line,
    strokeWidth: stroke
  }), /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokelinecap: "round",
    strokeLinecap: "round",
    strokeDasharray: circ,
    strokeDashoffset: off,
    style: {
      transition: "stroke-dashoffset .5s ease"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Prompt', sans-serif",
      fontWeight: 700,
      fontSize: size > 48 ? 14 : 12,
      color: ink
    }
  }, label != null ? label : `${Math.round(pct)}%`));
}

/* ============================ tokens & styles ============================ */
/* Phase 1 redesign: พาเลตพรีเมียม (ส้มอบอุ่น) + ฟอนต์ Prompt */
const ink = "#1E293B"; // ข้อความหลัก (slate-800)
const muted = "#64748B"; // ข้อความรอง (slate-500)
const bg = "#FFF8F3"; // พื้นหลังครีมอุ่น
const line = "#F1F5F9"; // เส้นขอบ
const teal = "#22C55E"; // เขียว = สำเร็จ/ผ่อน
const slate = "#A78BFA"; // ม่วงพาสเทล = ค่าใช้จ่ายประจำ
const amber = "#FF8A4C"; // ส้มหลัก = "เหลือใช้"
const amberBar = "#FFC88A"; // ส้มอ่อน = แถบเหลือใช้
const red = "#EF4444"; // แดง = เกินงบ/อันตราย
const redHatch = "repeating-linear-gradient(45deg,#EF4444,#EF4444 6px,#F87171 6px,#F87171 12px)";
const primaryGrad = "linear-gradient(135deg,#FF8A4C,#FFB068)";
function StyleTag() {
  return /*#__PURE__*/React.createElement("style", null, `
      @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      body { font-family: 'Prompt', sans-serif; }
      input { font-family: 'Prompt', sans-serif; }
      input:focus { outline: none; border-color: ${amber} !important; box-shadow: 0 0 0 3px ${amber}2e; }
      button { cursor: pointer; font-family: 'Prompt', sans-serif; transition: transform .12s ease, box-shadow .2s ease, background .2s ease; }
      button:active { transform: scale(0.97); }
      button:focus-visible { outline: 2px solid ${amber}; outline-offset: 2px; }
      input[type=range]{ -webkit-appearance:none; appearance:none; height:8px; border-radius:999px; background:${line}; }
      input[type=range]::-webkit-slider-thumb{ -webkit-appearance:none; width:26px; height:26px; border-radius:50%; background:${amber}; border:4px solid #fff; box-shadow:0 3px 10px ${amber}55; cursor:pointer; }
      input[type=range]::-moz-range-thumb{ width:22px; height:22px; border-radius:50%; background:${amber}; border:4px solid #fff; cursor:pointer; }
      @media (prefers-reduced-motion: reduce){ * { transition:none !important; animation:none !important; } }
      @keyframes ploenWobble { 0%,100%{ transform:rotate(0) } 25%{ transform:rotate(-7deg) } 75%{ transform:rotate(7deg) } }
      @keyframes ploenShake { 0%,100%{ transform:translateX(0) } 20%{ transform:translateX(-8px) } 40%{ transform:translateX(8px) } 60%{ transform:translateX(-6px) } 80%{ transform:translateX(6px) } }
      @keyframes ploenPop { 0%{ transform:scale(.6); opacity:0 } 100%{ transform:scale(1); opacity:1 } }
      @keyframes cardIn { 0%{ opacity:0; transform:translateY(10px) } 100%{ opacity:1; transform:translateY(0) } }
      @keyframes confettiFall { 0%{ transform:translateY(0) rotate(0deg); opacity:1 } 100%{ transform:translateY(105vh) rotate(540deg); opacity:0 } }
      @keyframes ploenShimmer { 0%{ background-position: 200% 0 } 100%{ background-position: -200% 0 } }
      .skel { background: linear-gradient(100deg, #ECE6E0 25%, #F7F2EC 50%, #ECE6E0 75%); background-size: 220% 100%; animation: ploenShimmer 1.25s linear infinite; border-radius: 8px; }
      .card-in { animation: cardIn .3s ease both; }
    `);
}
function Skel(props) {
  return React.createElement("div", { className: "skel", style: Object.assign({}, props.style) });
}
function SkeletonHome() {
  const c = (kids) => React.createElement("div", { style: S.skelCard }, kids);
  const sk = (st) => React.createElement(Skel, { style: st });
  return React.createElement("div", { style: S.shell },
    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 } },
      sk({ width: 150, height: 26 }), sk({ width: 120, height: 38, borderRadius: 999 })),
    c([sk({ key: 1, width: 110, height: 14, marginBottom: 14 }), sk({ key: 2, width: "100%", height: 28, borderRadius: 999, marginBottom: 14 }),
       sk({ key: 3, width: "60%", height: 16, marginBottom: 8 }), sk({ key: 4, width: "45%", height: 16, marginBottom: 16 }), sk({ key: 5, width: "50%", height: 30 })]),
    React.createElement("div", { style: { display: "flex", gap: 12, marginBottom: 14 } },
      React.createElement("div", { style: Object.assign({}, S.skelCard, { flex: 1, marginBottom: 0 }) }, sk({ key: 1, width: "70%", height: 18, marginBottom: 8 }), sk({ key: 2, width: "50%", height: 12 })),
      React.createElement("div", { style: Object.assign({}, S.skelCard, { flex: 1, marginBottom: 0 }) }, sk({ key: 1, width: "70%", height: 18, marginBottom: 8 }), sk({ key: 2, width: "50%", height: 12 }))),
    c([sk({ key: 1, width: "55%", height: 18, marginBottom: 12 }), sk({ key: 2, width: "100%", height: 8, borderRadius: 999, marginBottom: 10 }), sk({ key: 3, width: "40%", height: 14 })]),
    c([sk({ key: 1, width: "45%", height: 18, marginBottom: 12 }), sk({ key: 2, width: "100%", height: 8, borderRadius: 999, marginBottom: 10 }), sk({ key: 3, width: "40%", height: 14 })]));
}
function SkeletonRows() {
  const sk = (st) => React.createElement(Skel, { style: st });
  const row = (w) => React.createElement("div", { style: S.skelCard },
    sk({ key: 1, width: w, height: 18, marginBottom: 12 }), sk({ key: 2, width: "100%", height: 8, borderRadius: 999, marginBottom: 10 }), sk({ key: 3, width: "40%", height: 14 }));
  return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, row("55%"), row("45%"));
}
const num = {
  fontFamily: "'Prompt', sans-serif",
  fontVariantNumeric: "tabular-nums",
  fontFeatureSettings: "'tnum'"
};
const S = {
  page: {
    minHeight: "100vh",
    background: bg,
    fontFamily: "'Prompt', sans-serif",
    color: ink,
    paddingBottom: 40
  },
  skelCard: { background: "#fff", border: "2px solid " + line, borderRadius: 18, padding: 16, marginBottom: 14 },
  shell: {
    maxWidth: 460,
    margin: "0 auto",
    padding: "20px 16px 110px"
  },
  bottomNav: {
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: 14,
    width: "calc(100% - 24px)",
    maxWidth: 440,
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: `1px solid ${line}`,
    borderRadius: 26,
    padding: "8px 6px",
    boxShadow: "0 10px 30px #1e293b1f",
    zIndex: 50
  },
  navItem: {
    background: "none",
    border: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    padding: "4px 8px",
    flex: 1,
    position: "relative"
  },
  navIcon: {
    fontSize: 21,
    lineHeight: 1,
    transition: "transform .25s ease, filter .25s ease"
  },
  navLabel: {
    fontSize: 11,
    transition: "color .2s ease"
  },
  navDot: {
    position: "absolute",
    bottom: -3,
    width: 5,
    height: 5,
    borderRadius: 999,
    background: amber,
    transition: "opacity .25s ease"
  },
  fab: {
    position: "fixed",
    right: 20,
    bottom: 88,
    width: 60,
    height: 60,
    borderRadius: 22,
    border: "none",
    background: primaryGrad,
    color: "#fff",
    fontSize: 32,
    fontWeight: 300,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 26px #FF8A4C66",
    zIndex: 51
  },
  fabAction: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    width: "100%",
    background: "#fff",
    border: `1px solid ${line}`,
    borderRadius: 18,
    padding: "14px 16px",
    boxShadow: "0 4px 14px #1e293b0a"
  },
  fabActionIcon: {
    fontSize: 24,
    width: 46,
    height: 46,
    borderRadius: 14,
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  fabActionLabel: {
    display: "block",
    fontSize: 15.5,
    fontWeight: 600,
    color: ink
  },
  fabActionSub: {
    display: "block",
    fontSize: 12.5,
    color: muted,
    marginTop: 1
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 18
  },
  greeting: {
    fontSize: 13,
    color: muted,
    fontWeight: 500,
    marginBottom: 2
  },
  brand: {
    fontFamily: "'Prompt', sans-serif",
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: -0.3,
    color: ink,
    lineHeight: 1.1
  },
  sub: {
    fontSize: 12.5,
    color: muted,
    marginTop: 3
  },
  addBtn: {
    background: primaryGrad,
    color: "#fff",
    border: "none",
    borderRadius: 999,
    padding: "11px 17px",
    fontSize: 13.5,
    fontWeight: 600,
    whiteSpace: "nowrap",
    boxShadow: "0 6px 16px #FF8A4C55"
  },
  card: {
    background: "#fff",
    border: `1px solid ${line}`,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    boxShadow: "0 8px 24px #1e293b0d"
  },
  simTriggerBtn: {
    ...num,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#fff",
    border: `1px solid ${line}`,
    borderRadius: 24,
    padding: "18px 20px",
    marginBottom: 16,
    fontSize: 15,
    fontWeight: 600,
    color: ink,
    boxShadow: "0 8px 24px #1e293b0d"
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: muted
  },
  salaryRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    margin: "12px 0 4px"
  },
  salaryTag: {
    fontSize: 14,
    color: ink,
    fontWeight: 600,
    whiteSpace: "nowrap",
    flexShrink: 0
  },
  salaryInputWrap: {
    display: "flex",
    alignItems: "center",
    border: `2px solid ${line}`,
    borderRadius: 13,
    padding: "6px 12px",
    background: "#FFFaf3",
    flex: 1,
    maxWidth: 190
  },
  bahtSign: {
    ...num,
    fontSize: 17,
    color: muted,
    marginRight: 4
  },
  salaryInput: {
    ...num,
    border: "none",
    background: "transparent",
    fontSize: 19,
    fontWeight: 600,
    width: "100%",
    color: ink,
    textAlign: "right"
  },
  prompt: {
    fontSize: 13.5,
    color: muted,
    marginTop: 12,
    lineHeight: 1.6
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: teal,
    fontWeight: 600,
    fontSize: 13.5,
    padding: 0
  },
  bar: {
    position: "relative",
    display: "flex",
    height: 28,
    borderRadius: 999,
    overflow: "hidden",
    background: line,
    margin: "16px 0 12px",
    boxShadow: "inset 0 2px 4px #00000010"
  },
  seg: {
    height: "100%",
    transition: "width .45s cubic-bezier(.34,1.56,.64,1)"
  },
  salaryMark: {
    position: "absolute",
    top: -3,
    bottom: -3,
    width: 2,
    background: ink,
    borderRadius: 2
  },
  mascotRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
    background: "#FFFaf3",
    border: `2px solid ${line}`,
    borderRadius: 18,
    padding: "12px 14px"
  },
  mascotName: {
    fontFamily: "'Prompt', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    color: "#E08AA0",
    marginBottom: 2
  },
  bubble: {
    fontSize: 13.5,
    color: ink,
    lineHeight: 1.5,
    fontWeight: 500
  },
  bootWrap: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Prompt', sans-serif"
  },
  lockWrap: {
    minHeight: "100vh",
    maxWidth: 420,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 24px",
    textAlign: "center"
  },
  lockName: {
    fontFamily: "'Prompt', sans-serif",
    fontSize: 17,
    fontWeight: 700,
    color: "#E08AA0",
    marginTop: 10
  },
  lockHi: {
    fontSize: 13.5,
    color: muted,
    marginTop: 2
  },
  lockTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: ink,
    marginTop: 18
  },
  dots: {
    display: "flex",
    gap: 16,
    marginTop: 16
  },
  dot4: {
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "#fff",
    border: `2px solid ${line}`,
    transition: "all .15s ease"
  },
  dot4On: {
    background: "#FF9EB0",
    borderColor: "#FF9EB0",
    transform: "scale(1.1)"
  },
  lockErr: {
    fontSize: 12.5,
    color: red,
    marginTop: 10,
    minHeight: 18,
    transition: "opacity .2s"
  },
  keypad: {
    display: "grid",
    gridTemplateColumns: "repeat(3,72px)",
    gap: 14,
    marginTop: 8
  },
  key: {
    height: 64,
    borderRadius: "50%",
    border: "none",
    background: "#fff",
    boxShadow: "0 3px 0 #5a4a5215",
    fontFamily: "'Prompt', sans-serif",
    fontSize: 24,
    fontWeight: 600,
    color: ink
  },
  keyGhost: {
    background: "transparent",
    boxShadow: "none",
    fontSize: 18,
    color: muted,
    fontFamily: "'Prompt', sans-serif"
  },
  lockNote: {
    fontSize: 11.5,
    color: muted,
    marginTop: 22,
    lineHeight: 1.5
  },
  legend: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
    marginBottom: 4
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 8
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    flexShrink: 0
  },
  legendLabel: {
    fontSize: 13,
    color: ink,
    flex: 1
  },
  legendVal: {
    ...num,
    fontSize: 13.5,
    color: muted
  },
  freeRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 14,
    borderTop: `1px solid ${line}`
  },
  freeLabel: {
    fontSize: 14,
    fontWeight: 600
  },
  freeNum: {
    ...num,
    fontSize: 30,
    fontWeight: 600,
    letterSpacing: -0.5
  },
  warnNeg: {
    marginTop: 10,
    fontSize: 12.5,
    color: red,
    background: red + "12",
    borderRadius: 8,
    padding: "8px 11px",
    lineHeight: 1.5
  },
  warnSoft: {
    marginTop: 10,
    fontSize: 12.5,
    color: amber,
    background: amberBar + "1f",
    borderRadius: 8,
    padding: "8px 11px",
    lineHeight: 1.5
  },
  simTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    margin: "12px 0 12px"
  },
  simAsk: {
    fontSize: 14,
    fontWeight: 500
  },
  range: {
    width: "100%",
    margin: "2px 0 12px"
  },
  chipRow: {
    display: "flex",
    gap: 7,
    flexWrap: "wrap",
    marginBottom: 16
  },
  chip: {
    ...num,
    background: "#fff",
    border: `2px solid ${line}`,
    borderRadius: 999,
    padding: "6px 13px",
    fontSize: 13,
    color: ink,
    fontWeight: 600
  },
  simResult: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 12
  },
  simResLabel: {
    fontSize: 13,
    color: muted
  },
  simResNum: {
    ...num,
    fontSize: 28,
    fontWeight: 600,
    letterSpacing: -0.5
  },
  simDelta: {
    ...num,
    fontSize: 12,
    color: muted,
    textAlign: "right",
    lineHeight: 1.5
  },
  simAddBtn: {
    width: "100%",
    marginTop: 16,
    background: teal + "1f",
    color: "#2C9d86",
    border: `2px solid ${teal}66`,
    borderRadius: 14,
    padding: "11px",
    fontSize: 14,
    fontWeight: 700
  },
  msRow: {
    display: "flex",
    gap: 10,
    margin: "12px 0 0"
  },
  msStat: {
    flex: 1,
    background: "#FFFaf3",
    border: `2px solid ${line}`,
    borderRadius: 14,
    padding: "10px 12px"
  },
  msNum: {
    ...num,
    fontSize: 19,
    fontWeight: 700,
    color: ink
  },
  msLbl: {
    fontSize: 11.5,
    color: muted,
    marginTop: 1
  },
  msFinish: {
    marginTop: 10,
    fontSize: 12.5,
    color: "#2C9d86",
    background: teal + "16",
    borderRadius: 10,
    padding: "8px 11px",
    lineHeight: 1.5
  },
  msForeLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: muted,
    marginTop: 14,
    marginBottom: 8
  },
  foreGrid: {
    display: "flex",
    gap: 6,
    alignItems: "flex-end"
  },
  foreCol: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4
  },
  foreBarWrap: {
    width: "100%",
    height: 64,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center"
  },
  foreBar: {
    width: "70%",
    borderRadius: "8px 8px 4px 4px",
    minHeight: 4,
    transition: "height .4s ease"
  },
  foreVal: {
    ...num,
    fontSize: 11,
    fontWeight: 700
  },
  foreMo: {
    fontSize: 11,
    color: muted
  },
  msHint: {
    fontSize: 12,
    color: amber,
    marginTop: 10
  },
  collapseHead: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "none",
    border: "none",
    padding: 0
  },
  collapseRight: {
    ...num,
    fontSize: 14,
    color: ink,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 6
  },
  caret: {
    fontFamily: "sans-serif",
    color: muted,
    fontSize: 12
  },
  muted2: {
    fontSize: 13,
    color: muted,
    marginBottom: 10
  },
  fixedRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8
  },
  fixedAddRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    paddingTop: 12,
    borderTop: `1px dashed ${line}`
  },
  fixedName: {
    flex: 1,
    minWidth: 0,
    border: `2px solid ${line}`,
    borderRadius: 11,
    padding: "9px 11px",
    fontSize: 14,
    background: "#fff",
    color: ink
  },
  fixedAmtWrap: {
    display: "flex",
    alignItems: "center",
    border: `2px solid ${line}`,
    borderRadius: 11,
    padding: "0 10px",
    background: "#fff",
    width: 110
  },
  bahtSignSm: {
    ...num,
    fontSize: 13,
    color: muted,
    marginRight: 3
  },
  fixedAmt: {
    ...num,
    border: "none",
    background: "transparent",
    fontSize: 15,
    fontWeight: 600,
    width: "100%",
    color: ink,
    textAlign: "right",
    padding: "9px 0"
  },
  rowDel: {
    background: "#FFF0F0",
    border: "none",
    width: 32,
    height: 32,
    borderRadius: 10,
    color: red,
    fontSize: 12,
    flexShrink: 0
  },
  rowAdd: {
    background: "#FF9EB0",
    border: "none",
    width: 32,
    height: 32,
    borderRadius: 10,
    color: "#fff",
    fontSize: 18,
    flexShrink: 0,
    lineHeight: 1
  },
  sectionHead: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    margin: "4px 2px 12px"
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600
  },
  sectionMeta: {
    ...num,
    fontSize: 13,
    color: muted
  },
  segment: {
    display: "flex",
    background: "#fff",
    border: `2px solid ${line}`,
    borderRadius: 999,
    padding: 4,
    marginBottom: 14
  },
  segBtn: {
    flex: 1,
    background: "none",
    border: "none",
    borderRadius: 999,
    padding: "8px 4px",
    fontSize: 13,
    color: muted,
    fontWeight: 600
  },
  segOn: {
    background: "#FF9EB0",
    color: "#fff"
  },
  groupHead: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    margin: "10px 2px 8px"
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: 600
  },
  groupMeta: {
    ...num,
    fontSize: 12.5,
    color: muted
  },
  itemList: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  },
  itemCard: {
    background: "#fff",
    border: `2px solid ${line}`,
    borderRadius: 18,
    padding: 14,
    boxShadow: "0 3px 10px #5a4a520d"
  },
  itemTop: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 11
  },
  itemName: {
    fontSize: 15,
    fontWeight: 700,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  badgeRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginTop: 4
  },
  badge: {
    fontSize: 11,
    fontWeight: 600,
    border: "1.5px solid",
    borderRadius: 999,
    padding: "1px 8px",
    whiteSpace: "nowrap"
  },
  itemMonthly: {
    ...num,
    fontSize: 17,
    fontWeight: 700
  },
  perMo: {
    fontFamily: "'Prompt', sans-serif",
    fontSize: 11,
    color: muted,
    fontWeight: 400
  },
  editLink: {
    background: "none",
    border: "none",
    color: muted,
    fontSize: 12,
    padding: "2px 0",
    textDecoration: "underline"
  },
  progLine: {
    height: 8,
    background: line,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 9
  },
  progFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width .4s cubic-bezier(.34,1.56,.64,1)"
  },
  trackWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 11
  },
  mbox: {
    width: 42,
    padding: "4px 0 3px",
    border: "2px solid",
    borderRadius: 11,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 1,
    background: "#fff"
  },
  mboxMonth: {
    fontFamily: "'Prompt', sans-serif",
    fontSize: 10.5,
    fontWeight: 600,
    lineHeight: 1
  },
  mboxMark: {
    fontFamily: "'Prompt', sans-serif",
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1
  },
  itemFoot: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8
  },
  itemFootMeta: {
    ...num,
    fontSize: 12.5,
    color: muted
  },
  payBtn: {
    background: teal,
    color: "#fff",
    border: "none",
    borderRadius: 999,
    padding: "7px 14px",
    fontSize: 12.5,
    fontWeight: 700,
    boxShadow: "0 3px 0 #00000010"
  },
  ghostBtn: {
    background: "#FFF4EC",
    color: ink,
    border: `1.5px solid ${line}`,
    borderRadius: 999,
    padding: "7px 11px",
    fontSize: 12.5,
    fontWeight: 600
  },
  muted: {
    color: muted,
    textAlign: "center",
    padding: 24,
    fontSize: 14
  },
  emptyCard: {
    background: "#fff",
    border: `2px solid ${line}`,
    borderRadius: 20,
    padding: "28px 20px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8
  },
  emptyText: {
    fontSize: 13,
    color: muted,
    maxWidth: 240,
    lineHeight: 1.5
  },
  footer: {
    textAlign: "center",
    fontSize: 11.5,
    color: muted,
    marginTop: 22
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "#5a4a5299",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 50,
    backdropFilter: "blur(2px)"
  },
  sheet: {
    background: bg,
    width: "100%",
    maxWidth: 460,
    borderRadius: "26px 26px 0 0",
    padding: "10px 18px 26px",
    maxHeight: "92vh",
    overflowY: "auto",
    boxShadow: "0 -8px 30px #00000030"
  },
  grip: {
    width: 44,
    height: 5,
    background: "#0000001f",
    borderRadius: 999,
    margin: "4px auto 12px"
  },
  sheetHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  sheetTitle: {
    fontFamily: "'Prompt', sans-serif",
    fontSize: 19,
    fontWeight: 700,
    margin: 0,
    color: ink
  },
  closeBtn: {
    background: "#fff",
    border: `2px solid ${line}`,
    width: 32,
    height: 32,
    borderRadius: 10,
    fontSize: 13,
    color: ink
  },
  fieldLabel: {
    display: "block",
    fontSize: 13,
    fontWeight: 700,
    color: ink,
    marginBottom: 6
  },
  input: {
    width: "100%",
    border: `2px solid ${line}`,
    borderRadius: 13,
    padding: "11px 13px",
    fontSize: 15,
    background: "#fff",
    color: ink
  },
  emojiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(9,1fr)",
    gap: 5
  },
  emojiCell: {
    background: "#fff",
    border: `2px solid transparent`,
    borderRadius: 10,
    padding: "5px 0",
    fontSize: 18
  },
  emojiOn: {
    borderColor: teal,
    background: teal + "1f"
  },
  platChip: {
    background: "#fff",
    border: `2px solid ${line}`,
    borderRadius: 999,
    padding: "7px 12px",
    fontSize: 13,
    fontWeight: 600,
    color: muted
  },
  miniChip: {
    ...num,
    background: "#fff",
    border: `2px solid ${line}`,
    borderRadius: 999,
    padding: "6px 11px",
    fontSize: 12.5,
    color: ink,
    fontWeight: 600
  },
  saveBtn: {
    width: "100%",
    background: teal,
    color: "#fff",
    border: "none",
    borderRadius: 16,
    padding: "14px",
    fontSize: 16,
    fontWeight: 700,
    marginTop: 8,
    boxShadow: "0 5px 0 #00000012"
  },
  ghostBig: {
    flex: 1,
    background: "#fff",
    border: `2px solid ${line}`,
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    fontWeight: 600,
    color: ink
  },
  hint: {
    fontSize: 13.5,
    color: muted,
    marginBottom: 14,
    lineHeight: 1.5
  },
  histRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#fff",
    borderRadius: 10,
    padding: "10px 12px",
    border: `1px solid ${line}`
  },
  histMeta: {
    fontSize: 12,
    color: muted
  },
  histDateInput: {
    border: "none",
    background: "transparent",
    color: muted,
    fontSize: 12,
    fontFamily: "inherit",
    padding: 0,
    margin: 0,
    width: 96
  },
  calcBox: {
    background: "#FFF7EF",
    border: `1.5px solid ${line}`,
    borderRadius: 14,
    padding: "12px 14px",
    margin: "4px 0 6px",
    display: "flex",
    flexDirection: "column",
    gap: 7
  },
  calcRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    fontSize: 14,
    color: ink
  },
  aStatRow: {
    display: "flex",
    gap: 10,
    marginTop: 16
  },
  aStat: {
    flex: 1,
    background: bg,
    borderRadius: 16,
    padding: "12px 8px",
    textAlign: "center"
  },
  aStatNum: {
    ...num,
    fontSize: 17,
    fontWeight: 700
  },
  aStatLbl: {
    fontSize: 11,
    color: muted,
    marginTop: 3
  },
  badgeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10
  },
  achBadge: {
    border: `1.5px solid ${line}`,
    borderRadius: 16,
    padding: "12px 6px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transition: "opacity .3s ease"
  },
  calNav: {
    width: 34,
    height: 34,
    borderRadius: 12,
    border: `1px solid ${line}`,
    background: "#fff",
    fontSize: 20,
    color: ink,
    lineHeight: 1
  },
  calGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 3
  },
  calDow: {
    textAlign: "center",
    fontSize: 11,
    color: muted,
    fontWeight: 600,
    paddingBottom: 4
  },
  calCell: {
    position: "relative",
    aspectRatio: "1",
    border: "none",
    borderRadius: 12,
    fontSize: 13.5,
    fontFamily: "'Prompt', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  calDot: {
    position: "absolute",
    bottom: 5,
    width: 5,
    height: 5,
    borderRadius: 999
  },
  dueBanner: {
    background: "#FFE9EE",
    border: "2px dashed #FF9EB0",
    borderRadius: 16,
    padding: "12px 14px",
    marginBottom: 14
  },
  dueBannerHead: {
    fontSize: 14.5,
    fontWeight: 700,
    color: "#E0617D",
    marginBottom: 8
  },
  dueChipsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8
  },
  dueChip: {
    ...num,
    background: "#fff",
    border: "2px solid #FF9EB0",
    borderRadius: 999,
    padding: "7px 12px",
    fontSize: 13,
    fontWeight: 700,
    color: "#E0617D"
  },
  goalBarOuter: {
    width: "100%",
    height: 14,
    background: "#F1E5DC",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 8
  },
  goalBarFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 0.3s ease"
  }
};

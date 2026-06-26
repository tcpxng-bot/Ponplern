/* ============================ PIN lock ============================ */
function PinScreen({
  mode,
  storedPin,
  onUnlock,
  onSet,
  onForgot
}) {
  const [entry, setEntry] = useState("");
  const [step, setStep] = useState("first"); // สำหรับโหมดตั้งรหัส
  const [firstPin, setFirstPin] = useState("");
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);
  const fail = msg => {
    setErr(msg);
    setShake(true);
    setTimeout(() => {
      setEntry("");
      setShake(false);
    }, 480);
  };
  useEffect(() => {
    if (entry.length < 4) return;
    const code = entry;
    const t = setTimeout(() => {
      if (mode === "unlock") {
        if (code === storedPin) onUnlock();else fail("รหัสไม่ถูกต้อง ลองใหม่น้า");
      } else {
        if (step === "first") {
          setFirstPin(code);
          setEntry("");
          setErr("");
          setStep("confirm");
        } else if (code === firstPin) onSet(code);else {
          fail("รหัสไม่ตรงกัน ตั้งใหม่น้า");
          setStep("first");
          setFirstPin("");
        }
      }
    }, 130);
    return () => clearTimeout(t);
  }, [entry]); // eslint-disable-line

  const push = d => {
    setErr("");
    setEntry(e => e.length < 4 ? e + d : e);
  };
  const del = () => setEntry(e => e.slice(0, -1));
  const forgot = () => {
    setEntry("");
    setErr("");
    setStep("first");
    setFirstPin("");
    onForgot();
  };
  const heading = mode === "unlock" ? "ใส่รหัสเข้าผ่อนเพลิน" : step === "first" ? "ตั้งรหัส 4 หลัก" : "ยืนยันรหัสอีกครั้ง";
  return /*#__PURE__*/React.createElement("div", {
    style: S.lockWrap
  }, /*#__PURE__*/React.createElement(Coin, {
    mood: err ? "panic" : "happy",
    size: 84
  }), /*#__PURE__*/React.createElement("div", {
    style: S.lockName
  }, "น้องผ่อนเพลิน"), /*#__PURE__*/React.createElement("div", {
    style: S.lockHi
  }, mode === "unlock" ? "สวัสดีน้า~ ใส่รหัสหน่อยน้า" : "ตั้งรหัสไว้กันคนอื่นแอบดูน้า"), /*#__PURE__*/React.createElement("div", {
    style: S.lockTitle
  }, heading), /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.dots,
      animation: shake ? "ploenShake .42s" : "none"
    }
  }, [0, 1, 2, 3].map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      ...S.dot4,
      ...(i < entry.length ? S.dot4On : {})
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.lockErr,
      opacity: err ? 1 : 0
    }
  }, err || "·"), /*#__PURE__*/React.createElement("div", {
    style: S.keypad
  }, [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => /*#__PURE__*/React.createElement("button", {
    key: n,
    style: S.key,
    onClick: () => push(String(n))
  }, n)), /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.key,
      ...S.keyGhost
    },
    onClick: mode === "unlock" ? forgot : undefined
  }, mode === "unlock" ? "ลืม?" : ""), /*#__PURE__*/React.createElement("button", {
    style: S.key,
    onClick: () => push("0")
  }, "0"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.key,
      ...S.keyGhost
    },
    onClick: del
  }, "⌫")), mode === "unlock" && /*#__PURE__*/React.createElement("div", {
    style: S.lockNote
  }, "กด\"ลืม?\" เพื่อตั้งรหัสใหม่ (ข้อมูลผ่อนยังอยู่ครบ)"));
}

/* ============================ mascot: น้องผ่อนเพลิน ============================ */
// คืนค่าอารมณ์ + คำพูด ตามเงินเหลือใช้และภาระผ่อน
function ploenSay(free, salary, inst) {
  const ratio = salary > 0 ? inst / salary : 0;
  if (free < 0) return {
    mood: "panic",
    msg: `โอ๊ย! เกินงบไป ${baht(-free)} เลยน้า ชะลอการผ่อนก่อนนะ`
  };
  if (ratio > 0.4) return {
    mood: "worry",
    msg: `ผ่อนเยอะไปแล้วน้า~ เดือนนึงผ่อนตั้ง ${baht(inst)} (เกิน 40% ของเงินเดือน) ระวังด้วยน้า`
  };
  if (free < salary * 0.1) return {
    mood: "worry",
    msg: "เริ่มตึงๆ แล้วน้า เผื่อเงินฉุกเฉินไว้บ้างนะ"
  };
  return {
    mood: "happy",
    msg: "สบายๆ เลย เหลือใช้กำลังดี เก็บออมได้อีกด้วยน้า"
  };
}
function Confetti() {
  const colors = ["#FF8A4C", "#FFC88A", "#22C55E", "#A78BFA", "#FF9EB0", "#FFD774"];
  const pieces = React.useMemo(() => Array.from({
    length: 34
  }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.35,
    dur: 1.5 + Math.random() * 1.1,
    color: colors[i % colors.length],
    size: 7 + Math.random() * 6,
    rot: Math.random() * 360,
    round: Math.random() > 0.5
  })), []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      overflow: "hidden",
      zIndex: 999
    },
    "aria-hidden": true
  }, pieces.map(p => /*#__PURE__*/React.createElement("span", {
    key: p.id,
    style: {
      position: "absolute",
      top: "-20px",
      left: `${p.left}%`,
      width: p.size,
      height: p.size,
      background: p.color,
      borderRadius: p.round ? "50%" : "2px",
      transform: `rotate(${p.rot}deg)`,
      animation: `confettiFall ${p.dur}s ${p.delay}s cubic-bezier(.4,.2,.6,1) forwards`
    }
  })));
}
function Coin({
  mood = "happy",
  size = 56
}) {
  // น้องเพลินจิ้งจอก — เปลี่ยนสีสัน/สีหน้าตามอารมณ์
  const ORANGE = "#F4923E";
  const ORANGE_D = "#E07B2A";
  const CREAM = "#FFF6EC";
  const WHITE = "#FFFDF9";
  const EYE = mood === "panic" ? "#D1483F" : "#4A3F44";
  const PINK = "#FFA8B0";
  const animated = mood === "worry" || mood === "panic";
  const el = React.createElement;
  return el("svg", {
    width: size,
    height: size,
    viewBox: "0 0 64 64",
    style: {
      flexShrink: 0,
      animation: animated ? "ploenWobble 1.1s ease-in-out infinite" : "none",
      transformOrigin: "50% 70%"
    },
    "aria-hidden": true
  },
  // หู ซ้าย-ขวา (ชั้นนอกส้ม ชั้นในครีม)
  el("path", { d: "M13 7 L9 27 L27 19 Z", fill: ORANGE, stroke: ORANGE_D, strokeWidth: "1.5", strokeLinejoin: "round" }),
  el("path", { d: "M51 7 L55 27 L37 19 Z", fill: ORANGE, stroke: ORANGE_D, strokeWidth: "1.5", strokeLinejoin: "round" }),
  el("path", { d: "M15 13 L13 23 L23 19 Z", fill: CREAM }),
  el("path", { d: "M49 13 L51 23 L41 19 Z", fill: CREAM }),
  // หัวส้ม
  el("circle", { cx: "32", cy: "36", r: "19", fill: ORANGE, stroke: ORANGE_D, strokeWidth: "1.5" }),
  // หน้าผาก/ปากครีม (blaze + muzzle)
  el("path", { d: "M32 20 Q22 26 22 38 Q22 50 32 52 Q42 50 42 38 Q42 26 32 20 Z", fill: CREAM }),
  el("ellipse", { cx: "32", cy: "44", rx: "12", ry: "9", fill: WHITE }),
  // แก้มชมพู
  el("circle", { cx: "21", cy: "42", r: "3.4", fill: PINK, opacity: "0.75" }),
  el("circle", { cx: "43", cy: "42", r: "3.4", fill: PINK, opacity: "0.75" }),
  // ตา
  mood === "panic"
    ? el(React.Fragment, null,
        el("path", { d: "M23 33 l5 5 M28 33 l-5 5", stroke: EYE, strokeWidth: "2.2", strokeLinecap: "round" }),
        el("path", { d: "M36 33 l5 5 M41 33 l-5 5", stroke: EYE, strokeWidth: "2.2", strokeLinecap: "round" }),
        el("path", { d: "M45 36 q3 4 1 7", fill: "none", stroke: "#7EC8E3", strokeWidth: "2", strokeLinecap: "round" }))
    : el(React.Fragment, null,
        el("circle", { cx: "26", cy: "36", r: "3", fill: EYE }),
        el("circle", { cx: "38", cy: "36", r: "3", fill: EYE }),
        el("circle", { cx: "27.1", cy: "35", r: "0.9", fill: "#fff" }),
        el("circle", { cx: "39.1", cy: "35", r: "0.9", fill: "#fff" })),
  // จมูก
  el("path", { d: "M30 41 L34 41 L32 43.6 Z", fill: "#4A3F44" }),
  // ปากตามอารมณ์
  mood === "happy" && el("path", { d: "M27 45 Q32 50 37 45", fill: "none", stroke: "#4A3F44", strokeWidth: "2", strokeLinecap: "round" }),
  mood === "worry" && el("path", { d: "M28 48 Q32 45 36 48", fill: "none", stroke: "#4A3F44", strokeWidth: "2", strokeLinecap: "round" }),
  mood === "panic" && el("ellipse", { cx: "32", cy: "47", rx: "3.4", ry: "2.6", fill: "#A8474A" }),
  // คอเสื้อฮู้ดส้ม
  el("path", { d: "M15 52 Q32 62 49 52 L49 58 Q32 66 15 58 Z", fill: ORANGE, stroke: ORANGE_D, strokeWidth: "1.5", strokeLinejoin: "round" }),
  // ประกายตอนยิ้ม
  mood === "happy" && el("path", { d: "M52 12 l1.4 3 3 1.4 -3 1.4 -1.4 3 -1.4 -3 -3 -1.4 3 -1.4 Z", fill: "#FFD774" }));
}

/* ============================ flow bar ============================ */
function FlowBar({ salary, fixed, inst, projected }) {
  const spent = fixed + inst;
  const overspent = spent > salary;
  const total = Math.max(salary, spent, 1);
  const pc = v => v / total * 100;
  const fixedIn = Math.min(fixed, Math.max(salary, 0));
  const instIn = Math.max(0, Math.min(inst, salary - fixed));
  const over = Math.max(0, spent - salary);
  const freeW = overspent ? 0 : pc(salary - spent);
  const salaryMark = pc(salary);
  return React.createElement("div", { style: { ...S.bar, opacity: projected ? 0.96 : 1 } },
    React.createElement("div", { style: { ...S.seg, width: pc(fixedIn) + "%", background: slate } }),
    React.createElement("div", { style: { ...S.seg, width: pc(instIn) + "%", background: teal } }),
    overspent && React.createElement("div", { style: { ...S.seg, width: pc(over) + "%", background: redHatch } }),
    !overspent && React.createElement("div", { style: { ...S.seg, width: freeW + "%", background: amberBar } }),
    overspent && React.createElement("div", { style: { ...S.salaryMark, left: salaryMark + "%", background: "#7F1D1D", width: 2 } }));
}
function Legend({
  fixed,
  inst,
  free
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: S.legend
  }, /*#__PURE__*/React.createElement(LegendDot, {
    c: slate,
    label: "ค่าใช้จ่ายประจำ",
    v: baht(fixed)
  }), /*#__PURE__*/React.createElement(LegendDot, {
    c: teal,
    label: "ผ่อนรวม",
    v: baht(inst)
  }), /*#__PURE__*/React.createElement(LegendDot, {
    c: free >= 0 ? amberBar : red,
    label: free >= 0 ? "เหลือใช้" : "เกินงบ",
    v: baht(Math.abs(free))
  }));
}
function LegendDot({
  c,
  label,
  v
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: S.legendItem
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...S.dot,
      background: c
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: S.legendLabel
  }, label), /*#__PURE__*/React.createElement("span", {
    style: S.legendVal
  }, v));
}


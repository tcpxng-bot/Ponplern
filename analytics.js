/* ============================ analytics ============================ */
function DonutChart({
  segments,
  size = 160,
  stroke = 26,
  centerTop,
  centerSub
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0) || 1;
  let acc = 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: size,
      height: size,
      margin: "0 auto"
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
  }), segments.map((seg, i) => {
    const frac = Math.max(0, seg.value) / total;
    const dash = frac * circ;
    const off = -acc * circ;
    acc += frac;
    if (dash <= 0) return null;
    return /*#__PURE__*/React.createElement("circle", {
      key: i,
      cx: size / 2,
      cy: size / 2,
      r: r,
      fill: "none",
      stroke: seg.color,
      strokeWidth: stroke,
      strokeDasharray: `${dash} ${circ - dash}`,
      strokeDashoffset: off,
      strokeLinecap: "butt",
      style: {
        transition: "stroke-dasharray .6s ease, stroke-dashoffset .6s ease"
      }
    });
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...num,
      fontSize: 22,
      fontWeight: 700,
      color: ink
    }
  }, centerTop), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: muted,
      marginTop: 2
    }
  }, centerSub)));
}
function Analytics({
  totalIn,
  salary,
  incomeTotal,
  fixedTotal,
  instTotal,
  free,
  items
}) {
  if (salary <= 0) {
    return /*#__PURE__*/React.createElement("section", {
      style: S.card
    }, /*#__PURE__*/React.createElement("div", {
      style: S.cardLabel
    }, "📈 ภาพรวมการเงิน"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...S.muted2,
        marginTop: 8
      }
    }, "ใส่เงินเดือนในหน้าหลักก่อน แล้วกลับมาดูภาพรวมที่นี่ได้เลย"));
  }
  const segs = [{
    value: fixedTotal,
    color: slate,
    label: "ค่าใช้จ่ายประจำ"
  }, {
    value: instTotal,
    color: amber,
    label: "ผ่อนชำระ"
  }, {
    value: Math.max(0, free),
    color: teal,
    label: "เหลือใช้"
  }];
  const ratio = totalIn > 0 ? Math.round(instTotal / totalIn * 100) : 0;
  const freePct = totalIn > 0 ? Math.round(Math.max(0, free) / totalIn * 100) : 0;
  const stat = (label, val, color) => /*#__PURE__*/React.createElement("div", {
    style: S.aStat
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.aStatNum,
      color: color || ink
    }
  }, val), /*#__PURE__*/React.createElement("div", {
    style: S.aStatLbl
  }, label));
  return /*#__PURE__*/React.createElement("section", {
    style: S.card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.cardLabel,
      marginBottom: 16
    }
  }, "📈 รายได้เดือนนี้แบ่งเป็น"), /*#__PURE__*/React.createElement(DonutChart, {
    segments: segs,
    centerTop: baht(totalIn),
    centerSub: "รายได้รวม"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, segs.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      borderRadius: 4,
      background: s.color,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 14,
      color: ink
    }
  }, s.label), /*#__PURE__*/React.createElement("span", {
    style: {
      ...num,
      fontSize: 14,
      fontWeight: 700,
      color: ink
    }
  }, baht(s.value)), /*#__PURE__*/React.createElement("span", {
    style: {
      ...num,
      fontSize: 12,
      color: muted,
      width: 38,
      textAlign: "right"
    }
  }, totalIn > 0 ? Math.round(s.value / totalIn * 100) : 0, "%")))), /*#__PURE__*/React.createElement("div", {
    style: S.aStatRow
  }, stat("อัตราส่วนผ่อน", ratio + "%", ratio > 40 ? red : ratio > 30 ? amber : teal), stat("เหลือใช้", freePct + "%", teal), stat("กำลังผ่อน", items.filter(it => !isDone(it)).length + " รายการ", ink)), ratio > 40 && /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.warnSoft,
      marginTop: 12
    }
  }, "💡 อัตราส่วนผ่อนเกิน 40% ของรายได้แล้ว ลองชะลอการก่อหนี้ใหม่ดูนะ"));
}

/* ============================ achievements ============================ */
function Achievements({
  items,
  budget
}) {
  const active = items.filter(it => !isDone(it));
  const doneItems = items.filter(it => isDone(it));
  const totalPayments = items.reduce((s, it) => s + (it.payments || []).length, 0);
  const goals = budget.savingsGoals || [];
  const totalSaved = goals.reduce((s, g) => s + (Number(g.saved) || 0), 0);
  const reachedGoal = goals.some(g => (Number(g.saved) || 0) >= (Number(g.target) || 0) && (Number(g.target) || 0) > 0);
  const badges = [{
    icon: "🎉",
    label: "เริ่มต้นแล้ว",
    sub: "เพิ่มรายการผ่อนแรก",
    done: items.length > 0
  }, {
    icon: "✅",
    label: "จ่ายงวดแรก",
    sub: "บันทึกการจ่ายครั้งแรก",
    done: totalPayments >= 1
  }, {
    icon: "🏆",
    label: "ผ่อนครบรายการแรก",
    sub: "ปิดหนี้ได้ 1 รายการ",
    done: doneItems.length >= 1
  }, {
    icon: "💰",
    label: "เริ่มออมเงิน",
    sub: "เก็บเงินเข้าเป้าหมาย",
    done: totalSaved > 0
  }, {
    icon: "🎯",
    label: "ถึงเป้าออม",
    sub: "ทำเป้าหมายออมสำเร็จ",
    done: reachedGoal
  }, {
    icon: "⭐",
    label: "ปลอดหนี้",
    sub: "ผ่อนครบทุกรายการ",
    done: items.length > 0 && active.length === 0
  }];
  const unlocked = badges.filter(b => b.done).length;
  return /*#__PURE__*/React.createElement("section", {
    style: S.card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: S.cardLabel
  }, "🏅 ความสำเร็จ"), /*#__PURE__*/React.createElement("span", {
    style: {
      ...num,
      fontSize: 13,
      fontWeight: 700,
      color: amber
    }
  }, unlocked, "/", badges.length)), /*#__PURE__*/React.createElement("div", {
    style: S.badgeGrid
  }, badges.map((b, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      ...S.achBadge,
      opacity: b.done ? 1 : 0.45,
      background: b.done ? "#FFF7EF" : "#fff",
      borderColor: b.done ? amberBar : line
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 30,
      filter: b.done ? "none" : "grayscale(1)"
    }
  }, b.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: ink,
      marginTop: 4,
      textAlign: "center"
    }
  }, b.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: muted,
      textAlign: "center",
      marginTop: 1,
      lineHeight: 1.3
    }
  }, b.done ? "ปลดล็อกแล้ว" : b.sub)))));
}

/* ============================ monthly summary ============================ */
function MonthlySummary({
  items
}) {
  const [open, setOpen] = useState(true);
  const now = new Date();
  const ym = now.toISOString().slice(0, 7);
  const active = items.filter(it => !isDone(it));
  const paidThis = paidInYM(items, ym);
  const instNow = active.reduce((s, it) => s + (Number(it.monthly) || 0), 0);
  const finishing = active.filter(it => monthsLeftOf(it) === 1);
  const totalRemaining = active.reduce((s, it) => s + remainingOf(it), 0);
  const maxML = active.length ? Math.max(...active.map(monthsLeftOf)) : 0;
  const freeMonth = active.length ? monthOfInstallment(ym, maxML) : null;

  // เทียบภาระผ่อนเดือนนี้กับเดือนก่อน (ดูจากยอดคงเหลือ ณ สิ้นเดือนก่อน ไม่ใช่ตารางคงที่)
  const lastD = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastYM = `${lastD.getFullYear()}-${String(lastD.getMonth() + 1).padStart(2, "0")}`;
  const wasActiveInMonth = (it, targetYM) => {
    if (!it.startMonth || it.startMonth > targetYM) return false;
    const paidByThen = (it.payments || []).filter(p => (p.date || "").slice(0, 7) <= targetYM).reduce((s, p) => s + (Number(p.amount) || 0), 0);
    return (Number(it.total) || 0) - paidByThen > 0.0001;
  };
  const lastMonthInst = items.filter(it => wasActiveInMonth(it, lastYM)).reduce((s, it) => s + (Number(it.monthly) || 0), 0);
  const instDelta = instNow - lastMonthInst;

  // พยากรณ์ภาระผ่อน 6 เดือนข้างหน้า
  const forecast = Array.from({
    length: 6
  }).map((_, k) => {
    const mi = now.getMonth() + k;
    const label = THMONTH[(mi % 12 + 12) % 12];
    const value = active.reduce((s, it) => s + (k < monthsLeftOf(it) ? Number(it.monthly) || 0 : 0), 0);
    return {
      label,
      value,
      isNow: k === 0
    };
  });
  const maxV = Math.max(1, ...forecast.map(f => f.value));

  // จ่ายจริงย้อนหลัง 6 เดือนที่ผ่านมา (รวมเดือนนี้)
  const pastForecast = Array.from({
    length: 6
  }).map((_, k) => {
    const offset = k - 5; // -5..0
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const pym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return {
      label: THMONTH[d.getMonth()],
      value: paidInYM(items, pym),
      isNow: offset === 0
    };
  });
  const maxVPast = Math.max(1, ...pastForecast.map(f => f.value));
  return /*#__PURE__*/React.createElement("section", {
    style: S.card
  }, /*#__PURE__*/React.createElement("button", {
    style: S.collapseHead,
    onClick: () => setOpen(o => !o)
  }, /*#__PURE__*/React.createElement("span", {
    style: S.cardLabel
  }, "สรุปประจำเดือน · ", thMonth()), /*#__PURE__*/React.createElement("span", {
    style: S.collapseRight
  }, active.length > 0 ? `หนี้คงเหลือ ${baht(totalRemaining)}` : baht(paidThis), " ", /*#__PURE__*/React.createElement("span", {
    style: S.caret
  }, open ? "▴" : "▾"))), open && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.msRow,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: S.msStat
  }, /*#__PURE__*/React.createElement("div", {
    style: S.msNum
  }, baht(paidThis)), /*#__PURE__*/React.createElement("div", {
    style: S.msLbl
  }, "จ่ายแล้วเดือนนี้")), /*#__PURE__*/React.createElement("div", {
    style: S.msStat
  }, /*#__PURE__*/React.createElement("div", {
    style: S.msNum
  }, baht(instNow)), /*#__PURE__*/React.createElement("div", {
    style: S.msLbl
  }, "ภาระผ่อนเดือนนี้"))), lastMonthInst > 0 && instDelta !== 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.muted2,
      marginTop: -8,
      marginBottom: 10,
      fontWeight: 700,
      color: instDelta < 0 ? teal : amber
    }
  }, instDelta < 0 ? `▼ ภาระผ่อนลดลง ${baht(-instDelta)} จากเดือนก่อน` : `▲ ภาระผ่อนเพิ่มขึ้น ${baht(instDelta)} จากเดือนก่อน`), active.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: S.calcBox
  }, /*#__PURE__*/React.createElement("div", {
    style: S.calcRow
  }, /*#__PURE__*/React.createElement("span", null, "หนี้คงเหลือทั้งหมด"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800
    }
  }, baht(totalRemaining))), freeMonth && /*#__PURE__*/React.createElement("div", {
    style: S.calcRow
  }, /*#__PURE__*/React.createElement("span", null, "คาดว่าจะปลอดหนี้"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: teal,
      fontWeight: 800
    }
  }, freeMonth.label, " ", freeMonth.beShort))), finishing.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: S.msFinish
  }, "🎉 จ่ายงวดสุดท้ายเดือนนี้: ", finishing.map(it => `${it.emoji} ${it.name}`).join(", ")), /*#__PURE__*/React.createElement("div", {
    style: S.msForeLabel
  }, "ภาระผ่อนต่อเดือน · 6 เดือนข้างหน้า"), /*#__PURE__*/React.createElement("div", {
    style: S.foreGrid
  }, forecast.map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: S.foreCol
  }, /*#__PURE__*/React.createElement("div", {
    style: S.foreBarWrap
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.foreBar,
      height: `${f.value / maxV * 100}%`,
      background: f.isNow ? "#FF9EB0" : teal,
      opacity: f.value === 0 ? 0.25 : 1
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.foreVal,
      color: f.isNow ? "#E08AA0" : muted
    }
  }, f.value >= 1000 ? Math.round(f.value / 1000) + "k" : f.value), /*#__PURE__*/React.createElement("div", {
    style: S.foreMo
  }, f.label)))), forecast[5].value < instNow && /*#__PURE__*/React.createElement("div", {
    style: S.msHint
  }, "ดีจัง~ อีกไม่กี่เดือนภาระผ่อนจะเบาลงน้า"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.msForeLabel,
      marginTop: 18
    }
  }, "จ่ายจริงย้อนหลัง · 6 เดือนที่ผ่านมา"), /*#__PURE__*/React.createElement("div", {
    style: S.foreGrid
  }, pastForecast.map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: S.foreCol
  }, /*#__PURE__*/React.createElement("div", {
    style: S.foreBarWrap
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.foreBar,
      height: `${f.value / maxVPast * 100}%`,
      background: f.isNow ? "#FF9EB0" : slate,
      opacity: f.value === 0 ? 0.25 : 1
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.foreVal,
      color: f.isNow ? "#E08AA0" : muted
    }
  }, f.value >= 1000 ? Math.round(f.value / 1000) + "k" : f.value), /*#__PURE__*/React.createElement("div", {
    style: S.foreMo
  }, f.label))))));
}

/* ============================ fixed costs ============================ */
function FixedCosts({
  fixed,
  total,
  onAdd,
  onUpdate,
  onRemove
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const submit = () => {
    if (name.trim() && Number(amount) > 0) {
      onAdd(name.trim(), amount);
      setName("");
      setAmount("");
    }
  };
  return /*#__PURE__*/React.createElement("section", {
    style: S.card
  }, /*#__PURE__*/React.createElement("button", {
    style: S.collapseHead,
    onClick: () => setOpen(o => !o)
  }, /*#__PURE__*/React.createElement("span", {
    style: S.cardLabel
  }, "ค่าใช้จ่ายประจำ"), /*#__PURE__*/React.createElement("span", {
    style: S.collapseRight
  }, baht(total), "/เดือน ", /*#__PURE__*/React.createElement("span", {
    style: S.caret
  }, open ? "▴" : "▾"))), open && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, fixed.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: S.muted2
  }, "ยังไม่มี เช่น ค่าหอ ค่าน้ำไฟ ค่าโทรศัพท์ ค่างวดรถ"), fixed.map(f => /*#__PURE__*/React.createElement("div", {
    key: f.id,
    style: S.fixedRow
  }, /*#__PURE__*/React.createElement("input", {
    style: S.fixedName,
    value: f.name,
    onChange: e => onUpdate(f.id, {
      name: e.target.value
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: S.fixedAmtWrap
  }, /*#__PURE__*/React.createElement("span", {
    style: S.bahtSignSm
  }, "฿"), /*#__PURE__*/React.createElement("input", {
    style: S.fixedAmt,
    type: "number",
    inputMode: "numeric",
    value: f.amount || "",
    onChange: e => onUpdate(f.id, {
      amount: Number(e.target.value) || 0
    })
  })), /*#__PURE__*/React.createElement("button", {
    style: S.rowDel,
    onClick: () => onRemove(f.id),
    "aria-label": "ลบ"
  }, "✕"))), /*#__PURE__*/React.createElement("div", {
    style: S.fixedAddRow
  }, /*#__PURE__*/React.createElement("input", {
    style: S.fixedName,
    value: name,
    onChange: e => setName(e.target.value),
    placeholder: "ชื่อรายจ่าย"
  }), /*#__PURE__*/React.createElement("div", {
    style: S.fixedAmtWrap
  }, /*#__PURE__*/React.createElement("span", {
    style: S.bahtSignSm
  }, "฿"), /*#__PURE__*/React.createElement("input", {
    style: S.fixedAmt,
    type: "number",
    inputMode: "numeric",
    value: amount,
    onChange: e => setAmount(e.target.value),
    placeholder: "0"
  })), /*#__PURE__*/React.createElement("button", {
    style: S.rowAdd,
    onClick: submit,
    "aria-label": "เพิ่ม"
  }, "+"))));
}

/* ============================ income (รายรับเพิ่มเติม) ============================ */
function IncomeList({
  income,
  total,
  onAdd,
  onUpdate,
  onRemove
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [irregular, setIrregular] = useState(false);
  const submit = () => {
    if (name.trim() && Number(amount) > 0) {
      onAdd(name.trim(), amount, irregular);
      setName("");
      setAmount("");
      setIrregular(false);
    }
  };
  const quick = [{
    label: "ค่า พ.ต.ส.",
    irregular: false
  }, {
    label: "ค่า OT",
    irregular: true
  }, {
    label: "ขายเวร",
    irregular: true
  }, {
    label: "เงินพิเศษ",
    irregular: true
  }];
  const irregularTotal = (income || []).filter(f => f.irregular).reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const regularTotal = total - irregularTotal;
  const toggleBtn = (on, onClick) => /*#__PURE__*/React.createElement("button", {
    onClick,
    style: {
      ...S.miniChip,
      marginTop: 6,
      border: `2px solid ${on ? amber : line}`,
      color: on ? amber : muted,
      background: on ? amber + "14" : "#fff"
    }
  }, on ? "☑ ไม่แน่นอน" : "☐ ไม่แน่นอน");
  return /*#__PURE__*/React.createElement("section", {
    style: S.card
  }, /*#__PURE__*/React.createElement("button", {
    style: S.collapseHead,
    onClick: () => setOpen(o => !o)
  }, /*#__PURE__*/React.createElement("span", {
    style: S.cardLabel
  }, "รายรับเพิ่มเติม"), /*#__PURE__*/React.createElement("span", {
    style: {
      ...S.collapseRight,
      color: teal
    }
  }, "+", baht(total), "/เดือน ", /*#__PURE__*/React.createElement("span", {
    style: S.caret
  }, open ? "▴" : "▾"))), open && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: S.muted2
  }, "รายได้นอกเหนือเงินเดือน เช่น ค่า พ.ต.ส. ค่า OT เงินจากการขายเวร — จะถูกบวกเข้ากับเงินที่เหลือใช้ ติ๊ก “ไม่แน่นอน” สำหรับรายรับที่ไม่ได้ทุกเดือน แอปจะกันไว้ไม่นับรวมในยอด "), irregularTotal > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.muted2,
      marginTop: 2,
      marginBottom: 4
    }
  }, "ประจำ ", baht(regularTotal), " · ไม่แน่นอน ", baht(irregularTotal), " (กันพลาด)"), (income || []).map(f => /*#__PURE__*/React.createElement("div", {
    key: f.id,
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.fixedRow,
      marginBottom: 0
    }
  }, /*#__PURE__*/React.createElement("input", {
    style: S.fixedName,
    value: f.name,
    onChange: e => onUpdate(f.id, {
      name: e.target.value
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: S.fixedAmtWrap
  }, /*#__PURE__*/React.createElement("span", {
    style: S.bahtSignSm
  }, "฿"), /*#__PURE__*/React.createElement("input", {
    style: S.fixedAmt,
    type: "number",
    inputMode: "numeric",
    value: f.amount || "",
    onChange: e => onUpdate(f.id, {
      amount: Number(e.target.value) || 0
    })
  })), /*#__PURE__*/React.createElement("button", {
    style: S.rowDel,
    onClick: () => onRemove(f.id),
    "aria-label": "ลบ"
  }, "✕")), toggleBtn(!!f.irregular, () => onUpdate(f.id, {
    irregular: !f.irregular
  })))), /*#__PURE__*/React.createElement("div", {
    style: S.fixedAddRow
  }, /*#__PURE__*/React.createElement("input", {
    style: S.fixedName,
    value: name,
    onChange: e => setName(e.target.value),
    placeholder: "ชื่อรายรับ"
  }), /*#__PURE__*/React.createElement("div", {
    style: S.fixedAmtWrap
  }, /*#__PURE__*/React.createElement("span", {
    style: S.bahtSignSm
  }, "฿"), /*#__PURE__*/React.createElement("input", {
    style: S.fixedAmt,
    type: "number",
    inputMode: "numeric",
    value: amount,
    onChange: e => setAmount(e.target.value),
    placeholder: "0"
  })), /*#__PURE__*/React.createElement("button", {
    style: S.rowAdd,
    onClick: submit,
    "aria-label": "เพิ่ม"
  }, "+")), toggleBtn(irregular, () => setIrregular(v => !v)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 10
    }
  }, quick.map(q => /*#__PURE__*/React.createElement("button", {
    key: q.label,
    style: S.miniChip,
    onClick: () => {
      setName(q.label);
      setIrregular(q.irregular);
    }
  }, "+ ", q.label)))));
}

/* ============================ เป้าหมายออม ============================ */
function SavingsGoals({
  goals,
  free,
  onAdd,
  onAddSaved,
  onRemove
}) {
  const [open, setOpen] = useState(true);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const quick = ["กองทุนฉุกเฉิน", "ดาวน์รถ", "ดาวน์บ้าน", "ท่องเที่ยว"];
  const submitGoal = () => {
    if (name.trim() && Number(target) > 0) {
      onAdd(name.trim(), target);
      setName("");
      setTarget("");
    }
  };
  const list = goals || [];
  return /*#__PURE__*/React.createElement("section", {
    style: S.card
  }, /*#__PURE__*/React.createElement("button", {
    style: S.collapseHead,
    onClick: () => setOpen(o => !o)
  }, /*#__PURE__*/React.createElement("span", {
    style: S.cardLabel
  }, "🎯 เป้าหมายออม"), /*#__PURE__*/React.createElement("span", {
    style: S.collapseRight
  }, list.length > 0 ? `${list.length} เป้า` : "", " ", /*#__PURE__*/React.createElement("span", {
    style: S.caret
  }, open ? "▴" : "▾"))), open && /*#__PURE__*/React.createElement(React.Fragment, null, list.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.muted2,
      marginTop: 6,
      marginBottom: 10
    }
  }, "ตั้งเป้าว่าอยากเก็บเงินไว้ทำอะไร แล้วติดตามความก้าวหน้าได้ที่นี่ ตั้งได้หลายเป้าพร้อมกัน"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, list.map(g => /*#__PURE__*/React.createElement(SavingsGoalRow, {
    key: g.id,
    goal: g,
    free: free,
    onAddSaved: amt => onAddSaved(g.id, amt),
    onRemove: () => onRemove(g.id)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: list.length ? 14 : 0,
      paddingTop: list.length ? 14 : 0,
      borderTop: list.length ? `1px dashed ${line}` : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "ชื่อเป้าหมายใหม่"
  }, /*#__PURE__*/React.createElement("input", {
    style: S.input,
    value: name,
    onChange: e => setName(e.target.value),
    placeholder: "เช่น ดาวน์รถ"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "เป้าหมาย (บาท)"
  }, /*#__PURE__*/React.createElement("input", {
    style: S.input,
    type: "number",
    inputMode: "numeric",
    value: target,
    onChange: e => setTarget(e.target.value),
    placeholder: "50000"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 12
    }
  }, quick.map(q => /*#__PURE__*/React.createElement("button", {
    key: q,
    style: S.miniChip,
    onClick: () => setName(q)
  }, "+ ", q))), /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.saveBtn,
      marginTop: 0,
      opacity: name.trim() && Number(target) > 0 ? 1 : 0.5
    },
    disabled: !(name.trim() && Number(target) > 0),
    onClick: submitGoal
  }, "+ เพิ่มเป้าหมาย"))));
}
function SavingsGoalRow({
  goal,
  free,
  onAddSaved,
  onRemove
}) {
  const [addAmt, setAddAmt] = useState("");
  const submitAdd = () => {
    if (Number(addAmt) > 0) {
      onAddSaved(addAmt);
      setAddAmt("");
    }
  };
  const pct = goal.target > 0 ? Math.min(100, Math.round(goal.saved / goal.target * 100)) : 0;
  const remaining = Math.max(0, goal.target - goal.saved);
  const monthsToGo = free > 0 && remaining > 0 ? Math.ceil(remaining / free) : null;
  const reached = goal.saved >= goal.target && goal.target > 0;
  return /*#__PURE__*/React.createElement("div", {
    style: S.calcBox
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: ink
    }
  }, goal.name), /*#__PURE__*/React.createElement("button", {
    style: S.rowDel,
    onClick: onRemove,
    "aria-label": "ลบเป้าหมาย"
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    style: S.goalBarOuter
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.goalBarFill,
      width: `${pct}%`,
      background: reached ? teal : "#FF9EB0"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: S.calcRow
  }, /*#__PURE__*/React.createElement("span", null, "เก็บแล้ว ", baht(goal.saved)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: muted
    }
  }, "เป้า ", baht(goal.target))), reached ? /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.msHint,
      marginTop: 4
    }
  }, "🎉 ถึงเป้าหมายแล้ว เก่งมากๆ น้า!") : monthsToGo && /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.muted2,
      marginTop: 4
    }
  }, "ถ้าเก็บเดือนละเท่าเงินเหลือใช้ตอนนี้ (", baht(free), ") จะถึงเป้าในอีกประมาณ ", monthsToGo, " เดือน"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 8,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.fixedAmtWrap,
      flex: 1,
      background: "#fff"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: S.bahtSignSm
  }, "฿"), /*#__PURE__*/React.createElement("input", {
    style: S.fixedAmt,
    type: "number",
    inputMode: "numeric",
    value: addAmt,
    onChange: e => setAddAmt(e.target.value),
    placeholder: "เพิ่มเงินที่เก็บได้"
  })), /*#__PURE__*/React.createElement("button", {
    style: S.rowAdd,
    onClick: submitAdd,
    "aria-label": "เพิ่ม"
  }, "+")));
}


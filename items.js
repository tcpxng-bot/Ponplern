/* ============================ installments ============================ */
/* ============================ calendar ============================ */
function PayCalendar({
  items
}) {
  const now = new Date();
  const [view, setView] = useState({
    y: now.getFullYear(),
    m: now.getMonth()
  });
  const [sel, setSel] = useState(null);
  // รวมการจ่ายตามวัน (YYYY-MM-DD) ในเดือนที่ดูอยู่
  const ym = `${view.y}-${String(view.m + 1).padStart(2, "0")}`;
  const byDay = {};
  items.forEach(it => (it.payments || []).forEach(p => {
    if ((p.date || "").slice(0, 7) === ym) {
      const d = Number(p.date.slice(8, 10));
      (byDay[d] = byDay[d] || []).push({
        name: it.name,
        emoji: it.emoji,
        amount: p.amount,
        note: p.note,
        kind: p.kind
      });
    }
  }));
  const firstDow = new Date(view.y, view.m, 1).getDay();
  const daysIn = new Date(view.y, view.m + 1, 0).getDate();
  const todayD = now.getFullYear() === view.y && now.getMonth() === view.m ? now.getDate() : -1;
  // พยากรณ์งวดที่ "ครบกำหนด" ในเดือนที่ดูอยู่ (ของที่ยังผ่อนไม่หมด และงวดนี้ยังไม่จ่าย)
  const realYM = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  const dueList = [];
  items.forEach(it => {
    if (isDone(it)) return;
    const paidM = paidMonthsOf(it), totM = totalMonthsOf(it);
    for (let k = paidM; k < totM; k++) {
      const t = monthOfInstallment(it.startMonth, k);
      if (t.year === view.y && t.mo === view.m) {
        const amt = k === paidM ? Math.min(Number(it.monthly) || 0, remainingOf(it)) : (Number(it.monthly) || 0);
        const targetYM = t.year + "-" + String(t.mo + 1).padStart(2, "0");
        dueList.push({ id: it.id, name: it.name, emoji: it.emoji, amount: amt, overdue: k === paidM && targetYM < realYM, soon: k === paidM && targetYM === realYM });
        break;
      }
    }
  });
  const dueTotal = dueList.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  // วันตัวแทนที่จะปักหมุด "ครบกำหนด" บนปฏิทิน (เดือนปัจจุบันใช้วันนี้ เดือนอื่นใช้วันที่ 1)
  const dueDay = todayD > 0 ? todayD : 1;
  const dueOverdue = dueList.some(d => d.overdue);
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(d);
  const shift = delta => {
    let m = view.m + delta,
      y = view.y;
    if (m < 0) {
      m = 11;
      y--;
    }
    if (m > 11) {
      m = 0;
      y++;
    }
    setView({
      y,
      m
    });
    setSel(null);
  };
  const dow = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  const selList = sel != null ? byDay[sel] || [] : null;
  return /*#__PURE__*/React.createElement("section", {
    style: S.card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: S.calNav,
    onClick: () => shift(-1),
    "aria-label": "เดือนก่อน"
  }, "‹"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: ink,
      fontSize: 15
    }
  }, "📅 ", THMONTH[view.m], " ", view.y + 543), /*#__PURE__*/React.createElement("button", {
    style: S.calNav,
    onClick: () => shift(1),
    "aria-label": "เดือนถัดไป"
  }, "›")), /*#__PURE__*/React.createElement("div", {
    style: S.calGrid
  }, dow.map(d => /*#__PURE__*/React.createElement("div", {
    key: "h" + d,
    style: S.calDow
  }, d)), cells.map((d, i) => {
    if (d == null) return /*#__PURE__*/React.createElement("div", {
      key: "e" + i
    });
    const has = byDay[d];
    const isDue = d === dueDay && dueList.length > 0;
    const isToday = d === todayD;
    const isSel = d === sel;
    const dueCol = dueOverdue ? red : amber;
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      onClick: () => setSel(has || isDue ? d : null),
      style: {
        ...S.calCell,
        background: isSel ? amber : isToday ? "#FFF0E4" : "transparent",
        color: isSel ? "#fff" : ink,
        fontWeight: isToday || has || isDue ? 700 : 400,
        boxShadow: isDue && !isSel ? "inset 0 0 0 2px " + dueCol + "88" : "none"
      }
    }, d, (has || isDue) && /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        bottom: 5,
        display: "flex",
        gap: 3
      }
    }, has && /*#__PURE__*/React.createElement("span", {
      style: { width: 5, height: 5, borderRadius: 999, background: isSel ? "#fff" : teal }
    }), isDue && /*#__PURE__*/React.createElement("span", {
      style: { width: 5, height: 5, borderRadius: 999, background: isSel ? "#fff" : dueCol }
    })));
  })), dueList.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      background: dueOverdue ? "#FFECEC" : "#FFF4EA",
      border: "1.5px solid " + (dueOverdue ? "#FCA5A5" : "#FFD4AE"),
      borderRadius: 14,
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 700,
      color: dueOverdue ? "#DC2626" : "#C2691F",
      marginBottom: 10
    }
  }, (dueOverdue ? "⏰ มีงวดเลยกำหนด · " : "📅 ครบกำหนดเดือนนี้ · "), dueList.length, " รายการ · รวม ", baht(dueTotal)), /*#__PURE__*/React.createElement("div", {
    style: { display: "flex", flexDirection: "column", gap: 7 }
  }, dueList.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      background: "#fff",
      borderRadius: 10,
      padding: "8px 11px",
      border: "1px solid " + (d.overdue ? "#FCA5A5" : line)
    }
  }, /*#__PURE__*/React.createElement("span", null, d.emoji || "💳"), /*#__PURE__*/React.createElement("span", {
    style: { flex: 1, fontSize: 13.5, color: ink, fontWeight: 600 }
  }, d.name, d.overdue && /*#__PURE__*/React.createElement("span", {
    style: { color: "#DC2626", fontSize: 11, fontWeight: 700, marginLeft: 6 }
  }, "เลยกำหนด"), d.soon && /*#__PURE__*/React.createElement("span", {
    style: { color: "#C2691F", fontSize: 11, fontWeight: 700, marginLeft: 6 }
  }, "ถึงกำหนด")), /*#__PURE__*/React.createElement("span", {
    style: { ...num, fontWeight: 700, color: d.overdue ? "#DC2626" : "#C2691F" }
  }, baht(d.amount)))))), /*#__PURE__*/React.createElement("div", {
    style: { display: "flex", gap: 14, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }
  }, [["จ่ายแล้ว", teal], ["ครบกำหนด", amber], ["เลยกำหนด", red]].map(([lb, col], i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: { display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: muted }
  }, /*#__PURE__*/React.createElement("span", {
    style: { width: 8, height: 8, borderRadius: 999, background: col }
  }), lb))), selList && selList.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: S.muted2
  }, "จ่ายวันที่ ", sel, " ", THMONTH[view.m]), selList.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: S.histRow
  }, /*#__PURE__*/React.createElement("span", null, p.emoji || "💸"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 14,
      color: ink
    }
  }, p.name, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: muted,
      fontSize: 12
    }
  }, "· ", p.note)), /*#__PURE__*/React.createElement("span", {
    style: {
      ...num,
      fontWeight: 700,
      color: teal
    }
  }, baht(p.amount))))), Object.keys(byDay).length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.muted2,
      textAlign: "center",
      marginTop: 6
    }
  }, "ยังไม่มีการจ่ายในเดือนนี้"));
}
function Grouped({
  items,
  groupBy,
  ...h
}) {
  let groups;
  if (groupBy === "none") groups = [{
    key: "all",
    title: null,
    items
  }];else {
    const map = new Map();
    items.forEach(it => {
      let k, title, accent;
      if (groupBy === "card") {
        k = (it.card || "").trim() || "ไม่ระบุบัตร";
        title = "🪪 " + k;
        accent = ink;
      } else {
        const m = platMeta(it.platform);
        k = m.id;
        title = m.emoji + " " + m.label;
        accent = m.color;
      }
      if (!map.has(k)) map.set(k, {
        key: k,
        title,
        accent,
        items: []
      });
      map.get(k).items.push(it);
    });
    groups = [...map.values()];
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, groups.map(g => {
    const mo = g.items.filter(it => !isDone(it)).reduce((s, it) => s + (Number(it.monthly) || 0), 0);
    return /*#__PURE__*/React.createElement("div", {
      key: g.key,
      style: {
        marginBottom: 4
      }
    }, g.title && /*#__PURE__*/React.createElement("div", {
      style: S.groupHead
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...S.groupTitle,
        color: g.accent
      }
    }, g.title), /*#__PURE__*/React.createElement("span", {
      style: S.groupMeta
    }, baht(mo), "/เดือน")), /*#__PURE__*/React.createElement("div", {
      style: S.itemList
    }, g.items.map(it => /*#__PURE__*/React.createElement(ItemRow, {
      key: it.id,
      item: it,
      ...h
    }))));
  }));
}
function SwipeRow({ children, done, onPay, onEdit, onDelete }) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const st = useRef({ x: 0, y: 0, base: 0, lock: null });
  const dxRef = useRef(0);
  dxRef.current = dx;
  const acts = [];
  if (!done) acts.push({ label: "จ่าย", bg: teal, fn: onPay });
  acts.push({ label: "แก้ไข", bg: "#8A94A6", fn: onEdit });
  acts.push({ label: "ลบ", bg: red, fn: onDelete });
  const openW = acts.length * 76;
  const onTouchStart = (e) => {
    const t = e.touches[0];
    st.current = { x: t.clientX, y: t.clientY, base: dxRef.current, lock: null };
    setDragging(true);
  };
  const onTouchMove = (e) => {
    const t = e.touches[0];
    const ddx = t.clientX - st.current.x;
    const ddy = t.clientY - st.current.y;
    if (st.current.lock === null && (Math.abs(ddx) > 8 || Math.abs(ddy) > 8))
      st.current.lock = Math.abs(ddx) > Math.abs(ddy) ? "h" : "v";
    if (st.current.lock === "h") {
      let nx = st.current.base + ddx;
      if (nx > 0) nx = 0;
      if (nx < -openW) nx = -openW;
      setDx(nx);
    }
  };
  const onTouchEnd = () => {
    setDragging(false);
    if (st.current.lock === "h") setDx(dxRef.current < -openW / 2 ? -openW : 0);
    st.current.lock = null;
  };
  const closeAnd = (fn) => () => { setDx(0); fn && fn(); };
  const onClickCapture = (e) => { if (dxRef.current !== 0) { e.preventDefault(); e.stopPropagation(); setDx(0); } };
  return React.createElement("div", { style: { position: "relative", borderRadius: 18, overflow: "hidden", boxShadow: "0 3px 10px #5a4a520d" } },
    React.createElement("div", { style: { position: "absolute", top: 0, bottom: 0, right: 0, display: "flex" } },
      acts.map((a, i) => React.createElement("button", {
        key: i, onClick: closeAnd(a.fn),
        style: { width: 76, border: "none", background: a.bg, color: "#fff", fontFamily: "'Prompt', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer" }
      }, a.label))),
    React.createElement("div", {
      onTouchStart: onTouchStart, onTouchMove: onTouchMove, onTouchEnd: onTouchEnd, onClickCapture: onClickCapture,
      style: { transform: "translateX(" + dx + "px)", transition: dragging ? "none" : "transform .25s ease", touchAction: "pan-y", position: "relative", background: "#fff", borderRadius: 18 }
    }, children));
}
function ItemRow({
  item,
  onPay,
  onTick,
  onPrepay,
  onEdit,
  onHistory,
  onDelete
}) {
  const done = isDone(item);
  const tm = totalMonthsOf(item);
  const pm = paidMonthsOf(item);
  return /*#__PURE__*/React.createElement(SwipeRow, {
    done: done,
    onPay: () => onPay(item),
    onEdit: () => onEdit(item.id),
    onDelete: () => onDelete(item.id)
  }, /*#__PURE__*/React.createElement("div", {
    style: S.itemCard
  }, /*#__PURE__*/React.createElement("div", {
    style: S.itemTop
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20
    }
  }, item.emoji || "🎁"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: S.itemName
  }, item.name || "ไม่มีชื่อ"), /*#__PURE__*/React.createElement("div", {
    style: S.badgeRow
  }, item.platform && /*#__PURE__*/React.createElement("span", {
    style: {
      ...S.badge,
      color: platMeta(item.platform).color,
      borderColor: platMeta(item.platform).color + "44"
    }
  }, platMeta(item.platform).emoji, " ", platMeta(item.platform).label), item.card && /*#__PURE__*/React.createElement("span", {
    style: {
      ...S.badge,
      color: muted,
      borderColor: line
    }
  }, "🪪 ", item.card))), /*#__PURE__*/React.createElement(ProgressRing, {
    pct: tm > 0 ? pm / tm * 100 : 0,
    size: 48,
    stroke: 5,
    color: done ? teal : amber,
    label: done ? "✓" : `${pm}/${tm}`
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: S.itemMonthly
  }, baht(item.monthly), /*#__PURE__*/React.createElement("span", {
    style: S.perMo
  }, "/ด.")), /*#__PURE__*/React.createElement("button", {
    style: S.editLink,
    onClick: () => onEdit(item.id)
  }, "แก้ไข"))), /*#__PURE__*/React.createElement(MonthTrack, {
    item: item,
    onTick: i => onTick(item, i)
  }), /*#__PURE__*/React.createElement("div", {
    style: S.itemFoot
  }, /*#__PURE__*/React.createElement("span", {
    style: S.itemFootMeta
  }, done ? "ผ่อนครบแล้ว ✓" : `จ่ายแล้ว ${pm}/${tm} งวด · เหลือ ${baht(remainingOf(item))}`), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, !done && /*#__PURE__*/React.createElement("button", {
    style: S.payBtn,
    onClick: () => onPay(item)
  }, "จ่ายงวดถัดไป"), !done && /*#__PURE__*/React.createElement("button", {
    style: S.ghostBtn,
    onClick: () => onPrepay(item.id)
  }, "ล่วงหน้า"), /*#__PURE__*/React.createElement("button", {
    style: S.ghostBtn,
    onClick: () => onHistory(item.id)
  }, "ประวัติ"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.ghostBtn,
      color: red
    },
    onClick: () => onDelete(item.id)
  }, "ลบ")))));
}
function MonthTrack({
  item,
  onTick
}) {
  const tm = totalMonthsOf(item);
  const paid = paidMonthsOf(item);
  return /*#__PURE__*/React.createElement("div", {
    style: S.trackWrap
  }, Array.from({
    length: tm
  }).map((_, i) => {
    const m = monthOfInstallment(item.startMonth, i);
    const filled = i < paid;
    const next = i === paid;
    const interactive = i === paid || i === paid - 1;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => onTick(i),
      disabled: !interactive,
      title: `งวดที่ ${i + 1} · ${m.label} ${m.year + 543}`,
      "aria-label": `งวด ${i + 1} เดือน ${m.label}${filled ? " จ่ายแล้ว" : ""}`,
      style: {
        ...S.mbox,
        borderColor: filled ? teal : next ? "#FF9EB0" : line,
        background: filled ? teal + "22" : "#fff",
        borderStyle: next ? "dashed" : "solid",
        cursor: interactive ? "pointer" : "default"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...S.mboxMonth,
        color: filled ? "#2C9d86" : ink
      }
    }, m.mo === 0 ? `${m.label}${m.beShort}` : m.label), /*#__PURE__*/React.createElement("span", {
      style: {
        ...S.mboxMark,
        color: filled ? teal : "#D8CFC8"
      }
    }, filled ? "✓" : i + 1));
  }));
}

/* ============================ modals ============================ */
function ItemForm({
  title,
  initial,
  presetMonthly,
  knownCards = [],
  onSave,
  onClose
}) {
  const [name, setName] = useState(initial?.name || "");
  const [emoji, setEmoji] = useState(initial?.emoji || "📱");
  const [platform, setPlatform] = useState(initial?.platform || "shopee");
  const [card, setCard] = useState(initial?.card || "");
  const [total, setTotal] = useState(initial?.total ?? "");
  const [monthly, setMonthly] = useState(initial?.monthly ?? (presetMonthly || ""));
  const [months, setMonths] = useState(initial?.months ?? "");
  const [startMonth, setStartMonth] = useState(initial?.startMonth || todayStr().slice(0, 7));
  const [useInterest, setUseInterest] = useState(initial?.rate != null && initial?.principal != null);
  const [principal, setPrincipal] = useState(initial?.principal ?? "");
  const [rate, setRate] = useState(initial?.rate ?? "");
  // ดอกเบี้ยแบบคงที่ (flat rate) ต่อปี: ดอก = เงินต้น × อัตรา/ปี × จำนวนปี
  const calc = (() => {
    const p = Number(principal),
      r = Number(rate),
      n = Number(months);
    if (!useInterest || !(p > 0) || !(n > 0)) return null;
    const interest = p * (r / 100) * (n / 12);
    const tot = Math.round(p + interest);
    return {
      interest: Math.round(interest),
      total: tot,
      monthly: Math.round(tot / n)
    };
  })();
  const effTotal = calc ? calc.total : Number(total) || 0;
  const effMonthly = calc ? calc.monthly : Number(monthly) || 0;
  const autoMonths = (() => {
    const t = Number(total),
      m = Number(monthly);
    return t > 0 && m > 0 ? Math.ceil(t / m) : "";
  })();
  const canSave = name.trim() && (useInterest ? Number(principal) > 0 && Number(months) > 0 : Number(total) > 0 && Number(monthly) > 0);
  return /*#__PURE__*/React.createElement(Sheet, {
    title: title,
    onClose: onClose
  }, /*#__PURE__*/React.createElement(Field, {
    label: "ของอะไร"
  }, /*#__PURE__*/React.createElement("input", {
    style: S.input,
    value: name,
    onChange: e => setName(e.target.value),
    placeholder: "เช่น iPhone, โซฟา, รถ"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "ไอคอน"
  }, /*#__PURE__*/React.createElement("div", {
    style: S.emojiGrid
  }, EMOJIS.map(e => /*#__PURE__*/React.createElement("button", {
    key: e,
    onClick: () => setEmoji(e),
    style: {
      ...S.emojiCell,
      ...(emoji === e ? S.emojiOn : {})
    }
  }, e)))), /*#__PURE__*/React.createElement(Field, {
    label: "ซื้อจากร้าน"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, PLATFORMS.map(p => /*#__PURE__*/React.createElement("button", {
    key: p.id,
    onClick: () => setPlatform(p.id),
    style: {
      ...S.platChip,
      ...(platform === p.id ? {
        borderColor: p.color,
        color: p.color,
        background: p.color + "10"
      } : {})
    }
  }, p.emoji, " ", p.label)))), /*#__PURE__*/React.createElement(Field, {
    label: "ผ่อนด้วยบัตร / ช่องทาง"
  }, /*#__PURE__*/React.createElement("input", {
    style: S.input,
    value: card,
    onChange: e => setCard(e.target.value),
    placeholder: "เช่น KBank, SCB, ผ่อน 0%"
  }), knownCards.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap",
      marginTop: 8
    }
  }, knownCards.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    onClick: () => setCard(c),
    style: S.miniChip
  }, "🪪 ", c)))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "2px 0 2px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setUseInterest(v => !v),
    style: {
      ...S.platChip,
      borderColor: useInterest ? teal : line,
      color: useInterest ? teal : muted,
      background: useInterest ? teal + "14" : "#fff"
    }
  }, useInterest ? "☑" : "☐", " ให้แอปคิดดอกเบี้ยให้ (% ต่อปี)")), useInterest ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "ราคา/เงินต้น"
  }, /*#__PURE__*/React.createElement("input", {
    style: S.input,
    type: "number",
    inputMode: "decimal",
    value: principal,
    onChange: e => setPrincipal(e.target.value),
    placeholder: "36000"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "ดอกเบี้ย %/ปี"
  }, /*#__PURE__*/React.createElement("input", {
    style: S.input,
    type: "number",
    inputMode: "decimal",
    value: rate,
    onChange: e => setRate(e.target.value),
    placeholder: "15"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "จำนวนงวด (เดือน)"
  }, /*#__PURE__*/React.createElement("input", {
    style: S.input,
    type: "number",
    inputMode: "numeric",
    value: months,
    onChange: e => setMonths(e.target.value),
    placeholder: "12"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "เริ่มผ่อนเดือน"
  }, /*#__PURE__*/React.createElement("input", {
    style: S.input,
    type: "month",
    value: startMonth,
    onChange: e => setStartMonth(e.target.value)
  }))), calc ? /*#__PURE__*/React.createElement("div", {
    style: S.calcBox
  }, /*#__PURE__*/React.createElement("div", {
    style: S.calcRow
  }, /*#__PURE__*/React.createElement("span", null, "ดอกเบี้ยรวม"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: red,
      fontWeight: 700
    }
  }, "+", baht(calc.interest))), /*#__PURE__*/React.createElement("div", {
    style: S.calcRow
  }, /*#__PURE__*/React.createElement("span", null, "ยอดผ่อนรวม"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, baht(calc.total))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.calcRow,
      fontSize: 16
    }
  }, /*#__PURE__*/React.createElement("span", null, "ตกเดือนละ"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: teal,
      fontWeight: 800
    }
  }, baht(calc.monthly), " × ", Number(months) || 0, " งวด"))) : /*#__PURE__*/React.createElement("div", {
    style: S.hint
  }, "ใส่ราคา ดอกเบี้ย และจำนวนงวด แล้วแอปจะคำนวณยอดผ่อนรวมให้")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "ยอดเต็มทั้งหมด"
  }, /*#__PURE__*/React.createElement("input", {
    style: S.input,
    type: "number",
    inputMode: "decimal",
    value: total,
    onChange: e => setTotal(e.target.value),
    placeholder: "36000"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "ผ่อน/เดือน"
  }, /*#__PURE__*/React.createElement("input", {
    style: S.input,
    type: "number",
    inputMode: "decimal",
    value: monthly,
    onChange: e => setMonthly(e.target.value),
    placeholder: "3000"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: `จำนวนงวด${autoMonths ? ` (แนะนำ ${autoMonths})` : ""}`
  }, /*#__PURE__*/React.createElement("input", {
    style: S.input,
    type: "number",
    inputMode: "numeric",
    value: months,
    onChange: e => setMonths(e.target.value),
    placeholder: autoMonths ? String(autoMonths) : "12"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "เริ่มผ่อนเดือน"
  }, /*#__PURE__*/React.createElement("input", {
    style: S.input,
    type: "month",
    value: startMonth,
    onChange: e => setStartMonth(e.target.value)
  })))), /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.saveBtn,
      opacity: canSave ? 1 : 0.5
    },
    disabled: !canSave,
    onClick: () => onSave({
      name: name.trim(),
      emoji,
      platform,
      card: card.trim(),
      total: effTotal,
      monthly: effMonthly,
      months: Number(months) || autoMonths || undefined,
      startMonth,
      principal: useInterest ? Number(principal) || 0 : undefined,
      rate: useInterest ? Number(rate) || 0 : undefined
    })
  }, "บันทึก"));
}
function PayForm({
  item,
  onSave,
  onClose
}) {
  const remaining = remainingOf(item);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("จ่ายล่วงหน้า");
  const [date, setDate] = useState(todayStr());
  const canSave = Number(amount) > 0;
  return /*#__PURE__*/React.createElement(Sheet, {
    title: `จ่ายล่วงหน้า · ${item.name}`,
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: S.hint
  }, "คงเหลือ ", bahtExact(remaining)), /*#__PURE__*/React.createElement(Field, {
    label: "จำนวนเงิน"
  }, /*#__PURE__*/React.createElement("input", {
    style: S.input,
    type: "number",
    inputMode: "decimal",
    autoFocus: true,
    value: amount,
    onChange: e => setAmount(e.target.value),
    placeholder: "เช่น 6000"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 14,
      flexWrap: "wrap"
    }
  }, [remaining, (Number(item.monthly) || 0) * 2, Number(item.monthly) || 0].filter(v => v > 0).map((v, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    style: S.miniChip,
    onClick: () => setAmount(String(v))
  }, i === 0 ? "ปิดยอด " : "", baht(v)))), /*#__PURE__*/React.createElement(Field, {
    label: "โน้ต"
  }, /*#__PURE__*/React.createElement("input", {
    style: S.input,
    value: note,
    onChange: e => setNote(e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "วันที่จ่าย"
  }, /*#__PURE__*/React.createElement("input", {
    style: S.input,
    type: "date",
    value: date,
    onChange: e => setDate(e.target.value)
  })), /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.saveBtn,
      opacity: canSave ? 1 : 0.5
    },
    disabled: !canSave,
    onClick: () => onSave({
      date,
      amount: Number(amount),
      note: note.trim() || "จ่ายล่วงหน้า",
      kind: "prepay"
    })
  }, "บันทึกการจ่าย"));
}
function History({
  item,
  onDel,
  onEditDate,
  onClose
}) {
  const list = [...(item.payments || [])].sort((a, b) => a.date < b.date ? 1 : -1);
  return /*#__PURE__*/React.createElement(Sheet, {
    title: `ประวัติ · ${item.name}`,
    onClose: onClose
  }, list.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: S.hint
  }, "ยังไม่มีรายการจ่าย") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.muted2,
      marginBottom: 10
    }
  }, "แก้วันที่ได้ถ้าบันทึกย้อนหลัง — แตะที่วันที่เพื่อแก้"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, list.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: S.histRow
  }, /*#__PURE__*/React.createElement("span", null, p.kind === "prepay" ? "⏩" : "✓"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontFamily: "'Prompt', sans-serif"
    }
  }, bahtExact(p.amount)), /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.histMeta,
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: p.date,
    onChange: e => e.target.value && onEditDate(p.id, e.target.value),
    style: S.histDateInput
  }), " · ", p.note)), /*#__PURE__*/React.createElement("button", {
    style: S.rowDel,
    onClick: () => onDel(p.id)
  }, "✕"))))));
}
function SimulatorSheet({
  totalIn,
  fixedTotal,
  instTotal,
  free,
  extra,
  setExtra,
  onClose,
  onAddReal
}) {
  return /*#__PURE__*/React.createElement(Sheet, {
    title: "ลองคิดดู · ถ้าผ่อนของเพิ่ม",
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: S.simTopRow
  }, /*#__PURE__*/React.createElement("span", {
    style: S.simAsk
  }, "ผ่อนเพิ่มเดือนละ"), /*#__PURE__*/React.createElement("div", {
    style: S.salaryInputWrap
  }, /*#__PURE__*/React.createElement("span", {
    style: S.bahtSign
  }, "฿"), /*#__PURE__*/React.createElement("input", {
    style: S.salaryInput,
    type: "number",
    inputMode: "numeric",
    value: extra || "",
    onChange: e => setExtra(Math.max(0, Number(e.target.value) || 0)),
    placeholder: "0"
  }))), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 0,
    max: Math.max(totalIn, 20000),
    step: 500,
    value: Math.min(extra, Math.max(totalIn, 20000)),
    onChange: e => setExtra(Number(e.target.value)),
    style: S.range,
    "aria-label": "ผ่อนเพิ่มเดือนละ"
  }), /*#__PURE__*/React.createElement("div", {
    style: S.chipRow
  }, [1000, 2000, 3000, 5000].map(v => /*#__PURE__*/React.createElement("button", {
    key: v,
    style: S.chip,
    onClick: () => setExtra(v)
  }, "+", baht(v))), extra > 0 && /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.chip,
      color: muted
    },
    onClick: () => setExtra(0)
  }, "ล้าง")), /*#__PURE__*/React.createElement(FlowBar, {
    salary: totalIn,
    fixed: fixedTotal,
    inst: instTotal + extra,
    projected: true
  }), /*#__PURE__*/React.createElement("div", {
    style: S.simResult
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: S.simResLabel
  }, "จะเหลือใช้"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.simResNum,
      color: free - extra >= 0 ? amber : red
    }
  }, free - extra < 0 ? "−" : "", baht(Math.abs(free - extra)))), extra > 0 && /*#__PURE__*/React.createElement("div", {
    style: S.simDelta
  }, "จากเดิม ", baht(free), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: red
    }
  }, "↓ ", baht(extra), "/เดือน"))), extra > 0 && free - extra < 0 && /*#__PURE__*/React.createElement("div", {
    style: S.warnNeg
  }, "ผ่อนเพิ่มเท่านี้จะทำให้เงินติดลบ ", baht(extra - free)), extra > 0 && free - extra >= 0 && free - extra < totalIn * 0.1 && /*#__PURE__*/React.createElement("div", {
    style: S.warnSoft
  }, "ยังพอไหว แต่จะเหลือเผื่อฉุกเฉินน้อยมาก"), extra > 0 && /*#__PURE__*/React.createElement("button", {
    style: S.simAddBtn,
    onClick: onAddReal
  }, "เพิ่มเป็นรายการผ่อนจริง →"));
}
function Confirm({
  name,
  onConfirm,
  onClose
}) {
  return /*#__PURE__*/React.createElement(Sheet, {
    title: "ลบรายการนี้?",
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: S.hint
  }, "ลบ “", name, "” และประวัติทั้งหมด ลบแล้วเอาคืนไม่ได้"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.ghostBig
    },
    onClick: onClose
  }, "ยกเลิก"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.saveBtn,
      marginTop: 0,
      background: red
    },
    onClick: onConfirm
  }, "ลบเลย")));
}
function ImportConfirm({
  data,
  onConfirm,
  onClose
}) {
  const n = data?.items?.length || 0;
  const sal = data?.budget?.salary || 0;
  const fx = (data?.budget?.fixed || []).length;
  const inc = (data?.budget?.income || []).length;
  const sg = (data?.budget?.savingsGoals || []).length;
  return /*#__PURE__*/React.createElement(Sheet, {
    title: "นำเข้าข้อมูลนี้?",
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: S.hint
  }, "ไฟล์นี้มี: รายการผ่อน ", n, " รายการ · เงินเดือน ", baht(sal), " · ค่าใช้จ่ายประจำ ", fx, " รายการ · รายรับเพิ่มเติม ", inc, " รายการ · เป้าหมายออม ", sg, " เป้า", /*#__PURE__*/React.createElement("br", null), "การนำเข้าจะแทนที่ข้อมูลปัจจุบันทั้งหมดในเครื่องนี้ และเอาคืนไม่ได้"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.ghostBig
    },
    onClick: onClose
  }, "ยกเลิก"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.saveBtn,
      marginTop: 0,
      background: teal
    },
    onClick: onConfirm
  }, "ยืนยันนำเข้า")));
}
function BackupCard({
  onExport,
  onExportCSV,
  onPickFile,
  error
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: S.card
  }, /*#__PURE__*/React.createElement("div", {
    style: S.cardLabel
  }, "สำรอง/กู้ข้อมูล"), /*#__PURE__*/React.createElement("div", {
    style: S.muted2
  }, "ดาวน์โหลดข้อมูลเก็บไว้กันลืม เผื่อล้างข้อมูลเบราว์เซอร์หรือเปลี่ยนเครื่อง แล้วนำเข้ากลับได้ทุกเมื่อ"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.ghostBig,
      flex: "1 1 140px"
    },
    onClick: onExport
  }, "⬇️ ดาวน์โหลดสำรอง"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.ghostBig,
      flex: "1 1 140px"
    },
    onClick: onPickFile
  }, "⬆️ นำเข้าไฟล์")), /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.ghostBig,
      width: "100%",
      marginTop: 10
    },
    onClick: onExportCSV
  }, "📊 ส่งออกประวัติการจ่ายเป็น Excel/CSV"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.muted2,
      marginTop: 6
    }
  }, "ไฟล์ .csv เปิดได้ด้วย Excel, Google Sheets, Numbers"), error && /*#__PURE__*/React.createElement("div", {
    style: S.warnNeg
  }, error));
}
function Sheet({
  title,
  children,
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: S.overlay,
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: S.sheet,
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: S.grip
  }), /*#__PURE__*/React.createElement("div", {
    style: S.sheetHead
  }, /*#__PURE__*/React.createElement("h2", {
    style: S.sheetTitle
  }, title), /*#__PURE__*/React.createElement("button", {
    style: S.closeBtn,
    onClick: onClose
  }, "✕")), children));
}
function Field({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      marginBottom: 14,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: S.fieldLabel
  }, label), children);
}

function App() {
  const [items, setItems] = useState([]);
  const [budget, setBudget] = useState({
    salary: 0,
    fixed: [],
    income: [],
    savingsGoals: []
  });
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState(null);
  const [groupBy, setGroupBy] = useState("none");
  const [tab, setTab] = useState("home");
  const [confetti, setConfetti] = useState(0);
  const [extra, setExtra] = useState(0); // ตัวจำลอง: ผ่อนเพิ่มเดือนละ
  const [pin, setPin] = useState(null); // รหัสที่ตั้งไว้ (null = ยังโหลดไม่เสร็จ, "" = ยังไม่เคยตั้ง)
  const [unlocked, setUnlocked] = useState(false);
  const loaded = useRef(false);
  const fileInputRef = useRef(null);
  const [pendingImport, setPendingImport] = useState(null);
  const [importError, setImportError] = useState("");

  /* load */
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(ITEMS_KEY);
        if (r?.value) setItems(JSON.parse(r.value));
      } catch (e) {}
      try {
        const b = await window.storage.get(BUDGET_KEY);
        if (b?.value) {
          const parsed = JSON.parse(b.value);
          // ย้ายข้อมูลเก่า: เป้าหมายออมเดี่ยว (savingsGoal) -> รายการเป้าหมายหลายอัน (savingsGoals)
          if (!Array.isArray(parsed.savingsGoals)) {
            parsed.savingsGoals = parsed.savingsGoal ? [{
              id: uid(),
              ...parsed.savingsGoal
            }] : [];
          }
          delete parsed.savingsGoal;
          setBudget(parsed);
        }
      } catch (e) {}
      let savedPin = "";
      try {
        const p = await window.storage.get(PIN_KEY);
        if (p?.value) savedPin = JSON.parse(p.value);
      } catch (e) {}
      setPin(savedPin);
      loaded.current = true;
      setReady(true);
    })();
  }, []);
  useEffect(() => {
    if (loaded.current) (async () => {
      try {
        await window.storage.set(ITEMS_KEY, JSON.stringify(items));
      } catch (e) {}
    })();
  }, [items]);
  useEffect(() => {
    if (loaded.current) (async () => {
      try {
        await window.storage.set(BUDGET_KEY, JSON.stringify(budget));
      } catch (e) {}
    })();
  }, [budget]);
  const savePin = async code => {
    try {
      await window.storage.set(PIN_KEY, JSON.stringify(code));
    } catch (e) {}
    setPin(code);
    setUnlocked(true);
  };
  const resetPin = async () => {
    try {
      await window.storage.delete(PIN_KEY);
    } catch (e) {}
    setPin("");
    setUnlocked(false);
  };

  /* item actions */
  const addItem = d => setItems(p => [{
    id: uid(),
    payments: [],
    ...d
  }, ...p]);
  const updateItem = (id, d) => setItems(p => p.map(it => it.id === id ? {
    ...it,
    ...d
  } : it));
  const deleteItem = id => setItems(p => p.filter(it => it.id !== id));
  const addPayment = (id, pay) => {
    setItems(p => p.map(it => it.id === id ? {
      ...it,
      payments: [...(it.payments || []), {
        id: uid(),
        ...pay
      }]
    } : it));
    setConfetti(Date.now());
  };
  const deletePayment = (id, pid) => setItems(p => p.map(it => it.id === id ? {
    ...it,
    payments: it.payments.filter(x => x.id !== pid)
  } : it));
  const updatePayment = (id, pid, patch) => setItems(p => p.map(it => it.id === id ? {
    ...it,
    payments: (it.payments || []).map(x => x.id === pid ? {
      ...x,
      ...patch
    } : x)
  } : it));
  // วันที่ของงวดที่ idx (0-based): ถ้าเป็นเดือนปัจจุบันใช้วันนี้จริง ถ้าเป็นเดือนอื่น (บันทึกย้อนหลัง) ใช้วันที่ 1 ของเดือนนั้น
  const dateForIndex = (it, idx) => {
    const realYM = todayStr().slice(0, 7);
    const t = monthOfInstallment(it.startMonth, idx);
    const targetYM = `${t.year}-${String(t.mo + 1).padStart(2, "0")}`;
    return targetYM === realYM ? todayStr() : `${targetYM}-01`;
  };
  const payMonth = it => {
    const idx = paidMonthsOf(it);
    const amt = Math.min(Number(it.monthly) || 0, remainingOf(it));
    if (amt > 0) addPayment(it.id, {
      date: dateForIndex(it, idx),
      amount: amt,
      note: `งวดที่ ${idx + 1}`,
      kind: "normal"
    });
  };
  const tickBox = (it, idx) => {
    const paid = paidMonthsOf(it);
    if (idx === paid) {
      const amt = Math.min(Number(it.monthly) || 0, remainingOf(it));
      if (amt > 0) addPayment(it.id, {
        date: dateForIndex(it, idx),
        amount: amt,
        note: `งวดที่ ${paid + 1}`,
        kind: "normal"
      });
    } else if (idx === paid - 1) {
      const ps = it.payments || [];
      if (ps.length) deletePayment(it.id, ps[ps.length - 1].id);
    }
  };

  /* budget actions */
  const setSalary = v => setBudget(b => ({
    ...b,
    salary: Number(v) || 0
  }));
  const addFixed = (name, amount) => setBudget(b => ({
    ...b,
    fixed: [...b.fixed, {
      id: uid(),
      name,
      amount: Number(amount) || 0
    }]
  }));
  const updateFixed = (id, patch) => setBudget(b => ({
    ...b,
    fixed: b.fixed.map(f => f.id === id ? {
      ...f,
      ...patch
    } : f)
  }));
  const removeFixed = id => setBudget(b => ({
    ...b,
    fixed: b.fixed.filter(f => f.id !== id)
  }));
  const addIncome = (name, amount, irregular) => setBudget(b => ({
    ...b,
    income: [...(b.income || []), {
      id: uid(),
      name,
      amount: Number(amount) || 0,
      irregular: !!irregular
    }]
  }));
  const updateIncome = (id, patch) => setBudget(b => ({
    ...b,
    income: (b.income || []).map(f => f.id === id ? {
      ...f,
      ...patch
    } : f)
  }));
  const removeIncome = id => setBudget(b => ({
    ...b,
    income: (b.income || []).filter(f => f.id !== id)
  }));

  /* เป้าหมายออม (หลายอันได้) */
  const addSavingsGoal = (name, target) => setBudget(b => ({
    ...b,
    savingsGoals: [...(b.savingsGoals || []), {
      id: uid(),
      name,
      target: Number(target) || 0,
      saved: 0
    }]
  }));
  const addSaved = (id, amount) => setBudget(b => ({
    ...b,
    savingsGoals: (b.savingsGoals || []).map(g => g.id === id ? {
      ...g,
      saved: Math.max(0, (Number(g.saved) || 0) + (Number(amount) || 0))
    } : g)
  }));
  const removeSavingsGoal = id => setBudget(b => ({
    ...b,
    savingsGoals: (b.savingsGoals || []).filter(g => g.id !== id)
  }));
  const addDream = (data) => setBudget(b => ({ ...b, savingsGoals: [...(b.savingsGoals || []), { id: uid(), saved: 0, ...data }] }));
  const updateGoal = (id, patch) => setBudget(b => ({ ...b, savingsGoals: (b.savingsGoals || []).map(g => g.id === id ? { ...g, ...patch } : g) }));

  /* สำรอง/กู้ข้อมูล */
  const downloadBlob = (filename, blob) => {
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {}
  };
  const exportData = () => {
    const payload = {
      app: "pon-ploen-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      items,
      budget
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    });
    downloadBlob(`pon-ploen-backup-${todayStr()}.json`, blob);
  };
  const csvCell = v => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const exportCSV = () => {
    const header = ["วันที่", "รายการ", "ร้าน/แพลตฟอร์ม", "บัตร/ช่องทาง", "จำนวนเงิน", "ประเภท", "หมายเหตุ"];
    const rows = [];
    items.forEach(it => {
      (it.payments || []).forEach(p => {
        rows.push([p.date || "", it.name || "", platMeta(it.platform).label, it.card || "", Number(p.amount) || 0, p.kind === "prepay" ? "จ่ายล่วงหน้า" : "งวดปกติ", p.note || ""]);
      });
    });
    rows.sort((a, b) => (a[0] || "") < (b[0] || "") ? -1 : (a[0] || "") > (b[0] || "") ? 1 : 0);
    const csv = "\uFEFF" + [header, ...rows].map(r => r.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });
    downloadBlob(`pon-ploen-payments-${todayStr()}.csv`, blob);
  };
  const pickImportFile = () => {
    setImportError("");
    fileInputRef.current?.click();
  };
  const handleImportFile = e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const itemsArr = Array.isArray(data.items) ? data.items : [];
        const db = data.budget || {};
        const savingsGoals = Array.isArray(db.savingsGoals) ? db.savingsGoals : db.savingsGoal && typeof db.savingsGoal === "object" ? [{
          id: uid(),
          ...db.savingsGoal
        }] : [];
        const budgetObj = {
          salary: Number(db.salary) || 0,
          fixed: Array.isArray(db.fixed) ? db.fixed : [],
          income: Array.isArray(db.income) ? db.income : [],
          savingsGoals
        };
        setImportError("");
        setPendingImport({
          items: itemsArr,
          budget: budgetObj
        });
        setModal({
          type: "import"
        });
      } catch (err) {
        setImportError("ไฟล์นี้เปิดไม่ได้ ลองเลือกไฟล์สำรอง .json ที่ถูกต้องอีกครั้งนะคะ");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  const confirmImport = () => {
    if (!pendingImport) return;
    setItems(pendingImport.items);
    setBudget(pendingImport.budget);
    setPendingImport(null);
    setModal(null);
  };

  const salary = Number(budget.salary) || 0;
  const incomeList = budget.income || [];
  const incomeTotal = incomeList.reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const incomeIrregularTotal = incomeList.filter(f => f.irregular).reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const incomeRegularTotal = incomeTotal - incomeIrregularTotal;
  const totalIn = salary + incomeTotal;
  const totalInSafe = salary + incomeRegularTotal; // ไม่นับรายรับที่ไม่แน่นอน (กันพลาด)
  const fixedTotal = (budget.fixed || []).reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const active = items.filter(it => !isDone(it));
  const instTotal = active.reduce((s, it) => s + (Number(it.monthly) || 0), 0);
  const spent = fixedTotal + instTotal;
  const free = totalIn - spent;
  const freeSafe = totalInSafe - spent;
  // รายการที่ยังไม่จ่ายงวดของตัวเองสำหรับเดือนนี้ (ถึงกำหนดแล้วหรือเลยกำหนดแล้ว)
  const realYM = todayStr().slice(0, 7);
  const dueItems = active.filter(it => {
    const t = monthOfInstallment(it.startMonth, paidMonthsOf(it));
    const targetYM = `${t.year}-${String(t.mo + 1).padStart(2, "0")}`;
    return targetYM <= realYM;
  });
  return /*#__PURE__*/React.createElement("div", {
    style: S.page
  }, /*#__PURE__*/React.createElement(StyleTag, null), confetti > 0 && /*#__PURE__*/React.createElement(Confetti, {
    key: confetti
  }), !ready ? /*#__PURE__*/React.createElement(SkeletonHome, null) : !unlocked ? /*#__PURE__*/React.createElement(PinScreen, {
    mode: pin ? "unlock" : "set",
    storedPin: pin,
    onUnlock: () => setUnlocked(true),
    onSet: savePin,
    onForgot: resetPin
  }) : /*#__PURE__*/React.createElement("div", {
    style: S.shell
  }, /*#__PURE__*/React.createElement("header", {
    style: S.header
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: S.greeting
  }, greetingText(), " 👋"), /*#__PURE__*/React.createElement("div", {
    style: S.brand
  }, "ผ่อนเพลิน 🐷"), /*#__PURE__*/React.createElement("div", {
    style: S.sub
  }, "วางแผนผ่อนแบบสบายใจ · ", thMonth())), /*#__PURE__*/React.createElement("button", {
    style: S.addBtn,
    onClick: () => setModal({
      type: "add"
    })
  }, "+ เพิ่มรายการ")), tab === "home" && dueItems.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: S.dueBanner
  }, /*#__PURE__*/React.createElement("div", {
    style: S.dueBannerHead
  }, "⏰ ยังไม่จ่าย ", dueItems.length, " รายการเดือนนี้ — แตะเพื่อจ่ายเลย"), /*#__PURE__*/React.createElement("div", {
    style: S.dueChipsRow
  }, dueItems.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.id,
    style: S.dueChip,
    onClick: () => payMonth(it)
  }, it.emoji, " ", it.name, " · ", baht(it.monthly), " ✓")))), tab === "home" && /*#__PURE__*/React.createElement("section", {
    style: S.card
  }, /*#__PURE__*/React.createElement("div", {
    style: S.cardLabel
  }, "สรุปเงินเดือนนี้"), /*#__PURE__*/React.createElement("div", {
    style: S.salaryRow
  }, /*#__PURE__*/React.createElement("span", {
    style: S.salaryTag
  }, "เงินเดือนตั้งต้น"), /*#__PURE__*/React.createElement("div", {
    style: S.salaryInputWrap
  }, /*#__PURE__*/React.createElement("span", {
    style: S.bahtSign
  }, "฿"), /*#__PURE__*/React.createElement("input", {
    style: S.salaryInput,
    type: "number",
    inputMode: "numeric",
    value: budget.salary || "",
    onChange: e => setSalary(e.target.value),
    placeholder: "0"
  }))), salary > 0 && incomeTotal > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: teal,
      fontWeight: 700,
      marginTop: 10,
      marginBottom: 2
    }
  }, "+ รายรับเพิ่ม ", baht(incomeTotal), " · รวมรับทั้งเดือน ", baht(totalIn)), salary <= 0 ? /*#__PURE__*/React.createElement("div", {
    style: S.prompt
  }, "ใส่เงินเดือนเพื่อเริ่มคำนวณเงินเหลือใช้ · ", /*#__PURE__*/React.createElement("button", {
    style: S.linkBtn,
    onClick: () => {
      setBudget(SAMPLE_BUDGET());
      setItems(SAMPLE_ITEMS());
    }
  }, "ลองใส่ตัวอย่าง")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FlowBar, {
    salary: totalIn,
    fixed: fixedTotal,
    inst: instTotal
  }), /*#__PURE__*/React.createElement(Legend, {
    fixed: fixedTotal,
    inst: instTotal,
    free: free
  }), /*#__PURE__*/React.createElement("div", {
    style: S.freeRow
  }, /*#__PURE__*/React.createElement("span", {
    style: S.freeLabel
  }, "เหลือใช้ต่อเดือน"), /*#__PURE__*/React.createElement("span", {
    style: {
      ...S.freeNum,
      color: free >= 0 ? amber : red
    }
  }, free < 0 ? "−" : "", baht(Math.abs(free)))), incomeIrregularTotal > 0 && (freeSafe < 0 ? /*#__PURE__*/React.createElement("div", {
    style: S.warnNeg
  }, "⚠️ ถ้าเดือนนี้ไม่มี ", incomeList.filter(f => f.irregular).map(f => f.name).join(", "), " (รายรับไม่แน่นอน) จะติดลบ ", baht(-freeSafe)) : /*#__PURE__*/React.createElement("div", {
    style: S.warnSoft
  }, "เผื่อไว้ก่อน: ถ้าไม่มีรายรับไม่แน่นอนเดือนนี้ จะเหลือใช้ ", baht(freeSafe), " (กันพลาด)")), /*#__PURE__*/React.createElement("div", {
    style: S.mascotRow
  }, /*#__PURE__*/React.createElement(Coin, {
    mood: ploenSay(free, totalIn, instTotal).mood
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: S.mascotName
  }, "น้องผ่อนเพลิน"), /*#__PURE__*/React.createElement("div", {
    style: S.bubble
  }, ploenSay(free, totalIn, instTotal).msg))))), tab === "home" && /*#__PURE__*/React.createElement(IncomeList, {
    income: budget.income || [],
    total: incomeTotal,
    onAdd: addIncome,
    onUpdate: updateIncome,
    onRemove: removeIncome
  }), tab === "home" && /*#__PURE__*/React.createElement(FixedCosts, {
    fixed: budget.fixed || [],
    total: fixedTotal,
    onAdd: addFixed,
    onUpdate: updateFixed,
    onRemove: removeFixed
  }), salary > 0 && tab === "home" && /*#__PURE__*/React.createElement("button", {
    style: S.simTriggerBtn,
    onClick: () => setModal({
      type: "simulate"
    })
  }, /*#__PURE__*/React.createElement("span", null, "🧮 ลองคิดดู · ถ้าผ่อนของเพิ่ม"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: muted
    }
  }, "→"), tab === "home" && /*#__PURE__*/React.createElement(DreamWidget, { goals: budget.savingsGoals||[], onSave: () => { var g=dreamNearest(budget.savingsGoals||[]); if(g) setModal({type:"quickSaveDream", goal:g}); }, onGoToDreams: () => setTab("savings") }), tab === "home" && salary > 0 && /*#__PURE__*/React.createElement(FinancialScoreCard, { score: calcFinancialScore(totalIn, fixedTotal, instTotal, free, budget.savingsGoals||[], items), streak: calcStreak(items), nextItem: items.filter(it=>!isDone(it))[0]||null, goals: budget.savingsGoals||[], salary: salary, free: free })), tab === "analytics" && /*#__PURE__*/React.createElement(Analytics, {
    totalIn: totalIn,
    salary: salary,
    incomeTotal: incomeTotal,
    fixedTotal: fixedTotal,
    instTotal: instTotal,
    free: free,
    items: items
  }), tab === "analytics" && salary >= 0 && /*#__PURE__*/React.createElement(MonthlySummary, {
    items: items
  }), tab === "savings" && /*#__PURE__*/React.createElement(DreamBoard, {
    goals: budget.savingsGoals || [],
    onAdd: addDream,
    onUpdate: updateGoal,
    onAddSaved: addSaved,
    onRemove: removeSavingsGoal
  }), tab === "savings" && /*#__PURE__*/React.createElement(Achievements, {
    items: items,
    budget: budget
  }), tab === "installments" && items.length > 0 && /*#__PURE__*/React.createElement(PayCalendar, {
    items: items
  }), tab === "installments" && /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: S.sectionHead
  }, /*#__PURE__*/React.createElement("span", {
    style: S.sectionTitle
  }, "รายการที่กำลังผ่อน"), /*#__PURE__*/React.createElement("span", {
    style: S.sectionMeta
  }, "ผ่อนรวม ", baht(instTotal), "/เดือน")), !ready ? /*#__PURE__*/React.createElement(SkeletonRows, null) : items.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: S.emptyCard
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 30
    }
  }, "🧾"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600
    }
  }, "ยังไม่มีรายการผ่อน"), /*#__PURE__*/React.createElement("div", {
    style: S.emptyText
  }, "เพิ่มของที่กำลังผ่อน แล้วดูผลกับเงินเหลือใช้"), /*#__PURE__*/React.createElement("button", {
    style: S.addBtn,
    onClick: () => setModal({
      type: "add"
    })
  }, "+ เพิ่มรายการ")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: S.segment
  }, [["none", "ทั้งหมด"], ["card", "ตามบัตร"], ["store", "ตามร้าน"]].map(([k, lb]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => setGroupBy(k),
    style: {
      ...S.segBtn,
      ...(groupBy === k ? S.segOn : {})
    }
  }, lb))), /*#__PURE__*/React.createElement(Grouped, {
    items: items,
    groupBy: groupBy,
    onPay: payMonth,
    onTick: tickBox,
    onPrepay: id => setModal({
      type: "pay",
      id
    }),
    onEdit: id => setModal({
      type: "edit",
      id
    }),
    onHistory: id => setModal({
      type: "history",
      id
    }),
    onDelete: id => setModal({
      type: "delete",
      id
    })
  }))), tab === "settings" && /*#__PURE__*/React.createElement(BackupCard, {
    onExport: exportData,
    onExportCSV: exportCSV,
    onPickFile: pickImportFile,
    error: importError
  }), /*#__PURE__*/React.createElement("input", {
    ref: fileInputRef,
    type: "file",
    accept: "application/json,.json",
    style: {
      display: "none"
    },
    onChange: handleImportFile
  }), tab === "settings" && /*#__PURE__*/React.createElement("footer", {
    style: S.footer
  }, "เก็บข้อมูลในเครื่องอัตโนมัติ")), unlocked && /*#__PURE__*/React.createElement(BottomNav, {
    tab: tab,
    setTab: setTab,
    onFab: () => setModal({
      type: "fab"
    })
  }), unlocked && modal?.type === "fab" && /*#__PURE__*/React.createElement(FabSheet, {
    onClose: () => setModal(null),
    onPick: which => {
      if (which === "installment") {
        setModal({
          type: "add"
        });
      } else if (which === "income") {
        setTab("home");
        setModal(null);
      } else if (which === "expense") {
        setTab("home");
        setModal(null);
      } else if (which === "saving") {
        setTab("savings");
        setModal(null);
      }
    }
  }), unlocked && modal?.type === "quickSaveDream" && modal.goal && /*#__PURE__*/React.createElement(QuickSaveModal, { g: modal.goal, onClose: () => setModal(null), onSave: (amt) => { addSaved(modal.goal.id, amt); setModal(null); } }), unlocked && modal?.type === "simulate" && /*#__PURE__*/React.createElement(SimulatorSheet, {
    totalIn: totalIn,
    fixedTotal: fixedTotal,
    instTotal: instTotal,
    free: free,
    extra: extra,
    setExtra: setExtra,
    onClose: () => setModal(null),
    onAddReal: () => setModal({
      type: "add",
      presetMonthly: extra
    })
  }), unlocked && modal?.type === "add" && /*#__PURE__*/React.createElement(ItemForm, {
    title: "เพิ่มรายการผ่อน",
    presetMonthly: modal.presetMonthly,
    knownCards: knownCards(items),
    onClose: () => setModal(null),
    onSave: d => {
      addItem(d);
      setModal(null);
    }
  }), unlocked && modal?.type === "edit" && /*#__PURE__*/React.createElement(ItemForm, {
    title: "แก้ไขรายการ",
    initial: items.find(i => i.id === modal.id),
    knownCards: knownCards(items),
    onClose: () => setModal(null),
    onSave: d => {
      updateItem(modal.id, d);
      setModal(null);
    }
  }), unlocked && modal?.type === "pay" && /*#__PURE__*/React.createElement(PayForm, {
    item: items.find(i => i.id === modal.id),
    onClose: () => setModal(null),
    onSave: p => {
      addPayment(modal.id, p);
      setModal(null);
    }
  }), unlocked && modal?.type === "history" && /*#__PURE__*/React.createElement(History, {
    item: items.find(i => i.id === modal.id),
    onClose: () => setModal(null),
    onDel: pid => deletePayment(modal.id, pid),
    onEditDate: (pid, date) => updatePayment(modal.id, pid, {
      date
    })
  }), unlocked && modal?.type === "delete" && /*#__PURE__*/React.createElement(Confirm, {
    name: items.find(i => i.id === modal.id)?.name,
    onClose: () => setModal(null),
    onConfirm: () => {
      deleteItem(modal.id);
      setModal(null);
    }
  }), unlocked && modal?.type === "import" && /*#__PURE__*/React.createElement(ImportConfirm, {
    data: pendingImport,
    onClose: () => {
      setPendingImport(null);
      setModal(null);
    },
    onConfirm: confirmImport
  }));
}
const knownCards = items => [...new Set(items.map(i => (i.card || "").trim()).filter(Boolean))];


ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));

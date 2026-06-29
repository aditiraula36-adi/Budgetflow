import { useState, useMemo } from "react";

const COLORS = {
  bg: "#0F1117",
  surface: "#181C27",
  card: "#1E2235",
  accent: "#4ADE80",
  accentDim: "#1a3d26",
  danger: "#F87171",
  warn: "#FBBF24",
  text: "#E8EAF0",
  muted: "#6B7280",
  border: "#2A2F45",
};

const CATEGORIES = [
  { name: "Housing", icon: "🏠", color: "#818CF8" },
  { name: "Food", icon: "🍔", color: "#FB923C" },
  { name: "Transport", icon: "🚗", color: "#38BDF8" },
  { name: "Health", icon: "💊", color: "#F472B6" },
  { name: "Fun", icon: "🎮", color: "#A78BFA" },
  { name: "Savings", icon: "💰", color: "#4ADE80" },
  { name: "Other", icon: "📦", color: "#94A3B8" },
];

const SAMPLE_TRANSACTIONS = [
  { id: 1, desc: "Rent", amount: -1400, category: "Housing", date: "Jun 1" },
  { id: 2, desc: "Salary", amount: 4200, category: "Other", date: "Jun 1" },
  { id: 3, desc: "Groceries", amount: -85, category: "Food", date: "Jun 3" },
  { id: 4, desc: "Spotify", amount: -11, category: "Fun", date: "Jun 5" },
  { id: 5, desc: "Gas", amount: -52, category: "Transport", date: "Jun 7" },
  { id: 6, desc: "Gym", amount: -40, category: "Health", date: "Jun 8" },
  { id: 7, desc: "Dining out", amount: -68, category: "Food", date: "Jun 10" },
  { id: 8, desc: "Freelance", amount: 800, category: "Other", date: "Jun 12" },
  { id: 9, desc: "Electric bill", amount: -94, category: "Housing", date: "Jun 14" },
  { id: 10, desc: "Transfer to savings", amount: -300, category: "Savings", date: "Jun 15" },
];

const BUDGETS = { Housing: 1600, Food: 400, Transport: 150, Health: 100, Fun: 120, Savings: 500, Other: 200 };

function formatMoney(n) {
  const abs = Math.abs(n).toFixed(2);
  return (n < 0 ? "-$" : "$") + Number(abs).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function MiniBar({ value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  const over = value > max;
  return (
    <div style={{ background: COLORS.border, borderRadius: 4, height: 6, width: "100%", overflow: "hidden" }}>
      <div style={{
        width: `${pct}%`, height: "100%", borderRadius: 4,
        background: over ? COLORS.danger : color,
        transition: "width 0.6s cubic-bezier(.4,0,.2,1)"
      }} />
    </div>
  );
}

function SpendingRing({ spent, income }) {
  const pct = Math.min(spent / income, 1);
  const r = 54, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const gap = circ - dash;
  return (
    <svg width={128} height={128} viewBox="0 0 128 128">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={COLORS.border} strokeWidth={10} />
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke={pct > 0.9 ? COLORS.danger : COLORS.accent}
        strokeWidth={10}
        strokeDasharray={`${dash} ${gap}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }}
      />
      <text x={cx} y={cy - 8} textAnchor="middle" fill={COLORS.text} fontSize={13} fontWeight={700}>{Math.round(pct * 100)}%</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill={COLORS.muted} fontSize={10}>of income</text>
    </svg>
  );
}

export default function BudgetFlow() {
  const [tab, setTab] = useState("dashboard");
  const [txns, setTxns] = useState(SAMPLE_TRANSACTIONS);
  const [form, setForm] = useState({ desc: "", amount: "", category: "Food", type: "expense" });
  const [added, setAdded] = useState(false);

  const income = useMemo(() => txns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0), [txns]);
  const expenses = useMemo(() => txns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0), [txns]);
  const balance = income - expenses;

  const byCategory = useMemo(() => {
    const map = {};
    CATEGORIES.forEach(c => { map[c.name] = 0; });
    txns.filter(t => t.amount < 0).forEach(t => {
      map[t.category] = (map[t.category] || 0) + Math.abs(t.amount);
    });
    return map;
  }, [txns]);

  function addTxn() {
    if (!form.desc || !form.amount) return;
    const amt = form.type === "expense" ? -Math.abs(parseFloat(form.amount)) : Math.abs(parseFloat(form.amount));
    const today = new Date();
    const label = `${today.toLocaleString("en-US", { month: "short" })} ${today.getDate()}`;
    setTxns(prev => [{ id: Date.now(), desc: form.desc, amount: amt, category: form.category, date: label }, ...prev]);
    setForm({ desc: "", amount: "", category: "Food", type: "expense" });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const tabStyle = (t) => ({
    padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600,
    background: tab === t ? COLORS.accentDim : "transparent",
    color: tab === t ? COLORS.accent : COLORS.muted,
    border: "none", transition: "all 0.2s",
  });

  const inputStyle = {
    background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8,
    color: COLORS.text, padding: "10px 14px", fontSize: 14, width: "100%", outline: "none",
    fontFamily: "inherit",
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", color: COLORS.text }}>
      {/* Header */}
      <div style={{ background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: COLORS.accentDim, borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💸</div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>BudgetFlow</span>
        </div>
        <div style={{ background: balance >= 0 ? COLORS.accentDim : "#3d1a1a", borderRadius: 8, padding: "6px 14px" }}>
          <span style={{ color: balance >= 0 ? COLORS.accent : COLORS.danger, fontSize: 14, fontWeight: 700 }}>
            Balance: {formatMoney(balance)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, padding: "16px 24px 0", borderBottom: `1px solid ${COLORS.border}` }}>
        {["dashboard", "transactions", "add"].map(t => (
          <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
            {t === "add" ? "+ Add" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Income", value: income, color: COLORS.accent },
                { label: "Spent", value: expenses, color: COLORS.danger },
              ].map(c => (
                <div key={c.label} style={{ background: COLORS.card, borderRadius: 14, padding: "18px 20px", border: `1px solid ${COLORS.border}` }}>
                  <div style={{ color: COLORS.muted, fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{c.label}</div>
                  <div style={{ color: c.color, fontSize: 22, fontWeight: 800 }}>{formatMoney(c.value)}</div>
                </div>
              ))}
            </div>

            {/* Ring + top category */}
            <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 24 }}>
              <SpendingRing spent={expenses} income={income} />
              <div style={{ flex: 1 }}>
                <div style={{ color: COLORS.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Top Spending</div>
                {Object.entries(byCategory)
                  .filter(([, v]) => v > 0)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([cat, amt]) => {
                    const c = CATEGORIES.find(x => x.name === cat);
                    return (
                      <div key={cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 13 }}>{c?.icon} {cat}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.danger }}>{formatMoney(-amt)}</span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Budget progress */}
            <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}` }}>
              <div style={{ color: COLORS.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16 }}>Monthly Budgets</div>
              {CATEGORIES.map(cat => {
                const spent = byCategory[cat.name] || 0;
                const budget = BUDGETS[cat.name];
                const over = spent > budget;
                return (
                  <div key={cat.name} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13 }}>{cat.icon} {cat.name}</span>
                      <span style={{ fontSize: 12, color: over ? COLORS.danger : COLORS.muted }}>
                        {formatMoney(-spent)} / {formatMoney(-budget)}
                        {over && <span style={{ marginLeft: 4 }}>⚠️</span>}
                      </span>
                    </div>
                    <MiniBar value={spent} max={budget} color={cat.color} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TRANSACTIONS */}
        {tab === "transactions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ color: COLORS.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              {txns.length} transactions this month
            </div>
            {txns.map(t => {
              const cat = CATEGORIES.find(c => c.name === t.category);
              return (
                <div key={t.id} style={{
                  background: COLORS.card, borderRadius: 12, padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 14,
                  border: `1px solid ${COLORS.border}`,
                }}>
                  <div style={{ fontSize: 22, width: 36, textAlign: "center" }}>{cat?.icon || "📦"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.desc}</div>
                    <div style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>{t.category} · {t.date}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: t.amount < 0 ? COLORS.danger : COLORS.accent }}>
                    {formatMoney(t.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ADD TRANSACTION */}
        {tab === "add" && (
          <div style={{ background: COLORS.card, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Log a Transaction</div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Type</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["expense", "income"].map(type => (
                  <button key={type} onClick={() => setForm(f => ({ ...f, type }))} style={{
                    flex: 1, padding: "10px 0", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14,
                    background: form.type === type ? (type === "income" ? COLORS.accentDim : "#3d1a1a") : COLORS.surface,
                    color: form.type === type ? (type === "income" ? COLORS.accent : COLORS.danger) : COLORS.muted,
                    border: `1px solid ${form.type === type ? (type === "income" ? COLORS.accent : COLORS.danger) : COLORS.border}`,
                  }}>
                    {type === "expense" ? "− Expense" : "+ Income"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Description</label>
              <input style={inputStyle} placeholder="e.g. Coffee, Netflix, Paycheck..." value={form.desc}
                onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Amount ($)</label>
              <input style={inputStyle} type="number" placeholder="0.00" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Category</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.name} onClick={() => setForm(f => ({ ...f, category: cat.name }))} style={{
                    padding: "7px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
                    background: form.category === cat.name ? cat.color + "33" : COLORS.surface,
                    color: form.category === cat.name ? cat.color : COLORS.muted,
                    border: `1px solid ${form.category === cat.name ? cat.color : COLORS.border}`,
                  }}>
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={addTxn} style={{
              width: "100%", padding: "13px 0", borderRadius: 10, border: "none", cursor: "pointer",
              background: added ? COLORS.accentDim : COLORS.accent,
              color: added ? COLORS.accent : "#0F1117",
              fontWeight: 800, fontSize: 15, transition: "all 0.2s",
            }}>
              {added ? "✓ Logged!" : "Save Transaction"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
      }

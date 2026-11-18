"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/lib/context";
import { todayISO } from "@/lib/utils";
import type { DayLog, DashboardData } from "@/types";

// Shared bits for the New Me / Today / Life views.

export function Card({ title, icon, right, children, className = "", accent = "#c9a96e" }: {
  title?: string; icon?: string; right?: React.ReactNode; children: React.ReactNode; className?: string; accent?: string;
}) {
  return (
    <section className={`card p-5 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="font-display text-xl font-medium flex items-center gap-2" style={{ color: accent }}>
            {icon && <span className="text-lg">{icon}</span>}{title}
          </h2>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

// Collapsible section — keeps screens calm; open what you need.
export function Fold({ title, icon, sub, open, onToggle, done, children, accent = "#c9a96e" }: {
  title: string; icon: string; sub?: string; open: boolean; onToggle: () => void; done?: boolean; children: React.ReactNode; accent?: string;
}) {
  return (
    <section className="card overflow-hidden" style={{ borderColor: open ? `${accent}55` : undefined }}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-5 text-left tap">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-display text-xl font-medium" style={{ color: done ? "#a8c48a" : accent }}>
            {title} {done && "✓"}
          </div>
          {sub && <div className="text-sm mt-0.5" style={{ color: "#6b5f7a" }}>{sub}</div>}
        </div>
        <span className="text-lg transition-transform" style={{ color: "#6b5f7a", transform: open ? "rotate(90deg)" : "none" }}>›</span>
      </button>
      {open && <div className="px-5 pb-5 fade-up">{children}</div>}
    </section>
  );
}

// Textarea that saves a moment after you stop typing (and on blur), so typing never lags.
export function Field({ label, value, onSave, placeholder, rows = 2 }: {
  label?: string; value: string; onSave: (v: string) => void; placeholder?: string; rows?: number;
}) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  useEffect(() => {
    if (v === value) return;
    const t = setTimeout(() => onSave(v), 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v]);
  return (
    <label className="block">
      {label && <span className="block text-sm mb-1.5" style={{ color: "#9e8fb0" }}>{label}</span>}
      <textarea
        className="input-dark resize-none"
        rows={rows}
        value={v}
        placeholder={placeholder}
        onChange={e => setV(e.target.value)}
        onBlur={() => v !== value && onSave(v)}
      />
    </label>
  );
}

export function CheckRow({ label, checked, onToggle, color = "#c9a96e", sub }: {
  label: string; checked: boolean; onToggle: () => void; color?: string; sub?: string;
}) {
  return (
    <button onClick={onToggle} className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-left tap transition-all"
      style={{ background: checked ? `${color}14` : "transparent" }}>
      <span className="flex items-center justify-center rounded-md shrink-0 transition-all"
        style={{ width: 26, height: 26, border: `1.5px solid ${checked ? color : "#2e2535"}`, background: checked ? color : "transparent", color: "#0d0a0e", fontWeight: 700 }}>
        {checked ? "✓" : ""}
      </span>
      <span className="flex-1">
        <span className="text-[15px]" style={{ color: checked ? "#6b5f7a" : "#e8dff0", textDecoration: checked ? "line-through" : "none" }}>{label}</span>
        {sub && <span className="block text-xs mt-0.5" style={{ color: "#6b5f7a" }}>{sub}</span>}
      </span>
    </button>
  );
}

export function Ring({ pct, size = 64, color = "#c9a96e", children }: { pct: number; size?: number; color?: string; children?: React.ReactNode }) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#2e2535" strokeWidth={6} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, pct))} style={{ transition: "stroke-dashoffset .6s ease" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-medium" style={{ color: "#e8dff0" }}>{children}</div>
    </div>
  );
}

// Little burst of sparkles when something gets finished.
export function useCelebrate() {
  const [burst, setBurst] = useState<string | null>(null);
  useEffect(() => {
    if (!burst) return;
    const t = setTimeout(() => setBurst(null), 1800);
    return () => clearTimeout(t);
  }, [burst]);
  const node = burst ? (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center" style={{ zIndex: 200 }}>
      <div className="celebrate font-display text-3xl italic px-8 py-5 rounded-2xl text-center"
        style={{ background: "rgba(13,10,14,0.92)", border: "1px solid rgba(201,169,110,0.4)", color: "#e0c992" }}>
        {burst}
      </div>
    </div>
  ) : null;
  return { celebrate: setBurst, node };
}

// Read/write helpers for a single day's log.
export function useDay(date: string = todayISO()) {
  const { data, update } = useDashboard();
  const day: DayLog = data?.newMe?.days?.[date] ?? {};
  function setDay(patch: Partial<DayLog> | ((d: DayLog) => Partial<DayLog>)) {
    update((d: DashboardData) => {
      const nm = d.newMe!;
      const cur = nm.days[date] ?? {};
      const p = typeof patch === "function" ? patch(cur) : patch;
      return { ...d, newMe: { ...nm, days: { ...nm.days, [date]: { ...cur, ...p } } } };
    });
  }
  return { day, setDay };
}

export function PageTitle({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <h1 className="font-display text-4xl font-light italic" style={{ color: "#e8dff0" }}>{title}</h1>
        {sub && <p className="text-sm mt-1" style={{ color: "#6b5f7a" }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Pills<T extends string>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} className="px-4 py-2.5 rounded-full text-sm whitespace-nowrap tap transition-all"
          style={{
            background: value === o.id ? "rgba(201,169,110,0.15)" : "#1a1520",
            border: `1px solid ${value === o.id ? "rgba(201,169,110,0.45)" : "#2e2535"}`,
            color: value === o.id ? "#e0c992" : "#9e8fb0",
          }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

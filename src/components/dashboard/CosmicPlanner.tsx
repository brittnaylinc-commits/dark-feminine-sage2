"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/context";
import { todayISO, uid } from "@/lib/utils";
import { Card, Field } from "./ui";
import type { HumanDesign } from "@/types";

// Your own transits (dated, so they appear on Today) + Human Design chart.
export function CosmicPlanner() {
  const { data, update } = useDashboard();
  const [t, setT] = useState({ date: todayISO(), endDate: "", title: "", note: "" });
  if (!data) return null;
  const transits = [...(data.transits ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  const hd: HumanDesign = data.humanDesign ?? { type: "", strategy: "", authority: "", profile: "", notes: "" };
  const setHD = (patch: Partial<HumanDesign>) => update(d => ({ ...d, humanDesign: { ...hd, ...patch } }));

  function add() {
    if (!t.title.trim()) return;
    update(d => ({ ...d, transits: [...(d.transits ?? []), { id: uid(), ...t, title: t.title.trim() }] }));
    setT({ date: t.date, endDate: "", title: "", note: "" });
  }

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card title="My transits" icon="🪐" accent="#9b8ab4">
        <p className="text-sm mb-3" style={{ color: "#9e8fb0" }}>Add each transit with its dates — it will appear on your Today screen while it&rsquo;s active.</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <label className="text-xs" style={{ color: "#6b5f7a" }}>From<input type="date" className="input-dark mt-1" value={t.date} onChange={e => setT({ ...t, date: e.target.value })} /></label>
          <label className="text-xs" style={{ color: "#6b5f7a" }}>To (optional)<input type="date" className="input-dark mt-1" value={t.endDate} onChange={e => setT({ ...t, endDate: e.target.value })} /></label>
        </div>
        <input className="input-dark mb-2" placeholder="Venus trine natal Sun" value={t.title} onChange={e => setT({ ...t, title: e.target.value })} />
        <textarea className="input-dark mb-2 resize-none" rows={2} placeholder="What it means for me / how to use it" value={t.note} onChange={e => setT({ ...t, note: e.target.value })} />
        <button className="btn-gold" onClick={add}>Add transit</button>
        <div className="mt-4 space-y-2">
          {transits.map(x => (
            <div key={x.id} className="flex gap-3 py-2 border-t" style={{ borderColor: "#2e2535" }}>
              <div className="text-xs w-24 shrink-0 pt-0.5" style={{ color: todayISO() >= x.date && todayISO() <= (x.endDate || x.date) ? "#c9a96e" : "#6b5f7a" }}>
                {x.date.slice(5)}{x.endDate ? ` → ${x.endDate.slice(5)}` : ""}
              </div>
              <div className="flex-1">
                <div className="text-sm" style={{ color: "#e8dff0" }}>{x.title}</div>
                {x.note && <div className="text-xs" style={{ color: "#9e8fb0" }}>{x.note}</div>}
              </div>
              <button className="text-xs tap" style={{ color: "#4a3f58" }} onClick={() => update(d => ({ ...d, transits: (d.transits ?? []).filter(y => y.id !== x.id) }))}>✕</button>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Human Design" icon="🔺" accent="#9b8ab4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type" value={hd.type} onSave={v => setHD({ type: v })} rows={1} placeholder="Generator" />
          <Field label="Strategy" value={hd.strategy} onSave={v => setHD({ strategy: v })} rows={1} placeholder="Wait to respond" />
          <Field label="Authority" value={hd.authority} onSave={v => setHD({ authority: v })} rows={1} placeholder="Sacral" />
          <Field label="Profile" value={hd.profile} onSave={v => setHD({ profile: v })} rows={1} placeholder="2/4" />
        </div>
        <div className="mt-3"><Field label="Notes (centers, gates, not-self theme…)" value={hd.notes} onSave={v => setHD({ notes: v })} rows={4} /></div>
      </Card>
    </div>
  );
}

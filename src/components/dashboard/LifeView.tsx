"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/context";
import { todayISO, addDays, uid, getWeekKey, getWeekDates, toISO } from "@/lib/utils";
import { RACE_DATE, PROJECT_START, workoutFor, daysUntil } from "@/lib/newme";
import { Card, CheckRow, Field, PageTitle, Pills } from "./ui";
import type { MealWeek, ParentingDay } from "@/types";

type Sub = "fitness" | "meals" | "family" | "hobbies";
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MEAL_SLOTS = [{ id: "B", label: "Breakfast" }, { id: "L", label: "Lunch" }, { id: "D", label: "Dinner" }, { id: "S", label: "Snack" }];
const PREP_STEPS = ["Plan the week's meals", "Grocery order / shop", "Cook 2 proteins", "Wash & chop veggies", "Portion lunches + snacks", "Fill water bottles"];

export function LifeView() {
  const [sub, setSub] = useState<Sub>("fitness");
  return (
    <div className="space-y-6 fade-up">
      <PageTitle title="Life & Home" sub="body · nourishment · family · joy" />
      <Pills<Sub> value={sub} onChange={setSub} options={[
        { id: "fitness", label: "🍑 Fitness & 5K" }, { id: "meals", label: "🥗 Meal Prep" },
        { id: "family", label: "🧸 Family" }, { id: "hobbies", label: "🎨 Hobbies" },
      ]} />
      {sub === "fitness" && <Fitness />}
      {sub === "meals" && <Meals />}
      {sub === "family" && <Family />}
      {sub === "hobbies" && <Hobbies />}
    </div>
  );
}

function Fitness() {
  const { data, update } = useDashboard();
  const today = todayISO();
  if (!data?.newMe) return null;
  const days = data.newMe.days;
  const toggle = (iso: string) => update(d => {
    const cur = d.newMe!.days[iso] ?? {};
    return { ...d, newMe: { ...d.newMe!, days: { ...d.newMe!.days, [iso]: { ...cur, workoutDone: !cur.workoutDone } } } };
  });

  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const plan: string[] = [];
  for (let iso = PROJECT_START; iso <= RACE_DATE; iso = addDays(iso, 1)) plan.push(iso);
  const runDays = plan.filter(iso => ["run", "race"].includes(workoutFor(iso).kind));
  const runsDone = runDays.filter(iso => days[iso]?.workoutDone).length;
  const raceIn = daysUntil(RACE_DATE, today);

  return (
    <div className="space-y-5">
      <Card title="Next 7 days" icon="📅">
        {week.map(iso => {
          const w = workoutFor(iso);
          return (
            <CheckRow key={iso} checked={!!days[iso]?.workoutDone} onToggle={() => toggle(iso)}
              label={`${w.icon} ${new Date(iso + "T12:00").toLocaleDateString("en-US", { weekday: "short" })} · ${w.title}`} sub={w.detail} />
          );
        })}
      </Card>
      <Card title="Thanksgiving 5K" icon="🦃" right={<span className="text-sm" style={{ color: "#c9a96e" }}>{raceIn > 0 ? `${raceIn} days to go` : raceIn === 0 ? "TODAY!" : "Finished 🏅"}</span>}>
        <div className="progress-track mb-2"><div className="progress-fill" style={{ width: `${(runsDone / runDays.length) * 100}%`, background: "linear-gradient(90deg,#c9a96e,#e0c992)" }} /></div>
        <p className="text-sm mb-3" style={{ color: "#9e8fb0" }}>{runsDone} of {runDays.length} runs done · run/walk builds you up safely — walk breaks are part of the plan.</p>
        {runDays.map(iso => (
          <CheckRow key={iso} checked={!!days[iso]?.workoutDone} onToggle={() => toggle(iso)}
            label={new Date(iso + "T12:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} sub={workoutFor(iso).detail} />
        ))}
      </Card>
      <Card title="Recovery basics" icon="🌿" accent="#8e9e7a">
        <ul className="text-[15px] space-y-1.5" style={{ color: "#e8dff0" }}>
          <li>· Protein at every meal (helps those glutes grow)</li>
          <li>· 7–8 hours of sleep is training too</li>
          <li>· Stretch hips & hamstrings after runs</li>
          <li>· Sore and tired? Swap for a walk — it still counts</li>
        </ul>
      </Card>
    </div>
  );
}

function Meals() {
  const { data, update } = useDashboard();
  const [offset, setOffset] = useState(0);
  const [item, setItem] = useState("");
  if (!data) return null;
  const base = new Date(); base.setDate(base.getDate() + offset * 7);
  const wk = getWeekKey(base);
  const dates = getWeekDates(wk);
  const mw: MealWeek = data.meals?.[wk] ?? { plan: {}, grocery: [], prepDone: false };
  const prep = mw.plan.__prep ? mw.plan.__prep.split("|") : [];
  const save = (patch: Partial<MealWeek>) => update(d => ({ ...d, meals: { ...d.meals, [wk]: { ...mw, ...patch } } }));

  function addItem() {
    if (!item.trim()) return;
    save({ grocery: [...mw.grocery, { id: uid(), text: item.trim(), done: false }] });
    setItem("");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button className="btn-ghost" onClick={() => setOffset(o => o - 1)}>←</button>
        <div className="font-display text-xl flex-1 text-center" style={{ color: "#e8dff0" }}>
          Week of {dates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </div>
        <button className="btn-ghost" onClick={() => setOffset(o => o + 1)}>→</button>
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <Card title="Sunday prep" icon="🔪" className="lg:col-span-1">
          {PREP_STEPS.map(p => (
            <CheckRow key={p} label={p} checked={prep.includes(p)} color="#8e9e7a"
              onToggle={() => save({ plan: { ...mw.plan, __prep: (prep.includes(p) ? prep.filter(x => x !== p) : [...prep, p]).join("|") } })} />
          ))}
        </Card>
        <Card title="Grocery list" icon="🛒" className="lg:col-span-2">
          <div className="flex gap-2 mb-3">
            <input className="input-dark" placeholder="Add an item…" value={item} onChange={e => setItem(e.target.value)} onKeyDown={e => e.key === "Enter" && addItem()} />
            <button className="btn-gold" onClick={addItem}>Add</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-4">
            {mw.grocery.map(g => (
              <div key={g.id} className="flex items-center">
                <div className="flex-1"><CheckRow label={g.text} checked={g.done} color="#8e9e7a"
                  onToggle={() => save({ grocery: mw.grocery.map(x => x.id === g.id ? { ...x, done: !x.done } : x) })} /></div>
                <button className="px-2 text-sm tap" style={{ color: "#4a3f58" }} onClick={() => save({ grocery: mw.grocery.filter(x => x.id !== g.id) })}>✕</button>
              </div>
            ))}
          </div>
          {mw.grocery.some(g => g.done) && (
            <button className="text-xs mt-2 tap" style={{ color: "#6b5f7a" }} onClick={() => save({ grocery: mw.grocery.filter(g => !g.done) })}>Clear checked items</button>
          )}
        </Card>
      </div>
      <Card title="Meal plan" icon="🍽">
        <div className="space-y-4">
          {dates.map(d => {
            const dk = toISO(d);
            return (
              <div key={dk}>
                <div className="text-sm font-medium mb-2" style={{ color: dk === todayISO() ? "#c9a96e" : "#9e8fb0" }}>
                  {d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {MEAL_SLOTS.map(s => (
                    <input key={s.id} className="input-dark text-sm" placeholder={s.label} defaultValue={mw.plan[`${dk}-${s.id}`] ?? ""}
                      onBlur={e => e.target.value !== (mw.plan[`${dk}-${s.id}`] ?? "") && save({ plan: { ...mw.plan, [`${dk}-${s.id}`]: e.target.value } })} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function Family() {
  const { data, update } = useDashboard();
  if (!data) return null;
  const p = data.parenting ?? {};
  const set = (i: number, patch: Partial<ParentingDay>) =>
    update(d => ({ ...d, parenting: { ...d.parenting, [i]: { who: "", note: "", ...d.parenting?.[i], ...patch } } }));
  const opts: { id: ParentingDay["who"]; label: string }[] = [
    { id: "me", label: "🏡 With me" }, { id: "coparent", label: "🌙 Co-parent" }, { id: "split", label: "🔁 Exchange" },
  ];
  return (
    <Card title="Weekly parenting schedule" icon="🧸" accent="#e0c992">
      <p className="text-sm mb-4" style={{ color: "#9e8fb0" }}>Set your usual week once. Today&rsquo;s plan shows on the Today screen.</p>
      <div className="space-y-4">
        {WEEKDAYS.map((name, i) => (
          <div key={name} className="pb-4 border-b last:border-0" style={{ borderColor: "#2e2535" }}>
            <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
              <div className="font-medium" style={{ color: "#e8dff0" }}>{name}</div>
              <div className="flex gap-2">
                {opts.map(o => (
                  <button key={o.id} onClick={() => set(i, { who: p[i]?.who === o.id ? "" : o.id })} className="px-3 py-2 rounded-full text-xs tap"
                    style={{ background: p[i]?.who === o.id ? "rgba(224,201,146,0.18)" : "#1a1520", border: `1px solid ${p[i]?.who === o.id ? "#e0c992" : "#2e2535"}`, color: "#e8dff0" }}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <Field value={p[i]?.note ?? ""} onSave={v => set(i, { note: v })} rows={1} placeholder="School drop-off 7:45 · practice 5pm · pickup…" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function Hobbies() {
  const { data, update } = useDashboard();
  const [label, setLabel] = useState("");
  if (!data) return null;
  const hobbies = data.hobbies ?? [];
  const logs = data.hobbyLogs ?? [];
  const dates = getWeekDates(getWeekKey()).map(toISO);
  const toggle = (hobbyId: string, date: string) => update(d => {
    const l = d.hobbyLogs ?? [];
    const has = l.some(x => x.hobbyId === hobbyId && x.date === date);
    return { ...d, hobbyLogs: has ? l.filter(x => !(x.hobbyId === hobbyId && x.date === date)) : [...l, { hobbyId, date }] };
  });
  function add() {
    if (!label.trim()) return;
    update(d => ({ ...d, hobbies: [...(d.hobbies ?? []), { id: uid(), label: label.trim(), icon: "✦" }] }));
    setLabel("");
  }
  return (
    <Card title="Joy, just for me" icon="🎨" accent="#9b8ab4">
      <p className="text-sm mb-4" style={{ color: "#9e8fb0" }}>Doing something purely for yourself is part of the work. Tap a day when you did it.</p>
      <div className="space-y-3">
        {hobbies.map(h => (
          <div key={h.id} className="flex items-center gap-3 flex-wrap">
            <div className="w-36 text-[15px]" style={{ color: "#e8dff0" }}>{h.icon} {h.label}</div>
            <div className="flex gap-1.5 flex-1">
              {dates.map((ds, i) => {
                const on = logs.some(l => l.hobbyId === h.id && l.date === ds);
                return (
                  <button key={ds} onClick={() => toggle(h.id, ds)} className="flex-1 rounded-md text-xs tap"
                    style={{ height: 40, minWidth: 34, background: on ? "rgba(155,138,180,0.35)" : "#1a1520", border: `1px solid ${ds === todayISO() ? "#9b8ab4" : "#2e2535"}`, color: on ? "#e8dff0" : "#4a3f58" }}>
                    {"MTWTFSS"[i]}
                  </button>
                );
              })}
            </div>
            <button className="text-xs tap" style={{ color: "#4a3f58" }} onClick={() => update(d => ({ ...d, hobbies: (d.hobbies ?? []).filter(x => x.id !== h.id) }))}>✕</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <input className="input-dark" placeholder="Add a hobby…" value={label} onChange={e => setLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} />
        <button className="btn-gold" onClick={add}>Add</button>
      </div>
    </Card>
  );
}

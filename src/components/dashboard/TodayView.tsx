"use client";

import { useEffect, useMemo, useState } from "react";
import { useDashboard } from "@/lib/context";
import { todayISO, uid, TODO_CATEGORIES } from "@/lib/utils";
import {
  NAME, PROJECT_START, TOTAL_DAYS, RACE_DATE, DAILY_QUESTION, MORNING_DECLARATION, AFTERNOON_QUESTION,
  MORNING_FIELDS, EVENING_FIELDS, DAILY_CHECKLIST, SELF_PRESERVATION_IDEAS,
  weekFor, dayNumber, daysUntil, affirmationFor, workoutFor,
} from "@/lib/newme";
import { Card, Fold, Field, CheckRow, Ring, useCelebrate, useDay } from "./ui";
import type { TodoCategory } from "@/types";

type Slot = "morning" | "afternoon" | "evening";

function currentSlot(): Slot {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}

const MOODS = ["😔", "😕", "😐", "🙂", "🥰"];

export function TodayView({ goTo }: { goTo: (tab: string) => void }) {
  const { data, update } = useDashboard();
  const today = todayISO();
  const { day, setDay } = useDay(today);
  const [open, setOpen] = useState<Slot | null>(currentSlot());
  const [affOffset, setAffOffset] = useState(0);
  const [newTodo, setNewTodo] = useState("");
  const [cat, setCat] = useState<TodoCategory>("Me");
  const { celebrate, node: burst } = useCelebrate();

  const week = weekFor(today);
  const dayN = dayNumber(today);
  const started = today >= PROJECT_START;
  const checklist = DAILY_CHECKLIST[new Date().getDay()];
  const workout = day.lowEnergy ? { icon: "🌿", title: "Gentle Movement", detail: "Low-energy day: a 10-minute walk or stretch counts.", kind: "rest" as const } : workoutFor(today);
  const aff = affirmationFor(today, affOffset);
  const raceIn = daysUntil(RACE_DATE, today);

  const todos = (data?.todos ?? []).filter(t => t.date === today);
  const leftovers = (data?.todos ?? []).filter(t => t.date < today && !t.done);
  const checks = day.checks ?? [];
  const parentingToday = data?.parenting?.[String(new Date().getDay())];
  const transitsToday = (data?.transits ?? []).filter(t => today >= t.date && today <= (t.endDate || t.date));
  const hd = data?.humanDesign;

  // What counts toward today's ring
  const steps = day.lowEnergy
    ? [!!day.morningDone, !!day.afternoonDone, (day.water ?? 0) >= 4]
    : [!!day.morningDone, !!day.afternoonDone, !!day.eveningDone, !!day.workoutDone, (day.water ?? 0) >= 8, ...checklist.map(c => checks.includes(c.id))];
  const pct = steps.filter(Boolean).length / steps.length;

  // ADHD helper: the single next thing to do
  const next = useMemo(() => {
    if (!day.morningDone) return { label: "Morning check-in (5 min)", action: () => setOpen("morning") };
    if (!day.afternoonDone && currentSlot() !== "morning") return { label: "One act of self-preservation", action: () => setOpen("afternoon") };
    if (!day.workoutDone && workout.kind !== "rest") return { label: workout.title, action: () => document.getElementById("body")?.scrollIntoView({ behavior: "smooth" }) };
    const todo = todos.find(t => !t.done);
    if (todo) return { label: todo.text, action: () => document.getElementById("todos")?.scrollIntoView({ behavior: "smooth" }) };
    if (!day.eveningDone && currentSlot() === "evening") return { label: "Evening reflection (5 min)", action: () => setOpen("evening") };
    return null;
  }, [day, todos, workout]);

  if (!data) return null;

  function finish(slot: Slot) {
    const key = `${slot}Done` as const;
    setDay({ [key]: !day[key] });
    if (!day[key]) celebrate(slot === "evening" ? "That's a successful day. 🦋" : "Chosen. ✦");
    if (!day[key]) setOpen(null);
  }

  function toggleCheck(id: string) {
    const has = checks.includes(id);
    setDay({ checks: has ? checks.filter(c => c !== id) : [...checks, id] });
    if (!has && checks.length + 1 === checklist.length) celebrate("Checklist complete 🌷");
  }

  function addTodo() {
    if (!newTodo.trim()) return;
    update(d => ({ ...d, todos: [...(d.todos ?? []), { id: uid(), text: newTodo.trim(), date: today, category: cat, done: false }] }));
    setNewTodo("");
  }
  function toggleTodo(id: string) {
    update(d => ({ ...d, todos: (d.todos ?? []).map(t => t.id === id ? { ...t, done: !t.done } : t) }));
  }
  function removeTodo(id: string) {
    update(d => ({ ...d, todos: (d.todos ?? []).filter(t => t.id !== id) }));
  }
  function bringForward() {
    update(d => ({ ...d, todos: (d.todos ?? []).map(t => t.date < today && !t.done ? { ...t, date: today } : t) }));
  }

  const hello = currentSlot() === "morning" ? "Good morning" : currentSlot() === "afternoon" ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-5 fade-up">
      {burst}

      {/* ── Header ── */}
      <div className="flex items-center gap-5 flex-wrap">
        <Ring pct={pct} size={76}>{Math.round(pct * 100)}%</Ring>
        <div className="flex-1 min-w-[220px]">
          <h1 className="font-display text-4xl font-light italic" style={{ color: "#e8dff0" }}>{hello}, {NAME}</h1>
          <p className="text-sm mt-1" style={{ color: "#9e8fb0" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            {started && dayN <= TOTAL_DAYS && <> · <span style={{ color: "#c9a96e" }}>Day {dayN} of {TOTAL_DAYS}</span></>}
            {!started && <> · <span style={{ color: "#c9a96e" }}>The New Me Project starts tomorrow 🌷</span></>}
          </p>
        </div>
        <button onClick={() => setDay({ lowEnergy: !day.lowEnergy })} className="px-4 py-2.5 rounded-full text-sm tap"
          style={{ background: day.lowEnergy ? "rgba(155,138,180,0.18)" : "#1a1520", border: `1px solid ${day.lowEnergy ? "#9b8ab4" : "#2e2535"}`, color: day.lowEnergy ? "#c9b8e4" : "#9e8fb0" }}>
          {day.lowEnergy ? "🌙 Low-energy day: ON" : "🌙 Low-energy day?"}
        </button>
      </div>

      {/* ── Week focus + one next thing ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5" style={{ background: "linear-gradient(135deg, rgba(124,45,62,0.25), #211b27)" }}>
          <div className="text-xs uppercase tracking-[0.2em]" style={{ color: "#b87c8a" }}>
            {week ? `Week ${week.n} · ${week.title}` : "The New Me Project"}
          </div>
          <div className="font-display text-2xl mt-1" style={{ color: "#e8dff0" }}>{week ? week.focus : "Becoming the woman I already know I am."}</div>
          {week && <p className="text-sm mt-2 leading-relaxed" style={{ color: "#9e8fb0" }}>{week.practice}</p>}
          <button onClick={() => goTo("newme")} className="text-sm mt-3 tap" style={{ color: "#c9a96e" }}>Open the project →</button>
        </div>
        <div className="card p-5 flex flex-col justify-between" style={{ borderColor: "rgba(201,169,110,0.35)" }}>
          <div className="text-xs uppercase tracking-[0.2em]" style={{ color: "#c9a96e" }}>🎯 Just one thing</div>
          {next ? (
            <>
              <div className="font-display text-2xl mt-1" style={{ color: "#e8dff0" }}>{next.label}</div>
              <button className="btn-gold mt-4 self-start" onClick={next.action}>Start here</button>
            </>
          ) : (
            <div className="font-display text-2xl mt-1" style={{ color: "#a8c48a" }}>You're done for today. Rest is productive too. 🤍</div>
          )}
          <p className="text-xs mt-3 italic" style={{ color: "#6b5f7a" }}>{DAILY_QUESTION}</p>
        </div>
      </div>

      {/* ── Affirmation ── */}
      <div className="card p-6 text-center" style={{ background: "radial-gradient(circle at top, rgba(201,169,110,0.10), #211b27 70%)" }}>
        <div className="text-xs uppercase tracking-[0.25em]" style={{ color: "#6b5f7a" }}>{aff.icon} {aff.cat}</div>
        <p className="font-display text-2xl md:text-3xl italic mt-2 leading-snug" style={{ color: "#e0c992" }}>&ldquo;{aff.text}&rdquo;</p>
        <div className="flex justify-center gap-3 mt-4">
          <button className="btn-ghost" onClick={() => setAffOffset(o => o + 1)}>↻ Another</button>
          {!checks.includes("aff") && <button className="btn-ghost" onClick={() => toggleCheck("aff")}>✓ I said it</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* ── Left: the 15-minute practice ── */}
        <div className="lg:col-span-3 space-y-4">
          <Fold title="Morning · Choose my beliefs" icon="☀️" sub="5 min · before social media or messages" open={open === "morning"}
            onToggle={() => setOpen(open === "morning" ? null : "morning")} done={day.morningDone}>
            <div className="mb-4">
              <div className="text-sm mb-2" style={{ color: "#9e8fb0" }}>How do I feel?</div>
              <div className="flex gap-2">
                {MOODS.map((m, i) => (
                  <button key={i} onClick={() => setDay({ mood: i + 1 })} className="text-3xl rounded-xl tap transition-all"
                    style={{ width: 54, height: 54, background: day.mood === i + 1 ? "rgba(201,169,110,0.18)" : "#1a1520", border: `1px solid ${day.mood === i + 1 ? "#c9a96e" : "#2e2535"}` }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {(day.lowEnergy ? MORNING_FIELDS.slice(1, 2) : MORNING_FIELDS).map(f => (
                <Field key={f.key} label={f.label} value={(day as Record<string, any>)[f.key] ?? ""} onSave={v => setDay({ [f.key]: v })} />
              ))}
            </div>
            <div className="my-4 p-4 rounded-lg font-display text-lg italic" style={{ background: "rgba(201,169,110,0.07)", color: "#e0c992" }}>
              Say it out loud: &ldquo;{MORNING_DECLARATION}&rdquo;
            </div>
            <Field label="Today's one intention" value={day.intention ?? ""} onSave={v => setDay({ intention: v })} placeholder="Today, I will not overexplain my boundaries." rows={1} />
            <button className="btn-gold mt-4" onClick={() => finish("morning")}>{day.morningDone ? "Undo" : "Done — I chose me ✓"}</button>
          </Fold>

          <Fold title="Afternoon · Self-preservation" icon="🌿" sub="5 min · one small act" open={open === "afternoon"} accent="#8e9e7a"
            onToggle={() => setOpen(open === "afternoon" ? null : "afternoon")} done={day.afternoonDone}>
            {day.intention && <p className="text-sm mb-3" style={{ color: "#9e8fb0" }}>Your intention: <span style={{ color: "#e8dff0" }}>{day.intention}</span></p>}
            <div className="text-sm mb-2" style={{ color: "#9e8fb0" }}>Pick one (tap to choose):</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {SELF_PRESERVATION_IDEAS.map(s => (
                <button key={s} onClick={() => setDay({ selfPres: s })} className="text-sm text-left px-3 py-2 rounded-lg tap"
                  style={{ background: day.selfPres === s ? "rgba(142,158,122,0.2)" : "#1a1520", border: `1px solid ${day.selfPres === s ? "#8e9e7a" : "#2e2535"}`, color: "#e8dff0" }}>
                  {s}
                </button>
              ))}
            </div>
            <Field label="…or write your own" value={day.selfPres ?? ""} onSave={v => setDay({ selfPres: v })} rows={1} />
            <div className="my-4 p-4 rounded-lg font-display text-lg italic" style={{ background: "rgba(142,158,122,0.08)", color: "#c8d6b4" }}>
              Feeling guilty? Ask: &ldquo;{AFTERNOON_QUESTION}&rdquo;
            </div>
            <button className="btn-gold" onClick={() => finish("afternoon")}>{day.afternoonDone ? "Undo" : "I did it ✓"}</button>
          </Fold>

          <Fold title="Evening · Challenge old beliefs" icon="🌙" sub="5 min · not three pages, just five lines" open={open === "evening"} accent="#9b8ab4"
            onToggle={() => setOpen(open === "evening" ? null : "evening")} done={day.eveningDone}>
            <div className="space-y-3">
              {(day.lowEnergy ? EVENING_FIELDS.slice(4) : EVENING_FIELDS).map(f => (
                <Field key={f.key} label={f.label} placeholder={f.ph} value={day.journal?.[f.key] ?? ""}
                  onSave={v => setDay(d => ({ journal: { ...(d.journal ?? {}), [f.key]: v } }))} />
              ))}
              {week && <Field label={`This week's prompt: ${week.prompt}`} value={day.journal?.weekPrompt ?? ""}
                onSave={v => setDay(d => ({ journal: { ...(d.journal ?? {}), weekPrompt: v } }))} rows={3} />}
            </div>
            <div className="mt-4">
              <div className="text-sm mb-2" style={{ color: "#9e8fb0" }}>Which belief system won today?</div>
              <div className="flex gap-2">
                {(["old", "new"] as const).map(w => (
                  <button key={w} onClick={() => setDay({ winner: w })} className="flex-1 py-3 rounded-lg tap"
                    style={{ background: day.winner === w ? (w === "new" ? "rgba(201,169,110,0.18)" : "rgba(124,45,62,0.25)") : "#1a1520", border: `1px solid ${day.winner === w ? (w === "new" ? "#c9a96e" : "#a63d52") : "#2e2535"}`, color: "#e8dff0" }}>
                    {w === "new" ? "🦋 New me" : "🥊 Old me (and that's okay)"}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs mt-3 italic" style={{ color: "#6b5f7a" }}>The goal isn&rsquo;t to eliminate uncomfortable feelings. It&rsquo;s to stop letting them make every decision.</p>
            <button className="btn-gold mt-4" onClick={() => finish("evening")}>{day.eveningDone ? "Undo" : "Close my day ✓"}</button>
          </Fold>

          {/* To-dos */}
          <Card title="Today's to-dos" icon="📝" right={<span className="text-xs" style={{ color: "#6b5f7a" }}>{todos.filter(t => t.done).length}/{todos.length}</span>}>
            <div id="todos" />
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-2">
              {(Object.keys(TODO_CATEGORIES) as TodoCategory[]).map(c => (
                <button key={c} onClick={() => setCat(c)} className="px-3 py-1.5 rounded-full text-xs whitespace-nowrap tap"
                  style={{ background: cat === c ? `${TODO_CATEGORIES[c].color}25` : "#1a1520", border: `1px solid ${cat === c ? TODO_CATEGORIES[c].color : "#2e2535"}`, color: cat === c ? "#e8dff0" : "#9e8fb0" }}>
                  {TODO_CATEGORIES[c].icon} {c}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mb-3">
              <input className="input-dark" placeholder={`Add a ${cat.toLowerCase()} to-do…`} value={newTodo}
                onChange={e => setNewTodo(e.target.value)} onKeyDown={e => e.key === "Enter" && addTodo()} />
              <button className="btn-gold" onClick={addTodo}>Add</button>
            </div>
            {leftovers.length > 0 && (
              <button onClick={bringForward} className="w-full text-sm py-2.5 mb-2 rounded-lg tap" style={{ background: "rgba(155,138,180,0.1)", color: "#c9b8e4" }}>
                ↪ Bring {leftovers.length} unfinished from earlier days to today (no guilt)
              </button>
            )}
            {todos.length === 0 && <p className="text-sm py-2" style={{ color: "#6b5f7a" }}>Keep it to 3 must-dos. Everything else is a bonus.</p>}
            {todos.map(t => (
              <div key={t.id} className="flex items-center group">
                <div className="flex-1"><CheckRow label={`${TODO_CATEGORIES[t.category]?.icon ?? ""} ${t.text}`} checked={t.done}
                  color={TODO_CATEGORIES[t.category]?.color} onToggle={() => { toggleTodo(t.id); if (!t.done) celebrate("Done ✓"); }} /></div>
                <button onClick={() => removeTodo(t.id)} className="px-3 py-2 text-sm tap" style={{ color: "#4a3f58" }}>✕</button>
              </div>
            ))}
          </Card>
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-2 space-y-4">
          <Card title="Today's checklist" icon="🦋">
            {checklist.map(c => <CheckRow key={c.id} label={c.label} checked={checks.includes(c.id)} onToggle={() => toggleCheck(c.id)} />)}
          </Card>

          <Card title="Body" icon="💪🏽" accent="#c9a96e">
            <div id="body" />
            <div className="flex items-start gap-3">
              <span className="text-3xl">{workout.icon}</span>
              <div className="flex-1">
                <div className="font-medium" style={{ color: "#e8dff0" }}>{workout.title}</div>
                <div className="text-sm mt-1 leading-relaxed" style={{ color: "#9e8fb0" }}>{workout.detail}</div>
              </div>
            </div>
            <button onClick={() => { setDay({ workoutDone: !day.workoutDone }); if (!day.workoutDone) celebrate("Strong. 🍑"); }}
              className={day.workoutDone ? "btn-ghost mt-3 w-full" : "btn-gold mt-3 w-full"}>
              {day.workoutDone ? "✓ Done — undo" : workout.kind === "rest" ? "I rested / stretched ✓" : "Workout done ✓"}
            </button>
            {raceIn > 0 && <div className="text-xs mt-3 text-center" style={{ color: "#c9a96e" }}>🦃 Thanksgiving 5K in {raceIn} day{raceIn === 1 ? "" : "s"}</div>}
            <div className="mt-4">
              <div className="text-sm mb-2" style={{ color: "#9e8fb0" }}>Water · {day.water ?? 0}/8</div>
              <div className="flex gap-1.5">
                {Array.from({ length: 8 }, (_, i) => (
                  <button key={i} onClick={() => setDay({ water: (day.water ?? 0) === i + 1 ? i : i + 1 })} className="flex-1 rounded-md tap text-lg"
                    style={{ height: 40, background: i < (day.water ?? 0) ? "rgba(122,158,168,0.35)" : "#1a1520", border: "1px solid #2e2535" }}>
                    {i < (day.water ?? 0) ? "💧" : ""}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <DailyText date={today} read={!!day.dailyTextRead} onRead={() => { setDay({ dailyTextRead: !day.dailyTextRead }); if (!day.dailyTextRead) celebrate("🙏🏽"); }} />

          <Card title="Family today" icon="🧸" accent="#e0c992" right={<button className="text-xs tap" style={{ color: "#6b5f7a" }} onClick={() => goTo("life")}>edit</button>}>
            {parentingToday?.who || parentingToday?.note ? (
              <>
                <div style={{ color: "#e8dff0" }}>
                  {parentingToday.who === "me" ? "🏡 Kids are with me" : parentingToday.who === "coparent" ? "🌙 Kid-free day — time for me" : parentingToday.who === "split" ? "🔁 Exchange day" : ""}
                </div>
                {parentingToday.note && <div className="text-sm mt-1" style={{ color: "#9e8fb0" }}>{parentingToday.note}</div>}
              </>
            ) : <p className="text-sm" style={{ color: "#6b5f7a" }}>Set up your parenting schedule in Life → Family.</p>}
          </Card>

          <Card title="Cosmic weather" icon="🌙" accent="#9b8ab4" right={<button className="text-xs tap" style={{ color: "#6b5f7a" }} onClick={() => goTo("astro")}>edit</button>}>
            {hd?.strategy && <p className="text-sm mb-2" style={{ color: "#c9b8e4" }}>Human Design: {hd.type} · <b>{hd.strategy}</b>{hd.authority ? ` · trust your ${hd.authority}` : ""}</p>}
            {transitsToday.map(t => (
              <div key={t.id} className="py-2 border-t" style={{ borderColor: "#2e2535" }}>
                <div className="text-sm font-medium" style={{ color: "#e8dff0" }}>{t.title}</div>
                {t.note && <div className="text-sm" style={{ color: "#9e8fb0" }}>{t.note}</div>}
              </div>
            ))}
            {!hd?.strategy && transitsToday.length === 0 && <p className="text-sm" style={{ color: "#6b5f7a" }}>Add your transits & Human Design in the Astrology tab and they'll show up here on the right days.</p>}
          </Card>
        </div>
      </div>
    </div>
  );
}

function DailyText({ date, read, onRead }: { date: string; read: boolean; onRead: () => void }) {
  const [dt, setDt] = useState<{ scripture?: string; body?: string; link: string; error?: string } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [y, m, d] = date.split("-").map(Number);
  const link = `https://wol.jw.org/en/wol/h/r1/lp-e/${y}/${m}/${d}`;

  useEffect(() => {
    fetch(`/api/daily-text?date=${date}`).then(r => r.json()).then(setDt).catch(() => setDt({ link, error: "x" }));
  }, [date, link]);

  return (
    <Card title="Daily Text" icon="📖" accent="#9b8ab4" right={read ? <span className="text-xs" style={{ color: "#a8c48a" }}>read ✓</span> : null}>
      {!dt && <p className="text-sm pulse-gold" style={{ color: "#6b5f7a" }}>Loading today&rsquo;s text…</p>}
      {dt && !dt.error && (
        <>
          <p className="font-display text-lg italic leading-snug" style={{ color: "#e0c992" }}>{dt.scripture}</p>
          {expanded && <div className="text-[15px] mt-3 leading-relaxed whitespace-pre-line" style={{ color: "#e8dff0" }}>{dt.body}</div>}
          <div className="flex gap-2 mt-3 flex-wrap">
            <button className="btn-ghost" onClick={() => setExpanded(e => !e)}>{expanded ? "Show less" : "Read the full text"}</button>
            <button className={read ? "btn-ghost" : "btn-gold"} onClick={onRead}>{read ? "Undo" : "Read ✓"}</button>
          </div>
          <a href={dt.link} target="_blank" rel="noreferrer" className="block text-xs mt-3" style={{ color: "#6b5f7a" }}>Source: wol.jw.org ↗</a>
        </>
      )}
      {dt?.error && (
        <>
          <p className="text-sm mb-3" style={{ color: "#9e8fb0" }}>Couldn&rsquo;t load the text here right now — open it on JW.org:</p>
          <div className="flex gap-2 flex-wrap">
            <a href={link} target="_blank" rel="noreferrer" className="btn-gold inline-block">Open today&rsquo;s text ↗</a>
            <button className="btn-ghost" onClick={onRead}>{read ? "Undo" : "Read ✓"}</button>
          </div>
        </>
      )}
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/context";
import { todayISO, uid } from "@/lib/utils";
import {
  THEME, MANTRA, BELIEFS, OLD_VS_NEW_EXAMPLE, WEEKS, AFFIRMATIONS, WEEKLY_REFLECTION_FIELDS, DEC31_FIELDS,
  MINDFUL_NOTE, FINAL_AFFIRMATION, SCRIPTURE, EVENING_FIELDS, TOTAL_DAYS, weekFor, dayNumber,
} from "@/lib/newme";
import { Card, Field, PageTitle, Pills, Ring } from "./ui";

type Sub = "vision" | "weeks" | "boxing" | "affirm" | "journal" | "dec31";

export function NewMeView() {
  const { data, update } = useDashboard();
  const today = todayISO();
  const current = weekFor(today);
  const [sub, setSub] = useState<Sub>("vision");
  const [openWeek, setOpenWeek] = useState<number>(current?.n ?? 1);
  const [entry, setEntry] = useState({ situation: "", old: "", next: "" });

  if (!data?.newMe) return null;
  const nm = data.newMe;

  const setNM = (patch: Partial<typeof nm>) => update(d => ({ ...d, newMe: { ...d.newMe!, ...patch } }));
  const daysLogged = Object.values(nm.days).filter(d => d.morningDone || d.afternoonDone || d.eveningDone).length;
  const newWins = Object.values(nm.days).filter(d => d.winner === "new").length;
  const dayN = Math.max(0, Math.min(TOTAL_DAYS, dayNumber(today)));

  function addEntry() {
    if (!entry.situation.trim() && !entry.old.trim()) return;
    setNM({ oldNew: [{ id: uid(), date: today, ...entry }, ...nm.oldNew] });
    setEntry({ situation: "", old: "", next: "" });
  }

  const journalDays = Object.entries(nm.days)
    .filter(([, d]) => d.journal && Object.values(d.journal).some(Boolean))
    .sort(([a], [b]) => b.localeCompare(a));

  return (
    <div className="space-y-6 fade-up">
      <PageTitle title="🌷 The New Me Project" sub="October 26 – December 31, 2026"
        right={<div className="flex items-center gap-4">
          <Ring pct={dayN / TOTAL_DAYS} size={60}>{dayN}</Ring>
          <div className="text-sm" style={{ color: "#9e8fb0" }}>
            <div><span style={{ color: "#e8dff0" }}>{daysLogged}</span> day{daysLogged === 1 ? "" : "s"} practiced</div>
            <div><span style={{ color: "#e0c992" }}>{newWins}</span> day{newWins === 1 ? "" : "s"} new me won 🦋</div>
          </div>
        </div>} />

      <Pills<Sub> value={sub} onChange={setSub} options={[
        { id: "vision", label: "✨ Vision" }, { id: "weeks", label: "🗓 9 Weeks" }, { id: "boxing", label: "🥊 Old Me vs New Me" },
        { id: "affirm", label: "🪞 Affirmations" }, { id: "journal", label: "📖 Journal" }, { id: "dec31", label: "🎆 Dec 31" },
      ]} />

      {sub === "vision" && (
        <div className="space-y-5">
          <div className="card p-7 text-center" style={{ background: "radial-gradient(circle at top, rgba(124,45,62,0.35), #211b27 75%)" }}>
            <div className="text-xs uppercase tracking-[0.25em]" style={{ color: "#b87c8a" }}>Theme</div>
            <div className="font-display text-3xl md:text-4xl mt-2" style={{ color: "#e8dff0" }}>{THEME}</div>
            <p className="font-display text-xl italic mt-4 max-w-2xl mx-auto" style={{ color: "#e0c992" }}>{MANTRA}</p>
          </div>
          <Card title="Who I'm becoming — and why" icon="🦋">
            <Field value={nm.vision} onSave={v => setNM({ vision: v })} rows={5}
              placeholder="On December 31, the woman I am… protects her peace, trusts her decisions, moves her body, shows up for her kids, creates boldly, and stays close to Jehovah. I'm doing this because…" />
          </Card>
          <Card title="Old beliefs → New beliefs" icon="🔁">
            <div className="divide-y" style={{ borderColor: "#2e2535" }}>
              {BELIEFS.map(b => (
                <div key={b.old} className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-6 py-3" style={{ borderColor: "#2e2535" }}>
                  <div className="text-[15px] line-through decoration-1" style={{ color: "#6b5f7a" }}>{b.old}</div>
                  <div className="text-[15px]" style={{ color: "#e8dff0" }}>✦ {b.next}</div>
                </div>
              ))}
            </div>
            <p className="font-display text-lg italic mt-4" style={{ color: "#e0c992" }}>
              The biggest shift: from emotional responsibility for others to emotional responsibility for yourself.
            </p>
            <p className="text-sm mt-2" style={{ color: "#9e8fb0" }}>You do not have to stop caring about someone to stop participating in patterns that drain you.</p>
          </Card>
          <div className="grid md:grid-cols-2 gap-5">
            <Card title="Be mindful" icon="🤍" accent="#b87c8a">
              <ul className="space-y-2">
                {MINDFUL_NOTE.map(n => <li key={n} className="text-[15px]" style={{ color: "#e8dff0" }}>· {n}</li>)}
              </ul>
            </Card>
            <Card title={SCRIPTURE.ref} icon="🙏🏽" accent="#9b8ab4">
              <p className="text-[15px]" style={{ color: "#e8dff0" }}>{SCRIPTURE.note}</p>
              <a className="text-sm block mt-3" style={{ color: "#c9a96e" }} target="_blank" rel="noreferrer"
                href="https://www.jw.org/en/library/bible/study-bible/books/proverbs/4/#v20004023">Read Proverbs 4:23 ↗</a>
              <p className="text-sm mt-3" style={{ color: "#9e8fb0" }}>Friday = therapy day. Bring the old beliefs that showed up this week instead of solving everything alone.</p>
            </Card>
          </div>
        </div>
      )}

      {sub === "weeks" && (
        <div className="space-y-3">
          {WEEKS.map(w => {
            const isNow = current?.n === w.n, past = today > w.end, open = openWeek === w.n;
            const refl = nm.weeks[String(w.n)] ?? {};
            return (
              <section key={w.n} className="card overflow-hidden" style={{ borderColor: isNow ? "rgba(201,169,110,0.45)" : undefined }}>
                <button onClick={() => setOpenWeek(open ? 0 : w.n)} className="w-full flex items-center gap-4 p-5 text-left tap">
                  <div className="font-display text-3xl w-10 text-center" style={{ color: isNow ? "#c9a96e" : past ? "#a8c48a" : "#4a3f58" }}>{past && !isNow ? "✓" : w.n}</div>
                  <div className="flex-1">
                    <div className="font-display text-xl" style={{ color: "#e8dff0" }}>{w.title} <span className="text-base italic" style={{ color: "#9e8fb0" }}>— {w.focus}</span></div>
                    <div className="text-xs mt-0.5" style={{ color: "#6b5f7a" }}>
                      {new Date(w.start + "T12:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {new Date(w.end + "T12:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {isNow && <span style={{ color: "#c9a96e" }}> · this week</span>}
                    </div>
                  </div>
                  <span style={{ color: "#6b5f7a", transform: open ? "rotate(90deg)" : "none" }} className="transition-transform">›</span>
                </button>
                {open && (
                  <div className="px-5 pb-5 space-y-4 fade-up">
                    <p className="text-[15px] leading-relaxed" style={{ color: "#e8dff0" }}>{w.practice}</p>
                    <div className="p-4 rounded-lg" style={{ background: "rgba(155,138,180,0.08)" }}>
                      <div className="text-xs uppercase tracking-widest mb-2" style={{ color: "#9b8ab4" }}>Journal prompt</div>
                      <Field label={w.prompt} value={refl.prompt ?? ""} rows={3}
                        onSave={v => setNM({ weeks: { ...nm.weeks, [w.n]: { ...refl, prompt: v } } })} />
                    </div>
                    <div className="text-xs uppercase tracking-widest" style={{ color: "#c9a96e" }}>Sunday reflection</div>
                    <Field label="My intention for this week" value={refl.intention ?? ""} rows={1}
                      onSave={v => setNM({ weeks: { ...nm.weeks, [w.n]: { ...refl, intention: v } } })} />
                    {WEEKLY_REFLECTION_FIELDS.map(f => (
                      <Field key={f.key} label={`🌷 ${f.label}`} value={refl[f.key] ?? ""}
                        onSave={v => setNM({ weeks: { ...nm.weeks, [w.n]: { ...refl, [f.key]: v } } })} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {sub === "boxing" && (
        <div className="space-y-5">
          <Card title="Put the gloves on" icon="🥊" accent="#b87c8a">
            <p className="text-[15px] mb-4" style={{ color: "#9e8fb0" }}>Caught yourself in an old pattern? Write both voices down. Then choose.</p>
            <div className="space-y-3">
              <TA label="Situation" value={entry.situation} onChange={v => setEntry(e => ({ ...e, situation: v }))} rows={1} placeholder={OLD_VS_NEW_EXAMPLE.situation} />
              <div className="grid sm:grid-cols-2 gap-3">
                <TA label="🥊 Old me says…" value={entry.old} onChange={v => setEntry(e => ({ ...e, old: v }))} placeholder={OLD_VS_NEW_EXAMPLE.rows[0].old} />
                <TA label="🦋 New me says…" value={entry.next} onChange={v => setEntry(e => ({ ...e, next: v }))} placeholder={OLD_VS_NEW_EXAMPLE.rows[0].next} />
              </div>
              <button className="btn-gold" onClick={addEntry}>Save round</button>
            </div>
          </Card>
          <Card title="Example" icon="💭">
            <p className="text-sm mb-3" style={{ color: "#9e8fb0" }}>{OLD_VS_NEW_EXAMPLE.situation}</p>
            {OLD_VS_NEW_EXAMPLE.rows.map(r => (
              <div key={r.old} className="grid sm:grid-cols-2 gap-1 sm:gap-6 py-2 border-t" style={{ borderColor: "#2e2535" }}>
                <div className="text-[15px]" style={{ color: "#6b5f7a" }}>{r.old}</div>
                <div className="text-[15px]" style={{ color: "#e8dff0" }}>✦ {r.next}</div>
              </div>
            ))}
          </Card>
          {nm.oldNew.map(e => (
            <div key={e.id} className="card p-4">
              <div className="flex justify-between gap-3">
                <div className="text-sm font-medium" style={{ color: "#e8dff0" }}>{e.situation}</div>
                <button className="text-xs tap" style={{ color: "#4a3f58" }} onClick={() => setNM({ oldNew: nm.oldNew.filter(x => x.id !== e.id) })}>✕</button>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 mt-2 text-[15px]">
                <div style={{ color: "#6b5f7a" }}>🥊 {e.old}</div>
                <div style={{ color: "#e0c992" }}>🦋 {e.next}</div>
              </div>
              <div className="text-xs mt-2" style={{ color: "#4a3f58" }}>{new Date(e.date + "T12:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
            </div>
          ))}
        </div>
      )}

      {sub === "affirm" && (
        <div className="grid md:grid-cols-2 gap-5">
          {AFFIRMATIONS.map(a => (
            <Card key={a.cat} title={a.cat} icon={a.icon}>
              <ul className="space-y-3">
                {a.items.map(t => <li key={t} className="font-display text-lg italic leading-snug" style={{ color: "#e8dff0" }}>&ldquo;{t}&rdquo;</li>)}
              </ul>
            </Card>
          ))}
          <div className="card p-6 md:col-span-2" style={{ background: "radial-gradient(circle at top, rgba(201,169,110,0.12), #211b27 70%)" }}>
            <div className="text-xs uppercase tracking-[0.25em] mb-2" style={{ color: "#c9a96e" }}>❤️ Carry this into 2027</div>
            <p className="font-display text-xl italic leading-relaxed" style={{ color: "#e0c992" }}>{FINAL_AFFIRMATION}</p>
          </div>
        </div>
      )}

      {sub === "journal" && (
        <div className="space-y-3">
          {journalDays.length === 0 && <Card><p style={{ color: "#6b5f7a" }}>Your evening reflections will collect here so you can look back and see how far you&rsquo;ve come.</p></Card>}
          {journalDays.map(([date, d]) => (
            <div key={date} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="font-display text-lg" style={{ color: "#c9a96e" }}>
                  {new Date(date + "T12:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </div>
                <div className="text-sm">{d.winner === "new" ? "🦋 new me won" : d.winner === "old" ? "🥊 old me" : ""}</div>
              </div>
              {d.intention && <p className="text-sm mb-2" style={{ color: "#9e8fb0" }}>Intention: {d.intention}</p>}
              {EVENING_FIELDS.filter(f => d.journal?.[f.key]).map(f => (
                <p key={f.key} className="text-[15px] py-0.5" style={{ color: "#e8dff0" }}><span style={{ color: "#6b5f7a" }}>{f.label}:</span> {d.journal![f.key]}</p>
              ))}
            </div>
          ))}
        </div>
      )}

      {sub === "dec31" && (
        <Card title="December 31 Reflection" icon="🎆">
          <p className="text-[15px] mb-4" style={{ color: "#9e8fb0" }}>Celebrate your growth and prepare for 2027. Re-read your journal first.</p>
          <div className="space-y-4">
            {DEC31_FIELDS.map(f => (
              <Field key={f.key} label={f.label} value={nm.dec31[f.key] ?? ""} rows={f.key === "word" ? 1 : 3}
                onSave={v => setNM({ dec31: { ...nm.dec31, [f.key]: v } })} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function TA({ label, value, onChange, placeholder, rows = 2 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <label className="block">
      <span className="block text-sm mb-1.5" style={{ color: "#9e8fb0" }}>{label}</span>
      <textarea className="input-dark resize-none" rows={rows} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
    </label>
  );
}

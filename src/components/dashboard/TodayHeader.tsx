"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/lib/context";
import { addDays } from "@/lib/utils";
import { NAME, PROJECT_START, PROJECT_END, TOTAL_DAYS, RACE_DATE, dayNumber, daysUntil } from "@/lib/newme";
import { DEFAULT_PROFILE } from "@/types";
import { Ring } from "./ui";

// Big header: bold title, script greeting, polaroids, and a word ticker underneath.
export function Hero({ today, hello, pct, lowEnergy, onLowEnergy, onPhotos }: {
  today: string; hello: string; pct: number; lowEnergy: boolean; onLowEnergy: () => void; onPhotos: () => void;
}) {
  const { data } = useDashboard();
  const p = data?.profile ?? DEFAULT_PROFILE;
  const dayN = dayNumber(today);
  const words = p.ticker.length ? p.ticker : DEFAULT_PROFILE.ticker;
  const tilts = ["-6deg", "4deg", "-2deg", "7deg"];

  return (
    <div className="card overflow-hidden" style={{ borderColor: "rgba(201,169,110,0.3)" }}>
      <div className="relative p-6 md:p-8" style={{ background: "radial-gradient(circle at 85% 20%, rgba(166,61,82,0.45), transparent 55%), linear-gradient(135deg, #3a1520 0%, #1a1016 60%, #110d12 100%)" }}>
        <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.25em]" style={{ color: "#b8a4a8" }}>
          <span>{new Date(today + "T12:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
          <button onClick={onLowEnergy} className="px-3 py-2 rounded-full normal-case tracking-normal text-xs tap"
            style={{ background: lowEnergy ? "rgba(155,138,180,0.22)" : "rgba(13,10,14,0.5)", border: `1px solid ${lowEnergy ? "#9b8ab4" : "#3a2c38"}`, color: lowEnergy ? "#d6c8ee" : "#b8a4a8" }}>
            {lowEnergy ? "🌙 Low-energy day: ON" : "🌙 Low-energy day?"}
          </button>
        </div>

        <div className="flex items-end gap-6 mt-4">
          <div className="flex-1 min-w-0">
            <h1 className="font-wide font-black uppercase leading-[0.95] text-4xl md:text-5xl lg:text-6xl break-words"
              style={{ color: "#f3ece0", letterSpacing: "0.01em" }}>
              {p.title}{"\u00a0"}<span style={{ color: "#c9a96e" }}>✦</span>
            </h1>
            <div className="inline-block mt-3 px-3 py-1 font-display italic text-base md:text-lg" style={{ background: "#0d0a0e", color: "#e0c992" }}>
              {p.tagline}
            </div>
            <div className="flex items-center gap-4 mt-5">
              <Ring pct={pct} size={62}>{Math.round(pct * 100)}%</Ring>
              <div>
                <div className="font-script text-4xl md:text-5xl leading-none" style={{ color: "#e0c992" }}>{hello}, {NAME}</div>
                <div className="text-sm mt-1" style={{ color: "#b8a4a8" }}>
                  {today < PROJECT_START ? "The New Me Project starts soon 🌷"
                    : dayN <= TOTAL_DAYS ? <>Day <b style={{ color: "#f3ece0" }}>{dayN}</b> of {TOTAL_DAYS} · the journey before the glow-up</>
                    : "New era unlocked 🦋"}
                </div>
              </div>
            </div>
          </div>

          {/* Polaroids */}
          <button onClick={onPhotos} className="hidden sm:flex shrink-0 relative tap" style={{ width: 210, height: 190 }} aria-label="Edit photos">
            {p.photos.length === 0 ? (
              <div className="polaroid absolute inset-x-6 top-4 bottom-4 flex flex-col items-center justify-center" style={{ transform: "rotate(-4deg)" }}>
                <div className="text-3xl">📸</div>
                <div className="text-xs mt-1 font-medium" style={{ color: "#5a3a40" }}>Add your photos</div>
              </div>
            ) : p.photos.slice(0, 4).map((src, i, arr) => (
              <div key={i} className="polaroid absolute" style={{
                width: arr.length === 1 ? 150 : 110, top: i % 2 ? 40 : 4, left: arr.length === 1 ? 30 : (i * 100) / Math.max(1, arr.length - 1) * 0.9,
                transform: `rotate(${tilts[i]})`, zIndex: i,
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full aspect-[4/5] object-cover" />
              </div>
            ))}
            <span className="absolute -bottom-1 right-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rotate-[-3deg]"
              style={{ background: "#7c2d3e", color: "#f3ece0", zIndex: 10 }}>no excuses era</span>
          </button>
        </div>
      </div>

      {/* Ticker */}
      <div className="ticker py-2.5" style={{ background: "#0d0a0e", borderTop: "1px solid #2e2535" }}>
        <div className="ticker-track">
          {[0, 1].map(k => (
            <div key={k} className="flex shrink-0">
              {[...words, ...words].map((w, i) => (
                <span key={i} className={`px-4 text-xs ${w === w.toUpperCase() ? "font-wide font-bold tracking-[0.18em]" : "font-display italic text-sm"}`}
                  style={{ color: i % 2 ? "#c9a96e" : "#e8dff0" }}>
                  {w} <span style={{ color: "#7c2d3e" }}>•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Burgundy scripture card with the JW.org daily text.
export function WordForToday({ date, read, onRead }: { date: string; read: boolean; onRead: () => void }) {
  const [dt, setDt] = useState<{ scripture?: string; body?: string; link: string; error?: string } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [y, m, d] = date.split("-").map(Number);
  const link = `https://wol.jw.org/en/wol/h/r1/lp-e/${y}/${m}/${d}`;

  useEffect(() => {
    fetch(`/api/daily-text?date=${date}`).then(r => r.json()).then(setDt).catch(() => setDt({ link, error: "x" }));
  }, [date, link]);

  return (
    <section className="card p-6 h-full flex flex-col" style={{ background: "linear-gradient(160deg, #5a1f2c, #2a1218 75%)", borderColor: "rgba(166,61,82,0.5)" }}>
      <div className="flex items-center justify-between">
        <div className="font-display italic text-2xl" style={{ color: "#f3ece0" }}>Word for today</div>
        {read && <span className="text-xs" style={{ color: "#c8e0a8" }}>read ✓</span>}
      </div>
      {!dt && <p className="text-sm mt-3 pulse-gold" style={{ color: "#d8c0c4" }}>Loading today&rsquo;s text…</p>}
      {dt && !dt.error && (
        <>
          <p className="font-display text-xl italic leading-snug mt-3" style={{ color: "#f3ece0" }}>{dt.scripture}</p>
          {expanded && <div className="text-[15px] mt-3 leading-relaxed whitespace-pre-line" style={{ color: "#ecdfe1" }}>{dt.body}</div>}
        </>
      )}
      {dt?.error && <p className="text-[15px] mt-3" style={{ color: "#d8c0c4" }}>Couldn&rsquo;t load the text here right now — open it on JW.org.</p>}
      <div className="flex gap-2 mt-auto pt-4 flex-wrap">
        {dt && !dt.error
          ? <button className="btn-ghost" style={{ color: "#f3ece0", borderColor: "rgba(243,236,224,0.3)" }} onClick={() => setExpanded(e => !e)}>{expanded ? "Show less" : "Read the full text"}</button>
          : <a href={link} target="_blank" rel="noreferrer" className="btn-gold inline-block">Open today&rsquo;s text ↗</a>}
        <button className={read ? "btn-ghost" : "btn-gold"} style={read ? { color: "#f3ece0", borderColor: "rgba(243,236,224,0.3)" } : undefined} onClick={onRead}>{read ? "Undo" : "Read ✓"}</button>
      </div>
      {dt && !dt.error && <a href={dt.link} target="_blank" rel="noreferrer" className="text-xs mt-3" style={{ color: "#c4a4aa" }}>Source: wol.jw.org ↗</a>}
    </section>
  );
}

// Streak + this week's dots + next milestone.
export function Consistency({ today }: { today: string }) {
  const { data } = useDashboard();
  const days = data?.newMe?.days ?? {};
  const practiced = (iso: string) => { const d = days[iso]; return !!(d && (d.morningDone || d.afternoonDone || d.eveningDone)); };

  let streak = 0;
  let cursor = practiced(today) ? today : addDays(today, -1);
  while (practiced(cursor) && cursor >= PROJECT_START) { streak++; cursor = addDays(cursor, -1); }

  const d = new Date(today + "T12:00");
  const monday = addDays(today, -((d.getDay() + 6) % 7));
  const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const total = Object.keys(days).filter(practiced).length;

  const milestones = [
    { date: RACE_DATE, label: "Thanksgiving 5K 🦃" },
    { date: PROJECT_END, label: "New Me complete 🎆" },
  ].filter(m => m.date >= today);
  const next = milestones[0];

  return (
    <section className="card p-6 h-full flex flex-col">
      <div className="font-display italic text-2xl" style={{ color: "#c9a96e" }}>Consistency</div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="rounded-xl p-3" style={{ background: "#1a1520" }}>
          <div className="font-wide font-black text-3xl" style={{ color: "#f3ece0" }}>{streak}</div>
          <div className="text-xs mt-1" style={{ color: "#9e8fb0" }}>day streak</div>
        </div>
        <div className="rounded-xl p-3" style={{ background: "#1a1520" }}>
          <div className="font-wide font-black text-3xl" style={{ color: "#f3ece0" }}>{total}</div>
          <div className="text-xs mt-1" style={{ color: "#9e8fb0" }}>days practiced</div>
        </div>
      </div>
      <div className="flex justify-between mt-4">
        {week.map((iso, i) => (
          <div key={iso} className="flex flex-col items-center gap-1.5">
            <div className="rounded-full" style={{
              width: 26, height: 26,
              background: practiced(iso) ? "radial-gradient(circle at 35% 30%, #e0c992, #a8843f)" : "#1a1520",
              border: `1.5px solid ${iso === today ? "#c9a96e" : "#2e2535"}`,
            }} />
            <span className="text-[11px]" style={{ color: iso === today ? "#c9a96e" : "#6b5f7a" }}>{"MTWTFSS"[i]}</span>
          </div>
        ))}
      </div>
      <p className="text-xs mt-3 italic" style={{ color: "#6b5f7a" }}>Missed a day? The streak resets, your progress doesn&rsquo;t.</p>
      {next && (
        <div className="mt-auto pt-3 text-sm" style={{ color: "#9e8fb0" }}>
          Next milestone: <span style={{ color: "#e8dff0" }}>{next.label}</span> · <b style={{ color: "#c9a96e" }}>{daysUntil(next.date, today)} days</b>
        </div>
      )}
    </section>
  );
}

// Shrinks a picked photo so it fits comfortably in saved data.
export function resizePhoto(file: File, max = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}


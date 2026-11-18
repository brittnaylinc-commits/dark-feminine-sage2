"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/context";
import type { BirthData, Profile } from "@/types";
import { DEFAULT_PROFILE } from "@/types";
import { resizePhoto } from "./TodayHeader";

export function SettingsView() {
  const { data, update, mode } = useDashboard();
  const [key, setKey] = useState(() => {
    try { return localStorage.getItem("dfs-reminder-key") ?? ""; } catch { return ""; }
  });
  const origin = typeof window !== "undefined" ? window.location.origin : "https://your-app.vercel.app";
  const reminderUrl = (slot: string) => `${origin}/api/briefing?slot=${slot}&format=text${key ? `&key=${encodeURIComponent(key)}` : ""}`;
  const [saved, setSaved] = useState(false);
  const [birthForm, setBirthForm] = useState<BirthData>(
    data?.birthData ?? { date: "1993-01-07", time: "00:00", location: "Chicago, IL" }
  );
  const [testingBriefing, setTestingBriefing] = useState(false);
  const [briefingResult, setBriefingResult] = useState("");

  if (!data) return null;

  const profile: Profile = data.profile ?? DEFAULT_PROFILE;
  const setProfile = (patch: Partial<Profile>) => update(d => ({ ...d, profile: { ...DEFAULT_PROFILE, ...d.profile, ...patch } }));
  const TITLE_IDEAS = ["THE NEW ME", "NEW ERA", "PEACE & POWER", "SOFT & UNSTOPPABLE", "BECOMING BRIT", "CHOSEN", "GRACE & GRIT", "HER ERA", "UNBOTHERED & BLESSED", "PROTECTED PEACE"];

  async function addPhotos(files: FileList) {
    const room = 4 - profile.photos.length;
    const picked = await Promise.all(Array.from(files).slice(0, room).map(f => resizePhoto(f)));
    setProfile({ photos: [...profile.photos, ...picked] });
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `new-me-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  function importBackup(file: File) {
    file.text().then(t => {
      try {
        const parsed = JSON.parse(t);
        if (confirm("Replace everything on this dashboard with this backup?")) update(() => parsed);
      } catch {
        alert("That file isn't a dashboard backup.");
      }
    });
  }

  function saveBirthData() {
    update(d => ({ ...d, birthData: birthForm }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function testBriefing() {
    setTestingBriefing(true);
    setBriefingResult("");
    try {
      try { localStorage.setItem("dfs-reminder-key", key); } catch {}
      const res = await fetch(`/api/briefing?key=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (data.message) {
        setBriefingResult(data.message);
      } else {
        setBriefingResult("Error: " + (data.error ?? "Unknown"));
      }
    } catch {
      setBriefingResult("Failed to reach briefing API.");
    } finally {
      setTestingBriefing(false);
    }
  }

  function connectGoogle() {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      alert("Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables first.");
      return;
    }
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${window.location.origin}/api/auth/google/callback`,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/calendar.readonly",
      access_type: "offline",
      prompt: "consent",
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  return (
    <div className="space-y-6 fade-up max-w-2xl">
      <div>
        <h1 className="font-display text-3xl font-light italic" style={{ color: "#e8dff0" }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: "#6b5f7a" }}>Personalize your dashboard</p>
      </div>

      {/* Header & photos */}
      <div className="card p-6">
        <h2 className="font-display text-lg font-medium mb-1" style={{ color: "#c9a96e" }}>Your Header</h2>
        <p className="text-sm mb-4" style={{ color: "#9e8fb0" }}>The big title, words and photos at the top of Today.</p>

        <label className="text-xs mb-1 block" style={{ color: "#6b5f7a" }}>Title</label>
        <input className="input-dark" defaultValue={profile.title} key={profile.title}
          onBlur={e => e.target.value.trim() && setProfile({ title: e.target.value.trim() })} />
        <div className="flex flex-wrap gap-2 mt-2">
          {TITLE_IDEAS.map(t => (
            <button key={t} onClick={() => setProfile({ title: t })} className="px-3 py-1.5 rounded-full text-xs tap"
              style={{ background: profile.title === t ? "rgba(201,169,110,0.18)" : "#1a1520", border: `1px solid ${profile.title === t ? "#c9a96e" : "#2e2535"}`, color: "#e8dff0" }}>
              {t}
            </button>
          ))}
        </div>

        <label className="text-xs mb-1 mt-4 block" style={{ color: "#6b5f7a" }}>Tagline</label>
        <input className="input-dark" defaultValue={profile.tagline} key={profile.tagline}
          onBlur={e => setProfile({ tagline: e.target.value })} />

        <label className="text-xs mb-1 mt-4 block" style={{ color: "#6b5f7a" }}>Ticker words (separate with commas — ALL CAPS shows bold, lowercase shows in script)</label>
        <textarea className="input-dark resize-none" rows={2} defaultValue={profile.ticker.join(", ")} key={profile.ticker.join("|")}
          onBlur={e => setProfile({ ticker: e.target.value.split(",").map(w => w.trim()).filter(Boolean) })} />

        <label className="text-xs mb-2 mt-4 block" style={{ color: "#6b5f7a" }}>Photos (up to 4 — they show as polaroids)</label>
        <div className="flex gap-3 flex-wrap">
          {profile.photos.map((src, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-20 h-24 object-cover rounded" />
              <button onClick={() => setProfile({ photos: profile.photos.filter((_, j) => j !== i) })}
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full text-xs" style={{ background: "#7c2d3e", color: "#f3ece0" }}>✕</button>
            </div>
          ))}
          {profile.photos.length < 4 && (
            <label className="w-20 h-24 rounded flex flex-col items-center justify-center cursor-pointer text-xs" style={{ border: "1px dashed #4a3f58", color: "#9e8fb0" }}>
              <span className="text-2xl">＋</span>Add
              <input type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && addPhotos(e.target.files)} />
            </label>
          )}
        </div>
      </div>

      {/* Your data */}
      <div className="card p-6">
        <h2 className="font-display text-lg font-medium mb-1" style={{ color: "#c9a96e" }}>Your Data</h2>
        <p className="text-sm mb-4" style={{ color: "#9e8fb0" }}>
          {mode === "cloud"
            ? "☁️ Synced to your database — the same on every device."
            : "📱 Saved on this device only. Connect the free Neon database (see DEPLOY.md) to sync and to get text reminders with your real to-dos. Until then, export a backup every Sunday."}
        </p>
        <div className="flex gap-3 flex-wrap">
          <button className="btn-gold" onClick={exportBackup}>Download backup</button>
          <label className="btn-ghost cursor-pointer">
            Restore from backup
            <input type="file" accept="application/json" className="hidden" onChange={e => e.target.files?.[0] && importBackup(e.target.files[0])} />
          </label>
        </div>
      </div>

      {/* Birth Data */}
      <div className="card p-6">
        <h2 className="font-display text-lg font-medium mb-1" style={{ color: "#c9a96e" }}>Birth Data</h2>
        <p className="text-xs mb-4" style={{ color: "#6b5f7a" }}>
          Used for AI astrology readings. Already pre-set based on your chart.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: "#6b5f7a" }}>Birth Date</label>
            <input
              type="date"
              className="input-dark"
              value={birthForm.date}
              onChange={e => setBirthForm(f => ({ ...f, date: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: "#6b5f7a" }}>Birth Time</label>
            <input
              type="time"
              className="input-dark"
              value={birthForm.time}
              onChange={e => setBirthForm(f => ({ ...f, time: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: "#6b5f7a" }}>Birth Location</label>
            <input
              className="input-dark"
              placeholder="City, State"
              value={birthForm.location}
              onChange={e => setBirthForm(f => ({ ...f, location: e.target.value }))}
            />
          </div>
        </div>
        <button className="btn-gold mt-4" onClick={saveBirthData}>
          {saved ? "✓ Saved" : "Save Birth Data"}
        </button>
      </div>

      {/* Morning Briefing */}
      <div className="card p-6">
        <h2 className="font-display text-lg font-medium mb-1" style={{ color: "#c9a96e" }}>Daily Text Reminders</h2>
        <p className="text-sm mb-4" style={{ color: "#9e8fb0" }}>
          Free, using the Shortcuts app already on your iPhone. You get a morning plan (week focus, workout, checklist, to-dos,
          daily text link, affirmation), an afternoon self-preservation nudge, and an evening reflection reminder.
        </p>

        <div className="space-y-4">
          <label className="block">
            <span className="text-xs mb-1 block" style={{ color: "#6b5f7a" }}>Reminder key (the CRON_SECRET you set in Vercel)</span>
            <input className="input-dark" value={key} onChange={e => setKey(e.target.value)} placeholder="dfs_morning_2026_..." />
          </label>
          <div className="space-y-2">
            <h3 className="text-sm font-medium" style={{ color: "#e8dff0" }}>On your iPhone, do this 3 times (7:00 AM, 1:00 PM, 8:00 PM):</h3>
            <ol className="space-y-2">
              {[
                "Shortcuts app → Automation → + → Time of Day → pick the time → Daily → Run Immediately",
                "Add action: Get Contents of URL → paste the link for that time (below)",
                "Add action: Show Notification (or Send Message to yourself) → choose \"Contents of URL\"",
                "Done. Tap the notification to open your dashboard.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm" style={{ color: "#9e8fb0" }}>
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-medium"
                    style={{ background: "rgba(201,169,110,0.1)", color: "#c9a96e" }}
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          {[["☀️ Morning", "morning"], ["🌿 Afternoon", "afternoon"], ["🌙 Evening", "evening"]].map(([label, slot]) => (
            <div key={slot}>
              <div className="text-xs mb-1" style={{ color: "#6b5f7a" }}>{label}</div>
              <div className="flex gap-2">
                <input readOnly className="input-dark text-xs" value={reminderUrl(slot)} onFocus={e => e.target.select()} />
                <button className="btn-ghost shrink-0" onClick={() => navigator.clipboard?.writeText(reminderUrl(slot))}>Copy</button>
              </div>
            </div>
          ))}

          <div className="gold-line" />

          {/* Test briefing */}
          <div>
            <button
              className="btn-ghost text-xs"
              onClick={testBriefing}
              disabled={testingBriefing}
            >
              {testingBriefing ? "Generating preview…" : "Preview today's briefing"}
            </button>
          </div>

          {briefingResult && (
            <div className="p-4 rounded-lg" style={{ background: "#1a1520", border: "1px solid #2e2535" }}>
              <p className="text-xs font-medium mb-2" style={{ color: "#c9a96e" }}>Preview:</p>
              <pre className="text-xs whitespace-pre-wrap" style={{ color: "#e8dff0", fontFamily: "inherit" }}>
                {briefingResult}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Google Calendar */}
      <div className="card p-6">
        <h2 className="font-display text-lg font-medium mb-1" style={{ color: "#c9a96e" }}>Google Calendar</h2>
        <p className="text-xs mb-4" style={{ color: "#6b5f7a" }}>
          Connect to include today's events in your morning briefing.
        </p>
        <div className="space-y-3">
          <div className="p-3 rounded-lg text-xs" style={{ background: "#1a1520", border: "1px solid #2e2535" }}>
            <p className="font-medium mb-1" style={{ color: "#e8dff0" }}>Before connecting:</p>
            <ol className="space-y-1" style={{ color: "#9e8fb0" }}>
              <li>1. Create a Google Cloud project at console.cloud.google.com</li>
              <li>2. Enable the Google Calendar API</li>
              <li>3. Create OAuth 2.0 credentials (Web application)</li>
              <li>4. Add your Vercel URL + /api/auth/google/callback as redirect URI</li>
              <li>5. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to Vercel env vars</li>
            </ol>
          </div>
          <button className="btn-ghost" onClick={connectGoogle}>
            Connect Google Calendar →
          </button>
        </div>
      </div>

      {/* Vercel Deployment */}
      <div className="card p-6">
        <h2 className="font-display text-lg font-medium mb-1" style={{ color: "#c9a96e" }}>Deployment</h2>
        <p className="text-xs mb-4" style={{ color: "#6b5f7a" }}>
          Required environment variables for your Vercel deployment.
        </p>
        <div className="space-y-2">
          {[
            { key: "DATABASE_URL", desc: "Neon Postgres connection string", required: true },
            { key: "ANTHROPIC_API_KEY", desc: "For AI astrology readings", required: true },
            { key: "CRON_SECRET", desc: "Random string to secure briefing endpoint", required: true },
            { key: "GOOGLE_CLIENT_ID", desc: "Google OAuth — for calendar", required: false },
            { key: "GOOGLE_CLIENT_SECRET", desc: "Google OAuth — for calendar", required: false },
            { key: "GOOGLE_REDIRECT_URI", desc: "Your Vercel URL + /api/auth/google/callback", required: false },
          ].map(v => (
            <div key={v.key} className="flex items-start gap-3 py-2" style={{ borderBottom: "1px solid #1e1a25" }}>
              <code className="text-xs px-2 py-0.5 rounded font-mono shrink-0" style={{ background: "#1a1520", color: "#c9a96e" }}>
                {v.key}
              </code>
              <span className="text-xs" style={{ color: "#9e8fb0" }}>{v.desc}</span>
              <span
                className="text-xs ml-auto shrink-0"
                style={{ color: v.required ? "#b87c8a" : "#4a3f58" }}
              >
                {v.required ? "required" : "optional"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="card p-6">
        <h2 className="font-display text-lg font-medium mb-3" style={{ color: "#c9a96e" }}>About This Dashboard</h2>
        <div className="space-y-1 text-xs" style={{ color: "#6b5f7a" }}>
          <p>Dark Feminine Sage Dashboard · The New Me Project</p>
          <p>Stack: Next.js 14 · Neon Postgres · Anthropic Claude · Vercel</p>
          <p>Last data sync: {new Date(data.lastUpdated).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

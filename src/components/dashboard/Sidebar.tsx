"use client";

import { useDashboard } from "@/lib/context";

export type Tab = "today" | "newme" | "life" | "week" | "brand" | "quarter" | "astro" | "settings";

interface SidebarProps {
  active: Tab;
  onChange: (t: Tab) => void;
}

export const TABS: { id: Tab; label: string; short: string; icon: string; sub: string }[] = [
  { id: "today",    icon: "☀️", label: "Today",        short: "Today",   sub: "practice · to-dos · daily text" },
  { id: "newme",    icon: "🌷", label: "The New Me",   short: "New Me",  sub: "9 weeks · beliefs · journal" },
  { id: "life",     icon: "🍑", label: "Life & Home",  short: "Life",    sub: "fitness · meals · family" },
  { id: "week",     icon: "✦",  label: "This Week",    short: "Week",    sub: "tasks · habits · focus" },
  { id: "brand",    icon: "🎬", label: "Content HQ",   short: "Content", sub: "TikTok · Substack" },
  { id: "quarter",  icon: "◈",  label: "Goals & Money", short: "Goals",  sub: "goals · finances · wins" },
  { id: "astro",    icon: "🌙", label: "Astrology",    short: "Astro",   sub: "transits · human design" },
  { id: "settings", icon: "⚙",  label: "Settings",     short: "More",    sub: "reminders · backup" },
];

export function Sidebar({ active, onChange }: SidebarProps) {
  const { saving } = useDashboard();

  return (
    <>
      {/* iPad landscape / desktop: side rail */}
      <aside
        className="fixed left-0 top-0 h-full w-56 hidden lg:flex flex-col"
        style={{
          background: "linear-gradient(180deg, #110d12 0%, #0d0a0e 100%)",
          borderRight: "1px solid #2e2535",
          zIndex: 100,
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        {/* Logo */}
        <div className="px-6 pt-8 pb-6">
          <div className="font-display text-xl font-light tracking-widest" style={{ color: "#c9a96e", letterSpacing: "0.12em" }}>
            DARK
          </div>
          <div className="font-display text-xl font-semibold italic" style={{ color: "#e8dff0", lineHeight: 1 }}>
            Feminine
          </div>
          <div className="font-display text-xs tracking-[0.3em] uppercase mt-0.5" style={{ color: "#6b5f7a" }}>
            Sage
          </div>
          <div className="gold-line mt-4" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="w-full text-left px-3 py-3 rounded-lg transition-all duration-200 group tap"
              style={{
                background: active === tab.id ? "rgba(201,169,110,0.08)" : "transparent",
                border: active === tab.id ? "1px solid rgba(201,169,110,0.2)" : "1px solid transparent",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-base w-5 text-center">{tab.icon}</span>
                <div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: active === tab.id ? "#c9a96e" : "#9e8fb0" }}
                  >
                    {tab.label}
                  </div>
                  <div className="text-xs" style={{ color: "#4a3f58" }}>
                    {tab.sub}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 pb-6 space-y-2">
          <div className="gold-line mb-3" />
          {saving && (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full pulse-gold" style={{ background: "#c9a96e" }} />
              <span className="text-xs" style={{ color: "#6b5f7a" }}>Saving…</span>
            </div>
          )}
          <div className="text-xs font-display italic" style={{ color: "#4a3f58" }}>
            "Becoming the woman I already know I am."
          </div>
        </div>
      </aside>

      {/* iPad portrait / phone: bottom tab bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 flex overflow-x-auto no-scrollbar"
        style={{
          background: "rgba(13,10,14,0.94)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderTop: "1px solid #2e2535",
          zIndex: 100,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => onChange(tab.id)} className="flex-1 min-w-[72px] py-2.5 flex flex-col items-center gap-0.5 tap">
            <span className="text-xl" style={{ opacity: active === tab.id ? 1 : 0.55 }}>{tab.icon}</span>
            <span className="text-[11px]" style={{ color: active === tab.id ? "#c9a96e" : "#6b5f7a" }}>{tab.short}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

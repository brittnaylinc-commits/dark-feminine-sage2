"use client";

import { useState } from "react";
import { DashboardProvider } from "@/lib/context";
import { Sidebar, type Tab } from "@/components/dashboard/Sidebar";
import { TodayView } from "@/components/dashboard/TodayView";
import { NewMeView } from "@/components/dashboard/NewMeView";
import { LifeView } from "@/components/dashboard/LifeView";
import { WeekView } from "@/components/dashboard/WeekView";
import { BrandView } from "@/components/dashboard/BrandView";
import { QuarterView } from "@/components/dashboard/QuarterView";
import { AstroView } from "@/components/dashboard/AstroView";
import { SettingsView } from "@/components/dashboard/SettingsView";

function Dashboard() {
  const [tab, setTab] = useState<Tab>("today");

  function go(t: Tab) {
    setTab(t);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="grain-overlay min-h-screen flex">
      <Sidebar active={tab} onChange={go} />

      {/* Main content */}
      <main className="main-pane flex-1 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {tab === "today" && <TodayView goTo={t => go(t as Tab)} />}
          {tab === "newme" && <NewMeView />}
          {tab === "life" && <LifeView />}
          {tab === "week" && <WeekView />}
          {tab === "brand" && <BrandView />}
          {tab === "quarter" && <QuarterView />}
          {tab === "astro" && <AstroView />}
          {tab === "settings" && <SettingsView />}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  );
}

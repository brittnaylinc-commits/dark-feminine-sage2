"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { DashboardData } from "@/types";
import { DEFAULT_HABITS, DEFAULT_BRAND_MILESTONES, DEFAULT_HOBBIES } from "@/types";

// "cloud" = synced through the Neon database, "device" = saved on this iPad only
type StorageMode = "cloud" | "device";

interface DashboardCtx {
  data: DashboardData | null;
  loading: boolean;
  saving: boolean;
  mode: StorageMode;
  update: (updater: (d: DashboardData) => DashboardData) => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<DashboardCtx | null>(null);
const LOCAL_KEY = "dfs-dashboard-v1";

const EMPTY: DashboardData = {
  tasks: [], habitLogs: [], habits: DEFAULT_HABITS, weeklyFocus: [], gymSessions: [],
  quarterlyGoals: [], achievements: [], finances: [],
  astroReadings: [], contentItems: [], brandMilestones: DEFAULT_BRAND_MILESTONES,
  lastUpdated: new Date().toISOString(),
};

// Fill in anything newer versions of the dashboard expect.
function withDefaults(d: Partial<DashboardData>): DashboardData {
  const base = { ...EMPTY, ...d } as DashboardData;
  return {
    ...base,
    newMe: { vision: "", days: {}, weeks: {}, oldNew: [], dec31: {}, ...base.newMe },
    todos: base.todos ?? [],
    parenting: base.parenting ?? {},
    meals: base.meals ?? {},
    hobbies: base.hobbies ?? DEFAULT_HOBBIES,
    hobbyLogs: base.hobbyLogs ?? [],
    transits: base.transits ?? [],
  };
}

function readLocal(): DashboardData | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocal(d: DashboardData) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(d)); } catch {}
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<StorageMode>("device");
  const modeRef = useRef<StorageMode>("device");
  const dirty = useRef(false);

  const refresh = useCallback(async () => {
    const local = readLocal();
    if (local) setData(withDefaults(local));
    try {
      const res = await fetch("/api/data");
      if (!res.ok) throw new Error(String(res.status));
      const d = await res.json();
      modeRef.current = "cloud";
      setMode("cloud");
      setData(withDefaults(d));
    } catch {
      modeRef.current = "device";
      setMode("device");
      if (!local) setData(withDefaults(EMPTY));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Persist after every change (debounced so typing in journals stays smooth).
  useEffect(() => {
    if (!data || !dirty.current) return;
    writeLocal(data);
    if (modeRef.current !== "cloud") return;
    setSaving(true);
    const t = setTimeout(() => {
      fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).finally(() => setSaving(false));
    }, 600);
    return () => clearTimeout(t);
  }, [data]);

  const update = useCallback(async (updater: (d: DashboardData) => DashboardData) => {
    dirty.current = true;
    setData(prev => updater(prev ?? withDefaults(EMPTY)));
  }, []);

  return <Ctx.Provider value={{ data, loading, saving, mode, update, refresh }}>{children}</Ctx.Provider>;
}

export function useDashboard() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}

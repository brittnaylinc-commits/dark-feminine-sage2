import { NextRequest, NextResponse } from "next/server";
import { loadData, saveData } from "@/lib/db";
import { DEFAULT_HABITS, DEFAULT_BRAND_MILESTONES } from "@/types";
import type { DashboardData } from "@/types";

export async function GET() {
  try {
    let data = await loadData();
    if (!data) {
      // Seed defaults for Bri on first load
      data = {
        tasks: [],
        habitLogs: [],
        habits: DEFAULT_HABITS,
        weeklyFocus: [],
        gymSessions: [],
        quarterlyGoals: [],
        achievements: [],
        finances: [
          { id: "f1", label: "Emergency Fund", current: 0, target: 5000, type: "savings", color: "#8e9e7a" },
          { id: "f2", label: "Business Investment", current: 0, target: 2000, type: "investment", color: "#c9a96e" },
        ],
        astroReadings: [],
        birthData: {
          date: "1993-01-07",
          time: "00:00",
          location: "Chicago, IL"
        },
        contentItems: [],
        brandMilestones: DEFAULT_BRAND_MILESTONES,
        lastUpdated: new Date().toISOString(),
      };
      await saveData(data);
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/data error:", error);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data: DashboardData = await req.json();
    data.lastUpdated = new Date().toISOString();
    await saveData(data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/data error:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}

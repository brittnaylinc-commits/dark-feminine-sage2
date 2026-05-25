import { NextRequest, NextResponse } from "next/server";
import { loadData, getWeekKey, getMonthKey } from "@/lib/db";
import { google } from "googleapis";

// ─── Auth Helper ─────────────────────────────────────────────────────────────
function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// ─── Main Briefing Generator ─────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // Protect cron endpoint
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await loadData();
    if (!data) return NextResponse.json({ error: "No data" }, { status: 404 });

    const today = new Date();
    const todayStr = today.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric"
    });
    const todayISO = today.toISOString().split("T")[0];
    const weekKey = getWeekKey(today);
    const monthKey = getMonthKey(today);

    // ── Tasks for this week ──
    const weekTasks = data.tasks
      .filter(t => t.weekKey === weekKey && !t.completed)
      .slice(0, 5);

    // ── Weekly intention ──
    const weekFocus = data.weeklyFocus.find(w => w.weekKey === weekKey);

    // ── Habits: today's log ──
    const todayHabits = data.habitLogs.filter(l => l.date === todayISO);
    const totalHabits = data.habits.length;
    const doneHabits = todayHabits.length;

    // ── Astro note for the month ──
    const astro = data.astroReadings.find(r => r.monthKey === monthKey);
    const astroKeyDate = astro?.keyDates?.find(d => d.date === todayISO);

    // ── Google Calendar events ──
    let calendarEvents: string[] = [];
    try {
      if (process.env.GOOGLE_TOKENS) {
        const auth = getOAuth2Client();
        auth.setCredentials(JSON.parse(process.env.GOOGLE_TOKENS));
        const calendar = google.calendar({ version: "v3", auth });
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const events = await calendar.events.list({
          calendarId: "primary",
          timeMin: startOfDay.toISOString(),
          timeMax: endOfDay.toISOString(),
          singleEvents: true,
          orderBy: "startTime",
        });

        calendarEvents = (events.data.items || []).map(e => {
          const time = e.start?.dateTime
            ? new Date(e.start.dateTime).toLocaleTimeString("en-US", {
                hour: "numeric", minute: "2-digit"
              })
            : "All day";
          return `${time} — ${e.summary}`;
        });
      }
    } catch (err) {
      console.error("Calendar fetch error:", err);
    }

    // ── Build message ──
    const lines: string[] = [];
    lines.push(`Good morning, Bri ✦`);
    lines.push(`${todayStr}`);
    lines.push(``);

    if (weekFocus?.intention) {
      lines.push(`🌙 This week's intention:`);
      lines.push(`"${weekFocus.intention}"`);
      lines.push(``);
    }

    if (calendarEvents.length > 0) {
      lines.push(`📅 On your calendar today:`);
      calendarEvents.forEach(e => lines.push(`• ${e}`));
      lines.push(``);
    }

    if (weekTasks.length > 0) {
      lines.push(`✅ Open tasks this week:`);
      weekTasks.forEach((t, i) => lines.push(`${i + 1}. ${t.text}`));
      lines.push(`Reply "done 1 2" to check off tasks`);
      lines.push(``);
    }

    if (doneHabits > 0 || totalHabits > 0) {
      lines.push(`💫 Habit streak today: ${doneHabits}/${totalHabits} logged`);
      lines.push(``);
    }

    if (astroKeyDate) {
      lines.push(`⭐ Astro note for today:`);
      lines.push(`${astroKeyDate.event} — ${astroKeyDate.energy}`);
      lines.push(``);
    }

    lines.push(`You are the Dark Feminine Sage. Rise in your power. 🖤`);

    const message = lines.join("\n");

    // Store task mapping for reply parsing
    const taskMapping: Record<string, string> = {};
    weekTasks.forEach((t, i) => { taskMapping[String(i + 1)] = t.id; });

    // Save task mapping to DB for reply handler
    if (data) {
      (data as any)._briefingTaskMap = { date: todayISO, mapping: taskMapping };
      const { saveData } = await import("@/lib/db");
      await saveData(data);
    }

    return NextResponse.json({ message, taskCount: weekTasks.length });
  } catch (error) {
    console.error("Briefing error:", error);
    return NextResponse.json({ error: "Failed to generate briefing" }, { status: 500 });
  }
}

// ─── Handle "done 1 2" replies from Cowork ──────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { reply } = await req.json();
    const data = await loadData();
    if (!data) return NextResponse.json({ error: "No data" }, { status: 404 });

    const taskMap = (data as any)._briefingTaskMap;
    if (!taskMap) return NextResponse.json({ message: "No active task map." });

    const lower = reply.toLowerCase().trim();
    let idsToComplete: string[] = [];

    if (lower === "done all") {
      idsToComplete = Object.values(taskMap.mapping) as string[];
    } else if (lower.startsWith("done ")) {
      const nums = lower.replace("done ", "").split(/\s+/);
      idsToComplete = nums
        .map((n: string) => taskMap.mapping[n])
        .filter(Boolean);
    } else {
      return NextResponse.json({
        message: 'Reply "done 1 2" to check off tasks by number, or "done all" for everything.'
      });
    }

    let completedCount = 0;
    data.tasks = data.tasks.map(t => {
      if (idsToComplete.includes(t.id)) {
        completedCount++;
        return { ...t, completed: true, completedAt: new Date().toISOString() };
      }
      return t;
    });

    const { saveData } = await import("@/lib/db");
    await saveData(data);

    return NextResponse.json({
      message: `✅ Marked ${completedCount} task${completedCount !== 1 ? "s" : ""} complete. You're doing amazing, Bri. 🖤`
    });
  } catch (error) {
    console.error("Reply handler error:", error);
    return NextResponse.json({ error: "Failed to process reply" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { loadData, getWeekKey, getMonthKey, hasDB } from "@/lib/db";
import type { DashboardData } from "@/types";
import { google } from "googleapis";
import { NAME, DAILY_CHECKLIST, weekFor, dayNumber, TOTAL_DAYS, affirmationFor, workoutFor, daysUntil, RACE_DATE, MORNING_DECLARATION, AFTERNOON_QUESTION } from "@/lib/newme";

// Your local time zone, so "today" matches your iPad (set TZ_NAME in Vercel if you're not in Central time).
const TZ = process.env.TZ_NAME || "America/Chicago";
function localNow(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
}
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("x-cron-secret") === secret
    || req.headers.get("authorization") === `Bearer ${secret}` // Vercel cron
    || req.nextUrl.searchParams.get("key") === secret; // iPhone Shortcuts
}

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
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const slot = req.nextUrl.searchParams.get("slot") ?? "morning";
  const asText = req.nextUrl.searchParams.get("format") === "text";

  try {
    // Without a database the reminder still has the program content, just not your own to-dos.
    const data: DashboardData = (hasDB() ? await loadData() : null) ?? {
      tasks: [], habitLogs: [], habits: [], weeklyFocus: [], gymSessions: [], quarterlyGoals: [], achievements: [],
      finances: [], astroReadings: [], contentItems: [], brandMilestones: [], lastUpdated: "",
    };

    const today = localNow();
    const todayStr = today.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric"
    });
    const todayISO = iso(today);

    // ── Afternoon / evening nudges are short ──
    if (slot !== "morning") {
      const log = data.newMe?.days?.[todayISO] ?? {};
      const open = (data.todos ?? []).filter(t => t.date === todayISO && !t.done);
      const msg = slot === "afternoon"
        ? [
            `🌿 Afternoon check-in, ${NAME}`,
            log.intention ? `Your intention: "${log.intention}"` : "",
            log.afternoonDone ? "Self-preservation ✓ — beautiful." : "Pick one small act of self-preservation today.",
            `Feeling guilty? "${AFTERNOON_QUESTION}"`,
            open.length ? `Still open: ${open.slice(0, 3).map(t => t.text).join(" · ")}` : "",
          ]
        : [
            `🌙 Evening reflection, ${NAME}`,
            "5 lines: old belief · trigger · response · new belief · one thing I'm proud of.",
            log.workoutDone ? "Workout ✓" : "",
            "Which belief system won today? Either answer is okay. 🤍",
          ];
      const message = msg.filter(Boolean).join("\n");
      return asText ? new NextResponse(message) : NextResponse.json({ message });
    }
    const weekKey = getWeekKey(today);
    const monthKey = getMonthKey(today);

    // ── Tasks for this week ──
    const weekTasks = data.tasks
      .filter(t => t.weekKey === weekKey && !t.completed)
      .slice(0, 5);

    // ── Weekly intention ──
    const weekFocus = data.weeklyFocus.find(w => w.weekKey === weekKey);

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
    lines.push(`Good morning, ${NAME} ✦`);
    lines.push(`${todayStr}`);
    lines.push(``);

    const week = weekFor(todayISO);
    if (week) {
      lines.push(`🌷 New Me · Day ${dayNumber(todayISO)} of ${TOTAL_DAYS} · Week ${week.n}: ${week.title}`);
      lines.push(week.focus);
      lines.push(``);
    }

    const workout = workoutFor(todayISO);
    lines.push(`${workout.icon} ${workout.title}${workout.detail ? ` — ${workout.detail}` : ""}`);
    const raceIn = daysUntil(RACE_DATE, todayISO);
    if (raceIn > 0) lines.push(`🦃 5K in ${raceIn} days`);
    lines.push(``);

    lines.push(`🦋 Today's checklist:`);
    DAILY_CHECKLIST[today.getDay()].forEach(c => lines.push(`☐ ${c.label}`));
    lines.push(``);

    const todayTodos = (data.todos ?? []).filter(t => t.date === todayISO && !t.done);
    if (todayTodos.length > 0) {
      lines.push(`📝 To-dos:`);
      todayTodos.slice(0, 6).forEach(t => lines.push(`• ${t.text}`));
      lines.push(``);
    }

    const kids = data.parenting?.[String(today.getDay())];
    if (kids?.note) {
      lines.push(`🧸 ${kids.note}`);
      lines.push(``);
    }

    const transits = (data.transits ?? []).filter(t => todayISO >= t.date && todayISO <= (t.endDate || t.date));
    transits.forEach(t => lines.push(`🪐 ${t.title}${t.note ? ` — ${t.note}` : ""}`));
    if (transits.length) lines.push(``);

    lines.push(`📖 Daily text: https://wol.jw.org/en/wol/h/r1/lp-e/${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`);
    lines.push(``);
    lines.push(`✨ "${affirmationFor(todayISO).text}"`);
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

    if (astroKeyDate) {
      lines.push(`⭐ Astro note for today:`);
      lines.push(`${astroKeyDate.event} — ${astroKeyDate.energy}`);
      lines.push(``);
    }

    lines.push(`Before you open messages: "${MORNING_DECLARATION}" 🖤`);

    const message = lines.join("\n");

    // Store task mapping for reply parsing
    const taskMapping: Record<string, string> = {};
    weekTasks.forEach((t, i) => { taskMapping[String(i + 1)] = t.id; });

    // Save task mapping to DB for reply handler
    if (hasDB()) {
      (data as any)._briefingTaskMap = { date: todayISO, mapping: taskMapping };
      const { saveData } = await import("@/lib/db");
      await saveData(data);
    }

    return asText ? new NextResponse(message) : NextResponse.json({ message, taskCount: weekTasks.length });
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

import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getWeekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function getQuarterKey(date: Date = new Date()): string {
  const q = Math.floor(date.getMonth() / 3) + 1;
  return `${date.getFullYear()}-Q${q}`;
}

export function getMonthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getWeekDates(weekKey: string): Date[] {
  const [yearStr, weekStr] = weekKey.split("-W");
  const year = parseInt(yearStr), week = parseInt(weekStr);
  // ISO week 1 is the week containing January 4th.
  const jan4 = new Date(year, 0, 4);
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (week - 1) * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// Local calendar date (toISOString would roll over to tomorrow in the evening).
export function toISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function todayISO(): string {
  return toISO(new Date());
}

export function formatMonthKey(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("default", { month: "long", year: "numeric" });
}

export function formatQuarterKey(key: string): string {
  const [year, q] = key.split("-");
  return `${q} ${year}`;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export const CATEGORY_COLORS: Record<string, string> = {
  Brand: "#c9a96e",
  Wellness: "#8e9e7a",
  Finances: "#7a9ea8",
  Personal: "#b87c8a",
  Spiritual: "#9b8ab4",
};

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  idea:       { bg: "rgba(155,138,180,0.15)", text: "#9b8ab4" },
  drafting:   { bg: "rgba(201,169,110,0.15)", text: "#c9a96e" },
  filming:    { bg: "rgba(184,124,138,0.15)", text: "#b87c8a" },
  editing:    { bg: "rgba(122,158,168,0.15)", text: "#7a9ea8" },
  scheduled:  { bg: "rgba(142,158,122,0.15)", text: "#8e9e7a" },
  published:  { bg: "rgba(142,158,122,0.25)", text: "#a8c48a" },
};

export const TODO_CATEGORIES: Record<string, { icon: string; color: string }> = {
  Me:      { icon: "🦋", color: "#b87c8a" },
  Work:    { icon: "💼", color: "#7a9ea8" },
  Kids:    { icon: "🧸", color: "#e0c992" },
  Home:    { icon: "🏡", color: "#8e9e7a" },
  Fitness: { icon: "🍑", color: "#c9a96e" },
  Meals:   { icon: "🥗", color: "#8e9e7a" },
  Content: { icon: "🎬", color: "#b87c8a" },
  Faith:   { icon: "🙏🏽", color: "#9b8ab4" },
  Money:   { icon: "💸", color: "#7a9ea8" },
  Hobby:   { icon: "🎨", color: "#9b8ab4" },
};

export const PLATFORM_ICONS: Record<string, string> = {
  Instagram: "📸",
  TikTok: "🎵",
  YouTube: "🎬",
  Substack: "📝",
  Podcast: "🎙️",
  Other: "✦",
};

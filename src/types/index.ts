// ─── CORE DATA TYPES ───────────────────────────────────────────────────────

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  weekKey: string; // "2026-W21"
}

export interface Habit {
  id: string;
  label: string;
  sublabel?: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  goal: number; // days per week
  section: "wellness" | "brand" | "spiritual" | "learning";
}

export interface HabitLog {
  habitId: string;
  date: string; // YYYY-MM-DD
}

export interface WeeklyFocus {
  weekKey: string;
  intention: string;
  goals: string[];
  reflection: string;
  currentlyReading?: string;
  readingAuthor?: string;
  readingCover?: string;
}

export interface GymSession {
  date: string; // YYYY-MM-DD
  type: string; // e.g. "Strength", "Cardio", "Yoga"
  notes?: string;
}

// ─── QUARTERLY / GOALS ──────────────────────────────────────────────────────

export type GoalCategory = "Brand" | "Wellness" | "Finances" | "Personal" | "Spiritual";

export interface QuarterlyGoal {
  id: string;
  quarterKey: string; // "2026-Q2"
  category: GoalCategory;
  text: string;
  completed: boolean;
}

export interface Achievement {
  id: string;
  quarterKey: string;
  text: string;
  date: string;
}

export interface FinanceEntry {
  id: string;
  label: string;
  current: number;
  target: number;
  type: "savings" | "debt" | "investment";
  color: string;
}

// ─── ASTROLOGY ──────────────────────────────────────────────────────────────

export interface MonthlyAstroReading {
  monthKey: string; // "2026-05"
  aiSummary: string;
  userNotes: string;
  generatedAt: string;
  keyDates?: { date: string; event: string; energy: string }[];
}

export interface BirthData {
  date: string;    // "1993-01-01"
  time: string;    // "14:30"
  location: string; // "Chicago, IL"
}

// ─── CONTENT / BRAND ────────────────────────────────────────────────────────

export interface ContentItem {
  id: string;
  title: string;
  platform: "Instagram" | "TikTok" | "YouTube" | "Substack" | "Podcast" | "Other";
  status: "idea" | "drafting" | "filming" | "editing" | "scheduled" | "published";
  dueDate?: string;
  notes?: string;
  weekKey?: string;
}

export interface BrandMilestone {
  id: string;
  phase: number;
  title: string;
  targetDate: string;
  completed: boolean;
  notes?: string;
}

// ─── THE NEW ME PROJECT / DAILY LIFE ─────────────────────────────────────────

export type TodoCategory = "Me" | "Work" | "Kids" | "Home" | "Fitness" | "Meals" | "Content" | "Faith" | "Money" | "Hobby";

export interface Todo {
  id: string;
  text: string;
  date: string; // YYYY-MM-DD it's planned for
  category: TodoCategory;
  done: boolean;
  time?: string; // "HH:MM", optional
}

export interface DayLog {
  mood?: number; // 1–5
  feel?: string;
  need?: string;
  notEntertaining?: string;
  healthiest?: string;
  intention?: string;
  morningDone?: boolean;
  selfPres?: string;
  afternoonDone?: boolean;
  journal?: Record<string, string>;
  eveningDone?: boolean;
  checks?: string[]; // checklist item ids completed
  water?: number; // glasses
  workoutDone?: boolean;
  dailyTextRead?: boolean;
  lowEnergy?: boolean;
  winner?: "old" | "new"; // which belief system won today
}

export interface OldNewEntry {
  id: string;
  date: string;
  situation: string;
  old: string;
  next: string;
}

export interface NewMeData {
  vision: string;
  days: Record<string, DayLog>;
  weeks: Record<string, Record<string, string>>; // week number → reflection fields
  oldNew: OldNewEntry[];
  dec31: Record<string, string>;
}

export interface ParentingDay {
  who: "me" | "coparent" | "split" | "";
  note: string;
}

export interface MealWeek {
  plan: Record<string, string>; // "Mon-B" → "Overnight oats"
  grocery: { id: string; text: string; done: boolean }[];
  prepDone: boolean;
}

export interface Hobby { id: string; label: string; icon: string }

export interface Transit {
  id: string;
  date: string;
  endDate?: string;
  title: string;
  note: string;
}

export interface HumanDesign {
  type: string;
  strategy: string;
  authority: string;
  profile: string;
  notes: string;
}

// ─── ROOT DATA OBJECT ────────────────────────────────────────────────────────

export interface DashboardData {
  // Weekly
  tasks: Task[];
  habitLogs: HabitLog[];
  habits: Habit[];
  weeklyFocus: WeeklyFocus[];
  gymSessions: GymSession[];

  // Quarterly / Year
  quarterlyGoals: QuarterlyGoal[];
  achievements: Achievement[];
  finances: FinanceEntry[];

  // Astrology
  astroReadings: MonthlyAstroReading[];
  birthData?: BirthData;

  // Brand
  contentItems: ContentItem[];
  brandMilestones: BrandMilestone[];

  // The New Me Project + daily life (optional so older saved data still loads)
  newMe?: NewMeData;
  todos?: Todo[];
  parenting?: Record<string, ParentingDay>; // weekday 0–6 → default
  meals?: Record<string, MealWeek>; // weekKey → week
  hobbies?: Hobby[];
  hobbyLogs?: { hobbyId: string; date: string }[];
  transits?: Transit[];
  humanDesign?: HumanDesign;

  // Meta
  lastUpdated: string;
}

export const DEFAULT_HABITS: Habit[] = [
  {
    id: "h1", label: "Movement", sublabel: "workout / walk", icon: "🔥",
    color: "#c9a96e", bg: "rgba(201,169,110,0.12)", border: "rgba(201,169,110,0.3)",
    goal: 5, section: "wellness"
  },
  {
    id: "h2", label: "Nourishment", sublabel: "clean meals", icon: "🌿",
    color: "#8e9e7a", bg: "rgba(142,158,122,0.12)", border: "rgba(142,158,122,0.3)",
    goal: 6, section: "wellness"
  },
  {
    id: "h3", label: "Water", sublabel: "64oz+ daily", icon: "💧",
    color: "#7a9ea8", bg: "rgba(122,158,168,0.12)", border: "rgba(122,158,168,0.3)",
    goal: 7, section: "wellness"
  },
  {
    id: "h4", label: "Content", sublabel: "post / film", icon: "✨",
    color: "#b87c8a", bg: "rgba(184,124,138,0.12)", border: "rgba(184,124,138,0.3)",
    goal: 5, section: "brand"
  },
  {
    id: "h5", label: "Brand Work", sublabel: "biz tasks", icon: "👑",
    color: "#c9a96e", bg: "rgba(201,169,110,0.12)", border: "rgba(201,169,110,0.3)",
    goal: 5, section: "brand"
  },
  {
    id: "h6", label: "Meditation", sublabel: "stillness", icon: "🌙",
    color: "#9b8ab4", bg: "rgba(155,138,180,0.12)", border: "rgba(155,138,180,0.3)",
    goal: 6, section: "spiritual"
  },
  {
    id: "h7", label: "Journaling", sublabel: "shadow work", icon: "📖",
    color: "#8b6f6f", bg: "rgba(139,111,111,0.12)", border: "rgba(139,111,111,0.3)",
    goal: 4, section: "spiritual"
  },
  {
    id: "h8", label: "French", sublabel: "daily practice", icon: "🗼",
    color: "#7a8fa8", bg: "rgba(122,143,168,0.12)", border: "rgba(122,143,168,0.3)",
    goal: 7, section: "learning"
  },
];

export const DEFAULT_BRAND_MILESTONES: BrandMilestone[] = [
  {
    id: "m1", phase: 1, title: "Foundation Complete", targetDate: "2026-05-31",
    completed: false, notes: "Brand identity, social presence, first content live"
  },
  {
    id: "m2", phase: 2, title: "First Offer Launch", targetDate: "2026-07-01",
    completed: false, notes: "Coaching offer or signature program live"
  },
  {
    id: "m3", phase: 3, title: "Jupiter Leo Emergence", targetDate: "2026-07-25",
    completed: false, notes: "Full visibility push — Jupiter ingress into Leo"
  },
  {
    id: "m4", phase: 4, title: "Multi-Stream Revenue", targetDate: "2026-12-31",
    completed: false, notes: "All 3 streams generating income"
  },
];

export const DEFAULT_HOBBIES: Hobby[] = [
  { id: "hb1", label: "Reading", icon: "📚" },
  { id: "hb2", label: "French", icon: "🗼" },
  { id: "hb3", label: "Creative time", icon: "🎨" },
];

// ─── THE NEW ME PROJECT · Oct 26 – Dec 31, 2026 ─────────────────────────────
// All the program content lives here so it's easy to edit in one place.

export const NAME = "Brit";
export const PROJECT_START = "2026-10-26";
export const PROJECT_END = "2026-12-31";
export const RACE_DATE = "2026-11-26"; // Thanksgiving 5K

export const THEME = "Becoming the woman I already know I am.";
export const MANTRA =
  "My peace is a priority. My boundaries are an expression of self-respect. I can love people without losing myself.";
export const DAILY_QUESTION = "Which belief system wins today? My old beliefs or my new beliefs?";
export const MORNING_DECLARATION =
  "Today, I choose my new beliefs over my old conditioning. I can be loving without abandoning myself.";
export const AFTERNOON_QUESTION = "Am I doing something wrong, or am I simply doing something differently?";
export const SCRIPTURE = { ref: "Proverbs 4:23", note: "Safeguard your heart — protecting your emotional and spiritual well-being is a meaningful responsibility." };

export const FINAL_AFFIRMATION =
  "I am no longer available for the abandonment of myself. I can be compassionate without being consumed, generous without being depleted, and loving without sacrificing my peace. I trust myself to make decisions that honor the woman I am becoming. I release the guilt of evolving beyond old expectations. I am allowed to grow, change, rest, and choose differently. My peace matters, my needs matter, and I matter.";

export const MINDFUL_NOTE = [
  "Don't turn self-preservation into another standard you have to perform perfectly.",
  "Some days you'll answer the call you didn't want to answer, or overexplain. That's not regression.",
  "Sometimes the biggest victory isn't fighting the thought — it's noticing it, letting it exist, and choosing not to obey it.",
  "Consistency over perfection.",
];

export const BELIEFS: { old: string; next: string }[] = [
  { old: "I'm selfish if I prioritize myself.", next: "Prioritizing myself is self-preservation." },
  { old: "I have to be available for people I love.", next: "I can love people without being constantly accessible." },
  { old: "Saying no makes me insensitive.", next: "Saying no can be an act of honesty and self-respect." },
  { old: "I'm responsible for helping people solve their problems.", next: "I can support others without taking responsibility for their choices." },
  { old: "I need to get everything right.", next: "Progress requires consistency, not perfection." },
  { old: "If someone is upset with me, I must have done something wrong.", next: "Someone's disappointment doesn't automatically mean I've done something wrong." },
  { old: "I've always been this way.", next: "I am allowed to evolve beyond old versions of myself." },
];

export const OLD_VS_NEW_EXAMPLE = {
  situation: "My friend calls repeatedly to discuss the same relationship issues.",
  rows: [
    { old: "I should answer because she needs me.", next: "Her needs don't automatically override mine." },
    { old: "She's going to think I'm changing.", next: "I am changing, and that's okay." },
    { old: "What if she feels abandoned?", next: "I can communicate my availability with kindness." },
    { old: "I've always been there for her.", next: "My past availability is not a lifelong obligation." },
  ],
};

export interface ProjectWeek {
  n: number;
  start: string;
  end: string;
  title: string;
  focus: string;
  practice: string;
  prompt: string;
}

export const WEEKS: ProjectWeek[] = [
  { n: 1, start: "2026-10-26", end: "2026-11-01", title: "Awareness", focus: "Recognizing my old beliefs",
    practice: "Notice when you feel guilty, responsible for someone else's feelings, or obligated. Don't rush to change it — first, recognize it.",
    prompt: "Where did I learn that putting myself first was selfish?" },
  { n: 2, start: "2026-11-02", end: "2026-11-08", title: "Boundaries", focus: "Learning that no is enough",
    practice: "Say no without an elaborate explanation. Start small. You don't have to answer every call, accept every invitation, or explain why you're unavailable.",
    prompt: "What am I afraid will happen if I start saying no?" },
  { n: 3, start: "2026-11-09", end: "2026-11-15", title: "Emotional Responsibility", focus: "Releasing the fixer role",
    practice: "Let people experience their own emotions without rescuing them. Ask: “Do you want me to listen, or are you looking for solutions?” Even listening requires capacity.",
    prompt: "Whose emotions have I been carrying that aren't mine to manage?" },
  { n: 4, start: "2026-11-16", end: "2026-11-22", title: "Self-Trust", focus: "Learning to trust my decisions",
    practice: "Make small decisions without seeking reassurance. Choose something you want and follow through. Tolerate not knowing if everyone approves.",
    prompt: "What decisions would I make if I trusted myself completely?" },
  { n: 5, start: "2026-11-23", end: "2026-11-29", title: "Guilt", focus: "Releasing unnecessary guilt",
    practice: "Healthy guilt says you acted against your values. Conditioned guilt shows up just because you're doing something unfamiliar. Learn the difference.",
    prompt: "Did I violate my values, or did I disappoint someone's expectations?" },
  { n: 6, start: "2026-11-30", end: "2026-12-06", title: "Relationships", focus: "Choosing reciprocity",
    practice: "Notice how relationships feel. Do people celebrate your growth? Respect your boundaries? Not judging — just noticing where it feels mutual.",
    prompt: "Which relationships allow me to be fully myself?" },
  { n: 7, start: "2026-12-07", end: "2026-12-13", title: "Identity", focus: "Becoming comfortable with the new me",
    practice: "Your new beliefs already exist within you. Live by them — decide from your values rather than your fears.",
    prompt: "What does the version of me I'm becoming no longer tolerate from herself?" },
  { n: 8, start: "2026-12-14", end: "2026-12-20", title: "Self-Compassion", focus: "Giving myself grace",
    practice: "Speak to yourself like someone you deeply love. Acknowledge mistakes without making them a statement about your worth.",
    prompt: "How can I hold myself accountable without being cruel to myself?" },
  { n: 9, start: "2026-12-21", end: "2026-12-31", title: "Integration", focus: "Living as my new self",
    practice: "Review your journal. Notice where your responses changed. Celebrate the moments you chose yourself even when it felt uncomfortable. Happy birthday season. 🎂",
    prompt: "What version of myself am I leaving behind in 2026?" },
];

export const AFFIRMATIONS: { cat: string; icon: string; items: string[] }[] = [
  { cat: "Self-Preservation", icon: "🪞", items: [
    "I can choose myself without feeling guilty.",
    "My emotional capacity matters.",
    "Rest is not selfishness.",
    "I am allowed to protect the peace I've worked hard to create.",
    "I do not have to exhaust myself to prove my love.",
    "I can be a good person and still have boundaries.",
  ]},
  { cat: "Friendships & Relationships", icon: "🌷", items: [
    "I can love people without carrying their burdens.",
    "I am not responsible for regulating another adult's emotions.",
    "I release the need to rescue people from their own decisions.",
    "I deserve friendships that celebrate my growth.",
    "I do not have to shrink my accomplishments to make others comfortable.",
    "Outgrowing a dynamic does not make me disloyal.",
  ]},
  { cat: "My New Identity", icon: "🦋", items: [
    "I am allowed to become someone I've never been before.",
    "My past conditioning does not determine my future choices.",
    "I trust the woman I am becoming.",
    "I no longer confuse familiarity with alignment.",
    "My growth does not require everyone else's approval.",
    "I am not betraying my old self. I am honoring everything she survived by choosing differently.",
  ]},
  { cat: "Guilt & Perfectionism", icon: "🤍", items: [
    "Discomfort does not mean I made the wrong decision.",
    "I can disappoint someone without abandoning my values.",
    "I do not need to explain every decision I make.",
    "I can be imperfect and still be worthy.",
    "One difficult day does not erase my progress.",
    "I do not have to win every battle to become the woman I want to be.",
  ]},
  { cat: "Faith & Inner Peace", icon: "🙏🏽", items: [
    "I seek Jehovah's guidance when making difficult decisions.",
    "I can show compassion while respecting my limitations.",
    "I am worthy of the same kindness I extend to others.",
    "I choose relationships and habits that support my spiritual well-being.",
    "I can trust that personal growth does not require abandoning my values.",
  ]},
];

export const ALL_AFFIRMATIONS = AFFIRMATIONS.flatMap(a => a.items.map(text => ({ text, cat: a.cat, icon: a.icon })));

// Index 0 = Sunday … 6 = Saturday (matches Date.getDay())
export const DAILY_CHECKLIST: { id: string; label: string }[][] = [
  [ { id: "aff", label: "Morning affirmation" }, { id: "s1", label: "Reflect on my progress" }, { id: "s2", label: "Identify next week's intention" }, { id: "s3", label: "Give myself grace" } ],
  [ { id: "aff", label: "Morning affirmation" }, { id: "m1", label: "Identify an old belief" }, { id: "m2", label: "Practice self-preservation" }, { id: "eve", label: "Evening reflection" } ],
  [ { id: "aff", label: "Morning affirmation" }, { id: "t1", label: "Challenge a guilty thought" }, { id: "t2", label: "Honor one boundary" }, { id: "eve", label: "Evening reflection" } ],
  [ { id: "aff", label: "Morning affirmation" }, { id: "w1", label: "Make one self-trusting decision" }, { id: "w2", label: "Practice not overexplaining" }, { id: "eve", label: "Evening reflection" } ],
  [ { id: "aff", label: "Morning affirmation" }, { id: "r1", label: "Notice my emotional capacity" }, { id: "r2", label: "Choose a response instead of reacting" }, { id: "eve", label: "Evening reflection" } ],
  [ { id: "aff", label: "Morning affirmation" }, { id: "f1", label: "Review patterns to discuss in therapy" }, { id: "f2", label: "Celebrate one improvement" }, { id: "eve", label: "Evening reflection" } ],
  [ { id: "aff", label: "Morning affirmation" }, { id: "a1", label: "Do something purely for myself" }, { id: "a2", label: "Practice being present without guilt" }, { id: "eve", label: "Evening reflection" } ],
];

export const SELF_PRESERVATION_IDEAS = [
  "Let a call go unanswered because I need quiet time.",
  "“I understand, but I don't have the capacity to talk about this today.”",
  "Sit with guilt instead of rushing to fix it.",
  "Reply later instead of right away.",
  "Take 10 minutes alone before saying yes to anything.",
  "Ask: “Do you want me to listen, or are you looking for solutions?”",
];

export const WEEKLY_REFLECTION_FIELDS = [
  { key: "boundary", label: "One boundary I honored" },
  { key: "belief", label: "One old belief I challenged" },
  { key: "different", label: "One situation I handled differently" },
  { key: "working", label: "Something I am still working through" },
  { key: "proud", label: "Something I am proud of" },
];

export const EVENING_FIELDS = [
  { key: "oldBelief", label: "Old belief that showed up", ph: "I'm a bad friend because I didn't answer her call." },
  { key: "trigger", label: "What triggered it", ph: "Seeing three missed calls." },
  { key: "response", label: "How I responded", ph: "I felt guilty but kept enjoying my evening." },
  { key: "newBelief", label: "What my new belief says", ph: "I am allowed to be unavailable without being unloving." },
  { key: "proud", label: "One thing I'm proud of", ph: "I didn't let guilt dictate my behavior." },
];

export const MORNING_FIELDS = [
  { key: "feel", label: "How do I feel emotionally today?" },
  { key: "need", label: "What do I need from myself?" },
  { key: "notEntertaining", label: "Which old belief am I choosing not to entertain today?" },
  { key: "healthiest", label: "What would the healthiest version of me do?" },
];

export const DEC31_FIELDS = [
  { key: "leaving", label: "The version of me I'm leaving behind in 2026" },
  { key: "changed", label: "Where my responses have changed" },
  { key: "chose", label: "Moments I chose myself even though it felt uncomfortable" },
  { key: "proud", label: "What I'm most proud of" },
  { key: "carry", label: "What I'm carrying into 2027" },
  { key: "word", label: "My word for 2027" },
];

// ─── FITNESS · glute strength, Pilates, cardio, recovery + Thanksgiving 5K ──

export interface Workout { icon: string; title: string; detail: string; kind: "strength" | "run" | "pilates" | "rest" | "race" }

const STRENGTH_A: Workout = { icon: "🍑", kind: "strength", title: "Glute Strength A",
  detail: "Hip thrusts 4×10 · Romanian deadlifts 3×10 · Bulgarian split squats 3×8/leg · Cable kickbacks 3×12 · Abductions 3×15" };
const STRENGTH_B: Workout = { icon: "🍑", kind: "strength", title: "Glute Strength B + Upper",
  detail: "Sumo squats 4×10 · Step-ups 3×10/leg · Glute bridges 3×15 · Rows 3×10 · Shoulder press 3×10 · Plank 3×30s" };
const PILATES: Workout = { icon: "🧘🏽‍♀️", kind: "pilates", title: "Pilates", detail: "30–45 min mat or reformer. Core, posture, mobility." };
const REST: Workout = { icon: "🌿", kind: "rest", title: "Rest & Recovery", detail: "Gentle walk, stretch, foam roll. Rest is part of the plan." };

// Run/walk progression keyed by date (Tue / Fri / Sat runs) leading to Nov 26.
const RUNS: Record<string, string> = {
  "2026-10-27": "Run/walk: 1 min jog / 2 min walk × 8 (24 min)",
  "2026-10-30": "Run/walk: 1 min jog / 2 min walk × 8 — easy, therapy day",
  "2026-10-31": "Run/walk: 1 min jog / 1.5 min walk × 10 (25 min)",
  "2026-11-03": "Run/walk: 2 min jog / 1 min walk × 8 (24 min)",
  "2026-11-06": "Run/walk: 2 min jog / 1 min walk × 7 — easy",
  "2026-11-07": "Run/walk: 3 min jog / 1 min walk × 6 (24 min)",
  "2026-11-10": "Run/walk: 4 min jog / 1 min walk × 5 (25 min)",
  "2026-11-13": "Run/walk: 3 min jog / 1 min walk × 6 — easy",
  "2026-11-14": "Run/walk: 5 min jog / 1 min walk × 5 (30 min)",
  "2026-11-17": "Run/walk: 8 min jog / 1 min walk × 3 (27 min)",
  "2026-11-20": "Easy 20 min jog — walk breaks whenever you need",
  "2026-11-21": "Dress rehearsal: 5K at an easy pace, walk breaks allowed 🎽",
  "2026-11-23": "Easy 15–20 min shakeout jog",
  "2026-11-24": "Optional 10 min easy jog + strides, or rest",
};

const WEEK_TEMPLATE: Workout[] = [REST, STRENGTH_A, { ...REST }, PILATES, STRENGTH_B, { ...REST }, { ...REST }];
const RUN_DAY: Workout = { icon: "🏃🏽‍♀️", kind: "run", title: "Cardio", detail: "" };

export function workoutFor(iso: string): Workout {
  if (iso === RACE_DATE) return { icon: "🦃", kind: "race", title: "THANKSGIVING 5K — RACE DAY", detail: "Start slower than you want to. Walk breaks are allowed. Smile at the finish line. You trained for this. 🏅" };
  if (iso === "2026-11-25") return { ...REST, detail: "Pre-race rest. Hydrate, lay out your outfit, early night." };
  if (RUNS[iso]) return { ...RUN_DAY, title: "5K Training Run", detail: RUNS[iso] };
  const day = new Date(iso + "T12:00:00").getDay();
  if (iso > RACE_DATE && (day === 2 || day === 5)) return { ...RUN_DAY, detail: "20–30 min easy run or incline walk" };
  if (iso > RACE_DATE && day === 6) return { ...RUN_DAY, detail: "Long walk or easy 5K — keep the streak alive" };
  return WEEK_TEMPLATE[day];
}

// ─── Helpers ──────────────────────────────────────────────────────────────

export function weekFor(iso: string): ProjectWeek | null {
  return WEEKS.find(w => iso >= w.start && iso <= w.end) ?? null;
}

export function dayNumber(iso: string): number {
  const a = new Date(PROJECT_START + "T12:00:00").getTime();
  const b = new Date(iso + "T12:00:00").getTime();
  return Math.round((b - a) / 86400000) + 1;
}

export const TOTAL_DAYS = dayNumber(PROJECT_END);

export function daysUntil(iso: string, from: string): number {
  return dayNumber(iso) - dayNumber(from);
}

// Stable "random" pick so the affirmation stays the same all day.
export function affirmationFor(iso: string, offset = 0) {
  const seed = iso.split("-").reduce((s, p) => s * 31 + parseInt(p), 7) + offset;
  return ALL_AFFIRMATIONS[Math.abs(seed) % ALL_AFFIRMATIONS.length];
}

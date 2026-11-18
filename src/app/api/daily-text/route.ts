import { NextRequest, NextResponse } from "next/server";

// Pulls "Examining the Scriptures Daily" from the Watchtower Online Library
// so it can be read right on the dashboard. Always links back to wol.jw.org.

const strip = (html: string) =>
  html
    .replace(/<sup[^>]*>[\s\S]*?<\/sup>/g, "")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<\/p>/g, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&[a-z]+;/g, m => ({ "&lsquo;": "‘", "&rsquo;": "’", "&ldquo;": "“", "&rdquo;": "”", "&mdash;": "—", "&ndash;": "–", "&hellip;": "…" } as Record<string, string>)[m] ?? m)
    .replace(/\n{3,}/g, "\n\n")
    .trim();

function parse(html: string) {
  const scripture = html.match(/<p[^>]*class="[^"]*themeScrp[^"]*"[^>]*>([\s\S]*?)<\/p>/);
  const body = html.match(/<div[^>]*class="[^"]*bodyTxt[^"]*"[^>]*>([\s\S]*?)<\/div>/);
  if (!scripture && !body) return null;
  return { scripture: scripture ? strip(scripture[1]) : "", body: body ? strip(body[1]) : "" };
}

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const [y, m, d] = date.split("-").map(Number);
  const link = `https://wol.jw.org/en/wol/h/r1/lp-e/${y}/${m}/${d}`;
  const headers = { "User-Agent": "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)", Accept: "application/json, text/html" };

  try {
    // JSON feed used by the library's own daily text widget
    const res = await fetch(`https://wol.jw.org/wol/dt/r1/lp-e/${y}/${m}/${d}`, { headers, next: { revalidate: 21600 } });
    if (res.ok) {
      const json = await res.json();
      const item = json?.items?.[0];
      const parsed = item?.content ? parse(item.content) : null;
      if (parsed) return NextResponse.json({ date, link, title: item.title ?? "", ...parsed });
    }
  } catch {}

  try {
    // Fallback: the regular page, picking the block for the requested date
    const res = await fetch(link, { headers, next: { revalidate: 21600 } });
    if (res.ok) {
      const html = await res.text();
      const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const start = html.indexOf(`data-date="${iso}`);
      const parsed = parse(start >= 0 ? html.slice(start, start + 20000) : html);
      if (parsed) return NextResponse.json({ date, link, title: "", ...parsed });
    }
  } catch {}

  return NextResponse.json({ date, link, error: "unavailable" }, { status: 502 });
}

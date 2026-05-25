import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "No code" }, { status: 400 });

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const { tokens } = await auth.getToken(code);

  // In production, store tokens in DB; here we show them for manual env setup
  return new NextResponse(
    `<html><body style="font-family:monospace;padding:2rem;background:#0d0a0e;color:#c9a96e">
      <h2>✦ Google Calendar Connected</h2>
      <p>Add this to your Vercel environment variables as <strong>GOOGLE_TOKENS</strong>:</p>
      <textarea style="width:100%;height:200px;background:#1a1520;color:#e8dff0;border:1px solid #2e2535;padding:1rem;border-radius:8px">${JSON.stringify(tokens)}</textarea>
      <p style="color:#9e8fb0;margin-top:1rem">After adding, redeploy your Vercel app. Then close this tab.</p>
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}

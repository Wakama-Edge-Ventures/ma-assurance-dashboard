import { NextRequest, NextResponse } from "next/server";

// POST /api/bug
// Receives bug report JSON from the reporter form.
// TODO: relay to issue tracker (Linear / GitHub Issues) or internal email.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { priority, title, page, steps } = body;

    if (!priority || !title?.trim() || !steps?.trim()) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    console.info("[bug-report]", {
      priority,
      title: title.slice(0, 80),
      page: page || null,
      receivedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[bug-report] POST error", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

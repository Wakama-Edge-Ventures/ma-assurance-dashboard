import { NextRequest, NextResponse } from "next/server";

// POST /api/hotline
// Receives hotline contact form data (multipart/form-data).
// TODO: configure SMTP transport (nodemailer / SendGrid / Resend) to relay to hotline@wakama.farm
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const urgency = formData.get("urgency") as string;
    const service = formData.get("service") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;
    const attachment = formData.get("attachment") as File | null;

    if (!urgency || !service || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    // Log receipt (replace with email transport in production)
    console.info("[hotline]", {
      urgency,
      service,
      subject: subject.slice(0, 80),
      hasAttachment: attachment ? attachment.name : null,
      receivedAt: new Date().toISOString(),
    });

    // In production: send email to hotline@wakama.farm via configured SMTP/API
    // Example with nodemailer:
    //
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({
    //   from: "noreply@wakama.farm",
    //   to: "hotline@wakama.farm",
    //   subject: `[${urgency}] ${subject} — ${service}`,
    //   text: message,
    //   attachments: attachment ? [{ filename: attachment.name, content: Buffer.from(await attachment.arrayBuffer()) }] : [],
    // });

    return NextResponse.json({ success: true, urgency, service });
  } catch (err) {
    console.error("[hotline] POST error", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

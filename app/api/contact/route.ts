import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = result.data;

    // Lazy-load Resend so the API key is read at runtime not build time
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const DOCTOR_EMAIL = process.env.DOCTOR_EMAIL!;
    const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";

    const dateString = new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

    // Email to doctor
    await resend.emails.send({
      from: FROM_EMAIL,
      to: DOCTOR_EMAIL,
      replyTo: email,
      subject: `New Message: ${subject}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:40px 20px;">
          <div style="background:#0a1628;padding:30px;border-radius:8px 8px 0 0;">
            <h1 style="color:#c9a84c;font-size:18px;margin:0;letter-spacing:2px;text-transform:uppercase;">New Contact Message</h1>
            <p style="color:#a0aec0;margin:6px 0 0;font-size:12px;">dr-okafor.com — Contact Form</p>
          </div>
          <div style="background:white;padding:32px;border:1px solid #e2e8f0;border-top:none;">
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#666;font-size:13px;width:80px;">From</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:600;color:#1a202c;">${name}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#666;font-size:13px;">Email</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;"><a href="mailto:${email}" style="color:#c9a84c;">${email}</a></td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#666;font-size:13px;">Subject</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#1a202c;">${subject}</td></tr>
              <tr><td style="padding:10px 0;color:#666;font-size:13px;vertical-align:top;">Date</td><td style="padding:10px 0;color:#1a202c;">${dateString}</td></tr>
            </table>
            <div style="background:#f8f9fa;padding:20px;border-radius:6px;border-left:4px solid #c9a84c;">
              <p style="color:#666;font-size:12px;margin:0 0 10px;text-transform:uppercase;letter-spacing:1px;">Message</p>
              <p style="color:#2d3748;line-height:1.8;margin:0;white-space:pre-wrap;">${message}</p>
            </div>
          </div>
          <div style="background:#f0f0f0;padding:16px;border-radius:0 0 8px 8px;text-align:center;">
            <a href="mailto:${email}?subject=Re: ${subject}" style="display:inline-block;background:#0a1628;color:#c9a84c;text-decoration:none;padding:10px 24px;border-radius:4px;font-size:13px;letter-spacing:1px;">Reply to ${name}</a>
          </div>
        </div>
      `,
    });

    // Confirmation to sender
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your message has been received — Dr. Sunday Okafor`,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;">
          <div style="background:#0a1628;padding:30px;border-radius:8px 8px 0 0;text-align:center;">
            <h1 style="color:#c9a84c;font-size:22px;margin:0;letter-spacing:3px;text-transform:uppercase;">Dr. Sunday Okafor</h1>
            <p style="color:#a0aec0;margin:6px 0 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;">PhD</p>
          </div>
          <div style="background:white;padding:32px;border:1px solid #e2e8f0;border-top:none;">
            <p style="color:#2d3748;font-size:16px;">Dear ${name},</p>
            <p style="color:#4a5568;line-height:1.8;">Thank you for reaching out. Your message has been received and I will respond as soon as possible.</p>
            <div style="border:1px solid #e2e8f0;border-radius:6px;padding:16px;margin:24px 0;background:#f8f9fa;">
              <p style="color:#666;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Your Message</p>
              <p style="color:#2d3748;font-size:14px;margin:0;font-style:italic;">"${message.substring(0, 300)}${message.length > 300 ? "..." : ""}"</p>
            </div>
            <p style="color:#4a5568;line-height:1.8;">Warm regards,</p>
            <p style="color:#0a1628;font-weight:700;font-size:16px;margin:4px 0;">Dr. Sunday Okafor, PhD</p>
          </div>
          <div style="padding:16px;text-align:center;">
            <p style="color:#a0aec0;font-size:12px;margin:0;">This is an automated confirmation. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Your message has been sent successfully." });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}

import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const DOCTOR_EMAIL = process.env.DOCTOR_EMAIL || "dr.okafor@email.com";
export const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";

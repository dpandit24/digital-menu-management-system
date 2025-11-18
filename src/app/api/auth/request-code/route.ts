import { db } from "@/server/db";
import { z } from "zod";
import type { NextRequest } from "next/server";
import nodemailer from "nodemailer";

const Body = z.object({ email: z.string().email() });

function generateCode(): string {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmail(email: string, code: string) {
	// If SMTP env not configured, just log for development
	if (!process.env.SMTP_HOST) {
		console.log(`[LOGIN CODE] ${email}: ${code}`);
		return;
	}
	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT ?? "587"),
		secure: false,
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASSWORD,
		},
	});
	await transporter.sendMail({
		from: process.env.EMAIL_FROM ?? "no-reply@example.com",
		to: email,
		subject: "Your sign-in code",
		text: `Your sign-in code is ${code}. It expires in 10 minutes.`,
	});
}

export async function POST(req: NextRequest) {
	const json = await req.json();
	const { email } = Body.parse(json);
	const code = generateCode();
	const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
	await db.emailLoginToken.create({ data: { email, code, expiresAt } });
	await sendEmail(email, code);
	// In development (or when SMTP is not configured), also return the code
	const shouldExposeCode =
		!process.env.SMTP_HOST || process.env.NODE_ENV !== "production";
	return Response.json({ ok: true, code: shouldExposeCode ? code : undefined });
}


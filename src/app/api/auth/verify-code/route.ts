import { createSessionCookie } from "@/lib/auth";
import { db } from "@/server/db";
import { z } from "zod";
import type { NextRequest } from "next/server";

const Body = z.object({
	email: z.string().email(),
	code: z.string().min(4).max(10),
});

export async function POST(req: NextRequest) {
	const json = await req.json();
	const { email, code } = Body.parse(json);
	const token = await db.emailLoginToken.findFirst({
		where: {
			email,
			code,
			usedAt: null,
			expiresAt: { gt: new Date() },
		},
	});
	if (!token) {
		return new Response("Invalid code", { status: 400 });
	}

	let user = await db.user.findUnique({ where: { email } });
	if (!user) {
		// Ask for profile info later in admin; create minimal user for now
		user = await db.user.create({
			data: {
				email,
				fullName: "",
				country: "",
			},
		});
	}

	await db.emailLoginToken.update({
		where: { id: token.id },
		data: { usedAt: new Date(), userId: user.id },
	});

	await createSessionCookie(user.id);
	return Response.json({ ok: true });
}


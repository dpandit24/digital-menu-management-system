import { db } from "@/server/db";
import { getSessionUserId } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
	const userId = await getSessionUserId();
	if (!userId) return new Response("Unauthorized", { status: 401 });
	const form = await req.formData();
	const fullName = String(form.get("fullName") ?? "");
	const country = String(form.get("country") ?? "");
	if (!fullName || !country) return new Response("Invalid", { status: 400 });
	await db.user.update({ where: { id: userId }, data: { fullName, country } });
	return new Response(null, { status: 302, headers: { Location: "/admin" } });
}


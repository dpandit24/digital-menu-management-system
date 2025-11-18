import { z } from "zod";
import { db } from "@/server/db";
import { getSessionUserId } from "@/lib/auth";
import { NextRequest } from "next/server";

const Body = z.object({
	name: z.string().min(2),
	location: z.string().min(2),
});

function slugify(input: string) {
	return input
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)+/g, "");
}

export async function POST(req: NextRequest) {
	const userId = await getSessionUserId();
	if (!userId) return new Response("Unauthorized", { status: 401 });

	const { name, location } = Body.parse(await req.json());
	let base = slugify(name);
	let slug = base;
	let i = 1;
	while (await db.restaurant.findUnique({ where: { slug } })) {
		slug = `${base}-${i++}`;
	}
	const restaurant = await db.restaurant.create({
		data: { name, location, ownerId: userId, slug },
	});
	return Response.json({ id: restaurant.id, slug: restaurant.slug });
}


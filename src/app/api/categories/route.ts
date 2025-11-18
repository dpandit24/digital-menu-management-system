import { db } from "@/server/db";
import { getSessionUserId } from "@/lib/auth";
import { z } from "zod";
import { NextRequest } from "next/server";

const Query = z.object({ restaurantId: z.string() });

export async function POST(req: NextRequest) {
	const userId = await getSessionUserId();
	if (!userId) return new Response("Unauthorized", { status: 401 });

	const { searchParams } = new URL(req.url);
	const { restaurantId } = Query.parse(Object.fromEntries(searchParams));

	const form = await req.formData();
	const name = String(form.get("name") ?? "");
	if (!name) return new Response("Name required", { status: 400 });

	const restaurant = await db.restaurant.findFirst({
		where: { id: restaurantId, ownerId: userId },
	});
	if (!restaurant) return new Response("Not found", { status: 404 });

	const maxOrder =
		(
			await db.category.aggregate({
				where: { restaurantId },
				_max: { sortOrder: true },
			})
		)._max.sortOrder ?? 0;

	await db.category.create({
		data: { restaurantId, name, sortOrder: maxOrder + 1 },
	});
	return new Response(null, { status: 302, headers: { Location: `/admin/restaurants/${restaurantId}` } });
}


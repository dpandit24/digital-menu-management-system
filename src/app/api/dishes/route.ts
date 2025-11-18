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

	const restaurant = await db.restaurant.findFirst({
		where: { id: restaurantId, ownerId: userId },
	});
	if (!restaurant) return new Response("Not found", { status: 404 });

	const form = await req.formData();
	const name = String(form.get("name") ?? "");
	const imageUrl = String(form.get("imageUrl") ?? "");
	const description = String(form.get("description") ?? "");
	const priceCents = Number(form.get("priceCents") ?? "0");
	const spiceLevelRaw = String(form.get("spiceLevel") ?? "");
	const spiceLevel = spiceLevelRaw ? Number(spiceLevelRaw) : null;
	const categoryIds = form.getAll("categoryIds").map((v) => String(v));

	if (!name || !imageUrl || !description) return new Response("Missing fields", { status: 400 });

	const dish = await db.dish.create({
		data: {
			restaurantId,
			name,
			imageUrl,
			description,
			priceCents: Number.isFinite(priceCents) ? priceCents : 0,
			spiceLevel: spiceLevel as number | null,
		},
	});

	if (categoryIds.length) {
		await db.dishCategory.createMany({
			data: categoryIds.map((cid) => ({ dishId: dish.id, categoryId: cid })),
		});
	}

	return new Response(null, { status: 302, headers: { Location: `/admin/restaurants/${restaurantId}` } });
}


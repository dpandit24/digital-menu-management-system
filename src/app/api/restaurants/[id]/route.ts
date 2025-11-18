import { db } from "@/server/db";
import { getSessionUserId } from "@/lib/auth";
import type { NextRequest } from "next/server";

export async function POST(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const userId = await getSessionUserId();
	if (!userId) return new Response("Unauthorized", { status: 401 });

	const form = await req.formData();
	const method = String(form.get("_method") ?? "").toUpperCase();

	const restaurant = await db.restaurant.findUnique({
		where: { id: params.id },
	});
	if (!restaurant || restaurant.ownerId !== userId) {
		return new Response("Not found", { status: 404 });
	}

	if (method === "DELETE") {
		// Manually cascade deletes due to FK constraints
		await db.$transaction([
			db.dishCategory.deleteMany({
				where: {
					OR: [
						{ dish: { restaurantId: params.id } },
						{ category: { restaurantId: params.id } },
					],
				},
			}),
			db.dish.deleteMany({ where: { restaurantId: params.id } }),
			db.category.deleteMany({ where: { restaurantId: params.id } }),
			db.restaurant.delete({ where: { id: params.id } }),
		]);
		return new Response(null, {
			status: 302,
			headers: { Location: "/admin" },
		});
	}
	return new Response("Unsupported", { status: 400 });
}



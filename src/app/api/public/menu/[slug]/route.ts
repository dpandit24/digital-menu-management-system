import { db } from "@/server/db";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
	const restaurant = await db.restaurant.findUnique({
		where: { slug: params.slug },
	});
	if (!restaurant) return new Response("Not found", { status: 404 });

	const categories = await db.category.findMany({
		where: { restaurantId: restaurant.id },
		include: {
			dishes: {
				include: { dish: true },
				orderBy: { assignedAt: "asc" },
			},
		},
		orderBy: { sortOrder: "asc" },
	});

	return Response.json({
		restaurant: { name: restaurant.name, location: restaurant.location },
		categories: categories.map((c) => ({
			id: c.id,
			name: c.name,
			dishes: c.dishes.map((dc) => ({
				id: dc.dish.id,
				name: dc.dish.name,
				imageUrl: dc.dish.imageUrl,
				description: dc.dish.description,
				priceCents: dc.dish.priceCents,
				spiceLevel: dc.dish.spiceLevel,
			})),
		})),
	});
}


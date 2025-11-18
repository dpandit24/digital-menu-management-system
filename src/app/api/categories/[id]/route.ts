import { db } from "@/server/db";
import { getSessionUserId } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	const userId = await getSessionUserId();
	if (!userId) return new Response("Unauthorized", { status: 401 });

	const form = await req.formData();
	const method = String(form.get("_method") ?? "").toUpperCase();

	const category = await db.category.findUnique({ where: { id: params.id }, include: { restaurant: true } });
	if (!category || category.restaurant.ownerId !== userId) return new Response("Not found", { status: 404 });

	if (method === "DELETE") {
		await db.category.delete({ where: { id: params.id } });
		return new Response(null, { status: 302, headers: { Location: `/admin/restaurants/${category.restaurantId}` } });
	}
	return new Response("Unsupported", { status: 400 });
}


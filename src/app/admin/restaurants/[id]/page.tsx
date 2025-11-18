import { db } from "@/server/db";
import { notFound } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import Link from "next/link";
import QRCode from "qrcode"; // used on server to generate data URL
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ExternalLink, Plus, Trash } from "lucide-react";

async function generateQr(url: string) {
	try {
		const data = await QRCode.toDataURL(url, { width: 240, margin: 1 });
		return data;
	} catch {
		return null;
	}
}

export default async function ManageRestaurant(props: { params: { id: string } }) {
	const userId = await getSessionUserId();
	if (!userId) {
		return notFound();
	}
	const restaurant = await db.restaurant.findFirst({
		where: { id: props.params.id, ownerId: userId },
		include: {
			categories: {
				orderBy: { sortOrder: "asc" },
			},
			dishes: {
				orderBy: { createdAt: "desc" },
			},
		},
	});
	if (!restaurant) return notFound();

	const publicUrl = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ""}/r/${restaurant.slug}`;
	const qr = await generateQr(publicUrl);

	return (
		<main className="container space-y-8 py-8">
			<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-2xl font-semibold">{restaurant.name}</h1>
					<p className="text-muted-foreground text-sm">{restaurant.location}</p>
				</div>
				<Button asChild variant="ghost" className="gap-2">
					<Link href={`/r/${restaurant.slug}`} aria-label="View public menu">
						<ExternalLink className="h-4 w-4" />
						View public menu
					</Link>
				</Button>
			</div>

			<section className="grid grid-cols-1 gap-8 md:grid-cols-2">
				<div className="space-y-4 rounded-xl border p-5">
					<h2 className="text-lg font-medium">Categories</h2>
					<form
						className="flex gap-2"
						action={`/api/categories?restaurantId=${restaurant.id}`}
						method="post"
					>
						<Input
							required
							name="name"
							placeholder="New category"
							className="flex-1"
						/>
						<Button type="submit" className="gap-2">
							<Plus className="h-4 w-4" />
							Add
						</Button>
					</form>
					<ul className="space-y-2">
						{restaurant.categories.map((c) => (
							<li key={c.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
								<span>{c.name}</span>
								<form action={`/api/categories/${c.id}`} method="post">
									<input type="hidden" name="_method" value="DELETE" />
									<Button type="submit" variant="destructive" size="sm" className="gap-1">
										<Trash className="h-3.5 w-3.5" />
										Delete
									</Button>
								</form>
							</li>
						))}
					</ul>
				</div>

				<div className="space-y-4 rounded-xl border p-5">
					<h2 className="text-lg font-medium">Add Dish</h2>
					<form className="space-y-3" action={`/api/dishes?restaurantId=${restaurant.id}`} method="post">
						<div className="grid grid-cols-1 gap-3">
							<Label className="text-sm" htmlFor="dish-name">Dish name</Label>
							<Input id="dish-name" name="name" required placeholder="Dish name" />
							<Label className="text-sm" htmlFor="dish-image">Image URL</Label>
							<Input id="dish-image" name="imageUrl" required placeholder="https://..." />
							<Label className="text-sm" htmlFor="dish-description">Description</Label>
							<Textarea id="dish-description" name="description" required placeholder="Short, appetizing description" />
							<Label className="text-sm" htmlFor="dish-price">Price (cents)</Label>
							<Input id="dish-price" name="priceCents" type="number" min="0" placeholder="e.g. 499" />
							<Label className="text-sm" htmlFor="spice">Spice level (optional)</Label>
							<select id="spice" name="spiceLevel" className="w-full rounded-md border px-3 py-2 text-sm">
								<option value="">Spice level (optional)</option>
								<option value="0">0 - Mild</option>
								<option value="1">1</option>
								<option value="2">2</option>
								<option value="3">3</option>
							</select>
						</div>
						<div className="pt-2">
							<Label className="block text-sm">Categories</Label>
							<div className="mt-2 grid grid-cols-2 gap-2">
								{restaurant.categories.map((c) => (
									<label key={c.id} className="flex items-center gap-2 text-sm">
										<input type="checkbox" name="categoryIds" value={c.id} />
										{c.name}
									</label>
								))}
							</div>
						</div>
						<Button className="gap-2">
							<Plus className="h-4 w-4" />
							Add Dish
						</Button>
					</form>
					<div className="rounded-xl border p-4">
						<h3 className="text-sm font-medium text-muted-foreground">Existing Dishes</h3>
						<ul className="mt-3 space-y-2">
							{restaurant.dishes.map((d) => (
								<li key={d.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
									<span>{d.name}</span>
									<form action={`/api/dishes/${d.id}`} method="post">
										<input type="hidden" name="_method" value="DELETE" />
										<Button type="submit" variant="destructive" size="sm" className="gap-1">
											<Trash className="h-3.5 w-3.5" />
											Delete
										</Button>
									</form>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="space-y-4 rounded-xl border p-5 md:col-span-2">
					<h2 className="text-lg font-medium">Share</h2>
					<div className="flex items-center gap-6">
						{qr && <img src={qr} alt="QR" className="h-40 w-40 rounded bg-white p-2 shadow" />}
						<div className="space-y-2 text-sm">
							<p>
								Share link:{" "}
								<Link className="underline" href={`/r/${restaurant.slug}`}>
									{`/r/${restaurant.slug}`}
								</Link>
							</p>
							<p className="text-muted-foreground">Print or display the QR for customers.</p>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}


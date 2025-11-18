import { db } from "@/server/db";
import { getSessionUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, Settings, Trash, LogOut } from "lucide-react";

export default async function AdminPage() {
	const userId = await getSessionUserId();
	if (!userId) redirect("/signin");

	const restaurants = await db.restaurant.findMany({
		where: { ownerId: userId },
		orderBy: { createdAt: "desc" },
	});

	return (
		<main className="container py-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Your Restaurants</h1>
					<p className="text-muted-foreground mt-1 text-sm">
						Manage your locations and share menus with guests.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<form action="/api/auth/logout" method="post">
						<Button
							type="submit"
							variant="outline"
							className="gap-2 transition-all hover:-translate-y-0.5"
						>
							<LogOut className="h-4 w-4" />
							Sign out
						</Button>
					</form>
					<Button
						asChild
						className="gap-2 transition-all hover:shadow-md hover:-translate-y-0.5"
					>
						<Link href="/admin/restaurants/new" aria-label="Create a new restaurant">
							<Plus className="h-4 w-4" />
							New restaurant
						</Link>
					</Button>
				</div>
			</div>
			<ul className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{restaurants.map((r) => (
					<li
						key={r.id}
						className="group rounded-xl border p-5 transition-all hover:shadow-md hover:border-primary/30"
					>
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 className="text-lg font-medium">{r.name}</h2>
								<p className="text-muted-foreground text-sm">{r.location}</p>
							</div>
							<Button
								asChild
								variant="ghost"
								className="gap-1 px-2 transition-colors hover:bg-accent"
							>
								<Link 
									href={`/r/${r.slug}`} 
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`View ${r.name} menu`}
								>
									View menu
									<ExternalLink className="ml-1 h-3.5 w-3.5" />
								</Link>
							</Button>
						</div>
						<div className="mt-4 flex items-center gap-3">
							<Button
								asChild
								variant="outline"
								className="gap-2 transition-all hover:-translate-y-0.5"
							>
								<Link
									href={`/admin/restaurants/${r.id}`}
									aria-label={`Manage ${r.name}`}
								>
									<Settings className="h-4 w-4" />
									Manage
								</Link>
							</Button>
							<form action={`/api/restaurants/${r.id}`} method="post">
								<input type="hidden" name="_method" value="DELETE" />
								<Button
									variant="destructive"
									className="gap-2 transition-all hover:-translate-y-0.5"
									type="submit"
								>
									<Trash className="h-4 w-4" />
									Delete
								</Button>
							</form>
						</div>
					</li>
				))}
			</ul>
			{restaurants.length === 0 && (
				<div className="mt-10 rounded-xl border p-10 text-center">
					<p className="text-muted-foreground">
						No restaurants yet. Get started by creating your first one.
					</p>
					<div className="mt-4">
						<Button
							asChild
							className="gap-2 transition-all hover:shadow-md hover:-translate-y-0.5"
						>
							<Link href="/admin/restaurants/new">
								<Plus className="h-4 w-4" />
								New restaurant
							</Link>
						</Button>
					</div>
				</div>
			)}
		</main>
	);
}


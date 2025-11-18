"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame as Chili } from "lucide-react";

type Dish = {
	id: string;
	name: string;
	imageUrl: string;
	description: string;
	priceCents: number;
	spiceLevel: number | null;
};
type Category = { id: string; name: string; dishes: Dish[] };

async function fetchMenu(slug: string) {
	const res = await fetch(`/api/public/menu/${slug}`);
	if (!res.ok) throw new Error("Failed to load menu");
	return (await res.json()) as {
		restaurant: { name: string; location: string };
		categories: Category[];
	};
}

export default function PublicMenuPage(props: { params: { slug: string } }) {
	const [data, setData] = useState<Awaited<ReturnType<typeof fetchMenu>> | null>(null);
	const [current, setCurrent] = useState<string>("");
	const refs = useRef<Record<string, HTMLElement | null>>({});
	const [expandedDishIdToOpen, setExpandedDishIdToOpen] = useState<Record<string, boolean>>({});

	useEffect(() => {
		fetchMenu(props.params.slug).then(setData).catch(console.error);
	}, [props.params.slug]);

	const categories = data?.categories ?? [];

	useEffect(() => {
		if (!categories.length) return;
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setCurrent(entry.target.getAttribute("data-category") || "");
					}
				});
			},
			{ rootMargin: "-50% 0px -50% 0px", threshold: [0, 1] }
		);
		categories.forEach((c) => {
			const el = refs.current[c.id];
			if (el) observer.observe(el);
		});
		return () => observer.disconnect();
	}, [categories]);

	function scrollTo(id: string) {
		refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
	}

	const title = useMemo(() => data?.restaurant.name ?? "", [data]);
	const location = useMemo(() => data?.restaurant.location ?? "", [data]);

	const formatPrice = useCallback((price: number) => {
		// Treat stored value as whole currency and display as-is to avoid truncation
		return `₹ ${price}`;
	}, []);

	const toggleReadMore = useCallback((dishId: string) => {
		setExpandedDishIdToOpen((prev) => ({
			...prev,
			[dishId]: !prev[dishId],
		}));
	}, []);

	const categorySubtitleMap: Record<string, string> = useMemo(
		() => ({
			Recommended: "Desserts",
			Beverages: "Drinks",
			Mains: "Entrees",
			Desserts: "Sweets",
		}),
		[]
	);

	const groupNameFor = useCallback((name: string) => {
		const n = name.toLowerCase();
		if (n.includes("recommend") || n.includes("special")) return "Recommended";
		if (n.includes("starter") || n.includes("appetizer")) return "Starter";
		if (n.includes("dessert") || n.includes("ice") || n.includes("sweet")) return "Desserts";
		if (n.includes("main")) return "Main Course";
		if (
			n.includes("drink") ||
			n.includes("beverage") ||
			n.includes("beer") ||
			n.includes("cocktail") ||
			n.includes("mocktail") ||
			n.includes("wine") ||
			n.includes("liquor")
		)
			return "Drinks";
		return "Others";
	}, []);

	const grouped = useMemo(() => {
		const map = new Map<string, Category[]>();
		const order: string[] = [];

		// Build groups in the exact order categories appear on the page
		categories.forEach((c) => {
			const g = groupNameFor(c.name);

			if (!map.has(g)) {
				map.set(g, []);
				order.push(g);
			}

			map.get(g)!.push(c);
		});

		return { map, order };
	}, [categories, groupNameFor]);

	return (
		<main className="mx-auto max-w-xl px-3 pb-28">
			{/* Sticky Header with gradient and category tabs */}
			<div className="sticky top-0 z-20 -mx-3 bg-gradient-to-b from-background/80 via-background/70 to-background/60 px-3 pb-2 pt-4 backdrop-blur">
                <div className="rounded-xl bg-gradient-to-r from-muted/80 to-secondary/60 p-3">
                    <div className="text-lg font-semibold leading-tight">{title}</div>
                    <div className="text-[11px] text-muted-foreground">{location}</div>
                </div>
				{categories.length > 0 && (
					<div className="mt-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
						<div className="flex items-end gap-6 border-b">
							{categories.map((c) => {
								const isActive = current === c.name;
								return (
									<button
										key={c.id}
										onClick={() => scrollTo(c.id)}
										className="shrink-0 pb-2 text-sm font-medium text-foreground/80 hover:text-foreground"
									>
										<div className="text-center">{c.name}</div>
										<div
											className={[
												"mt-2 h-0.5 rounded-full",
												isActive ? "bg-primary" : "bg-transparent"
											].join(" ")}
										/>
									</button>
								);
							})}
						</div>
					</div>
				)}
			</div>

			{/* Menu sections */}
			<div className="space-y-8 pt-4">
				{categories.map((c) => (
					<section
						key={c.id}
						ref={(el) => {
							refs.current[c.id] = el;
						}}
						data-category={c.name}
						className="scroll-mt-32 space-y-4"
					>
						<div className="flex items-center gap-3">
							<div className="h-px flex-1 bg-border" />
							<div className="flex items-baseline gap-3">
								<h2 className="text-sm font-semibold tracking-wide text-foreground">{c.name}</h2>
								{categorySubtitleMap[c.name] && (
									<span className="text-xs text-muted-foreground">{categorySubtitleMap[c.name]}</span>
								)}
							</div>
							<div className="h-px flex-1 bg-border" />
						</div>
						<ul className="divide-y">
							{c.dishes.map((d) => (
								<li
									key={d.id}
									className="py-4 transition"
								>
									<div className="grid grid-cols-[18px,1fr,96px] items-start gap-3">
										{/* veg symbol - always green: square with green dot */}
										<div className="mt-0.5 grid h-[14px] w-[14px] place-items-center rounded-[2px] border border-green-600">
											<div className="h-[8px] w-[8px] rounded-full bg-green-600" />
										</div>
										<div className="min-w-0">
											{/* spice level chillies */}
											{typeof d.spiceLevel === "number" && d.spiceLevel > 0 && (
												<div className="mb-1 flex items-center gap-1">
													{Array.from({ length: d.spiceLevel }, (_, i) => (
														<Chili key={i} className="h-4 w-4 text-red-600" />
													))}
												</div>
											)}
											<h3 className="truncate text-[15px] font-medium">{d.name}</h3>
											<div className="mt-1 text-sm font-semibold tabular-nums">{formatPrice(d.priceCents)}</div>
											<p className={["text-xs text-muted-foreground", expandedDishIdToOpen[d.id] ? "" : "line-clamp-2"].join(" ")}>
												{d.description}
											</p>
											<button
												className="mt-1 text-[11px] font-medium text-foreground/80 underline-offset-2 hover:underline"
												onClick={() => toggleReadMore(d.id)}
											>
												{expandedDishIdToOpen[d.id] ? "show less" : "read more"}
											</button>
										</div>
										<img
											src={d.imageUrl}
											alt=""
											className="h-24 w-24 justify-self-end rounded-md object-cover ring-1 ring-border"
										/>
									</div>
								</li>
							))}
						</ul>
					</section>
				))}
			</div>

			{/* Floating menu button */}
			<div className="fixed inset-x-0 bottom-5 z-30 flex justify-center">
				<Dialog>
					<DialogTrigger asChild>
						<Button className="h-11 rounded-full px-6 shadow-lg">≡ Menu</Button>
					</DialogTrigger>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle className="text-center">Menu</DialogTitle>
						</DialogHeader>
						<div className="max-h-[65vh] overflow-auto pr-1">
							{grouped.order.map((group) => {
								const list = grouped.map.get(group) || [];
								if (!list.length) return null;
								return (
									<div key={group} className="mb-3">
										<div className="py-1 text-center text-sm font-semibold text-rose-600">{group}</div>
										<ul className="divide-y rounded-md border">
											{list.map((c) => (
												<li key={c.id}>
													<DialogClose asChild>
														<button
															onClick={() => scrollTo(c.id)}
															className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-accent"
														>
															<span>{c.name}</span>
															<span className="tabular-nums text-muted-foreground">{c.dishes.length}</span>
														</button>
													</DialogClose>
												</li>
											))}
										</ul>
									</div>
								);
							})}
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</main>
	);
}


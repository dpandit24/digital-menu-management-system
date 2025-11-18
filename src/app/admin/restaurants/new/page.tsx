"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function NewRestaurantPage() {
	const [name, setName] = useState("");
	const [location, setLocation] = useState("");
	const [loading, setLoading] = useState(false);

	async function createRestaurant() {
		setLoading(true);
		const res = await fetch("/api/restaurants", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ name, location }),
		});
		setLoading(false);
		if (res.ok) {
			const json = await res.json();
			window.location.href = `/admin/restaurants/${json.id}`;
		}
	}

	return (
		<main className="container max-w-2xl py-8">
			<h1 className="text-2xl font-semibold">Create restaurant</h1>
			<div className="mt-6 space-y-4">
				<div>
					<label className="text-sm">Name</label>
					<Input value={name} onChange={(e) => setName(e.target.value)} />
				</div>
				<div>
					<label className="text-sm">Location</label>
					<Textarea
						value={location}
						onChange={(e) => setLocation(e.target.value)}
					/>
				</div>
				<Button onClick={createRestaurant} disabled={loading}>
					{loading ? "Creating..." : "Create"}
				</Button>
			</div>
		</main>
	);
}


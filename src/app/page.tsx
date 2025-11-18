import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";

export default async function HomePage() {
	const userId = await getSessionUserId();
	return (
		<main className="container py-10">
			<div className="mx-auto max-w-xl space-y-6 text-center">
				<h1 className="text-3xl font-bold">Digital Menu Management System</h1>
				<p className="text-muted-foreground">
					Create restaurants, manage menus, and share a beautiful digital menu via QR
					code.
				</p>
				<div className="flex items-center justify-center gap-3">
					{userId ? (
						<Link className="underline" href="/admin">
							Go to Admin
						</Link>
					) : (
						<Link className="underline" href="/signin">
							Sign in
						</Link>
					)}
				</div>
			</div>
		</main>
	);
}
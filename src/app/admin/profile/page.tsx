import { db } from "@/server/db";
import { getSessionUserId } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
	const userId = await getSessionUserId();
	if (!userId) redirect("/signin");
	const user = await db.user.findUnique({ where: { id: userId } });
	if (!user) redirect("/signin");
	return (
		<main className="container max-w-xl space-y-6 py-8">
			<h1 className="text-2xl font-semibold">Your profile</h1>
			<form className="space-y-3" action="/api/me" method="post">
				<label className="text-sm">Full name</label>
				<input className="w-full rounded-md border px-3 py-2 text-sm" name="fullName" defaultValue={user.fullName} required />
				<label className="text-sm">Country</label>
				<input className="w-full rounded-md border px-3 py-2 text-sm" name="country" defaultValue={user.country} required />
				<button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Save</button>
			</form>
		</main>
	);
}


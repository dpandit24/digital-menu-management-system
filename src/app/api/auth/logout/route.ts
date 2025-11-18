import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
	clearSessionCookie();
	return new Response(null, {
		status: 302,
		headers: { Location: "/signin" },
	});
}



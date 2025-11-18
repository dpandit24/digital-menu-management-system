import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_COOKIE = "dmms_session";
const JWT_ISSUER = "dmms";

function getSecret() {
	const secret = process.env.JWT_SECRET;
	if (!secret) throw new Error("JWT_SECRET is not set");
	return new TextEncoder().encode(secret);
}

export async function createSessionCookie(userId: string) {
	const jwt = await new SignJWT({ sub: userId })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setIssuer(JWT_ISSUER)
		.setExpirationTime("30d")
		.sign(getSecret());

	cookies().set(JWT_COOKIE, jwt, {
		httpOnly: true,
		secure: true,
		path: "/",
		maxAge: 60 * 60 * 24 * 30,
		sameSite: "lax",
	});
}

export async function getSessionUserId(): Promise<string | null> {
	const jwt = cookies().get(JWT_COOKIE)?.value;
	if (!jwt) return null;
	try {
		const { payload } = await jwtVerify(jwt, getSecret(), { issuer: JWT_ISSUER });
		return typeof payload.sub === "string" ? payload.sub : null;
	} catch {
		return null;
	}
}

export function clearSessionCookie() {
	cookies().set(JWT_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}


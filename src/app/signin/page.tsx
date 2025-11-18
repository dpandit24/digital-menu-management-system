"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [phase, setPhase] = useState<"request" | "verify">("request");
	const [message, setMessage] = useState<string | null>(null);
	const [devCode, setDevCode] = useState<string | null>(null);

	async function requestCode() {
		setMessage(null);
		const res = await fetch("/api/auth/request-code", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ email }),
		});
		if (res.ok) {
			setPhase("verify");
			try {
				const data = (await res.json()) as { ok: boolean; code?: string };
				if (data?.code) {
					setDevCode(data.code);
					setCode(data.code); // autofill for convenience in dev
					setMessage("We sent a verification code to your email. (Shown below for development)");
				} else {
					setDevCode(null);
					setMessage("We sent a verification code to your email.");
				}
			} catch {
				setDevCode(null);
				setMessage("We sent a verification code to your email.");
			}
		} else {
			setMessage("Failed to send code");
		}
	}

	async function verifyCode() {
		setMessage(null);
		const res = await fetch("/api/auth/verify-code", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ email, code }),
		});
		if (res.ok) {
			window.location.href = "/admin";
		} else {
			setMessage("Invalid or expired code");
		}
	}

	return (
		<main className="container flex min-h-[70vh] items-center justify-center">
			<div className="w-full max-w-md space-y-4">
				<h1 className="text-2xl font-semibold">Sign in</h1>
				<p className="text-sm text-muted-foreground">
					Enter your email. We&apos;ll send you a one-time code.
				</p>
				<div className="space-y-2">
					<Input
						type="email"
						placeholder="you@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<Button onClick={requestCode} className="w-full">
						Send code
					</Button>
				</div>
				{phase === "verify" && (
					<div className="space-y-2 pt-2">
						{devCode && (
							<div className="rounded-md border bg-accent/20 px-3 py-2 text-center">
								<p className="text-xs uppercase text-muted-foreground">Your code (development)</p>
								<p className="font-mono text-lg tracking-widest">{devCode}</p>
							</div>
						)}
						<Input
							placeholder="123456"
							value={code}
							onChange={(e) => setCode(e.target.value)}
						/>
						<Button onClick={verifyCode} className="w-full">
							Verify
						</Button>
					</div>
				)}
				{message && <p className="text-sm text-muted-foreground">{message}</p>}
			</div>
		</main>
	);
}


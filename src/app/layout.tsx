import "@/styles/globals.css";
import { ReactNode } from "react";
import { Providers } from "@/components/providers";

export const metadata = {
	title: "Digital Menu",
	description: "QR-powered digital menu management system",
};

export default function RootLayout(props: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="min-h-screen bg-background antialiased">
				<Providers>{props.children}</Providers>
			</body>
		</html>
	);
}


"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export function Providers(props: { children: ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());
	return (
		<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
			<QueryClientProvider client={queryClient}>
				{props.children}
			</QueryClientProvider>
		</ThemeProvider>
	);
}


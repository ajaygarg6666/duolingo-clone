import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Nunito } from "next/font/google";
import { sget } from "@/lib/server";
import type { Me } from "@/lib/api";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "700", "800"],
});

export const metadata: Metadata = {
  title: "duolingo",
  description: "Learn Spanish the playful way.",
};

export const dynamic = "force-dynamic";

async function theme(): Promise<"dark" | "light"> {
  const fromCookie = (await cookies()).get("theme")?.value;
  if (fromCookie === "dark" || fromCookie === "light") return fromCookie;
  try {
    const me = await sget<Me>("/api/v1/me");
    return me.theme === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const dataTheme = await theme();
  return (
    <html lang="en" data-theme={dataTheme} suppressHydrationWarning className={`${nunito.variable} h-full antialiased`}>
      <body className={`${nunito.className} min-h-full bg-snow text-ink`}>{children}</body>
    </html>
  );
}

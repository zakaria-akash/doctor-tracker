import { Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

// The font variable can be reused consistently by Tailwind and shared components.
const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata = {
  title: { default: "Doctor Tracker", template: "%s · Doctor Tracker" },
  description: "Secure admin portal to manage doctors, patients and clinical analytics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={fontSans.variable} suppressHydrationWarning>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {/* Phase 3 provides the shared theme, URL state and server-state cache. */}
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cheers — Find Your Match",
  description: "Meet interesting people nearby",
};

const themeInitScript = `
(function() {
  try {
    var raw = localStorage.getItem('cheers-theme');
    var dark = false;
    if (raw) {
      var parsed = JSON.parse(raw);
      dark = !!(parsed && parsed.state && parsed.state.dark);
    } else {
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

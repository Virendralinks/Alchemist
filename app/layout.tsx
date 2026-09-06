import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/shell/AppSidebar";
import { MotionProvider } from "@/components/shell/MotionProvider";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { TooltipProvider } from "@/components/ui/tooltip";

/** Sans — the raw-reality pane, prose dissections, and all UI chrome. Appendix A. */
const fontSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
});

/** Mono — the sequencer grid, the cipher pane, IPA readouts, and all phonetic data. Appendix A. */
const fontMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "The Alchemist's Workbench",
    template: "%s — The Alchemist's Workbench",
  },
  description:
    "A DAW for lyrics. Words are rhythmic data, syllables are MIDI notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("dark", fontSans.variable, fontMono.variable)}
    >
      {/*
        A fixed height here rather than min-height: every panel below is built
        from `h-full min-h-0` so its own scroll area works, and those collapse to
        content height unless something upstream pins the viewport.
      */}
      <body className="h-screen overflow-hidden bg-zinc-950 font-sans text-zinc-100 antialiased">
        <MotionProvider>
          <TooltipProvider delayDuration={200}>
            <div className="flex h-full">
              <AppSidebar />
              <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
            </div>
            <CommandPalette />
          </TooltipProvider>
        </MotionProvider>
      </body>
    </html>
  );
}

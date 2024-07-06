"use client";

import { TooltipProvider } from "@/registry/ui/tooltip";

import { ThemeProvider } from "./theme/ThemeProvider";
import useInit from "@/hooks/useInit";

function Providers({ children }: { children: React.ReactNode }) {
  useInit();

  return (
    <ThemeProvider attribute="class" disableTransitionOnChange>
      <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
    </ThemeProvider>
  );
}

export default Providers;

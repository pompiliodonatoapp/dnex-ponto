import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import "./styles/theme.css";
import "./styles/showcase.css";
import "./styles/workbench.css";
import { ThemeProvider } from "./lib/theme";
import { DensityProvider } from "./lib/density";
import { TooltipProvider } from "./components/primitives/Tooltip";
import { ToastProvider } from "./components/composed/Toast";
import { App } from "./showcase/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* reducedMotion="user" faz o motion respeitar prefers-reduced-motion. */}
    <MotionConfig reducedMotion="user">
      <ThemeProvider defaultTheme="light" storageKey="dnex-showcase-theme">
        <DensityProvider defaultDensity="comfortable">
          <TooltipProvider delayDuration={200}>
            <ToastProvider>
              <App />
            </ToastProvider>
          </TooltipProvider>
        </DensityProvider>
      </ThemeProvider>
    </MotionConfig>
  </StrictMode>,
);

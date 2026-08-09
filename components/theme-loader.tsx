"use client";

import { useEffect } from "react";
import { ThemeSettings } from "@/types/api";

// Simple HEX to HSL converter
function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  if (hex.length === 3) {
    hex = hex.split('').map(x => x + x).join('');
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  // Tailwind HSL format expects space separated values, no % on Hue
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function ThemeLoader() {
  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_URL + "/theme")
      .then(res => res.json())
      .then((data: ThemeSettings) => {
        if (!data || !data.primaryColor) return;
        
        const accentHsl = hexToHsl(data.primaryColor);
        const foreground = data.primaryForeground || '#ffffff';
        const radius = data.radius || '0.5rem';
        const fontFamily = data.fontFamily || 'Inter, sans-serif';

        const styleId = 'fxsim-dynamic-theme';
        let styleEl = document.getElementById(styleId);
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = styleId;
          document.head.appendChild(styleEl);
        }

        // We override --accent because tailwind maps primary to --accent
        // We override --radius if we want to support dynamic radius across the app (needs extra config in tailwind.config.ts if not there, but we can just override CSS vars)
        // We inject CSS variables to root
        styleEl.innerHTML = `
          :root {
            --accent: ${accentHsl};
            --accent-hover: ${accentHsl}; /* In a real app we might darken it slightly */
          }
          
          .dark {
            --accent: ${accentHsl};
            --accent-hover: ${accentHsl};
          }
          
          body {
            font-family: ${fontFamily} !important;
          }
          
          /* Force primary foreground color for buttons if needed, since tailwind uses text-primary-foreground */
          .bg-primary {
            color: ${foreground} !important;
          }
        `;
      })
      .catch(err => {
        console.error("Failed to load theme settings", err);
      });
  }, []);

  return null;
}

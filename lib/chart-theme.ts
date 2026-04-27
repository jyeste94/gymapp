"use client";
import { useEffect, useState } from "react";

function isDarkMode(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export function useChartTheme() {
  const [dark, setDark] = useState(isDarkMode);

  useEffect(() => {
    const observer = new MutationObserver(() => setDark(isDarkMode()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return {
    grid: dark ? "rgba(255,255,255,0.12)" : "rgba(0, 113, 227, 0.14)",
    axis: dark ? "rgba(255,255,255,0.5)" : "#8d8d93",
    axisY: dark ? "rgba(255,255,255,0.5)" : "#1d1d1f",
    tooltip: {
      contentStyle: {
        backgroundColor: dark ? "rgba(30,30,32,0.95)" : "rgba(255,255,255,0.95)",
        border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
        borderRadius: "12px",
        boxShadow: dark ? "0 10px 24px -18px rgba(0,0,0,0.6)" : "0 10px 24px -18px rgba(0,0,0,0.45)",
      },
      labelStyle: { color: dark ? "rgba(255,255,255,0.6)" : "#8E8E93" },
      itemStyle: { color: dark ? "#fff" : "#1D1D1F" },
    },
    blue: "#0071e3",
    blueLight: "#6aa9ff",
    bluePale: dark ? "#1a3a5c" : "#d2e8ff",
    barLow: dark ? "#1a3a5c" : "#cde4ff",
    barMid: "#6aa9ff",
    barHigh: "#0071e3",
    pieColors: dark
      ? ["#0071e3", "#0a84ff", "#2997ff", "#6aa9ff", "#5ac8fa", "#4db8ff", "#3a7bd5", "#2b5fbd"]
      : ["#0071e3", "#0a84ff", "#2997ff", "#6aa9ff", "#8fc2ff", "#b7d9ff", "#d2e8ff", "#e5f1ff"],
    heatmapColors: dark ? ["#1a3a5c", "#6aa9ff", "#0071e3"] : ["#d2e8ff", "#6aa9ff", "#0071e3"],
  };
}

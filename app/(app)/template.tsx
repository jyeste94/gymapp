"use client";
import type { ReactNode } from "react";
import { AnimatePresence } from "framer-motion";

export default function Template({ children }: { children: ReactNode }) {
    return (
        <AnimatePresence mode="wait">
            {children}
        </AnimatePresence>
    );
}

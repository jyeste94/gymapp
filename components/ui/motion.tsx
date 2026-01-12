"use client";
import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

export const PageTransition = ({ children }: { children: ReactNode }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
    >
        {children}
    </motion.div>
);

export const FadeIn = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
        {children}
    </motion.div>
);

export const ScaleOnHover = ({ children }: { children: ReactNode }) => (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        {children}
    </motion.div>
);

export const StaggerContainer = ({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) => (
    <motion.div
        variants={{
            hidden: { opacity: 0 },
            show: {
                opacity: 1,
                transition: {
                    staggerChildren: 0.08,
                },
            },
        }}
        initial="hidden"
        animate="show"
        className={className}
    >
        {children}
    </motion.div>
);

export const StaggerItem = ({ children }: { children: ReactNode }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 15 },
            show: { opacity: 1, y: 0 },
        }}
    >
        {children}
    </motion.div>
);

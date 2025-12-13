"use client";

import { motion, useInView } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface ScaleInProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    initialScale?: number;
    className?: string;
    once?: boolean;
}

export default function ScaleIn({
    children,
    delay = 0,
    duration = 0.6,
    initialScale = 0.8,
    className = '',
    once = true
}: ScaleInProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, {
        once,
        margin: "-100px"
    });

    return (
        <motion.div
            ref={ref}
            initial={{
                opacity: 0,
                scale: initialScale
            }}
            animate={isInView ? {
                opacity: 1,
                scale: 1
            } : {
                opacity: 0,
                scale: initialScale
            }}
            transition={{
                duration,
                delay,
                ease: "easeOut"
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

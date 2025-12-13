"use client";

import { motion, useInView } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface ScrollRevealProps {
    children: ReactNode;
    direction?: 'left' | 'right' | 'up' | 'down' | 'none';
    delay?: number;
    duration?: number;
    distance?: number;
    className?: string;
    once?: boolean;
}

export default function ScrollReveal({
    children,
    direction = 'up',
    delay = 0,
    duration = 0.6,
    distance = 50,
    className = '',
    once = true
}: ScrollRevealProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, {
        once,
        margin: "-100px"
    });

    const getInitialPosition = () => {
        switch (direction) {
            case 'left':
                return { x: -distance, y: 0 };
            case 'right':
                return { x: distance, y: 0 };
            case 'up':
                return { x: 0, y: distance };
            case 'down':
                return { x: 0, y: -distance };
            case 'none':
                return { x: 0, y: 0 };
            default:
                return { x: 0, y: distance };
        }
    };

    return (
        <motion.div
            ref={ref}
            initial={{
                opacity: 0,
                ...getInitialPosition()
            }}
            animate={isInView ? {
                opacity: 1,
                x: 0,
                y: 0
            } : {
                opacity: 0,
                ...getInitialPosition()
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

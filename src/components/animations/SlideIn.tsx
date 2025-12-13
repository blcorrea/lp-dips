"use client";

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SlideInProps {
    children: ReactNode;
    direction?: 'left' | 'right' | 'up' | 'down';
    delay?: number;
    duration?: number;
    distance?: number;
    className?: string;
}

export default function SlideIn({
    children,
    direction = 'up',
    delay = 0,
    duration = 0.6,
    distance = 50,
    className = ''
}: SlideInProps) {
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
            default:
                return { x: 0, y: distance };
        }
    };

    return (
        <motion.div
            initial={{
                opacity: 0,
                ...getInitialPosition()
            }}
            animate={{
                opacity: 1,
                x: 0,
                y: 0
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

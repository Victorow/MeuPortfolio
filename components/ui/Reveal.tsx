'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { fadeUp } from '@/lib/motion';
import { createElement, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variants?: Variants;
  amount?: number;
  once?: boolean;
  as?: 'div' | 'span' | 'section' | 'article' | 'header' | 'footer' | 'li' | 'ul';
};

export default function Reveal({
  children,
  className,
  delay = 0,
  variants = fadeUp,
  amount = 0.2,
  once = true,
  as = 'div'
}: Props) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  if (reduced) {
    return createElement(as, { className }, children);
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount, margin: '-10% 0px -10% 0px' }}
      variants={variants}
      transition={{ delay }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </MotionTag>
  );
}

'use client';

import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion';

/**
 * Wraps the app in LazyMotion to keep the Framer bundle small (Appendix A),
 * and honours prefers-reduced-motion globally so every future micro-interaction
 * collapses its duration to 0 without extra plumbing at each callsite.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

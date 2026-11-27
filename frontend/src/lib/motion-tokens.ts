import type { Transition } from 'framer-motion';

export const motionTransitions: Record<string, Transition> = {
  default: {
    duration: 0.3,
    ease: 'easeInOut',
  },

  fast: {
    duration: 0.15,
    ease: 'easeOut',
  },

  slow: {
    duration: 0.5,
    ease: 'easeInOut',
  },

  springSnappy: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
    mass: 0.8,
  },

  springGentle: {
    type: 'spring',
    stiffness: 200,
    damping: 25,
    mass: 1,
  },
};

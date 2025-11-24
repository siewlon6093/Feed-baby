import React from 'react';
import { motion } from 'framer-motion';

export const EmptyStateIllustration = () => (
  <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto opacity-80">
    {/* Sleeping Cloud */}
    <motion.path
      initial={{ y: 0 }}
      animate={{ y: [0, -5, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      d="M45 60C45 48.9543 53.9543 40 65 40C67.0888 40 69.1026 40.3196 71.0096 40.912C73.6482 32.7351 81.3771 26.8 90.5 26.8C101.573 26.8 110.865 34.1838 113.569 44.3656C114.856 44.1271 116.181 44 117.545 44C127.21 44 135 51.6112 135 61C135 70.3888 127.21 78 117.545 78H65C53.9543 78 45 69.0457 45 60Z"
      fill="#EEF2FF"
      stroke="#A5B4FC"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Zzz */}
    <motion.g
        initial={{ opacity: 0, x: -5, y: 5 }}
        animate={{ opacity: [0, 1, 0], x: [0, 10], y: [-10, -20] }}
        transition={{ repeat: Infinity, duration: 3 }}
    >
        <text x="120" y="30" fill="#818CF8" fontSize="14" fontFamily="Quicksand" fontWeight="bold">Z</text>
    </motion.g>
    <motion.g
        initial={{ opacity: 0, x: -5, y: 5 }}
        animate={{ opacity: [0, 1, 0], x: [0, 10], y: [-10, -20] }}
        transition={{ repeat: Infinity, duration: 3, delay: 1 }}
    >
        <text x="130" y="20" fill="#818CF8" fontSize="10" fontFamily="Quicksand" fontWeight="bold">z</text>
    </motion.g>
  </svg>
);

export const BottleIllustration = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="14" width="16" height="22" rx="4" fill="#DBEAFE" stroke="#60A5FA" strokeWidth="2"/>
        <path d="M15 14V10H25V14" stroke="#60A5FA" strokeWidth="2"/>
        <path d="M18 10L17 6C17 6 18 4 20 4C22 4 23 6 23 6L22 10" stroke="#60A5FA" strokeWidth="2" fill="#EFF6FF"/>
        <path d="M16 22H24" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 28H24" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

export const BreastIllustration = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="12" fill="#FCE7F3" stroke="#F472B6" strokeWidth="2"/>
        <circle cx="20" cy="20" r="4" fill="#FBCFE8"/>
    </svg>
);

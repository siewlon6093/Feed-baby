import React from 'react';
import { motion } from 'framer-motion';

export const Logo = ({ className = "w-10 h-10", color = "text-indigo-600" }: { className?: string, color?: string }) => {
  return (
    <div className={`relative flex items-center justify-center ${className} ${color}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Abstract Parent Swaddle Shape */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          d="M50 20C33.4315 20 20 33.4315 20 50C20 66.5685 33.4315 80 50 80C66.5685 80 80 66.5685 80 50"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Abstract Baby Head */}
        <motion.circle
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          cx="65"
          cy="45"
          r="12"
          fill="currentColor"
          className="opacity-20"
        />
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          d="M65 33C71.6274 33 77 38.3726 77 45C77 51.6274 71.6274 57 65 57C58.3726 57 53 51.6274 53 45"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

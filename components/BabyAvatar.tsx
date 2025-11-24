import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { BabyAvatarConfig } from '../types';

interface BabyAvatarProps {
  config?: BabyAvatarConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
}

export const BabyAvatar: React.FC<BabyAvatarProps> = ({ 
  config = { colorTheme: 'neutral', mood: 'calm' }, 
  size = 'md',
  className = ''
}) => {
  const gradientId = useId();
  
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
    hero: 'w-40 h-40'
  };

  const colorMap = {
    rose: { start: '#FFF1F2', end: '#FECDD3', stroke: '#FDA4AF', accent: '#F43F5E' },     
    blue: { start: '#EFF6FF', end: '#BFDBFE', stroke: '#93C5FD', accent: '#3B82F6' },     
    green: { start: '#F0FDF4', end: '#BBF7D0', stroke: '#86EFAC', accent: '#22C55E' },    
    yellow: { start: '#FEFCE8', end: '#FEF08A', stroke: '#FDE047', accent: '#EAB308' },   
    neutral: { start: '#F8FAFC', end: '#E2E8F0', stroke: '#CBD5E1', accent: '#64748B' },  
  };

  const colors = colorMap[config.colorTheme] || colorMap.neutral;

  const blinkTransition = {
    duration: 4, 
    repeat: Infinity, 
    ease: "easeInOut" as const,
    times: [0, 0.45, 0.5, 0.55, 1] // Blink once in a while
  };

  const renderFace = () => {
    switch (config.mood) {
      case 'sleepy':
        return (
          <g transform="translate(50, 55)">
            {/* Closed Eyes */}
            <path d="M-12 0 Q-8 4 -4 0" stroke={colors.accent} strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M4 0 Q8 4 12 0" stroke={colors.accent} strokeWidth="3" strokeLinecap="round" fill="none" />
            
            {/* Breathing Mouth */}
            <motion.circle 
                cx="0" cy="10" r="2" 
                fill={colors.accent} 
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Zzz floating animation */}
            <motion.path 
                d="M15 -15 L22 -15 L15 -8 L22 -8" 
                stroke={colors.accent} 
                strokeWidth="2" 
                strokeLinecap="round"
                fill="none"
                initial={{ opacity: 0, y: 5, x: 0 }}
                animate={{ opacity: [0, 1, 0], y: [5, -15], x: [0, 10] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeOut" }}
            />
          </g>
        );
      case 'happy':
        return (
          <g transform="translate(50, 55)">
            {/* Happy Eyes - Slight bounce */}
            <motion.g
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <path d="M-14 2 Q-10 -4 -6 2" stroke={colors.accent} strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M6 2 Q10 -4 14 2" stroke={colors.accent} strokeWidth="3" strokeLinecap="round" fill="none" />
            </motion.g>
            
            {/* Big Smile */}
            <path d="M-8 10 Q0 18 8 10" stroke={colors.accent} strokeWidth="3" strokeLinecap="round" fill="none" />
            
            {/* Cheeks */}
            <motion.circle 
                cx="-18" cy="8" r="3" 
                fill={colors.stroke} 
                animate={{ opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
            />
            <motion.circle 
                cx="18" cy="8" r="3" 
                fill={colors.stroke} 
                animate={{ opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
            />
          </g>
        );
      case 'curious':
        return (
          <g transform="translate(50, 55)">
            {/* Wide Eyes - Blinking */}
            <motion.circle 
                cx="-10" cy="0" r="3" 
                fill={colors.accent}
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                transition={blinkTransition}
            />
            <motion.circle 
                cx="10" cy="0" r="3" 
                fill={colors.accent}
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                transition={blinkTransition}
            />
            
            {/* O Mouth */}
            <motion.circle 
                cx="0" cy="12" r="4" 
                stroke={colors.accent} 
                strokeWidth="2.5" 
                fill="none"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </g>
        );
      default: // Calm
        return (
          <g transform="translate(50, 55)">
            {/* Soft Dots - Blinking */}
            <motion.circle 
                cx="-10" cy="0" r="2.5" 
                fill={colors.accent} 
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                transition={blinkTransition}
            />
            <motion.circle 
                cx="10" cy="0" r="2.5" 
                fill={colors.accent}
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                transition={blinkTransition}
            />
            
            {/* Tiny Smile */}
            <path d="M-4 10 Q0 13 4 10" stroke={colors.accent} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        );
    }
  };

  return (
    <div className={`${sizeMap[size]} ${className} relative flex items-center justify-center select-none`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
        <defs>
            <linearGradient id={`gradient-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.start} />
                <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
        </defs>
        
        {/* Soft Glow Background - Breaths gently */}
        <motion.circle 
            cx="50" cy="50" r="45" 
            fill={`url(#gradient-${gradientId})`}
            initial={{ scale: 0.95 }}
            animate={{ scale: [0.95, 1.03, 0.95] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Swaddle / Body Shape */}
        <path d="M50 90 C25 90 20 70 20 50 C20 30 33 15 50 15 C67 15 80 30 80 50 C80 70 75 90 50 90 Z" fill="white" fillOpacity="0.8" />
        
        {/* Face Circle */}
        <motion.circle 
            cx="50" cy="50" r="34" 
            stroke={colors.stroke} 
            strokeWidth="3"
            fill="white"
            initial={{ y: 0 }}
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Little Hair Tuft */}
        <path d="M50 16 Q55 6 62 13" stroke={colors.stroke} strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Render Face Expression */}
        {renderFace()}

      </svg>
    </div>
  );
};
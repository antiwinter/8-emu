'use client';

import React from 'react';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

export const CelebrationModal: React.FC = () => {
  const { state, closeCelebration } = useGame();

  return (
    <AnimatePresence>
      {state.showCelebration && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-void)]/90 backdrop-blur-md"
        >
          {/* Animated Background Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-[var(--color-cyber-yellow)] rounded-full"
                initial={{ 
                  x: '50vw', 
                  y: '50vh',
                  scale: 0,
                  opacity: 1
                }}
                animate={{ 
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              />
            ))}
          </div>
          
          <motion.div 
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative max-w-md w-full mx-4"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-[var(--color-cyber-yellow)] opacity-20 blur-3xl rounded-full" />
            
            {/* Card */}
            <div className="relative glass-panel rounded-2xl overflow-hidden border border-[var(--color-cyber-yellow)]/50 shadow-[0_0_60px_rgba(255,215,0,0.3)]">
              {/* Top Accent */}
              <div className="h-1 bg-gradient-to-r from-[var(--color-cyber-cyan)] via-[var(--color-cyber-yellow)] to-[var(--color-cyber-pink)]" />
              
              <div className="p-8 text-center">
                {/* Icon */}
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-6xl md:text-7xl mb-6"
                >
                  🏆
                </motion.div>
                
                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-black text-[var(--color-cyber-yellow)] glow-text-yellow mb-4 uppercase tracking-wider">
                  Victory!
                </h2>
                
                {/* Message */}
                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  {state.celebrationMessage}
                </p>
                
                {/* Button */}
                <button
                  onClick={closeCelebration}
                  className="cyber-btn text-base px-10"
                >
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

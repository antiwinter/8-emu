'use client';

import React from 'react';
import { useGame } from '../context/GameContext';
import { Player } from '../types/game';
import { motion } from 'framer-motion';

export const StartScreen: React.FC = () => {
  const { state, selectCharacter } = useGame();

  // Filter out ID 4 as requested
  const availablePlayers = state.players.filter(p => p.id !== '4');

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    show: { opacity: 1, y: 0, scale: 1 }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative">
      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[var(--color-cyber-cyan)] opacity-5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-8 md:mb-12 relative z-10"
      >
        <h1 className="text-3xl md:text-5xl font-black text-[var(--color-cyber-cyan)] glow-text-cyan tracking-wider mb-2">
          SELECT FIGHTER
        </h1>
        <div className="flex items-center justify-center gap-4">
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[var(--color-cyber-cyan)]" />
          <p className="text-sm md:text-base text-gray-400 uppercase tracking-[0.3em]">Choose Your Champion</p>
          <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[var(--color-cyber-cyan)]" />
        </div>
      </motion.div>
      
      {/* Character Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 w-full max-w-2xl relative z-10"
      >
        {availablePlayers.map((player: Player) => (
          <CharacterCard key={player.id} player={player} onSelect={selectCharacter} variants={item} />
        ))}
      </motion.div>

      {/* Footer Hint */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-8 text-center text-xs text-gray-500 uppercase tracking-wider"
      >
        Tap to select
      </motion.div>
    </div>
  );
};

interface CharacterCardProps {
  player: Player;
  onSelect: (id: string) => void;
  variants: any;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ player, onSelect, variants }) => {
  return (
    <motion.button
      variants={variants}
      onClick={() => onSelect(player.id)}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      className="group relative flex flex-col overflow-hidden bg-transparent cursor-pointer focus:outline-none"
    >
      {/* Card Frame - Angled */}
      <div className="relative clip-angle-both glass-panel overflow-hidden transition-all duration-300 group-hover:border-[var(--color-cyber-cyan)] group-hover:glow-cyan">
        
        {/* Holographic Shimmer on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cyber-cyan)] via-transparent to-[var(--color-cyber-pink)] opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />
        
        {/* Avatar Container */}
        <div className="relative aspect-square overflow-hidden">
          {/* Decorative Corner Lines */}
          <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-[var(--color-cyber-cyan)] opacity-50 z-10" />
          <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-[var(--color-cyber-cyan)] opacity-50 z-10" />
          <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-[var(--color-cyber-cyan)] opacity-50 z-10" />
          <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-[var(--color-cyber-cyan)] opacity-50 z-10" />
          
          {/* Avatar Image */}
          <img 
            src={`/avatars/${player.id}.jpg`} 
            alt={player.name}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${player.name}&background=0B0E14&color=00F0FF&bold=true`;
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-void)] via-transparent to-transparent" />
        </div>
        
        {/* Name Plate */}
        <div className="relative px-2 py-2 bg-[var(--color-void-dark)]/80">
          <h3 className="text-sm font-bold text-white text-center tracking-wide group-hover:text-[var(--color-cyber-cyan)] transition-colors">
            {player.name}
          </h3>
        </div>
      </div>
      
      {/* Selection Glow Effect */}
      <div className="absolute -inset-1 bg-[var(--color-cyber-cyan)] opacity-0 group-hover:opacity-20 blur-xl transition-opacity pointer-events-none rounded-lg" />
    </motion.button>
  );
};

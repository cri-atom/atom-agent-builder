import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Plus, ChevronRight, Lightbulb } from 'lucide-react';

interface SmartSuggestionsProps {
  suggestions: string[];
  onAddNode: (suggestion: string) => void;
  isOpen: boolean;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ suggestions, onAddNode, isOpen }) => {
  return (
    <AnimatePresence>
      {isOpen && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute left-[var(--spacing-s)] top-[var(--spacing-s)] z-20 w-72 max-w-[min(18rem,calc(100%-var(--spacing-s)*2))]"
        >
          <div className="rounded-3xl border border-border-tertiary bg-bg-primary/90 p-5 shadow-2xl shadow-primary/5 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <h3 className="label font-bold text-fg-primary uppercase tracking-wider">Sugerencias de IA</h3>
            </div>
            
            <div className="space-y-3">
              {suggestions.map((suggestion, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => onAddNode(suggestion)}
                  className="group relative w-full overflow-hidden rounded-2xl border border-transparent bg-bg-secondary p-3 text-left transition-all hover:border-primary/20 hover:bg-bg-primary"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <span className="caption font-semibold text-fg-secondary group-hover:text-fg-primary transition-colors pr-6">
                      {suggestion}
                    </span>
                    <Plus className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity absolute right-0" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border-tertiary">
              <p className="text-[10px] text-fg-tertiary flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                Basado en el contexto actual de tu flujo
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

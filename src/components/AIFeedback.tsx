import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { PromptAnalysis } from '../services/geminiService';

interface AIFeedbackProps {
  analysis: PromptAnalysis | null;
  isAnalyzing: boolean;
}

export const AIFeedback: React.FC<AIFeedbackProps> = ({ analysis, isAnalyzing }) => {
  if (!analysis && !isAnalyzing) return null;

  const getStatusColor = () => {
    if (isAnalyzing) return 'text-primary';
    if (!analysis) return 'text-fg-tertiary';
    switch (analysis.quality) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-red-500';
      default: return 'text-fg-tertiary';
    }
  };

  const getStatusIcon = () => {
    if (isAnalyzing) return <Sparkles className="w-4 h-4 animate-pulse" />;
    if (!analysis) return <Info className="w-4 h-4" />;
    switch (analysis.quality) {
      case 'high': return <CheckCircle2 className="w-4 h-4" />;
      case 'medium': return <AlertCircle className="w-4 h-4" />;
      case 'low': return <AlertCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-border-tertiary shadow-sm"
    >
      <div className={getStatusColor()}>
        {getStatusIcon()}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-fg-secondary">
        {isAnalyzing ? 'Analizando...' : analysis?.quality === 'high' ? 'Prompt Optimizado' : 'Sugerencias de IA'}
      </span>
      
      {analysis && analysis.suggestions.length > 0 && (
        <div className="flex -space-x-1 ml-1">
          {analysis.suggestions.slice(0, 2).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/40 border border-white" />
          ))}
        </div>
      )}
    </motion.div>
  );
};

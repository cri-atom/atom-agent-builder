import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Plus, Trash2, Database, Wrench, MessageSquare, Layout, Phone, ChevronRight, Wand2, Send, Loader2, Sparkles, FileText, MoreVertical, FolderOpen, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AgentNodeData, KnowledgeBaseDoc, Tool } from '../types';
import { Button } from './Button';
import { analyzePrompt, PromptAnalysis } from '../services/geminiService';
import { AIFeedback } from './AIFeedback';

interface PromptEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
  data: AgentNodeData;
  onUpdate: (data: Partial<AgentNodeData>) => void;
  edges: any[];
}

export const PromptEditorModal: React.FC<PromptEditorModalProps> = ({
  isOpen,
  onClose,
  nodeId,
  data,
  onUpdate,
  edges,
}) => {
  const [assistantInput, setAssistantInput] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [mentionMenu, setMentionMenu] = useState<{ isOpen: boolean; x: number; y: number; filter: string } | null>(null);
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Debounced analysis
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (data.instructions && data.instructions.length > 20) {
        setIsAnalyzing(true);
        const result = await analyzePrompt(data.instructions);
        setAnalysis(result);
        setIsAnalyzing(false);
      } else {
        setAnalysis(null);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [data.instructions]);

  const responseFormats = data.responseFormats || [
    { id: 'buttons', name: 'Botones', enabled: false, condition: '' },
    { id: 'cards', name: 'Tarjetas', enabled: false, condition: '' },
    { id: 'carousels', name: 'Carruseles', enabled: false, condition: '' },
  ];

  const handleToggleFormat = (id: string) => {
    const newFormats = responseFormats.map(f => 
      f.id === id ? { ...f, enabled: !f.enabled } : f
    );
    onUpdate({ responseFormats: newFormats });
  };

  const handleConditionChange = (id: string, condition: string) => {
    const newFormats = responseFormats.map(f => 
      f.id === id ? { ...f, condition } : f
    );
    onUpdate({ responseFormats: newFormats });
  };

  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, selectionStart);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

    if (lastAtSymbol !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtSymbol + 1);
      // Check if there's a space after @ or if it's too far back
      if (!textAfterAt.includes(' ') && textAfterAt.length < 20) {
        // Show mention menu
        const coords = getCaretCoordinates(e.target, selectionStart);
        setMentionMenu({
          isOpen: true,
          x: coords.left,
          y: coords.top,
          filter: textAfterAt.toLowerCase()
        });
      } else {
        setMentionMenu(null);
      }
    } else {
      setMentionMenu(null);
    }

    onUpdate({ instructions: value });
  };

  const insertToolMention = (toolName: string) => {
    if (!mentionMenu) return;
    const value = data.instructions || '';
    const selectionStart = value.lastIndexOf('@', value.length); // This is not quite right if they moved cursor
    // Better way: we need to know where the @ was
    const textBeforeAt = value.substring(0, value.lastIndexOf('@', value.indexOf(mentionMenu.filter) || value.length));
    const textAfterAt = value.substring(value.lastIndexOf('@') + mentionMenu.filter.length + 1);
    
    const newValue = textBeforeAt + `[${toolName}] ` + textAfterAt;
    onUpdate({ instructions: newValue });
    setMentionMenu(null);
  };

  // Helper to get caret coordinates
  const getCaretCoordinates = (element: HTMLTextAreaElement, position: number) => {
    const { offsetLeft, offsetTop } = element;
    // This is a simplified version, real one would need a hidden mirror div
    // For now let's just position it relative to the textarea
    return { left: 20, top: 20 }; // Placeholder
  };

  const handleOptimizePrompt = async () => {
    if (!assistantInput.trim()) return;
    setIsOptimizing(true);
    
    // Simulate AI optimization delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const optimizedPrompt = `### Role\nYou are an agent specialized in: ${assistantInput}\n\n### Personality\nYou are professional, helpful, and concise. You always maintain a positive and supportive tone.\n\n### Goals\n1. Understand the user's needs clearly.\n2. Provide accurate and relevant information.\n3. Guide the user towards the next steps in the flow.`;
    
    onUpdate({ instructions: optimizedPrompt });
    setIsOptimizing(false);
    setAssistantInput('');
  };

  return createPortal(
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-bg-primary w-full max-w-6xl h-full max-h-[90vh] rounded-3xl flex flex-col overflow-hidden border border-border-tertiary shadow-2xl shadow-primary/20"
            >
          {/* Header */}
          <div className="px-8 py-6 border-b border-border-tertiary flex items-center justify-between bg-white">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <input
                type="text"
                value={data.label || ''}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="h2 text-fg-primary bg-transparent border-none focus:ring-0 p-0 w-full font-bold"
                placeholder="Nombre del Agente"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-bg-secondary border border-border-tertiary rounded-xl px-3 py-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <select 
                  value={data.llm || 'gemini-pro'}
                  onChange={(e) => onUpdate({ llm: e.target.value })}
                  className="bg-transparent border-none focus:ring-0 caption font-semibold text-fg-primary cursor-pointer"
                >
                  <option value="gemini-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-flash">Gemini 1.5 Flash</option>
                  <option value="gpt-4">GPT-4 Turbo</option>
                </select>
              </div>
              <Button 
                variant="Tertiary" 
                size="s" 
                onClick={onClose}
                className="p-2"
              >
                <X className="w-6 h-6 text-fg-tertiary" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Main Column: Instructions */}
            <div className="flex-1 p-8 overflow-y-auto bg-bg-secondary/30 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="label font-bold text-fg-tertiary uppercase tracking-wider">Instrucciones del Prompt</h3>
                  <AIFeedback analysis={analysis} isAnalyzing={isAnalyzing} />
                </div>
              </div>
              
              <div className="h-[calc(100%-3rem)] relative">
                <textarea
                  value={data.instructions || ''}
                  onChange={handleInstructionsChange}
                  className={`w-full h-full bg-white border rounded-2xl p-6 body text-fg-primary focus:ring-4 focus:ring-primary/5 transition-all resize-none shadow-sm leading-relaxed ${
                    analysis?.quality === 'high' ? 'border-green-200' : 
                    analysis?.quality === 'medium' ? 'border-amber-200' :
                    analysis?.quality === 'low' ? 'border-red-200' : 'border-border-tertiary'
                  }`}
                  placeholder="Escribe aquí las instrucciones detalladas para el comportamiento del agente..."
                />

                <AnimatePresence>
                  {analysis && analysis.suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute -right-4 top-12 w-64 translate-x-full hidden xl:block"
                    >
                      <div className="bg-white border border-border-tertiary rounded-2xl p-4 shadow-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <span className="label-small font-bold text-fg-primary">Sugerencias de IA</span>
                        </div>
                        <ul className="space-y-2">
                          {analysis.suggestions.map((suggestion, i) => (
                            <li key={i} className="flex gap-2 text-[11px] leading-relaxed text-fg-secondary">
                              <span className="text-primary mt-1">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {mentionMenu?.isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-6 top-16 w-64 bg-white border border-border-tertiary rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-2 border-b border-border-tertiary bg-bg-secondary/50 flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5 text-primary" />
                        <span className="label-small font-bold text-fg-tertiary uppercase tracking-wider">Insertar Herramienta</span>
                      </div>
                      <div className="max-h-48 overflow-y-auto p-1">
                        {data.tools?.filter(t => t.name.toLowerCase().includes(mentionMenu.filter)).length > 0 ? (
                          data.tools
                            .filter(t => t.name.toLowerCase().includes(mentionMenu.filter))
                            .map((tool) => (
                              <Button
                                key={tool.id}
                                type="button"
                                variant="Tertiary"
                                size="s"
                                onClick={() => {
                                  const value = data.instructions || '';
                                  const lastAt = value.lastIndexOf('@');
                                  const newValue = value.substring(0, lastAt) + `[${tool.name}] ` + value.substring(lastAt + mentionMenu.filter.length + 1);
                                  onUpdate({ instructions: newValue });
                                  setMentionMenu(null);
                                }}
                                className="group w-full !min-h-0 justify-start rounded-lg border-0 px-3 py-2 font-normal shadow-none hover:bg-bg-secondary"
                                iconLeft={
                                  <div className="rounded-md bg-bg-tertiary p-1.5 transition-colors group-hover:bg-white">
                                    <Wrench className="h-3.5 w-3.5 text-fg-tertiary" />
                                  </div>
                                }
                              >
                                <span className="label font-semibold text-fg-primary">{tool.name}</span>
                              </Button>
                            ))
                        ) : (
                          <div className="p-4 text-center">
                            <p className="caption text-fg-tertiary">No se encontraron herramientas seleccionadas.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Column: AI Assistant & Settings */}
            <div className="w-[400px] p-8 overflow-y-auto space-y-8 bg-white border-l border-border-tertiary">
              {/* AI Assistant Section */}
              <div className="space-y-4 p-5 bg-bg-secondary/50 rounded-2xl border border-border-tertiary">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary" />
                  <h3 className="label font-bold text-fg-primary uppercase tracking-wider">Asistente de IA</h3>
                </div>
                <p className="caption text-fg-tertiary">
                  Describe qué quieres mejorar o añadir al prompt y la IA lo actualizará.
                </p>
                <textarea
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  placeholder="Ej: Haz que sea más amable y pregunte por el presupuesto..."
                  className="w-full bg-white border border-border-tertiary rounded-xl p-4 caption text-fg-primary focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all resize-none h-32"
                />
                <Button 
                  onClick={handleOptimizePrompt}
                  loading={isOptimizing}
                  disabled={!assistantInput.trim()}
                  variant="Primary"
                  size="m"
                  className="w-full"
                  iconLeft={<Sparkles size={16} />}
                >
                  Refinar Prompt
                </Button>
              </div>
              {/* Response Format Section */}
              <div className="space-y-4">
                <h3 className="label font-bold text-fg-tertiary uppercase tracking-wider">Formato de respuesta</h3>
                <div className="space-y-4">
                  {responseFormats.map((item) => (
                    <div key={item.id} className="space-y-3 p-4 bg-bg-secondary rounded-2xl border border-border-tertiary">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layout className="w-4 h-4 text-fg-tertiary" />
                          <span className="label font-bold text-fg-primary">{item.name}</span>
                        </div>
                        <div 
                          onClick={() => handleToggleFormat(item.id)}
                          className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${item.enabled ? 'bg-primary' : 'bg-bg-tertiary'}`}
                        >
                          <motion.div 
                            animate={{ x: item.enabled ? 20 : 2 }}
                            className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm" 
                          />
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {item.enabled && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden space-y-2"
                          >
                            <p className="caption text-fg-tertiary">¿En qué caso debe el formato de respuesta ser {item.name.toLowerCase()}?</p>
                            <textarea
                              value={item.condition}
                              onChange={(e) => handleConditionChange(item.id, e.target.value)}
                              placeholder="Ej: Cuando el usuario pida ver los planes disponibles..."
                              className="w-full bg-white border border-border-tertiary rounded-xl p-3 caption text-fg-primary focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all resize-none h-20"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>,
    document.body
  );
};

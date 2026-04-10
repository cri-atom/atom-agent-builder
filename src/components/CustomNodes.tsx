import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Play, Bot, CheckCircle2, AlertCircle, Wrench, Database, Save, Plus, Trash2, User, Check, MessageSquare, Copy, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useFlowContext } from '../context/FlowContext';
import { Button } from './Button';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const StartNode = memo(({ id, data, selected }: any) => {
  const [showMenu, setShowMenu] = useState(false);
  const { onAddNode, edges } = useFlowContext();
  const hasConnection = edges.some(e => e.source === id);

  return (
    <div className="relative group cursor-pointer">
      <div className={cn(
        "bg-white border rounded-full px-4 py-2 min-w-[100px] flex items-center justify-center gap-2 transition-all relative",
        selected ? "border-primary ring-1 ring-primary" : "border-border-tertiary"
      )}>
        <MessageSquare className="w-3.5 h-3.5 text-fg-tertiary" />
        <p className="label font-semibold text-fg-primary">Inicio</p>
        <Handle type="source" position={Position.Bottom} className="!bg-border-tertiary !w-2 !h-2 !-bottom-1" />
      </div>
      
      {!hasConnection && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full z-30">
          {!showMenu ? (
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMenu(true); }}
              className="w-7 h-7 rounded-full bg-white border border-border-tertiary text-fg-tertiary flex items-center justify-center shadow-md hover:scale-110 transition-transform hover:text-fg-primary hover:border-primary/50"
            >
              <Plus className="w-4 h-4" />
            </button>
          ) : (
            <div className="bg-bg-primary border border-border-tertiary rounded-xl shadow-xl p-1 flex flex-col gap-1 animate-in fade-in zoom-in duration-200 min-w-[90px]">
              <Button
                type="button"
                variant="Tertiary"
                size="xs"
                onClick={(e) => { e.stopPropagation(); onAddNode('agent', id); setShowMenu(false); }}
                className="group/item w-full !min-h-0 justify-start rounded-lg border-0 px-2 py-1.5 font-normal shadow-none hover:bg-bg-secondary"
                iconLeft={
                  <Bot className="h-3.5 w-3.5 text-fg-tertiary transition-colors group-hover/item:text-primary" />
                }
              >
                <span className="label-small font-semibold text-fg-tertiary transition-colors group-hover/item:text-fg-primary">
                  Agente
                </span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export const AgentNode = memo(({ id, data, selected }: any) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { onAddNode, onDeleteNode, onDuplicateNode } = useFlowContext();
  const hasError = !data.instructions;
  const isOptimized = data.instructions && data.instructions.includes('### Role');

  return (
    <motion.div 
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Node Actions */}
      <AnimatePresence>
        {selected && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute -right-12 top-0 flex flex-col gap-2 z-50"
          >
            <button 
              onClick={(e) => { e.stopPropagation(); onDuplicateNode(id); }}
              className="w-9 h-9 bg-white border border-border-tertiary rounded-xl flex items-center justify-center text-fg-tertiary shadow-lg hover:text-primary hover:scale-110 transition-all"
              title="Duplicar"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteNode(id, 'node'); }}
              className="w-9 h-9 bg-white border border-border-tertiary rounded-xl flex items-center justify-center text-fg-tertiary shadow-lg hover:text-fg-status-error hover:scale-110 transition-all"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn(
        "bg-white border rounded-2xl p-4 min-w-[240px] transition-all relative overflow-hidden",
        selected ? "border-primary ring-4 ring-primary/5" : "border-border-tertiary shadow-sm",
        hasError && "border-fg-status-error/50 ring-4 ring-fg-status-error/5",
        isOptimized && "border-primary/30"
      )}>
        {/* Subtle AI Glow if optimized */}
        {isOptimized && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 animate-pulse" />
        )}

        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center border transition-colors",
              isOptimized ? "bg-primary/5 border-primary/20" : "bg-bg-secondary border-border-tertiary"
            )}>
              <Bot className={cn("w-5 h-5", isOptimized ? "text-primary" : "text-fg-tertiary")} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="caption font-bold text-fg-primary leading-tight">{data.label || 'Nuevo Agente'}</p>
                {isOptimized && <Sparkles className="w-3 h-3 text-primary animate-pulse" />}
              </div>
              <p className="label-small text-fg-tertiary mt-0.5 line-clamp-2 max-w-[140px]">
                {data.instructions || 'Añade las instrucciones para el agente.'}
              </p>
            </div>
          </div>
          {hasError ? (
            <div className="bg-fg-status-error w-5 h-5 rounded-full flex items-center justify-center">
              <AlertCircle className="w-3 h-3 text-white" />
            </div>
          ) : isOptimized && (
            <div className="bg-primary/10 px-1.5 py-0.5 rounded-md">
              <span className="text-[8px] font-bold text-primary uppercase tracking-tighter">IA OK</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-4 pt-3 border-t border-border-tertiary/50">
          <div className="flex items-center gap-1.5 text-fg-tertiary">
            <Wrench className="w-3.5 h-3.5" />
            <span className="label-small font-medium">+{data.tools?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-fg-tertiary">
            <Database className="w-3.5 h-3.5" />
            <span className="label-small font-medium">+{data.knowledgeBase?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-fg-tertiary">
            <Save className="w-3.5 h-3.5" />
            <span className="label-small font-medium">+{data.saveFields?.length || 0}</span>
          </div>
        </div>

        <Handle type="target" position={Position.Top} className="!bg-border-tertiary !w-2 !h-2 !-top-1" />
        <Handle type="source" position={Position.Bottom} className="!bg-border-tertiary !w-2 !h-2 !-bottom-1" />
      </div>

      <AnimatePresence>
        {isHovered && !showMenu && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full z-30"
          >
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMenu(true); }}
              className="w-7 h-7 rounded-full bg-white border border-border-tertiary text-fg-tertiary flex items-center justify-center shadow-md hover:scale-110 transition-transform hover:text-fg-primary hover:border-primary/50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMenu && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full z-30 bg-bg-primary border border-border-tertiary rounded-xl shadow-xl p-1 flex flex-col gap-1 min-w-[90px]"
          >
            <Button
              type="button"
              variant="Tertiary"
              size="xs"
              onClick={(e) => { e.stopPropagation(); onAddNode('agent', id); setShowMenu(false); }}
              className="group/item w-full !min-h-0 justify-start rounded-lg border-0 px-2 py-1.5 font-normal shadow-none hover:bg-bg-secondary"
              iconLeft={
                <Bot className="h-3.5 w-3.5 text-fg-tertiary transition-colors group-hover/item:text-primary" />
              }
            >
              <span className="label-small font-semibold text-fg-tertiary transition-colors group-hover/item:text-fg-primary">
                Agente
              </span>
            </Button>
            <div className="h-px bg-border-tertiary mx-1" />
            <Button
              type="button"
              variant="Tertiary"
              size="xs"
              onClick={(e) => { e.stopPropagation(); onAddNode('end', id); setShowMenu(false); }}
              className="group/item w-full !min-h-0 justify-start rounded-lg border-0 px-2 py-1.5 font-normal shadow-none hover:bg-bg-secondary"
              iconLeft={
                <CheckCircle2 className="h-3.5 w-3.5 text-fg-tertiary transition-colors group-hover/item:text-fg-primary" />
              }
            >
              <span className="label-small font-semibold text-fg-tertiary transition-colors group-hover/item:text-fg-primary">
                Fin
              </span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export const EndNode = memo(({ id, data, selected }: any) => {
  const { onDeleteNode, onDuplicateNode } = useFlowContext();
  return (
    <div className="relative group cursor-pointer">
      {/* Node Actions */}
      {selected && (
        <div className="absolute -right-12 top-0 flex flex-col gap-2 z-50">
          <button 
            onClick={(e) => { e.stopPropagation(); onDuplicateNode(id); }}
            className="w-9 h-9 bg-white border border-border-tertiary rounded-xl flex items-center justify-center text-fg-tertiary shadow-lg hover:text-primary hover:scale-110 transition-all"
            title="Duplicar"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDeleteNode(id, 'node'); }}
            className="w-9 h-9 bg-white border border-border-tertiary rounded-xl flex items-center justify-center text-fg-tertiary shadow-lg hover:text-fg-status-error hover:scale-110 transition-all"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className={cn(
        "bg-white border rounded-full px-6 py-3 min-w-[140px] flex items-center justify-center gap-2 transition-all relative",
        selected ? "border-primary ring-1 ring-primary hover:border-primary/50" : "border-border-tertiary hover:border-primary/50"
      )}>
        <CheckCircle2 className="w-4 h-4 text-fg-tertiary" />
        <p className="label font-bold text-fg-primary">{data.label || 'Fin'}</p>
        <Handle type="target" position={Position.Top} className="!bg-border-tertiary !w-2 !h-2 !-top-1" />
      </div>
    </div>
  );
});

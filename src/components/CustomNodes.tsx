import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Play, Bot, CheckCircle2, AlertCircle, Wrench, Database, Save, Plus, Trash2, User, Check, MessageSquare, Copy } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useFlowContext } from '../context/FlowContext';

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
              <button 
                onClick={(e) => { e.stopPropagation(); onAddNode('agent', id); setShowMenu(false); }}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-bg-secondary rounded-lg transition-all text-fg-tertiary hover:text-fg-primary group/item"
              >
                <Bot className="w-3.5 h-3.5 text-fg-tertiary group-hover/item:text-primary transition-colors" />
                <span className="label-small font-semibold text-fg-tertiary group-hover/item:text-fg-primary">Agente</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export const AgentNode = memo(({ id, data, selected }: any) => {
  const [showMenu, setShowMenu] = useState(false);
  const { onAddNode, onDeleteNode, onDuplicateNode } = useFlowContext();
  const hasError = !data.instructions;
  
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
        "bg-white border rounded-2xl p-4 min-w-[240px] transition-all relative",
        selected ? "border-primary ring-1 ring-primary" : "border-border-tertiary",
        hasError && "border-fg-status-error"
      )}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center border border-border-tertiary">
              <Bot className="w-5 h-5 text-fg-tertiary" />
            </div>
            <div>
              <p className="caption font-bold text-fg-primary leading-tight">{data.label || 'Nuevo Agente'}</p>
              <p className="label-small text-fg-tertiary mt-0.5 line-clamp-2 max-w-[140px]">
                {data.instructions || 'Añade las instrucciones para el agente.'}
              </p>
            </div>
          </div>
          {hasError && (
            <div className="bg-fg-status-error w-5 h-5 rounded-full flex items-center justify-center">
              <AlertCircle className="w-3 h-3 text-white" />
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
            <button 
              onClick={(e) => { e.stopPropagation(); onAddNode('agent', id); setShowMenu(false); }}
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-bg-secondary rounded-lg transition-all text-fg-tertiary hover:text-fg-primary group/item"
            >
              <Bot className="w-3.5 h-3.5 text-fg-tertiary group-hover/item:text-primary transition-colors" />
              <span className="label-small font-semibold text-fg-tertiary group-hover/item:text-fg-primary">Agente</span>
            </button>
            <div className="h-px bg-border-tertiary mx-1" />
            <button 
              onClick={(e) => { e.stopPropagation(); onAddNode('end', id); setShowMenu(false); }}
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-bg-secondary rounded-lg transition-all text-fg-tertiary hover:text-fg-primary group/item"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-fg-tertiary group-hover/item:text-fg-primary transition-colors" />
              <span className="label-small font-semibold text-fg-tertiary group-hover/item:text-fg-primary">Fin</span>
            </button>
          </div>
        )}
      </div>
    </div>
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

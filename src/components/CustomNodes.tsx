import React, { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Bot, Wrench, Database, Save, Plus, Trash2, Copy, Sparkles, Flag, GitBranch } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useFlowContext } from '../context/FlowContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const StartNode = memo(({ id, data, selected }: any) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const { onAddNode, edges } = useFlowContext();
  const hasConnection = edges.some(e => e.source === id);
  const emphasized = selected || isHovered;

  useEffect(() => {
    if (!showMenu) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!addMenuRef.current?.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown, true);
    return () => document.removeEventListener('mousedown', onPointerDown, true);
  }, [showMenu]);

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          'flow-canvas-node__surface relative flex min-w-[7.5rem] flex-col items-stretch',
          emphasized && 'flow-canvas-node__surface--emphasized'
        )}
      >
        <div className="flex items-center gap-[var(--spacing-m)] py-[var(--spacing-sm)] pl-[var(--spacing-m)] pr-[var(--spacing-sm)]">
          <Flag className="h-4 w-4 shrink-0 text-fg-quaternary" aria-hidden />
          <p className="caption font-medium text-fg-primary">Inicio</p>
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-border-tertiary !h-2 !w-2 !-bottom-1"
        />
      </div>

      {!hasConnection && (
        <div
          ref={addMenuRef}
          className="absolute left-1/2 top-full z-30 mt-2 flex -translate-x-1/2 flex-col items-center gap-[var(--spacing-s)]"
        >
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setShowMenu(open => !open);
            }}
            className="flow-canvas-icon-btn"
            title="Añadir nodo"
            aria-expanded={showMenu}
          >
            <Plus className="h-4 w-4" aria-hidden />
          </button>
          <AnimatePresence>
            {showMenu ? (
              <motion.div
                key="start-add-menu"
                initial={{ opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 6 }}
                className="flow-canvas-add-menu flex flex-col gap-[var(--spacing-s)]"
                onClick={e => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="flow-canvas-add-menu__item"
                  onClick={e => {
                    e.stopPropagation();
                    onAddNode('agent', id);
                    setShowMenu(false);
                  }}
                >
                  <span className="flow-canvas-add-menu__icon">
                    <Bot className="h-3 w-3 text-fg-quaternary" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="label font-medium text-fg-primary block leading-[var(--line-height-label)]">
                      Agente
                    </span>
                    <span className="mt-0.5 block text-[length:var(--font-size-label-small)] font-normal leading-[var(--line-height-label-small)] text-fg-secondary">
                      Añade un agente conversacional
                    </span>
                  </span>
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
});

function AgentAddMenu({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { onAddNode } = useFlowContext();
  return (
    <div
      className="flow-canvas-add-menu flex flex-col gap-[var(--spacing-s)]"
      onClick={e => e.stopPropagation()}
    >
      <button
        type="button"
        className="flow-canvas-add-menu__item"
        onClick={e => {
          e.stopPropagation();
          onAddNode('agent', id);
          onClose();
        }}
      >
        <span className="flow-canvas-add-menu__icon">
          <Bot className="h-3 w-3 text-fg-quaternary" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="label font-medium text-fg-primary block leading-[var(--line-height-label)]">Agente</span>
          <span className="mt-0.5 block text-[length:var(--font-size-label-small)] font-normal leading-[var(--line-height-label-small)] text-fg-secondary">
            Añade un agente conversacional
          </span>
        </span>
      </button>
      <div className="flow-canvas-add-menu__item flow-canvas-add-menu__item--disabled" aria-disabled>
        <span className="flow-canvas-add-menu__icon">
          <Wrench className="h-3 w-3 text-fg-quaternary" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flow-canvas-add-menu__title-row">
            <span className="label font-medium text-fg-primary leading-[var(--line-height-label)]">Herramienta</span>
            <span className="flow-canvas-tag-soon">Pronto</span>
          </span>
          <span className="mt-0.5 block text-[length:var(--font-size-label-small)] font-normal leading-[var(--line-height-label-small)] text-fg-secondary">
            Envía a una herramienta externa
          </span>
        </span>
      </div>
      <button
        type="button"
        className="flow-canvas-add-menu__item"
        onClick={e => {
          e.stopPropagation();
          onAddNode('end', id);
          onClose();
        }}
      >
        <span className="flow-canvas-add-menu__icon">
          <Flag className="h-3 w-3 text-fg-quaternary" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="label font-medium text-fg-primary block leading-[var(--line-height-label)]">Fin</span>
          <span className="mt-0.5 block text-[length:var(--font-size-label-small)] font-normal leading-[var(--line-height-label-small)] text-fg-secondary">
            Finaliza la conversación
          </span>
        </span>
      </button>
    </div>
  );
}

export const AgentNode = memo(({ id, data, selected }: any) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { onDeleteNode, onDuplicateNode } = useFlowContext();
  const hasError = !data.instructions;
  const isOptimized = data.instructions && data.instructions.includes('### Role');
  const emphasized = !hasError && (isHovered || selected);
  const showNodeActions = selected || isHovered;

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {showNodeActions && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute -right-10 top-0 z-50 flex flex-col gap-2"
          >
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onDuplicateNode(id);
              }}
              className="flow-canvas-icon-btn"
              title="Duplicar"
            >
              <Copy className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onDeleteNode(id, 'node');
              }}
              className="flow-canvas-icon-btn flow-canvas-icon-btn--danger"
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          'flow-canvas-node__surface relative flex w-[300px] flex-col',
          hasError && 'flow-canvas-node__surface--error',
          emphasized && 'flow-canvas-node__surface--emphasized'
        )}
      >
        {isOptimized && (
          <div
            className="pointer-events-none absolute left-0 right-0 top-0 z-[1] h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 animate-pulse"
            aria-hidden
          />
        )}

        <div className="relative z-[2] flex w-full items-start gap-[var(--spacing-m)] py-[var(--spacing-sm)] pl-[var(--spacing-m)] pr-[var(--spacing-xs)]">
          <div
            className={cn(
              'flow-canvas-node__avatar',
              isOptimized && !hasError && 'flow-canvas-node__avatar--optimized'
            )}
          >
            <Bot
              className={cn('h-5 w-5', isOptimized && !hasError ? 'text-primary' : 'text-fg-quaternary')}
              aria-hidden
            />
            {hasError ? <span className="flow-canvas-node__avatar-dot" aria-hidden /> : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="caption font-bold leading-tight text-fg-primary">
                {data.label || 'Nuevo Agente'}
              </p>
              {isOptimized && !hasError ? <Sparkles className="h-3 w-3 shrink-0 animate-pulse text-primary" aria-hidden /> : null}
            </div>
            <p className="label mt-0.5 line-clamp-2 text-fg-secondary">
              {data.instructions || 'Añade instrucciones para el agente'}
            </p>
          </div>
          {!hasError && isOptimized ? (
            <div className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5">
              <span className="text-[8px] font-bold uppercase tracking-tighter text-primary">IA OK</span>
            </div>
          ) : null}
        </div>

        <div className="relative z-[2] flex flex-wrap gap-[var(--spacing-xs)] px-[var(--spacing-sm)] py-[var(--spacing-s)]">
          <span className="flow-canvas-tag-filled-neutral">
            <Wrench className="h-4 w-4 shrink-0" aria-hidden />
            +{data.tools?.length || 0}
          </span>
          <span className="flow-canvas-tag-filled-neutral">
            <Database className="h-4 w-4 shrink-0" aria-hidden />
            +{data.knowledgeBase?.length || 0}
          </span>
          <span className="flow-canvas-tag-filled-neutral">
            <Save className="h-4 w-4 shrink-0" aria-hidden />
            +{data.saveFields?.length || 0}
          </span>
        </div>

        <Handle type="target" position={Position.Top} className="!bg-border-tertiary !h-2 !w-2 !-top-1" />
        <Handle type="source" position={Position.Bottom} className="!bg-border-tertiary !h-2 !w-2 !-bottom-1" />
      </div>

      <AnimatePresence>
        {isHovered && !showMenu ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -bottom-2 left-1/2 z-30 flex -translate-x-1/2 translate-y-full flex-col items-center gap-[var(--spacing-s)]"
          >
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setShowMenu(true);
              }}
              className="flow-canvas-icon-btn"
              title="Añadir nodo"
            >
              <Plus className="h-4 w-4" aria-hidden />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showMenu ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="absolute -bottom-2 left-1/2 z-30 flex -translate-x-1/2 translate-y-full flex-col items-center"
          >
            <AgentAddMenu id={id} onClose={() => setShowMenu(false)} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
});

export const EndNode = memo(({ id, selected }: any) => {
  const { onDeleteNode, onDuplicateNode } = useFlowContext();
  const [isHovered, setIsHovered] = useState(false);
  const emphasized = selected || isHovered;
  const showNodeActions = selected || isHovered;

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {showNodeActions ? (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute -right-10 top-0 z-50 flex flex-col gap-2"
          >
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onDuplicateNode(id);
              }}
              className="flow-canvas-icon-btn"
              title="Duplicar"
            >
              <Copy className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onDeleteNode(id, 'node');
              }}
              className="flow-canvas-icon-btn flow-canvas-icon-btn--danger"
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div
        className={cn(
          'flow-canvas-node__surface relative flex min-w-[10rem] flex-col',
          emphasized && 'flow-canvas-node__surface--emphasized'
        )}
      >
        <div className="flex items-center gap-[var(--spacing-m)] py-[var(--spacing-sm)] pl-[var(--spacing-m)] pr-[var(--spacing-sm)]">
          <Flag className="h-4 w-4 shrink-0 text-fg-quaternary" aria-hidden />
          <p className="caption font-medium text-fg-primary">Fin</p>
        </div>
        <Handle type="target" position={Position.Top} className="!bg-border-tertiary !h-2 !w-2 !-top-1" />
      </div>
    </div>
  );
});

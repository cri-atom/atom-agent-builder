import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface GlobalConfigOpenButtonProps {
  onClick: () => void;
  className?: string;
}

export function GlobalConfigOpenButton({ onClick, className }: GlobalConfigOpenButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Abrir configuración global"
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-s)] bg-bg-inverse-primary text-fg-inverse-primary shadow-md transition-colors hover:bg-bg-inverse-secondary',
        className
      )}
    >
      <Plus className="size-4" strokeWidth={2.5} />
    </button>
  );
}

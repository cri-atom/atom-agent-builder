import React from 'react';
import { cn } from '../../lib/utils';

export type PipelineKind = 'venta' | 'servicio';

export interface PipelineTypeTabsProps {
  value: PipelineKind;
  onChange: (value: PipelineKind) => void;
  className?: string;
}

export function PipelineTypeTabs({ value, onChange, className }: PipelineTypeTabsProps) {
  const items: { id: PipelineKind; label: string }[] = [
    { id: 'venta', label: 'Venta' },
    { id: 'servicio', label: 'Servicio' },
  ];

  return (
    <div className={cn('flex w-full gap-2', className)} role="tablist">
      {items.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={value === id}
          onClick={() => onChange(id)}
          className={cn(
            'flex min-h-8 flex-1 items-center justify-center rounded-[var(--radius-s)] px-3 py-2 label font-medium transition-colors',
            value === id
              ? 'bg-bg-tertiary text-fg-primary'
              : 'text-fg-quaternary hover:text-fg-secondary'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

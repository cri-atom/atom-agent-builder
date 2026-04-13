import React from 'react';
import { cn } from '../../lib/utils';

export interface PanelEmptyStateProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PanelEmptyState({ icon, children, className }: PanelEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 py-[var(--spacing-m)] text-center',
        className
      )}
    >
      <div className="flex size-8 items-center justify-center rounded-[var(--radius-s)] bg-bg-quaternary text-fg-secondary">
        {icon}
      </div>
      <p className="w-full label font-normal text-fg-quaternary">{children}</p>
    </div>
  );
}

import React from 'react';
import { cn } from '../../lib/utils';

export interface PanelSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  /** Extra classes for the inner content wrapper */
  contentClassName?: string;
}

export function PanelSection({ title, children, className, contentClassName }: PanelSectionProps) {
  return (
    <section className={cn('border-b border-border-tertiary', className)}>
      <div className="flex min-h-[34px] items-center px-[var(--spacing-m)] py-[var(--spacing-s)]">
        <h3 className="label font-medium text-fg-primary">{title}</h3>
      </div>
      <div className={cn('px-[var(--spacing-m)] py-[var(--spacing-s)]', contentClassName)}>{children}</div>
    </section>
  );
}

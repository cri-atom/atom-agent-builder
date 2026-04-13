import React from 'react';
import { cn } from '../../lib/utils';

export interface InspectorTabItem {
  id: string;
  label: string;
}

export interface InspectorTabsProps {
  tabs: InspectorTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function InspectorTabs({ tabs, activeId, onChange, className }: InspectorTabsProps) {
  return (
    <div
      className={cn(
        'flex gap-6 border-b border-border-tertiary px-[var(--spacing-m)] pt-3',
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const active = activeId === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              '-mb-px flex min-h-8 items-end border-b-2 pb-3 pt-1 label font-medium transition-colors',
              active
                ? 'border-fg-primary text-fg-primary'
                : 'border-transparent text-fg-quaternary hover:text-fg-primary'
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

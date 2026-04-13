import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CollapsibleSectionHeaderProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  iconLeft?: React.ReactNode;
  /** When nested inside a padded section, skip horizontal padding */
  flush?: boolean;
}

export function CollapsibleSectionHeader({
  title,
  isOpen,
  onToggle,
  className,
  iconLeft,
  flush,
}: CollapsibleSectionHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex w-full items-center justify-between gap-2 py-[var(--spacing-s)] text-left transition-colors hover:bg-bg-secondary/60',
        flush ? 'px-0' : 'px-[var(--spacing-m)]',
        className
      )}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2">
        {iconLeft}
        <span className="label font-medium text-fg-primary">{title}</span>
      </span>
      {isOpen ? (
        <ChevronUp className="size-4 shrink-0 text-fg-quaternary" aria-hidden />
      ) : (
        <ChevronDown className="size-4 shrink-0 text-fg-quaternary" aria-hidden />
      )}
    </button>
  );
}

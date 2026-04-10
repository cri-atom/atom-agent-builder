import React, { ReactNode } from 'react';
import { cn } from '../lib/utils';

export type ButtonVariant = 
  | 'Primary' 
  | 'Secondary' 
  | 'Tertiary' 
  | 'Destructive Primary' 
  | 'Destructive Secondary' 
  | 'Destructive Tertiary';

export type ButtonSize = 'xs' | 's' | 'm' | 'l' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children: ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ 
    variant = 'Primary', 
    size = 'm', 
    href, 
    loading = false, 
    disabled = false, 
    iconLeft, 
    iconRight, 
    children, 
    className,
    type = 'button',
    ...props 
  }, ref) => {
    const isLink = !!href;
    const Tag = isLink ? 'a' : 'button';
    
    const variantClass = variant.toLowerCase().replace(' ', '--');
    const sizeClass = `button--${size}`;
    
    const baseClasses = cn(
      'button',
      `button--${variant.toLowerCase().replace(' ', '-')}`,
      sizeClass,
      loading && 'button--loading',
      className
    );

    const content = (
      <>
        {loading ? (
          <span className="button__loading-content">
            <span className="button__loading-text" data-shimmer>Cargando...</span>
            <span className="button__spinner" data-button-spinner></span>
          </span>
        ) : (
          <span className="button__label-wrap">
            {/* Original label */}
            <span className="button__label" data-button-label>
              {iconLeft && <span className="button__icon" data-icon-left>{iconLeft}</span>}
              {children}
              {iconRight && <span className="button__icon" data-icon-right>{iconRight}</span>}
            </span>
            {/* Clone label (for animation, hidden by default) */}
            <span className="button__label button__label--clone" data-button-label-clone aria-hidden="true">
              {iconLeft && <span className="button__icon">{iconLeft}</span>}
              {children}
              {iconRight && <span className="button__icon">{iconRight}</span>}
            </span>
          </span>
        )}
      </>
    );

    if (isLink) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={baseClasses}
          data-button
          data-hover-rotate
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type as 'button' | 'submit' | 'reset'}
        disabled={disabled || loading}
        className={baseClasses}
        data-button
        data-hover-rotate
        aria-disabled={disabled || loading}
        aria-busy={loading}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

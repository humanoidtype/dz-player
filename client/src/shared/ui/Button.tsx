// client/src/shared/ui/Button.tsx
import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  as?: 'button' | 'a' | 'div';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled,
  className,
  as = 'button',
}) => {
  const commonClasses = `
    inline-flex items-center justify-center rounded-md text-sm font-medium
    transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
    disabled:opacity-50 cursor-not-allowed
  `;

  if (as === 'button') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${commonClasses}${className || ''}`}
      >
        {children}
      </button>
    );
  }

  if (as === 'a') {
    return (
      <a
        onClick={onClick}
        className={`${commonClasses}${className || ''}`}
        href="#"
      >
        {children}
      </a>
    );
  }

  // as === 'div'
  return (
    <div
      onClick={onClick}
      className={`${commonClasses}${className || ''}`}
    >
      {children}
    </div>
  );
};
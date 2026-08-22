// client/src/shared/ui/BottomSheet.tsx
import React from 'react';
import { Button } from './Button';

export interface BottomSheetProps {
  children: React.ReactNode;
  onDismiss?: () => void;
  title?: string;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  onDismiss,
  title,
  className,
}) => {
  const baseClasses = 'bg-surface rounded-xl overflow-hidden shadow-lg';
  const extraClasses = className ? ` ${className}` : '';

  return (
    <div className={baseClasses + extraClasses}>
      <div className="p-4 border-b border-border">
        {title && <h3 className="font-semibold text-text-primary">{title}</h3>}
        {onDismiss && (
          <Button
            onClick={onDismiss}
            className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary"
          >
            ×
          </Button>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};
// client/src/shared/ui/Marquee.tsx
import React from 'react';
import type { CSSProperties } from 'react';

export const Marquee: React.FC<{ className?: string; style?: CSSProperties }> = ({
  className,
  style,
}) => {
  const marqueeStyle: CSSProperties = {
    ...style,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  };
  const innerStyle: CSSProperties = {
    display: 'inline-block',
    animation: 'marquee 20s linear infinite',
    paddingLeft: '20px',
  };

  return (
    <div className={className} style={marqueeStyle}>
      <div style={innerStyle}></div>
    </div>
  );
};
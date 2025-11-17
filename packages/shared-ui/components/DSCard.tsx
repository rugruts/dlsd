/**
 * DumpSack Card Component
 * Dark green background with thick lighter green border
 * Rounded corners with subtle drop shadow
 */

import React from 'react';
import { DumpSackTheme } from '../theme';

export interface DSCardProps {
  children: React.ReactNode;
  padding?: keyof typeof DumpSackTheme.spacing;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  hoverable?: boolean;
}

export const DSCard: React.FC<DSCardProps> = ({
  children,
  padding = 'md',
  onClick,
  className = '',
  style = {},
  hoverable = false,
}) => {
  const cardStyles: React.CSSProperties = {
    backgroundColor: DumpSackTheme.colors.card,
    border: `${DumpSackTheme.borderWidth.thick}px solid ${DumpSackTheme.colors.furGreen}`,
    borderRadius: DumpSackTheme.borderRadius.md,
    padding: DumpSackTheme.spacing[padding],
    boxShadow: DumpSackTheme.shadows.md,
    cursor: onClick ? 'pointer' : 'default',
    transition: `all ${DumpSackTheme.animation.duration.normal}ms ${DumpSackTheme.animation.easing.easeInOut}`,
  };

  return (
    <div
      onClick={onClick}
      className={`ds-card ${hoverable ? 'ds-card-hoverable' : ''} ${className}`}
      style={{ ...cardStyles, ...style }}
    >
      {children}
    </div>
  );
};

// Web-specific hover styles
export const DSCardWebStyles = `
  .ds-card-hoverable:hover {
    transform: translateY(-2px);
    box-shadow: ${DumpSackTheme.shadows.lg};
    border-color: ${DumpSackTheme.colors.eyebrowOrange};
  }
`;


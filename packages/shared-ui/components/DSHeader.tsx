/**
 * DumpSack Header Component
 * Consistent header with mascot logo
 */

import React from 'react';
import { DumpSackTheme } from '../theme';
import { DSIcon, IconName } from '../icons';

export interface DSHeaderProps {
  title?: string;
  showLogo?: boolean;
  leftAction?: {
    icon: IconName;
    onPress: () => void;
  };
  rightAction?: {
    icon: IconName;
    onPress: () => void;
  };
  className?: string;
  style?: React.CSSProperties;
}

export const DSHeader: React.FC<DSHeaderProps> = ({
  title,
  showLogo = true,
  leftAction,
  rightAction,
  className = '',
  style = {},
}) => {
  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${DumpSackTheme.spacing.md}px ${DumpSackTheme.spacing.lg}px`,
    backgroundColor: DumpSackTheme.colors.surface,
    borderBottom: `${DumpSackTheme.borderWidth.thick}px solid ${DumpSackTheme.colors.furGreen}`,
  };

  const logoStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: DumpSackTheme.spacing.sm,
  };

  const logoIconStyles: React.CSSProperties = {
    width: 32,
    height: 32,
    backgroundColor: DumpSackTheme.colors.eyebrowOrange,
    borderRadius: DumpSackTheme.borderRadius.sm,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: DumpSackTheme.typography.fontSize.lg,
    fontWeight: DumpSackTheme.typography.fontWeight.bold,
    color: DumpSackTheme.colors.text,
    fontFamily: DumpSackTheme.typography.fontFamily.primary,
  };

  const actionButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: DumpSackTheme.spacing.xs,
    color: DumpSackTheme.colors.text,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <header className={className} style={{ ...headerStyles, ...style }}>
      <div style={{ width: 40 }}>
        {leftAction && (
          <button onClick={leftAction.onPress} style={actionButtonStyles}>
            <DSIcon name={leftAction.icon} size={24} />
          </button>
        )}
      </div>

      <div style={logoStyles}>
        {showLogo && (
          <div style={logoIconStyles}>
            <DSIcon name="mascot" size={20} color={DumpSackTheme.colors.boneWhite} />
          </div>
        )}
        {title && <span style={titleStyles}>{title}</span>}
      </div>

      <div style={{ width: 40 }}>
        {rightAction && (
          <button onClick={rightAction.onPress} style={actionButtonStyles}>
            <DSIcon name={rightAction.icon} size={24} />
          </button>
        )}
      </div>
    </header>
  );
};


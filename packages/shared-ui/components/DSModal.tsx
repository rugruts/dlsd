/**
 * DumpSack Modal Component
 * Overlay modal with DumpSack styling
 */

import React from 'react';
import { DumpSackTheme } from '../theme';
import { DSIcon } from '../icons';

export interface DSModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const DSModal: React.FC<DSModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  className = '',
  style = {},
}) => {
  if (!visible) return null;

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: DumpSackTheme.colors.overlay,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalStyles: React.CSSProperties = {
    backgroundColor: DumpSackTheme.colors.card,
    border: `${DumpSackTheme.borderWidth.thick}px solid ${DumpSackTheme.colors.furGreen}`,
    borderRadius: DumpSackTheme.borderRadius.lg,
    padding: DumpSackTheme.spacing.lg,
    maxWidth: '90%',
    maxHeight: '90%',
    overflow: 'auto',
    boxShadow: DumpSackTheme.shadows.xl,
    position: 'relative',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: DumpSackTheme.spacing.md,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: DumpSackTheme.typography.fontSize.xl,
    fontWeight: DumpSackTheme.typography.fontWeight.bold,
    color: DumpSackTheme.colors.text,
    fontFamily: DumpSackTheme.typography.fontFamily.primary,
  };

  const closeButtonStyles: React.CSSProperties = {
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
    <div style={overlayStyles} onClick={onClose}>
      <div
        className={className}
        style={{ ...modalStyles, ...style }}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div style={headerStyles}>
            {title && <h2 style={titleStyles}>{title}</h2>}
            {showCloseButton && (
              <button onClick={onClose} style={closeButtonStyles}>
                <DSIcon name="close" size={24} />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};


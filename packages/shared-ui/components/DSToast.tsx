/**
 * DSToast - Toast Notifications
 * Spec: Section 3.9
 * Colors: success, error, warning
 * Default duration: 2800ms
 */

import React, { useEffect } from 'react';
import { DumpSackTheme } from '../theme';

export type ToastVariant = 'success' | 'error' | 'warning';

export interface DSToastProps {
  variant: ToastVariant;
  message: string;
  visible: boolean;
  onClose: () => void;
  durationMs?: number;
  placement?: 'top' | 'bottom';
}

export const DSToast: React.FC<DSToastProps> = ({
  variant,
  message,
  visible,
  onClose,
  durationMs = 2800,
  placement = 'bottom',
}) => {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [visible, durationMs, onClose]);

  if (!visible) return null;

  const backgroundMap: Record<ToastVariant, string> = {
    success: `${DumpSackTheme.colors.success}20`,
    error: `${DumpSackTheme.colors.error}20`,
    warning: `${DumpSackTheme.colors.warning}20`,
  };

  const borderMap: Record<ToastVariant, string> = {
    success: DumpSackTheme.colors.success,
    error: DumpSackTheme.colors.error,
    warning: DumpSackTheme.colors.warning,
  };

  const color = borderMap[variant];

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        [placement]: 16,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          maxWidth: 340,
          margin: '0 auto',
          backgroundColor: backgroundMap[variant],
          borderRadius: DumpSackTheme.borderRadius.md,
          border: `1px solid ${color}`,
          padding: `${DumpSackTheme.spacing.sm}px ${DumpSackTheme.spacing.md}px`,
          color: DumpSackTheme.colors.textPrimary,
          fontSize: DumpSackTheme.typography.small.fontSize,
          display: 'flex',
          alignItems: 'center',
          gap: DumpSackTheme.spacing.sm,
          pointerEvents: 'auto',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: color,
          }}
        />
        <span>{message}</span>
      </div>
    </div>
  );
};


/**
 * DSScreen - Screen Wrapper
 * Spec: Section 2.1
 * Default background: colors.background
 * Screen padding: spacing.lg horizontally
 */

import React from 'react';
import { DumpSackTheme } from '../theme';

export interface DSScreenProps {
  children: React.ReactNode;
  padding?: boolean;
  style?: React.CSSProperties;
}

export function DSScreen({ children, padding = true, style }: DSScreenProps) {
  return (
    <div
      style={{
        backgroundColor: DumpSackTheme.colors.background,
        minHeight: '100%',
        padding: padding ? `0 ${DumpSackTheme.spacing.lg}px` : 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}


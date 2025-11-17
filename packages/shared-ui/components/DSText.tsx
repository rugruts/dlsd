/**
 * DumpSack Text Component
 * Consistent typography across the app
 */

import React from 'react';
import { DumpSackTheme } from '../theme';

export type TextType = 'title' | 'subtitle' | 'body' | 'label' | 'caption';
export type TextColor = 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error';

export interface DSTextProps {
  type?: TextType;
  color?: TextColor;
  bold?: boolean;
  center?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const getTextStyles = (type: TextType, color: TextColor, bold: boolean, center: boolean) => {
  const typeStyles: Record<TextType, React.CSSProperties> = {
    title: {
      fontSize: DumpSackTheme.typography.fontSize['3xl'],
      fontWeight: DumpSackTheme.typography.fontWeight.bold,
      lineHeight: DumpSackTheme.typography.lineHeight.tight,
    },
    subtitle: {
      fontSize: DumpSackTheme.typography.fontSize.xl,
      fontWeight: DumpSackTheme.typography.fontWeight.semibold,
      lineHeight: DumpSackTheme.typography.lineHeight.normal,
    },
    body: {
      fontSize: DumpSackTheme.typography.fontSize.base,
      fontWeight: DumpSackTheme.typography.fontWeight.normal,
      lineHeight: DumpSackTheme.typography.lineHeight.normal,
    },
    label: {
      fontSize: DumpSackTheme.typography.fontSize.sm,
      fontWeight: DumpSackTheme.typography.fontWeight.medium,
      lineHeight: DumpSackTheme.typography.lineHeight.normal,
    },
    caption: {
      fontSize: DumpSackTheme.typography.fontSize.xs,
      fontWeight: DumpSackTheme.typography.fontWeight.normal,
      lineHeight: DumpSackTheme.typography.lineHeight.normal,
    },
  };

  const colorMap: Record<TextColor, string> = {
    primary: DumpSackTheme.colors.text,
    secondary: DumpSackTheme.colors.textSecondary,
    muted: DumpSackTheme.colors.textMuted,
    success: DumpSackTheme.colors.success,
    warning: DumpSackTheme.colors.warning,
    error: DumpSackTheme.colors.error,
  };

  return {
    ...typeStyles[type],
    color: colorMap[color],
    fontFamily: DumpSackTheme.typography.fontFamily.primary,
    fontWeight: bold ? DumpSackTheme.typography.fontWeight.bold : typeStyles[type].fontWeight,
    textAlign: center ? 'center' as const : 'left' as const,
  };
};

export const DSText: React.FC<DSTextProps> = ({
  type = 'body',
  color = 'primary',
  bold = false,
  center = false,
  children,
  className = '',
  style = {},
}) => {
  const textStyles = getTextStyles(type, color, bold, center);

  const Component = type === 'title' ? 'h1' : type === 'subtitle' ? 'h2' : 'p';

  return React.createElement(
    Component,
    {
      className,
      style: { ...textStyles, ...style },
    },
    children
  );
};


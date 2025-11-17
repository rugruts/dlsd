/**
 * DumpSack Button Component
 * Supports primary, secondary, and danger variants
 */

import React from 'react';

import { DSIcon } from '../icons';
import { DumpSackTheme } from '../theme';
import type { IconName } from '../icons';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface DSButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
}

const getButtonStyles = (variant: ButtonVariant, size: ButtonSize, fullWidth: boolean, disabled: boolean) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DumpSackTheme.spacing.sm,
    fontFamily: DumpSackTheme.typography.fontFamily.primary,
    fontWeight: DumpSackTheme.typography.fontWeight.semibold,
    borderRadius: DumpSackTheme.borderRadius.md,
    border: `${DumpSackTheme.borderWidth.thick}px solid`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease',
    width: fullWidth ? '100%' : 'auto',
  };

  // Size styles
  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: {
      padding: `${DumpSackTheme.spacing.xs}px ${DumpSackTheme.spacing.md}px`,
      fontSize: DumpSackTheme.typography.fontSize.sm,
    },
    md: {
      padding: `${DumpSackTheme.spacing.sm}px ${DumpSackTheme.spacing.lg}px`,
      fontSize: DumpSackTheme.typography.fontSize.base,
    },
    lg: {
      padding: `${DumpSackTheme.spacing.md}px ${DumpSackTheme.spacing.xl}px`,
      fontSize: DumpSackTheme.typography.fontSize.lg,
    },
  };

  // Variant styles
  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: DumpSackTheme.colors.buttonPrimary,
      borderColor: DumpSackTheme.colors.buttonPrimary,
      color: DumpSackTheme.colors.boneWhite,
    },
    secondary: {
      backgroundColor: DumpSackTheme.colors.buttonSecondary,
      borderColor: DumpSackTheme.colors.furGreen,
      color: DumpSackTheme.colors.boneWhite,
    },
    danger: {
      backgroundColor: DumpSackTheme.colors.buttonDanger,
      borderColor: DumpSackTheme.colors.buttonDanger,
      color: DumpSackTheme.colors.boneWhite,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: DumpSackTheme.colors.furGreen,
      color: DumpSackTheme.colors.boneWhite,
    },
  };

  return {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };
};

export const DSButton: React.FC<DSButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  children,
  onClick,
  className = '',
  style = {},
  type = 'button',
}) => {
  const buttonStyles = getButtonStyles(variant, size, fullWidth, disabled || loading);

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={className}
      style={{ ...buttonStyles, ...style }}
    >
      {loading ? (
        <DSIcon name="refresh" size={iconSize} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <DSIcon name={icon} size={iconSize} />}
          {children}
          {icon && iconPosition === 'right' && <DSIcon name={icon} size={iconSize} />}
        </>
      )}
    </button>
  );
};

// Web-specific hover styles (for extension)
export const DSButtonWebStyles = `
  .ds-button-primary:hover:not(:disabled) {
    background-color: ${DumpSackTheme.colors.buttonPrimaryHover};
    border-color: ${DumpSackTheme.colors.buttonPrimaryHover};
  }
  
  .ds-button-primary:active:not(:disabled) {
    background-color: ${DumpSackTheme.colors.buttonPrimaryActive};
    border-color: ${DumpSackTheme.colors.buttonPrimaryActive};
  }
  
  .ds-button-secondary:hover:not(:disabled) {
    background-color: ${DumpSackTheme.colors.buttonSecondaryHover};
  }
  
  .ds-button-secondary:active:not(:disabled) {
    background-color: ${DumpSackTheme.colors.buttonSecondaryActive};
  }
  
  .ds-button-danger:hover:not(:disabled) {
    background-color: ${DumpSackTheme.colors.buttonDangerHover};
    border-color: ${DumpSackTheme.colors.buttonDangerHover};
  }
  
  .ds-button-ghost:hover:not(:disabled) {
    background-color: ${DumpSackTheme.colors.surface};
  }
`;


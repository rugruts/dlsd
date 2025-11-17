/**
 * DumpSack Input Component
 * Themed input fields with consistent styling
 */

import React from 'react';
import { DumpSackTheme } from '../theme';
import { DSIcon, IconName } from '../icons';

export interface DSInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  disabled?: boolean;
  error?: string;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const DSInput: React.FC<DSInputProps> = ({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  disabled = false,
  error,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  className = '',
  style = {},
}) => {
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: fullWidth ? '100%' : 'auto',
  };

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: `${DumpSackTheme.spacing.sm}px ${DumpSackTheme.spacing.md}px`,
    paddingLeft: icon && iconPosition === 'left' ? DumpSackTheme.spacing.xl + DumpSackTheme.spacing.sm : DumpSackTheme.spacing.md,
    paddingRight: icon && iconPosition === 'right' ? DumpSackTheme.spacing.xl + DumpSackTheme.spacing.sm : DumpSackTheme.spacing.md,
    backgroundColor: DumpSackTheme.colors.inputBackground,
    border: `${DumpSackTheme.borderWidth.normal}px solid ${error ? DumpSackTheme.colors.error : DumpSackTheme.colors.inputBorder}`,
    borderRadius: DumpSackTheme.borderRadius.md,
    color: DumpSackTheme.colors.inputText,
    fontSize: DumpSackTheme.typography.fontSize.base,
    fontFamily: DumpSackTheme.typography.fontFamily.primary,
    outline: 'none',
    transition: `border-color ${DumpSackTheme.animation.duration.normal}ms ${DumpSackTheme.animation.easing.easeInOut}`,
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
  };

  const iconStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [iconPosition === 'left' ? 'left' : 'right']: DumpSackTheme.spacing.md,
    pointerEvents: 'none',
    color: error ? DumpSackTheme.colors.error : DumpSackTheme.colors.textSecondary,
  };

  const errorStyles: React.CSSProperties = {
    marginTop: DumpSackTheme.spacing.xs,
    fontSize: DumpSackTheme.typography.fontSize.xs,
    color: DumpSackTheme.colors.error,
  };

  return (
    <div style={containerStyles}>
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={iconStyles}>
            <DSIcon name={icon} size={20} />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`ds-input ${className}`}
          style={{ ...inputStyles, ...style }}
        />
      </div>
      {error && <div style={errorStyles}>{error}</div>}
    </div>
  );
};

// Web-specific focus styles
export const DSInputWebStyles = `
  .ds-input:focus {
    border-color: ${DumpSackTheme.colors.inputBorderFocus};
  }
  
  .ds-input::placeholder {
    color: ${DumpSackTheme.colors.inputPlaceholder};
  }
`;


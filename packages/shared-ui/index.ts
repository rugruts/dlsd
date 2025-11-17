/**
 * DumpSack Shared UI Library
 * Unified design system for mobile and extension
 */

// Theme
export { DumpSackTheme, cssVariables } from './theme';
export type { DumpSackThemeType } from './theme';

// Icons
export { DSIcon } from './icons';
export type { IconName, IconProps } from './icons';

// Components
export { DSButton, DSButtonWebStyles } from './components/DSButton';
export type { DSButtonProps, ButtonVariant, ButtonSize } from './components/DSButton';

export { DSCard, DSCardWebStyles } from './components/DSCard';
export type { DSCardProps } from './components/DSCard';

export { DSText } from './components/DSText';
export type { DSTextProps, TextType, TextColor } from './components/DSText';

export { DSInput, DSInputWebStyles } from './components/DSInput';
export type { DSInputProps } from './components/DSInput';

export { DSHeader } from './components/DSHeader';
export type { DSHeaderProps } from './components/DSHeader';

export { DSModal } from './components/DSModal';
export type { DSModalProps } from './components/DSModal';

// Import web styles to create combined export
import { DSButtonWebStyles as ButtonStyles } from './components/DSButton';
import { DSCardWebStyles as CardStyles } from './components/DSCard';
import { DSInputWebStyles as InputStyles } from './components/DSInput';

// Combined web styles for extension
export const DumpSackWebStyles = `
  ${ButtonStyles}
  ${CardStyles}
  ${InputStyles}
`;


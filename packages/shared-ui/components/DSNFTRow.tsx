/**
 * DSNFTRow - NFT List Row
 * Spec: Section 3.8
 * Content: Thumbnail | Name | Collection | Chevron
 */

import React from 'react';
import { DumpSackTheme } from '../theme';

export interface DSNFTRowProps {
  thumbnail: string;
  name: string;
  collection?: string;
  onClick: () => void;
}

export const DSNFTRow: React.FC<DSNFTRowProps> = ({ thumbnail, name, collection, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: DumpSackTheme.spacing.md,
        padding: `${DumpSackTheme.spacing.sm}px ${DumpSackTheme.spacing.md}px`,
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: `1px solid ${DumpSackTheme.colors.border}50`,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      {/* Thumbnail */}
      <img
        src={thumbnail}
        alt={name}
        style={{
          width: 48,
          height: 48,
          borderRadius: DumpSackTheme.borderRadius.sm,
          objectFit: 'cover',
        }}
      />

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: DumpSackTheme.typography.body.fontSize,
            fontWeight: DumpSackTheme.typography.body.fontWeight,
            color: DumpSackTheme.colors.textPrimary,
          }}
        >
          {name}
        </div>
        {collection && (
          <div
            style={{
              fontSize: DumpSackTheme.typography.small.fontSize,
              color: DumpSackTheme.colors.textSecondary,
            }}
          >
            {collection}
          </div>
        )}
      </div>

      {/* Chevron */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke={DumpSackTheme.colors.textMuted}
        strokeWidth="2"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
};


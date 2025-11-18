/**
 * DumpSack Token Icon Component
 * Displays token logo from metadata or generates gradient from mint hash
 */

import React, { useState, useEffect } from 'react';
import { DumpSackTheme } from '../theme';

export interface DSTokenIconProps {
  mint: string;
  size?: 32 | 40 | 48;
  metadata?: {
    logoURI?: string;
    image?: string;
    icon?: string;
  };
}

// Generate gradient colors from mint address hash
function generateGradientFromMint(mint: string): [string, string] {
  const hash = mint.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    ['#39FF14', '#1F6F2E'], // Toxic Green to Mold Green
    ['#FF6A1E', '#FF8C42'], // Orange gradient
    ['#39FF14', '#FF6A1E'], // Green to Orange
    ['#1F6F2E', '#0E3B2E'], // Mold to Dumpster
    ['#FF6A1E', '#1F6F2E'], // Orange to Mold
  ];
  return colors[hash % colors.length];
}

export const DSTokenIcon: React.FC<DSTokenIconProps> = ({ mint, size = 32, metadata }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (metadata?.logoURI || metadata?.image || metadata?.icon) {
      const url = metadata.logoURI || metadata.image || metadata.icon;
      setImageUrl(url);
    }
  }, [metadata]);

  const [color1, color2] = generateGradientFromMint(mint);

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: DumpSackTheme.borderRadius.full,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  if (imageUrl && !error) {
    return (
      <div style={containerStyle}>
        <img
          src={imageUrl}
          alt="token"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={() => setError(true)}
        />
      </div>
    );
  }

  // Fallback gradient
  return (
    <div
      style={{
        ...containerStyle,
        background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
      }}
    />
  );
};


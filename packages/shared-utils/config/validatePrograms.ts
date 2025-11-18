import { PublicKey } from '@solana/web3.js';
import { GBA_PROGRAMS } from './gorbaganaPrograms';

/**
 * Validates all program IDs in GBA_PROGRAMS to ensure they are valid base58 PublicKeys.
 * This runs at build time to catch any invalid program IDs early.
 */
export function validateGorbaganaPrograms(): void {
  const errors: string[] = [];
  
  function validateValue(value: any, path: string): void {
    if (!value) return;
    
    // Skip if already a PublicKey instance
    if (value instanceof PublicKey) return;
    
    if (typeof value === 'string') {
      try {
        new PublicKey(value);
      } catch (err) {
        errors.push(`❌ Invalid program ID at ${path}: "${value}"\n   Error: ${err instanceof Error ? err.message : String(err)}`);
      }
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([key, val]) => {
        validateValue(val, path ? `${path}.${key}` : key);
      });
    }
  }
  
  console.log('🔍 Validating Gorbagana program IDs...\n');
  validateValue(GBA_PROGRAMS, 'GBA_PROGRAMS');
  
  if (errors.length > 0) {
    console.error('\n❌ VALIDATION FAILED:\n');
    errors.forEach(err => console.error(err));
    console.error('\n💡 Tip: Base58 alphabet excludes: 0 (zero), O (capital O), I (capital I), l (lowercase L)\n');
    throw new Error(`Found ${errors.length} invalid program ID(s)`);
  }
  
  console.log('✅ All program IDs are valid!\n');
}

// Run validation if this file is executed directly
if (require.main === module) {
  validateGorbaganaPrograms();
}


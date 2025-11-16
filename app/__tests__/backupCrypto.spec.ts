/**
 * Tests for backup encryption functionality
 */
import { validatePassphraseStrength } from '../services/backup/backupUtils';

describe('Backup Crypto', () => {
  describe('validatePassphraseStrength', () => {
    it('should validate weak passphrase', () => {
      const result = validatePassphraseStrength('weak');
      expect(result.isValid).toBe(false);
      expect(result.strength).toBe('weak');
      expect(result.errors).toContain('Passphrase must be at least 8 characters long');
    });

    it('should validate strong passphrase', () => {
      const result = validatePassphraseStrength('MyStrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('strong');
      expect(result.errors).toHaveLength(0);
    });
  });
});
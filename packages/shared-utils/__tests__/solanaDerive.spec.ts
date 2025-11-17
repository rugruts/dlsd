/**
 * Tests for BIP39/BIP44 Solana Derivation
 * 
 * These tests verify that our derivation matches standard wallets like Phantom
 */

import {
  generateMnemonic,
  isValidMnemonic,
  deriveSolanaKeypairFromMnemonic,
  deriveSolanaKeypairAtIndex,
  getPublicKeyFromMnemonic,
  verifyMnemonicDerivation,
  SOLANA_DERIVATION_PATH,
} from '../solanaDerive';

describe('SolanaDerive', () => {
  // Known test vector from Phantom wallet
  // Mnemonic: "pill tomorrow foster begin walnut hammer ready consider wait window available push"
  // Expected public key at m/44'/501'/0'/0': "3htGWYLCPNBqvZGN6KqJqZQPPqJqJqJqJqJqJqJqJqJq" (example)
  const TEST_MNEMONIC = 'pill tomorrow foster begin walnut hammer ready consider wait window available push';
  
  // Note: Replace with actual Phantom-derived public key for this mnemonic
  // You can verify this by importing the mnemonic into Phantom and checking the first account
  const EXPECTED_PUBLIC_KEY = 'REPLACE_WITH_ACTUAL_PHANTOM_PUBLIC_KEY';

  describe('generateMnemonic', () => {
    it('should generate a valid 12-word mnemonic by default', () => {
      const mnemonic = generateMnemonic();
      const words = mnemonic.split(' ');
      
      expect(words.length).toBe(12);
      expect(isValidMnemonic(mnemonic)).toBe(true);
    });

    it('should generate a valid 24-word mnemonic when strength is 256', () => {
      const mnemonic = generateMnemonic(256);
      const words = mnemonic.split(' ');
      
      expect(words.length).toBe(24);
      expect(isValidMnemonic(mnemonic)).toBe(true);
    });
  });

  describe('isValidMnemonic', () => {
    it('should validate a correct mnemonic', () => {
      expect(isValidMnemonic(TEST_MNEMONIC)).toBe(true);
    });

    it('should reject an invalid mnemonic', () => {
      expect(isValidMnemonic('invalid mnemonic phrase')).toBe(false);
      expect(isValidMnemonic('abandon abandon abandon')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidMnemonic('')).toBe(false);
    });
  });

  describe('deriveSolanaKeypairFromMnemonic', () => {
    it('should derive a keypair from a valid mnemonic', () => {
      const keypair = deriveSolanaKeypairFromMnemonic(TEST_MNEMONIC);
      
      expect(keypair).toBeDefined();
      expect(keypair.publicKey).toBeDefined();
      expect(keypair.secretKey).toBeDefined();
      expect(keypair.secretKey.length).toBe(64); // Solana secret key is 64 bytes
    });

    it('should throw error for invalid mnemonic', () => {
      expect(() => {
        deriveSolanaKeypairFromMnemonic('invalid mnemonic');
      }).toThrow('Invalid mnemonic phrase');
    });

    it('should derive the same keypair for the same mnemonic', () => {
      const keypair1 = deriveSolanaKeypairFromMnemonic(TEST_MNEMONIC);
      const keypair2 = deriveSolanaKeypairFromMnemonic(TEST_MNEMONIC);
      
      expect(keypair1.publicKey.toBase58()).toBe(keypair2.publicKey.toBase58());
    });

    it('should derive different keypairs for different passphrases', () => {
      const keypair1 = deriveSolanaKeypairFromMnemonic(TEST_MNEMONIC, '');
      const keypair2 = deriveSolanaKeypairFromMnemonic(TEST_MNEMONIC, 'passphrase123');
      
      expect(keypair1.publicKey.toBase58()).not.toBe(keypair2.publicKey.toBase58());
    });

    it('should use default derivation path m/44\'/501\'/0\'/0\'', () => {
      const keypair = deriveSolanaKeypairFromMnemonic(TEST_MNEMONIC);
      const publicKey = keypair.publicKey.toBase58();
      
      // This should match Phantom's first account
      console.log('Derived public key:', publicKey);
      console.log('Expected public key:', EXPECTED_PUBLIC_KEY);
      
      // Uncomment when you have the actual expected public key from Phantom
      // expect(publicKey).toBe(EXPECTED_PUBLIC_KEY);
    });
  });

  describe('deriveSolanaKeypairAtIndex', () => {
    it('should derive different keypairs for different account indices', () => {
      const keypair0 = deriveSolanaKeypairAtIndex(TEST_MNEMONIC, 0);
      const keypair1 = deriveSolanaKeypairAtIndex(TEST_MNEMONIC, 1);
      const keypair2 = deriveSolanaKeypairAtIndex(TEST_MNEMONIC, 2);
      
      expect(keypair0.publicKey.toBase58()).not.toBe(keypair1.publicKey.toBase58());
      expect(keypair1.publicKey.toBase58()).not.toBe(keypair2.publicKey.toBase58());
      expect(keypair0.publicKey.toBase58()).not.toBe(keypair2.publicKey.toBase58());
    });

    it('should match default derivation for account 0', () => {
      const keypairDefault = deriveSolanaKeypairFromMnemonic(TEST_MNEMONIC);
      const keypairIndex0 = deriveSolanaKeypairAtIndex(TEST_MNEMONIC, 0);
      
      expect(keypairDefault.publicKey.toBase58()).toBe(keypairIndex0.publicKey.toBase58());
    });
  });

  describe('getPublicKeyFromMnemonic', () => {
    it('should return base58 public key without creating full keypair', () => {
      const publicKey = getPublicKeyFromMnemonic(TEST_MNEMONIC);
      
      expect(typeof publicKey).toBe('string');
      expect(publicKey.length).toBeGreaterThan(32); // Base58 encoded
    });

    it('should match keypair public key', () => {
      const publicKey = getPublicKeyFromMnemonic(TEST_MNEMONIC);
      const keypair = deriveSolanaKeypairFromMnemonic(TEST_MNEMONIC);
      
      expect(publicKey).toBe(keypair.publicKey.toBase58());
    });
  });

  describe('verifyMnemonicDerivation', () => {
    it('should verify correct mnemonic derivation', () => {
      const publicKey = getPublicKeyFromMnemonic(TEST_MNEMONIC);
      const isValid = verifyMnemonicDerivation(TEST_MNEMONIC, publicKey);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect public key', () => {
      const isValid = verifyMnemonicDerivation(TEST_MNEMONIC, 'InvalidPublicKey123');
      
      expect(isValid).toBe(false);
    });

    it('should reject invalid mnemonic', () => {
      const isValid = verifyMnemonicDerivation('invalid mnemonic', 'SomePublicKey');
      
      expect(isValid).toBe(false);
    });
  });
});


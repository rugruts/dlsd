/**
 * Unit tests for alias service
 */
import { isAliasAvailable, registerAlias, resolveAlias } from '../services/auth/aliasService';

// Mock Firebase
jest.mock('@dumpsack/shared-utils', () => ({
  firebaseConfig: {
    getFirestore: jest.fn(() => ({
      collection: jest.fn(),
      doc: jest.fn(),
    })),
  },
}));

describe('alias service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isAliasAvailable', () => {
    it('returns true for available alias', async () => {
      // Mock empty query result
      const mockQuery = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
      });

      const mockGetDocs = jest.fn().mockResolvedValue({
        empty: true,
      });

      // Mock Firestore calls
      const { firebaseConfig } = require('@dumpsack/shared-utils');
      const mockDb = {};
      firebaseConfig.getFirestore.mockReturnValue(mockDb);
      mockDb.collection = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
      });
      mockDb.where = jest.fn().mockReturnThis();
      mockDb.get = jest.fn().mockResolvedValue({ empty: true });

      const result = await isAliasAvailable('newalias');
      expect(result).toBe(true);
    });

    it('returns false for taken alias', async () => {
      // Mock non-empty query result
      const { firebaseConfig } = require('@dumpsack/shared-utils');
      const mockDb = {};
      firebaseConfig.getFirestore.mockReturnValue(mockDb);
      mockDb.collection = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
      });
      mockDb.where = jest.fn().mockReturnThis();
      mockDb.get = jest.fn().mockResolvedValue({ empty: false });

      const result = await isAliasAvailable('takenalias');
      expect(result).toBe(false);
    });
  });

  describe('registerAlias', () => {
    it('successfully registers available alias', async () => {
      const alias = 'testuser';
      const address = 'GorbaganaAddress123';
      const userId = 'user123';

      // Mock availability check
      const { firebaseConfig } = require('@dumpsack/shared-utils');
      const mockDb = {};
      firebaseConfig.getFirestore.mockReturnValue(mockDb);

      // Mock collection and doc calls
      mockDb.collection = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
      });
      mockDb.where = jest.fn().mockReturnThis();
      mockDb.get = jest.fn().mockResolvedValue({ empty: true });

      mockDb.doc = jest.fn().mockReturnValue({});
      mockDb.setDoc = jest.fn().mockResolvedValue(undefined);

      await expect(registerAlias(alias, address, userId)).resolves.not.toThrow();
    });

    it('throws error for taken alias', async () => {
      const alias = 'takenalias';

      // Mock availability check returning false
      const { firebaseConfig } = require('@dumpsack/shared-utils');
      const mockDb = {};
      firebaseConfig.getFirestore.mockReturnValue(mockDb);

      mockDb.collection = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
      });
      mockDb.where = jest.fn().mockReturnThis();
      mockDb.get = jest.fn().mockResolvedValue({ empty: false });

      await expect(registerAlias(alias, 'address', 'user')).rejects.toThrow('Alias is already taken');
    });
  });

  describe('resolveAlias', () => {
    it('returns address for existing alias', async () => {
      const alias = 'existing';
      const expectedAddress = 'ResolvedAddress123';

      const { firebaseConfig } = require('@dumpsack/shared-utils');
      const mockDb = {};
      firebaseConfig.getFirestore.mockReturnValue(mockDb);

      mockDb.doc = jest.fn().mockReturnValue({});
      mockDb.getDoc = jest.fn().mockResolvedValue({
        exists: () => true,
        data: () => ({ address: expectedAddress }),
      });

      const result = await resolveAlias(alias);
      expect(result).toBe(expectedAddress);
    });

    it('returns null for non-existing alias', async () => {
      const { firebaseConfig } = require('@dumpsack/shared-utils');
      const mockDb = {};
      firebaseConfig.getFirestore.mockReturnValue(mockDb);

      mockDb.doc = jest.fn().mockReturnValue({});
      mockDb.getDoc = jest.fn().mockResolvedValue({
        exists: () => false,
      });

      const result = await resolveAlias('nonexisting');
      expect(result).toBe(null);
    });
  });
});
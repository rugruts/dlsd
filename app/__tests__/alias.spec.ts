/**
 * Unit tests for alias service
 */
import { isAliasAvailable, registerAlias, resolveAlias } from '../services/auth/aliasService';

// Mock Supabase
jest.mock('@dumpsack/shared-utils', () => ({
  getSupabase: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn(),
        })),
      })),
      insert: jest.fn(),
    })),
  })),
}));

describe('alias service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isAliasAvailable', () => {
    it('returns true for available alias', async () => {
      const { getSupabase } = require('@dumpsack/shared-utils');
      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
            })),
          })),
        })),
      };
      getSupabase.mockReturnValue(mockSupabase);

      const result = await isAliasAvailable('newalias');
      expect(result).toBe(true);
    });

    it('returns false for taken alias', async () => {
      const { getSupabase } = require('@dumpsack/shared-utils');
      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest.fn().mockResolvedValue({
                data: { alias: 'takenalias' },
                error: null
              }),
            })),
          })),
        })),
      };
      getSupabase.mockReturnValue(mockSupabase);

      const result = await isAliasAvailable('takenalias');
      expect(result).toBe(false);
    });
  });

  describe('registerAlias', () => {
    it('successfully registers available alias', async () => {
      const alias = 'testuser';
      const address = 'GorbaganaAddress123';
      const userId = 'user123';

      const { getSupabase } = require('@dumpsack/shared-utils');
      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
            })),
          })),
          insert: jest.fn().mockResolvedValue({ error: null }),
        })),
      };
      getSupabase.mockReturnValue(mockSupabase);

      await expect(registerAlias(alias, address, userId)).resolves.not.toThrow();
    });

    it('throws error for taken alias', async () => {
      const alias = 'takenalias';

      const { getSupabase } = require('@dumpsack/shared-utils');
      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest.fn().mockResolvedValue({
                data: { alias: 'takenalias' },
                error: null
              }),
            })),
          })),
        })),
      };
      getSupabase.mockReturnValue(mockSupabase);

      await expect(registerAlias(alias, 'address', 'user')).rejects.toThrow('Alias is already taken');
    });
  });

  describe('resolveAlias', () => {
    it('returns address for existing alias', async () => {
      const alias = 'existing';
      const expectedAddress = 'ResolvedAddress123';

      const { getSupabase } = require('@dumpsack/shared-utils');
      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest.fn().mockResolvedValue({
                data: { address: expectedAddress },
                error: null
              }),
            })),
          })),
        })),
      };
      getSupabase.mockReturnValue(mockSupabase);

      const result = await resolveAlias(alias);
      expect(result).toBe(expectedAddress);
    });

    it('returns null for non-existing alias', async () => {
      const { getSupabase } = require('@dumpsack/shared-utils');
      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
            })),
          })),
        })),
      };
      getSupabase.mockReturnValue(mockSupabase);

      const result = await resolveAlias('nonexisting');
      expect(result).toBe(null);
    });
  });
});
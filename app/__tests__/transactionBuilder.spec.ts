/**
 * Tests for transaction builder
 */
import { buildSendGOR, buildSendSPL, estimateFees } from '../services/transactions/transactionBuilder';

// Mock Solana dependencies
jest.mock('@dumpsack/shared-utils/solana', () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getLatestBlockhash: jest.fn().mockResolvedValue({
      blockhash: 'mockBlockhash',
      lastValidBlockHeight: 100000,
    }),
  })),
  PublicKey: jest.fn().mockImplementation((key) => ({ toBase58: () => key })),
  SystemProgram: {
    transfer: jest.fn(),
  },
  Transaction: jest.fn().mockImplementation(() => ({
    recentBlockhash: null,
    feePayer: null,
    add: jest.fn().mockReturnThis(),
    compileMessage: jest.fn().mockReturnValue({
      serialize: jest.fn().mockReturnValue(new Uint8Array()),
    }),
  })),
}));

jest.mock('@solana/spl-token', () => ({
  TOKEN_PROGRAM_ID: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  getAssociatedTokenAddress: jest.fn().mockResolvedValue('mockATA'),
  createAssociatedTokenAccountInstruction: jest.fn(),
  createTransferInstruction: jest.fn(),
}));

describe('transactionBuilder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildSendGOR', () => {
    it('builds correct transfer instruction', async () => {
      const params = {
        fromPubkey: { toBase58: () => 'fromAddress' } as any,
        toPubkey: { toBase58: () => 'toAddress' } as any,
        lamports: 1000000,
      };

      const result = await buildSendGOR(params);

      expect(result.transaction).toBeDefined();
      expect(result.blockhash).toBe('mockBlockhash');
      expect(result.lastValidBlockHeight).toBe(100000);
    });

    it('fails with invalid pubkey', async () => {
      const params = {
        fromPubkey: null as any,
        toPubkey: { toBase58: () => 'toAddress' } as any,
        lamports: 1000000,
      };

      await expect(buildSendGOR(params)).rejects.toThrow();
    });
  });

  describe('buildSendSPL', () => {
    it('builds correct SPL transfer with ATA creation', async () => {
      const params = {
        fromPubkey: { toBase58: () => 'fromAddress' } as any,
        toPubkey: { toBase58: () => 'toAddress' } as any,
        mint: { toBase58: () => 'mintAddress' } as any,
        amount: 1000000,
      };

      const result = await buildSendSPL(params);

      expect(result.transaction).toBeDefined();
      expect(result.blockhash).toBe('mockBlockhash');
    });
  });

  describe('estimateFees', () => {
    it('returns fee estimate', async () => {
      const mockTransaction = {
        compileMessage: jest.fn().mockReturnValue({
          serialize: jest.fn().mockReturnValue(new Uint8Array()),
        }),
      };

      // Mock connection with fee estimate
      const mockConnection = {
        getFeeForMessage: jest.fn().mockResolvedValue({ value: 5000 }),
      };

      // Temporarily replace the connection
      const { Connection } = require('@dumpsack/shared-utils/solana');
      Connection.mockImplementation(() => mockConnection);

      const fee = await estimateFees(mockTransaction as any);
      expect(fee).toBe(5000);
    });

    it('returns fallback estimate when RPC fails', async () => {
      const mockTransaction = {
        compileMessage: jest.fn().mockReturnValue({
          serialize: jest.fn().mockReturnValue(new Uint8Array()),
        }),
        signatures: [{}, {}], // 2 signatures
      };

      const mockConnection = {
        getFeeForMessage: jest.fn().mockRejectedValue(new Error('RPC Error')),
      };

      const { Connection } = require('@dumpsack/shared-utils/solana');
      Connection.mockImplementation(() => mockConnection);

      const fee = await estimateFees(mockTransaction as any);
      expect(fee).toBe(10000); // 2 * 5000
    });
  });
});
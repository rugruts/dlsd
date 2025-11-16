import { ErrorUtils, PanicBunkerLockedError, InsufficientFundsError } from './errors';

describe('ErrorUtils', () => {
  describe('createUserError', () => {
    it('creates a user error with required fields', () => {
      const error = ErrorUtils.createUserError('Test Title', 'Test message');

      expect(error.title).toBe('Test Title');
      expect(error.message).toBe('Test message');
      expect(error.cause).toBeUndefined();
      expect(error.action).toBeUndefined();
    });

    it('creates a user error with all fields', () => {
      const cause = new Error('Original error');
      const action = { label: 'Retry', onPress: jest.fn() };

      const error = ErrorUtils.createUserError('Test Title', 'Test message', cause, action);

      expect(error.title).toBe('Test Title');
      expect(error.message).toBe('Test message');
      expect(error.cause).toBe(cause);
      expect(error.action).toBe(action);
    });
  });

  describe('fromRpcError', () => {
    it('maps blockhash not found error', () => {
      const rpcError = { message: 'blockhash not found' };
      const userError = ErrorUtils.fromRpcError(rpcError);

      expect(userError.title).toBe('Transaction Expired');
      expect(userError.message).toContain('Please try again');
    });

    it('maps insufficient funds error', () => {
      const rpcError = { message: 'insufficient funds' };
      const userError = ErrorUtils.fromRpcError(rpcError);

      expect(userError.title).toBe('Insufficient Funds');
      expect(userError.message).toContain('You don\'t have enough funds');
    });

    it('provides generic fallback for unknown errors', () => {
      const rpcError = { message: 'some unknown error' };
      const userError = ErrorUtils.fromRpcError(rpcError);

      expect(userError.title).toBe('Transaction Failed');
      expect(userError.message).toBe('some unknown error');
    });
  });

  describe('fromWalletError', () => {
    it('maps PanicBunkerLockedError', () => {
      const error = new PanicBunkerLockedError();
      const userError = ErrorUtils.fromWalletError(error);

      expect(userError.title).toBe('Wallet Locked');
      expect(userError.message).toContain('Panic Bunker');
    });

    it('maps InsufficientFundsError', () => {
      const error = new InsufficientFundsError();
      const userError = ErrorUtils.fromWalletError(error);

      expect(userError.title).toBe('Insufficient Funds');
      expect(userError.message).toContain('You don\'t have enough funds');
    });

    it('provides generic fallback for unknown wallet errors', () => {
      const error = new Error('Unknown wallet error');
      const userError = ErrorUtils.fromWalletError(error);

      expect(userError.title).toBe('Wallet Error');
      expect(userError.message).toBe('Unknown wallet error');
    });
  });

  describe('logError', () => {
    const originalConsoleError = console.error;
    let consoleErrorMock: jest.Mock;

    beforeEach(() => {
      consoleErrorMock = jest.fn();
      console.error = consoleErrorMock;
    });

    afterEach(() => {
      console.error = originalConsoleError;
    });

    it('logs errors in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');
      ErrorUtils.logError(error, { context: 'test' });

      expect(consoleErrorMock).toHaveBeenCalledWith(
        '[DumpSack Error]',
        expect.objectContaining({
          name: 'Error',
          message: 'Test error',
          context: { context: 'test' },
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('does not log errors in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Test error');
      ErrorUtils.logError(error);

      expect(consoleErrorMock).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('handleAsyncError', () => {
    it('executes operation successfully', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const result = await ErrorUtils.handleAsyncError(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalled();
    });

    it('handles errors gracefully', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Test error'));
      const errorHandler = jest.fn();

      const result = await ErrorUtils.handleAsyncError(operation, errorHandler);

      expect(result).toBeNull();
      expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

describe('Custom Errors', () => {
  it('PanicBunkerLockedError has correct name and message', () => {
    const error = new PanicBunkerLockedError('Custom message');
    expect(error.name).toBe('PanicBunkerLockedError');
    expect(error.message).toBe('Custom message');
  });

  it('InsufficientFundsError has correct name and message', () => {
    const error = new InsufficientFundsError('Custom message');
    expect(error.name).toBe('InsufficientFundsError');
    expect(error.message).toBe('Custom message');
  });
});
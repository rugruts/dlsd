export class PanicBunkerLockedError extends Error {
  constructor(message: string = "Wallet is locked by Panic Bunker") {
    super(message);
    this.name = "PanicBunkerLockedError";
  }
}

export class WalletLockedError extends Error {
  constructor(message: string = "Wallet is locked") {
    super(message);
    this.name = "WalletLockedError";
  }
}

export class InsufficientFundsError extends Error {
  constructor(message: string = "Insufficient funds") {
    super(message);
    this.name = "InsufficientFundsError";
  }
}

export class NetworkError extends Error {
  constructor(message: string = "Network error") {
    super(message);
    this.name = "NetworkError";
  }
}

export class InvalidTransactionError extends Error {
  constructor(message: string = "Invalid transaction") {
    super(message);
    this.name = "InvalidTransactionError";
  }
}

// Standardized error shape for user-facing errors
export interface UserError {
  title: string;
  message: string;
  cause?: Error;
  action?: {
    label: string;
    onPress: () => void;
  };
}

// Error utility functions
export class ErrorUtils {
  static createUserError(
    title: string,
    message: string,
    cause?: Error,
    action?: UserError['action']
  ): UserError {
    return {
      title,
      message,
      cause,
      action,
    };
  }

  static fromRpcError(rpcError: any): UserError {
    const message = rpcError.message || 'Unknown RPC error';
    const cause = rpcError.cause || new Error(message);

    // Map common RPC errors to user-friendly messages
    if (message.includes('blockhash not found')) {
      return this.createUserError(
        'Transaction Expired',
        'The transaction has expired. Please try again.',
        cause
      );
    }

    if (message.includes('insufficient funds')) {
      return this.createUserError(
        'Insufficient Funds',
        'You don\'t have enough funds for this transaction.',
        cause
      );
    }

    if (message.includes('token account')) {
      return this.createUserError(
        'Token Account Error',
        'There was an issue with the token account. Please try again.',
        cause
      );
    }

    if (message.includes('rent-exempt')) {
      return this.createUserError(
        'Account Balance Error',
        'Account balance is below the minimum required. Please add more funds.',
        cause
      );
    }

    if (message.includes('network') || message.includes('offline')) {
      return this.createUserError(
        'Network Error',
        'Unable to connect to the network. Please check your connection and try again.',
        cause
      );
    }

    // Generic fallback
    return this.createUserError(
      'Transaction Failed',
      message,
      cause
    );
  }

  static fromWalletError(error: any): UserError {
    if (error instanceof PanicBunkerLockedError) {
      return this.createUserError(
        'Wallet Locked',
        'Your wallet is locked by Panic Bunker. Please unlock it first.',
        error
      );
    }

    if (error instanceof InsufficientFundsError) {
      return this.createUserError(
        'Insufficient Funds',
        'You don\'t have enough funds for this transaction.',
        error
      );
    }

    if (error instanceof NetworkError) {
      return this.createUserError(
        'Network Error',
        'Unable to connect to the network. Please try again.',
        error
      );
    }

    // Generic wallet error
    return this.createUserError(
      'Wallet Error',
      error.message || 'An unexpected wallet error occurred.',
      error
    );
  }

  static logError(error: Error, context?: Record<string, any>): void {
    // Only log in development or if explicitly enabled
    const isDev = process.env.NODE_ENV === 'development' ||
                  process.env.EXPO_PUBLIC_ENV === 'development' ||
                  process.env.VITE_ENV === 'development';

    if (isDev) {
      console.error('[DumpSack Error]', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        context,
      });
    }
  }

  static handleAsyncError<T>(
    operation: () => Promise<T>,
    errorHandler?: (error: Error) => void
  ): Promise<T | null> {
    return operation().catch((error) => {
      this.logError(error);
      if (errorHandler) {
        errorHandler(error);
      }
      return null;
    });
  }
}
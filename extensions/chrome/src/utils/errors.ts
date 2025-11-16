export class DumpSackError extends Error {
  constructor(
    message: string,
    public code: string,
    public data?: any
  ) {
    super(message);
    this.name = 'DumpSackError';
  }
}

export class ConnectionError extends DumpSackError {
  constructor(message: string = 'Connection failed') {
    super(message, 'CONNECTION_ERROR');
  }
}

export class PermissionDeniedError extends DumpSackError {
  constructor(message: string = 'Permission denied') {
    super(message, 'PERMISSION_DENIED');
  }
}

export class SigningError extends DumpSackError {
  constructor(message: string = 'Signing failed') {
    super(message, 'SIGNING_ERROR');
  }
}

export class InvalidRequestError extends DumpSackError {
  constructor(message: string = 'Invalid request') {
    super(message, 'INVALID_REQUEST');
  }
}

export class RpcError extends DumpSackError {
  constructor(message: string = 'RPC request failed', data?: any) {
    super(message, 'RPC_ERROR', data);
  }
}

export function createErrorResponse(error: Error): { success: false; error: string; code?: string } {
  if (error instanceof DumpSackError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }

  return {
    success: false,
    error: error.message || 'Unknown error',
  };
}
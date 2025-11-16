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
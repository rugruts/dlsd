import { Connection, Transaction } from '@dumpsack/shared-utils/solana';
import { appConfig } from '@dumpsack/shared-utils';

export interface SimulationResult {
  success: boolean;
  logs: string[];
  units: number;
  errorMessage?: string;
}

export async function simulateTransaction(transaction: Transaction): Promise<SimulationResult> {
  const connection = new Connection(appConfig.rpc.primary, 'confirmed');

  try {
    const { value } = await connection.simulateTransaction(transaction, {
      sigVerify: false, // Don't verify signatures for simulation
    });

    const logs = value.logs || [];
    const units = value.unitsConsumed || 0;

    if (value.err) {
      return {
        success: false,
        logs,
        units,
        errorMessage: parseSimulationError(value.err, logs),
      };
    }

    return {
      success: true,
      logs,
      units,
    };
  } catch (error) {
    return {
      success: false,
      logs: [],
      units: 0,
      errorMessage: 'Simulation failed: RPC unavailable',
    };
  }
}

function parseSimulationError(error: any, logs: string[]): string {
  // Parse common Solana errors from simulation logs
  const errorString = JSON.stringify(error);

  if (errorString.includes('insufficient funds')) {
    return 'Insufficient funds for this transaction';
  }

  if (errorString.includes('invalid account owner')) {
    return 'Invalid account ownership';
  }

  if (errorString.includes('account not found')) {
    return 'One or more accounts not found';
  }

  if (errorString.includes('address malformed')) {
    return 'Invalid address format';
  }

  // Check logs for specific error patterns
  for (const log of logs) {
    if (log.includes('insufficient lamports')) {
      return 'Insufficient balance for transaction fees';
    }
    if (log.includes('AccountNotFound')) {
      return 'Account does not exist';
    }
    if (log.includes('InvalidAccountOwner')) {
      return 'Invalid account owner';
    }
  }

  // Generic fallback
  return `Transaction simulation failed: ${errorString}`;
}
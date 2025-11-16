import { Transaction } from '@dumpsack/shared-utils/solana';
import { appConfig } from '@dumpsack/shared-utils';
import { StakeSimulationResult } from './stakingTypes';

export async function simulateStakeTx(transaction: Transaction): Promise<StakeSimulationResult> {
  if (!appConfig.features.enableStaking) {
    throw new Error('Staking is not enabled');
  }

  try {
    const serialized = transaction.serialize();
    const base64Tx = Buffer.from(serialized).toString('base64');

    const response = await fetch(appConfig.rpc.primary, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'simulateTransaction',
        params: [base64Tx, { encoding: 'base64', commitment: 'confirmed' }],
      }),
    });

    if (!response.ok) {
      throw new Error(`RPC request failed: ${response.status}`);
    }

    const data = await response.json();
    const result = data.result;

    if (result.err) {
      return {
        success: false,
        logs: result.logs || [],
        units: result.unitsConsumed || 0,
        errorMessage: parseSimulationError(result.err),
      };
    }

    return {
      success: true,
      logs: result.logs || [],
      units: result.unitsConsumed || 0,
    };
  } catch (error) {
    console.error('Stake simulation failed:', error);
    return {
      success: false,
      logs: [],
      units: 0,
      errorMessage: error instanceof Error ? error.message : 'Simulation failed',
    };
  }
}

function parseSimulationError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error.InstructionError) {
    const [index, instructionError] = error.InstructionError;
    if (Array.isArray(instructionError) && instructionError.length >= 2) {
      const [errorCode, context] = instructionError;
      return `Instruction ${index} failed: ${errorCode}`;
    }
    return `Instruction ${index} failed`;
  }

  if (error.message) {
    return error.message;
  }

  return 'Transaction simulation failed';
}
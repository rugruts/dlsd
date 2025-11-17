/**
 * QR Code Utilities
 * Solana URI generation and parsing for QR codes
 */

/**
 * Generate a Solana URI for QR codes
 * Format: solana:<address>?amount=<decimal>&label=<string>
 * 
 * @param address - Solana public key (base58)
 * @param amount - Optional amount in SOL/GOR (decimal string)
 * @param label - Optional label (default: "DumpSack")
 * @returns Solana URI string
 * 
 * @example
 * solanaUri('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU')
 * // => 'solana:7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU?label=DumpSack'
 * 
 * solanaUri('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', '1.5')
 * // => 'solana:7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU?amount=1.5&label=DumpSack'
 */
export function solanaUri(
  address: string,
  amount?: string,
  label: string = 'DumpSack'
): string {
  const base = `solana:${address}`;
  const params = new URLSearchParams();
  
  if (amount && amount !== '' && parseFloat(amount) > 0) {
    params.set('amount', amount);
  }
  
  if (label) {
    params.set('label', label);
  }
  
  const queryString = params.toString();
  return queryString ? `${base}?${queryString}` : base;
}

/**
 * Parse a Solana URI
 * 
 * @param uri - Solana URI string
 * @returns Parsed components or null if invalid
 * 
 * @example
 * parseSolanaUri('solana:7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU?amount=1.5&label=DumpSack')
 * // => { address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', amount: '1.5', label: 'DumpSack' }
 */
export function parseSolanaUri(uri: string): {
  address: string;
  amount?: string;
  label?: string;
  spl_token?: string;
  memo?: string;
} | null {
  try {
    // Check if it starts with solana:
    if (!uri.startsWith('solana:')) {
      return null;
    }

    // Remove the solana: prefix
    const withoutPrefix = uri.substring(7);

    // Split address and query string
    const [address, queryString] = withoutPrefix.split('?');

    if (!address) {
      return null;
    }

    const result: {
      address: string;
      amount?: string;
      label?: string;
      spl_token?: string;
      memo?: string;
    } = { address };

    // Parse query parameters if present
    if (queryString) {
      const params = new URLSearchParams(queryString);
      
      const amount = params.get('amount');
      if (amount) result.amount = amount;
      
      const label = params.get('label');
      if (label) result.label = label;
      
      const splToken = params.get('spl-token');
      if (splToken) result.spl_token = splToken;
      
      const memo = params.get('memo');
      if (memo) result.memo = memo;
    }

    return result;
  } catch (error) {
    console.error('Failed to parse Solana URI:', error);
    return null;
  }
}

/**
 * Validate a Solana address (basic check)
 * @param address - Address to validate
 * @returns true if address looks valid
 */
export function isValidSolanaAddress(address: string): boolean {
  // Basic validation: base58 characters, length 32-44
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
}

/**
 * Create a Solana URI for SPL token transfer
 * 
 * @param address - Recipient address
 * @param tokenMint - SPL token mint address
 * @param amount - Amount in token decimals
 * @param label - Optional label
 * @returns Solana URI with SPL token parameter
 */
export function solanaSplTokenUri(
  address: string,
  tokenMint: string,
  amount?: string,
  label: string = 'DumpSack'
): string {
  const base = `solana:${address}`;
  const params = new URLSearchParams();
  
  params.set('spl-token', tokenMint);
  
  if (amount && amount !== '' && parseFloat(amount) > 0) {
    params.set('amount', amount);
  }
  
  if (label) {
    params.set('label', label);
  }
  
  return `${base}?${params.toString()}`;
}


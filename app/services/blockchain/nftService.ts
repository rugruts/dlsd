import { Connection, PublicKey } from '@dumpsack/shared-utils';
import { appConfig } from '@dumpsack/shared-utils';
import { NftItem } from '../../types/wallet';

const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export async function getNfts(pubkey: PublicKey): Promise<NftItem[]> {
  const connection = new Connection(appConfig.rpc.primary, 'confirmed');

  try {
    // Get all token accounts owned by the wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    });

    const nfts: NftItem[] = [];

    for (const account of tokenAccounts.value) {
      try {
        const parsedInfo = account.account.data.parsed.info;
        const mint = parsedInfo.mint;
        const balance = parsedInfo.tokenAmount.uiAmount;

        // Check if this is an NFT (balance = 1 and decimals = 0)
        if (balance === 1 && parsedInfo.tokenAmount.decimals === 0) {
          const nft = await getNftMetadata(mint, pubkey.toBase58());
          if (nft) {
            nfts.push(nft);
          }
        }
      } catch (error) {
        console.error('Error processing token account for NFT:', error);
      }
    }

    return nfts;
  } catch (error) {
    console.error('Failed to fetch NFTs:', error);
    return [];
  }
}

/**
 * Fetch NFT metadata from on-chain Metaplex data
 * Falls back to IPFS/Arweave for off-chain metadata
 */
async function getNftMetadata(mint: string, owner: string): Promise<NftItem | null> {
  try {
    const connection = new Connection(appConfig.rpc.primary, 'confirmed');
    const mintPubkey = new PublicKey(mint);

    // Get metadata account using Metaplex PDA
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        METADATA_PROGRAM_ID.toBuffer(),
        mintPubkey.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );

    const accountInfo = await connection.getAccountInfo(metadataPDA);
    if (!accountInfo) {
      console.warn(`No metadata account found for NFT: ${mint}`);
      return null;
    }

    // Parse on-chain metadata
    const metadata = parseMetaplexMetadata(accountInfo.data);

    // Fetch off-chain metadata from URI
    let offChainMetadata = null;
    if (metadata.uri) {
      offChainMetadata = await fetchOffChainMetadata(metadata.uri);
    }

    return {
      mint,
      name: offChainMetadata?.name || metadata.name || `NFT ${mint.slice(0, 8)}`,
      description: offChainMetadata?.description || '',
      image: offChainMetadata?.image || generatePlaceholderImage(mint),
      collection: metadata.collection || offChainMetadata?.collection?.name || '',
      attributes: offChainMetadata?.attributes || [],
      owner,
    };
  } catch (error) {
    console.error('Failed to get NFT metadata:', error);
    return null;
  }
}

/**
 * Parse Metaplex metadata from account data
 * Simplified parser - in production use @metaplex-foundation/mpl-token-metadata
 */
function parseMetaplexMetadata(data: Buffer): {
  name: string;
  symbol: string;
  uri: string;
  collection: string | null;
} {
  try {
    // Metaplex metadata layout (simplified):
    // - key (1 byte)
    // - update authority (32 bytes)
    // - mint (32 bytes)
    // - name (32 bytes, null-terminated string)
    // - symbol (10 bytes, null-terminated string)
    // - uri (200 bytes, null-terminated string)

    let offset = 1 + 32 + 32; // Skip key, update authority, mint

    // Read name (32 bytes)
    const nameBytes = data.slice(offset, offset + 32);
    const name = nameBytes.toString('utf8').replace(/\0/g, '').trim();
    offset += 32;

    // Read symbol (10 bytes)
    const symbolBytes = data.slice(offset, offset + 10);
    const symbol = symbolBytes.toString('utf8').replace(/\0/g, '').trim();
    offset += 10;

    // Read URI (200 bytes)
    const uriBytes = data.slice(offset, offset + 200);
    const uri = uriBytes.toString('utf8').replace(/\0/g, '').trim();

    return { name, symbol, uri, collection: null };
  } catch (error) {
    console.error('Failed to parse Metaplex metadata:', error);
    return { name: '', symbol: '', uri: '', collection: null };
  }
}

/**
 * Fetch off-chain metadata from IPFS/Arweave
 */
async function fetchOffChainMetadata(uri: string): Promise<{
  name?: string;
  description?: string;
  image?: string;
  collection?: { name: string };
  attributes?: Array<{ trait_type: string; value: string }>;
} | null> {
  try {
    // Convert IPFS/Arweave URIs to HTTP gateways
    let httpUri = uri;
    if (uri.startsWith('ipfs://')) {
      httpUri = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
    } else if (uri.startsWith('ar://')) {
      httpUri = uri.replace('ar://', 'https://arweave.net/');
    }

    const response = await fetch(httpUri, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const metadata = await response.json();

    // Convert IPFS image URIs
    if (metadata.image?.startsWith('ipfs://')) {
      metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
    } else if (metadata.image?.startsWith('ar://')) {
      metadata.image = metadata.image.replace('ar://', 'https://arweave.net/');
    }

    return metadata;
  } catch (error) {
    console.error('Failed to fetch off-chain metadata:', error);
    return null;
  }
}

/**
 * Generate placeholder image for NFT
 */
function generatePlaceholderImage(mint: string): string {
  const shortMint = mint.slice(0, 8);
  return `https://ui-avatars.com/api/?name=${shortMint}&size=300&background=random`;
}
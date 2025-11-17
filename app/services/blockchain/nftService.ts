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

async function getNftMetadata(mint: string, owner: string): Promise<NftItem | null> {
  try {
    const connection = new Connection(appConfig.rpc.primary, 'confirmed');
    const mintPubkey = new PublicKey(mint);

    // Get metadata account
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        METADATA_PROGRAM_ID.toBuffer(),
        mintPubkey.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );

    const accountInfo = await connection.getAccountInfo(metadataPDA);
    if (!accountInfo) return null;

    // Parse metadata (simplified - in production use proper deserialization)
    const metadata = {
      mint,
      name: 'Unknown NFT',
      description: '',
      image: '',
      collection: '',
      attributes: [],
      owner,
    };

    // Try to fetch off-chain metadata
    try {
      // This would normally parse the on-chain metadata to get URI
      // For demo, return basic NFT info
      metadata.name = `NFT ${mint.slice(0, 8)}`;
      metadata.image = `https://via.placeholder.com/300x300?text=NFT+${mint.slice(0, 4)}`;
    } catch (error) {
      console.error('Failed to fetch NFT metadata:', error);
    }

    return metadata;
  } catch (error) {
    console.error('Failed to get NFT metadata:', error);
    return null;
  }
}
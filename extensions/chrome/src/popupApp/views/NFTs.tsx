/**
 * DumpSack Wallet - NFTs View
 * NFT gallery with DumpSack theme
 */

import React, { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { appConfig } from '@dumpsack/shared-utils';
import { useWalletStore } from '../stores/walletStoreV2';
import { DumpSackTheme } from '@dumpsack/shared-ui';
import { SendNFT } from './SendNFT';

interface NFTItem {
  mint: string;
  name?: string;
  image?: string;
}

export function NFTs() {
  const { wallets, activeIndex } = useWalletStore();
  const activeWallet = wallets.find(w => w.index === activeIndex);
  const publicKey = activeWallet?.publicKey;
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);

  // Fetch NFTs
  useEffect(() => {
    if (!publicKey) return;

    const fetchNFTs = async () => {
      setLoading(true);
      try {
        const connection = new Connection(appConfig.rpc.primary, 'confirmed');
        const pubkey = new PublicKey(publicKey);

        // Get all token accounts
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
          programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        });

        const nftList: NFTItem[] = [];
        for (const account of tokenAccounts.value) {
          try {
            const parsedInfo = account.account.data.parsed.info;
            const mint = parsedInfo.mint;
            const balance = parsedInfo.tokenAmount.uiAmount;

            // Check if this is an NFT (balance = 1 and decimals = 0)
            if (balance === 1 && parsedInfo.tokenAmount.decimals === 0) {
              nftList.push({
                mint,
                name: `NFT ${mint.slice(0, 8)}`,
              });
            }
          } catch (error) {
            console.error('Error processing token account:', error);
          }
        }

        setNfts(nftList);
      } catch (error) {
        console.error('Failed to fetch NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [publicKey]);

  if (selectedNFT) {
    return (
      <SendNFT
        nftMint={selectedNFT.mint}
        nftName={selectedNFT.name}
        onClose={() => setSelectedNFT(null)}
      />
    );
  }

  if (!publicKey) {
    return (
      <div style={{
        padding: DumpSackTheme.spacing.lg,
        textAlign: 'center',
        backgroundColor: DumpSackTheme.colors.background,
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={DumpSackTheme.colors.textSecondary} strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <p style={{
          marginTop: DumpSackTheme.spacing.md,
          fontSize: DumpSackTheme.typography.fontSize.sm,
          color: DumpSackTheme.colors.textSecondary,
        }}>
          Connect a wallet to view NFTs
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        padding: DumpSackTheme.spacing.lg,
        backgroundColor: DumpSackTheme.colors.background,
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{ color: DumpSackTheme.colors.textSecondary }}>Loading NFTs...</p>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div style={{
        padding: DumpSackTheme.spacing.lg,
        backgroundColor: DumpSackTheme.colors.background,
        minHeight: '100%',
      }}>
        <h1 style={{
          fontSize: DumpSackTheme.typography.fontSize.xl,
          fontWeight: DumpSackTheme.typography.fontWeight.bold,
          color: DumpSackTheme.colors.text,
          marginBottom: DumpSackTheme.spacing.lg,
        }}>
          NFTs
        </h1>

        <div style={{
          textAlign: 'center',
          paddingTop: DumpSackTheme.spacing.xxl,
          paddingBottom: DumpSackTheme.spacing.xxl,
        }}>
          <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke={DumpSackTheme.colors.textMuted} strokeWidth="1.5" style={{ margin: '0 auto' }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <h2 style={{
            fontSize: DumpSackTheme.typography.fontSize.lg,
            fontWeight: DumpSackTheme.typography.fontWeight.semibold,
            color: DumpSackTheme.colors.text,
            marginTop: DumpSackTheme.spacing.lg,
            marginBottom: DumpSackTheme.spacing.sm,
          }}>
            No NFTs Yet
          </h2>
          <p style={{
            fontSize: DumpSackTheme.typography.fontSize.sm,
            color: DumpSackTheme.colors.textSecondary,
          }}>
            Your NFT collection will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: DumpSackTheme.spacing.lg,
      backgroundColor: DumpSackTheme.colors.background,
      minHeight: '100%',
    }}>
      <h1 style={{
        fontSize: DumpSackTheme.typography.fontSize.xl,
        fontWeight: DumpSackTheme.typography.fontWeight.bold,
        color: DumpSackTheme.colors.text,
        marginBottom: DumpSackTheme.spacing.lg,
      }}>
        NFTs ({nfts.length})
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: DumpSackTheme.spacing.md,
      }}>
        {nfts.map((nft) => (
          <button
            key={nft.mint}
            onClick={() => setSelectedNFT(nft)}
            style={{
              padding: DumpSackTheme.spacing.md,
              borderRadius: DumpSackTheme.borderRadius.md,
              backgroundColor: DumpSackTheme.colors.surface,
              border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.border}`,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = DumpSackTheme.colors.surfaceHover || '#1a1a1a';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = DumpSackTheme.colors.surface;
            }}
          >
            <div style={{
              width: '100%',
              aspectRatio: '1',
              backgroundColor: DumpSackTheme.colors.background,
              borderRadius: DumpSackTheme.borderRadius.sm,
              marginBottom: DumpSackTheme.spacing.sm,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={DumpSackTheme.colors.textMuted} strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <p style={{
              fontSize: DumpSackTheme.typography.fontSize.sm,
              color: DumpSackTheme.colors.text,
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {nft.name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}


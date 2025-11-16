export interface TokenItem {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  usdValue?: number;
  icon?: any;
  address: string;
}

export interface NftItem {
  mint: string;
  name: string;
  description?: string;
  image?: string;
  collection?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
  owner: string;
}
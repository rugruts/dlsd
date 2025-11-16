import { TokenItem, NftItem } from './wallet';
import { SwapQuote } from './swap';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  ImportWallet: undefined;
  Alias: undefined;
  MainTabs: undefined;
  Send: { mint?: string } | undefined;
  Staking: undefined;
  Settings: undefined;
  TokenDetails: { token: TokenItem };
  NFTGallery: undefined;
  NFTDetail: { nft: NftItem };
  SendSelect: { token?: TokenItem };
  SendReview: { token: TokenItem; recipient: string; amount: string };
  SendSuccess: { signature: string };
  Receive: undefined;
  Swap: undefined;
  SwapReview: { quote: SwapQuote };
  SwapSuccess: { signature: string };
};

export type MainTabParamList = {
  Home: undefined;
  Tokens: undefined;
  NFTs: undefined;
  Settings: undefined;
};
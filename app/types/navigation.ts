export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  ImportWallet: undefined;
  Alias: undefined;
  MainTabs: undefined;
  Send: { mint?: string } | undefined;
  Receive: undefined;
  Swap: { inputMint?: string; outputMint?: string } | undefined;
  Staking: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Tokens: undefined;
  NFTs: undefined;
  Settings: undefined;
};
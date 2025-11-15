import { Linking } from 'react-native';

const FAUCET_URL = 'https://faucet.gorbagana.wtf';

export async function openFaucet(): Promise<void> {
  const supported = await Linking.canOpenURL(FAUCET_URL);
  if (supported) {
    await Linking.openURL(FAUCET_URL);
  } else {
    throw new Error('Cannot open faucet URL');
  }
}
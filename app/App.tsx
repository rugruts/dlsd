import 'react-native-get-random-values';
import 'react-native-polyfill-globals/auto';
import { Buffer } from 'buffer';
import { decode as atob, encode as btoa } from 'base-64';

// @ts-ignore
globalThis.Buffer = Buffer;
// @ts-ignore
if (typeof globalThis.atob === 'undefined') globalThis.atob = atob;
// @ts-ignore
if (typeof globalThis.btoa === 'undefined') globalThis.btoa = btoa;

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './navigation/RootNavigator';

export default function App() {
  return (
    <>
      <RootNavigator />
      <StatusBar style="auto" />
    </>
  );
}
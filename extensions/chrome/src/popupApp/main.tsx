import React from 'react';
import { createRoot } from 'react-dom/client';
import { WalletApp } from './wallet-app';
import '../main.css'; // Reuse existing Tailwind CSS

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <WalletApp />
  </React.StrictMode>
);


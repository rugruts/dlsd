// Run this in the extension's service worker console to clear all storage
// Open chrome://extensions/ -> DumpSack Wallet -> "service worker" link -> paste this

chrome.storage.local.clear().then(() => {
  console.log('✅ All chrome.storage.local data cleared!');
  console.log('Now reload the extension.');
});


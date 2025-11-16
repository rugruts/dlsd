import { DumpSackMessageRouter } from './messageRouter';
import { permissionsStore } from './permissionsStore';
import { connectionStore } from './connectionStore';
import { signerService } from './signerService';

const messageRouter = new DumpSackMessageRouter();

// Handle messages from content scripts and provider
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle async response
  messageRouter.handleMessage(message, sender)
    .then((result) => {
      sendResponse({ success: true, result });
    })
    .catch((error) => {
      sendResponse({ success: false, error: error.message });
    });

  // Return true to indicate async response
  return true;
});

// Handle connection state changes
connectionStore.subscribe((state) => {
  // Broadcast account changes to all connected content scripts
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id && state.connectedOrigins.has(tab.url || '')) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'ACCOUNT_CHANGED',
          payload: { publicKey: state.publicKey },
        });
      }
    });
  });
});

// Clean up expired permissions periodically
setInterval(() => {
  permissionsStore.clearExpired();
}, 60 * 60 * 1000); // Every hour

// Initialize extension
console.log('DumpSack extension background script loaded');
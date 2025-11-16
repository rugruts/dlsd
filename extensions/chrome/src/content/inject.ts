// Content script to inject DumpSack provider into web pages

function injectProvider() {
  try {
    // Check if we're on an HTTP/HTTPS page (not chrome:// or file://)
    if (!window.location.protocol.startsWith('http')) {
      return;
    }

    // Check if provider is already injected
    if ((window as any).dumpsack) {
      return;
    }

    // Create and inject the provider script
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('provider.js');
    script.onload = () => {
      // Provider script loaded, initialize if needed
      if ((window as any).dumpsack) {
        console.log('DumpSack provider injected successfully');
      }
    };

    // Inject as early as possible
    const target = document.head || document.documentElement;
    target.insertBefore(script, target.firstChild);

  } catch (error) {
    console.error('Failed to inject DumpSack provider:', error);
  }
}

// Inject immediately
injectProvider();

// Also inject on DOM ready (for SPAs)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectProvider);
} else {
  // DOM already loaded
  setTimeout(injectProvider, 0);
}
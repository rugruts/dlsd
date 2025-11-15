import { DumpSackProvider, ProviderRequest, ProviderResponse } from '../../../packages/shared-types';

class ContentScriptProvider implements DumpSackProvider {
  public isDumpSack = true;
  private connected = false;
  private publicKey: string | null = null;

  constructor() {
    this.setupMessageListener();
  }

  private setupMessageListener() {
    window.addEventListener('message', (event) => {
      // Only accept messages from the same origin
      if (event.source !== window) return;

      const message = event.data;
      if (message.type === 'DUMPSACK_PROVIDER_REQUEST') {
        this.handleProviderRequest(message.payload);
      }
    });
  }

  private async handleProviderRequest(request: ProviderRequest) {
    try {
      let result: any;

      switch (request.method) {
        case 'connect':
          result = await this.connect();
          break;
        case 'disconnect':
          result = await this.disconnect();
          break;
        case 'signTransaction':
          result = await this.signTransaction(request.params[0]);
          break;
        case 'signAllTransactions':
          result = await this.signAllTransactions(request.params[0]);
          break;
        case 'signMessage':
          result = await this.signMessage(request.params[0]);
          break;
        default:
          throw new Error(`Unknown method: ${request.method}`);
      }

      this.sendResponse(request.id, result);
    } catch (error) {
      this.sendError(request.id, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private sendResponse(id: string, result: any) {
    window.postMessage({
      type: 'DUMPSACK_PROVIDER_RESPONSE',
      payload: {
        id,
        result,
      } as ProviderResponse,
    }, '*');
  }

  private sendError(id: string, message: string) {
    window.postMessage({
      type: 'DUMPSACK_PROVIDER_RESPONSE',
      payload: {
        id,
        error: {
          code: -32603,
          message,
        },
      } as ProviderResponse,
    }, '*');
  }

  async connect(): Promise<{ publicKey: string }> {
    // Send request to background script
    const response = await this.sendToBackground({
      method: 'connect',
      params: [],
    });

    this.connected = true;
    this.publicKey = response.publicKey;
    return response;
  }

  async disconnect(): Promise<void> {
    await this.sendToBackground({
      method: 'disconnect',
      params: [],
    });

    this.connected = false;
    this.publicKey = null;
  }

  async signTransaction(transaction: any): Promise<any> {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }

    return await this.sendToBackground({
      method: 'signTransaction',
      params: [transaction],
    });
  }

  async signAllTransactions(transactions: any[]): Promise<any[]> {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }

    return await this.sendToBackground({
      method: 'signAllTransactions',
      params: [transactions],
    });
  }

  async signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }> {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }

    return await this.sendToBackground({
      method: 'signMessage',
      params: [message],
    });
  }

  private async sendToBackground(request: Omit<ProviderRequest, 'id'>): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = Math.random().toString(36).substr(2, 9);

      const listener = (event: MessageEvent) => {
        if (event.data.type === 'DUMPSACK_BACKGROUND_RESPONSE' && event.data.payload.id === requestId) {
          window.removeEventListener('message', listener);

          if (event.data.payload.error) {
            reject(new Error(event.data.payload.error.message));
          } else {
            resolve(event.data.payload.result);
          }
        }
      };

      window.addEventListener('message', listener);

      // Send to background via chrome.runtime
      chrome.runtime.sendMessage({
        type: 'DUMPSACK_PROVIDER_REQUEST',
        payload: {
          id: requestId,
          ...request,
        } as ProviderRequest,
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        window.removeEventListener('message', listener);
        reject(new Error('Request timeout'));
      }, 30000);
    });
  }
}

// Inject the provider into the page
function injectProvider() {
  if ((window as any).dumpSack) {
    console.warn('DumpSack provider already exists');
    return;
  }

  const provider = new ContentScriptProvider();
  (window as any).dumpSack = provider;

  // Dispatch event to notify page that provider is ready
  window.dispatchEvent(new Event('dumpSack#ready'));
}

injectProvider();
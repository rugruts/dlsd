// Stub implementation for throne links module
export class ThroneLinksModule {
  async initialize() {
    console.log('Throne links module initialized');
  }

  async getThroneLinks() {
    // Stub implementation
    return [
      { id: '1', title: 'Link 1', url: 'https://example.com/1' },
      { id: '2', title: 'Link 2', url: 'https://example.com/2' },
    ];
  }

  async createThroneLink(title: string, url: string) {
    // Stub implementation
    console.log(`Creating throne link: ${title} -> ${url}`);
    return { success: true, id: 'mock_id' };
  }
}
export interface MessageRouter {
  handleMessage(message: any, sender: chrome.runtime.MessageSender): Promise<any>;
}

export interface ProviderMessage {
  type: string;
  payload?: any;
  id: string;
  origin: string;
}

export interface Permission {
  allowed: boolean;
  lastApproved: number;
}

export interface ConnectionState {
  publicKey: string | null;
  connectedOrigins: Set<string>;
}

export interface ApprovalRequest {
  origin: string;
  type: string;
  payload: any;
}

export interface SignatureResult {
  signature: string;
  publicKey: string;
}

export interface TransactionSignatureResult extends SignatureResult {
  serializedTransaction: string;
}

export interface RpcRequest {
  method: string;
  params: any[];
  id: string | number;
}

export interface RpcResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}
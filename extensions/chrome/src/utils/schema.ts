import { z } from 'zod';

// Base message schema
export const BaseMessageSchema = z.object({
  type: z.string(),
  id: z.string(),
  origin: z.string().url(),
});

// Connect message
export const ConnectMessageSchema = BaseMessageSchema.extend({
  type: z.literal('CONNECT'),
});

// Disconnect message
export const DisconnectMessageSchema = BaseMessageSchema.extend({
  type: z.literal('DISCONNECT'),
});

// Request accounts message
export const RequestAccountsMessageSchema = BaseMessageSchema.extend({
  type: z.literal('REQUEST_ACCOUNTS'),
});

// Get account message
export const GetAccountMessageSchema = BaseMessageSchema.extend({
  type: z.literal('GET_ACCOUNT'),
});

// Sign message
export const SignMessageSchema = BaseMessageSchema.extend({
  type: z.literal('SIGN_MESSAGE'),
  payload: z.object({
    message: z.array(z.number().int().min(0).max(255)), // Uint8Array as numbers
  }),
});

// Sign transaction
export const SignTransactionSchema = BaseMessageSchema.extend({
  type: z.literal('SIGN_TRANSACTION'),
  payload: z.object({
    transaction: z.string().base64(),
  }),
});

// Sign all transactions
export const SignAllTransactionsSchema = BaseMessageSchema.extend({
  type: z.literal('SIGN_ALL_TRANSACTIONS'),
  payload: z.object({
    transactions: z.array(z.string().base64()),
  }),
});

// RPC request
export const RpcRequestSchema = BaseMessageSchema.extend({
  type: z.literal('RPC_REQUEST'),
  payload: z.object({
    method: z.string(),
    params: z.array(z.any()).optional(),
  }),
});

// Union of all message types
export const MessageSchema = z.discriminatedUnion('type', [
  ConnectMessageSchema,
  DisconnectMessageSchema,
  RequestAccountsMessageSchema,
  GetAccountMessageSchema,
  SignMessageSchema,
  SignTransactionSchema,
  SignAllTransactionsSchema,
  RpcRequestSchema,
]);

// Type inference
export type Message = z.infer<typeof MessageSchema>;
export type ConnectMessage = z.infer<typeof ConnectMessageSchema>;
export type SignMessage = z.infer<typeof SignMessageSchema>;
export type SignTransactionMessage = z.infer<typeof SignTransactionSchema>;
export type RpcRequestMessage = z.infer<typeof RpcRequestSchema>;

// Validation function
export function validateMessage(data: unknown): Message {
  return MessageSchema.parse(data);
}

// Safe validation
export function safeValidateMessage(data: unknown): { success: true; data: Message } | { success: false; error: string } {
  try {
    const result = MessageSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Validation failed',
    };
  }
}
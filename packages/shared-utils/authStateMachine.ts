/**
 * DumpSack Authentication State Machine
 * Consistent auth state management for mobile and extension
 */

export enum AuthState {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  AUTHENTICATING = 'AUTHENTICATING',
  AUTHENTICATED = 'AUTHENTICATED',
  LOADING_WALLET = 'LOADING_WALLET',
  READY = 'READY',
  LOCKED = 'LOCKED', // Panic Bunker mode
}

export enum AuthEvent {
  SIGN_IN_START = 'SIGN_IN_START',
  SIGN_IN_SUCCESS = 'SIGN_IN_SUCCESS',
  SIGN_IN_FAILURE = 'SIGN_IN_FAILURE',
  WALLET_LOAD_START = 'WALLET_LOAD_START',
  WALLET_LOAD_SUCCESS = 'WALLET_LOAD_SUCCESS',
  WALLET_LOAD_FAILURE = 'WALLET_LOAD_FAILURE',
  SIGN_OUT = 'SIGN_OUT',
  PANIC_ACTIVATE = 'PANIC_ACTIVATE',
  PANIC_DEACTIVATE = 'PANIC_DEACTIVATE',
}

export interface AuthContext {
  userId?: string;
  email?: string;
  provider?: 'google' | 'email';
  walletAddress?: string;
  error?: string;
  panicMode?: boolean;
}

export interface AuthStateTransition {
  from: AuthState;
  event: AuthEvent;
  to: AuthState;
  guard?: (context: AuthContext) => boolean;
  action?: (context: AuthContext) => AuthContext;
}

// State machine transitions
const transitions: AuthStateTransition[] = [
  // Sign in flow
  {
    from: AuthState.UNAUTHENTICATED,
    event: AuthEvent.SIGN_IN_START,
    to: AuthState.AUTHENTICATING,
  },
  {
    from: AuthState.AUTHENTICATING,
    event: AuthEvent.SIGN_IN_SUCCESS,
    to: AuthState.AUTHENTICATED,
  },
  {
    from: AuthState.AUTHENTICATING,
    event: AuthEvent.SIGN_IN_FAILURE,
    to: AuthState.UNAUTHENTICATED,
  },
  
  // Wallet loading flow
  {
    from: AuthState.AUTHENTICATED,
    event: AuthEvent.WALLET_LOAD_START,
    to: AuthState.LOADING_WALLET,
  },
  {
    from: AuthState.LOADING_WALLET,
    event: AuthEvent.WALLET_LOAD_SUCCESS,
    to: AuthState.READY,
  },
  {
    from: AuthState.LOADING_WALLET,
    event: AuthEvent.WALLET_LOAD_FAILURE,
    to: AuthState.AUTHENTICATED,
  },
  
  // Sign out
  {
    from: AuthState.AUTHENTICATED,
    event: AuthEvent.SIGN_OUT,
    to: AuthState.UNAUTHENTICATED,
  },
  {
    from: AuthState.LOADING_WALLET,
    event: AuthEvent.SIGN_OUT,
    to: AuthState.UNAUTHENTICATED,
  },
  {
    from: AuthState.READY,
    event: AuthEvent.SIGN_OUT,
    to: AuthState.UNAUTHENTICATED,
  },
  {
    from: AuthState.LOCKED,
    event: AuthEvent.SIGN_OUT,
    to: AuthState.UNAUTHENTICATED,
  },
  
  // Panic mode
  {
    from: AuthState.READY,
    event: AuthEvent.PANIC_ACTIVATE,
    to: AuthState.LOCKED,
  },
  {
    from: AuthState.LOCKED,
    event: AuthEvent.PANIC_DEACTIVATE,
    to: AuthState.READY,
  },
];

export class AuthStateMachine {
  private currentState: AuthState;
  private context: AuthContext;
  private listeners: Array<(state: AuthState, context: AuthContext) => void> = [];

  constructor(initialState: AuthState = AuthState.UNAUTHENTICATED, initialContext: AuthContext = {}) {
    this.currentState = initialState;
    this.context = initialContext;
  }

  /**
   * Get current state
   */
  getState(): AuthState {
    return this.currentState;
  }

  /**
   * Get current context
   */
  getContext(): AuthContext {
    return { ...this.context };
  }

  /**
   * Send an event to the state machine
   */
  send(event: AuthEvent, payload?: Partial<AuthContext>): boolean {
    const transition = transitions.find(
      (t) => t.from === this.currentState && t.event === event
    );

    if (!transition) {
      console.warn(`No transition found for ${this.currentState} + ${event}`);
      return false;
    }

    // Check guard condition if exists
    if (transition.guard && !transition.guard(this.context)) {
      console.warn(`Guard condition failed for ${this.currentState} + ${event}`);
      return false;
    }

    // Update context with payload
    if (payload) {
      this.context = { ...this.context, ...payload };
    }

    // Execute action if exists
    if (transition.action) {
      this.context = transition.action(this.context);
    }

    // Transition to new state
    this.currentState = transition.to;

    // Notify listeners
    this.notifyListeners();

    return true;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: AuthState, context: AuthContext) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener(this.currentState, this.context);
    });
  }

  /**
   * Check if in a specific state
   */
  is(state: AuthState): boolean {
    return this.currentState === state;
  }

  /**
   * Check if authenticated (any authenticated state)
   */
  isAuthenticated(): boolean {
    return [
      AuthState.AUTHENTICATED,
      AuthState.LOADING_WALLET,
      AuthState.READY,
      AuthState.LOCKED,
    ].includes(this.currentState);
  }

  /**
   * Check if ready to use wallet
   */
  isReady(): boolean {
    return this.currentState === AuthState.READY;
  }

  /**
   * Check if in panic mode
   */
  isPanicMode(): boolean {
    return this.currentState === AuthState.LOCKED;
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.currentState = AuthState.UNAUTHENTICATED;
    this.context = {};
    this.notifyListeners();
  }
}

// Singleton instance for global use
let globalAuthStateMachine: AuthStateMachine | null = null;

export function getAuthStateMachine(): AuthStateMachine {
  if (!globalAuthStateMachine) {
    globalAuthStateMachine = new AuthStateMachine();
  }
  return globalAuthStateMachine;
}

export function resetAuthStateMachine(): void {
  globalAuthStateMachine = null;
}


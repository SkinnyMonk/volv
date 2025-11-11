import { Octopus } from './index';

class OctopusManager {
  constructor() {
    this.instance = null;
    this.visibilityTimeout = null;
    this.hiddenSince = null;
    this._connecting = false;
    this._connectPromise = null;
    this._blockReconnect = false;
    
    // Note: Visibility handling is done by the Octopus class itself
    // No need for duplicate visibility listener here
  }
  
  // Controls to block/allow any (re)connections
  blockReconnect() {
    this._blockReconnect = true;
  }
  allowReconnect() {
    this._blockReconnect = false;
  }
  
  // Check if we have valid credentials from localStorage
  _hasValidCredentials() {
    try {
      if (typeof window === 'undefined') {
        return false;
      }
      const authToken = localStorage.getItem('authToken');
      const user = localStorage.getItem('user');
      const hasValidCreds = Boolean(authToken && user);
      return hasValidCreds;
    } catch {
      return false;
    }
  }

  // Visibility changes are handled by the Octopus class itself
  // This prevents duplicate subscription refreshes
  
  // Read credentials from localStorage
  _getAuthCredentials() {
    try {
      if (typeof window === 'undefined') {
        return { loginId: '', token: '' };
      }
      const authToken = localStorage.getItem('authToken');
      const userJson = localStorage.getItem('user');
      let loginId = '';
      
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          loginId = user.loginId || '';
        } catch {
          // Failed to parse user JSON
        }
      }
      
      return {
        loginId: loginId || '',
        token: authToken || ''
      };
    } catch {
      return { loginId: '', token: '' };
    }
  }

  // Connect to WebSocket
  connect() {
    // Only connect if we're on the client side
    if (typeof window === 'undefined') {
      return Promise.resolve(false);
    }

    // Check valid credentials
    const hasValidCreds = this._hasValidCredentials();

    // Guard: Do not connect without valid creds
    if (this._blockReconnect || !hasValidCreds) {
      // If a connection exists, close it
      if (this.instance) {
        this.closeConnection();
      }
      return Promise.resolve(false);
    }

    // If already connected, short-circuit
    if (this.isConnected()) {
      return Promise.resolve(true);
    }

    // If a connection attempt is in-flight, reuse it
    if (this._connecting && this._connectPromise) {
      return this._connectPromise;
    }

    this._connecting = true;

    // Create new instance only if needed
    if (!this.instance) {
      // Get credentials using the correct method that reads from localStorage
      const credentials = this._getAuthCredentials();
      const wsHost = 'zyro.basanonline.com';
      
      this.instance = new Octopus({
        host: wsHost,
        path: '/ws/v1/feeds',
        loginId: credentials.loginId,
        token: credentials.token
      });
    }

    this._connectPromise = this.instance.connect()
      .then(() => {
        this._connecting = false;
        this._connectPromise = null;
        return true;
      })
      .catch((err) => {
        this._connecting = false;
        this._connectPromise = null;
        throw err;
      });

    return this._connectPromise;
  }

  // Close connection
  closeConnection() {
    if (this.instance && this.instance._socket) {
      try {
        // Disable any reconnects from the raw client and then close
        if (typeof this.instance.setShouldReconnect === 'function') {
          this.instance.setShouldReconnect(false);
        }
        this.instance._socket.close();
        this.instance = null;
      } catch {
        // Error closing WebSocket connection
      }
    }
  }

  wsHandler(params) {
    // Return null on server side
    if (typeof window === 'undefined') {
      return null;
    }

    // Do NOT auto-connect here; only AppLayout should manage connections
    if (!this.instance || this._blockReconnect) return null;
    return this.instance.wsHandler(params);
  }
  // Check if connected
  isConnected() {
    if (typeof window === 'undefined') {
      return false;
    }
    return this.instance && this.instance.isConnected();
  }
  
  // Refresh all subscriptions to get fresh data
  refreshSubscriptions() {
    if (this.instance) {
      return this.instance.refreshSubscriptions();
    }
    return false;
  }
  
  // Clean up resources
  cleanUp() {
    // Clear any pending timeout
    if (this.visibilityTimeout) {
      clearTimeout(this.visibilityTimeout);
      this.visibilityTimeout = null;
    }
    
    // Close connection
    this.closeConnection();
    this._connecting = false;
    this._connectPromise = null;
  }
}

// Create a singleton instance only on client side
let octopusInstance;

if (typeof window !== 'undefined') {
  octopusInstance = new OctopusManager();
  
  // Ensure cleanup on page unload
  window.addEventListener('beforeunload', () => {
    octopusInstance.cleanUp();
  });
} else {
  // Server-side fallback with safe methods
  octopusInstance = {
    connect: () => Promise.resolve(false),
    closeConnection: () => {},
    wsHandler: () => null,
    isConnected: () => false,
    refreshSubscriptions: () => false,
    cleanUp: () => {}
  };
}

export default octopusInstance;
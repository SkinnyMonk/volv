// import Logger from './logger';
import { getSubscriptionTopic, getSocketPublishObject } from './utilities';
import { decodeMessage } from './message';

export class Octopus {
  /**
   * @param {Object} [initParams={}]
   * @param {string} [initParams.path] - e.g. '/mqtt'
   * @param {string} [initParams.loginId] - will auto generate some random string if not provided
   * @param {string} [initParams.userName] - can be used for auth, we are not using auth for mqtt as of now
   * @param {string} [initParams.password] - can be used for auth, we are not using auth for mqtt as of now
   *
   */
  constructor(initParams = {}) {
    const { host, path, loginId, token } = initParams;

    this.uri = `wss://${host}${path}?login_id=${loginId}&token=${token}&device=web`;

    this._socket = null;
    this._reconnectionTimeout = 0;
    this._lastConnectedTimestamp = Date.now();
    this._topics = {};
    this._isTabVisible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
    this._processingMessages = true; // Start with processing enabled
    this._shouldReconnect = true; // Allow reconnects by default
    this._wasHidden = false; // Track if page was hidden
    this._lastActivityTime = Date.now();
    this._isReconnecting = false; // Prevent duplicate reconnection attempts
    this._messageCount = 0; // Track incoming messages
    this._reconnectDebounceTimer = null; // Debounce timer for reconnection
    
    // Set up visibility change listener only in browser
    if (typeof document !== 'undefined') {
      this._setupVisibilityListener();
      this._setupOnlineListener();
    }
    
    // this._maxCallbacksPerTopic = 10;
    this._sendHeartbeat = this._sendHeartbeat.bind(this);
    this.connect = this.connect.bind(this);
    this.wsHandler = this.wsHandler.bind(this);

    this._sendHeartbeat();
  }

  _setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      const wasVisible = this._isTabVisible;
      this._isTabVisible = document.visibilityState === 'visible';
      
      if (this._isTabVisible && !wasVisible) {
        // Tab/page has become visible (could be tab switch OR laptop wake)
        const timeSinceHidden = Date.now() - this._lastActivityTime;
        const isSocketOpen = this._socket && this._socket.readyState === WebSocket.OPEN;
        
        // If socket is not connected, always reconnect
        if (!isSocketOpen) {
          this._scheduleReconnect('Visibility-NoSocket');
        }
        // If page was hidden for a long time (likely laptop sleep), schedule fresh reconnection
        // This prevents flood of old messages and ensures we get current data
        else if (timeSinceHidden > 15000) {
          this._scheduleReconnect('Visibility');
        } else {
          // Short hide duration and socket connected - just resume message processing
          this._processingMessages = true;
        }
        
        this._wasHidden = false;
      } else if (!this._isTabVisible && wasVisible) {
        // Tab/page has become hidden
        this._wasHidden = true;
        this._lastActivityTime = Date.now();
        
        // Stop processing messages to prevent data buildup
        // But heartbeats will continue to keep connection alive
        this._processingMessages = false;
      }
    });
  }

  _setupOnlineListener() {
    // Handle network offline/online events (laptop sleep/wake, network disconnection)
    window.addEventListener('online', () => {
      // Update tab visibility state in case it changed during offline period
      this._isTabVisible = document.visibilityState === 'visible';
      
      if (this._isTabVisible) {
        // Check if socket is actually connected
        const isConnected = this._socket && this._socket.readyState === WebSocket.OPEN;
        
        if (!isConnected) {
          // Socket not connected - force fresh reconnection
          // Reset stuck flags
          this._isReconnecting = false;
          if (this._reconnectDebounceTimer) {
            clearTimeout(this._reconnectDebounceTimer);
            this._reconnectDebounceTimer = null;
          }
          
          // Now schedule reconnection
          this._scheduleReconnect('Online');
        }
      }
    });

    window.addEventListener('offline', () => {
      this._processingMessages = false;
      
      // Clear any pending reconnection timer
      if (this._reconnectDebounceTimer) {
        clearTimeout(this._reconnectDebounceTimer);
        this._reconnectDebounceTimer = null;
      }
      
      // Reset reconnecting flag to allow fresh reconnection when online
      if (this._isReconnecting) {
        this._isReconnecting = false;
      }
    });
  }

  // Debounced reconnection - consolidates multiple rapid-fire reconnection requests
  _scheduleReconnect() {
    // If already reconnecting, skip
    if (this._isReconnecting) {
      return;
    }
    
    // Clear any existing debounce timer
    if (this._reconnectDebounceTimer) {
      clearTimeout(this._reconnectDebounceTimer);
    }
    
    // Schedule reconnection after debounce delay
    this._reconnectDebounceTimer = setTimeout(() => {
      this._reconnectDebounceTimer = null;
      
      // Final check before reconnecting
      if (this._isReconnecting) {
        return;
      }
      
      this._forceReconnect();
    }, 300); // 300ms debounce window
  }

  _verifyConnection() {
    // Send a heartbeat to verify connection is still alive
    if (this._socket && this._socket.readyState === WebSocket.OPEN) {
      try {
        this._socket.send('{"a":"h","v":[],"m":""}');
        // Connection is valid, ensure message processing is enabled
        this._processingMessages = true;
      } catch {
        this._forceReconnect();
      }
    } else {
      this._forceReconnect();
    }
  }

  _forceReconnect() {
    // Prevent duplicate reconnection attempts
    if (this._isReconnecting) {
      return;
    }
    
    this._isReconnecting = true;
    
    // Clear any pending debounce timer
    if (this._reconnectDebounceTimer) {
      clearTimeout(this._reconnectDebounceTimer);
      this._reconnectDebounceTimer = null;
    }
    
    // IMPORTANT: Pause message processing BEFORE closing socket
    // This prevents processing any queued/old messages from the stale connection
    this._processingMessages = false;
    
    // Close existing connection if any
    // This discards all queued messages in the old socket
    if (this._socket) {
      try {
        this._socket.close();
      } catch {
        // Ignore errors during forced close
      }
    }
    
    // Reconnect if allowed
    if (this._shouldReconnect) {
      // Add small delay to ensure clean disconnect and discard of old messages
      setTimeout(() => {
        this.connect()
          .then(() => {
            this._isReconnecting = false;
          })
          .catch((err) => {
            console.error('Reconnection failed:', err);
            this._isReconnecting = false;
          });
      }, 500);
    } else {
      this._isReconnecting = false;
    }
  }

  _sendHeartbeat() {
    setInterval(() => {
      // Always send heartbeat to keep connection alive
      // Backend closes connection if heartbeat is not received
      if (this._socket && this._socket.readyState === WebSocket.OPEN) {
        try {
          this._socket.send('{"a":"h","v":[],"m":""}');
          // Update activity time when heartbeat is sent successfully
          this._lastActivityTime = Date.now();
        } catch {
          // Failed to send heartbeat
        }
      }
    }, 9500);
  }

  // Allow external controller to enable/disable internal reconnects
  setShouldReconnect(shouldReconnect) {
    this._shouldReconnect = Boolean(shouldReconnect);
  }

  connect() {
    return new Promise((resolve) => {
      try {
        this._socket = new WebSocket(this.uri);
      
        this._socket.binaryType = 'arraybuffer';

        this._socket.onopen = () => {
          resolve('socket connected');
          this._reconnectionTimeout = 0;
          this._lastActivityTime = Date.now(); // Update activity time on successful connection
          
          // Enable message processing when connection is established (only if tab visible)
          if (this._isTabVisible) {
            this._processingMessages = true;
          }
          
          // ALWAYS resubscribe to all active topics (regardless of tab visibility)
          // This is critical: ensures subscriptions work even after laptop wake when visibility might be stale
          Object.values(this._topics).forEach(({ subscriptionObj }) => {
            this._socket.send(subscriptionObj);
          });
        }

        this._socket.onmessage = (event) => {
          // Update activity time on every message
          this._lastActivityTime = Date.now();
          this._messageCount++;
          
          // Only process messages if tab is visible, processing is enabled, AND not reconnecting
          // Skip messages if we're reconnecting (to avoid processing old queued messages)
          if (!this._isTabVisible || !this._processingMessages || this._isReconnecting) {
            // Messages are being received but not processed
            // This is intentional - we discard old messages during reconnection
            return;
          }
          
          const buffer = event.data;
          
          try {
            const message = decodeMessage(buffer);
            
            const topic = message.topic;
            const subscriptions = (this._topics[topic] || {}).subscriptions || [];
            
            // Invoke all subscriptions for this topic
            if (subscriptions.length > 0) {
              subscriptions.forEach((callback) => {
                try {
                  if (typeof callback === 'function') {
                    callback(message);
                  }
                } catch {
                  // Error in callback
                }
              });
            }
          } catch {
            // Error decoding message
          }
        }

        this._socket.onclose = () => {
          // If we're in the middle of a forced reconnect, skip auto-reconnect
          // The forced reconnect will handle creating the new connection
          if (this._isReconnecting) {
            return;
          }
          
          // If there's a pending scheduled reconnect, skip auto-reconnect
          // The scheduled reconnect will handle it
          if (this._reconnectDebounceTimer) {
            return;
          }
          
          // Only auto-reconnect if allowed, tab is visible, and not already reconnecting
          if (this._shouldReconnect && this._isTabVisible) {
            this._scheduleReconnect('SocketClose');
          }
        }

        this._socket.onerror = () => {
          // ALWAYS attempt reconnection if tab is visible
          if (this._isTabVisible && this._shouldReconnect) {
            // If not already reconnecting, schedule it
            if (!this._isReconnecting) {
              this._scheduleReconnect('SocketError');
            }
            
            // ALWAYS start safety timer (even if already reconnecting)
            // This catches stuck reconnections
            setTimeout(() => {
              const isConnected = this._socket && this._socket.readyState === WebSocket.OPEN;
              if (!isConnected && this._isTabVisible) {
                // Reset ALL flags and force reconnection
                this._isReconnecting = false;
                if (this._reconnectDebounceTimer) {
                  clearTimeout(this._reconnectDebounceTimer);
                  this._reconnectDebounceTimer = null;
                }
                this._forceReconnect();
              }
            }, 3000);
          }
        }
      } catch {
        resolve(false);
        return;
      }
    });
  }

  wsHandler({ messageType, payload } = {}) {
    const topic = getSubscriptionTopic({ messageType, payload });    
    const partialSubscriptionObj = getSocketPublishObject({
      messageType,
      payload
    });    
    const subscriptionObj = JSON.stringify({ ...partialSubscriptionObj, a: 'subscribe' });
    const unsubscriptionObj = JSON.stringify({ ...partialSubscriptionObj, a: 'unsubscribe' });
    
    let subscribedCallback = null;
    
    return {
      subscribe: (callback) => {
        return new Promise((resolve) => {
          if (!this._topics[topic]) {
            this._topics[topic] = {
              subscriptionObj,
              subscriptions: [],
            };
          }    

          // Store the callback for later unsubscription
          subscribedCallback = callback;
          this._topics[topic].subscriptions.push(callback);

          if (this._socket && this._socket.readyState === WebSocket.OPEN) {
            // Only send WebSocket subscribe if this is the FIRST subscription to this topic
            // This prevents unnecessary unsubscribe/subscribe cycles
            if (this._topics[topic].subscriptions.length === 1) {
              this._socket.send(subscriptionObj);
            }
            resolve('subscribed');
          } else {
            // Will be auto subscribed when connection is established
            resolve('queued');
          }
        });
      },
      unsubscribe: () => {
        return new Promise((resolve) => {
          if (!this._topics[topic]) {
            resolve('not subscribed');
            return;
          }

          const subscriptions = this._topics[topic].subscriptions || [];
          
          // Remove the callback we stored during subscribe
          if (subscribedCallback) {
            const index = subscriptions.indexOf(subscribedCallback);
            if (index > -1) {
              subscriptions.splice(index, 1);
            }
          }

          resolve('unsubscribed');
          
          if (subscriptions.length === 0 && this._socket) {
            this._socket.send(unsubscriptionObj);
          }
        });
      }
    }
  }
  
  // Method to check if connection is ready
  isConnected() {
    return this._socket && this._socket.readyState === WebSocket.OPEN;
  }
  
  // Method to refresh all subscriptions
  refreshSubscriptions() {
    if (this._socket && this._socket.readyState === WebSocket.OPEN) {
      const topics = Object.keys(this._topics);
      
      if (topics.length === 0) {
        return false;
      }
      
      Object.values(this._topics).forEach(({ subscriptionObj }) => {
        this._socket.send(subscriptionObj);
      });
      
      return true;
    }
    return false;
  }
}
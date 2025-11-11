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
    console.log('[Octopus] Constructor called with params:', {
      host,
      path,
      loginId: loginId ? `${String(loginId).substring(0, 10)}...` : 'null',
      token: token ? `${String(token).substring(0, 10)}...` : 'null',
    });

    this.uri = `wss://${host}${path}?login_id=${loginId}&token=${token}&device=web`;
    console.log('[Octopus] WebSocket URI constructed:', this.uri);

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

    console.log('[Octopus] Constructor completed. Tab visible:', this._isTabVisible);
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
  _scheduleReconnect(source = 'unknown') {
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
      } catch (e) {
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
      } catch (e) {
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
    let heartbeatCount = 0;
    setInterval(() => {
      // Always send heartbeat to keep connection alive
      // Backend closes connection if heartbeat is not received
      if (this._socket && this._socket.readyState === WebSocket.OPEN) {
        try {
          heartbeatCount++;
          this._socket.send('{"a":"h","v":[],"m":""}');
          // Update activity time when heartbeat is sent successfully
          this._lastActivityTime = Date.now();
          
          // Log heartbeat every 6 sends (every ~57 seconds)
          if (heartbeatCount % 6 === 0) {
            console.log('[Octopus.heartbeat] ✓ Heartbeat sent', {
              count: heartbeatCount,
              messagesReceived: this._messageCount,
              topicsSubscribed: Object.keys(this._topics).length,
              socketConnected: this._socket.readyState === WebSocket.OPEN
            });
          }
        } catch (e) {
          console.error('[Octopus.heartbeat] Failed to send heartbeat:', e);
        }
      }
    }, 9500);
  }

  // Allow external controller to enable/disable internal reconnects
  setShouldReconnect(shouldReconnect) {
    this._shouldReconnect = Boolean(shouldReconnect);
  }

  connect() {
    console.log('[Octopus.connect] Starting WebSocket connection to:', this.uri);
    console.log('[Octopus.connect] Current state - shouldReconnect:', this._shouldReconnect, 'isReconnecting:', this._isReconnecting);
    
    return new Promise((resolve) => {
      console.log('[Octopus.connect] Creating WebSocket instance...');
      console.log('[Octopus.connect] URI details:', {
        protocol: 'wss (secure)',
        host: this.uri.split('?')[0],
        hasCredentials: this.uri.includes('login_id=') && this.uri.includes('token='),
        credentialsPreview: this.uri.substring(0, 80) + '...'
      });
      
      try {
        this._socket = new WebSocket(this.uri);
        console.log('[Octopus.connect] WebSocket instance created successfully');
      } catch (error) {
        console.error('[Octopus.connect] Failed to create WebSocket instance:', error);
        resolve(false);
        return;
      }
      
      this._socket.binaryType = 'arraybuffer';
      console.log('[Octopus.connect] Binary type set to arraybuffer');

      this._socket.onopen = () => {
        console.log('[Octopus] ✓ WebSocket connection OPEN');
        console.log('[Octopus.onopen] Connection details:', {
          url: this._socket.url,
          readyState: this._socket.readyState,
          protocol: this._socket.protocol
        });
        console.log('[Octopus.onopen] Resolving connection promise');
        resolve('socket connected');
        this._reconnectionTimeout = 0;
        this._lastActivityTime = Date.now(); // Update activity time on successful connection
        
        // Enable message processing when connection is established (only if tab visible)
        if (this._isTabVisible) {
          this._processingMessages = true;
          console.log('[Octopus.onopen] Tab is visible - message processing ENABLED');
        } else {
          console.log('[Octopus.onopen] Tab is hidden - message processing will be disabled');
        }
        
        // ALWAYS resubscribe to all active topics (regardless of tab visibility)
        // This is critical: ensures subscriptions work even after laptop wake when visibility might be stale
        const topicCount = Object.keys(this._topics).length;
        console.log('[Octopus.onopen] Resubscribing to', topicCount, 'active topics');
        Object.values(this._topics).forEach(({ subscriptionObj }) => {
          this._socket.send(subscriptionObj);
        });
        console.log('[Octopus.onopen] Resubscription complete');
        
        // Log diagnostic info
        console.log('[Octopus.onopen] 📊 Connection established - awaiting market data...');
        console.log('[Octopus.onopen] Subscriptions sent. If no market data arrives, check:');
        console.log('  1. Market is open/active');
        console.log('  2. Server has data for these tokens');
        console.log('  3. Network connection is stable');
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
          if (!this._isTabVisible) {
            console.debug('[Octopus.onmessage] Skipping - tab is hidden');
          }
          return;
        }
        
        const buffer = event.data;
        console.log('[Octopus.onmessage] 📨 Raw message received', {
          count: this._messageCount,
          bufferSize: buffer.byteLength,
          bufferType: buffer.constructor.name
        });
        
        try {
          const message = decodeMessage(buffer);
          console.log('[Octopus.onmessage] ✓ Message decoded successfully', {
            topic: message.topic,
            msgKeys: Object.keys(message.msg || {})
          });
          
          const topic = message.topic;
          const subscriptions = (this._topics[topic] || {}).subscriptions || [];
          
          console.log('[Octopus.onmessage] Looking for subscriptions:', {
            topic,
            found: subscriptions.length,
            allTopics: Object.keys(this._topics)
          });
          
          // Log with details about the message
          if (subscriptions.length > 0) {
            console.log('[Octopus.onmessage] ✓ Received market data:', {
              count: this._messageCount,
              topic,
              subscriptionCount: subscriptions.length,
              messageType: message.msg?.markupLtp ? 'MarkupData' : message.msg?.ltp ? 'DetailMarketData' : 'Unknown',
              ltp: message.msg?.ltp || message.msg?.markupLtp || 'N/A',
              fullMsg: JSON.stringify(message.msg).substring(0, 100)
            });
            
            subscriptions.forEach((callback) => {
              try {
                if (typeof callback === 'function') {
                  callback(message);
                } else {
                  console.warn('[Octopus.onmessage] Callback is not a function:', typeof callback);
                }
              } catch (cbError) {
                console.error('[Octopus.onmessage] Error in callback:', cbError);
              }
            });
          } else {
            console.warn('[Octopus.onmessage] ⚠️ Received message for topic with NO subscriptions:', {
              topic,
              availableTopics: Object.keys(this._topics),
              message: JSON.stringify(message).substring(0, 100)
            });
          }
        } catch (error) {
          console.error('[Octopus.onmessage] ❌ Error decoding message:', {
            error: error.message,
            errorStack: error.stack,
            bufferSize: buffer.byteLength,
            firstBytes: new Uint8Array(buffer.slice(0, 20))
          });
        }
      }

      this._socket.onclose = () => {
        console.log('[Octopus] ✗ WebSocket connection CLOSED');
        console.log('[Octopus.onclose] State - isReconnecting:', this._isReconnecting, 'hasDebounceTimer:', !!this._reconnectDebounceTimer);
        
        // If we're in the middle of a forced reconnect, skip auto-reconnect
        // The forced reconnect will handle creating the new connection
        if (this._isReconnecting) {
          console.log('[Octopus.onclose] Already reconnecting - skipping auto-reconnect');
          return;
        }
        
        // If there's a pending scheduled reconnect, skip auto-reconnect
        // The scheduled reconnect will handle it
        if (this._reconnectDebounceTimer) {
          console.log('[Octopus.onclose] Debounce timer pending - skipping auto-reconnect');
          return;
        }
        
        // Only auto-reconnect if allowed, tab is visible, and not already reconnecting
        if (this._shouldReconnect && this._isTabVisible) {
          console.log('[Octopus.onclose] Scheduling reconnect - shouldReconnect:', this._shouldReconnect, 'tabVisible:', this._isTabVisible);
          this._scheduleReconnect('SocketClose');
        } else {
          console.log('[Octopus.onclose] NOT reconnecting - shouldReconnect:', this._shouldReconnect, 'tabVisible:', this._isTabVisible);
        }
      }

      this._socket.onerror = (err) => {
        console.error('[Octopus] ✗ WebSocket ERROR occurred');
        
        // Log detailed error information
        if (err instanceof Event) {
          console.error('[Octopus.onerror] Error type: WebSocket Event');
          console.error('[Octopus.onerror] Event type:', err.type);
          console.error('[Octopus.onerror] WebSocket readyState:', this._socket.readyState, '(0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)');
        } else if (err instanceof Error) {
          console.error('[Octopus.onerror] Error type: Error object');
          console.error('[Octopus.onerror] Error message:', err.message);
          console.error('[Octopus.onerror] Error stack:', err.stack);
        } else {
          console.error('[Octopus.onerror] Error type:', typeof err);
          console.error('[Octopus.onerror] Error value:', err);
        }
        
        console.log('[Octopus.onerror] Current connection state:', {
          uri: this.uri,
          shouldReconnect: this._shouldReconnect,
          tabVisible: this._isTabVisible,
          isReconnecting: this._isReconnecting,
          socketReadyState: this._socket?.readyState
        });
        
        // ALWAYS attempt reconnection if tab is visible
        if (this._isTabVisible && this._shouldReconnect) {
          // If not already reconnecting, schedule it
          if (!this._isReconnecting) {
            console.log('[Octopus.onerror] Scheduling reconnect due to socket error');
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
    });
  }

  wsHandler({ messageType, payload, subscriptionLocation } = {}) {
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
            console.log('[Octopus.subscribe] Created new topic entry:', topic);
          }    

          // Store the callback for later unsubscription
          subscribedCallback = callback;
          this._topics[topic].subscriptions.push(callback);
          
          console.log('[Octopus.subscribe] ✓ Added subscription:', {
            topic,
            totalSubscriptionsForTopic: this._topics[topic].subscriptions.length,
            allTopics: Object.keys(this._topics).length
          });

          if (this._socket && this._socket.readyState === WebSocket.OPEN) {
            // Only send WebSocket subscribe if this is the FIRST subscription to this topic
            // This prevents unnecessary unsubscribe/subscribe cycles
            if (this._topics[topic].subscriptions.length === 1) {
              console.log('[Octopus.subscribe] Sending subscription to server:', {
                topic,
                subscriptionObj: JSON.parse(subscriptionObj)
              });
              this._socket.send(subscriptionObj);
              console.log('[Octopus.subscribe] ✓ Subscription sent to server');
            } else {
              console.log('[Octopus.subscribe] Multiple subscriptions for topic - not resending to server', {
                topic,
                totalSubs: this._topics[topic].subscriptions.length
              });
            }
            resolve('subscribed');
          } else {
            // Will be auto subscribed when connection is established
            console.log('[Octopus.subscribe] Socket not ready - subscription will be sent on reconnect:', topic);
            resolve('queued');
          }
        });
      },
      unsubscribe: () => {
        return new Promise((resolve) => {
          if (!this._topics[topic]) {
            console.warn('[Octopus.unsubscribe] Topic not found:', topic);
            resolve('not subscribed');
            return;
          }

          const subscriptions = this._topics[topic].subscriptions || [];
          const initialLength = subscriptions.length;
          
          // Remove the callback we stored during subscribe
          if (subscribedCallback) {
            const index = subscriptions.indexOf(subscribedCallback);
            if (index > -1) {
              subscriptions.splice(index, 1);
            }
          }

          console.log('[Octopus.unsubscribe] Unsubscribe requested:', {
            topic,
            removedCount: initialLength - subscriptions.length,
            remainingSubscriptions: subscriptions.length
          });

          resolve('unsubscribed');
          
          if (subscriptions.length === 0 && this._socket) {
            console.log('[Octopus.unsubscribe] No more subscriptions for topic, sending unsubscribe to server:', topic);
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
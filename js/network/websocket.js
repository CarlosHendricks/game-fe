import { CONFIG } from '../config.js';

/**
 * WebSocket client for game communication
 */
export class GameWebSocket {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.onMessageCallbacks = [];
  }

  /**
   * Connect to the game server
   */
  connect() {
    console.log(`Connecting to ${CONFIG.SERVER_URL}...`);
    
    try {
      this.ws = new WebSocket(CONFIG.SERVER_URL);
      
      this.ws.onopen = () => this.handleOpen();
      this.ws.onmessage = (event) => this.handleMessage(event);
      this.ws.onerror = (error) => this.handleError(error);
      this.ws.onclose = (event) => this.handleClose(event);
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Handle connection open
   */
  handleOpen() {
    console.log('Connected to game server');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    // Send a test message
    this.send({ type: 'hello', data: 'Client connected' });
  }

  /**
   * Handle incoming message
   */
  handleMessage(event) {
    console.log('Received message:', event.data);
    
    try {
      const data = JSON.parse(event.data);
      this.onMessageCallbacks.forEach(callback => callback(data));
    } catch (e) {
      // Not JSON, treat as plain text
      console.log('Plain text message:', event.data);
    }
  }

  /**
   * Handle connection error
   */
  handleError(error) {
    console.error('WebSocket error:', error);
  }

  /**
   * Handle connection close
   */
  handleClose(event) {
    console.log('Disconnected from game server', event.code, event.reason);
    this.isConnected = false;
    
    if (!event.wasClean) {
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= CONFIG.MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    console.log(`Reconnecting in ${CONFIG.RECONNECT_DELAY}ms (attempt ${this.reconnectAttempts}/${CONFIG.MAX_RECONNECT_ATTEMPTS})...`);
    
    setTimeout(() => {
      this.connect();
    }, CONFIG.RECONNECT_DELAY);
  }

  /**
   * Send message to server
   */
  send(data) {
    if (!this.isConnected || !this.ws) {
      console.error('Cannot send message: not connected');
      return;
    }
    
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    this.ws.send(message);
  }

  /**
   * Register callback for incoming messages
   */
  onMessage(callback) {
    this.onMessageCallbacks.push(callback);
  }

  /**
   * Close connection
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

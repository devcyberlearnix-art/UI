/**
 * ============================================================================
 * ASIVO STUDIO / FD_LMS REAL-TIME STOMP WEBSOCKET CLIENT
 * Duplex Messaging Mesh: Notification & Live Discussion Broker
 * Destination: /ws/notifications via Spring Cloud API Gateway (Port 8080)
 * ============================================================================
 */

export class StompClient {
  constructor(url, token = null) {
    this.url = url;
    this.token = token;
    this.socket = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.subIdCounter = 0;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.listeners = {
      connected: [],
      disconnected: [],
      error: [],
    };
  }

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.socket = new WebSocket(this.url);
    } catch (e) {
      this._handleError(e);
      this._scheduleReconnect();
      return;
    }

    this.socket.onopen = () => {
      this._sendFrame('CONNECT', {
        'accept-version': '1.2,1.1,1.0',
        'heart-beat': '10000,10000',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      });
    };

    this.socket.onmessage = (event) => {
      this._handleRawMessage(event.data);
    };

    this.socket.onerror = (error) => {
      this._handleError(error);
    };

    this.socket.onclose = () => {
      this.connected = false;
      this.listeners.disconnected.forEach((fn) => fn());
      this._scheduleReconnect();
    };
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.connected && this.socket) {
      this._sendFrame('DISCONNECT', {});
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.connected = false;
    this.subscriptions.clear();
  }

  subscribe(destination, callback) {
    const subId = `sub-${this.subIdCounter++}`;
    this.subscriptions.set(subId, { destination, callback });

    if (this.connected) {
      this._sendFrame('SUBSCRIBE', {
        id: subId,
        destination,
        ack: 'auto',
      });
    }

    return () => {
      if (this.subscriptions.has(subId)) {
        this.subscriptions.delete(subId);
        if (this.connected) {
          this._sendFrame('UNSUBSCRIBE', { id: subId });
        }
      }
    };
  }

  send(destination, headers = {}, body = '') {
    if (!this.connected) {
      console.warn('[StompClient] Not connected. Cannot send frame to:', destination);
      return;
    }
    const payload = typeof body === 'object' ? JSON.stringify(body) : String(body);
    this._sendFrame('SEND', { destination, 'content-type': 'application/json', ...headers }, payload);
  }

  on(event, handler) {
    if (this.listeners[event]) {
      this.listeners[event].push(handler);
    }
    return () => {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter((h) => h !== handler);
      }
    };
  }

  _sendFrame(command, headers = {}, body = '') {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    let frame = `${command}\n`;
    for (const [k, v] of Object.entries(headers)) {
      if (v !== undefined && v !== null) {
        frame += `${k}:${v}\n`;
      }
    }
    frame += '\n';
    if (body) {
      frame += body;
    }
    frame += '\0';
    this.socket.send(frame);
  }

  _handleRawMessage(data) {
    if (typeof data !== 'string') return;
    const parts = data.split('\0');
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      this._parseFrame(trimmed);
    }
  }

  _parseFrame(frameText) {
    const lines = frameText.split('\n');
    const command = lines[0]?.trim();
    const headers = {};
    let bodyIndex = 1;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line === '' || line === '\r') {
        bodyIndex = i + 1;
        break;
      }
      const separatorIdx = line.indexOf(':');
      if (separatorIdx > 0) {
        const key = line.substring(0, separatorIdx).trim();
        const value = line.substring(separatorIdx + 1).trim();
        headers[key] = value;
      }
    }

    const body = lines.slice(bodyIndex).join('\n');

    if (command === 'CONNECTED') {
      this.connected = true;
      this.reconnectAttempts = 0;
      this.listeners.connected.forEach((fn) => fn());

      // Resubscribe to existing topics
      for (const [subId, sub] of this.subscriptions.entries()) {
        this._sendFrame('SUBSCRIBE', {
          id: subId,
          destination: sub.destination,
          ack: 'auto',
        });
      }
    } else if (command === 'MESSAGE') {
      const subId = headers.subscription;
      const sub = this.subscriptions.get(subId);
      let parsedBody = body;
      try {
        parsedBody = JSON.parse(body);
      } catch (e) {
        // Leave as string
      }
      if (sub && typeof sub.callback === 'function') {
        sub.callback(parsedBody, headers);
      }
    } else if (command === 'ERROR') {
      console.warn('[StompClient] Server error frame received:', headers['message'], body);
      this.listeners.error.forEach((fn) => fn({ headers, body }));
    }
  }

  _handleError(error) {
    this.listeners.error.forEach((fn) => fn(error));
  }

  _scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }
}

/**
 * Creates or retrieves the singleton StompClient instance
 */
let stompInstance = null;

export const getStompClient = () => {
  if (!stompInstance && typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Connect through the Spring Cloud API Gateway on 8080 or current host
    const host = window.location.port === '5173' ? 'localhost:8080' : window.location.host;
    const wsUrl = `${protocol}//${host}/ws/notifications/websocket`;
    const token = localStorage.getItem('token') || localStorage.getItem('jwt');
    stompInstance = new StompClient(wsUrl, token);
  }
  return stompInstance;
};

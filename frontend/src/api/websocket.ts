import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;

  connect(sessionId: number) {
    this.socket = io('http://localhost:8000', {
      path: '/api/v1/ws/emotion',
      query: { session_id: sessionId },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return this.socket;
  }

  sendEmotion(emotion: string, confidence: number) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('emotion_data', {
        emotion,
        confidence,
        timestamp: new Date().toISOString(),
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new WebSocketService();
import { io, type Socket } from 'socket.io-client';
import { WS_BASE_URL } from '@/lib/constants';

let socket: Socket | null = null;

export function connectRealtimeSocket(accessToken: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.auth = { token: accessToken };
    socket.connect();
    return socket;
  }

  socket = io(`${WS_BASE_URL}/realtime`, {
    auth: { token: accessToken },
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
  });

  return socket;
}

export function disconnectRealtimeSocket(): void {
  if (!socket) {
    return;
  }

  socket.disconnect();
  socket = null;
}

export function getRealtimeSocket(): Socket | null {
  return socket;
}

import { io } from 'socket.io-client';

export const socket = io('http://localhost:5000', {
  withCredentials: true,
  autoConnect: false, // we'll connect manually once we know the user is logged in
});
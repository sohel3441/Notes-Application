// import { io } from "socket.io-client";

// export const socket = io(import.meta.env.VITE_SOCKET_URL);


import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  transports: ["websocket"],   // force websocket
  withCredentials: true,       // needed if using auth/cookies
  autoConnect: true,           // optional, default true
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

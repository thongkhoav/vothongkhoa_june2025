// socket.ts (setup once)
import { READ_ENV } from "@/utils/constants";
import io from "socket.io-client";
export const socket = io(READ_ENV.API_URL || "localhost:3333", {
  transports: ["websocket"],
  autoConnect: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

import "dotenv/config";
import { createServer } from "node:http";

import app from "./app.js";
import { initializeSocket } from "./socket.js";

const PORT = Number(process.env.PORT) || 3000;

const httpServer = createServer(app);

// Initialize authenticated Socket.IO.
initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Authenticated Socket.IO initialized");
});

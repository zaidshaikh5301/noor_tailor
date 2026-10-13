import type { Server } from "node:http";
import { env } from "./config/env.js";
import { connectDb, disconnectDb } from "./config/db.js";
import { createApp } from "./app.js";

export async function startServer(): Promise<void> {
  await connectDb();

  const app = createApp();
  const server: Server = app.listen(env.PORT, () => {
    console.log(`[server] listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async (): Promise<void> => {
    console.log("[server] shutting down...");
    server.close();
    await disconnectDb();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer().catch((err) => {
  console.error("[server] failed to start:", err);
  process.exit(1);
});

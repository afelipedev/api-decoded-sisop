import type { IncomingMessage, ServerResponse } from "node:http";
import { buildApp } from "../src/app.js";

// Reutiliza a instância entre invocações (cold start apenas na primeira).
let appPromise: ReturnType<typeof buildApp> | null = null;

async function getApp() {
  if (!appPromise) {
    appPromise = buildApp().then(async (app) => {
      await app.ready();
      return app;
    });
  }
  return appPromise;
}

/** Handler serverless da Vercel: encaminha req/res para o Fastify. */
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const app = await getApp();
  app.server.emit("request", req, res);
}

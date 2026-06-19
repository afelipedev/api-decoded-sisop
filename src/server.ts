import { buildApp } from "./app.js";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";

/** Entrypoint local: sobe o servidor HTTP na porta 3000. */
async function start(): Promise<void> {
  const app = await buildApp();
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Servidor disponível em http://localhost:${PORT}`);
    app.log.info(`Swagger em http://localhost:${PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

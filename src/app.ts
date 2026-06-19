import Fastify, {
  type FastifyError,
  type FastifyInstance,
} from "fastify";
import { ZodError } from "zod";
import { registerSwagger } from "./docs/swagger.js";
import { decodeFileRoute } from "./routes/decode-file.js";
import { InvalidBase64Error } from "./services/file.service.js";

// 50 MB (PRD §14) + margem para overhead do Base64 (~33%) e do JSON.
const BODY_LIMIT = 70 * 1024 * 1024;

/**
 * Constrói a instância Fastify (sem `listen`), reutilizável tanto pelo
 * servidor local (server.ts) quanto pelo handler serverless (api/index.ts).
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
    bodyLimit: BODY_LIMIT,
  });

  // Error handler global → resposta padronizada { success, message } (pt-BR).
  app.setErrorHandler((error: FastifyError, _request, reply) => {
    if (error instanceof ZodError) {
      // RN001–RN003 / RN006: campos obrigatórios ausentes → 400.
      const message = error.issues[0]?.message ?? "Payload inválido";
      return reply.status(400).send({ success: false, message });
    }

    if (error instanceof InvalidBase64Error) {
      // RN005/RN006: Base64 inválido → 400.
      return reply.status(400).send({ success: false, message: error.message });
    }

    // Validação de schema do Fastify (campos obrigatórios ausentes) → 400.
    if (error.validation && error.validation.length > 0) {
      const missing = error.validation.find(
        (v) => v.keyword === "required",
      )?.params?.missingProperty as string | undefined;
      const message = missing
        ? `Campo ${missing} obrigatório`
        : "Payload inválido";
      return reply.status(400).send({ success: false, message });
    }

    // Body JSON malformado / excede o limite → 400.
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      return reply
        .status(error.statusCode)
        .send({ success: false, message: "Payload inválido" });
    }

    app.log.error(error);
    return reply.status(500).send({ success: false, message: "Erro interno" });
  });

  await registerSwagger(app);
  await app.register(decodeFileRoute);

  return app;
}

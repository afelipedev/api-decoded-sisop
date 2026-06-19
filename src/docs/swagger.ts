import type { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

/**
 * Registra a documentação OpenAPI 3.0 e a UI interativa em GET /docs
 * (Try It Out + download do JSON da especificação).
 */
export async function registerSwagger(app: FastifyInstance): Promise<void> {
  await app.register(swagger, {
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "Base64 File Decoder API",
        description:
          "Microserviço que converte arquivos codificados em Base64 em binários para download.",
        version: "1.0.0",
      },
      tags: [{ name: "decode", description: "Conversão de arquivos" }],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
  });
}

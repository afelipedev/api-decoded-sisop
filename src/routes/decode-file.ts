import type { FastifyInstance } from "fastify";
import { decodeSchema } from "../schemas/decode.schema.js";
import { decodeBase64, resolveExtension } from "../services/file.service.js";

/**
 * Plugin Fastify: POST /api/decode-file
 *
 * Valida o payload (Zod), decodifica o Base64 em memória e devolve o binário
 * com os headers de download preservando o nome original (RN008).
 */
export async function decodeFileRoute(app: FastifyInstance): Promise<void> {
  app.post(
    "/api/decode-file",
    {
      schema: {
        summary: "Converte Base64 em arquivo binário",
        description:
          "Recebe um arquivo codificado em Base64 e retorna o binário correspondente para download.",
        tags: ["decode"],
        body: {
          type: "object",
          required: ["Escola"],
          properties: {
            Escola: {
              type: "object",
              required: ["File"],
              properties: {
                INEP: { type: "string" },
                Date: { type: "string" },
                File: {
                  type: "object",
                  required: ["filename", "mime-type", "base64"],
                  properties: {
                    filename: { type: "string" },
                    "mime-type": { type: "string" },
                    extension: { type: "string" },
                    base64: { type: "string" },
                  },
                },
              },
            },
          },
        },
        response: {
          200: {
            description: "Arquivo binário retornado para download.",
            type: "string",
            format: "binary",
          },
          400: {
            description: "Payload ou Base64 inválido.",
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      // Validação do payload (RN001–RN003). Erros do Zod são tratados
      // pelo error handler global (app.ts) → 400 com mensagem pt-BR.
      const { Escola } = decodeSchema.parse(request.body);
      const file = Escola.File;

      // RN005: valida + decodifica em memória (lança InvalidBase64Error → 400).
      const buffer = decodeBase64(file.base64);

      // RN004: garante extensão coerente no nome retornado.
      const extension = resolveExtension(file.filename, file.extension);
      const filename =
        extension && !file.filename.toLowerCase().endsWith(extension)
          ? `${file.filename}${extension}`
          : file.filename;

      // RN008: preserva o nome original no download.
      return reply
        .header("Content-Type", file["mime-type"])
        .header(
          "Content-Disposition",
          `attachment; filename="${filename}"`,
        )
        .send(buffer);
    },
  );
}

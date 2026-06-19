import { z } from "zod";

/**
 * Schema de validação do payload de entrada (PRD §5 / RN001–RN004).
 *
 * O arquivo vem aninhado em `Escola.File` — não no nível raiz.
 * Mensagens em pt-BR conforme contrato.
 */
export const fileSchema = z.object({
  filename: z
    .string({ required_error: "Campo filename obrigatório" })
    .min(1, "Campo filename obrigatório"),
  "mime-type": z
    .string({ required_error: "Campo mime-type obrigatório" })
    .min(1, "Campo mime-type obrigatório"),
  // RN004: extensão é opcional; quando ausente é derivada do filename.
  extension: z.string().optional(),
  base64: z
    .string({ required_error: "Campo base64 obrigatório" })
    .min(1, "Campo base64 obrigatório"),
});

export const decodeSchema = z.object({
  Escola: z.object({
    INEP: z.string().optional(),
    Date: z.string().optional(),
    File: fileSchema,
  }),
});

export type DecodeRequest = z.infer<typeof decodeSchema>;
export type FilePayload = z.infer<typeof fileSchema>;

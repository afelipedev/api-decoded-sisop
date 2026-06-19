import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";

/** Monta o payload no formato do contrato (PRD §5). */
function payload(file: Record<string, unknown>) {
  return {
    Escola: {
      INEP: "52013189",
      Date: "24/02/2026",
      File: file,
    },
  };
}

/** Gera Base64 de um conteúdo arbitrário (em memória). */
function toBase64(content: string): string {
  return Buffer.from(content, "utf-8").toString("base64");
}

describe("POST /api/decode-file", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // Cenário 1 — PDF válido
  it("decodifica um PDF válido (200)", async () => {
    const content = "%PDF-1.4\nconteudo de teste";
    const res = await app.inject({
      method: "POST",
      url: "/api/decode-file",
      payload: payload({
        filename: "teste.pdf",
        "mime-type": "application/pdf",
        extension: ".pdf",
        base64: toBase64(content),
      }),
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("application/pdf");
    expect(res.headers["content-disposition"]).toBe(
      'attachment; filename="teste.pdf"',
    );
    expect(res.rawPayload.toString("utf-8")).toBe(content);
  });

  // Cenário 2 — JPEG válido
  it("decodifica uma imagem JPEG válida (200)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/decode-file",
      payload: payload({
        filename: "whats.jpeg",
        "mime-type": "image/jpeg",
        extension: ".jpeg",
        base64: toBase64("conteudo-jpeg"),
      }),
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("image/jpeg");
    expect(res.headers["content-disposition"]).toBe(
      'attachment; filename="whats.jpeg"',
    );
  });

  // Cenário 3 — PNG válido
  it("decodifica um PNG válido (200)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/decode-file",
      payload: payload({
        filename: "imagem.png",
        "mime-type": "image/png",
        base64: toBase64("conteudo-png"),
      }),
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("image/png");
  });

  // Cenário 4 — Base64 inválido
  it("rejeita Base64 inválido (400)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/decode-file",
      payload: payload({
        filename: "teste.pdf",
        "mime-type": "application/pdf",
        base64: "isto-nao-eh-base64!!!",
      }),
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      success: false,
      message: "Base64 inválido",
    });
  });

  // Cenário 5 — filename ausente
  it("rejeita payload sem filename (400)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/decode-file",
      payload: payload({
        "mime-type": "application/pdf",
        base64: toBase64("conteudo"),
      }),
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().success).toBe(false);
    expect(res.json().message).toContain("filename");
  });

  // Cenário 6 — DOCX, preservação do nome original (RN008)
  it("decodifica DOCX preservando o nome original (200)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/decode-file",
      payload: payload({
        filename: "documento.docx",
        "mime-type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        base64: toBase64("conteudo-docx"),
      }),
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-disposition"]).toBe(
      'attachment; filename="documento.docx"',
    );
  });

  // RN004 — extensão derivada do filename quando ausente
  it("preserva o nome quando a extensão não é enviada (RN004)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/decode-file",
      payload: payload({
        filename: "relatorio.csv",
        "mime-type": "text/csv",
        base64: toBase64("a,b,c"),
      }),
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-disposition"]).toBe(
      'attachment; filename="relatorio.csv"',
    );
  });
});

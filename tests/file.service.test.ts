import { describe, expect, it } from "vitest";
import {
  InvalidBase64Error,
  decodeBase64,
  resolveExtension,
} from "../src/services/file.service.js";

describe("resolveExtension (RN004)", () => {
  it("usa a extensão informada (normalizada com ponto)", () => {
    expect(resolveExtension("arquivo.pdf", "pdf")).toBe(".pdf");
    expect(resolveExtension("arquivo.pdf", ".PDF")).toBe(".pdf");
  });

  it("deriva a extensão do filename quando ausente", () => {
    expect(resolveExtension("foto.jpeg")).toBe(".jpeg");
    expect(resolveExtension("planilha.XLSX")).toBe(".xlsx");
  });

  it("retorna vazio quando não há extensão detectável", () => {
    expect(resolveExtension("semextensao")).toBe("");
    expect(resolveExtension(".gitignore")).toBe("");
    expect(resolveExtension("termina.")).toBe("");
  });
});

describe("decodeBase64 (RN005)", () => {
  it("decodifica Base64 válido em Buffer", () => {
    const original = "olá mundo";
    const b64 = Buffer.from(original, "utf-8").toString("base64");
    const buffer = decodeBase64(b64);
    expect(buffer.toString("utf-8")).toBe(original);
  });

  it("aceita data URI prefix", () => {
    const b64 = Buffer.from("png-bytes").toString("base64");
    const buffer = decodeBase64(`data:image/png;base64,${b64}`);
    expect(buffer.toString("utf-8")).toBe("png-bytes");
  });

  it("aceita Base64 com espaços/quebras de linha", () => {
    const b64 = Buffer.from("conteudo").toString("base64");
    const buffer = decodeBase64(`${b64.slice(0, 2)}\n ${b64.slice(2)}`);
    expect(buffer.toString("utf-8")).toBe("conteudo");
  });

  it("lança InvalidBase64Error para entrada inválida", () => {
    expect(() => decodeBase64("não é base64 !!!")).toThrow(InvalidBase64Error);
    expect(() => decodeBase64("")).toThrow(InvalidBase64Error);
  });
});

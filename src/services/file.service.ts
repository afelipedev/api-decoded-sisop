/**
 * Lógica pura de processamento de arquivos (RN004–RN007).
 * Tudo ocorre em memória — nenhuma escrita em disco.
 */

/** Erro tipado para Base64 inválido (RN005/RN006 → HTTP 400). */
export class InvalidBase64Error extends Error {
  constructor(message = "Base64 inválido") {
    super(message);
    this.name = "InvalidBase64Error";
  }
}

/**
 * RN004: resolve a extensão do arquivo.
 * Usa a extensão informada; quando ausente, deriva do filename.
 * Retorna sempre normalizada com ponto inicial e em minúsculas (ex.: ".pdf"),
 * ou string vazia quando não há extensão detectável.
 */
export function resolveExtension(filename: string, extension?: string): string {
  const normalize = (ext: string): string => {
    const trimmed = ext.trim().toLowerCase();
    if (!trimmed) return "";
    return trimmed.startsWith(".") ? trimmed : `.${trimmed}`;
  };

  if (extension && extension.trim()) {
    return normalize(extension);
  }

  const dot = filename.lastIndexOf(".");
  if (dot <= 0 || dot === filename.length - 1) {
    return "";
  }
  return normalize(filename.slice(dot));
}

// Aceita Base64 padrão e URL-safe, com ou sem data URI prefix.
const BASE64_REGEX = /^[A-Za-z0-9+/_-]+={0,2}$/;

/**
 * Remove um eventual prefixo data URI (ex.: "data:image/png;base64,....").
 */
function stripDataUri(input: string): string {
  const match = input.match(/^data:[^;]+;base64,(.*)$/s);
  return match ? match[1] : input;
}

/**
 * RN005: valida e decodifica a string Base64 em um Buffer (em memória).
 * Lança {@link InvalidBase64Error} quando a string não é Base64 válida.
 */
export function decodeBase64(base64: string): Buffer {
  const cleaned = stripDataUri(base64).replace(/\s/g, "");

  if (!cleaned || !BASE64_REGEX.test(cleaned)) {
    throw new InvalidBase64Error();
  }

  const buffer = Buffer.from(cleaned, "base64");

  // Round-trip: garante que a entrada era de fato Base64 decodificável.
  // Normaliza padding/charset (URL-safe) para a comparação.
  const reencoded = buffer.toString("base64");
  const normalizedInput = cleaned
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .replace(/=+$/, "");
  const normalizedOutput = reencoded.replace(/=+$/, "");

  if (buffer.length === 0 || normalizedOutput !== normalizedInput) {
    throw new InvalidBase64Error();
  }

  return buffer;
}

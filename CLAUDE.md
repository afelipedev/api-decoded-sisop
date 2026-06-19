# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

Implemented. The README (pt-BR) and the PRD are the authoritative spec; "Regras de Negócio" (RN001–RN008), the payload contract, and error responses are the requirements. Source lives in `src/`, the Vercel serverless entry in `api/index.ts`, tests in `tests/`.

## What this is

A Base64-to-file decoder microservice. It receives a JSON payload containing a Base64-encoded file, decodes it **entirely in memory**, and returns the raw binary as a download — preserving the original filename and MIME type. Primary consumer is Bubble.io, plus legacy systems / ERPs. Deployed serverless on Vercel.

## Planned stack & architecture

- **Node.js 22+, TypeScript, Fastify, Zod**, Swagger/OpenAPI, deployed on Vercel (serverless).
- Intended layout (from README):
  - `src/routes/decode-file.ts` — `POST /api/decode-file` handler
  - `src/schemas/decode.schema.ts` — Zod validation for the request payload
  - `src/services/file.service.ts` — Base64 validation + decode logic
  - `src/docs/swagger.ts` — Swagger/OpenAPI setup, served at `/docs`
  - `src/app.ts` — builds/configures the Fastify instance
  - `src/server.ts` — local listen entrypoint (port 3000)
  - `vercel.json` — serverless routing
- Keep the Fastify app construction (`app.ts`) separate from the listen call (`server.ts`) so the same app can be exported for the Vercel serverless handler without binding a port.

## Request contract

The payload is **nested** — the file lives under `Escola.File`, not at the top level:

```json
{
  "Escola": {
    "INEP": "52013189",
    "Date": "24/02/2026",
    "File": {
      "filename": "whats.jpeg",
      "mime-type": "image/jpeg",
      "extension": ".jpeg",
      "base64": "/9j/4AAQ..."
    }
  }
}
```

`filename`, `mime-type`, `base64` are required; `extension` is optional.

## Core business rules (must hold)

- RN004: if `extension` is absent, derive it from `filename`.
- RN005: validate the Base64 string **before** decoding.
- RN006/RN007: never write to disk — all processing in memory.
- RN008: preserve the original filename in the `Content-Disposition` header.
- Success response: `200` with the decoded binary body, `Content-Type: <mime-type>`, `Content-Disposition: attachment; filename="<filename>"`.
- Errors use the shape `{ "success": false, "message": "<reason>" }` — `400` for invalid Base64 or invalid/missing payload fields, `500` for internal errors. Messages in the spec are Portuguese (e.g. `"Base64 inválido"`).

## Non-functional targets

Response < 2s; recommended max file size 50 MB; no persistence.

## Commands

- `npm install` — install deps
- `npm run dev` — local dev server at `http://localhost:3000` (Swagger at `/docs`), via `tsx watch`
- `npm test` — run the full Vitest suite (`npm run test:watch` for watch mode)
- `npx vitest run tests/file.service.test.ts` — run a single test file
- `npm run build` — compile to `dist/` with `tsc`; `npm start` runs the build
- `vercel` / `vercel --prod` — deploy

Notes:

- The project is **ESM** (`"type": "module"`); relative imports in `src/` use `.js` extensions (NodeNext resolution).
- The server binds IPv4 (`0.0.0.0`); when smoke-testing locally on Windows, hit `http://127.0.0.1:3000` (not `localhost`, which may resolve to IPv6 `::1`).
- Route schemas must not use the JSON-Schema `example` keyword — Fastify's Ajv runs in strict mode and rejects it.

## Conventions

Documentation and user-facing error messages are written in **Portuguese (pt-BR)**; match this when adding strings or docs.

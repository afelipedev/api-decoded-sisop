# Base64 File Decoder API

Microserviço desenvolvido em **Node.js + Fastify + TypeScript** para converter conteúdos codificados em Base64 em arquivos binários e retorná-los para download, preservando o nome original e o MIME Type informado.

Ideal para integração com **Bubble.io**, sistemas legados, ERPs e APIs que necessitam transformar strings Base64 em arquivos reais.

---

# Funcionalidades

* Conversão de Base64 para arquivo binário
* Suporte a qualquer tipo de arquivo
* Preservação do nome original do arquivo
* Preservação do MIME Type
* Processamento em memória (sem gravação em disco)
* API REST
* Documentação Swagger/OpenAPI
* Deploy Serverless na Vercel
* Integração com Bubble.io
* Validação de payload utilizando Zod

---

# Tecnologias

* Node.js 22+
* TypeScript
* Fastify
* Zod
* Swagger/OpenAPI
* Vercel

---

# Estrutura do Projeto

```text
base64-decoder-api/

src/
├── routes/
│   └── decode-file.ts
│
├── schemas/
│   └── decode.schema.ts
│
├── services/
│   └── file.service.ts
│
├── docs/
│   └── swagger.ts
│
├── app.ts
│
└── server.ts

vercel.json
package.json
tsconfig.json
README.md
```

---

# Instalação

## Clonar projeto

```bash
git clone https://github.com/seu-usuario/base64-decoder-api.git

cd base64-decoder-api
```

## Instalar dependências

```bash
npm install
```

## Executar em desenvolvimento

```bash
npm run dev
```

Servidor disponível em:

```text
http://localhost:3000
```

---

# Endpoint

## Converter Arquivo

### URL

```http
POST /api/decode-file
```

### Headers

```http
Content-Type: application/json
```

---

# Payload de Entrada

```json
{
  "Escola": {
    "INEP": "52013189",
    "Date": "24/02/2026",
    "File": {
      "filename": "whats.jpeg",
      "mime-type": "image/jpeg",
      "extension": ".jpeg",
      "base64": "/9j/4AAQSkZJRgABAQAAAQABAAD..."
    }
  }
}
```

---

# Campos

| Campo     | Tipo   | Obrigatório |
| --------- | ------ | ----------- |
| filename  | string | Sim         |
| mime-type | string | Sim         |
| base64    | string | Sim         |
| extension | string | Não         |

---

# Exemplo de Resposta

## Sucesso

### Status

```http
200 OK
```

### Headers

```http
Content-Type: image/jpeg
Content-Disposition: attachment; filename="whats.jpeg"
```

### Body

```binary
<arquivo jpeg>
```

---

# Tratamento de Erros

## Base64 inválido

### Status

```http
400 Bad Request
```

### Resposta

```json
{
  "success": false,
  "message": "Base64 inválido"
}
```

---

## Payload inválido

### Status

```http
400 Bad Request
```

### Resposta

```json
{
  "success": false,
  "message": "Campo filename obrigatório"
}
```

---

## Erro interno

### Status

```http
500 Internal Server Error
```

### Resposta

```json
{
  "success": false,
  "message": "Erro interno"
}
```

---

# Regras de Negócio

### RN001

O campo `filename` é obrigatório.

### RN002

O campo `mime-type` é obrigatório.

### RN003

O campo `base64` é obrigatório.

### RN004

Caso a extensão não seja informada, ela deverá ser extraída do nome do arquivo.

### RN005

O conteúdo Base64 deverá ser validado antes da conversão.

### RN006

Arquivos não serão persistidos em disco.

### RN007

Todo processamento deverá ocorrer em memória.

### RN008

O nome original deverá ser preservado.

---

# Swagger

Após iniciar a aplicação:

```text
http://localhost:3000/docs
```

Recursos disponíveis:

* OpenAPI 3.0
* Teste online dos endpoints
* Download da especificação JSON

---

# Testes via Postman

## Método

```http
POST
```

## URL

```http
http://localhost:3000/api/decode-file
```

## Headers

```http
Content-Type: application/json
```

## Body

```json
{
  "Escola": {
    "INEP": "52013189",
    "Date": "24/02/2026",
    "File": {
      "filename": "teste.pdf",
      "mime-type": "application/pdf",
      "extension": ".pdf",
      "base64": "JVBERi0xLjQK..."
    }
  }
}
```

Resultado esperado:

* Status 200
* Download do arquivo PDF

---

# Integração Bubble.io

## API Connector

### Método

```http
POST
```

### URL

```http
https://api.seudominio.com/api/decode-file
```

### Headers

```json
{
  "Content-Type": "application/json"
}
```

### Body

Enviar o payload conforme especificado.

### Casos de Uso

* Download de arquivo
* Upload para File Manager do Bubble
* Encaminhamento para outras APIs
* Integração com sistemas externos

---

# Deploy na Vercel

## Login

```bash
vercel login
```

## Deploy

```bash
vercel
```

## Produção

```bash
vercel --prod
```

---

# Requisitos Não Funcionais

| Requisito                  | Valor        |
| -------------------------- | ------------ |
| Tempo médio de resposta    | < 2 segundos |
| Tamanho máximo recomendado | 50 MB        |
| Disponibilidade            | 99,9%        |
| Escalabilidade             | Serverless   |
| Persistência               | Não          |

---

# Critérios de Aceitação

* Receber payload conforme especificação.
* Validar campos obrigatórios.
* Validar Base64.
* Converter qualquer tipo de arquivo.
* Retornar arquivo binário.
* Preservar nome original.
* Disponibilizar documentação Swagger.
* Executar corretamente na Vercel.
* Permitir integração com Bubble.io.
* Tempo de resposta inferior a 2 segundos para arquivos até 10 MB.

---

# Licença

MIT License

---

# Autor

AF Softhouse

Desenvolvido para integração de sistemas Bubble.io e APIs de terceiros utilizando processamento serverless na Vercel.

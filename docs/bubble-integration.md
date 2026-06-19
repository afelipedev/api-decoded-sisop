# Integração com Bubble.io

Guia rápido para consumir a **Base64 File Decoder API** pelo plugin **API Connector** do Bubble.

## 1. Adicionar a API

No Bubble: **Plugins → API Connector → Add another API**.

- **Name:** `Base64 Decoder`
- **Authentication:** `None or self-handled` (a API não exige autenticação).

## 2. Configurar a chamada

Adicione uma nova **API Call**:

| Campo  | Valor                                            |
| ------ | ------------------------------------------------ |
| Nome   | `Decode File`                                    |
| Método | `POST`                                           |
| URL    | `https://SEU-DOMINIO.vercel.app/api/decode-file` |

### Headers

| Key            | Value              |
| -------------- | ------------------ |
| `Content-Type` | `application/json` |

### Body (tipo `JSON`)

Marque os campos dinâmicos com `<>` para parametrizá-los no Bubble:

```json
{
  "Escola": {
    "INEP": "<inep>",
    "Date": "<date>",
    "File": {
      "filename": "<filename>",
      "mime-type": "<mimetype>",
      "extension": "<extension>",
      "base64": "<base64>"
    }
  }
}
```

> Use **Data type: File** na resposta — a API retorna o binário diretamente
> (não um JSON). Em "Initialize call", o Bubble reconhecerá o arquivo.

## 3. Usos comuns

- **Download imediato:** ligue a resposta a um elemento de link/botão de download.
- **Upload para o File Manager do Bubble:** salve o arquivo retornado em um campo `file` do banco de dados.
- **Repasse para outra API:** encaminhe o binário a um serviço externo (ex.: armazenamento, assinatura).

## 4. Erros

A API responde com `{ "success": false, "message": "..." }` e status `400`
para Base64/payload inválido, ou `500` em erro interno. Trate esses casos com
o workflow de erro do API Connector.

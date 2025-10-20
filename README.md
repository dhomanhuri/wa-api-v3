# WhatsApp API v3

API WhatsApp menggunakan library @whiskeysockets/baileys untuk mengirim pesan teks dan media melalui WhatsApp.

## 🚀 Fitur

- ✅ Mengirim pesan teks
- ✅ Mengirim media (gambar, video, audio, dokumen)
- ✅ Mengirim pesan bulk
- ✅ QR Code untuk autentikasi
- ✅ Status koneksi real-time
- ✅ Logout dan manajemen session
- ✅ Error handling yang komprehensif
- ✅ API key authentication
- ✅ File upload support
- ✅ **Webhook untuk event real-time**

## 📋 Prerequisites

- Node.js (versi 16 atau lebih tinggi)
- npm atau yarn
- WhatsApp account

## 🛠️ Instalasi

1. Clone repository ini:
```bash
git clone <repository-url>
cd api-wa-v3
```

2. Install dependencies:
```bash
npm install
```

3. Copy file environment:
```bash
cp config.env.example .env
```

4. Edit file `.env` sesuai kebutuhan:
```env
PORT=3000
NODE_ENV=development
WHATSAPP_SESSION_PATH=./sessions
WHATSAPP_LOG_LEVEL=info
API_KEY=your-secret-api-key-here
WEBHOOK_URL=https://aiagent.ilyas-labs.my.id/webhook/6c68c3a8-fb23-4ec9-b798-c4d87c07688f
```

5. Jalankan server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📱 Setup WhatsApp

1. Jalankan server dan buka endpoint `/api/whatsapp/qr`
2. Scan QR code yang muncul dengan WhatsApp di smartphone Anda
3. Tunggu hingga status koneksi berubah menjadi "connected"

## 🔗 API Endpoints

### Authentication
Semua endpoint memerlukan API key yang dikirim melalui:
- Header: `X-API-Key: your-api-key`
- Query parameter: `?api_key=your-api-key`

### Health Check

#### GET `/api/health`
Cek status API
```bash
curl -X GET http://localhost:3000/api/health
```

#### GET `/api/health/detailed`
Cek status detail API
```bash
curl -X GET http://localhost:3000/api/health/detailed
```

### WhatsApp Endpoints

#### GET `/api/whatsapp/status`
Cek status koneksi WhatsApp
```bash
curl -X GET "http://localhost:3000/api/whatsapp/status" \
  -H "X-API-Key: {{token_admin}}"
```

#### GET `/api/whatsapp/qr`
Dapatkan QR code untuk autentikasi
```bash
curl -X GET "http://localhost:3000/api/whatsapp/qr" \
  -H "X-API-Key: {{token_admin}}"
```

#### POST `/api/whatsapp/send-message`
Kirim pesan teks
```bash
curl -X POST "http://localhost:3000/api/whatsapp/send-message" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: {{token_admin}}" \
  -d '{
    "to": "6281234567890",
    "message": "Hello from WhatsApp API!"
  }'
```

#### POST `/api/whatsapp/send-media`
Kirim media (gambar, video, audio, dokumen)
```bash
curl -X POST "http://localhost:3000/api/whatsapp/send-media" \
  -H "X-API-Key: {{token_admin}}" \
  -F "to=6281234567890" \
  -F "mediaType=image" \
  -F "caption=Ini adalah gambar" \
  -F "media=@/path/to/image.jpg"
```

**Media Types yang didukung:**
- `image` - Gambar (JPG, PNG, GIF)
- `video` - Video (MP4, AVI, MOV)
- `audio` - Audio (MP3, WAV, OGG)
- `document` - Dokumen (PDF, DOC, DOCX)

#### POST `/api/whatsapp/send-bulk`
Kirim pesan bulk ke multiple nomor
```bash
curl -X POST "http://localhost:3000/api/whatsapp/send-bulk" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: {{token_admin}}" \
  -d '{
    "messages": [
      {
        "to": "6281234567890",
        "message": "Pesan pertama"
      },
      {
        "to": "6281234567891",
        "message": "Pesan kedua"
      }
    ]
  }'
```

#### POST `/api/whatsapp/logout`
Logout dari WhatsApp
```bash
curl -X POST "http://localhost:3000/api/whatsapp/logout" \
  -H "X-API-Key: {{token_admin}}"
```

### Webhook Endpoints

#### GET `/api/webhook/status`
Cek status webhook
```bash
curl -X GET "http://localhost:3000/api/webhook/status" \
  -H "X-API-Key: {{token_admin}}"
```

#### POST `/api/webhook/test`
Test webhook dengan data custom
```bash
curl -X POST "http://localhost:3000/api/webhook/test" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: {{token_admin}}" \
  -d '{
    "eventType": "test",
    "data": {
      "message": "Test webhook"
    }
  }'
```

#### POST `/api/webhook/send`
Kirim webhook custom
```bash
curl -X POST "http://localhost:3000/api/webhook/send" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: {{token_admin}}" \
  -d '{
    "eventType": "custom.event",
    "data": {
      "customField": "customValue"
    }
  }'
```

## 📝 Format Nomor Telepon

Format nomor telepon harus menggunakan kode negara tanpa tanda `+`:
- ✅ `6281234567890` (Indonesia)
- ✅ `6281234567890@s.whatsapp.net`
- ❌ `+6281234567890`
- ❌ `081234567890`

## 🔧 Konfigurasi

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port server | `3000` |
| `NODE_ENV` | Environment | `development` |
| `WHATSAPP_SESSION_PATH` | Path untuk session files | `./sessions` |
| `WHATSAPP_LOG_LEVEL` | Level logging | `info` |
| `API_KEY` | Secret key untuk API | Required |
| `WEBHOOK_URL` | URL untuk webhook events | Optional |

## 🔗 Webhook Events

API akan mengirim webhook ke URL yang dikonfigurasi di `WEBHOOK_URL` untuk event-event berikut:

### Event Types

#### `message.received`
Dikirim ketika ada pesan masuk:
```json
{
  "event": "message.received",
  "timestamp": "2025-10-19T12:00:00.000Z",
  "data": {
    "messageId": "message_id_here",
    "from": "6281234567890@s.whatsapp.net",
    "timestamp": 1642512000000,
    "messageType": "image",
    "content": {
      "caption": "Ini adalah gambar",
      "mimetype": "image/jpeg",
      "mediaDownloaded": true,
      "filename": "image_message_id_1642512000000.jpg",
      "filepath": "./media/image_message_id_1642512000000.jpg",
      "fileSize": 245760,
      "downloadUrl": "/media/image_message_id_1642512000000.jpg",
      "base64": "iVBORw0KGgoAAAANSUhEUgAA..."
    },
    "sender": {
      "jid": "6281234567890@s.whatsapp.net",
      "pushName": "John Doe"
    }
  }
}
```

#### `message.sent`
Dikirim ketika pesan berhasil dikirim:
```json
{
  "event": "message.sent",
  "timestamp": "2025-10-19T12:00:00.000Z",
  "data": {
    "messageId": "message_id_here",
    "to": "6281234567890@s.whatsapp.net",
    "messageType": "text",
    "content": {
      "text": "Hello from API!"
    },
    "timestamp": "2025-10-19T12:00:00.000Z"
  }
}
```

#### `connection.status`
Dikirim ketika status koneksi berubah:
```json
{
  "event": "connection.status",
  "timestamp": "2025-10-19T12:00:00.000Z",
  "data": {
    "isConnected": true,
    "qrCode": null,
    "timestamp": "2025-10-19T12:00:00.000Z"
  }
}
```

#### `error.occurred`
Dikirim ketika terjadi error:
```json
{
  "event": "error.occurred",
  "timestamp": "2025-10-19T12:00:00.000Z",
  "data": {
    "errorType": "message.send.failed",
    "errorMessage": "Message send timeout",
    "context": {
      "jid": "6281234567890@s.whatsapp.net",
      "attempts": 3
    },
    "timestamp": "2025-10-19T12:00:00.000Z"
  }
}
```

### Webhook Configuration

- **Timeout**: 10 detik per request
- **Retry**: 3 kali dengan exponential backoff (2s, 4s, 8s)
- **Headers**: `Content-Type: application/json`, `User-Agent: WhatsApp-API-Webhook/1.0.0`
- **Method**: POST

### Media Download Feature

Untuk pesan media (gambar, video, audio, dokumen, sticker), webhook akan:

1. **Download media asli** (bukan thumbnail)
2. **Simpan ke folder `./media/`**
3. **Kirim informasi lengkap** dalam webhook:
   - `mediaDownloaded`: true/false
   - `filename`: nama file yang disimpan
   - `fileSize`: ukuran file dalam bytes
   - `downloadUrl`: URL untuk mengakses file (`/media/filename`)
   - `base64`: media dalam format base64
   - `mimeType`: tipe MIME file

#### Akses Media Files

Media files dapat diakses melalui:
```bash
# Contoh akses gambar
curl http://localhost:3000/media/image_message_id_1642512000000.jpg

# Atau langsung di browser
http://localhost:3000/media/image_message_id_1642512000000.jpg
```

#### Supported Media Types

- **Images**: JPG, PNG, GIF, WebP
- **Videos**: MP4, WebM, AVI
- **Audio**: MP3, WAV, OGG
- **Documents**: PDF, DOC, DOCX, dll
- **Stickers**: WebP format

### Session Management

Session WhatsApp disimpan di direktori `./sessions` secara default. File-file ini berisi informasi autentikasi dan tidak boleh dihapus jika ingin tetap terhubung.

## 🚨 Error Handling

API mengembalikan response dengan format konsisten:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## 📊 Response Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `400` | Bad Request |
| `401` | Unauthorized (Invalid API Key) |
| `404` | Not Found |
| `500` | Internal Server Error |

## 🔒 Security

- Gunakan API key yang kuat dan unik
- Jangan expose API key di client-side
- Gunakan HTTPS di production
- Monitor penggunaan API secara berkala

## 🐛 Troubleshooting

### QR Code tidak muncul
- Pastikan server sudah running
- Cek log untuk error messages
- Restart server jika diperlukan

### Pesan tidak terkirim
- Pastikan WhatsApp sudah connected
- Cek format nomor telepon
- Pastikan nomor sudah terdaftar di WhatsApp

### Media tidak terkirim
- Cek ukuran file (max 10MB)
- Pastikan format file didukung
- Cek koneksi internet

## 📄 License

MIT License

## 🤝 Contributing

1. Fork repository
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Buat Pull Request

## 📞 Support

Jika mengalami masalah, silakan buat issue di repository ini.

# Troubleshooting WhatsApp API Timeout Issues

## 🚨 Masalah: "Timed Out" Error

Jika Anda mengalami error "Timed Out" ketika mengirim pesan, berikut adalah solusi yang telah saya implementasikan:

## 🔧 Perbaikan yang Telah Diterapkan

### 1. Timeout Configuration
- **Message timeout**: 30 detik
- **Media timeout**: 60 detik
- **Connection timeout**: 60 detik
- **Query timeout**: 60 detik

### 2. Retry Mechanism
- **Max retries**: 3 kali
- **Exponential backoff**: 2s, 4s, 8s
- **Automatic retry** untuk timeout errors

### 3. Baileys Configuration
```javascript
{
  connectTimeoutMs: 60000,
  defaultQueryTimeoutMs: 60000,
  keepAliveIntervalMs: 30000,
  retryRequestDelayMs: 250,
  maxMsgRetryCount: 5
}
```

## 🛠️ Cara Mengatasi Masalah

### 1. Cek Status Koneksi
```bash
curl -H "X-API-Key: your-secret-api-key-here" \
  http://localhost:3000/api/whatsapp/status
```

### 2. Gunakan Debug Tool
```bash
# Cek status detail
node debug-whatsapp.js status

# Test koneksi
node debug-whatsapp.js test

# Monitor real-time
node debug-whatsapp.js init
```

### 3. Test dengan Retry
```bash
# Test dengan retry mechanism
node test-api-fixed.js diagnostics

# Test message dengan retry
node test-api-fixed.js messages 085731234852
```

## 🔍 Diagnostik Masalah

### 1. Cek Logs
```bash
# Monitor logs real-time
tail -f logs/app.log

# Cek error patterns
grep "ERROR" logs/app.log
```

### 2. Cek Koneksi WhatsApp
- Pastikan WhatsApp sudah terhubung
- Cek apakah ada QR code yang perlu di-scan
- Pastikan session tidak expired

### 3. Cek Network
- Pastikan koneksi internet stabil
- Cek firewall/proxy settings
- Test dengan nomor yang berbeda

## 📱 Langkah-langkah Troubleshooting

### Step 1: Restart Service
```bash
# Stop server
pkill -f "node.*server.js"

# Start ulang
npm start
```

### Step 2: Clear Session (jika perlu)
```bash
# Hapus session files
rm -rf sessions/*

# Restart server
npm start

# Scan QR code lagi
```

### Step 3: Test dengan Nomor Berbeda
```bash
# Test dengan nomor yang berbeda
curl -X POST "http://localhost:3000/api/whatsapp/send-message" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-api-key-here" \
  -d '{
    "to": "6281234567890",
    "message": "Test message"
  }'
```

## ⚡ Optimasi Performance

### 1. Environment Variables
```env
# Tambahkan ke .env
WHATSAPP_LOG_LEVEL=warn
NODE_ENV=production
```

### 2. Rate Limiting
- Jangan kirim terlalu banyak pesan sekaligus
- Gunakan bulk messages untuk multiple recipients
- Beri delay antar pesan

### 3. Monitoring
```bash
# Monitor metrics
curl http://localhost:3000/api/metrics

# Cek success rate
curl http://localhost:3000/api/metrics | jq '.data.successRate'
```

## 🚨 Common Issues & Solutions

### Issue 1: "WhatsApp is not connected"
**Solution**: Scan QR code atau restart service

### Issue 2: "Message send timeout"
**Solution**: 
- Cek koneksi internet
- Restart service
- Gunakan retry mechanism

### Issue 3: "Invalid phone number"
**Solution**: 
- Gunakan format: 6281234567890
- Pastikan nomor sudah terdaftar WhatsApp

### Issue 4: "Rate limit exceeded"
**Solution**: 
- Tunggu beberapa saat
- Kurangi frekuensi request

## 📊 Monitoring Commands

```bash
# Health check
curl http://localhost:3000/api/health

# WhatsApp status
curl -H "X-API-Key: your-key" http://localhost:3000/api/whatsapp/status

# Metrics
curl http://localhost:3000/api/metrics

# QR Code
curl -H "X-API-Key: your-key" http://localhost:3000/api/whatsapp/qr
```

## 🔄 Auto-Recovery

Service sekarang memiliki auto-recovery untuk:
- Connection drops
- Timeout errors
- Network issues
- Session expiration

## 📞 Support

Jika masalah masih berlanjut:
1. Cek logs untuk error details
2. Test dengan debug tools
3. Restart service
4. Clear session jika perlu
5. Test dengan nomor berbeda

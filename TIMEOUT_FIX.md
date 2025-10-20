# Quick Fix untuk Timeout Error

## 🚨 Masalah yang Anda Alami

Error "Timed Out" terjadi karena:
1. Koneksi WhatsApp tidak stabil
2. Timeout default terlalu pendek
3. Tidak ada retry mechanism

## ✅ Solusi yang Sudah Diterapkan

### 1. Timeout Configuration
- Message timeout: 30 detik
- Media timeout: 60 detik
- Retry mechanism: 3 kali dengan exponential backoff

### 2. Baileys Configuration
- Connection timeout: 60 detik
- Query timeout: 60 detik
- Keep alive: 30 detik
- Max retry count: 5

## 🛠️ Cara Mengatasi Sekarang

### 1. Restart Server
```bash
# Stop server yang sedang running
pkill -f "node.*server.js"

# Start ulang dengan konfigurasi baru
npm start
```

### 2. Cek Status Koneksi
```bash
# Cek apakah WhatsApp sudah connected
curl -H "X-API-Key: your-secret-api-key-here" \
  http://localhost:3000/api/whatsapp/status
```

### 3. Test dengan Retry
```bash
# Test dengan retry mechanism yang baru
npm run test:fixed
```

### 4. Debug Real-time
```bash
# Monitor status real-time
npm run debug:status
```

## 📱 Langkah-langkah Detail

### Step 1: Pastikan WhatsApp Connected
```bash
# Cek status
curl -H "X-API-Key: your-secret-api-key-here" \
  http://localhost:3000/api/whatsapp/status

# Jika tidak connected, scan QR code
curl -H "X-API-Key: your-secret-api-key-here" \
  http://localhost:3000/api/whatsapp/qr
```

### Step 2: Test Message dengan Retry
```bash
# Test dengan nomor Anda
curl -X POST "http://localhost:3000/api/whatsapp/send-message" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-api-key-here" \
  -d '{
    "to": "085731234852",
    "message": "Test message dengan retry mechanism"
  }'
```

### Step 3: Monitor Logs
```bash
# Monitor logs real-time
tail -f logs/app.log
```

## 🔧 Jika Masih Timeout

### 1. Clear Session
```bash
# Hapus session files
rm -rf sessions/*

# Restart server
npm start

# Scan QR code lagi
```

### 2. Test dengan Nomor Berbeda
```bash
# Test dengan nomor yang berbeda
curl -X POST "http://localhost:3000/api/whatsapp/send-message" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-api-key-here" \
  -d '{
    "to": "6281234567890",
    "message": "Test dengan nomor berbeda"
  }'
```

### 3. Cek Network
- Pastikan koneksi internet stabil
- Cek firewall/proxy settings
- Test dengan WiFi yang berbeda

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Metrics
```bash
curl http://localhost:3000/api/metrics
```

### Logs
```bash
# Cek error patterns
grep "ERROR" logs/app.log

# Cek timeout patterns
grep "timeout" logs/app.log
```

## 🚀 Optimasi Tambahan

### 1. Environment Variables
```env
# Tambahkan ke .env
WHATSAPP_LOG_LEVEL=info
NODE_ENV=development
```

### 2. Rate Limiting
- Jangan kirim terlalu banyak pesan sekaligus
- Beri delay antar pesan
- Gunakan bulk messages untuk multiple recipients

## 📞 Support

Jika masalah masih berlanjut:
1. Cek logs untuk error details
2. Test dengan debug tools
3. Restart service
4. Clear session jika perlu
5. Test dengan nomor berbeda

## 🎯 Expected Behavior

Dengan perbaikan ini, Anda seharusnya melihat:
- ✅ Retry attempts di logs
- ✅ Timeout yang lebih panjang
- ✅ Auto-recovery untuk connection issues
- ✅ Better error messages

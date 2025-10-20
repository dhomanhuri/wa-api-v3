# Deployment Guide

## 🚀 Quick Start

1. **Clone dan Install**
```bash
git clone <repository-url>
cd api-wa-v3
npm install
```

2. **Setup Environment**
```bash
cp env.example .env
# Edit .env file dengan konfigurasi Anda
```

3. **Jalankan Server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t whatsapp-api .
```

### Run Container
```bash
docker run -d \
  --name whatsapp-api \
  -p 3000:3000 \
  -e API_KEY=your-secret-api-key \
  -v $(pwd)/sessions:/app/sessions \
  whatsapp-api
```

### Docker Compose
```bash
# Edit docker-compose.yml dengan API_KEY Anda
docker-compose up -d
```

## 🔧 PM2 Deployment

### Install PM2
```bash
npm install -g pm2
```

### Start dengan PM2
```bash
pm2 start ecosystem.config.js
```

### Monitor
```bash
pm2 monit
pm2 logs whatsapp-api
```

## 🌐 Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 SSL/HTTPS Setup

### Let's Encrypt dengan Certbot
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

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
# PM2 logs
pm2 logs whatsapp-api

# Docker logs
docker logs whatsapp-api

# File logs
tail -f logs/app.log
```

## 🔧 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3000` | No |
| `NODE_ENV` | Environment | `development` | No |
| `WHATSAPP_SESSION_PATH` | Session directory | `./sessions` | No |
| `WHATSAPP_LOG_LEVEL` | Log level | `info` | No |
| `API_KEY` | API secret key | - | **Yes** |

## 🚨 Troubleshooting

### QR Code tidak muncul
- Pastikan server sudah running
- Cek log untuk error messages
- Restart server jika diperlukan

### Session expired
- Hapus file di folder `sessions/`
- Restart server
- Scan QR code lagi

### Rate limit exceeded
- Tunggu beberapa saat
- Kurangi frekuensi request
- Gunakan bulk messages untuk multiple recipients

### Memory issues
- Restart server secara berkala
- Monitor memory usage dengan PM2
- Adjust `max_memory_restart` di ecosystem.config.js

## 📈 Performance Optimization

### PM2 Cluster Mode
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'whatsapp-api',
    script: 'src/server.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster'
  }]
}
```

### Nginx Caching
```nginx
location /api/health {
    proxy_pass http://localhost:3000;
    proxy_cache_valid 200 1m;
}

location /api/metrics {
    proxy_pass http://localhost:3000;
    proxy_cache_valid 200 30s;
}
```

### Database Integration (Optional)
Untuk production yang lebih robust, pertimbangkan untuk menggunakan database untuk menyimpan:
- Message history
- User sessions
- API usage statistics

## 🔐 Security Best Practices

1. **API Key Management**
   - Gunakan API key yang kuat dan unik
   - Rotate API key secara berkala
   - Jangan expose API key di client-side

2. **Network Security**
   - Gunakan HTTPS di production
   - Setup firewall rules
   - Gunakan VPN jika diperlukan

3. **Rate Limiting**
   - Monitor rate limit usage
   - Adjust limits sesuai kebutuhan
   - Implement IP whitelisting jika diperlukan

4. **Logging**
   - Monitor logs secara berkala
   - Setup log rotation
   - Alert untuk error patterns

## 📞 Support

Jika mengalami masalah:
1. Cek logs terlebih dahulu
2. Pastikan semua dependencies terinstall
3. Verify environment variables
4. Test dengan curl commands
5. Buat issue di repository jika masalah berlanjut

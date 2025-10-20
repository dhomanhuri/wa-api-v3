# WhatsApp API Testing Examples

## Setup
1. Pastikan server sudah running di port 3000
2. Ganti `YOUR_API_KEY` dengan API key yang benar
3. Ganti nomor telepon dengan nomor yang valid

## Test Health Check
```bash
curl -X GET http://localhost:3000/api/health
```

## Test WhatsApp Status
```bash
curl -X GET "http://localhost:3000/api/whatsapp/status" \
  -H "X-API-Key: YOUR_API_KEY"
```

## Test Get QR Code
```bash
curl -X GET "http://localhost:3000/api/whatsapp/qr" \
  -H "X-API-Key: YOUR_API_KEY"
```

## Test Send Text Message
```bash
curl -X POST "http://localhost:3000/api/whatsapp/send-message" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "to": "6281234567890",
    "message": "Hello from WhatsApp API! 🚀"
  }'
```

## Test Send Image
```bash
curl -X POST "http://localhost:3000/api/whatsapp/send-media" \
  -H "X-API-Key: YOUR_API_KEY" \
  -F "to=6281234567890" \
  -F "mediaType=image" \
  -F "caption=Ini adalah gambar dari API" \
  -F "media=@./test-image.jpg"
```

## Test Send Video
```bash
curl -X POST "http://localhost:3000/api/whatsapp/send-media" \
  -H "X-API-Key: YOUR_API_KEY" \
  -F "to=6281234567890" \
  -F "mediaType=video" \
  -F "caption=Ini adalah video dari API" \
  -F "media=@./test-video.mp4"
```

## Test Send Audio
```bash
curl -X POST "http://localhost:3000/api/whatsapp/send-media" \
  -H "X-API-Key: YOUR_API_KEY" \
  -F "to=6281234567890" \
  -F "mediaType=audio" \
  -F "media=@./test-audio.mp3"
```

## Test Send Document
```bash
curl -X POST "http://localhost:3000/api/whatsapp/send-media" \
  -H "X-API-Key: YOUR_API_KEY" \
  -F "to=6281234567890" \
  -F "mediaType=document" \
  -F "fileName=test-document.pdf" \
  -F "media=@./test-document.pdf"
```

## Test Bulk Messages
```bash
curl -X POST "http://localhost:3000/api/whatsapp/send-bulk" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "messages": [
      {
        "to": "6281234567890",
        "message": "Pesan pertama untuk nomor 1"
      },
      {
        "to": "6281234567891",
        "message": "Pesan kedua untuk nomor 2"
      },
      {
        "to": "6281234567892",
        "message": "Pesan ketiga untuk nomor 3"
      }
    ]
  }'
```

## Test Logout
```bash
curl -X POST "http://localhost:3000/api/whatsapp/logout" \
  -H "X-API-Key: YOUR_API_KEY"
```

## JavaScript/Node.js Examples

### Using fetch API
```javascript
const API_BASE = 'http://localhost:3000/api';
const API_KEY = 'YOUR_API_KEY';

// Send text message
async function sendMessage(to, message) {
  const response = await fetch(`${API_BASE}/whatsapp/send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({ to, message })
  });
  
  return await response.json();
}

// Usage
sendMessage('6281234567890', 'Hello from JavaScript!')
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

### Using axios
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'X-API-Key': 'YOUR_API_KEY'
  }
});

// Send message
async function sendMessage(to, message) {
  try {
    const response = await api.post('/whatsapp/send-message', {
      to,
      message
    });
    console.log(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
  }
}

// Send media
async function sendMedia(to, mediaType, mediaPath, caption = '') {
  try {
    const FormData = require('form-data');
    const fs = require('fs');
    
    const form = new FormData();
    form.append('to', to);
    form.append('mediaType', mediaType);
    form.append('caption', caption);
    form.append('media', fs.createReadStream(mediaPath));
    
    const response = await api.post('/whatsapp/send-media', form, {
      headers: form.getHeaders()
    });
    console.log(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
  }
}
```

## Python Examples

### Using requests
```python
import requests
import json

API_BASE = 'http://localhost:3000/api'
API_KEY = 'YOUR_API_KEY'

headers = {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
}

# Send text message
def send_message(to, message):
    url = f"{API_BASE}/whatsapp/send-message"
    data = {
        'to': to,
        'message': message
    }
    
    response = requests.post(url, headers=headers, json=data)
    return response.json()

# Send media
def send_media(to, media_type, media_path, caption=''):
    url = f"{API_BASE}/whatsapp/send-media"
    
    files = {
        'media': open(media_path, 'rb')
    }
    
    data = {
        'to': to,
        'mediaType': media_type,
        'caption': caption
    }
    
    headers_form = {
        'X-API-Key': API_KEY
    }
    
    response = requests.post(url, headers=headers_form, files=files, data=data)
    return response.json()

# Usage
result = send_message('6281234567890', 'Hello from Python!')
print(result)
```

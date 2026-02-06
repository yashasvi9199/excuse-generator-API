# 🎭 Excuse Generator API

AI-powered REST API that generates creative, believable excuses using Google Gemini. Generate excuses from text or images in any language.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat&logo=vercel)](https://vercel.com)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-4285F4?style=flat&logo=google)](https://ai.google.dev/)

**Live API**: `https://excuse-generator-api.vercel.app/api`

---

## ✨ Features

- 🎯 **3 unique excuses** per request
- 💬 **Text or image input** (screenshots, conversations)
- 🌍 **Multi-language support** with cultural nuances
- 🎨 **7 categories**: work, school, social, family, health, dating, general
- 🎭 **6 moods**: professional, casual, dramatic, funny, sincere, mysterious
- 🖼️ **Image formats**: JPG, PNG, WebP (max 3MB)
- ⚡ **Fast responses** via Gemini 2.0 Flash

---

## 🚀 Quick Start

### Test the API

```bash
curl -X POST https://excuse-generator-api.vercel.app/api/excuse \
  -H "Content-Type: application/json" \
  -d '{
    "situation": "I overslept and missed my alarm",
    "category": "work",
    "mood": "professional"
  }'
```

**Response**:
```json
{
  "success": true,
  "excuses": [
    "I apologize for the delay. My building experienced an unexpected power outage that disabled my alarm system.",
    "Unfortunately, my ISP had a major service disruption this morning preventing connectivity.",
    "I had an emergency maintenance visit due to a gas leak alert in my building."
  ]
}
```

---

## 📡 API Endpoints

### 1. Generate Excuse (Text)
```http
POST /api/excuse
Content-Type: application/json

{
  "situation": "string (required, max 1000 chars)",
  "category": "work|school|social|family|health|dating|general (optional)",
  "mood": "professional|casual|dramatic|funny|sincere|mysterious (optional)",
  "language": "string (optional, default: English)"
}
```

### 2. Generate Excuse (Image)
```http
POST /api/excuse/image
Content-Type: application/json

{
  "image": "base64_string (required)",
  "mimeType": "image/jpeg|image/png|image/webp (required)",
  "category": "optional",
  "mood": "optional",
  "language": "optional"
}
```

### 3. Get Categories & Moods
```http
GET /api/categories
```

### 4. List Available Models
```http
GET /api/models
```

### 5. Health Check
```http
GET /api/health
```

### 6. Get Excuse History
```http
GET /api/history?category=work&mood=funny&timeRange=today&limit=10
```

**Query Parameters** (all optional):

| Parameter | Type | Options | Description |
|-----------|------|---------|-------------|
| `category` | string | work, school, social, family, health, dating, general | Filter by category |
| `mood` | string | professional, casual, dramatic, funny, sincere, mysterious | Filter by mood |
| `timeRange` | string | hour, today, week, all | Filter by time |
| `limit` | number | 1-200 | Max results (default: 50) |

**Response**:
```json
{
  "success": true,
  "data": {
    "excuses": [
      {
        "id": "excuse:1738822800000:abc123",
        "excuses": ["...", "...", "..."],
        "category": "work",
        "mood": "professional",
        "type": "text",
        "timestamp": 1738822800000,
        "createdAt": "2024-02-06T10:30:00.000Z"
      }
    ],
    "count": 1,
    "filters": {
      "category": "work",
      "mood": "professional",
      "timeRange": "today",
      "limit": 10
    }
  }
}
```

---

### 7. Get Statistics
```http
GET /api/history/stats
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total": 127,
    "timestamp": "2024-02-06T10:30:00.000Z"
  }
}
```

---

## ❌ Error Responses

All errors return:
```json
{
  "success": false,
  "error": {
    "code": 400,
    "title": "INVALID_ARGUMENT",
    "message": "Detailed error description"
  }
}
```

**Status Codes**:
- `400` - Invalid input
- `413` - Image too large (>3MB)
- `415` - Unsupported image format
- `422` - Content blocked by safety filters
- `429` - Rate limited (includes `retryAfter` seconds)
- `500` - Internal server error
- `502` - Gemini API unavailable
- `503` - Service busy

---

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- [Gemini API key](https://makersuite.google.com/app/apikey)

### Setup
```bash
# Clone repository
git clone https://github.com/yashasvi9199/excuse-generator-API.git
cd excuse-generator-API

# Install dependencies
npm install

# Install Vercel CLI
npm install -g vercel

# Create .env file
echo "GEMINI_API_KEY=your_key_here" > .env
echo "GEMINI_MODEL=gemini-2.0-flash-exp" >> .env

# Run development server
vercel dev
```

API runs at `http://localhost:3000/api`

---

## 🌐 Deploy to Vercel

1. Fork this repository
2. Import to [Vercel](https://vercel.com)
3. Add environment variables:
   - `GEMINI_API_KEY` (required)
   - `GEMINI_MODEL` (optional, default: `gemini-2.0-flash-exp`)
4. Deploy

---

## 📊 Rate Limits

**Gemini 2.0 Flash (Free Tier)**:
- 15 requests/minute
- 1,500 requests/day
- Auto-handled with `429` responses

**Rate Limit Response**:
```json
{
  "success": false,
  "error": {
    "code": 429,
    "title": "RESOURCE_EXHAUSTED",
    "message": "Too many requests. Please wait and try again.",
    "retryAfter": 60
  }
}
```

---

## 📂 Project Structure

```
excuse-generator-api/
├── api/
│   └── index.js                 # Express app (single Vercel function)
├── src/
│   ├── routes/
│   │   └── excuseRoutes.js
│   ├── controllers/
│   │   ├── excuseController.js
│   │   ├── imageController.js
│   │   └── infoController.js
│   ├── services/
│   │   └── geminiService.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validator.js
│   ├── utils/
│   │   ├── prompts.js
│   │   └── constants.js
│   └── config/
│       └── index.js
├── .github/workflows/
│   └── keep-alive.yml
├── vercel.json
└── package.json
```

---

## 🔒 Security

- ✅ API keys in environment variables only
- ✅ Input validation on all requests
- ✅ 3MB image size limit
- ✅ 1000 character text limit
- ✅ Error messages never expose internal details

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 🔗 Links

- **GitHub**: [yashasvi9199/excuse-generator-API](https://github.com/yashasvi9199/excuse-generator-API)
- **Author**: [@yashasvi9199](https://github.com/yashasvi9199)
- **Gemini API**: [Google AI Studio](https://ai.google.dev/)

---

**Made with ❤️ and creative excuses**
# 🎙 ARIA — Voice Agent Web Service

A production-ready voice agent web service for **Customer Support** and **Data Management** demos. Works entirely in the browser with zero external API dependencies — real microphone input, live speech recognition, browser TTS, and smart intent routing.

---

## 🚀 Quick Deploy (pick one)

### Option 1 — Railway (recommended, free tier)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

```bash
# 1. Push this folder to a GitHub repo
# 2. Go to railway.app → New Project → Deploy from GitHub repo
# 3. Select your repo — Railway auto-detects Node.js
# 4. Done. Your live URL appears in ~60 seconds.
```

### Option 2 — Render (free tier)
```bash
# 1. Push to GitHub
# 2. Go to render.com → New Web Service → Connect repo
# 3. Build command:  npm install
#    Start command:  node server.js
# 4. Done. render.yaml is pre-configured.
```

### Option 3 — Docker (self-hosted / VPS)
```bash
# Clone / copy the project folder
git clone <your-repo-url>
cd aria-voice-agent

# Build and run
docker compose up -d

# App is live at http://localhost:3000
# Health check: http://localhost:3000/health
```

### Option 4 — Run locally
```bash
cd aria-voice-agent
npm install
cp .env.example .env
npm start
# → http://localhost:3000
```

### Option 5 — Fly.io
```bash
npm install -g flyctl
fly auth login
fly launch          # detects Dockerfile automatically
fly deploy
```

---

## 📁 Project Structure

```
aria-voice-agent/
├── public/
│   └── index.html        ← Full frontend (single file, self-contained)
├── server.js             ← Express web server
├── package.json
├── Dockerfile            ← Multi-stage, non-root, health-checked
├── docker-compose.yml    ← With optional nginx HTTPS proxy
├── railway.toml          ← Railway deploy config
├── render.yaml           ← Render deploy config
├── nginx/
│   └── nginx.conf        ← Reverse proxy + SSL termination
├── .env.example
└── .gitignore
```

---

## ⚙️ Environment Variables

| Variable         | Default       | Description                            |
|------------------|---------------|----------------------------------------|
| `PORT`           | `3000`        | Port the server listens on             |
| `NODE_ENV`       | `development` | `production` enables response caching  |
| `ALLOWED_ORIGIN` | `*`           | CORS origin — set to your domain in prod |

Copy `.env.example` to `.env` and edit before running locally.

---

## 🌐 API Endpoints

| Method | Path                | Description                         |
|--------|---------------------|-------------------------------------|
| GET    | `/`                 | Serves the voice agent frontend     |
| GET    | `/health`           | Health check (used by all platforms)|
| POST   | `/api/session/log`  | Log a conversation event            |
| GET    | `/api/session/stats`| View session intent analytics       |

### POST `/api/session/log`
```json
{
  "sessionId": "abc-123",
  "event": "intent_resolved",
  "intent": "cs_billing",
  "timestamp": 1710854400000
}
```

---

## 🎙 How It Works

The frontend uses the **Web Speech API** (built into Chrome/Edge/Safari) for:
- **Speech-to-Text** — real microphone input, live interim transcription
- **Text-to-Speech** — browser speaks ARIA's responses aloud

No API keys. No third-party voice services. No usage costs.

> **Browser support:** Chrome and Edge have full Web Speech API support. Safari supports it on HTTPS only. Firefox has limited support — the text input fallback activates automatically.

---

## 🔒 HTTPS Requirement (for microphone)

Browsers **require HTTPS** to access the microphone in production. All major deploy platforms (Railway, Render, Fly.io) provide HTTPS automatically on their domains.

For self-hosted VPS with nginx:
1. Point your domain DNS to your server IP
2. Get a free cert: `certbot --nginx -d yourdomain.com`
3. Place certs in `nginx/certs/fullchain.pem` and `nginx/certs/privkey.pem`
4. Uncomment the nginx service in `docker-compose.yml`
5. Run `docker compose up -d`

---

## 🧠 Intent Coverage

**Customer Support**
- Login & access issues
- Billing disputes & refunds
- Subscription cancellations
- Technical problems
- Returns & exchanges
- Complaints & escalations
- Plan upgrades/downgrades
- Feedback & feature requests
- Warranty claims
- Ticket status checks

**Data Management**
- Customer record lookup
- Order tracking
- Record updates with audit trail
- Report generation
- Anomaly detection
- Backup & restore
- Data import & validation
- GDPR deletion requests
- Schema analysis
- Permission management

---

## 📈 Scaling

The server is stateless — session logs are in-memory by default. For production scale:

1. Replace the `sessionLogs` array in `server.js` with a database (PostgreSQL, MongoDB, Redis)
2. Put a load balancer in front of multiple instances
3. Use Railway/Render's autoscaling or Kubernetes for high availability

---

## 📄 License

MIT — use freely, deploy commercially, modify as needed.

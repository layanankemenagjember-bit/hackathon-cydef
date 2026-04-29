# CyDef-GR — Platform Kamsiber Gotong Royong Pemerintah Indonesia

Platform keamanan siber kolaboratif untuk instansi pemerintah Indonesia, ditenagai **Microsoft Azure OpenAI GPT-4o**.

## 🛡️ Fitur Utama
- Multi-role login: User Pelapor / Admin Kementerian / Super Admin BSSN
- AI Verifikasi Insiden otomatis (skor risiko 0-100 + TTP MITRE ATT&CK)
- Auto-eskalasi ke BSSN untuk insiden kritis (skor ≥85)
- CVE Monitor real-time
- AI Agent kamsiber berbasis Azure OpenAI GPT-4o
- Komunitas gotong royong antar admin kementerian

## 🏗️ Tech Stack
- **Azure OpenAI** (GPT-4o) — AI verifikasi & chat agent
- **Azure Static Web Apps** — hosting platform
- **Azure Functions** — serverless API proxy

## 🚀 Deploy ke Azure Static Web Apps

### 1. Fork repository ini

### 2. Buat Azure Static Web Apps
- Buka portal.azure.com → Create resource → Static Web Apps
- Connect ke GitHub repository ini
- App location: `/`
- Api location: `api`
- Output location: (kosong)

### 3. Set Environment Variables
Di Azure Static Web Apps → Configuration → Application settings:
```
AZURE_OPENAI_KEY = your-azure-openai-key
AZURE_OPENAI_ENDPOINT = kemen-mok2fbgi-swedencentral.cognitiveservices.azure.com
AZURE_OPENAI_DEPLOYMENT = gpt-4o
AZURE_OPENAI_API_VERSION = 2025-01-01-preview
```

### 4. Set GitHub Secret
Di GitHub repository → Settings → Secrets:
- `AZURE_STATIC_WEB_APPS_API_TOKEN` → dari Azure Static Web Apps deployment token
- `AZURE_OPENAI_KEY` → Azure OpenAI API key

## 📋 Struktur Project
```
/
├── index.html              # Aplikasi utama CyDef-GR
├── staticwebapp.config.json # Routing config
├── .github/workflows/      # Auto-deploy CI/CD
└── api/
    ├── host.json
    ├── package.json
    └── chat/
        ├── index.js        # Azure Function proxy ke OpenAI
        └── function.json
```

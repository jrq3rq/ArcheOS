## 🧠 Overview

**ArcheOS** is an internal AI-powered operations manager for The Archetype Academy. It coordinates tasks, tracks KPIs, enforces compliance, and supports venue rollout using modular agents powered by Grok API and Firebase Functions.

```markdown
archeos/
├── public/ # 🔹 Frontend served by Firebase Hosting
│ ├── index.html # Admin UI for interacting with ArcheOS (chatbot + role selector)
│ ├── style.css # UI styling for admin console
│ └── chatbot.js # Chat logic: sends user input + role to backend, displays response
├── functions/ # 🔹 Firebase Cloud Functions (backend)
│ ├── index.js # Entrypoint: routes POST request to role handler (e.g., Grok API call)
│ ├── .env # 🔐 Local secrets (Grok API key, Slack token) — never committed
│ ├── .gitignore # Prevents secrets and `node_modules` from being committed
│ ├── package.json # Dependencies (dotenv, node-fetch, firebase-functions, etc.)
│ ├── prompts/ # 🔹 System prompt templates
│ │ └── role-presets.js # Role-to-system-prompt map (e.g., Visioneer, Guardian, PulseBridge)
│ ├── agents/ # 🔹 Modular AI agent logic files (one per function/domain)
│ │ ├── visioneer.js # Agent for planning, KPIs, scope control
│ │ ├── technarch.js # Agent for CI/CD, deploy/test automation
│ │ ├── guardian.js # Agent for compliance: GDPR, WCAG, CCPA, bias checks
│ │ ├── pulsebridge.js # Agent for venue onboarding, API sync, feedback loops
│ │ ├── harmonize.js # Agent for team task assignment (Slack), risk alerts
│ │ ├── kindling.js # Agent for tracking forums, sentiment, social sharing
│ │ ├── revwatch.js # Agent for monetization logic (tier forecasts, usage alerts)
│ │ ├── corekeeper.js # Agent for backup routines and disaster recovery
│ │ └── signalcaster.js # Agent for marketing (TikTok/X push, UX benchmarking)
│ ├── utils/ # 🔹 Shared helper functions and integrations
│ │ ├── github.js # GitHub webhook handler, polling, commit fetcher
│ │ ├── slack.js # Slack Bot integration: message send, task assign
│ │ ├── scheduler.js # Cron-style job scheduler (e.g., weekly reports, backups)
│ │ └── firestore.js # Firestore utility helpers (read/write KPI data)
│ ├── workflows/ # 🔹 Compound workflows combining multiple agents or tasks
│ │ ├── deploy.js # Auto-deploy trigger logic via Firebase CLI
│ │ ├── test.js # Jest or CI test trigger logic
│ │ ├── monitor.js # Weekly KPI monitor, anomaly flagger
│ │ └── sync.js # Sync GitHub commits to Slack/Firestore
│ └── logs/ # 🗂 Optional local logs (or could stream to Firestore)
│ └── ai-responses.json # Role-tagged chatbot response log (for dev/debugging)
├── firebase.json # 🔧 Firebase config: Hosting rules, Functions rewrites
├── .firebaserc # 🔧 Firebase project alias binding (e.g., "archeos-dev", "archeos-prod")
├── .gitignore # 🔐 Top-level .gitignore (includes `.env`, system files)
├── .nvmrc # 🧩 Optional: Lock Node.js version for consistency (e.g., "18")
├── LICENSE # 📄 MIT License (or your preferred open-source license)
└── README.md # 📘 Full project description, usage, deployment, role maps
```

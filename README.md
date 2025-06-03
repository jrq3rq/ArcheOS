## 🧠 Overview

**ArcheOS** is an internal AI-powered operations manager for The Archetype Academy. It coordinates tasks, tracks KPIs, enforces compliance, and supports venue rollout using modular agents powered by Grok API and Firebase Functions.

```markdown
archeos/
├── public/ # 🔹 Frontend served by Firebase Hosting
│ ├── index.html # Admin UI: chatbot, role selector, Configure System button, progress indicator
│ ├── style.css # UI styling: config-mode class, 20px margin for exit button
│ └── chatbot.js # Chat logic: sends input + role to backend, onboarding flow, button visibility toggle
├── functions/ # 🔹 Firebase Cloud Functions (backend)
│ ├── index.js # Entrypoint: routes POST to role handler, adds /onboarding, /save-config, /save-feedback
│ ├── .env # 🔐 Local secrets (Grok API key, Slack token) — never committed
│ ├── .gitignore # Prevents secrets and `node_modules` from being committed
│ ├── package.json # Dependencies: dotenv, node-fetch, firebase-functions, fs
│ ├── prompts/ # 🔹 System prompt templates
│ │ ├── role-presets.js # Role-to-system-prompt map (e.g., Planner, Strategist, Compliance)
│ │ └── question-guide-presets.js # Onboarding question prompts (e.g., business_strategy, compliance_ethics)
│ ├── agents/ # 🔹 Modular AI agent logic files (one per function/domain)
│ │ ├── planner.js # Agent for project management (previously archeos)
│ │ ├── strategist.js # Agent for planning, KPIs, scope control
│ │ ├── developer.js # Agent for CI/CD, deploy/test automation (previously architect)
│ │ ├── compliance.js # Agent for compliance: GDPR, WCAG, CCPA, bias checks (previously sentinel)
│ │ ├── integrator.js # Agent for venue onboarding, API sync (previously synchronizer)
│ │ ├── coordinator.js # Agent for team task assignment (Slack), risk alerts
│ │ ├── marketer.js # Agent for marketing (TikTok/X push, UX benchmarking)
│ │ ├── optimizer.js # Agent for monetization logic (tier forecasts, usage alerts)
│ │ ├── sustainer.js # Agent for backup routines and disaster recovery
│ │ └── engager.js # Agent for tracking forums, sentiment, social sharing
│ ├── utils/ # 🔹 Shared helper functions and integrations
│ │ ├── github.js # GitHub webhook handler, polling, commit fetcher
│ │ ├── slack.js # Slack Bot integration: message send, task assign
│ │ ├── scheduler.js # Cron-style job scheduler (e.g., weekly reports, backups)
│ │ └── firestore.js # Firestore utility helpers (read/write KPI data, optional for production)
│ ├── workflows/ # 🔹 Compound workflows combining multiple agents or tasks
│ │ ├── deploy.js # Auto-deploy trigger logic via Firebase CLI
│ │ ├── test.js # Jest or CI test trigger logic
│ │ ├── monitor.js # Weekly KPI monitor, anomaly flagger
│ │ └── sync.js # Sync GitHub commits to Slack/Firestore
│ └── logs/ # 🗂 Optional local logs (or could stream to Firestore)
│ ├── ai-responses.json # Role-tagged chatbot response log (for dev/debugging)
│ ├── config.json # Generated config file from onboarding (development only)
│ └── feedback.json # User feedback log from onboarding (development only)
├── firebase.json # 🔧 Firebase config: Hosting rules, Functions rewrites
├── .firebaserc # 🔧 Firebase project alias binding (e.g., "archeos-dev", "archeos-prod")
├── .gitignore # 🔐 Top-level .gitignore (includes `.env`, system files)
├── .nvmrc # 🧩 Optional: Lock Node.js version for consistency (e.g., "18")
├── LICENSE # 📄 MIT License (or your preferred open-source license)
└── README.md # 📘 Updated: project description, usage, deployment, role maps, onboarding guide
```

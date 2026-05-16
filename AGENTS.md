# AGENTS.md

## Cursor Cloud specific instructions

### Workspace overview

This is a multi-repo workspace for the **Kanakku** invoice management system:

| Repo | Service | Port | Start Command |
|------|---------|------|---------------|
| `invoice-backend-app` | Express.js REST API | 7005 | `npm run dev` |
| `invoice-frontend2-app` | Next.js 14 admin dashboard | 3001 | `npm run dev` |
| `invoice-customerfrontend-app` | Next.js 14 customer portal | 3002 | `npm run dev -- -p 3002` |
| `invoice-mobile-app` | React Native mobile (cannot run in cloud VM) | N/A | N/A |

### Critical environment setup notes

- **Backend `.env` is committed to git** (not gitignored). It contains MongoDB Atlas URI and dev credentials. No local MongoDB required.
- **Frontend2 `.env` is gitignored**. It must have `NEXTAUTH_SECRET` set to a non-empty value (e.g. `dev-secret-key-for-local-development-only`) or NextAuth login will fail with 500 errors.
- **Customer frontend `.env` is gitignored**. Copy from `.env.example` and point `NEXT_PUBLIC_BACKEND_URL` to `http://localhost:7005`.
- **Puppeteer/Chromium**: The backend uses Puppeteer for PDF generation. When installing backend dependencies, use `PUPPETEER_SKIP_DOWNLOAD=true npm install` to avoid a very slow (~8min+) Chromium download. The system Google Chrome at `/usr/local/bin/google-chrome` is available. Note: in dev mode, Puppeteer uses its bundled Chromium (which won't exist after skip), so PDF generation will fail unless you set `PUPPETEER_EXECUTABLE_PATH=/usr/local/bin/google-chrome`.
- **Mobile app** requires `npm install --legacy-peer-deps` due to React 19 peer dependency conflicts.

### Test credentials

- Email: `admin@example.com`
- Password: `Admin@123`
- Role: Admin (full access)

There is also a Super Admin: `superadmin@dreamstechnologies.com` / `Dgt@2023`.

### Start order

1. Backend first (`npm run dev` in `invoice-backend-app`) — both frontends depend on it.
2. Frontend2 (`npm run dev` in `invoice-frontend2-app`) — runs on port 3001.
3. Customer frontend (`npm run dev -- -p 3002` in `invoice-customerfrontend-app`) — port 3002 to avoid conflict with default Next.js port.

### Lint

- Frontend2: ESLint v9 in devDeps is incompatible with `next lint` (Next.js 14 expects ESLint v8 API). Lint is effectively unavailable for frontend2 without downgrading ESLint.
- Customer frontend: No eslint config file present. `next lint` prompts for setup (interactive).
- Mobile app: `npm run lint` works but reports many pre-existing warnings (6000+).
- Backend: No eslint configured.

### Gotchas

- The frontend2 `.env` uses `${BASEPATH}` variable interpolation. Leave `BASEPATH=` empty for local dev.
- When restarting Next.js dev servers, the old `next-server` child process may linger on the port. Use `netstat -tlnp | grep <port>` to find and kill it by PID before restarting.
- The backend Mongoose deprecation warning about `punycode` is harmless (Node 22 internal deprecation).

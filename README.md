# OneHealth

A patient-owned medical records platform for Nigeria. Patients control who can see their records, hospitals are verified, and emergency contacts can unlock records in an emergency.

This repository holds the **frontend** only: a pnpm + Turborepo monorepo with two web apps and a shared UI package. The backend (Django + Django REST Framework) lives separately.

| Part | What it is | Dev URL |
|---|---|---|
| `apps/patient` | Patient app. A PWA. Sign-up, login, password reset (more coming) | http://localhost:3001 |
| `apps/portal` | Hospitals and staff app. Not a PWA | http://localhost:3000 |
| `packages/ui` | Shared design system: tokens, components, fonts' CSS variables | n/a |

---

## 1. Requirements

- **Node.js** 20 or newer
- **pnpm** 10 (`npm install -g pnpm`). Do not use npm or yarn in this repo; they will create the wrong lockfile.
- **Git**

The commands in this README work in Windows Command Prompt, PowerShell, macOS and Linux unless a section says otherwise.

---

## 2. Getting started

```bash
# 1. Install everything (first time takes a while, and again whenever package.json changes)
pnpm install

# 2. Create your local environment file for the patient app
#    Windows:      copy apps\patient\.env.example apps\patient\.env.local
#    macOS/Linux:  cp apps/patient/.env.example apps/patient/.env.local

# 3. Start both apps
pnpm dev
```

Or run one app at a time:

```bash
pnpm --filter patient dev
pnpm --filter portal dev
```

Open http://localhost:3001/signup for the patient app.

The patient app is installable on secure origins: use HTTPS when deployed; browsers treat `localhost` as secure for local testing. Its service worker caches only Next.js static assets and the app icons, not pages, API responses, or patient records.

> **Command Prompt tip:** `#` does not start a comment in Command Prompt. If you copy a command, copy only the command and not any `# comment` after it, or it gets passed to the program as arguments.

### Environment variables (`apps/patient/.env.local`)

| Variable | Default | What it does |
|---|---|---|
| `NEXT_PUBLIC_USE_MOCKS` | `true` | `true` = the app uses a fake in-browser API (no backend needed). `false` = the app calls the real backend |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Real backend base URL (used when mocks are off) |
| `NEXT_PUBLIC_PORTAL_SIGNUP_URL` | `http://localhost:3000/signup` | Where "Sign up as a Health Provider" links to |
| `NEXT_PUBLIC_TERMS_URL` / `NEXT_PUBLIC_PRIVACY_URL` | `/terms`, `/privacy` | Legal pages |

Values starting with `NEXT_PUBLIC_` are baked in when the dev server starts. **Restart `pnpm dev` after changing them.**

> **Never deploy a production build with `NEXT_PUBLIC_USE_MOCKS=true`.** The mock accepts almost any code and password.

---

## 3. Project structure

```
onehealth/
├── apps/
│   ├── patient/                 Patient PWA (port 3001)
│   │   ├── app/
│   │   │   ├── (auth)/          Route group: shared layout for auth screens
│   │   │   │   ├── signup/      sign-up flow (6 screens)
│   │   │   │   ├── login/
│   │   │   │   └── reset-password/
│   │   │   ├── layout.tsx       fonts, theme provider, imports the shared CSS
│   │   │   └── manifest.ts      PWA manifest
│   │   ├── components/          App-only components, including SW registration
│   │   ├── lib/
│   │   │   ├── api/             API layer: types, mock, real adapter  <- see section 5
│   │   │   ├── hooks/           use-step-guard, use-countdown
│   │   │   ├── stores/          zustand stores (signup, session, reset)
│   │   │   ├── validation/      zod schemas
│   │   │   ├── constants.ts, routes.ts, env.ts, format.ts
│   │   └── public/
│   │       ├── brand/           Logo files
│   │       └── sw.js             caches static assets only; never API responses
│   └── portal/                  Hospitals/staff app (port 3000)
├── packages/
│   └── ui/                      Shared design system  (@workspace/ui)
│       └── src/
│           ├── components/      Button, Input, FlowCard, StepIndicator, OTP...
│           ├── lib/             cn(), field and link class helpers
│           └── styles/globals.css   ALL colours, type and radius tokens live here
├── docs/                        Setup guides (see section 8)
├── scripts/check-tokens.mjs     Fails if anyone hard-codes a hex colour
├── turbo.json                   Turborepo task config
└── pnpm-workspace.yaml
```

---

## 4. The design system (read before writing UI)

**Figma is the source of truth.** When Figma and `DESIGN.md` disagree, Figma wins. Compare every screen with its Figma frame (400px wide on desktop, 393px on mobile) before opening a pull request.

All styling is set once in `packages/ui/src/styles/globals.css`. The rules:

1. **No hex, rgb or hsl colours outside `globals.css`.** Use token classes: `bg-brand`, `text-ink`, `text-ink-subtle`, `bg-field`, `border-line`, `text-danger`...
2. **Tailwind's default colours are switched off** (`bg-red-500`, `text-gray-600` produce nothing on purpose).
3. **No arbitrary sizes** like `text-[22px]` or `rounded-[12px]`. Use the type scale (`text-title`, `text-body`, `text-caption`...), the radius scale (`rounded-sm/md/lg/full`) and Tailwind's spacing steps.
4. **Icons come from Phosphor** (`@phosphor-icons/react`). Files that render Phosphor icons need `"use client"` at the top.
5. **Every input needs a label** (visible or `sr-only`) and `aria-invalid` when it has an error.
6. **Dark mode** works through a `.dark` class (set by `next-themes`). Dark values are provisional until design supplies dark screens.

Run the colour check any time:

```bash
pnpm check:tokens
```

The full token table, cheat sheet and component code are in the guides in `docs/`.

---

## 5. Mock data and connecting the real backend

Screens never call `fetch` themselves. They only import `authApi` from `@/lib/api`, which is one of two implementations:

- `lib/api/auth.mock.ts`: fake data, used when `NEXT_PUBLIC_USE_MOCKS=true`
- `lib/api/auth.http.ts`: the real calls

The request and response shapes in `lib/api/types.ts` are **proposals, not the backend's contract.** When the Django endpoints are ready:

1. Set `NEXT_PUBLIC_USE_MOCKS=false` and `NEXT_PUBLIC_API_URL`.
2. Adjust the paths in `auth.http.ts`.
3. If the real shapes differ, change the types and map the fields **inside `auth.http.ts`** so the screens do not change.
4. Make the server's errors look like `{ "code": "OTP_INVALID", "message": "..." }`, or translate them in `lib/api/client.ts`.

Do not import from `auth.mock.ts` or `auth.http.ts` directly in screens.

### Magic test values (mock mode only)

| Where | Enter | Result |
|---|---|---|
| Sign up, NIN | `00000000000` | "NIN not found" |
| Sign up, phone | `08000000001` | "Already registered" |
| Sign up, phone | `08000000002` | Fails at the last step, shows the error screen |
| Any code screen | `0000` | "Code incorrect" |
| Any code screen | `9999` | "Code expired" |
| Login, password | `wrongpass` | "Incorrect ID or password" |
| Login, ID | `locked` | "Too many attempts" |
| Password reset, phone | `08000000003` | "Too many attempts" |
| Anything else | any valid-looking input | Success |

---

## 6. Common tasks

### Add a shadcn component

Run the command **from inside an app folder**. The CLI puts the shared component in `packages/ui` and fixes the imports.

```bash
cd apps/patient
pnpm dlx shadcn@latest add dialog
```

Then import it like this:

```tsx
import { Dialog } from "@workspace/ui/components/dialog"
```

If the CLI asks to overwrite `button`, `input`, `native-select` or `lib/utils.ts`, **answer no**. We customised those on purpose. Never run `shadcn add` from the repo root or from `packages/ui`.

### Add a package

```bash
pnpm --filter patient add some-package              # to the patient app
pnpm --filter @workspace/ui add some-package        # to the shared UI package
```

If a component in `packages/ui` imports a package, it must be listed in `packages/ui/package.json`. Otherwise you get "Module not found" even though the package exists in the app.

### Type check

```bash
pnpm --filter patient exec tsc --noEmit
```

### Build and lint

```bash
pnpm build
pnpm lint
```

(These run through Turborepo. Check the root `package.json` scripts if one is missing.)

### Add a new screen

1. Open its Figma frame and note the node id.
2. Build it from existing components in `packages/ui` first. Only add a new shared component if two or more screens need it.
3. Put it under `apps/patient/app/(auth)/...` (or the right route group). Add its path to `lib/routes.ts`. Never write a path string inside a component.
4. Use the API layer for any data, with the mock first.
5. Compare it with Figma, run `pnpm check:tokens` and the type check, then open a pull request.

---

## 7. Build status (patient app)

| Screen | Route | Status |
|---|---|---|
| Sign up | `/signup` | Done (mock data) |
| Confirm your details | `/signup/confirm` | Done (mock data) |
| Verify your phone | `/signup/verify` | Done (mock data) |
| Emergency contact | `/signup/emergency-contact` | Done (mock data) |
| Setup password | `/signup/password` | Done (mock data) |
| Registration success / error | `/signup/success`, `/signup/error` | Done (mock data) |
| Login | `/login` | Done (mock data) |
| Password reset (3 screens) | `/reset-password/...` | Guide written, apply it |
| Home | `/home` | Not built (currently 404) |
| Records, vitals, access sharing | | Not built |
| Portal (hospitals/staff) | | Not started |

Open questions (login session storage, Google login, reset success screen) are listed at the end of each guide in `docs/`.

---

## 8. Documentation

Put the setup guides in `docs/`. Each builds on the one before:

1. `ONEHEALTH-PATIENT-SIGNUP-SETUP.md`: design tokens, shared components, the API layer and the sign-up flow
2. `ONEHEALTH-PATIENT-LOGIN.md`: login screen
3. `ONEHEALTH-PATIENT-PASSWORD-RESET.md`: password reset flow

Product and design references:

- [PRD](https://docs.google.com/document/d/17kN2Ib-JAMDyCIeLghVBr9wHXCDzB6rhvczwMqIei78/edit?usp=sharing)
- [Figma designs](https://www.figma.com/design/jduTGYIR4uJ8eS5kq6X9Kh/OneHealth)
- [Project flows (FigJam)](https://www.figma.com/board/PfxKHaYEszBLzhLc4Z7RIl/Project-Flows)
- [System architecture](https://drive.google.com/file/d/1QqEO6wOXBjnISo_jr-crFc7XiPR3Qn7R/view?usp=drive_link)

Some decisions made on team calls are not yet updated in those documents. If something conflicts, ask before assuming the document is right.

---

## 9. Contributing

- Commit after each finished feature or screen, with a clear message such as `feat(patient): login screen` or `fix(ui): button hover overlay`.
- Changes inside `packages/ui` affect every app, so they go through a pull request and a review.
- Do not edit `components.json` (`style`, `iconLibrary` and `baseColor` must match in the app and `packages/ui` files).
- Never store passwords, NINs or tokens in localStorage, in stores that persist, or in logs. Patient data is sensitive.
- Do not cache patient records in the PWA service worker. Only the app shell and static files.

---

## 10. Troubleshooting

| Symptom | Fix |
|---|---|
| `Module not found: Can't resolve 'xyz'` pointing at a file in `packages/ui` | The package is missing from `packages/ui`. Run `pnpm --filter @workspace/ui add xyz` and restart the dev server |
| Page is unstyled, or a colour class does nothing | The shared `globals.css` is not imported in `layout.tsx`, or you used a default Tailwind colour (switched off). Use a token |
| `Expected ';'...` parsing error | A typo in the file named in the error. Check the line it points at |
| Error about `createContext` in a Server Component | A file using Phosphor icons needs `"use client"` at the top |
| Fonts look like system fonts | The font variable names in `layout.tsx` do not match the ones in `globals.css` |
| Two apps fight over a port | Check the `--port` flag in each app's `dev` script (portal 3000, patient 3001) |
| Env change has no effect | Restart `pnpm dev` |
| First page load is very slow | Normal for the first compile of each route in dev mode. Keep the project on a local drive, not a network or synced folder |
| `/home` shows 404 after login or sign-up | Expected until the home screen is built |
# RTOS Lab — Embedded Systems Exam Prep

Interactive web app for learning FreeRTOS concepts: task scheduling, LED patterns, timer interrupts, and mutexes.

**Live demo:** https://lana-mustafic.github.io/embedded/

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages

**Live URL:** https://lana-mustafic.github.io/embedded/

Pushes to `main` deploy via [GitHub Actions](.github/workflows/deploy.yml).

### First-time setup (required once)

1. Wait for [Actions](https://github.com/lana-mustafic/embedded/actions) to finish (pushes `dist` to the **`gh-pages`** branch).
2. Open [Settings → Pages](https://github.com/lana-mustafic/embedded/settings/pages)
3. **Build and deployment** → **Source**: **Deploy from a branch**
4. **Branch**: `gh-pages` → folder **`/ (root)`** → **Save**

If Actions cannot push: **Settings → Actions → General** → **Workflow permissions** → **Read and write permissions** → Save.

The app is served at `/embedded/` (see `base` in `vite.config.js`).

## Modules

| Module | Purpose |
|--------|---------|
| Task Scheduler | Priorities, states, suspend/notify, exam sequence T1→T2→T1→T2→T3→T3 |
| LED Pattern | Synchronized A / B-B / A / B timeline |
| Timer ISR | 200 ms / 500 ms blinks via interrupt flags |
| Mutex | Race condition vs protected shared LED |
| Learning | Concept cards + Why? explanations |
| Exam Practice | Random questions with pseudocode answers |
| Code Examples | Commented Arduino/FreeRTOS-style pseudocode |

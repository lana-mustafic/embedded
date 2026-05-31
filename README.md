# RTOS Lab — Embedded Systems Exam Prep

Interactive web app for learning FreeRTOS concepts: task scheduling, LED patterns, timer interrupts, and mutexes.

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

import { useState } from 'react';
import TaskScheduler from './modules/TaskScheduler';
import LedPattern from './modules/LedPattern';
import TimerInterrupt from './modules/TimerInterrupt';
import MutexSimulator from './modules/MutexSimulator';
import LearningMode from './modules/LearningMode';
import ExamPractice from './modules/ExamPractice';
import CodeExamplesPage from './modules/CodeExamplesPage';
import './App.css';

const NAV = [
  { id: 'home', label: 'Home', icon: '◆' },
  { id: 'scheduler', label: 'Task Scheduler', icon: '▣' },
  { id: 'pattern', label: 'LED Pattern', icon: '◎' },
  { id: 'timer', label: 'Timer ISR', icon: '⏱' },
  { id: 'mutex', label: 'Mutex', icon: '🔐' },
  { id: 'learn', label: 'Learning', icon: '📖' },
  { id: 'exam', label: 'Exam Practice', icon: '✎' },
  { id: 'code', label: 'Code Examples', icon: '</>' },
];

function Home({ setPage }) {
  return (
    <section className="module home">
      <div className="hero">
        <h1>RTOS Lab</h1>
        <p className="hero-sub">
          Interactive prep for Embedded Systems exams — FreeRTOS tasks, LEDs,
          timers, and mutexes explained step by step.
        </p>
      </div>
      <div className="home-grid">
        {NAV.filter((n) => n.id !== 'home').map((n) => (
          <article
            key={n.id}
            className="card home-card"
            onClick={() => setPage(n.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setPage(n.id)}
          >
            <span className="home-icon">{n.icon}</span>
            <h3>{n.label}</h3>
            <p>
              {n.id === 'scheduler' &&
                'Priorities, pins, suspend/notify, step-by-step T1→T2 sequence.'}
              {n.id === 'pattern' && 'Coordinated A / B-B / A / B pattern.'}
              {n.id === 'timer' && '200 ms & 500 ms blinks via ISR flags.'}
              {n.id === 'mutex' && 'Race vs protected shared LED.'}
              {n.id === 'learn' && 'Concept cards and Why? deep dives.'}
              {n.id === 'exam' && 'Random questions with pseudocode answers.'}
              {n.id === 'code' && 'Commented exam-style pseudocode.'}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

const MODULES = {
  home: Home,
  scheduler: TaskScheduler,
  pattern: LedPattern,
  timer: TimerInterrupt,
  mutex: MutexSimulator,
  learn: LearningMode,
  exam: ExamPractice,
  code: CodeExamplesPage,
};

export default function App() {
  const [page, setPage] = useState('home');
  const Active = MODULES[page];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand" onClick={() => setPage('home')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setPage('home')}>
          <span className="brand-dot" />
          RTOS Lab
        </div>
        <nav>
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`nav-item ${page === n.id ? 'nav-active' : ''}`}
              onClick={() => setPage(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <Active setPage={setPage} />
      </main>
    </div>
  );
}

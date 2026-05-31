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
  { id: 'home', label: 'Početna', icon: '◆' },
  { id: 'scheduler', label: 'Raspoređivač', icon: '▣' },
  { id: 'pattern', label: 'LED uzorak', icon: '◎' },
  { id: 'timer', label: 'Timer ISR', icon: '⏱' },
  { id: 'mutex', label: 'Mutex', icon: '🔐' },
  { id: 'learn', label: 'Učenje', icon: '📖' },
  { id: 'exam', label: 'Vježba ispita', icon: '✎' },
  { id: 'code', label: 'Primjeri koda', icon: '</>' },
];

function Home({ setPage }) {
  return (
    <section className="module home">
      <div className="hero">
        <h1>RTOS Lab</h1>
        <p className="hero-sub">
          Interaktivna priprema za ispit iz ugrađenih sustava — FreeRTOS taskovi,
          LED-ovi, timeri i mutexi objašnjeni korak po korak.
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
                'Prioriteti, pinovi, suspend/notify, korak-po-korak T1→T2→T3.'}
              {n.id === 'pattern' && 'Sinkronizirani uzorak A / B-B / A / B.'}
              {n.id === 'timer' && 'Treptanje 200 ms i 500 ms preko ISR zastavica.'}
              {n.id === 'mutex' && 'Race condition vs zaštićeni dijeljeni LED.'}
              {n.id === 'learn' && 'Kartice pojmova i „Zašto?” objašnjenja.'}
              {n.id === 'exam' && 'Nasumična pitanja s pseudokodom.'}
              {n.id === 'code' && 'Komentirani pseudokod za ispit.'}
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

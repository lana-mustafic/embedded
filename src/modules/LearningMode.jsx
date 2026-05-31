import WhyButton from '../components/WhyButton';
import { WHY_TOPICS } from '../data/whyContent';

const CONCEPTS = [
  {
    id: 'tasks',
    title: 'Tasks & scheduler',
    summary:
      'A task is like a mini-program with its own loop. The scheduler runs the highest-priority Ready task. When it blocks (delay) or is suspended, others run.',
    examTip:
      'Exam boards list priorities and pins — always mark who is Ready vs Suspended vs Waiting.',
    whyKey: 'priority',
  },
  {
    id: 'suspend',
    title: 'taskSuspend / taskResume',
    summary:
      'Pause a task without deleting it. Useful to force a custom order (e.g. hide Task3 until Task1 and Task2 alternate).',
    examTip:
      'Look for "stop this LED but keep others" — that is suspend, not delete.',
    whyKey: 'suspend',
  },
  {
    id: 'notify',
    title: 'taskNotify',
    summary:
      'One task signals another directly. Lighter than a queue when you only need "wake up".',
    examTip:
      'Pair with ulTaskNotifyTake in the receiver task.',
    whyKey: 'notify',
  },
  {
    id: 'timer',
    title: 'Timer interrupt',
    summary:
      'Hardware counts time in the background. ISR sets flags; tasks do the work.',
    examTip:
      'If the question says "exactly every X ms regardless of tasks" → timer ISR.',
    whyKey: 'timer',
  },
  {
    id: 'mutex',
    title: 'Mutex',
    summary:
      'Protects one shared resource (one LED, UART, bus). Take before use, give after.',
    examTip:
      'Two tasks, one pin, garbled output → mutex (or redesign so only one task owns the pin).',
    whyKey: 'mutex',
  },
  {
    id: 'states',
    title: 'Task states',
    summary: (
      <ul className="state-legend">
        <li>
          <span className="state-badge state-running">Running</span> — on CPU now
        </li>
        <li>
          <span className="state-badge state-ready">Ready</span> — can run when selected
        </li>
        <li>
          <span className="state-badge state-waiting">Waiting</span> — blocked on notify/semaphore/delay
        </li>
        <li>
          <span className="state-badge state-suspended">Suspended</span> — removed until resume
        </li>
      </ul>
    ),
    examTip: 'Draw a small table in your exam answer — examiners love clear state columns.',
    whyKey: null,
  },
];

export default function LearningMode() {
  return (
    <section className="module">
      <header className="module-header">
        <h2>Learning Mode</h2>
        <p>
          Short concepts in plain English. Use simulators for motion; use this
          page for vocabulary and exam phrasing.
        </p>
      </header>

      <div className="concept-grid">
        {CONCEPTS.map((c) => (
          <article key={c.id} className="card concept-card">
            <h3>{c.title}</h3>
            <div className="concept-body">
              {typeof c.summary === 'string' ? <p>{c.summary}</p> : c.summary}
            </div>
            <p className="exam-tip">
              <strong>Exam tip:</strong> {c.examTip}
            </p>
            {c.whyKey && <WhyButton content={WHY_TOPICS[c.whyKey]} />}
          </article>
        ))}
      </div>

      <div className="card study-path">
        <h3>Suggested study path</h3>
        <ol>
          <li>Task Scheduler — priorities and the T1→T2→T1→T2→T3→T3 sequence</li>
          <li>LED Pattern — synchronization between tasks</li>
          <li>Timer interrupt — ISR vs delay</li>
          <li>Mutex — shared resource</li>
          <li>Exam Practice — random questions</li>
          <li>Code Examples — copy-friendly pseudocode</li>
        </ol>
      </div>
    </section>
  );
}

import { useState, useEffect, useRef } from 'react';
import Led from '../components/Led';
import WhyButton from '../components/WhyButton';
import CodeBlock from '../components/CodeBlock';
import { WHY_TOPICS } from '../data/whyContent';
import { CODE_EXAMPLES } from '../data/codeExamples';

// Pattern: A, B B-fast, A, B, repeat
const PATTERN = [
  { led: 'A', duration: 600, label: 'A ON' },
  { led: 'B', duration: 350, label: 'B ON' },
  { led: 'B', duration: 200, label: 'B quick' },
  { led: 'A', duration: 600, label: 'A ON' },
  { led: 'B', duration: 500, label: 'B ON' },
];

export default function LedPattern() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ledA, setLedA] = useState(false);
  const [ledB, setLedB] = useState(false);
  const timeoutRef = useRef(null);

  const step = PATTERN[index];

  useEffect(() => {
    setLedA(step.led === 'A');
    setLedB(step.led === 'B');
  }, [index, step.led]);

  useEffect(() => {
    if (!playing) {
      clearTimeout(timeoutRef.current);
      return;
    }
    timeoutRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % PATTERN.length);
    }, step.duration);
    return () => clearTimeout(timeoutRef.current);
  }, [playing, index, step.duration]);

  const progress = ((index + 1) / PATTERN.length) * 100;

  return (
    <section className="module">
      <header className="module-header">
        <h2>LED Pattern Simulator</h2>
        <p>
          Pattern: <strong>A</strong> → <strong>B</strong> (quick second B) →{' '}
          <strong>A</strong> → <strong>B</strong> → repeat. Tasks coordinate with
          semaphores or notify so order never drifts.
        </p>
      </header>

      <div className="card">
        <div className="led-row led-row-lg">
          <Led label="LED A" pin="Pin 8" on={ledA} size="lg" />
          <Led label="LED B" pin="Pin 9" on={ledB} size="lg" />
        </div>

        <div className="timeline">
          <div className="timeline-track">
            <div
              className="timeline-progress"
              style={{ width: `${progress}%` }}
            />
            {PATTERN.map((p, i) => (
              <button
                key={i}
                type="button"
                className={`timeline-node ${i === index ? 'node-active' : ''} ${p.led === 'B' && p.label.includes('quick') ? 'node-fast' : ''}`}
                style={{ left: `${(i / PATTERN.length) * 100 + 4}%` }}
                onClick={() => {
                  setIndex(i);
                  setPlaying(false);
                }}
                title={p.label}
              >
                {p.led}
              </button>
            ))}
          </div>
          <p className="timeline-caption">
            Step {index + 1}: {step.label} ({step.duration} ms)
          </p>
        </div>

        <div className="task-sync-diagram">
          <div className="sync-box">
            <span className="sync-task">Task A</span>
            <span className="sync-arrow">→ give semaphore →</span>
            <span className="sync-task">Task B</span>
            <span className="sync-arrow">→ give back →</span>
            <span className="sync-task">Task A</span>
          </div>
          <p className="hint">
            Task A blinks LED A, then signals Task B. Task B does double-blink,
            signals back. Without sync, both LEDs would drift out of phase.
          </p>
        </div>

        <div className="transport">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setIndex(0);
              setPlaying(false);
            }}
          >
            Reset
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              setIndex((i) => (i - 1 + PATTERN.length) % PATTERN.length)
            }
          >
            Previous
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIndex((i) => (i + 1) % PATTERN.length)}
          >
            Next
          </button>
          <button
            type="button"
            className={`btn ${playing ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => setPlaying(!playing)}
          >
            {playing ? 'Pause' : 'Play timeline'}
          </button>
        </div>
      </div>

      <WhyButton content={WHY_TOPICS.notify} />
      <CodeBlock title="Task + synchronization pseudocode" code={CODE_EXAMPLES.ledPattern} />
    </section>
  );
}

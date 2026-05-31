import { useState, useEffect, useRef } from 'react';
import Led from '../components/Led';
import WhyButton from '../components/WhyButton';
import CodeBlock from '../components/CodeBlock';
import { WHY_TOPICS } from '../data/whyContent';
import { CODE_EXAMPLES } from '../data/codeExamples';

const PATTERN = [
  { led: 'A', duration: 600, label: 'A uključen' },
  { led: 'B', duration: 350, label: 'B uključen' },
  { led: 'B', duration: 200, label: 'B brzo' },
  { led: 'A', duration: 600, label: 'A uključen' },
  { led: 'B', duration: 500, label: 'B uključen' },
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
        <h2>Simulator LED uzorka</h2>
        <p>
          Uzorak: <strong>A</strong> → <strong>B</strong> (brzi drugi B) →{' '}
          <strong>A</strong> → <strong>B</strong> → ponavljanje. Taskovi se
          usklađuju semaforima ili notifyjem da redoslijed ne „pobjegne”.
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
                className={`timeline-node ${i === index ? 'node-active' : ''} ${p.label.includes('brzo') ? 'node-fast' : ''}`}
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
            Korak {index + 1}: {step.label} ({step.duration} ms)
          </p>
        </div>

        <div className="task-sync-diagram">
          <div className="sync-box">
            <span className="sync-task">Task A</span>
            <span className="sync-arrow">→ daj semafor →</span>
            <span className="sync-task">Task B</span>
            <span className="sync-arrow">→ vrati →</span>
            <span className="sync-task">Task A</span>
          </div>
          <p className="hint">
            Task A trepti LED A, zatim signalizira Task B. Task B radi dvostruko
            treptanje i vraća signal. Bez sinkronizacije LED-ovi bi se
            razmaknuli u fazi.
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
            Prethodni
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIndex((i) => (i + 1) % PATTERN.length)}
          >
            Sljedeći
          </button>
          <button
            type="button"
            className={`btn ${playing ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => setPlaying(!playing)}
          >
            {playing ? 'Pauza' : 'Pokreni vremensku crtu'}
          </button>
        </div>
      </div>

      <WhyButton content={WHY_TOPICS.notify} />
      <CodeBlock title="Pseudokod — task + sinkronizacija" code={CODE_EXAMPLES.ledPattern} />
    </section>
  );
}

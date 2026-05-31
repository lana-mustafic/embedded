import { useState, useEffect, useRef } from 'react';
import Led from '../components/Led';
import WhyButton from '../components/WhyButton';
import CodeBlock from '../components/CodeBlock';
import { WHY_TOPICS } from '../data/whyContent';
import { CODE_EXAMPLES } from '../data/codeExamples';

const TICK_MS = 50;
const LED1_PERIOD = 200;
const LED2_PERIOD = 500;

export default function TimerInterrupt() {
  const [timeMs, setTimeMs] = useState(0);
  const [led1, setLed1] = useState(false);
  const [led2, setLed2] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [lastIsr, setLastIsr] = useState(null);
  const [flags, setFlags] = useState({ led1: false, led2: false });
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!playing) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeMs((t) => {
        const next = t + TICK_MS;
        const events = [];
        if (next % LED1_PERIOD === 0) events.push('led1');
        if (next % LED2_PERIOD === 0) events.push('led2');
        if (events.length) {
          setLastIsr({ at: next, events });
          setFlags((f) => ({
            led1: events.includes('led1') ? true : f.led1,
            led2: events.includes('led2') ? true : f.led2,
          }));
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(intervalRef.current);
  }, [playing]);

  useEffect(() => {
    if (flags.led1) {
      setLed1((v) => !v);
      setFlags((f) => ({ ...f, led1: false }));
    }
    if (flags.led2) {
      setLed2((v) => !v);
      setFlags((f) => ({ ...f, led2: false }));
    }
  }, [flags.led1, flags.led2]);

  const reset = () => {
    setTimeMs(0);
    setLed1(false);
    setLed2(false);
    setLastIsr(null);
    setFlags({ led1: false, led2: false });
    setPlaying(false);
  };

  return (
    <section className="module">
      <header className="module-header">
        <h2>Simulator timer prekida</h2>
        <p>
          LED1 se preklapa svakih 200 ms, LED2 svakih 500 ms — pokreće hardverski
          timer, ne dugi delay u ISR-u.
        </p>
      </header>

      <div className="grid-2">
        <div className="card">
          <h3>LED izlazi (task obrađuje zastavice)</h3>
          <div className="led-row">
            <Led label="LED1" pin="200 ms" on={led1} />
            <Led label="LED2" pin="500 ms" on={led2} />
          </div>
          <p className="hint">
            ISR samo postavlja <code>led1Flag</code> / <code>led2Flag</code>.
            Task prebacuje pinove — ISR ostaje kratak (~10 µs na pravom
            hardveru).
          </p>
        </div>

        <div className="card isr-card">
          <h3>Timer tick (mreža 1 ms, skalirano)</h3>
          <div className="tick-display">
            <span className="tick-time">{timeMs} ms</span>
            <div className={`tick-pulse ${playing ? 'pulse-on' : ''}`} />
          </div>
          {lastIsr && (
            <div className="isr-log">
              <strong>ISR @ {lastIsr.at} ms:</strong>{' '}
              {lastIsr.events.map((e) => (
                <span key={e} className="isr-flag">
                  {e}Flag = true
                </span>
              ))}
            </div>
          )}
          {!lastIsr && playing && (
            <p className="hint muted">Čekam sljedeći prekid…</p>
          )}
          <div className="tick-ruler">
            {[0, 200, 400, 500, 600, 1000].map((m) => (
              <span
                key={m}
                className={`ruler-mark ${timeMs >= m ? 'mark-hit' : ''}`}
                style={{ left: `${(m / 1000) * 100}%` }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>ISR vs task — pravilo za ispit</h3>
        <ul className="exam-list">
          <li>
            <span className="tag tag-danger">Nikad u ISR</span> vTaskDelay,
            printf, teška matematika, mutex take
          </li>
          <li>
            <span className="tag tag-success">OK u ISR</span> zastavica,{' '}
            xSemaphoreGiveFromISR, brojač
          </li>
          <li>
            <span className="tag tag-accent">Posao taska</span> čitanje
            zastavica, LED, debug ispis
          </li>
        </ul>
      </div>

      <div className="transport">
        <button type="button" className="btn btn-secondary" onClick={reset}>
          Reset
        </button>
        <button
          type="button"
          className={`btn ${playing ? 'btn-danger' : 'btn-primary'}`}
          onClick={() => setPlaying(!playing)}
        >
          {playing ? 'Zaustavi' : 'Pokreni timer'}
        </button>
      </div>

      <WhyButton content={WHY_TOPICS.timer} />
      <CodeBlock title="Pseudokod — timer ISR + task" code={CODE_EXAMPLES.timer} />
    </section>
  );
}

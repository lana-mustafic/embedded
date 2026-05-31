import { useState, useEffect, useRef } from 'react';
import Led from '../components/Led';
import WhyButton from '../components/WhyButton';
import CodeBlock from '../components/CodeBlock';
import { WHY_TOPICS } from '../data/whyContent';
import { CODE_EXAMPLES } from '../data/codeExamples';

export default function MutexSimulator() {
  const [useMutex, setUseMutex] = useState(false);
  const [mutexLocked, setMutexLocked] = useState(false);
  const [owner, setOwner] = useState(null);
  const [ledOn, setLedOn] = useState(false);
  const [task1State, setTask1State] = useState('Ready');
  const [task2State, setTask2State] = useState('Ready');
  const [log, setLog] = useState([]);
  const [playing, setPlaying] = useState(false);
  const tickRef = useRef(0);
  const intervalRef = useRef(null);

  const addLog = (msg) => {
    setLog((l) => [...l.slice(-7), msg]);
  };

  useEffect(() => {
    if (!playing) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;
      const fastTurn = tick % 2 === 0;
      const activeTask = fastTurn ? 'Task Fast (100ms)' : 'Task Slow (500ms)';

      if (!useMutex) {
        // Race: both write LED without coordination
        setTask1State(fastTurn ? 'Running' : 'Ready');
        setTask2State(fastTurn ? 'Ready' : 'Running');
        setLedOn((v) => !v);
        if (tick % 3 === 0) {
          addLog(`⚠ Conflict: both tasks wrote LED at ~${tick * 150}ms — garbled timing`);
        } else {
          addLog(`${activeTask} wrote LED (no protection)`);
        }
        setOwner(null);
        setMutexLocked(false);
      } else {
        // Mutex: only one owns LED
        if (!mutexLocked) {
          setMutexLocked(true);
          setOwner(activeTask);
          setTask1State(fastTurn ? 'Running' : 'Waiting');
          setTask2State(fastTurn ? 'Ready' : 'Waiting');
          setLedOn((v) => !v);
          addLog(`${activeTask} took mutex → LED toggle`);
          setTimeout(() => {
            setMutexLocked(false);
            setOwner(null);
            setTask1State('Ready');
            setTask2State('Ready');
            addLog('Mutex released');
          }, 400);
        } else {
          setTask1State('Waiting');
          setTask2State('Waiting');
          addLog(`${activeTask} blocked — mutex locked by ${owner}`);
        }
      }
    }, 600);

    return () => clearInterval(intervalRef.current);
  }, [playing, useMutex, mutexLocked, owner]);

  const reset = () => {
    setPlaying(false);
    tickRef.current = 0;
    setLedOn(false);
    setMutexLocked(false);
    setOwner(null);
    setTask1State('Ready');
    setTask2State('Ready');
    setLog([]);
  };

  return (
    <section className="module">
      <header className="module-header">
        <h2>Mutex Simulator</h2>
        <p>
          Two tasks share one LED: fast blink (100 ms) vs slow blink (500 ms).
          Compare chaos without a mutex vs safe access with one.
        </p>
      </header>

      <div className="card controls-card">
        <label className="control-label">Protection</label>
        <div className="btn-group">
          <button
            type="button"
            className={`btn ${!useMutex ? 'btn-active' : 'btn-secondary'}`}
            onClick={() => {
              setUseMutex(false);
              reset();
            }}
          >
            Without mutex (race)
          </button>
          <button
            type="button"
            className={`btn ${useMutex ? 'btn-active' : 'btn-secondary'}`}
            onClick={() => {
              setUseMutex(true);
              reset();
            }}
          >
            With mutex
          </button>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Shared LED</h3>
          <Led label="Shared LED" pin="Pin 13" on={ledOn} size="lg" />
          <div className={`mutex-status ${mutexLocked ? 'locked' : 'unlocked'}`}>
            Mutex: {mutexLocked ? '🔒 Locked' : '🔓 Unlocked'}
            {owner && <span> — owner: {owner}</span>}
          </div>
        </div>

        <div className="card">
          <h3>Tasks</h3>
          <table className="task-table mini">
            <tbody>
              <tr>
                <td>Task Fast</td>
                <td>100 ms blink</td>
                <td>
                  <span className={`state-badge state-${task1State.toLowerCase()}`}>
                    {task1State}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Task Slow</td>
                <td>500 ms blink</td>
                <td>
                  <span className={`state-badge state-${task2State.toLowerCase()}`}>
                    {task2State}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          {!useMutex && (
            <p className="warn-text">
              Both tasks call digitalWrite on the same pin → unpredictable
              pattern on the exam board.
            </p>
          )}
          {useMutex && (
            <p className="ok-text">
              Only the task holding the mutex can change the LED; the other
              waits.
            </p>
          )}
        </div>
      </div>

      <div className="card log-card">
        <h3>Event log</h3>
        <ul className="event-log">
          {log.length === 0 && (
            <li className="muted">Press Run to see events…</li>
          )}
          {log.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
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
          {playing ? 'Stop' : 'Run simulation'}
        </button>
      </div>

      <WhyButton content={WHY_TOPICS.mutex} />
      <CodeBlock
        title={useMutex ? 'With mutex' : 'Without mutex (problem)'}
        code={useMutex ? CODE_EXAMPLES.mutex : CODE_EXAMPLES.mutexBad}
      />
    </section>
  );
}

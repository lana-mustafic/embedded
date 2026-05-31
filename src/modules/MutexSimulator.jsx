import { useState, useEffect, useRef } from 'react';
import Led from '../components/Led';
import WhyButton from '../components/WhyButton';
import CodeBlock from '../components/CodeBlock';
import { STATE_LABELS } from '../data/i18n';
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
      const activeTask = fastTurn ? 'Task Brzi (100 ms)' : 'Task Spori (500 ms)';

      if (!useMutex) {
        setTask1State(fastTurn ? 'Running' : 'Ready');
        setTask2State(fastTurn ? 'Ready' : 'Running');
        setLedOn((v) => !v);
        if (tick % 3 === 0) {
          addLog(`⚠ Sukob: oba taska pišu LED @ ~${tick * 150} ms — poremećeno vrijeme`);
        } else {
          addLog(`${activeTask} piše na LED (bez zaštite)`);
        }
        setOwner(null);
        setMutexLocked(false);
      } else {
        if (!mutexLocked) {
          setMutexLocked(true);
          setOwner(activeTask);
          setTask1State(fastTurn ? 'Running' : 'Waiting');
          setTask2State(fastTurn ? 'Ready' : 'Waiting');
          setLedOn((v) => !v);
          addLog(`${activeTask} uzeo mutex → preklapanje LED-a`);
          setTimeout(() => {
            setMutexLocked(false);
            setOwner(null);
            setTask1State('Ready');
            setTask2State('Ready');
            addLog('Mutex oslobođen');
          }, 400);
        } else {
          setTask1State('Waiting');
          setTask2State('Waiting');
          addLog(`${activeTask} blokiran — mutex drži ${owner}`);
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
        <h2>Simulator mutexa</h2>
        <p>
          Dva taska dijele jedan LED: brzo (100 ms) vs sporo (500 ms) treptanje.
          Usporedi kaos bez mutexa i siguran pristup s mutexom.
        </p>
      </header>

      <div className="card controls-card">
        <label className="control-label">Zaštita</label>
        <div className="btn-group">
          <button
            type="button"
            className={`btn ${!useMutex ? 'btn-active' : 'btn-secondary'}`}
            onClick={() => {
              setUseMutex(false);
              reset();
            }}
          >
            Bez mutexa (race)
          </button>
          <button
            type="button"
            className={`btn ${useMutex ? 'btn-active' : 'btn-secondary'}`}
            onClick={() => {
              setUseMutex(true);
              reset();
            }}
          >
            S mutexom
          </button>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Dijeljeni LED</h3>
          <Led label="Dijeljeni LED" pin="Pin 13" on={ledOn} size="lg" />
          <div className={`mutex-status ${mutexLocked ? 'locked' : 'unlocked'}`}>
            Mutex: {mutexLocked ? '🔒 Zaključan' : '🔓 Otključan'}
            {owner && <span> — vlasnik: {owner}</span>}
          </div>
        </div>

        <div className="card">
          <h3>Taskovi</h3>
          <table className="task-table mini">
            <tbody>
              <tr>
                <td>Task Brzi</td>
                <td>treptanje 100 ms</td>
                <td>
                  <span className={`state-badge state-${task1State.toLowerCase()}`}>
                    {STATE_LABELS[task1State]}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Task Spori</td>
                <td>treptanje 500 ms</td>
                <td>
                  <span className={`state-badge state-${task2State.toLowerCase()}`}>
                    {STATE_LABELS[task2State]}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          {!useMutex && (
            <p className="warn-text">
              Oba taska zovu digitalWrite na isti pin → nepredvidiv uzorak na
              ploči s ispita.
            </p>
          )}
          {useMutex && (
            <p className="ok-text">
              Samo task koji drži mutex mijenja LED; drugi čeka.
            </p>
          )}
        </div>
      </div>

      <div className="card log-card">
        <h3>Dnevnik događaja</h3>
        <ul className="event-log">
          {log.length === 0 && (
            <li className="muted">Pritisni Pokreni za prikaz događaja…</li>
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
          {playing ? 'Zaustavi' : 'Pokreni simulaciju'}
        </button>
      </div>

      <WhyButton content={WHY_TOPICS.mutex} />
      <CodeBlock
        title={useMutex ? 'S mutexom' : 'Bez mutexa (problem)'}
        code={useMutex ? CODE_EXAMPLES.mutex : CODE_EXAMPLES.mutexBad}
      />
    </section>
  );
}

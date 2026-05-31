import { useState, useEffect, useCallback, useRef } from 'react';
import Led from '../components/Led';
import TaskStateTable from '../components/TaskStateTable';
import WhyButton from '../components/WhyButton';
import CodeBlock from '../components/CodeBlock';
import { WHY_TOPICS } from '../data/whyContent';
import { CODE_EXAMPLES } from '../data/codeExamples';

const BASE_TASKS = [
  { id: 'Task1', priority: 3, pin: 'A1', ledKey: 'A1' },
  { id: 'Task2', priority: 1, pin: 'A3', ledKey: 'A3' },
  { id: 'Task3', priority: 2, pin: 'A5', ledKey: 'A5' },
];

const SEQUENCE = ['Task1', 'Task2', 'Task1', 'Task2', 'Task3', 'Task3'];

function buildSteps(method, useController) {
  const steps = [];
  const suspended = new Set(useController && method === 'suspend' ? ['Task3'] : []);

  SEQUENCE.forEach((running, idx) => {
    let explanation = '';

    if (method === 'suspend') {
      if (useController && idx === 0) {
        explanation =
          'Kontrolni Task4 zove vTaskSuspend(Task3). Task3 više nije Ready i ne natječe se za CPU.';
      } else if (running === 'Task1' || running === 'Task2') {
        explanation = `${running} radi jer među Ready taskovima ima najviši prioritet (Task1=3, Task2=1). Task3 je obustavljen, pa raspoređivač izmjenjuje Task1 i Task2 kad oba yieldaju.`;
      } else {
        explanation = useController
          ? 'Kontroler nastavlja Task3 u njegovim koracima. Task3 (prioritet 2) radi kad Task1 i Task2 nisu Ready.'
          : 'Task3 (prioritet 2) radi kad višeprioritetni taskovi nisu Ready ili su blokirani.';
      }
      if (useController && idx === SEQUENCE.length - 1) {
        explanation += ' Kontroler može vTaskResume(Task3) nakon završetka uzorka.';
      }
    } else if (method === 'notify') {
      explanation =
        idx < 4
          ? `${running} je primio obavijest (xTaskNotifyGive). Prešao je iz Čeka → Izvršava se. Ostali čekaju svoj notify.`
          : `${running} prima notify u trećoj fazi. Nižeprioritetni taskovi ostaju u Čeka dok ne dobiju signal.`;
    } else {
      explanation = `Preemptivno raspoređivanje bira ${running} za korak ${idx + 1} ispita. Prvo Ready taskovi s višim prioritetom; kašnjenja čine druge spremnima.`;
    }

    const taskStates = BASE_TASKS.map((t) => {
      let state = 'Ready';
      if (t.id === running) state = 'Running';
      else if (suspended.has(t.id)) state = 'Suspended';
      else if (method === 'notify') state = 'Waiting';
      else state = 'Ready';
      return { ...t, state };
    });

    if (useController && method === 'suspend') {
      taskStates.push({
        id: 'Task4',
        priority: 4,
        pin: '—',
        state: idx === 0 || idx === SEQUENCE.length - 1 ? 'Running' : 'Ready',
      });
    }

    steps.push({
      running,
      taskStates,
      ledsOn: [BASE_TASKS.find((t) => t.id === running).ledKey],
      explanation,
    });
  });

  return steps;
}

export default function TaskScheduler() {
  const [method, setMethod] = useState('suspend');
  const [useController, setUseController] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const steps = buildSteps(method, useController);
  const step = steps[stepIndex];
  const timerRef = useRef(null);

  const next = useCallback(() => {
    setStepIndex((i) => (i + 1) % steps.length);
  }, [steps.length]);

  const reset = () => {
    setStepIndex(0);
    setPlaying(false);
  };

  useEffect(() => {
    if (!playing) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(next, 2200);
    return () => clearInterval(timerRef.current);
  }, [playing, next]);

  const displayTasks = step.taskStates.filter((t) => t.id !== 'Task4' || useController);

  return (
    <section className="module">
      <header className="module-header">
        <h2>Simulator raspoređivača taskova</h2>
        <p>
          Pogledaj kako FreeRTOS bira taskove po prioritetu, pinu i stanju — i
          kako suspend/resume ili notify mijenja redoslijed s ispita.
        </p>
      </header>

      <div className="card controls-card">
        <label className="control-label">Način izvršavanja</label>
        <div className="btn-group">
          {[
            ['suspend', 'taskSuspend / taskResume'],
            ['notify', 'taskNotify'],
            ['round', 'Round-robin (yield)'],
          ].map(([val, label]) => (
            <button
              key={val}
              type="button"
              className={`btn ${method === val ? 'btn-active' : 'btn-secondary'}`}
              onClick={() => {
                setMethod(val);
                reset();
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {method === 'suspend' && (
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={useController}
              onChange={(e) => {
                setUseController(e.target.checked);
                reset();
              }}
            />
            Uključi kontrolni Task4 (prioritet 4)
          </label>
        )}
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Stanja taskova</h3>
          <TaskStateTable tasks={displayTasks} highlight={step.running} />
          {useController && method === 'suspend' && (
            <p className="hint">
              Task4 (kontroler): prioritet 4 — suspend/resume drugih za redoslijed
              T1→T2→T1→T2→T3→T3.
            </p>
          )}
        </div>

        <div className="card">
          <h3>LED ploča</h3>
          <div className="led-row">
            {BASE_TASKS.map((t) => (
              <Led
                key={t.id}
                label={t.id}
                pin={t.pin}
                on={step.ledsOn.includes(t.ledKey)}
              />
            ))}
          </div>
          <p className="running-label">
            Trenutno radi: <strong>{step.running}</strong> — pin{' '}
            <code>{BASE_TASKS.find((x) => x.id === step.running).pin}</code>{' '}
            UKLJUČEN
          </p>
        </div>
      </div>

      <div className="card timeline-card">
        <h3>Redoslijed izvršavanja</h3>
        <div className="sequence-bar">
          {SEQUENCE.map((t, i) => (
            <button
              key={i}
              type="button"
              className={`seq-chip ${i === stepIndex ? 'seq-active' : ''} ${i < stepIndex ? 'seq-done' : ''}`}
              onClick={() => {
                setStepIndex(i);
                setPlaying(false);
              }}
            >
              {t.replace('Task', 'T')}
            </button>
          ))}
        </div>
        <p className="step-counter">
          Korak {stepIndex + 1} od {steps.length}
        </p>
      </div>

      <div className="card explanation-card">
        <h3>Što se dogodilo u ovom koraku?</h3>
        <p className="explanation-text">{step.explanation}</p>
      </div>

      <div className="transport">
        <button type="button" className="btn btn-secondary" onClick={reset}>
          Reset
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setStepIndex((i) => (i - 1 + steps.length) % steps.length)}
        >
          Prethodni
        </button>
        <button type="button" className="btn btn-primary" onClick={next}>
          Sljedeći korak
        </button>
        <button
          type="button"
          className={`btn ${playing ? 'btn-danger' : 'btn-primary'}`}
          onClick={() => setPlaying(!playing)}
        >
          {playing ? 'Zaustavi auto' : 'Automatski'}
        </button>
      </div>

      <div className="why-row">
        <WhyButton content={WHY_TOPICS.priority} />
        <WhyButton content={WHY_TOPICS.suspend} />
        <WhyButton content={WHY_TOPICS.notify} />
      </div>

      <CodeBlock
        title="Pseudokod"
        code={method === 'notify' ? CODE_EXAMPLES.notify : CODE_EXAMPLES.scheduler}
      />
    </section>
  );
}

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
    const others = BASE_TASKS.filter((t) => t.id !== running);
    let explanation = '';

    if (method === 'suspend') {
      if (useController && idx === 0) {
        explanation =
          'Controller Task4 calls vTaskSuspend(Task3). Task3 is no longer Ready, so it cannot compete for CPU.';
      } else if (running === 'Task1' || running === 'Task2') {
        explanation = `**${running}** runs because among Ready tasks, it has the highest priority (Task1=3, Task2=1). Task3 is Suspended, so the scheduler alternates between Task1 and Task2 when both yield.`;
      } else {
        explanation = useController
          ? 'Controller resumes Task3 for its slots. Task3 (priority 2) runs when Task1 and Task2 are not Ready.'
          : '**Task3** (priority 2) runs when higher-priority tasks are blocked or not Ready.';
      }
      if (useController && idx === SEQUENCE.length - 1) {
        explanation += ' Controller can vTaskResume(Task3) after the pattern completes.';
      }
    } else if (method === 'notify') {
      explanation =
        idx < 4
          ? `**${running}** was notified (xTaskNotifyGive). It woke from Waiting → Running. Other tasks wait for their notify.`
          : `**${running}** receives notify for the third phase. Lower-priority tasks stay Waiting until signaled.`;
    } else {
      explanation = `Preemptive scheduling picks **${running}** for step ${idx + 1} of the exam sequence. Higher priority Ready tasks run first; delays make others Ready.`;
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
        <h2>Task Scheduler Simulator</h2>
        <p>
          See how FreeRTOS picks tasks by priority, pins, and state — and how
          suspend/resume or notify changes the exam sequence.
        </p>
      </header>

      <div className="card controls-card">
        <label className="control-label">Execution method</label>
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
            Include controller Task4 (priority 4)
          </label>
        )}
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Task states</h3>
          <TaskStateTable
            tasks={displayTasks}
            highlight={step.running}
          />
          {useController && method === 'suspend' && (
            <p className="hint">
              Task4 (controller): priority 4 — suspends/resumes others to
              force sequence T1→T2→T1→T2→T3→T3.
            </p>
          )}
        </div>

        <div className="card">
          <h3>LED board</h3>
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
            Now running: <strong>{step.running}</strong> — pin{' '}
            <code>{BASE_TASKS.find((x) => x.id === step.running).pin}</code>{' '}
            ON
          </p>
        </div>
      </div>

      <div className="card timeline-card">
        <h3>Execution sequence</h3>
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
          Step {stepIndex + 1} of {steps.length}
        </p>
      </div>

      <div className="card explanation-card">
        <h3>What happened this step?</h3>
        <p className="explanation-text">{step.explanation.replace(/\*\*/g, '')}</p>
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
          Previous
        </button>
        <button type="button" className="btn btn-primary" onClick={next}>
          Next step
        </button>
        <button
          type="button"
          className={`btn ${playing ? 'btn-danger' : 'btn-primary'}`}
          onClick={() => setPlaying(!playing)}
        >
          {playing ? 'Stop auto' : 'Auto play'}
        </button>
      </div>

      <div className="why-row">
        <WhyButton content={WHY_TOPICS.priority} />
        <WhyButton content={WHY_TOPICS.suspend} />
        <WhyButton content={WHY_TOPICS.notify} />
      </div>

      <CodeBlock
        title="Pseudocode"
        code={method === 'notify' ? CODE_EXAMPLES.notify : CODE_EXAMPLES.scheduler}
      />
    </section>
  );
}

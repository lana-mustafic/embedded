import CodeBlock from '../components/CodeBlock';
import { CODE_EXAMPLES } from '../data/codeExamples';

const SECTIONS = [
  { key: 'scheduler', title: 'Task scheduler (priorities + suspend)' },
  { key: 'notify', title: 'taskNotify coordination' },
  { key: 'ledPattern', title: 'LED pattern with synchronization' },
  { key: 'timer', title: 'Timer interrupt + flags' },
  { key: 'mutex', title: 'Mutex — safe shared LED' },
  { key: 'mutexBad', title: 'Without mutex (race condition)' },
];

export default function CodeExamplesPage() {
  return (
    <section className="module">
      <header className="module-header">
        <h2>Code Examples</h2>
        <p>
          Beginner-friendly Arduino / FreeRTOS-style pseudocode for each lab
          module. Copy structure into exam answers — adjust pin names to match
          the question.
        </p>
      </header>

      {SECTIONS.map(({ key, title }) => (
        <CodeBlock key={key} title={title} code={CODE_EXAMPLES[key]} />
      ))}
    </section>
  );
}

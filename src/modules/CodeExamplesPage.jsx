import CodeBlock from '../components/CodeBlock';
import { CODE_EXAMPLES } from '../data/codeExamples';

const SECTIONS = [
  { key: 'scheduler', title: 'Raspoređivač (prioriteti + suspend)' },
  { key: 'notify', title: 'taskNotify koordinacija' },
  { key: 'ledPattern', title: 'LED uzorak sa sinkronizacijom' },
  { key: 'timer', title: 'Timer prekid + zastavice' },
  { key: 'mutex', title: 'Mutex — siguran dijeljeni LED' },
  { key: 'mutexBad', title: 'Bez mutexa (race condition)' },
];

export default function CodeExamplesPage() {
  return (
    <section className="module">
      <header className="module-header">
        <h2>Primjeri koda</h2>
        <p>
          Jednostavan Arduino / FreeRTOS pseudokod za svaki modul. Prepiši
          strukturu u odgovor na ispitu — prilagodi pinove prema zadatku.
        </p>
      </header>

      {SECTIONS.map(({ key, title }) => (
        <CodeBlock key={key} title={title} code={CODE_EXAMPLES[key]} />
      ))}
    </section>
  );
}

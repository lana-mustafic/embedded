import WhyButton from '../components/WhyButton';
import { WHY_TOPICS } from '../data/whyContent';

const CONCEPTS = [
  {
    id: 'tasks',
    title: 'Taskovi i raspoređivač',
    summary:
      'Task je kao mali program sa svojom petljom. Raspoređivač pokreće Ready task s najvišim prioritetom. Kad blokira (delay) ili je obustavljen, rade drugi.',
    examTip:
      'Na ispitu su navedeni prioriteti i pinovi — uvijek označi tko je Spreman, Obustavljen ili Čeka.',
    whyKey: 'priority',
  },
  {
    id: 'suspend',
    title: 'taskSuspend / taskResume',
    summary:
      'Pauzira task bez brisanja. Korisno za prilagođeni redoslijed (npr. sakrij Task3 dok se Task1 i Task2 izmjenjuju).',
    examTip:
      'Traži se „zaustavi ovaj LED, ostali rade” — to je suspend, ne brisanje taska.',
    whyKey: 'suspend',
  },
  {
    id: 'notify',
    title: 'taskNotify',
    summary:
      'Jedan task signalizira drugome izravno. Lakše od reda kad treba samo „probudi se”.',
    examTip: 'U paru s ulTaskNotifyTake u tasku koji prima signal.',
    whyKey: 'notify',
  },
  {
    id: 'timer',
    title: 'Timer prekid',
    summary:
      'Hardver broji vrijeme u pozadini. ISR postavlja zastavice; taskovi rade posao.',
    examTip:
      'Ako piše „točno svakih X ms bez obzira na taskove” → timer ISR.',
    whyKey: 'timer',
  },
  {
    id: 'mutex',
    title: 'Mutex',
    summary:
      'Štiti jedan dijeljeni resurs (jedan LED, UART, sabirnica). Uzmi prije korištenja, oslobodi poslije.',
    examTip:
      'Dva taska, jedan pin, poremećen izlaz → mutex (ili samo jedan task na pinu).',
    whyKey: 'mutex',
  },
  {
    id: 'states',
    title: 'Stanja taska',
    summary: (
      <ul className="state-legend">
        <li>
          <span className="state-badge state-running">Izvršava se</span> — trenutno na CPU-u
        </li>
        <li>
          <span className="state-badge state-ready">Spreman</span> — može raditi kad ga raspoređivač odabere
        </li>
        <li>
          <span className="state-badge state-waiting">Čeka</span> — blokiran na notify/semaforu/delayu
        </li>
        <li>
          <span className="state-badge state-suspended">Obustavljen</span> — uklonjen dok ga ne nastaviš
        </li>
      </ul>
    ),
    examTip:
      'U odgovoru nacrtaj malu tablicu stanja — ispitivači vole jasne stupce.',
    whyKey: null,
  },
];

export default function LearningMode() {
  return (
    <section className="module">
      <header className="module-header">
        <h2>Način učenja</h2>
        <p>
          Kratki pojmovi jednostavnim jezikom. Simulatori za pokret; ova stranica
          za rječnik i formulacije s ispita.
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
              <strong>Savjet za ispit:</strong> {c.examTip}
            </p>
            {c.whyKey && <WhyButton content={WHY_TOPICS[c.whyKey]} />}
          </article>
        ))}
      </div>

      <div className="card study-path">
        <h3>Predloženi red učenja</h3>
        <ol>
          <li>Raspoređivač — prioriteti i red T1→T2→T1→T2→T3→T3</li>
          <li>LED uzorak — sinkronizacija između taskova</li>
          <li>Timer prekid — ISR naspram delay-a</li>
          <li>Mutex — dijeljeni resurs</li>
          <li>Vježba ispita — nasumična pitanja</li>
          <li>Primjeri koda — pseudokod za prepisivanje</li>
        </ol>
      </div>
    </section>
  );
}

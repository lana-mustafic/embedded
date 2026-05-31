export const WHY_TOPICS = {
  priority: {
    title: 'Zašto je prioritet važan?',
    body: `RTOS raspoređivač uvijek bira **Ready task s najvišim prioritetom**. Taskovi s nižim prioritetom rade samo kad nema hitnijeg spremnog taska.

Na ispitu: ako Task2 ima prioritet 1, a Task1 prioritet 3, Task1 pobjeđuje kad su oba Ready. Prioritet nije „tko je prvi kreiran” — nego **tko sljedeći dobiva CPU**.`,
  },
  suspend: {
    title: 'Zašto taskSuspend / taskResume?',
    body: `**Suspend** uklanja task s Ready liste bez brisanja. **Resume** ga vraća.

Koristi kad želiš **privremeno pauzirati** rad (npr. ugasiti treptanje LED-a) dok ostali taskovi rade. Obustavljeni task gotovo ne troši CPU dok ga ne nastaviš.`,
  },
  notify: {
    title: 'Zašto je taskNotify često bolji?',
    body: `**taskNotify** šalje lagan signal izravno jednom tasku (mali „mailbox”). Primatelj može blokirati s \`ulTaskNotifyTake()\` dok ne stigne obavijest.

U odnosu na puni red ili semafor za jedan „probudi se” događaj, notify je **brži i troši manje RAM-a** — idealno kad jedan task kaže drugom „tvoj red” ili „podaci spremni”.`,
  },
  timer: {
    title: 'Zašto je timer prekid drugačiji od delay()?',
    body: `**vTaskDelay()** blokira *task* — taj task prestane raditi, ostali mogu koristiti CPU.

**Timer prekid** hardver pali u fiksnom ritmu. ISR treba biti **vrlo kratak**: postavi zastavicu ili daj semafor, pa izađi. Težak posao ide u task, ne u ISR — inače blokiraš prekide i propuštaš tickove.`,
  },
  mutex: {
    title: 'Zašto je potreban mutex?',
    body: `Dva taska koja istovremeno pišu na **isti LED ili serijski port** uzrokuju **race condition**: izlazi se miješaju i vrijeme puca.

**Mutex** osigurava da samo jedan task u jednom trenutku „posjeduje” resurs. Ostali **čekaju** dok se ne otključa. Uvijek oslobodi mutex kad završiš, inače ostali taskovi gladuju.`,
  },
};

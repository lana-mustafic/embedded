const TEMPLATES = [
  {
    prompt:
      'Tri LED taska: T1 (prioritet 3, pin A1), T2 (prioritet 1, pin A3), T3 (prioritet 2, pin A5). Treba red izvršavanja T1 → T2 → T1 → T2 → T3 → T3 bez mijenjanja prioriteta. Najbolji pristup?',
    correct: 'suspend',
    options: ['suspend', 'notify', 'timer', 'mutex'],
    explanation:
      'Suspend/resume omogućuje kontrolnom tasku pauzirati T3 i izmjenjivati T1/T2 dok Ready taskovi i dalje poštuju pravila prioriteta.',
    pseudocode: `vTaskSuspend(task3Handle);
// pokreni T1, zatim T2, ponovi uzorak
vTaskResume(task3Handle); // kad treba`,
  },
  {
    prompt:
      'Task A čita senzor; Task B pali LED samo kad ima novih podataka. Signalizacija s minimalnim overheadom?',
    correct: 'notify',
    options: ['suspend', 'notify', 'timer', 'mutex'],
    explanation:
      'taskNotify je idealan za probuditi jedan task uz vrlo mali utrošak RAM-a u odnosu na red.',
    pseudocode: `xTaskNotifyGive(taskBHandle);
// u Task B:
ulTaskNotifyTake(pdTRUE, portMAX_DELAY);`,
  },
  {
    prompt:
      'LED1 mora se preklopiti svakih 200 ms, LED2 svakih 500 ms, neovisno o ostalim taskovima. Najbolji mehanizam?',
    correct: 'timer',
    options: ['suspend', 'notify', 'timer', 'mutex'],
    explanation:
      'Hardverski timer ISR postavlja zastavice u točnim intervalima; taskovi reagiraju bez blokiranja cijelog programa.',
    pseudocode: `if (tickCount % 200 == 0) led1Flag = true;
if (tickCount % 500 == 0) led2Flag = true;`,
  },
  {
    prompt:
      'Dva taska zovu digitalWrite na isti LED pin s različitim periodima (500 ms vs 100 ms). Izlaz je poremećen. Rješenje?',
    correct: 'mutex',
    options: ['suspend', 'notify', 'timer', 'mutex'],
    explanation:
      'Mutex serijalizira pristup — samo jedan task upravlja LED-om; drugi čeka.',
    pseudocode: `xSemaphoreTake(ledMutex, portMAX_DELAY);
// koristi LED
xSemaphoreGive(ledMutex);`,
  },
  {
    prompt:
      'Uzorak na dva LED-a: A uključen, zatim B dvostruko treptanje, pa A, pa B — beskonačno. Taskovi moraju ostati sinkronizirani. Glavni alat?',
    correct: 'notify',
    options: ['suspend', 'notify', 'timer', 'mutex'],
    explanation:
      'Semafori ili taskNotify koordiniraju redoslijed (handshake). Mutex štiti dijeljeni resurs, ne redoslijed koraka.',
    pseudocode: `xSemaphoreGive(sync); // task A gotov
xSemaphoreTake(sync, portMAX_DELAY); // task B čeka`,
  },
  {
    prompt:
      'Na demo ispitu moraš zaustaviti treptanje LED-a na Task2, a Task1 nastavlja raditi. Koju funkciju koristiš?',
    correct: 'suspend',
    options: ['suspend', 'notify', 'timer', 'mutex'],
    explanation: 'vTaskSuspend uklanja Task2 iz raspoređivanja dok ga vTaskResume ne vrati.',
    pseudocode: `vTaskSuspend(task2Handle);
// kasnije:
vTaskResume(task2Handle);`,
  },
];

export function generateExamQuestion() {
  const base = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  const shuffled = [...base.options].sort(() => Math.random() - 0.5);
  return { ...base, options: shuffled };
}

export const APPROACH_LABELS = {
  suspend: 'taskSuspend / taskResume',
  notify: 'taskNotify',
  timer: 'Timer prekid',
  mutex: 'Mutex',
};

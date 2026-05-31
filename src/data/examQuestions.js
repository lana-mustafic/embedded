const TEMPLATES = [
  {
    prompt:
      'Three LED tasks: T1 (priority 3, pin A1), T2 (priority 1, pin A3), T3 (priority 2, pin A5). You need execution order T1 → T2 → T1 → T2 → T3 → T3 without changing priorities. Best approach?',
    correct: 'suspend',
    options: ['suspend', 'notify', 'timer', 'mutex'],
    explanation:
      'Suspend/resume lets a controller (or higher task) pause T3 and alternate T1/T2 explicitly while keeping priority rules for Ready tasks.',
    pseudocode: `vTaskSuspend(task3Handle);
// run T1 slice, then T2, repeat pattern
vTaskResume(task3Handle); when needed`,
  },
  {
    prompt:
      'Task A produces a sensor reading; Task B toggles LED only when new data exists. Minimal overhead signaling?',
    correct: 'notify',
    options: ['suspend', 'notify', 'timer', 'mutex'],
    explanation:
      'taskNotify is ideal for one-to-one wake-up with very low RAM cost compared to a queue.',
    pseudocode: `xTaskNotifyGive(taskBHandle);
// in Task B:
ulTaskNotifyTake(pdTRUE, portMAX_DELAY);`,
  },
  {
    prompt:
      'LED1 must toggle every 200 ms and LED2 every 500 ms independently, regardless of what tasks are doing. Best mechanism?',
    correct: 'timer',
    options: ['suspend', 'notify', 'timer', 'mutex'],
    explanation:
      'Periodic hardware timer ISR sets flags at exact intervals; tasks or short ISRs react without blocking the whole program.',
    pseudocode: `if (tickCount % 200 == 0) led1Flag = true;
if (tickCount % 500 == 0) led2Flag = true;`,
  },
  {
    prompt:
      'Two tasks both call digitalWrite on the same LED pin with different blink periods (500 ms vs 100 ms). Outputs are garbled. Fix?',
    correct: 'mutex',
    options: ['suspend', 'notify', 'timer', 'mutex'],
    explanation:
      'A mutex serializes access so only one task controls the LED at a time; the other waits.',
    pseudocode: `xSemaphoreTake(ledMutex, portMAX_DELAY);
// use LED
xSemaphoreGive(ledMutex);`,
  },
  {
    prompt:
      'Pattern on two LEDs: A on, then B double-blink, then A, then B — repeating forever. Tasks must stay in sync. Primary tool?',
    correct: 'notify',
    options: ['suspend', 'notify', 'timer', 'mutex'],
    explanation:
      'Semaphores or taskNotify coordinate sequence between tasks (handshake). Mutex is for shared resource protection, not sequencing.',
    pseudocode: `xSemaphoreGive(sync); // task A done
xSemaphoreTake(sync, portMAX_DELAY); // task B waits`,
  },
  {
    prompt:
      'You must stop Task2 LED blinking during an exam demo but keep Task1 running. What do you call?',
    correct: 'suspend',
    options: ['suspend', 'notify', 'timer', 'mutex'],
    explanation: 'vTaskSuspend removes Task2 from scheduling until vTaskResume.',
    pseudocode: `vTaskSuspend(task2Handle);
// later:
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
  timer: 'Timer interrupt',
  mutex: 'Mutex',
};

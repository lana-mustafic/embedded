export const WHY_TOPICS = {
  priority: {
    title: 'Why does priority matter?',
    body: `The RTOS scheduler always picks the **highest-priority Ready task**. Lower-priority tasks only run when nothing more urgent is ready.

On your exam, if Task2 has priority 1 and Task1 has priority 3, Task1 wins whenever both are Ready. Priority is not "who was created first" — it is "who gets the CPU next."`,
  },
  suspend: {
    title: 'Why use taskSuspend / taskResume?',
    body: `**Suspend** removes a task from the Ready list without deleting it. **Resume** puts it back.

Use this when you want to **pause** work temporarily (e.g. stop blinking an LED) while other tasks keep running. The suspended task uses almost no CPU until resumed.`,
  },
  notify: {
    title: 'Why is taskNotify often better?',
    body: `**taskNotify** sends a lightweight signal directly to one task (like a tiny mailbox). The receiver can block with \`ulTaskNotifyTake()\` until data arrives.

Compared to a full queue or semaphore for a single "wake up" event, notify is **faster and uses less RAM** — perfect when one task tells another "your turn" or "data ready."`,
  },
  timer: {
    title: 'Why is a timer interrupt different from delay()?',
    body: `**vTaskDelay()** blocks the *task* — that task stops running and others can use the CPU.

A **timer interrupt** fires in hardware on a fixed schedule. The ISR should be **very short**: set a flag or give a semaphore, then return. Heavy work belongs in a task, not inside the ISR — otherwise you block interrupts and miss ticks.`,
  },
  mutex: {
    title: 'Why is a mutex needed?',
    body: `Two tasks updating the **same LED or serial port** at the same time cause a **race condition**: outputs get mixed and timing breaks.

A **mutex** ensures only one task "owns" the resource at a time. Others **wait** until it is unlocked. Always release the mutex when done, or other tasks starve.`,
  },
};

export const CODE_EXAMPLES = {
  scheduler: `// Task Scheduler — suspend/resume example
// Task1: priority 3, LED pin A1
// Task2: priority 1, LED pin A3
// Task3: priority 2, LED pin A5

void task1(void *pv) {
  for (;;) {
    digitalWrite(A1, HIGH);
    vTaskDelay(pdMS_TO_TICKS(200));
    digitalWrite(A1, LOW);
    vTaskDelay(pdMS_TO_TICKS(200));
    // Yield so scheduler can pick higher/ready tasks
  }
}

void task2(void *pv) {
  for (;;) {
    digitalWrite(A3, HIGH);
    vTaskDelay(pdMS_TO_TICKS(300));
    digitalWrite(A3, LOW);
    vTaskDelay(pdMS_TO_TICKS(300));
  }
}

void setup() {
  xTaskCreate(task1, "T1", 128, NULL, 3, NULL); // priority 3
  xTaskCreate(task2, "T2", 128, NULL, 1, NULL); // priority 1
  xTaskCreate(task3, "T3", 128, NULL, 2, NULL); // priority 2
  vTaskStartScheduler();
}

// Controller task can suspend others:
// vTaskSuspend(task2Handle);
// vTaskResume(task2Handle);`,

  notify: `// taskNotify — lightweight wake-up
TaskHandle_t task2Handle;

void task1(void *pv) {
  for (;;) {
    digitalWrite(A1, HIGH);
    vTaskDelay(pdMS_TO_TICKS(100));
  // Tell task2: "you can run your LED step now"
    xTaskNotifyGive(task2Handle);
    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

void task2(void *pv) {
  for (;;) {
    // Block until task1 notifies me
    ulTaskNotifyTake(pdTRUE, portMAX_DELAY);
    digitalWrite(A3, !digitalRead(A3)); // toggle LED
  }
}`,

  ledPattern: `// LED pattern: A, B-B-fast, A, B — using two tasks + sync

SemaphoreHandle_t syncAB;

void taskLedA(void *pv) {
  for (;;) {
    blink(A_PIN, 300);
    xSemaphoreGive(syncAB);  // signal B can do double blink
    xSemaphoreTake(syncAB, portMAX_DELAY); // wait until B done
    blink(A_PIN, 300);
    xSemaphoreGive(syncAB);
  }
}

void taskLedB(void *pv) {
  for (;;) {
    xSemaphoreTake(syncAB, portMAX_DELAY);
    blink(B_PIN, 150);
    blink(B_PIN, 150);  // second quick blink
    xSemaphoreGive(syncAB);
    xSemaphoreTake(syncAB, portMAX_DELAY);
    blink(B_PIN, 300);
    xSemaphoreGive(syncAB);
  }
}`,

  timer: `// Timer interrupt — do NOT block inside ISR!

volatile bool led1Flag = false;
volatile bool led2Flag = false;

// Hardware timer fires every 1 ms (example)
void TIMER_ISR() {
  static uint16_t cnt = 0;
  cnt++;
  if (cnt % 200 == 0) led1Flag = true;  // 200 ms
  if (cnt % 500 == 0) led2Flag = true;  // 500 ms
  // ISR ends quickly — no delay() here!
}

void taskLeds(void *pv) {
  for (;;) {
    if (led1Flag) {
      led1Flag = false;
      digitalWrite(LED1, !digitalRead(LED1));
    }
    if (led2Flag) {
      led2Flag = false;
      digitalWrite(LED2, !digitalRead(LED2));
    }
    vTaskDelay(1); // tasks handle real work
  }
}`,

  mutex: `// Mutex — safe shared LED access

SemaphoreHandle_t ledMutex;

void taskFast(void *pv) {
  for (;;) {
    if (xSemaphoreTake(ledMutex, portMAX_DELAY) == pdTRUE) {
      // Only we own the LED now
      blinkSharedLed(100);  // fast blink
      xSemaphoreGive(ledMutex); // always release!
    }
    vTaskDelay(50);
  }
}

void taskSlow(void *pv) {
  for (;;) {
    if (xSemaphoreTake(ledMutex, portMAX_DELAY) == pdTRUE) {
      blinkSharedLed(500);  // slow blink
      xSemaphoreGive(ledMutex);
    }
    vTaskDelay(50);
  }
}

void setup() {
  ledMutex = xSemaphoreCreateMutex();
}`,

  mutexBad: `// WITHOUT mutex — race condition (exam trap!)

void taskFast(void *pv) {
  for (;;) {
    digitalWrite(LED, HIGH);
    vTaskDelay(100);
    digitalWrite(LED, LOW);  // Task2 might change LED here!
    vTaskDelay(100);
  }
}

void taskSlow(void *pv) {
  for (;;) {
    digitalWrite(LED, HIGH);
    vTaskDelay(500);
    digitalWrite(LED, LOW);
    vTaskDelay(500);
  }
}
// Result: unpredictable LED timing — both fight for same pin`,
};

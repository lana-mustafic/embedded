# Cijeli ispit — zadatak 1 i zadatak 2b

Ovo je jedan projekat i jedan fajl `Core/Src/main.c`. Unutra su oba zadatka. Zadatak 2a se ne radi, jer traži timer. TIM1 je već sat za HAL. Čim u svom kodu napišeš `htim1`, može se vratiti greška `'htim1' undeclared`.

Oba zadatka rade u isto vrijeme. Zadatak 1 pali PA1, PA3 i PA5 redom. Zadatak 2b na PA6 naizmjenično drži 300 ms i 600 ms. Pinovi su različiti, pa se ne miješaju.

Na ispitu praviš novi projekat i ove blokove upisuješ ručno, između `USER CODE BEGIN` i `USER CODE END`.

## Zadatak 1 — šta se traži

Tri taska pale i gase svoje pinove. Četvrti task, vodja, pušta ih jednog po jednog pomoću `vTaskResume` i `vTaskSuspend`.

| Task | Prioritet | Pin | Šta radi |
|---|---|---|---|
| Task1 | 3 | PA1 | upali, sačekaj, ugasi, zaustavi se |
| Task2 | 1 | PA3 | upali, sačekaj, ugasi, zaustavi se |
| Task3 | 2 | PA5 | upali, sačekaj, ugasi, zaustavi se |
| Vodja | 4 | nema pin | pušta ostale redom |

Veći broj znači važniji task. Vodja ima 4, pa je važniji od Task1.

Jedan ciklus, koji se ponavlja:

1. PA1 gori **dugo** (600 ms)
2. odmah PA3 gori **dugo** (600 ms)
3. odmah PA1 gori **kratko** (300 ms)
4. odmah PA3 gori **kratko** (300 ms)
5. odmah PA5 gori **kratko** (300 ms)
6. **pauza** 300 ms, sve tri ugašene
7. PA5 gori **kratko** (300 ms)
8. odmah ispočetka

Brojevi 600 i 300 su pretpostavka, jer na dijagramu nema milisekundi. Na ispitu promijeni samo `DUGO`, `KRATKO` i `PAUZA` ako profesor kaže drugačije.

Prioriteti 3, 1 i 2 ne biraju ovaj redoslijed. Redoslijed bira petlja u `Vodja`. Prioritete ipak upisuješ tačno kako tabela kaže.

## Zadatak 2b — šta se traži

Dva taska **istog** prioriteta oba žele da pale **istu** lampicu, PA6. Bez dogovora bi oba pisala na pin u isto vrijeme. Mutex je brava: ko je uzme, samo on smije da dira PA6. Drugi čeka.

| Task | Prioritet | Pin | Koliko drži lampicu upaljenu |
|---|---|---|---|
| Task300 | 1 | PA6 | 300 ms |
| Task600 | 1 | PA6 | 600 ms |

Oba imaju prioritet 1. Zadatak traži da budu isti, ne traži neki poseban broj. Broj 1 je iznad praznog idle taska, a ispod vodje. Vodja i dalje vodi zadatak 1.

Vidljivi redoslijed na PA6:

1. Task300 uzme bravu, upali PA6, drži 300 ms, ugasi, pusti bravu
2. Task600 uzme bravu, upali PA6, drži 600 ms, ugasi, pusti bravu
3. opet Task300, pa Task600, i tako u krug

Vrijeme se pravi tačno ovim makroima iz zadatka: `pdMS_TO_TICKS(300)` i `pdMS_TO_TICKS(600)`.

## Prije koda: šta klikneš u CubeMX-u

1. File → New → STM32 Project.
2. Commercial Part Number: mikrokontroler koji profesor da. Kod kuće je to `STM32F401CCUx`.
3. C, Executable, STM32Cube. Ime projekta: broj indeksa.
4. Pinovi, svi kao **GPIO_Output**:
   - **PA1**, **PA3**, **PA5** za zadatak 1
   - **PA6** za zadatak 2b
5. System Core → GPIO. Za sva četiri pina: Output Push Pull, output level **Low**.
6. System Core → SYS → Debug: **Serial Wire**. Timebase Source: **TIM1**.
7. Middleware → FREERTOS → Interface: **CMSIS_V2**.
8. U FREERTOS → Config parameters provjeri:
   - `INCLUDE_vTaskSuspend` = Enabled
   - `configUSE_MUTEXES` = Enabled
   - `configTICK_RATE_HZ` = 1000
   - `TOTAL_HEAP_SIZE` = 15360
9. `defaultTask` ostavi. Ne briši ga. Kod ga sam zaustavi.
10. U Tasks and Queues ne dodaješ taskove. Pravomo ih u kodu, da prioritet bude tačan broj.
11. Sačuvaj i klikni Generate Code.

TIM1 ne podešavaš kao svoj timer. Cube ga koristi kao sat za HAL. U svom kodu ne pišeš `htim1`, ni `htim2`, ni bilo koji timer handle.

## Koji fajl otvaraš

`ime_projekta` → `Core` → `Src` → **`main.c`**

Ne pišeš u `freertos.c`. Ako isti kod zalijepiš u oba fajla, build padne jer su funkcije definisane dvaput.

## Pravilo komentara

Tvoj kod ide samo između para:

```c
/* USER CODE BEGIN PD */
ovdje pišeš
/* USER CODE END PD */
```

Van toga Cube smije obrisati kod pri sljedećem Generate. U prazne blokove ništa ne pišeš. Prazni ostaju:

`PTD`, `PM`, `0`, `1`, `Init`, `SysInit`, `2`, `RTOS_SEMAPHORES`, `RTOS_TIMERS`, `RTOS_QUEUES`, `RTOS_EVENTS`, `WHILE`, `3`, `MX_GPIO_Init_1`, `MX_GPIO_Init_2`, `5`.

Pišeš u sedam blokova: **Includes**, **PD**, **PV**, **PFP**, **RTOS_MUTEX**, **RTOS_THREADS** i **4**.

Da nađeš blok: u `main.c` pritisni `Ctrl+F` i ukucaj tačan komentar.

---

## Blok 1 — `USER CODE BEGIN Includes`

Odmah ispod Cubeovih linija `#include "main.h"` i `#include "cmsis_os.h"`. Te dvije ne diraš.

```c
/* USER CODE BEGIN Includes */
#include "FreeRTOS.h"
#include "task.h"
#include "semphr.h"
/* USER CODE END Includes */
```

| Linija | Šta znači |
|---|---|
| `#include "FreeRTOS.h"` | Prvo ovo. Tu su `pdMS_TO_TICKS`, `pdTRUE`, `portMAX_DELAY`. Ime fajla ima veliko `F` i veliko `R`. |
| `#include "task.h"` | `xTaskCreate`, `vTaskDelay`, `vTaskSuspend`, `vTaskResume`, `eTaskGetState` i tip `TaskHandle_t`. |
| `#include "semphr.h"` | Mutex za zadatak 2b: `xSemaphoreCreateMutex`, `xSemaphoreTake`, `xSemaphoreGive` i tip `SemaphoreHandle_t`. |

`FreeRTOS.h` mora biti iznad `task.h` i iznad `semphr.h`.

---

## Blok 2 — `USER CODE BEGIN PD`

```c
/* USER CODE BEGIN PD */
#define DUGO    600u
#define KRATKO  300u
#define PAUZA   300u
/* USER CODE END PD */
```

Ovo su samo vremena za zadatak 1. Zadatak 2b ne koristi ove konstante. On u kodu direktno zove `pdMS_TO_TICKS(300)` i `pdMS_TO_TICKS(600)`, kako zadatak kaže.

| Linija | Šta znači |
|---|---|
| `#define DUGO 600u` | Duži blok zadatka 1, u milisekundama. |
| `#define KRATKO 300u` | Kraći blok zadatka 1. |
| `#define PAUZA 300u` | Prekid između dva treptaja Task3, kad su PA1, PA3 i PA5 ugašene. |
| `u` na kraju | Broj nema predznak. Trajanje ne može biti negativno. |

---

## Blok 3 — `USER CODE BEGIN PV`

Iznad ovog bloka Cube je već napisao `defaultTask`. To ne brišeš.

```c
/* USER CODE BEGIN PV */
static TaskHandle_t t1;
static TaskHandle_t t2;
static TaskHandle_t t3;
static TaskHandle_t t300;
static TaskHandle_t t600;
static SemaphoreHandle_t mutex;
static volatile uint32_t koliko = KRATKO;
/* USER CODE END PV */
```

| Linija | Šta znači |
|---|---|
| `static` | Ime važi samo u ovom fajlu. |
| `TaskHandle_t` | Ručka taska. Preko nje ga zaustavljaš i nastavljaš. |
| `t1`, `t2`, `t3` | Ručke za PA1, PA3 i PA5. |
| `t300`, `t600` | Ručke dva taska na PA6. |
| `SemaphoreHandle_t mutex` | Brava za PA6. Prazna je dok je `xSemaphoreCreateMutex` ne napravi. |
| `volatile uint32_t koliko` | Koliko milisekundi trenutna lampica zadatka 1 treba da gori. Vodja upisuje broj prije nego što pusti task. `volatile` tjera kompajler da svaki put pročita svježu vrijednost. |
| `= KRATKO` | Početna vrijednost 300. Vodja je pregazi prije prvog paljenja. |

---

## Blok 4 — `USER CODE BEGIN PFP`

Iznad njega Cube već ima `SystemClock_Config`, `MX_GPIO_Init` i `StartDefaultTask`. Njih ne diraš.

```c
/* USER CODE BEGIN PFP */
static void Task1(void *argument);
static void Task2(void *argument);
static void Task3(void *argument);
static void Vodja(void *argument);
static void Pusti(TaskHandle_t task, uint32_t ms);
static void Upali(uint16_t pin);
static void Task300(void *argument);
static void Task600(void *argument);
static void Blinkaj(uint32_t tikovi);
/* USER CODE END PFP */
```

Prototip je najava. Tijelo funkcije je kasnije, u bloku `4`. Bez najave, `xTaskCreate(Task1, ...)` u `main` ne zna šta je `Task1`.

| Dio | Šta znači |
|---|---|
| `static void` | Funkcija ne vraća rezultat i vide je samo ovaj fajl. |
| `void *argument` | FreeRTOS svakom tasku pošalje jedan argument. Mi ga ne koristimo, ali potpis mora ovako izgledati. |
| `Pusti` i `Upali` | Pomoćne funkcije zadatka 1. |
| `Task300`, `Task600`, `Blinkaj` | Zadatak 2b. `Blinkaj` primi već pretvorene tikove, ne milisekunde. |

Tačka-zarez na kraju prototipa je obavezna. U tijelu funkcije, dolje, tačka-zarez iza potpisa ne ide.

---

## Blok 5 — `USER CODE BEGIN RTOS_MUTEX`

Ovaj blok je unutar `main`, ispod linije `osKernelInitialize();`. Tu Cube napiše komentar `/* add mutexes, ... */`. Obriši taj komentar i stavi:

```c
  /* USER CODE BEGIN RTOS_MUTEX */
  mutex = xSemaphoreCreateMutex();
  /* USER CODE END RTOS_MUTEX */
```

`xSemaphoreCreateMutex` napravi bravu i upiše je u `mutex`. Poslije ovoga niko je još ne drži, pa je prvi `xSemaphoreTake` uspije odmah.

Ovo mora biti ispod `osKernelInitialize();`. Iznad te linije FreeRTOS još nije spreman.

---

## Blok 6 — `USER CODE BEGIN RTOS_THREADS`

I dalje unutar `main`, ispod linije koja pravi `defaultTask`. Tu liniju ne brišeš i ne pomjeraš.

```c
  /* USER CODE BEGIN RTOS_THREADS */
  vTaskSuspend((TaskHandle_t)defaultTaskHandle);

  xTaskCreate(Task1, "Task1", 256, NULL, 3, &t1);
  vTaskSuspend(t1);

  xTaskCreate(Task2, "Task2", 256, NULL, 1, &t2);
  vTaskSuspend(t2);

  xTaskCreate(Task3, "Task3", 256, NULL, 2, &t3);
  vTaskSuspend(t3);

  xTaskCreate(Vodja, "Vodja", 256, NULL, 4, NULL);

  xTaskCreate(Task300, "Task300", 256, NULL, 1, &t300);
  xTaskCreate(Task600, "Task600", 256, NULL, 1, &t600);
  /* USER CODE END RTOS_THREADS */
```

### `defaultTask`

```c
vTaskSuspend((TaskHandle_t)defaultTaskHandle);
```

Cube sam napravi `defaultTask` sa prioritetom `osPriorityNormal`, a to je broj **24**. Vodja ima 4. Dok je 24 spreman, vodja ne dobije procesor. `vTaskSuspend` ga zaustavi. `(TaskHandle_t)` pretvara Cubeov tip `osThreadId_t` u tip koji `vTaskSuspend` prima.

### Jedan `xTaskCreate`

```c
xTaskCreate(Task1, "Task1", 256, NULL, 3, &t1);
```

| Mjesto | Kod | Značenje |
|---|---|---|
| 1 | `Task1` | Funkcija koju task vrti. |
| 2 | `"Task1"` | Natpis, samo za debug. |
| 3 | `256` | Stek u riječima. Jedna riječ je 4 bajta. |
| 4 | `NULL` | Argument tasku. `NULL` znači ništa. |
| 5 | `3` | Prioritet. Task1 je 3, Task2 je 1, Task3 je 2, Vodja je 4. Task300 i Task600 su oba 1. |
| 6 | `&t1` | Adresa kutije u koju se upiše ručka. `&` znači adresa. Kod vodje je `NULL`, jer vodju niko ne zaustavlja pa mu ručka ne treba. |

Redoslijed 3 i 4 se lako zamijeni. Treći je broj `256`. Četvrti je `NULL`. Ako ih zamijeniš, build javi pogrešan tip.

### Zaustavljanje lampica zadatka 1

```c
vTaskSuspend(t1);
```

Odmah poslije kreiranja. Task je spreman, ali ne smije sam upaliti pin prije nego vodja kaže. Isto za `t2` i `t3`. Vodja, Task300 i Task600 se ne suspenduju. Oni treba da krenu sami.

`vTaskSuspend` prima ručku, ne adresu. Piše se `vTaskSuspend(t3)`, ne `vTaskSuspend(&t3)`.

---

## Blok 7 — `USER CODE BEGIN 4`

Ispod `MX_GPIO_Init`, iznad `StartDefaultTask`. Tu su tijela svih funkcija, i za zadatak 1 i za zadatak 2b.

```c
/* USER CODE BEGIN 4 */
static void Pusti(TaskHandle_t task, uint32_t ms)
{
  koliko = ms;
  vTaskResume(task);
  while (eTaskGetState(task) != eSuspended)
  {
    vTaskDelay(pdMS_TO_TICKS(1));
  }
}

static void Upali(uint16_t pin)
{
  HAL_GPIO_WritePin(GPIOA, pin, GPIO_PIN_SET);
  vTaskDelay(pdMS_TO_TICKS(koliko));
  HAL_GPIO_WritePin(GPIOA, pin, GPIO_PIN_RESET);
  vTaskSuspend(NULL);
}

static void Task1(void *argument)
{
  (void)argument;
  for (;;)
  {
    Upali(GPIO_PIN_1);
  }
}

static void Task2(void *argument)
{
  (void)argument;
  for (;;)
  {
    Upali(GPIO_PIN_3);
  }
}

static void Task3(void *argument)
{
  (void)argument;
  for (;;)
  {
    Upali(GPIO_PIN_5);
  }
}

static void Vodja(void *argument)
{
  (void)argument;
  for (;;)
  {
    Pusti(t1, DUGO);
    Pusti(t2, DUGO);
    Pusti(t1, KRATKO);
    Pusti(t2, KRATKO);
    Pusti(t3, KRATKO);
    vTaskDelay(pdMS_TO_TICKS(PAUZA));
    Pusti(t3, KRATKO);
  }
}

static void Blinkaj(uint32_t tikovi)
{
  xSemaphoreTake(mutex, portMAX_DELAY);
  HAL_GPIO_WritePin(GPIOA, GPIO_PIN_6, GPIO_PIN_SET);
  vTaskDelay(tikovi);
  HAL_GPIO_WritePin(GPIOA, GPIO_PIN_6, GPIO_PIN_RESET);
  xSemaphoreGive(mutex);
  vTaskDelay(pdMS_TO_TICKS(1));
}

static void Task300(void *argument)
{
  (void)argument;
  for (;;)
  {
    Blinkaj(pdMS_TO_TICKS(300));
  }
}

static void Task600(void *argument)
{
  (void)argument;
  for (;;)
  {
    Blinkaj(pdMS_TO_TICKS(600));
  }
}

/* USER CODE END 4 */
```

### Zadatak 1 — `Pusti`

Vodja je jedini koji zove `Pusti`.

```c
koliko = ms;
```

Upiše trajanje. `ms` je `DUGO` ili `KRATKO`.

```c
vTaskResume(task);
```

Nastavi zaustavljen task. `task` je `t1`, `t2` ili `t3`. Vodja ima veći prioritet, pa lampica još ne krene dok vodja sam ne sačeka u petlji ispod.

```c
while (eTaskGetState(task) != eSuspended)
{
  vTaskDelay(pdMS_TO_TICKS(1));
}
```

- `eTaskGetState(task)` vraća stanje tog taska.
- `eSuspended` znači da je task došao do `vTaskSuspend(NULL)` i da više ne radi.
- Dok to nije tako, vodja čeka 1 ms. Taj `vTaskDelay` ga skloni s procesora, pa lampica može da radi.
- U tim pauzama od 1 ms rade i Task300 i Task600, jer su spremni, a vodja spava. Zato PA6 trepće i dok zadatak 1 vodi svoj ciklus.

### Zadatak 1 — `Upali`

```c
HAL_GPIO_WritePin(GPIOA, pin, GPIO_PIN_SET);
```

Upali pin. `GPIOA` je port A. `pin` je `GPIO_PIN_1`, `GPIO_PIN_3` ili `GPIO_PIN_5`. `GPIO_PIN_SET` je 1, lampica gori. `GPIO_PIN_RESET` je 0, lampica je ugašena. Ime funkcije je `HAL_GPIO_WritePin`. `GPIO_PIN_WritePin` ne postoji.

```c
vTaskDelay(pdMS_TO_TICKS(koliko));
```

Čekaj `koliko` milisekundi. `vTaskDelay` zaustavi samo ovaj task. `HAL_Delay` zaustavi cijeli mikrokontroler i u tasku se ne koristi. Tick je 1000 puta u sekundi, pa je `pdMS_TO_TICKS(300)` jednako 300 ms.

```c
HAL_GPIO_WritePin(GPIOA, pin, GPIO_PIN_RESET);
vTaskSuspend(NULL);
```

Prvo ugasi pin, pa zaustavi sebe. `NULL` znači „ja sama sebe”. Tek tada vodja vidi `eSuspended` i pusti sljedeću lampicu. Zato dvije lampice zadatka 1 ne gore zajedno.

### Zadatak 1 — Task1, Task2, Task3, Vodja

`for (;;)` je beskonačna petlja. Task se ne smije završiti.

`(void)argument` kaže kompajleru da argument namjerno ne koristimo.

`GPIO_PIN_1` je PA1, `GPIO_PIN_3` je PA3, `GPIO_PIN_5` je PA5.

Petlja u `Vodja` jeste dijagram. Jedan `Pusti` je jedan blok svjetla. `vTaskDelay` između dva `Pusti(t3, ...)` je prekid dok su PA1, PA3 i PA5 ugašene. Poslije drugog Task3 petlja krene ispočetka, odmah na PA1 dugo. Tu nema pauze.

`Upali` na kraju uradi `vTaskSuspend(NULL)`. Kad vodja task nastavi, izvršavanje krene iza te linije, petlja se okrene i opet zove `Upali`. Zato isti task jednom gori dugo, a drugi put kratko: svaki put pročita novo `koliko`.

### Zadatak 2b — `Blinkaj`

```c
xSemaphoreTake(mutex, portMAX_DELAY);
```

Uzmi bravu. Ako je drugi task već drži, ovaj stoji ovdje dok je on ne pusti. `portMAX_DELAY` znači čekaj koliko god treba.

```c
HAL_GPIO_WritePin(GPIOA, GPIO_PIN_6, GPIO_PIN_SET);
vTaskDelay(tikovi);
HAL_GPIO_WritePin(GPIOA, GPIO_PIN_6, GPIO_PIN_RESET);
```

Upali PA6, drži je tačno onoliko tikova koliko je task poslao, ugasi je. Dok traje `vTaskDelay`, brava je i dalje kod ovog taska. Drugi ne može da upali isti pin.

```c
xSemaphoreGive(mutex);
vTaskDelay(pdMS_TO_TICKS(1));
```

Pusti bravu. Kratko sačekaj 1 ms. Oba taska imaju isti prioritet. Kad ovaj pusti bravu i odmah uđe u sljedeći krug, mogao bi je opet uzeti prije drugog. Taj 1 ms ga skloni, pa drugi task, koji čeka na `xSemaphoreTake`, dobije bravu. Zato se 300 ms i 600 ms smjenjuju, a ne ostane jedan task zauvik.

### Zadatak 2b — Task300 i Task600

```c
Blinkaj(pdMS_TO_TICKS(300));
```

`pdMS_TO_TICKS(300)` pretvori 300 milisekundi u tikove i to pošalje u `Blinkaj`. U `Task600` ista linija ima `pdMS_TO_TICKS(600)`.

Oba taska imaju `for (;;)`, pa se smjena ponavlja.

---

## Šta Cube napiše sam

Na vrhu, izvan tvog bloka:

```c
#include "main.h"
#include "cmsis_os.h"
```

`main.h` donosi `HAL_GPIO_WritePin` i imena pinova.

U `main`, redom, Cube zove `HAL_Init`, `SystemClock_Config`, `MX_GPIO_Init`, `osKernelInitialize`, pa napravi `defaultTask`, pa na kraju `osKernelStart`. Te pozive ne brišeš.

`MX_GPIO_Init` poslije Generate Code treba da sadrži PA1, PA3, PA5 i PA6 kao izlaz, početno ugašene. To napiše Cube kad pinove označiš kao GPIO_Output. Tu funkciju ne prepisuješ rukom.

Na dnu fajla Cube ima `HAL_TIM_PeriodElapsedCallback`. Unutra je argument `htim` i provjera `TIM1`. To je sat za HAL. Ne dodaješ `htim1` i ne mijenjaš tu funkciju.

`StartDefaultTask` ostaje kako ga je Cube napisao, sa `osDelay(1)`. Ne izvršava se, jer je task suspendovan prije `osKernelStart`.

## Kako oba zadatka rade od uključivanja

1. Pinovi krenu ugašeni.
2. Napravi se mutex. Naprave se taskovi. `defaultTask`, t1, t2 i t3 se odmah zaustave.
3. `osKernelStart` pusti scheduler.
4. Vodja ima prioritet 4, pa prvi vodi ciklus PA1, PA3, PA5.
5. Dok vodja spava onaj 1 ms u `while` petlji, Task300 i Task600 dobiju procesor i smjenjuju se na PA6.
6. Kad lampica zadatka 1 sama sebe zaustavi, vodja pusti sljedeću. PA6 i dalje radi svoje, jer njeni taskovi nisu suspendovani.

PA6 ne ulazi u dijagram zadatka 1. Dijagram zadatka 1 i dalje drži vodja.

## Build

**Project → Build Project.**

Uspjeh: `Build Finished` i `0 errors`.

`terminated with exit code 2` nije posebna greška. Prava greška je prva linija iznad u kojoj piše `error:`.

| Ako vidiš ovo | Šta popravi |
|---|---|
| `'htim1' undeclared` | U svom kodu nema timera. Obriši liniju koja pominje `htim1`. |
| `vTaskSuspend` undeclared | `INCLUDE_vTaskSuspend` nije Enabled, ili `task.h` nije uključen, ili je `task.h` iznad `FreeRTOS.h`. |
| `xSemaphoreCreateMutex` undeclared | Nema `#include "semphr.h"`, ili `configUSE_MUTEXES` nije Enabled. |
| `GPIO_PIN_WritePin` | Ime je `HAL_GPIO_WritePin`. |
| `xTaskDelay` | Ime je `vTaskDelay`. |
| pogrešan tip u `xTaskCreate` | Treći argument je `256`, četvrti je `NULL`. |
| conflicting types | Prototip i definicija nemaju isti potpis. Jedna zvjezdica: `void *argument`. |
| `pin` undeclared | Parametar funkcije se zove drugačije nego ime u tijelu. |
| taskhandle / taskhandler | Ime ručke mora biti isto u `PV`, u `xTaskCreate` i u `RunTask` ili `Pusti`. |

## Šta ponijeti na ispit

1. Pinovi PA1, PA3, PA5 i PA6 kao GPIO_Output. SYS: Serial Wire i TIM1. FreeRTOS: CMSIS_V2. Mutex uključen.
2. Sedam mjesta u `main.c`: `Includes`, `PD`, `PV`, `PFP`, `RTOS_MUTEX`, `RTOS_THREADS`, tijela u `4`.
3. Zadatak 1: prioriteti 3, 1, 2 i vodja 4. Poslije t1, t2 i t3 odmah `vTaskSuspend`. Vodja se ne suspenduje.
4. Petlja u `Vodja` je dijagram. Pauza je samo `vTaskDelay` između dva poziva za t3.
5. Zadatak 2b: dva taska prioriteta 1, mutex, `pdMS_TO_TICKS(300)` i `pdMS_TO_TICKS(600)`, pin PA6.
6. Poslije `xSemaphoreGive` ide kratki `vTaskDelay`, da drugi task stigne da uzme bravu.
7. Ne pišeš `htim1`. Ne radiš zadatak 2a.

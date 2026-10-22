# Zadatak 1 — gdje se šta upisuje

Ovo je vodič za ispitni zadatak sa tri lampice. Objašnjava **tačno u koji fajl**, **ispod kojeg komentara** i **šta svaka linija radi**.

Kod koji ovdje pišeš već stoji u projektu `ubitcuse`, u fajlu `Core/Src/main.c`. Na ispitu praviš novi projekat i ove iste blokove upisuješ ručno.

## Šta zadatak traži

Tri taska pale i gase svoje pinove. Četvrti task, vodja, pušta ih jednog po jednog.

| Task | Prioritet | Pin | Šta radi |
|---|---|---|---|
| Task1 | 3 | PA1 | upali, sačekaj, ugasi, zaustavi se |
| Task2 | 1 | PA3 | upali, sačekaj, ugasi, zaustavi se |
| Task3 | 2 | PA5 | upali, sačekaj, ugasi, zaustavi se |
| Vodja | 4 | nema pin | pušta ostale redom |

Veći broj znači važniji task. Vodja ima 4, pa je važniji od Task1. Zato on prvi dobije procesor.

Jedan ciklus, koji se ponavlja:

1. PA1 gori **dugo** (600 ms)
2. odmah PA3 gori **dugo** (600 ms)
3. odmah PA1 gori **kratko** (300 ms)
4. odmah PA3 gori **kratko** (300 ms)
5. odmah PA5 gori **kratko** (300 ms)
6. **pauza** 300 ms, sve ugašeno
7. PA5 gori **kratko** (300 ms)
8. odmah ispočetka

Brojevi 600 i 300 su pretpostavka, jer na dijagramu nema milisekundi. Na ispitu promijeni samo `DUGO`, `KRATKO` i `PAUZA` ako profesor kaže drugačije.

## Prije koda: šta klikneš u CubeMX-u

1. File → New → STM32 Project.
2. Commercial Part Number: mikrokontroler koji profesor da. Kod kuće je to `STM32F401CCUx`.
3. C, Executable, STM32Cube. Ime projekta: broj indeksa.
4. Klikni pin **PA1** → GPIO_Output. Isto za **PA3** i **PA5**.
5. System Core → SYS → Debug: **Serial Wire**. Timebase Source: **TIM1**.
6. Middleware → FREERTOS → Interface: **CMSIS_V2**.
7. U FREERTOS → Config parameters provjeri:
   - `INCLUDE_vTaskSuspend` = Enabled
   - `configTICK_RATE_HZ` = 1000
   - `TOTAL_HEAP_SIZE` = 15360
8. `defaultTask` ostavi. Ne briši ga. Kod ga sam zaustavi, objašnjenje je niže.
9. Sačuvaj i klikni Generate Code.

TIM1 ne podešavaš kao svoj timer za lampice. Cube ga koristi sam, kao sat za HAL. U svom kodu **ne pišeš** `htim1`.

## Koji fajl otvaraš

U Project Exploreru:

`ime_projekta` → `Core` → `Src` → **`main.c`**

Ne pišeš u `freertos.c`. U ovom projektu taj fajl jeste prazan, a FreeRTOS se pokreće iz `main.c`. Ako isti kod zalijepiš u oba fajla, build padne jer su funkcije definisane dvaput.

## Pravilo komentara

Cube ostavlja parove komentara. Tvoj kod ide **između** njih:

```c
/* USER CODE BEGIN PD */
ovdje pišeš
/* USER CODE END PD */
```

- `BEGIN` znači početak tvog mjesta.
- `END` znači kraj tvog mjesta.
- Slova poslije `BEGIN` su ime mjesta. `PD` je jedno mjesto, `PV` je drugo. Ne miješaj ih.
- Van ovih blokova kod ne dodaješ. Generate Code smije obrisati sve što nije između `BEGIN` i `END`.

U fajlu ima mnogo praznih blokova. U njih **ništa** ne pišeš. Prazni ostaju:

`PTD`, `PM`, `0`, `1`, `Init`, `SysInit`, `2`, `RTOS_MUTEX`, `RTOS_SEMAPHORES`, `RTOS_TIMERS`, `RTOS_QUEUES`, `RTOS_EVENTS`, `WHILE`, `3`, `MX_GPIO_Init_1`, `MX_GPIO_Init_2`, `5`.

Pišeš u šest blokova: **Includes**, **PD**, **PV**, **PFP**, **RTOS_THREADS** i **4**.

Da nađeš blok: u `main.c` pritisni `Ctrl+F` i ukucaj tačan komentar, na primjer `USER CODE BEGIN Includes`.

---

## Blok 1 — `USER CODE BEGIN Includes`

Ovo je prvi tvoj kod u fajlu, odmah ispod Cubeovih linija `#include "main.h"` i `#include "cmsis_os.h"`. Te dvije Cubeove linije ne diraš.

Nađi:

```c
/* USER CODE BEGIN Includes */

/* USER CODE END Includes */
```

Izmjenjuješ ga u:

```c
/* USER CODE BEGIN Includes */
#include "FreeRTOS.h"
#include "task.h"
/* USER CODE END Includes */
```

| Linija | Šta znači |
|---|---|
| `#include "FreeRTOS.h"` | Osnovno zaglavlje FreeRTOS-a. Tu su `pdMS_TO_TICKS`, `pdTRUE`, `portMAX_DELAY`. Ime fajla ima veliko `F` i veliko `R`. |
| `#include "task.h"` | Tu su `xTaskCreate`, `vTaskDelay`, `vTaskSuspend`, `vTaskResume`, `xTaskNotifyGive`, `ulTaskNotifyTake` i tip `TaskHandle_t`. |

Bez `task.h` kompajler u funkciji ne vidi `vTaskSuspend` ni `TaskHandle_t`. `cmsis_os.h` ih ponekad povuče sam, ali na ispitu ova dva `#include` ipak upišeš ovdje.

---

## Blok 2 — `USER CODE BEGIN PD`

Nađi:

```c
/* USER CODE BEGIN PD */

/* USER CODE END PD */
```

Izmjenjuješ ga u:

```c
/* USER CODE BEGIN PD */
#define DUGO    600u
#define KRATKO  300u
#define PAUZA   300u
/* USER CODE END PD */
```

`PD` znači Private Define. Ovdje stoje imena za brojeve, da poslije ne moraš pamtiti 600 i 300 po cijelom fajlu.

| Linija | Šta znači |
|---|---|
| `#define DUGO 600u` | Gdje god piše `DUGO`, kompajler ubaci `600`. To je duži blok, u milisekundama. |
| `#define KRATKO 300u` | Kraći blok, 300 milisekundi. |
| `#define PAUZA 300u` | Prekid između dva treptaja Task3, kad su sve lampice ugašene. |
| `u` na kraju broja | Broj je unsigned, nema predznak. Trajanje ne može biti negativno. |

Ako profesor na ispitu kaže da dugi blok traje 1000 ms, mijenjaš samo `600u` u `1000u`. Ostatak koda ne diraš.

---

## Blok 3 — `USER CODE BEGIN PV`

Nađi:

```c
/* USER CODE BEGIN PV */

/* USER CODE END PV */
```

Iznad ovog bloka Cube je već napisao `defaultTask`. To ne brišeš. Svoj kod ide ispod `BEGIN PV`:

```c
/* USER CODE BEGIN PV */
static TaskHandle_t t1;
static TaskHandle_t t2;
static TaskHandle_t t3;
static TaskHandle_t vodja;
static volatile uint32_t koliko = KRATKO;
/* USER CODE END PV */
```

`PV` znači Private Variables. Ovdje su kutije u kojima pamtimo taskove i trajanje.

| Linija | Šta znači |
|---|---|
| `static` | Ime važi samo u ovom fajlu. Drugi fajl ne vidi `t1`. |
| `TaskHandle_t` | Tip podatka za „pokazivač na task”. FreeRTOS ti kroz njega da task zaustaviš ili nastaviš. |
| `t1` | Ručka Taska 1. Prazna je dok `xTaskCreate` ne upiše u nju pravi task. |
| `t2`, `t3`, `vodja` | Isto, za ostala tri taska. |
| `volatile` | Vrijednost smije da se promijeni iz drugog taska. Kompajler je mora svaki put iznova pročitati, ne smije je zapamtiti u registru. |
| `uint32_t` | Cijeli broj bez predznaka, 32 bita. Dovoljno velik za milisekunde. |
| `koliko` | Koliko milisekundi trenutna lampica treba da gori. Vodja upisuje ovaj broj prije nego što pusti task. |
| `= KRATKO` | Početna vrijednost je 300. Vodja je ionako pregazi prije prvog paljenja. |

Zašto jedna promjenljiva `koliko`, a ne tri: isti task ponekad gori dugo, ponekad kratko. Task1 ne zna unaprijed koje je vrijeme. Vodja mu to kaže preko `koliko`.

---

## Blok 4 — `USER CODE BEGIN PFP`

Nađi:

```c
/* USER CODE BEGIN PFP */

/* USER CODE END PFP */
```

Iznad njega Cube već ima prototipove `SystemClock_Config`, `MX_GPIO_Init` i `StartDefaultTask`. Njih ne diraš.

Unutra pišeš:

```c
/* USER CODE BEGIN PFP */
static void Task1(void *argument);
static void Task2(void *argument);
static void Task3(void *argument);
static void Vodja(void *argument);
static void Pusti(TaskHandle_t task, uint32_t ms);
static void Upali(uint16_t pin);
/* USER CODE END PFP */
```

`PFP` znači Private Function Prototypes. Prototip je najava funkcije. Kaže kompajleru ime, šta funkcija prima i da ne vraća ništa. Samo tijelo funkcije pišeš kasnije, u bloku `4`. Bez prototipa, `xTaskCreate(Task1, ...)` u `main` ne zna šta je `Task1`, jer je tijelo funkcije ispod `main`.

| Dio | Šta znači |
|---|---|
| `static void` | Funkcija ne vraća rezultat i vide je samo ovaj fajl. |
| `void *argument` | FreeRTOS svakom tasku pošalje jedan argument. Mi ga ne koristimo, ali potpis mora ovako izgledati jer `xTaskCreate` zove funkciju baš u tom obliku. |
| `Pusti(TaskHandle_t task, uint32_t ms)` | Pomoćna funkcija. Prima koji task da pusti i koliko milisekundi da gori. |
| `Upali(uint16_t pin)` | Pomoćna funkcija. Prima pin. `uint16_t` je tip koji HAL koristi za `GPIO_PIN_1` i slično. |

Tačka-zarez na kraju prototipa je obavezna. U tijelu funkcije, dolje, tačka-zarez iza potpisa ne ide.

---

## Blok 5 — `USER CODE BEGIN RTOS_THREADS`

Ovo je unutar funkcije `main`, ne na vrhu fajla. Nađi:

```c
  /* USER CODE BEGIN RTOS_THREADS */
  /* add threads, ... */
  /* USER CODE END RTOS_THREADS */
```

Komentar `/* add threads, ... */` smiješ obrisati. Zamijeniš cijeli blok ovim:

```c
  /* USER CODE BEGIN RTOS_THREADS */
  vTaskSuspend((TaskHandle_t)defaultTaskHandle);

  xTaskCreate(Task1, "Task1", 256, NULL, 3, &t1);
  vTaskSuspend(t1);

  xTaskCreate(Task2, "Task2", 256, NULL, 1, &t2);
  vTaskSuspend(t2);

  xTaskCreate(Task3, "Task3", 256, NULL, 2, &t3);
  vTaskSuspend(t3);

  xTaskCreate(Vodja, "Vodja", 256, NULL, 4, &vodja);
  /* USER CODE END RTOS_THREADS */
```

Ovaj blok mora ostati **ispod** linije `osKernelInitialize();` i **ispod** linije koja pravi `defaultTask`. Cube te linije napiše sam, iznad tvog bloka. Ne pomjeraj ih.

### Prva linija, defaultTask

```c
vTaskSuspend((TaskHandle_t)defaultTaskHandle);
```

Cube sam napravi task koji se zove `defaultTask`. Njegov prioritet u generisanom kodu je `osPriorityNormal`, a to je broj **24**. Naš vodja ima prioritet 4. Dok je 24 spreman za rad, 4 nikad ne dobije procesor i lampice stoje.

`vTaskSuspend` zaustavlja task. Zaustavljen task ne radi, čak i ako ima veliki prioritet.

`defaultTaskHandle` je tip `osThreadId_t`, a `vTaskSuspend` traži `TaskHandle_t`. Zagrada `(TaskHandle_t)` pretvara jedan tip u drugi. U ovom projektu to je isti pokazivač, samo drugačije ime.

Poslije ovoga `StartDefaultTask` se ne izvršava. Njegovu petlju `osDelay(1)` u bloku `USER CODE BEGIN 5` ne moraš mijenjati.

### Šta znači jedan `xTaskCreate`

Primjer:

```c
xTaskCreate(Task1, "Task1", 256, NULL, 3, &t1);
```

Šest stvari, redom:

| Mjesto | Kod | Značenje |
|---|---|---|
| 1 | `Task1` | Ime funkcije koju task vrti. To je funkcija iz bloka `4`. |
| 2 | `"Task1"` | Ime u navodnicima. To je samo natpis, za debug. Nije prioritet i nije pin. |
| 3 | `256` | Veličina steka u riječima. Jedna riječ je 4 bajta, dakle 1024 bajta. Dovoljno za ovaj kratki kod. |
| 4 | `NULL` | Argument koji task dobije. `NULL` znači „ništa”. Zato u funkciji stoji `(void)argument`. |
| 5 | `3` | Prioritet. Za Task1 je 3, za Task2 je 1, za Task3 je 2, za Vodja je 4. Ovi brojevi moraju biti tačni kao u tabeli zadatka. |
| 6 | `&t1` | Adresa kutije `t1`. Funkcija u tu kutiju upiše ručku novog taska. Poslije kažeš `vTaskSuspend(t1)` i FreeRTOS zna koji task. |

`&` znači adresa. Bez `&`, u kutiju se ne bi moglo upisati.

### Linija odmah ispod svakog lampica-taska

```c
vTaskSuspend(t1);
```

Task je napravljen i spreman je da krene čim scheduler počne. Ova linija ga odmah zaustavi, prije `osKernelStart()`. Inače bi Task1, čim dobije procesor, upalio PA1 prije nego što vodja kaže da je red na njega.

Vodja se **ne** suspenduje. On treba da krene sam i da ostale pušta.

Redoslijed kreiranja: prvo tri lampice, svaka odmah suspendovana, pa vodja na kraju. Prioritet, a ne red kreiranja, odlučuje ko prvi radi. Vodja ima najveći prioritet od naših taskova, pa poslije zaustavljanja `defaultTask` on prvi uđe u svoju petlju.

---

## Blok 6 — `USER CODE BEGIN 4`

Ovo je ispod funkcije `MX_GPIO_Init`, a iznad `StartDefaultTask`. Nađi:

```c
/* USER CODE BEGIN 4 */

/* USER CODE END 4 */
```

Tu dolazi cijelo tijelo funkcija. Prototipovi su gore samo najava. Ovdje je pravi kod.

```c
/* USER CODE BEGIN 4 */
static void Pusti(TaskHandle_t task, uint32_t ms)
{
  koliko = ms;
  vTaskResume(task);
  ulTaskNotifyTake(pdTRUE, portMAX_DELAY);
}

static void Upali(uint16_t pin)
{
  HAL_GPIO_WritePin(GPIOA, pin, GPIO_PIN_SET);
  vTaskDelay(pdMS_TO_TICKS(koliko));
  HAL_GPIO_WritePin(GPIOA, pin, GPIO_PIN_RESET);
  xTaskNotifyGive(vodja);
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

/* USER CODE END 4 */
```

### Funkcija `Pusti`

Vodja je jedini koji zove `Pusti`.

```c
koliko = ms;
```

Upiše trajanje u zajedničku kutiju. `ms` je broj koji je vodja poslao, `DUGO` ili `KRATKO`.

```c
vTaskResume(task);
```

Nastavi zaustavljen task. `task` je `t1`, `t2` ili `t3`. Od ovog trenutka taj task smije da radi. Pošto vodja ima veći prioritet, lampica još ne krene. Vodja i dalje drži procesor, dok sam sebe ne zaustavi sljedećom linijom.

```c
ulTaskNotifyTake(pdTRUE, portMAX_DELAY);
```

Vodja čeka poruku od lampice.

- `ulTaskNotifyTake` čeka task notification. To je brojač koji drugi task podigne.
- `pdTRUE` znači: kad poruka stigne, obriši je. Sljedeće čekanje opet čeka novu poruku, ne staru.
- `portMAX_DELAY` znači čekaj beskonačno. Nema isteka vremena.

Dok vodja čeka, on je blokiran. Tek tada lampica, koja ima manji prioritet, dobije procesor i uđe u `Upali`.

### Funkcija `Upali`

```c
HAL_GPIO_WritePin(GPIOA, pin, GPIO_PIN_SET);
```

Upali pin.

- `HAL_GPIO_WritePin` je HAL funkcija koja upiše 0 ili 1 na pin.
- `GPIOA` je port A. PA1, PA3 i PA5 su svi na portu A.
- `pin` je `GPIO_PIN_1`, `GPIO_PIN_3` ili `GPIO_PIN_5`.
- `GPIO_PIN_SET` je 1. Visok nivo. U ovom zadatku to znači lampica gori.
- `GPIO_PIN_RESET` je 0. Nizak nivo. Lampica je ugašena.

Ako na ispitu lampica svijetli obrnuto, zamijeniš `SET` i `RESET` na ove dvije linije. Ništa drugo.

```c
vTaskDelay(pdMS_TO_TICKS(koliko));
```

Čekaj `koliko` milisekundi.

- `vTaskDelay` zaustavi **samo ovaj** task. Ostali smiju da rade. Zato se koristi u tasku.
- `HAL_Delay` zaustavi cijeli mikrokontroler. U tasku ga ne koristiš.
- `pdMS_TO_TICKS` pretvori milisekunde u tickove FreeRTOS-a.
- Tick je 1000 puta u sekundi, jer je `configTICK_RATE_HZ` jednak 1000. Zato je 300 ms jednako 300 tickova. Ako tick nije 1000, isti broj više ne znači 300 ms.

Dok lampica čeka u `vTaskDelay`, vodja i dalje stoji u `ulTaskNotifyTake`. Niko drugi ne pali pin.

```c
HAL_GPIO_WritePin(GPIOA, pin, GPIO_PIN_RESET);
```

Ugasi istu lampicu. Gasi se **prije** poruke vodji, da sljedeća lampica ne gori u isto vrijeme.

```c
xTaskNotifyGive(vodja);
```

Pošalji poruku vodji: „gotova sam”. Vodja ima veći prioritet, pa se probudi odmah i izađe iz `ulTaskNotifyTake`.

```c
vTaskSuspend(NULL);
```

Zaustavi task u kojem se ova linija nalazi. `NULL` znači „ja sama sebe”. Poslije ovoga task stoji na ovoj liniji dok vodja opet ne pozove `vTaskResume`.

Poruka ide prije `vTaskSuspend`. Da se task prvo zaustavi, nikad ne bi stigao da pošalje poruku, i vodja bi čekao zauvik.

### Task1, Task2, Task3

```c
static void Task1(void *argument)
{
  (void)argument;
  for (;;)
  {
    Upali(GPIO_PIN_1);
  }
}
```

| Linija | Šta znači |
|---|---|
| `(void)argument` | Argument se ne koristi. Ovo utiša upozorenje kompajlera. |
| `for (;;)` | Beskonačna petlja. Nema uslova izlaska. Task živi dok radi mikrokontroler. |
| `Upali(GPIO_PIN_1)` | PA1. `GPIO_PIN_1` je pin broj 1 na portu koji pošaljemo, a port je `GPIOA` unutar `Upali`. |
| `GPIO_PIN_3` u Task2 | PA3. |
| `GPIO_PIN_5` u Task3 | PA5. |

`Upali` na kraju uradi `vTaskSuspend(NULL)`. Kad vodja task nastavi, izvršavanje krene odmah iza tog `vTaskSuspend`, izađe iz `Upali`, dođe do kraja petlje i uđe u petlju opet. Zato drugi put opet pozove `Upali`. Zato isti task može jednom gorjeti dugo, a drugi put kratko: svaki put pročita novo `koliko`.

### Funkcija `Vodja`

```c
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
```

Ova petlja **jeste** dijagram. Jedan red je jedan blok svjetla.

`Pusti` ne samo što nastavi task. Ona i čeka da taj task završi. Zato se sljedeći red ne izvrši dok prethodna lampica nije ugašena. Zato nema preklapanja.

`vTaskDelay` između dva `Pusti(t3, ...)` je prekid. U tom trenutku su t1, t2 i t3 suspendovani, a svoje pinove su već ugasili. Sva tri pina su na 0.

Poslije drugog `Pusti(t3, KRATKO)` petlja krene ispočetka, odmah na `Pusti(t1, DUGO)`. Između drugog Task3 i sljedećeg Task1 nema pauze. Pauza postoji samo između dva Task3.

---

## Šta Cube napiše sam, i zašto to ne diraš

Ovo nije tvoj kod. Ako ga prepišeš, sljedeći Generate može da se poremeti, ili napraviš duplikat.

Na vrhu `main.c` Cube sam napiše:

```c
#include "main.h"
#include "cmsis_os.h"
```

Te dvije linije ne pišeš ti. One su izvan `USER CODE` bloka. `main.h` povlači HAL, pa rade `HAL_GPIO_WritePin` i imena pinova.

Ispod njih nađi prazan blok i upiši FreeRTOS zaglavlja. To je prvi tvoj kod u fajlu:

```c
/* USER CODE BEGIN Includes */
#include "FreeRTOS.h"
#include "task.h"
/* USER CODE END Includes */
```

| Linija | Šta znači |
|---|---|
| `#include "FreeRTOS.h"` | Osnovno zaglavlje FreeRTOS-a. Tu su `pdMS_TO_TICKS`, `pdTRUE`, `portMAX_DELAY` i `NULL` koji FreeRTOS koristi. Ime fajla ima veliko `F` i veliko `R`. `freeRTOS.h` nije isto ime. |
| `#include "task.h"` | Tu su `xTaskCreate`, `vTaskDelay`, `vTaskSuspend`, `vTaskResume`, `xTaskNotifyGive`, `ulTaskNotifyTake` i tip `TaskHandle_t`. |

Bez `task.h` kompajler u funkciji ne vidi `vTaskSuspend` ni `TaskHandle_t` i build staje. `cmsis_os.h` ih često povuče sam, ali na ispitu ih ipak upišeš u ovaj blok, da su vidljivi i da ne zavise od toga šta Cube stavi iznad.

U `main`, redom:

```c
HAL_Init();
SystemClock_Config();
MX_GPIO_Init();
osKernelInitialize();
defaultTaskHandle = osThreadNew(StartDefaultTask, NULL, &defaultTask_attributes);
osKernelStart();
```

| Poziv | Šta radi |
|---|---|
| `HAL_Init` | Pokrene HAL. Pošto je timebase TIM1, ovdje se pokrene i taj timer. |
| `SystemClock_Config` | Podesi sat mikrokontrolera. Cube je to napisao. |
| `MX_GPIO_Init` | Uključi sat porta A i podesi PA1, PA3 i PA5 kao izlaz, početno ugašene. |
| `osKernelInitialize` | Pripremi FreeRTOS prije pravljenja taskova. `xTaskCreate` stoji ispod ovoga. |
| `osThreadNew` | Cube napravi `defaultTask`. Tu liniju ne brišeš. |
| `osKernelStart` | Scheduler krene. Odavde taskovi stvarno rade. Kod ispod ove linije se praktično ne izvršava. |

Unutar `MX_GPIO_Init` Cube ima:

```c
HAL_GPIO_WritePin(GPIOA, GPIO_PIN_1|GPIO_PIN_3|GPIO_PIN_5, GPIO_PIN_RESET);
```

`|` spaja tri pina u jedan poziv. `GPIO_PIN_RESET` ugasi sva tri prije starta. To je početno stanje: ništa ne svijetli.

Isto tu stoji:

```c
GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
```

`OUTPUT_PP` znači izlaz, push-pull. Pin može da drži i 0 i 1. To treba lampici. Ako pin ostane ulaz, kod se i dalje kompajlira, ali lampica ne reaguje.

Na dnu `main.c` Cube ima:

```c
void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)
{
  if (htim->Instance == TIM1)
  {
    HAL_IncTick();
  }
}
```

Ovo je sat za HAL. `htim` ovdje je argument funkcije, Cube ga je deklarisao u zagradi. To nije tvoja varijabla `htim1`. Ne dodaješ `extern TIM_HandleTypeDef htim1` u `main.c`. Pravi `htim1` živi u `Core/Src/stm32f4xx_hal_timebase_tim.c`, i taj fajl ne otvaraš.

---

## Kako program teče od uključivanja

1. `main` podesi sat i pinove. Sve lampice su ugašene.
2. Napravi se `defaultTask`, pa t1, t2, t3, i odmah se zaustave. Napravi se vodja.
3. `osKernelStart` pusti scheduler.
4. `defaultTask` je zaustavljen, pa vodja prvi uđe u petlju.
5. `Pusti(t1, DUGO)` upiše 600 u `koliko`, nastavi t1 i čeka poruku.
6. Task1 upali PA1, čeka 600 ms, ugasi PA1, javi vodji, zaustavi se.
7. Vodja isto uradi za t2, pa opet za t1 sa 300, pa za t2 sa 300, pa za t3 sa 300.
8. Vodja sam čeka 300 ms. Sve je ugašeno. To je prekid između dva Task3.
9. Vodja još jednom pusti t3 na 300 ms.
10. Petlja se vrati na korak 5.

Prioriteti 3, 1 i 2 ne biraju ovaj redoslijed. Redoslijed bira petlja u `Vodja`. Prioriteti ipak moraju biti upisani kako tabela kaže. Uloga prioriteta ovdje je druga: vodja sa 4 može da pusti task i odmah prijeđe na čekanje, a `defaultTask` sa 24 mora biti zaustavljen da ne stoji ispred svih.

---

## Build

U CubeIDE: **Project → Build Project**, ili čekić.

Uspjeh: u Console piše `Build Finished` i `0 errors`.

`terminated with exit code 2` nije prava greška. To je samo zadnja linija kad build padne. Prava greška je prva linija iznad u kojoj piše `error:`.

Greške koje ovaj raspored izbjegava:

| Greška | Zašto je nema |
|---|---|
| `'htim1' undeclared` | U tvom kodu nema `htim1`. Timer za HAL Cube drži u svom fajlu. |
| implicit declaration of `vTaskSuspend` | U `.ioc` je `INCLUDE_vTaskSuspend` uključen, a `cmsis_os.h` već uvlači `task.h`. |
| duplicate definition | Funkcije stoje samo u `main.c`, ne i u `freertos.c`. |
| task nikad ne krene | `defaultTask` je suspendovan, pa prioritet 24 ne blokira vodju. |

Ako ipak vidiš `error:`, kopiraj tu prvu liniju. Ne cijeli ispis.

---

## Šta ponijeti na ispit, napamet

1. Pinovi: PA1, PA3, PA5 kao GPIO_Output. SYS: Serial Wire i TIM1. FreeRTOS: CMSIS_V2.
2. Šest mjesta u `main.c`: `Includes`, `PD`, `PV`, `PFP`, `RTOS_THREADS`, i tijela u `4`.
3. Prioriteti u `xTaskCreate`: 3, 1, 2, vodja 4.
4. Poslije svakog lampica-taska odmah `vTaskSuspend`. Vodja se ne suspenduje.
5. `vTaskDelay` čeka. `HAL_Delay` ne koristiš.
6. `vTaskResume(t1)` nastavlja Task1. `vTaskSuspend(NULL)` zaustavlja onog ko tu liniju izvršava.
7. Petlja u `Vodja` je dijagram. Pauza je samo `vTaskDelay` između dva poziva za t3.
8. Ne pišeš `htim1`.

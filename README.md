# Rep & Tear - DOOM Gym Tracker

DOOM-themed gym tracker aplikace pro sledování týdenních tréninků.

## Funkce

- **Weekly Tracker** - Sledování 7 dní v týdnu (Po-Ne)
- **DOOM Face** - Dynamická tvář měnící se podle počtu workoutů:
  - 0 workoutů = CRITICAL (face_0_critical)
  - 1 workout = HURT BAD (face_1_hurt)
  - 2 workouty = DAMAGED (face_2_damaged)
  - 3 workouty = HEALTHY ✓ (face_3_healthy) - minimum
  - 4 workouty = STRONG ⭐ (face_4_strong) - ideál
  - 5-7 workoutů = GOD MODE 🔥 (face_5_6_godmode) - zlatá záře

- **Face Animace** - Náhodné otáčení hlavy doleva/doprava
- **Ouch Face** - Zobrazí se při odebrání workoutu
- **God Mode Efekt** - Zlatá pulzující záře při 5+ workoutech
- **Statistiky**:
  - STREAK - Počet týdnů za sebou s alespoň 3 workouty
  - TOTAL - Celkový počet workoutů
- **Boost Motivation** - Tlačítko otevírající DOOM soundtrack na YouTube

## Technologie

- React + TypeScript
- Vite
- Tailwind CSS
- LocalStorage pro persistenci dat

## Spuštění

```bash
npm install
npm run dev
```

Aplikace běží na `http://localhost:5173`

## Build

```bash
npm run build
npm run preview
```

## Assety

DOOM assety (faces, fonts) jsou ve složce `/doom-assets/`:
- `/doom-assets/faces/` - Různé stavy tváře DoomGuy
- `/doom-assets/fonts/` - AmazDoom a Press Start 2P fonty

## Firebase (TODO)

Firebase konfigurace pro autentizaci a databázi bude přidána později.

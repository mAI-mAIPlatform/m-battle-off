# mBattle - Browser Battle Royale

## Overview
mBattle is a fast-paced browser-based action game. Fight against bots, unlock heroes, skins, and climb the ranks!

## Structure
The project is organized as follows:
- `index.html`: Main entry point.
- `src/css/style.css`: All styles.
- `src/js/main.js`: Game entry point (initializes Game and UI).
- `src/js/core/`: Core game logic (Game loop, Input, Storage, etc.).
- `src/js/entities/`: Game entities (Player, Bot, etc.).
- `src/js/data/`: Game data (Constants, Heroes, Modes, etc.).
- `src/js/ui/`: UI components.

## Deployment
This project uses native ES Modules. No build step is required.
Simply serve the root directory.

### GitHub Pages
1. Push to GitHub.
2. Enable GitHub Pages in settings pointing to the root branch.

### Vercel
1. Import the repository.
2. It should auto-detect the static site.

## Development
To run locally, you need a local server (to support ES modules):
```bash
npx serve .
# or
python3 -m http.server
```
Then open `http://localhost:8000`.

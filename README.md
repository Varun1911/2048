# Tile Twist – 2048 with Power-Ups

🎮 Live Demo: https://tiletwist.netlify.app/

Tile Twist is a vanilla JavaScript implementation of the classic 2048 game with additional strategic power-ups like **Undo**, **Shuffle**, and **Swap**. The project focuses on clean game-state management, smooth animations, and responsive UI without using any frameworks.

---

## Features

### Core Gameplay
- Classic 2048 sliding-tile mechanics
- Supports both **4×4** and **5×5** grid sizes
- Correct merge rules and move validation

### Power-Ups
- **Undo**: Revert the previous move with full state rollback (limited uses)
- **Shuffle**: Randomly rearranges existing tiles while preserving values
- **Swap**: Allows swapping positions of any two tiles via a selection mode

### UI & UX
- Smooth tile movement, merge, and spawn animations
- Responsive layout using CSS variables
- Keyboard (Arrow keys + WASD) and touch swipe support
- Input locking during animations and popups

### Persistence
- Best score stored per grid size using localStorage
- Obfuscated score storage (XOR + Base64) to discourage tampering

---

## How to Play
- Use arrow keys or swipe gestures to move tiles
- Merge identical tiles to increase their value
- Use power-ups strategically to extend gameplay
- Reach 2048 to win and continue playing for a higher score

---

## Project Structure

- `index.html` – Game layout and UI structure
- `style.css` – Responsive design, animations, visual effects
- `main.js` – App lifecycle, grid selection, popup handling
- `helper.js` – Popup state management
- `game2048.js` – Core game engine (logic, animations, power-ups)

---

## Technical Highlights

- Built entirely with **HTML, CSS, and Vanilla JavaScript**
- Custom game engine with explicit game state and UI state separation
- Tiles managed via a Map for precise animation control
- Deep state cloning for undo functionality
- Touch gesture handling with swipe direction detection

---

## Local Setup

```bash
git clone https://github.com/Varun1911/2048.git
cd 2048
open index.html

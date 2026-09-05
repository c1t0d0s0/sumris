# SUMRIS

<div align="center">

**A Cyberpunk-Themed Falling Math Block Puzzle Game**

[**Play Live Demo**](https://c1t0d0s0.github.io/sumris/) | [**日本語版 README (README.ja.md)**](README.ja.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy to GitHub Pages](https://github.com/c1t0d0s0/sumris/actions/workflows/deploy.yml/badge.svg)](https://github.com/c1t0d0s0/sumris/actions/workflows/deploy.yml)

</div>

---

## 🎮 Overview

**SUMRIS** is an addictive, fast-paced puzzle game combining the spatial tension of classic falling-block games with real-time mental arithmetic. 

Single blocks numbered from **1 to 9** fall from the top of the grid. Stack and align them vertically or horizontally so that contiguous blocks sum to any **multiple of 10** (10, 20, 30, ... up to 90). The blocks clear with explosive neon particle effects, trigger cascading combos, and clear the board!

Can you achieve the elusive **PERFECT CLEAR**?

---

## ✨ Features

- **Dynamic Addition Puzzle**: Contiguous blocks in vertical columns or horizontal rows clear whenever their sum reaches 10, 20, 30, etc.
- **Score Multipliers & Combos**:
  - **Big Sums**: Clearing higher multiples (e.g. 20, 90) or using more blocks grants significantly more points.
  - **Cross Clear (3x)**: Clear intersecting vertical and horizontal lines simultaneously for an instant 3x score multiplier!
  - **Combo Chains**: Gravity pulls remaining blocks down—trigger cascading chain reactions for exponential bonus points!
  - **Perfect Clear Bonus**: Eliminate every single block from the board to double your total score!
- **3 Difficulty Levels**:
  - **EASY**: 1,200 ms fall speed | 5 initial blocks | 1.0x score multiplier (Relaxed pace, perfect for beginners)
  - **NORMAL**: 850 ms fall speed | 7 initial blocks | 1.5x score multiplier (Balanced challenge)
  - **HARD**: 500 ms fall speed | 12 initial blocks | 2.0x score multiplier (High-speed thrill with double score reward)
  - Saved automatically to browser `localStorage`.
- **Interactive In-Game Tutorial**: A multi-tab visual guide (Basics, Clearing, Bonus, Controls) accessible anytime with the `?` button.
- **Bilingual (English / Japanese)**: Automatically detects browser language, with an instant `EN / JA` toggle in the top bar.
- **Synthesized Web Audio**: Built-in sound generator using the Web Audio API (drop, move, clear, combo, cross-clear, game over). No external audio files needed!
- **Mobile & Desktop Responsive**:
  - Touch-friendly on-screen controls and swipe gestures for smartphones.
  - Full keyboard support for PC.
  - High-DPI canvas rendering and viewport height adjustment for all devices.
- **Zero External Dependencies**: 100% pure vanilla JavaScript, HTML5 Canvas, and modern CSS3.

---

## 🕹️ Controls

| Action | PC (Keyboard) | Mobile / Touch |
| :--- | :--- | :--- |
| **Move Left** | <kbd>←</kbd> or <kbd>A</kbd> | Tap `⇦` or Swipe Left |
| **Move Right** | <kbd>→</kbd> or <kbd>D</kbd> | Tap `⇨` or Swipe Right |
| **Soft Drop** | <kbd>↓</kbd> or <kbd>S</kbd> | Tap `⇩` |
| **Toggle Sound** | Click `🔊 / 🔇` | Tap `🔊 / 🔇` |
| **How to Play** | Click `❓` | Tap `❓` |
| **Switch Language** | Click `EN / JA` | Tap `EN / JA` |

---

## 🚀 Getting Started

No build steps or package managers required. Simply open the files in your browser!

### Running Locally

1. **Clone the repository**:
   ```bash
   git clone git@github.com:c1t0d0s0/sumris.git
   cd sumris
   ```

2. **Serve locally** (recommended for Web Audio and Canvas):
   ```bash
   # Using Python 3:
   python3 -m http.server 8000
   ```
   Open `http://localhost:8000` in your browser.

3. **Or open directly**:
   Double click `index.html` to open it directly in any modern browser.

### Optional: Analytics Configuration

To enable Google Tag Manager / Google Analytics:
Create a file named `config.js` in the root directory:
```javascript
const GTM_ID = 'G-XXXXXXXXXX';
```
*(Note: `config.js` is ignored in `.gitignore` by default).*

---

## 🚢 Deployment

The repository includes a GitHub Actions workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) that deploys directly to **GitHub Pages**.

### Automated Tag Deployment

Pushing any tag starting with `v` triggers an automated deployment:

```bash
git tag v1.0.0
git push origin v1.0.0
```

> **Repository Setup Note**:
> Ensure GitHub Pages is configured to build from **GitHub Actions** under repository **Settings > Pages > Build and deployment > Source**.
> If you have a Google Analytics ID, add it as a repository variable (`vars.GTM_ID`) or secret (`secrets.GTM_ID`) named `GTM_ID`.

---

## 📁 Project Structure

```
sumris/
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Actions automated deployment
├── index.html           # Main markup, overlays & UI structure
├── style.css            # Cyberpunk dark neon UI & animations
├── script.js            # Game engine, audio synthesizer & i18n
├── LICENSE              # MIT License
├── README.md            # English documentation
└── README.ja.md         # Japanese documentation
```

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

# 🏆 Ljub World Cup Sweepstake 2026

A mobile-friendly sweepstake leaderboard for the FIFA World Cup 2026. Built with vanilla HTML, CSS, and JavaScript. All data is managed via Google Sheets - no backend required.

## Features

- 📊 Live leaderboard with player rankings and points
- 🏳️ Team badges with country flags and match stats (W/D/L)
- 🖼️ Player avatars loaded from a URL in the Google Sheet (falls back to initial letter)
- 💰 Prize pool breakdown tab
- 🔄 Auto-refreshes data every 60 seconds

## Google Sheet Structure

The app reads from three sheets in a single Google Spreadsheet:

### `Players` sheet
| Column | Description |
|--------|-------------|
| A — Name | Player's name |
| B — PhotoURL | Avatar image URL (optional) |

> Tip: Use a [DiceBear](https://www.dicebear.com/styles) URL as an avatar, e.g. `https://api.dicebear.com/8.x/adventurer/svg?seed=xyz`

### `Teams` sheet
| Column | Description |
|--------|-------------|
| A — Team | Country name |
| B — Owner | Player name (must match Players sheet) |
| C — Stage | Current stage (e.g. `Group`, `RoundOf16`, `QuarterFinal`) |
| D — Wins | Match wins |
| E — Draws | Match draws |
| F — Losses | Match losses |

### `Scoring` sheet
| Column | Description |
|--------|-------------|
| A — Stage | Stage or event name (e.g. `MatchWin`, `MatchDraw`, `RoundOf16`) |
| B — Points | Points awarded |

Special keys: `EntryFee`, `PrizeWinner`, `PrizeRunnerUp`, `PrizeSemiFinalist`, `PrizeLastPlace`

## Files

| File | Purpose |
|------|---------|
| `index.html` | App shell and tab layout |
| `style.css` | All styling (dark theme, mobile-first) |
| `app.js` | Data fetching, leaderboard logic, rendering |

## Setup

1. Make your Google Sheet publicly readable (Share → Anyone with the link → Viewer)
2. Copy the Sheet ID from the URL and update `SHEET_ID` in `app.js`
3. Open `index.html` in a browser or deploy to any static host (GitHub Pages, Netlify, etc.)

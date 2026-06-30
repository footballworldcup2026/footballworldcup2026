# 🏆 Ljub World Cup Sweepstake 2026

A mobile-friendly sweepstake leaderboard for the FIFA World Cup 2026. Built with vanilla HTML, CSS, and JavaScript. All data is managed via Google Sheets - no backend required.

## Features

- 📊 Live leaderboard with player rankings and points
- 🏳️ Team badges with country flags and a stage-progress pill
- 🔍 Click a badge to expand a per-team **points breakdown** (group matches + each stage bonus)
- ✕ Eliminated teams are marked **OUT** (red pill + strikethrough), controlled from the sheet
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
| C — Stage | Furthest stage reached: `Group`, `Round32`, `Round16`, `Quarter`, `Semi`, `RunnerUp`, `Winner` |
| D — Wins | Match wins (see scoring note below) |
| E — Draws | Match draws |
| F — Losses | Match losses |
| G — Eliminated | Set to `Yes` (or `TRUE`/`1`/`Out`) to mark the team knocked out; leave blank if still in |

### `Scoring` sheet
| Column | Description |
|--------|-------------|
| A — Stage | Stage or event name (see keys below) |
| B — Points | Points awarded |

Stage keys: `Group`, `Round32`, `Round16`, `Quarter`, `Semi`, `RunnerUp`, `Winner`
Match keys: `MatchWin`, `MatchDraw`
Prize keys: `EntryFee`, `PrizeWinner`, `PrizeRunnerUp`, `PrizeSemiFinalist`, `PrizeLastPlace`

## How scoring works

A player's total is the sum of **both** their teams. Each team scores on two axes:

1. **Match points** — `Wins × MatchWin + Draws × MatchDraw`. These are intended for the **group stage only**: once the groups finish, freeze the Wins/Draws columns and don't update them for knockout games.
2. **Stage bonus (cumulative)** — a team banks the bonus for **every round it passes**. A team at `Round16` earns `Round32 + Round16`; a `Winner` earns `Round32 + Round16 + Quarter + Semi + Winner`. (`Group` is worth 0.)

### Recording a knockout result
- **Team advances:** move its `Stage` to the next round (e.g. `Round32` → `Round16`). The stage bonus is its reward — **do not** add to the Wins column.
- **Team knocked out:** set column **G — Eliminated** to `Yes`. It keeps the points already earned and is shown as `✕ OUT` at the round it exited.

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

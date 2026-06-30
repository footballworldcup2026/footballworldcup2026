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

The app reads from three sheets in a single Google Spreadsheet: **`Players`**, **`Teams`**, and **`Scoring`**.

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
| D — GroupWins | Final **group-stage** wins (frozen once groups finish) |
| E — GroupDraws | Final **group-stage** draws (frozen) |
| F — GroupLosses | Final **group-stage** losses (frozen) |
| G — Eliminated | Set to `Yes` (or `TRUE`/`1`/`Out`) to mark the team knocked out; leave blank if still in |

> The group columns are filled **once** when the group stage ends and never touched again — knockout progress is recorded only via the `Stage` column.

### `Scoring` sheet
| Column | Description |
|--------|-------------|
| A — Stage | Stage or event name (see keys below) |
| B — Points | Points awarded |

Suggested values:

| Key | Points | Meaning |
|-----|-------:|---------|
| `Round32` | 9 | Per-round bonus (cumulative) |
| `Round16` | 12 | |
| `Quarter` | 18 | |
| `Semi` | 25 | |
| `RunnerUp` | 35 | Reaching the final (loser) |
| `Winner` | 120 | Lifting the trophy (deliberately large) |
| `GroupWin` | 3 | Standard football points per group-stage win |
| `GroupDraw` | 1 | Standard football points per group-stage draw |
| `EntryFee` | … | Prize-pool tab |
| `PrizeWinner` / `PrizeRunnerUp` / `PrizeSemiFinalist` / `PrizeLastPlace` | … | Prize-pool tab |

## How scoring works

Each **team** scores on two axes:

1. **Stage bonus (cumulative)** — a team banks the bonus for **every round it passes**. `Round16` earns `Round32 + Round16` (= 21); a `Winner` earns `Round32 + Round16 + Quarter + Semi + Winner` (= 184). (`Group` is worth 0.)
2. **Group bonus (standard 3/1, frozen)** — `GroupWins × GroupWin + GroupDraws × GroupDraw`, i.e. the usual **3 for a win, 1 for a draw** (max 9 over 3 group games). The knockout bonuses above are scaled up to match, so the group stage still rewards form and breaks ties without overturning the knockout curve.

A **player's** total is simply their **two teams added together** — no weighting, no special rules.

Because the `Winner` bonus is large, the cumulative score of the **champion** (≈ 184) outweighs any pair of non-champion teams a rival could own. The best a rival can do without the champion is runner-up + semi-finalist = `(99 + 9) + (64 + 9)` = **181** (both maxing the 9-point group bonus), which still falls short of the champion's 184. So the champion's owner is guaranteed to finish top, while both teams still contribute to everyone's score.

### Recording a knockout result
- **Team advances:** move its `Stage` to the next round (e.g. `Round32` → `Round16`). The cumulative stage bonus is its reward — there is no per-match column to update in the knockouts.
- **Team knocked out:** set column **G — Eliminated** to `Yes`. It keeps the points already earned and is shown as `✕ <round>` at the round it exited.

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

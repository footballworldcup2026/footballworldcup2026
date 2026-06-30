const SHEET_ID = "179t_fUJ_q0bbwxsiXIQcaxV6YLBv6_cXq8rBbq2i9eg";
const cacheBuster = `&_cb=${new Date().getTime()}`;

const URLS = {
  teams: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Teams${cacheBuster}`,
  players: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Players${cacheBuster}`,
  scoring: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Scoring${cacheBuster}`,
};

// Map team names to ISO two-letter country codes for flagcdn urls
const FLAG_MAP = {
  "england": "gb-eng", "france": "fr", "argentina": "ar", "spain": "es", 
  "brazil": "br", "portugal": "pt", "germany": "de", "netherlands": "nl", 
  "belgium": "be", "croatia": "hr"
};

// 🏁 Friendly labels for each knockout stage (shown as a pill on the badge)
const STAGE_LABELS = {
  "Group": "Group Stage",
  "Round32": "Round of 32",
  "Round16": "Round of 16",
  "Quarter": "Quarter-final",
  "Semi": "Semi-final",
  "RunnerUp": "Runner-up",
  "Winner": "Champion 🏆"
};

// 🎛️ Simple Tab-Switching Function
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  
  document.getElementById(tabId).classList.add('active');
  event.currentTarget.classList.add('active');
}

// 🔍 Toggle a team's points-breakdown panel open/closed
function toggleDetails(detailsId) {
  const el = document.getElementById(detailsId);
  if (el) el.classList.toggle('open');
}

function parseCSV(text) {
  return text.trim().split("\n").map(row => row.split(",").map(cell => cell.replace(/"/g, "").trim()));
}

async function fetchCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  return parseCSV(text);
}

function buildScoringMap(scoring) {
  const map = {};
  for (let i = 1; i < scoring.length; i++) {
    const [stage, points] = scoring[i];
    if (stage) map[stage] = Number(points) || 0;
  }
  return map;
}

// ❌ Treat common truthy values in the Eliminated column as "knocked out"
function isEliminated(value) {
  if (!value) return false;
  const v = value.toString().trim().toLowerCase();
  return ["yes", "y", "true", "1", "out", "eliminated", "knocked out"].includes(v);
}

// 🪜 Knockout rounds in order. RunnerUp/Winner are the two possible Final outcomes
// that sit on top of this sequence.
const STAGE_SEQUENCE = ["Round32", "Round16", "Quarter", "Semi"];

// 🧮 Cumulative stage bonus: a team earns the bonus for EVERY round it has passed.
// Returns an ordered list of { label, points } rows (Group = 0 is skipped).
function stageBreakdown(stage, scoringMap) {
  const rows = [];
  const add = (key) => {
    const pts = scoringMap[key] || 0;
    if (pts) rows.push({ label: STAGE_LABELS[key] || key, points: pts });
  };
  if (!stage || stage === "Group") return rows;

  if (stage === "Winner" || stage === "RunnerUp") {
    STAGE_SEQUENCE.forEach(add);
    add(stage);
    return rows;
  }

  const idx = STAGE_SEQUENCE.indexOf(stage);
  if (idx === -1) { add(stage); return rows; }
  for (let i = 0; i <= idx; i++) add(STAGE_SEQUENCE[i]);
  return rows;
}

function calculateLeaderboard(playerRows, teamRows, scoringMap) {
  const players = {};
  for (let i = 1; i < playerRows.length; i++) {
    const row = playerRows[i];
    if (!row || !row[0]) continue;
    const name = row[0].trim();
    const photo = row[1] ? row[1].trim() : null;
    players[name.toLowerCase()] = { player: name, photo, points: 0, teams: [] };
  }

  const winVal = scoringMap["MatchWin"] || 0;
  const drawVal = scoringMap["MatchDraw"] || 0;

  for (let i = 1; i < teamRows.length; i++) {
    const row = teamRows[i];
    if (!row || row.length < 2) continue;

    const team = row[0] || "";
    const owner = row[1] || "";
    const stage = row[2] || "Group";
    const wins = Number(row[3]) || 0;
    const draws = Number(row[4]) || 0;
    // 🛑 Grab Losses from column index 5 (6th column in the Google Sheet row)
    const losses = Number(row[5]) || 0;
    // ❌ Elimination flag from column index 6 (column G in the Google Sheet)
    const eliminated = isEliminated(row[6]);

    const ownerKey = owner.toLowerCase();
    if (players[ownerKey]) {
      const matchPoints = (wins * winVal) + (draws * drawVal);
      const stageRows = stageBreakdown(stage, scoringMap);
      const stagePoints = stageRows.reduce((sum, r) => sum + r.points, 0);
      players[ownerKey].points += matchPoints + stagePoints;

      // Pass down losses, elimination status and the cumulative points breakdown
      players[ownerKey].teams.push({
        name: team, wins, draws, losses, eliminated, stage,
        matchPoints, stagePoints, stageRows, total: matchPoints + stagePoints
      });
    }
  }
  return Object.values(players).sort((a, b) => b.points - a.points);
}

function renderLeaderboard(leaderboard) {
  let html = '<div class="leaderboard-grid">';
  leaderboard.forEach((p, i) => {
    const initial = p.player.charAt(0).toUpperCase();
    const avatarHtml = p.photo
      ? `<img class="avatar-photo" src="${p.photo}" alt="${p.player}">`
      : `<div class="avatar-initial">${initial}</div>`;
    
    html += `
      <div class="player-tile">
        <div class="player-header">
          <span class="player-name">${p.player}</span>
          <span class="player-pts">${p.points} pts</span>
        </div>
        <div class="player-teams-row">
          ${avatarHtml}
          <div class="teams-container">
            ${p.teams.map((t, ti) => {
              const code = FLAG_MAP[t.name.toLowerCase()] || "un";
              const flagUrl = `https://flagcdn.com/w40/${code}.png`;

              // ❌ Mark eliminated teams as knocked out
              const badgeClass = t.eliminated ? 'badge eliminated' : 'badge';

              // 🏁 One pill for all: progress for live teams, or ✕ + exit round for eliminated
              const stageLabel = STAGE_LABELS[t.stage] || t.stage || '';
              const stagePill = stageLabel
                ? `<span class="stage-pill${t.eliminated ? ' out' : ''}">${t.eliminated ? '✕ ' : ''}${stageLabel}</span>`
                : '';

              // 🔍 Points breakdown, revealed on click (group match points + cumulative stage bonuses)
              const detailsId = `details-${i}-${ti}`;
              const stageRowsHtml = t.stageRows.map(r =>
                `<div class="detail-row"><span>🏁 ${r.label}</span><span>${r.points} pts</span></div>`
              ).join('');

              return `
                <div class="team-item">
                  <span class="${badgeClass}" onclick="toggleDetails('${detailsId}')">
                    <img class="flag-icon" src="${flagUrl}" alt="${t.name}">
                    <span class="team-label">${t.name}</span>
                    ${stagePill}
                    <span class="expand-caret">▾</span>
                  </span>
                  <div class="badge-details" id="${detailsId}">
                    <div class="detail-row"><span>⚽ Group matches (${t.wins}W ${t.draws}D ${t.losses}L)</span><span>${t.matchPoints} pts</span></div>
                    ${stageRowsHtml}
                    <div class="detail-row total"><span>Total</span><span>${t.total} pts</span></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  return html;
}


function updatePrizePoolUI(playerCount, scoringMap) {
  const total = playerCount * (scoringMap["EntryFee"] || 0);
  document.getElementById("totalPrize").innerText = `£${total}`;
  document.getElementById("prizeWinner").innerText = `£${scoringMap["PrizeWinner"] || 0}`;
  document.getElementById("prizeRunnerUp").innerText = `£${scoringMap["PrizeRunnerUp"] || 0}`;
  document.getElementById("prizeSemi").innerText = `£${scoringMap["PrizeSemiFinalist"] || 0} each`;
  document.getElementById("prizeLast").innerText = `£${scoringMap["PrizeLastPlace"] || 0}`;
}

async function loadData() {
  try {
    const [teams, players, scoring] = await Promise.all([
      fetchCSV(URLS.teams), fetchCSV(URLS.players), fetchCSV(URLS.scoring)
    ]);
    const scoringMap = buildScoringMap(scoring);
    const leaderboard = calculateLeaderboard(players, teams, scoringMap);

    document.getElementById("leaderboard").innerHTML = renderLeaderboard(leaderboard);
    updatePrizePoolUI(leaderboard.length, scoringMap);
    //document.getElementById("lastUpdated").innerText = "Last updated: " + new Date().toLocaleString('en-GB');
  } catch (err) {
    console.error(err);
  }
}

loadData();
setInterval(loadData, 60000);

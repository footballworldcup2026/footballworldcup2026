const SHEET_ID = "179t_fUJ_q0bbwxsiXIQcaxV6YLBv6_cXq8rBbq2i9eg";

const URLS = {
  teams: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Teams`,
  players: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Players`,
  scoring: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Scoring`,
};

// ------------------------------
// SUPER SAFE FETCH (DEBUG ENABLED)
// ------------------------------
async function fetchSheet(url, label) {
  try {
    const res = await fetch(url);
    const text = await res.text();

    if (!text.includes("google.visualization.Query")) {
      throw new Error(`${label} did not return expected JSON wrapper`);
    }

    // Extract JSON part from Google response
    const jsonText = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const json = JSON.parse(jsonText);

    const rows = json.table.rows.map(r =>
      r.c.map(cell => (cell ? cell.v : ""))
    );

    return rows;
  } catch (err) {
    console.error(`❌ ${label} failed`, err);
    return null;
  }
}
// ------------------------------
// SCORING MAP
// ------------------------------
function buildScoringMap(scoringRows) {
  if (!scoringRows) return {};

  const map = {};

  for (let i = 1; i < scoringRows.length; i++) {
    const [stage, points] = scoringRows[i];
    if (!stage) continue;
    map[stage] = Number(points) || 0;
  }

  return map;
}

// ------------------------------
// LEADERBOARD LOGIC
// ------------------------------
function calculateLeaderboard(teams, scoringMap) {
  if (!teams) return [];

  const rows = teams.slice(1);
  const players = {};

  for (const row of rows) {
    const team = row[0];
    const owner = row[1];
    const stage = row[2];

    if (!team || !owner) continue;

    const points = scoringMap[stage] ?? 0;

    if (!players[owner]) {
      players[owner] = {
        player: owner,
        points: 0,
        teams: []
      };
    }

    players[owner].points += points;
    players[owner].teams.push(`${team} (${stage || "Unknown"})`);
  }

  return Object.values(players).sort((a, b) => b.points - a.points);
}

// ------------------------------
// CARD UI
// ------------------------------
function renderLeaderboardCards(leaderboard) {
  if (!leaderboard.length) {
    return `<p style="opacity:0.7">No leaderboard data yet</p>`;
  }

  const maxPoints = Math.max(...leaderboard.map(p => p.points), 1);

  return leaderboard.map((p, i) => {
    const rank = i + 1;

    let statusClass = "red";
    if (rank === 1) statusClass = "gold";
    else if (p.points >= maxPoints * 0.6) statusClass = "green";

    return `
      <div class="player-card ${statusClass}">
        <div class="card-top">
          <div class="rank">#${rank}</div>
          <div class="name">${p.player}</div>
          <div class="points">${p.points} pts</div>
        </div>

        <div class="teams">
          ${p.teams.map(t => `<span class="team-chip">${t}</span>`).join("")}
        </div>
      </div>
    `;
  }).join("");
}

// ------------------------------
// MAIN LOAD
// ------------------------------
async function loadData() {
  const [teams, players, scoring] = await Promise.all([
  fetchSheet(URLS.teams, "Teams"),
  fetchSheet(URLS.players, "Players"),
  fetchSheet(URLS.scoring, "Scoring"),
]);

  console.log("Teams:", teams);
  console.log("Players:", players);
  console.log("Scoring:", scoring);

  // graceful fallback UI
  if (!teams || !scoring) {
    document.getElementById("leaderboard").innerHTML =
      `<p style="color:#ef4444">⚠️ Data failed to load. Check Google Sheet sharing (Anyone with link → Viewer)</p>`;
    return;
  }

  const scoringMap = buildScoringMap(scoring);
  const leaderboard = calculateLeaderboard(teams, scoringMap);

  document.getElementById("leaderboard").innerHTML =
    `<div class="card-grid">${renderLeaderboardCards(leaderboard)}</div>`;

  document.getElementById("lastUpdated").innerText =
    "Last updated: " + new Date().toLocaleString();
}

// ------------------------------
loadData();
setInterval(loadData, 60000);

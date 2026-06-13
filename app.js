const SHEET_ID = "179t_fUJ_q0bbwxsiXIQcaxV6YLBv6_cXq8rBbq2i9eg";

const URLS = {
  teams: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Teams`,
  players: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Players`,
  scoring: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Scoring`,
};

// ---------- SIMPLE CSV PARSER ----------
function parseCSV(text) {
  return text
    .trim()
    .split("\n")
    .map(row => row.split(",").map(cell => cell.replace(/"/g, "").trim()));
}

// ---------- FETCH ----------
async function fetchCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  return parseCSV(text);
}

// ---------- SCORING ----------
function buildScoringMap(scoring) {
  const map = {};
  for (let i = 1; i < scoring.length; i++) {
    const [stage, points] = scoring[i];
    if (stage) map[stage] = Number(points) || 0;
  }
  return map;
}

// ---------- LEADERBOARD ----------
function calculateLeaderboard(teams, scoringMap) {
  const players = {};

  for (let i = 1; i < teams.length; i++) {
    const [team, owner, stage] = teams[i];
    if (!team || !owner) continue;

    const points = scoringMap[stage] || 0;

    if (!players[owner]) {
      players[owner] = {
        player: owner,
        points: 0,
        teams: []
      };
    }

    players[owner].points += points;
    players[owner].teams.push(team);
  }

  return Object.values(players).sort((a, b) => b.points - a.points);
}

// ---------- RENDER ----------
function renderLeaderboard(leaderboard) {
  return leaderboard.map((p, i) => `
    <div class="card">
      <b>#${i + 1} ${p.player}</b> — ${p.points} pts
      <div class="team">
        ${p.teams.join(", ")}
      </div>
    </div>
  `).join("");
}

// ---------- LOAD ----------
async function loadData() {
  try {
    const [teams, players, scoring] = await Promise.all([
      fetchCSV(URLS.teams),
      fetchCSV(URLS.players),
      fetchCSV(URLS.scoring),
    ]);

    const scoringMap = buildScoringMap(scoring);
    const leaderboard = calculateLeaderboard(teams, scoringMap);

    document.getElementById("leaderboard").innerHTML =
      renderLeaderboard(leaderboard);

    document.getElementById("lastUpdated").innerText =
      "Last updated: " + new Date().toLocaleString();

  } catch (err) {
    console.error(err);
    document.getElementById("leaderboard").innerHTML =
      "<p style='color:red'>Failed to load data</p>";
  }
}

loadData();
setInterval(loadData, 60000);

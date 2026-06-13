const SHEET_ID = "179t_fUJ_q0bbwxsiXIQcaxV6YLBv6_cXq8rBbq2i9eg";

const URLS = {
  teams: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Teams`,
  players: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Players`,
  scoring: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Scoring`,
};

// safer CSV parser (handles commas inside quotes)
function parseCSV(text) {
  const lines = text.trim().split("\n");
  return lines.map(line => {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let char of line) {
      if (char === '"' ) {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

async function fetchCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  return parseCSV(text);
}

function tableHTML(rows) {
  return `
    <table>
      ${rows.map(r => `
        <tr>
          ${r.map(c => `<td>${c || ""}</td>`).join("")}
        </tr>
      `).join("")}
    </table>
  `;
}

async function loadData() {
  try {
    const [teams, players, scoring] = await Promise.all([
      fetchCSV(URLS.teams),
      fetchCSV(URLS.players),
      fetchCSV(URLS.scoring),
    ]);

    // Leaderboard logic (still basic for now)
    const leaderboard = players.slice(1).map(p => {
      const name = p[0];
      return [name, "0 pts"];
    });

    document.getElementById("teams").innerHTML = tableHTML(teams);
    document.getElementById("scoring").innerHTML = tableHTML(scoring);

    document.getElementById("leaderboard").innerHTML = tableHTML([
      ["Player", "Points"],
      ...leaderboard
    ]);

    document.getElementById("lastUpdated").innerText =
      "Last updated: " + new Date().toLocaleString();

  } catch (err) {
    console.error(err);
    document.getElementById("leaderboard").innerHTML =
      "<p>⚠️ Error loading sheet — check sharing is set to 'Anyone with link (Viewer)'</p>";
  }
}

loadData();
setInterval(loadData, 60000);

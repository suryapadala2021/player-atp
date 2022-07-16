const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
module.exports = app;
const initServerAndDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`server started successfully`);
    });
  } catch (e) {
    console.log(`${e.message}`);
    process.exit(1);
  }
};
initServerAndDatabase();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
    SELECT
      *
    FROM
      cricket_team;`;
  const playerArray = await db.all(getPlayerQuery);
  let newArr = playerArray.map(convertDbObjectToResponseObject);
  response.send(newArr);
});
app.post("/players/", async (request, response) => {
  let playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
    INSERT INTO 
    cricket_team (player_name,jersey_number,role) 
    VALUES
    ('${playerName}',
     ${jerseyNumber},
     '${role}');`;
  await db.run(updatePlayerQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
       player_id=${playerId}`;
  const playerDetails = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(playerDetails));
});
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  let playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const getPlayerQuery = `
    UPDATE
        cricket_team
    SET
       player_name='${playerName}',
       jersey_number=${jerseyNumber},
       role='${role}'
    WHERE
       player_id=${playerId};`;
  await db.run(getPlayerQuery);
  response.send(`Player Details Updated`);
});
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    DELETE
    FROM
      cricket_team
    WHERE
       player_id=${playerId}`;
  await db.run(getPlayerQuery);
  response.send(`Player Removed`);
});

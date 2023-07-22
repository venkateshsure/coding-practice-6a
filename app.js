const express = require("express");

const app = express();

app.use(express.json());

const sqlite = require("sqlite");

const sqlite3 = require("sqlite3");

const path = require("path");

const filePath = path.join(__dirname, "covid19India.db");

let db = null;

const dbServer = async () => {
  db = await sqlite.open({
    filename: filePath,
    driver: sqlite3.Database,
  });
  app.listen(3000);
};

dbServer();

app.get("/states/", async (req, res) => {
  const query = `
        SELECT * FROM state;`;
  const response = await db.all(query);
  res.send(response);
});

//api on get on stateId

app.get("/states/:stateId/", async (req, res) => {
  const { stateId } = req.params;
  const query = `
           SELECT * FROM state
             WHERE state_id=${stateId};`;
  const response = await db.get(query);
  res.send(response);
});

app.get("/districts/", async (req, res) => {
  const query = `
        SELECT * FROM district;`;
  const response = await db.all(query);
  res.send(response);
});

//api on post

app.post("/districts/", async (req, res) => {
  const body = req.body;
  const { districtName, stateId, cases, cured, active, deaths } = body;

  const query = `
       INSERT INTO district
        (district_name,state_id,cases,cured,active,deaths)
        values
        ('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;
  const response = await db.run(query);
  res.send("District Successfully Added");
});

//api on put

app.get("/districts/:districtId/", async (req, res) => {
  const { districtId } = req.params;
  const query = `
          SELECT * FROM district
          WHERE district_id=${districtId};`;
  const response = await db.all(query);
  res.send(response);
});

//api delete  on district table

app.delete("/districts/:districtId/", async (req, res) => {
  const { districtId } = req.params;
  const query = `
       DELETE FROM district
       WHERE district_id=${districtId};`;
  const response = await db.run(query);
  res.send("District Removed");
});

//api put on district

app.put("/districts/:districtId/", async (req, res) => {
  const { districtId } = req.params;
  const requestBody = req.body;
  const { districtName, stateId, cases, cured, active, deaths } = requestBody;
  const query = `
          UPDATE district SET
              district_name='${districtName}',
              state_id=${stateId},
              cases=${cases},
              cured=${cured},
              active=${active},
              deaths=${deaths}
              WHERE district_id=${districtId};`;
  const response = db.run(query);
  res.send("District Details Updated");
});

//api get districts to get statistics

app.get("/states/:stateId/stats/", async (req, res) => {
  const { stateId } = req.params;
  const query = `
            SELECT sum(cases) as "totalCases",sum(cured) as  "totalCured",sum(active) as "totalActive",sum(deaths) as "totalDeaths" FROM district 
            WHERE 
            state_id=${stateId}; 
         `;
  const response = await db.all(query);
  console.log(response);
  res.send(response);
});

/*
{
  totalCases: 724355,
  totalCured: 615324,
  totalActive: 99254,
  totalDeaths: 9777
}*/

//api to get state based on district id

app.get("/districts/:districtId/details/", async (req, res) => {
  const { districtId } = req.params;

  const query = `
             SELECT state.state_name FROM state INNER JOIN district ON state.state_id=district.state_id  WHERE state.state_id=${districtId}
             ;`;
  const response = await db.get(query);
  //console.log(response);
  res.send(response);
});

module.exports = app;

const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

// Create a new SQLite3 database in memory
const db = new sqlite3.Database(":memory:");

// Create a table 'data' if it doesn't exist
db.serialize(() => {
  // Create Simulations table
  db.run(`CREATE TABLE IF NOT EXISTS Simulations (
    simulation_id INTEGER PRIMARY KEY,
    simulation_name TEXT,
    config_id INTEGER,
    generation TEXT,
    simulation_steps TEXT,
    FOREIGN KEY(config_id) REFERENCES Configurations(config_id)
  )`);

  // Create Configurations table
  db.run(`CREATE TABLE IF NOT EXISTS Configurations (
    config_id INTEGER PRIMARY KEY,
    config_name TEXT,
    config_data TEXT,
  )`);

  // Create Organisms table
  db.run(`CREATE TABLE IF NOT EXISTS Organisms (
    organism_id INTEGER PRIMARY KEY,
    simulation_id INTEGER,
    coordinates_id INTEGER,
    genome_id INTEGER,
    FOREIGN KEY(simulation_id) REFERENCES Simulations(simulation_id),
    FOREIGN KEY(coordinates_id) REFERENCES Coordinates(coordinates_id)
    FOREIGN KEY(genome_id) REFERENCES Genomes(genome_id)
  )`);

  // Create Coordinates table
  db.run(`CREATE TABLE IF NOT EXISTS Coordinates (
    coordinates_id INTEGER PRIMARY KEY,
    x_coordinate INTEGER,
    y_coordinate INTEGER
  )`);

  // Create Genomes table
  db.run(`CREATE TABLE IF NOT EXISTS Genomes (
    genome_id INTEGER PRIMARY KEY,
    genes TEXT,
  )`);

  db.run(
    `INSERT INTO Simulations (simulation_name, simulation_config, other_info) VALUES (?, ?, ?)`,
    ["Simulation 1", JSON.stringify({ name: "test" }), "Other info"]
  );
});

// Read data from the database
app.get("/simulations", (req, res) => {
  db.all("SELECT * FROM simulations", (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(rows);
    }
  });
});

// Write data to the database
app.post("/write", express.json(), (req, res) => {
  const { info } = req.body;
  db.run("INSERT INTO data (info) VALUES (?)", [info], function (err) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json({ message: "Data added successfully", id: this.lastID });
    }
  });
});

// Update data in the database
app.put("/update/:id", express.json(), (req, res) => {
  const { id } = req.params;
  const { info } = req.body;
  db.run("UPDATE data SET info = ? WHERE id = ?", [info, id], function (err) {
    if (err) {
      res.status(500).send(err.message);
    } else if (this.changes === 0) {
      res.status(404).json({ message: "Data not found" });
    } else {
      res.json({ message: "Data updated successfully", changes: this.changes });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

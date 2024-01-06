const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "user",
  password: "utcp",
  database: "evolution_simulator",
});

connection.connect((error) => {
  if (error) {
    console.error("There was an error connecting to the database: ", error);
    return;
  } else {
    console.log("Successfully connected to the database!");
  }
});

module.exports = connection;

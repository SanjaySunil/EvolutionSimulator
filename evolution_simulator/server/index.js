const express = require("express");
const db = require("./db");

const app = express();

app.get("data", (req, res) => {
  db.query("SELECT * FROM data", (error, data) => {
    if (error) {
      console.error("There was an error retrieving the data: ", error);
      res.status(500).send("There was an error retrieving the data.");
    } else {
      res.json(data);
    }
  });
});

const PORT = process.env.port || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

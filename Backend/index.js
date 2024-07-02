const { findAvailablePort } = require("./freePort.js");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();

app.use(express.json());

const db = new sqlite3.Database("tickets.db", (err) => {
  if (err) {
    console.error("Error abriendo la BD:", err.message);
  } else {
    console.log("Conectado a la BD SQLITE");
    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS tickets (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,description TEXT NOT NULL, status TEXT DEFAULT 'open', comentario TEXT)`,
        (err) => {
          if (err) {
            console.log("Error creando tabla:", err.message);
          } else {
            console.log("Tabla creada");
          }
        }
      );
    });
  }
});

app.get("/", (req, res) => {
  res.send("OKAY!");
});

app.post("/tickets", (req, res) => {
  const { title, description } = req.body;
  db.run(
    `INSERT INTO tickets (title, description) VALUES (?,?)`,
    [title, description],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.get("/tickets", (req, res) => {
  db.all(`SELECT * FROM tickets`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ tickets: rows });
  });
});

app.put("/tickets/:id", (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  db.run(
    `UPDATE tickets SET status = ? WHERE id = ?`,
    [status, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ updatedID: this.changes });
    }
  );
});

app.post("/tickets/:id/comentario", (req, res) => {
  const { comentario } = req.body;
  const { id } = req.params;

  db.run(
    `UPDATE tickets SET comentario = ? WHERE id = ?`,
    [comentario, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ updatedID: this.changes });
    }
  );
});

app.delete("/tickets/:id", (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM tickets WHERE id = ?`, id, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ deletedID: this.changes });
  });
});

function eliminarTabla() {
  db.run(`DROP TABLE IF EXISTS tickets`, function (err) {
    if (err) {
      console.error("Error al eliminar la tabla 'tickets':", err.message);
      return;
    }
    console.log("¡KAGUABUNGA!!!!");
  });
}


findAvailablePort(3000)
  .then((port) => {
    app.listen(port, () => {
      console.log(`Corriendo en el puerto ${port}`);
    });
  })
  .catch((err) => {
    console.error("Error para encontrar un puerto:", err);
  });

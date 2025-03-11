const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const dbPath = path.join(__dirname, "charity.db"); // Relative to backend root
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Error opening SQLite database:", err);
  else console.log("Connected to SQLite database");
});

const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `
        CREATE TABLE IF NOT EXISTS members (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL
        )
      `,
        (err) => {
          if (err) {
            console.error("Error creating members table:", err);
            return reject(err);
          }
          console.log("Members table created");
        }
      );

      db.run(
        `
        CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          member_id TEXT NOT NULL,
          month TEXT NOT NULL,
          amount REAL NOT NULL,
          year INTEGER NOT NULL,
          FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
        )
      `,
        (err) => {
          if (err) {
            console.error("Error creating payments table:", err);
            return reject(err);
          }
          console.log("Payments table created");
        }
      );

      db.run(
        `
        CREATE TABLE IF NOT EXISTS yearly_extras (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          year INTEGER NOT NULL,
          amount REAL NOT NULL
        )
      `,
        (err) => {
          if (err) {
            console.error("Error creating yearly_extras table:", err);
            return reject(err);
          }
          console.log("Yearly_extras table created");
          resolve();
        }
      );
    });
  });
};
const saveMember = async (id, name) => {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT OR REPLACE INTO members (id, name) VALUES (?, ?)",
      [id, name],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};

const deleteMember = async (id) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("DELETE FROM payments WHERE member_id = ?", [id], (err) => {
        if (err) return reject(err);
      });
      db.run("DELETE FROM members WHERE id = ?", [id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

const savePayment = async (memberId, month, amount, year) => {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT OR REPLACE INTO payments (member_id, month, amount, year) VALUES (?, ?, ?, ?)",
      [memberId, month, amount, year],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};

const saveYearlyExtra = async (year, amount) => {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO yearly_extras (year, amount) VALUES (?, ?)",
      [year, amount],
      (err) => {
        if (err) return reject(err);
        console.log(`Saved yearly extra: year=${year}, amount=${amount}`);
        resolve();
      }
    );
  });
};

const loadMembersWithPayments = async (year) => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM members", [], (err, members) => {
      if (err) return reject(err);
      db.all(
        "SELECT * FROM payments WHERE year = ?",
        [year],
        (err, payments) => {
          if (err) return reject(err);
          db.all(
            "SELECT amount FROM yearly_extras WHERE year = ?",
            [year],
            (err, extras) => {
              if (err) return reject(err);
              const yearlyExtra =
                extras.reduce((sum, extra) => sum + extra.amount, 0) || 0;
              const result = {
                members: members.map((member) => ({
                  ...member,
                  payments: payments
                    .filter((p) => p.member_id === member.id)
                    .reduce((acc, p) => ({ ...acc, [p.month]: p.amount }), {}),
                })),
                yearlyExtra,
              };
              resolve(result);
            }
          );
        }
      );
    });
  });
};
initDatabase().catch((err) => console.error("DB Init Error:", err));

module.exports = {
  initDatabase,
  saveMember,
  deleteMember,
  savePayment,
  saveYearlyExtra,
  loadMembersWithPayments,
};

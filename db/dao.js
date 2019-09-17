const sqlite3 = require('sqlite3');
const Promise = require('bluebird');

class AppDAO {
  constructor(dbFilePath) {
    this.db = new sqlite3.Database(dbFilePath, (err) => {
      if (err) {
        console.log('Could not connect to database', err);
      } else {
        console.log('Connected to database');
      }
    })
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          console.log('Error running sql ' + sql)
          console.log(err)
          reject(err)
        } else {
          resolve({ id: this.lastID })
        }
      })
    })
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.log('Error running sql: ' + sql);
          console.log(err);
          reject(err);
        } else {
          resolve(rows);
        }
      })
    })
  }

  createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id INTEGER)
    `;
    return this.run(sql);
  }

  delete(id) {
    return this.run(
      `DELETE FROM users WHERE id = ?`,
      [id]
    );
  }

  async addUser(chat_id) {
    const allUsers = await this.getAllUsers();

    let found = false;
    for (const user of allUsers) {
      if (user.chat_id === chat_id) {
        found = true;
      }
    }

    if (!found) { 
      const sql = `
        INSERT INTO users (chat_id) VALUES (?)
      `;
      return this.run(sql, [chat_id]);
    }
  }

  getAllUsers() {
    return this.all(`SELECT * FROM users`);
  }
}

module.exports = AppDAO;
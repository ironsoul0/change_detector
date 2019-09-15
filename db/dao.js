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
      chat_id TEXT)
    `;
    return this.run(sql);
  }

  addUser(chat_id) {
    const sql = `
      INSERT INTO users (chat_id) VALUES (?)
    `;
    return this.run(sql, [chat_id]);
  }

  getAllUsers() {
    return this.all(`SELECT * FROM users`);
  }
}

module.exports = AppDAO;
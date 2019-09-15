require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');

const AppDAO = require('./db/dao');
const bloomberg = require('./helpers/bloomberg');
const google = require('./helpers/google');

async function main() {
  const db = new AppDAO('./database.sqlite3');
  await db.createTable();

  const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true
  });

  bot.onText(/start/, async (msg) => {
    const chatId = msg.chat.id;
    await db.addUser(chatId);
  });

  bloomberg(bot, db);
  //google(bot, db);
}

main();
require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const AppDAO = require('./db/dao');
const InternshipsNotifier = require('./helpers/notifier');
const getBloomberg = require('./helpers/bloomberg');
const getGoogle = require('./helpers/google');

async function main() {
  setInterval(() => {
    axios.get(`https://internship-detector.glitch.me`);
  }, 280000);

  const db = new AppDAO('./database.sqlite3');
  await db.createTable();

  const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true
  });

  bot.onText(/start/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'You are in, bro! Stay tuned 😎');
    await db.addUser(chatId);
  });

  bot.onText(/bloomberg/, async (msg) => {
    const chatId = msg.chat.id;
    const bloombergInternships = await getBloomberg();
    bot.sendMessage(chatId, bloombergInternships.join('\n'));
  });

  bot.onText(/google/, async (msg) => {
    const chatId = msg.chat.id;
    const googleInternships = await getGoogle();
    bot.sendMessage(chatId, googleInternships.join('\n'));
  });

  const bloombergNotifier = new InternshipsNotifier('Bloomberg', bot, db, getBloomberg);
  const googleNotifier = new InternshipsNotifier('Google', bot, db, getGoogle);
  
  bloombergNotifier.start();
  googleNotifier.start();
}

main();
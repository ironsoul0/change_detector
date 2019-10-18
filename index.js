require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const AppDAO = require('./db/dao');
const InternshipsNotifier = require('./helpers/notifier');
const getBloomberg = require('./helpers/bloomberg');
const getGoogle = require('./helpers/google');
const getGoogleApply = require('./helpers/googleApply');

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
    console.log(await db.getAllUsers());
  });

  bot.onText(/bloomberg/, async (msg) => {
    const chatId = msg.chat.id;
    const bloombergInternships = await getBloomberg();
    bot.sendMessage(chatId, bloombergInternships.join('\n'));
  });

  bot.onText(/google/, async (msg) => {
    const chatId = msg.chat.id;
    const googleInternships = await getGoogleApply();
    bot.sendMessage(chatId, googleInternships.join('\n'));
  });

  // bot.onText(/bye/, async (msg) => {
  //   const message = 'Internships are finally open, so it is probably time to say goodbye 😭 (Hi, Nurda)\nBot will continue to work but feel free to unsubscribe.\n\nI would be really pleased if you give this bot a star on GitHub.\n\nHope everyone will find an internship he wants ❤️\n\nhttps://github.com/ironsoul0/change_detector'

  //   const allUsers = await db.getAllUsers();
  //   for (const user of allUsers) {
  //     bot.sendMessage(user.chat_id, message);
  //   }
  // });

  const bloombergNotifier = new InternshipsNotifier('Bloomberg', bot, db, getBloomberg);
  const googleNotifier = new InternshipsNotifier('Google', bot, db, getGoogle);
  const googleApplyNotifier = new InternshipsNotifier('Google (Apply was opened)', bot, db, getGoogleApply, 2);
  
  bloombergNotifier.start();
  googleNotifier.start();
  googleApplyNotifier.start();
}

main();
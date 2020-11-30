/* eslint-disable no-console, camelcase */
require('dotenv').config();
const { Telegraf } = require('telegraf');

const firebase = require('firebase');
require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const usersRef = db.collection('users');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.use(Telegraf.log());

const init = async () => {
  const me = await bot.telegram.getMe();
  bot.options.username = me.username;
  console.log(`Initialized with nickname ${me.username}!`);
};

const initWithUserId = async ({ id, first_name }) => {
  console.log(id, first_name);
};

const main = async () => {
  await init();

  bot.start(async (ctx) => {
    const { first_name, id } = ctx.update.message.from;
    ctx.reply(`Welcome ${first_name}!`);

    const snapshot = await usersRef.where('id', '==', id).get();
    if (snapshot.empty) {
      ctx.reply(`Initialising a new user.`);
      console.log(`[INFO] Initialising a new user with id: ${id}.`);
      try {
        await initWithUserId({ id, first_name });
        ctx.reply(`✅ Done.`);
        console.log('[INFO] User initialised!');
      } catch (e) {
        ctx.reply(`❌ Could not initialise. Please contact admins!`);
        console.error('[ERROR] Initialisation failed with: ', e);
      }
    } else {
      ctx.reply(`Already initialised.`);
    }
  });

  bot.launch();
};

main();

module.exports = bot;

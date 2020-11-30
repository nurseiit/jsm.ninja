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
  console.log(`Initialized bot with nickname ${me.username}!`);
};

const initWithUserId = async ({ id, first_name }) => {
  await usersRef.doc(`${id}`).set({
    booksStatus: [],
    name: first_name,
    isAdmin: false,
    totalReadPages: 0,
  });
};

const numbersRegExp = new RegExp(/\d/g);

const inputErrMsg = `💥 BOOM... 🔩☠🔧🔨⚡️
Hmm, that wasn't supposed to happen. You didn't input invalid characters, or did you?
`;

const main = async () => {
  await init();

  bot.start(async (ctx) => {
    const { first_name, id } = ctx.update.message.from;
    ctx.reply(`Welcome ${first_name}!`);

    try {
      const user = await usersRef.doc(`${id}`).get();
      if (!user.exists) {
        ctx.reply(`Initialising a new user.`);
        console.log(`[INFO] Initialising a new user with id: ${id}.`);
        await initWithUserId({ id, first_name });
        ctx.reply(`✅ Done.`);
        console.log('[INFO] User initialised!');
      } else {
        ctx.reply(`Already initialised.`);
      }
    } catch (e) {
      ctx.reply(`❌ Could not initialise. Please contact admins!`);
      console.error('[ERROR] Initialisation failed with: ', e);
    }
  });

  bot.hears(numbersRegExp, async (ctx) => {
    try {
      const pages = +ctx.message.text;
      if (pages < 0) {
        ctx.reply(inputErrMsg);
      } else {
        const { id } = ctx.update.message.from;
        const userRef = usersRef.doc(`${id}`);
        const user = await userRef.get();
        const totalReadPages = user.data().totalReadPages + pages;
        await userRef.update({
          totalReadPages,
        });
        ctx.reply(
          `👍 Updated. You've read a total of ${totalReadPages} pages!`
        );
      }
    } catch (e) {
      ctx.reply('❌ Could not update. Please, try again!');
      console.error('[ERROR] Update pages failed with: ', e);
    }
  });

  bot.launch();
};

main();

module.exports = bot;

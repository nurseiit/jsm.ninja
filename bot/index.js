/* eslint-disable no-console, camelcase */
require('dotenv').config();
const { Telegraf } = require('telegraf');

const firebase = require('firebase');
require('firebase/firestore');

const startOfDay = require('date-fns/startOfDay');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const usersRef = db.collection('users');
const booksRef = db.collection('books');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.use(Telegraf.log());

const init = async () => {
  const me = await bot.telegram.getMe();
  bot.options.username = me.username;
  console.log(`Initialized bot with nickname ${me.username}!`);
};

const initWithUserId = async ({ id, first_name }) => {
  await usersRef.doc(`${id}`).set({
    finishedBookIds: [],
    name: first_name,
    isAdmin: false,
    totalReadPages: 0,
  });
};

const getTodayId = async ({ id }) => {
  const today = startOfDay(new Date());
  const historyRef = usersRef.doc(`${id}`).collection('history');
  const snapshot = await historyRef.where('date', '>', today).get();

  if (snapshot.empty) {
    console.log('[INFO] No matching date found in user history.');
    console.log('[INFO] Creating a new field.');
    const doc = await historyRef.add({
      date: new Date(),
      pages: 0,
    });
    console.log('[INFO] Created history field with id: ', doc.id);
    return doc.id;
  }

  return snapshot.docs.map((doc) => doc.id)[0];
};

const getBook = async ({ bookId }) => {
  const snapshot = await booksRef.where('id', '==', bookId).get();
  return snapshot.empty ? null : snapshot.docs[0].data();
};

const getTotalReadPages = async ({ id }) => {
  const historyRef = usersRef.doc(`${id}`).collection('history');
  const snapshot = await historyRef.get();
  return snapshot.docs
    .map((doc) => doc.data().pages)
    .reduce((a, b) => a + b, 0);
};

const numbersRegExp = new RegExp(/^\d+$/);

const commandsInfo = `ℹ️ Командалар

1. Оқыған беттер санын жіберіңіз, мен статистикаға қосамын:
  👤: 69
  🤖: 👍 Сақтадым. Бүгін 69 бет оқыпсыз.

2. /finish ID деп кітап оқып біткенде жазасыз:
  👤: /finish 1
  🤖: ✅ Мақұл, #1 "Как привести дела в порядок?" кітапты бітірдіңіз деп сақтадым.

3. Кітаптардың тізімін /books командасынан біле аласыз.

4. Бүгінгі күннің статистикасын тазалау үшін: /resetToday
`;

const inputErrMsg = `💥 Өләә... 🔩☠🔧🔨⚡️
Бұндай болмау керек сияқты еді. Қате зат жазбадыңыз ғой?!
`;

const main = async () => {
  await init();

  bot.start(async (ctx) => {
    const { first_name, id } = ctx.update.message.from;
    ctx.reply(`Сәлем ${first_name}!`);

    try {
      const user = await usersRef.doc(`${id}`).get();
      if (!user.exists) {
        ctx.reply(`Жаңа қолданушыны базаға сақтаудамын.`);
        console.log(`[INFO] Initialising a new user with id: ${id}.`);
        await initWithUserId({ id, first_name });
        ctx.reply(`✅ Болды.`);
        console.log('[INFO] User initialised!');
      } else {
        ctx.reply(`Базада бар екенсіз.`);
      }

      ctx.reply(commandsInfo);
    } catch (e) {
      ctx.reply(
        `❌ Қате болды мынау! Админдерге [@nurseiit] хабарлассаңыз дұрыс ау.`
      );
      console.error('[ERROR] Initialisation failed with: ', e);
    }
  });

  bot.hears(numbersRegExp, async (ctx) => {
    try {
      const pages = +ctx.message.text;
      // eslint-disable-next-line no-restricted-globals
      if (pages < 0 || typeof pages !== 'number' || isNaN(pages)) {
        ctx.reply(inputErrMsg);
      } else {
        const { id } = ctx.update.message.from;
        const userRef = usersRef.doc(`${id}`);

        const todayId = await getTodayId({ id });
        const todayRef = userRef.collection('history').doc(todayId);
        const today = await todayRef.get();
        const todayPages = today.data().pages;
        await todayRef.update({
          pages: todayPages + pages,
        });

        console.log('[INFO] Updated user history pages.');

        const totalReadPages = await getTotalReadPages({ id });
        await userRef.update({
          totalReadPages,
        });

        console.log('[INFO] Updated user totalReadPages.');

        ctx.reply(`👍 Сақтадым. Бүгін ${todayPages + pages} бет оқыпсыз.`);
        setTimeout(
          () => ctx.reply(`Барлығы ${totalReadPages} бет екен 💪!`),
          50
        );
      }
    } catch (e) {
      ctx.reply('❌ Сақтай алмадым. Тағы да жазып көр!');
      console.error('[ERROR] Update pages failed with: ', e);
    }
  });

  bot.command('books', async ({ reply }) => {
    const books = await booksRef.get();

    const allBooks = books.docs
      .map((book) => book.data())
      .sort((a, b) => a.id - b.id)
      .map(({ id, name, pages }) => `${id}. ${name} - ${pages} бет.`)
      .join('\n');

    reply(allBooks);
  });

  bot.command('finish', async (ctx) => {
    try {
      const { id } = ctx.update.message.from;

      if (ctx.message.text.split(' ').length < 2)
        throw Error('argument not provided');

      const bookId = +ctx.message.text.split(' ')[1];

      const book = await getBook({ bookId });

      if (!book) {
        ctx.reply(
          `❌ Нөмірі ${bookId} деген кітап жоқ. Кітаптардың тізімін /books командасынан біле аласың.`
        );
        return;
      }

      const userRef = await usersRef.doc(`${id}`);
      const user = await userRef.get();

      const { finishedBookIds } = user.data();
      if (finishedBookIds.includes(bookId)) {
        ctx.reply(`☑️ Бұл кітапты оқып қойдым деп айтып қойыпсың ғо.`);
      } else {
        userRef.update({
          finishedBookIds: [...finishedBookIds, bookId].sort((a, b) => a - b),
        });
        ctx.reply(
          `✅ Мақұл, #${bookId} "${book.name}" кітапты бітірдің деп сақтадым.`
        );
      }
    } catch (e) {
      ctx.reply(inputErrMsg);
      console.error('[ERROR] Book update failed with: ', e);
    }
  });

  bot.command('resetToday', async (ctx) => {
    try {
      const { id } = ctx.update.message.from;
      const userRef = usersRef.doc(`${id}`);

      const todayId = await getTodayId({ id });
      const todayRef = userRef.collection('history').doc(todayId);
      const today = await todayRef.get();
      const todayPages = today.data().pages;
      await todayRef.update({
        pages: 0,
      });

      console.log('[INFO] Reset today pages.');

      const totalReadPages = await getTotalReadPages({ id });
      await userRef.update({
        totalReadPages,
      });

      console.log('[INFO] Updated total read pages after reset.');

      ctx.reply(`👍 Бүгінгі статистиканы [${todayPages} бет] тазаладым.`);
      setTimeout(() => ctx.reply(`Енді барлығы ${totalReadPages} бет 💪!`), 50);
    } catch (e) {
      ctx.reply('❌ Сақтай алмадым. Тағы да жазып көр!');
      console.error('[ERROR] Reset today failed with: ', e);
    }
  });

  bot.command('help', ({ reply }) => reply(commandsInfo));

  bot.launch();
};

main();

module.exports = bot;

/* eslint-disable no-console */
require('dotenv').config();

const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.use(Telegraf.log());

const init = async () => {
  const me = await bot.telegram.getMe();
  bot.options.username = me.username;
  console.log(`Initialized with nickname ${me.username}!`);
};

const main = async () => {
  await init();

  bot.start((ctx) => {
    const { username } = ctx.update.message.from;
    ctx.reply(`Welcome @${username} ❤️!`);
  });

  bot.launch();
};

main();

module.exports = bot;

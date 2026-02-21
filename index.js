require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

// ====== TOKEN TELEGRAM ======
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true,
});

// ====== DATABASE SEDERHANA ======
let users = {};

// ====== START ======
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🔥 KESRYA AI 🔥\n\nKetik /menu untuk lihat fitur"
  );
});

// ====== MENU ======
bot.onText(/\/menu/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "📜 MENU:\n\n/profile\n/daily\n/premium"
  );
});

// ====== PROFILE ======
bot.onText(/\/profile/, (msg) => {
  const id = msg.from.id;

  if (!users[id]) {
    users[id] = {
      level: 1,
      xp: 0,
      coin: 0,
      limit: 10,
      premium: false,
    };
  }

  const user = users[id];

  bot.sendMessage(
    msg.chat.id,
    `⭐ Level: ${user.level}
💰 Coin: ${user.coin}
🎟 Limit: ${user.limit}
💎 Premium: ${user.premium ? "YA" : "TIDAK"}`
  );
});

// ====== DAILY ======
bot.onText(/\/daily/, (msg) => {
  const id = msg.from.id;

  if (!users[id]) {
    users[id] = {
      level: 1,
      xp: 0,
      coin: 0,
      limit: 10,
      premium: false,
    };
  }

  users[id].coin += 50;

  bot.sendMessage(msg.chat.id, "🎁 Kamu dapat 50 coin!");
});

// ====== AI CHAT ======
bot.on("message", async (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;

  if (!text || text.startsWith("/")) return;

  const id = msg.from.id;

  if (!users[id]) {
    users[id] = {
      level: 1,
      xp: 0,
      coin: 0,
      limit: 10,
      premium: false,
    };
  }

  if (users[id].limit <= 0) {
    return bot.sendMessage(chatId, "❌ Limit habis.");
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Kamu adalah KESRYA AI, asisten keren dan pintar." },
          { role: "user", content: text }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    users[id].limit -= 1;
    users[id].xp += 10;

    if (users[id].xp >= 100) {
      users[id].level += 1;
      users[id].xp = 0;
      bot.sendMessage(chatId, "🎉 LEVEL UP!");
    }

    bot.sendMessage(chatId, reply);

  } catch (err) {
    console.log(err.response?.data || err.message);
    bot.sendMessage(chatId, "⚠️ AI Error.");
  }
});

console.log("KESRYA AI aktif 🚀");

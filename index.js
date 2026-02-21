require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

let users = {};

function getUser(id) {
  if (!users[id]) {
    users[id] = {
      limit: 10,
      premium: false,
      coin: 0,
      level: 1,
      exp: 0
    };
  }
  return users[id];
}

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  if (!text) return;

  const user = getUser(userId);

  if (text === "/start") {
    return bot.sendMessage(chatId,
`🔥 KESRYA AI 🔥

Ketik /menu untuk lihat fitur`
    );
  }

  if (text === "/menu") {
    return bot.sendMessage(chatId,
`📜 MENU:
/profile
/daily
/premium`
    );
  }

  if (text === "/profile") {
    return bot.sendMessage(chatId,
`⭐ Level: ${user.level}
💰 Coin: ${user.coin}
🎟 Limit: ${user.limit}
💎 Premium: ${user.premium ? "YA" : "TIDAK"}`
    );
  }

  if (text === "/daily") {
    user.coin += 50;
    return bot.sendMessage(chatId, "🎁 Kamu dapat 50 coin!");
  }

  if (!user.premium) {
    if (user.limit <= 0) {
      return bot.sendMessage(chatId, "❌ Limit habis! Upgrade premium.");
    }
    user.limit--;
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Kamu adalah KESRYA AI yang santai dan keren." },
          { role: "user", content: text }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    user.exp += 10;
    if (user.exp >= 100) {
      user.level++;
      user.exp = 0;
      bot.sendMessage(chatId, "🎉 LEVEL UP!");
    }

    bot.sendMessage(chatId, reply);

  } catch (err) {
    bot.sendMessage(chatId, "⚠️ AI Error.");
  }
});

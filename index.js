const { Client, GatewayIntentBits } = require("discord.js");
const OpenAI = require("openai");
const express = require("express"); 
require("dotenv").config();

// Setup OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Setup Discord bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Restrict to this channel only
const ALLOWED_CHANNEL_ID = "1276625871368880298"; // ✅ Your channel ID

// Typing speed: milliseconds per character
const TYPING_SPEED = 60; 
const MAX_TYPING_DURATION = 10000; 
const MIN_MESSAGE_LENGTH = 3; 

// Regex to check for letters/numbers (ignore messages that are only emojis or symbols)
const meaningfulTextRegex = /[a-zA-Z0-9]/;

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== ALLOWED_CHANNEL_ID) return;

  if (
    message.content.length < MIN_MESSAGE_LENGTH ||
    !meaningfulTextRegex.test(message.content)
  )
    return;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful and friendly Discord chatbot." },
        { role: "user", content: message.content },
      ],
    });

    const reply = response.choices[0].message.content;

    if (reply) {
      await message.channel.sendTyping();
      const typingDuration = Math.min(
        Math.max(1000, reply.length * TYPING_SPEED),
        MAX_TYPING_DURATION
      );

      await new Promise((resolve) => setTimeout(resolve, typingDuration));
      await message.channel.send(reply);
    }
  } catch (err) {
    console.error("❌ Error:", err);
    await message.channel.send("Oops, something went wrong!");
  }
});

// --- Simple Express server on port 10000 ---
const app = express();
const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("✅ Bot is running!");
});

app.listen(PORT, () => {
  console.log(`🌐 Web server listening on port ${PORT}`);
});

// Login Discord bot
client.login(process.env.DISCORD_TOKEN); 

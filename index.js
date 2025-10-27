import express from "express";
import dotenv from "dotenv";
import { Client, Intents } from "discord.js";
import OpenAI from "openai";

dotenv.config();

// --- Setup Express (for keep-alive pinging) ---
const app = express();

app.get("/", (req, res) => {
  res.send("✅ Bot is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Express server listening on port ${PORT}`));

// --- Setup Discord Client ---
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Show typing indicator
  await message.channel.sendTyping();

  // Random delay (0–5 seconds)
  const delay = Math.floor(Math.random() * 5000);
  await new Promise((resolve) => setTimeout(resolve, delay));

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a friendly, helpful Discord chatbot." },
        { role: "user", content: message.content }
      ],
      max_tokens: 150
    });

    const reply = completion.choices[0].message.content.trim();
    await message.reply(reply);
  } catch (err) {
    console.error("❌ Error:", err);
    await message.reply("⚠️ Sorry, something went wrong while thinking!");
  }
});

client.login(process.env.DISCORD_TOKEN);

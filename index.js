import express from "express";
import dotenv from "dotenv";
import { Client, Intents } from "discord.js";
import OpenAI from "openai";

dotenv.config();

// --- Express keep-alive server ---
const app = express();
app.get("/", (req, res) => res.send("✅ Bot is running!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Server listening on port ${PORT}`));

// --- Discord client setup ---
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Only reply if mentioned or prefixed
  if (!message.content.startsWith("!ask") && !message.mentions.has(client.user)) return;

  const userInput = message.content
    .replace("!ask", "")
    .replace(`<@!${client.user.id}>`, "")
    .trim();

  if (!userInput) return;

  await message.channel.sendTyping();

  // Random delay (3–5 seconds)
  const delay = 3000 + Math.floor(Math.random() * 2000);
  await new Promise((resolve) => setTimeout(resolve, delay));

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a friendly, helpful Discord chatbot." },
        { role: "user", content: userInput },
      ],
      max_tokens: 150,
    });

    const reply = completion.choices[0].message.content.trim();
    await message.reply(reply);
  } catch (err) {
    console.error("❌ Error generating reply:", err.response?.data || err.message || err);
    await message.reply("⚠️ Sorry, something went wrong while thinking!");
  }
});

client.login(process.env.DISCORD_TOKEN);

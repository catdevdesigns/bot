import { Client, Intents } from "discord.js";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // Show typing indicator
  await message.channel.sendTyping();

  // Simulate thinking delay (0–5 sec)
  const delay = Math.floor(Math.random() * 5000);
  await new Promise(resolve => setTimeout(resolve, delay));

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // fast and cheap ChatGPT model
      messages: [
        { role: "system", content: "You are a helpful and friendly Discord chatbot." },
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

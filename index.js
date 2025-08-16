const { Client, GatewayIntentBits } = require("discord.js");
const OpenAI = require("openai");
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
const ALLOWED_CHANNEL_ID = "YOUR_CHANNEL_ID_HERE";

// Typing speed: milliseconds per character
const TYPING_SPEED = 60; // adjust for faster/slower typing
const MAX_TYPING_DURATION = 10000; // max 10 seconds
const MIN_MESSAGE_LENGTH = 3; // ignore very short messages

// Regex to check for letters/numbers (ignore messages that are only emojis or symbols)
const meaningfulTextRegex = /[a-zA-Z0-9]/;

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== ALLOWED_CHANNEL_ID) return;

  // Ignore very short messages or messages without meaningful text
  if (message.content.length < MIN_MESSAGE_LENGTH || !meaningfulTextRegex.test(message.content)) return;

  try {
    // Send user message to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful and friendly Discord chatbot." },
        { role: "user", content: message.content },
      ],
    });

    const reply = response.choices[0].message.content;

    if (reply) {
      // Start typing indicator
      await message.channel.sendTyping();

      // Calculate typing duration based on reply length, capped at MAX_TYPING_DURATION
      const typingDuration = Math.min(Math.max(1000, reply.length * TYPING_SPEED), MAX_TYPING_DURATION);

      await new Promise((resolve) => setTimeout(resolve, typingDuration));

      // Send the reply
      await message.channel.send(reply);
    }
  } catch (err) {
    console.error("❌ Error:", err);
    await message.channel.send("Oops, something went wrong!");
  }
});

client.login(process.env.DISCORD_TOKEN);

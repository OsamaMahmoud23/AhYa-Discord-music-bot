require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { readdirSync } = require('fs');
const { join } = require('path');
const config = require('./config');
const { createPlayer } = require('./player/player');
const { registerEventHandlers } = require('./handlers/eventHandlers');

// ── Validate required env vars ───────────────────────────────────────
const required = ['DISCORD_TOKEN', 'CLIENT_ID'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

// ── Create Discord Client ────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

// ── Load Commands ────────────────────────────────────────────────────
client.commands = new Collection();
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter((f) => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    console.log(`📦 Loaded command: /${command.data.name}`);
  } else {
    console.warn(`⚠️  Skipping ${file}: missing 'data' or 'execute'`);
  }
}

// ── Initialize DisTube Player ────────────────────────────────────────
client.distube = createPlayer(client);
console.log('🎵 DisTube player initialized');

// ── Register Event Handlers ──────────────────────────────────────────
registerEventHandlers(client);

// ── Login ────────────────────────────────────────────────────────────
client.login(config.token).catch((err) => {
  console.error('❌ Failed to login:', err.message);
  process.exit(1);
});

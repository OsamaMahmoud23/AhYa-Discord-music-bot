require('dotenv').config();
const { REST, Routes } = require('discord.js');
const { readdirSync } = require('fs');
const { join } = require('path');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
  console.error('❌ DISCORD_TOKEN and CLIENT_ID are required in .env');
  process.exit(1);
}

const commands = [];
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter((f) => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(join(commandsPath, file));
  if (command.data) {
    commands.push(command.data.toJSON());
    console.log(`📦 Queued: /${command.data.name}`);
  }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`\n🔄 Deploying ${commands.length} slash command(s)...`);

    if (guildId) {
      // Guild-specific (instant, good for testing)
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log(`✅ Successfully deployed to guild: ${guildId}`);
    } else {
      // Global (takes up to 1 hour to propagate)
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log('✅ Successfully deployed globally (may take up to 1 hour to appear)');
    }
  } catch (err) {
    console.error('❌ Failed to deploy commands:', err);
    process.exit(1);
  }
})();

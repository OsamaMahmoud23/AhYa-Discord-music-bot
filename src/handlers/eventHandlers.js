const { Events, ActivityType, MessageFlags } = require('discord.js');
const { handleMusicButton } = require('./buttonHandler');

/**
 * Registers all Discord event handlers on the client.
 * @param {import('discord.js').Client} client
 */
function registerEventHandlers(client) {

  // ── Ready ────────────────────────────────────────────────────────
  client.on(Events.ClientReady, () => {
    console.log(`\n✅ AH_YA is online! Logged in as ${client.user.tag}`);
    console.log(`📡 Serving ${client.guilds.cache.size} server(s)`);

    client.user.setActivity('🎵 /play to start the music!', {
      type: ActivityType.Listening,
    });
  });

  // ── Interaction Create ───────────────────────────────────────────
  client.on(Events.InteractionCreate, async (interaction) => {
    // Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        return interaction.reply({
          content: '❌ Unknown command.',
          flags: MessageFlags.Ephemeral,
        });
      }

      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(`[Command Error] /${interaction.commandName}:`, err);
        const replyMethod = interaction.deferred || interaction.replied ? 'editReply' : 'reply';
        await interaction[replyMethod]({
          content: `❌ An error occurred while running this command: ${err.message}`,
          flags: MessageFlags.Ephemeral,
        }).catch(() => {});
      }
    }

    // Button Interactions
    if (interaction.isButton()) {
      if (interaction.customId.startsWith('music_')) {
        await handleMusicButton(interaction);
      }
    }
  });

  // ── Voice State Update ────────────────────────────────────────────
  // Handles edge case: if everyone leaves the channel, stop the bot
  client.on(Events.VoiceStateUpdate, (oldState, newState) => {
    const queue = client.distube.getQueue(oldState.guild.id);
    if (!queue) return;

    const botVoiceChannel = oldState.guild.members.me?.voice?.channel;
    if (!botVoiceChannel) return;

    // If the bot itself was disconnected externally
    if (oldState.member?.id === client.user.id && !newState.channelId) {
      try {
        queue.stop();
      } catch (_) {}
      return;
    }

    // If voice channel is now empty (only bot remains), DisTube handles it via leaveOnEmpty
  });

  // ── Error ────────────────────────────────────────────────────────
  client.on(Events.Error, (err) => {
    console.error('[Discord Client Error]', err);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('[Unhandled Rejection]', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('[Uncaught Exception]', err);
  });
}

module.exports = { registerEventHandlers };

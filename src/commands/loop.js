const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { buildErrorEmbed, buildSuccessEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Set loop mode for the queue')
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('Loop mode to set')
        .setRequired(true)
        .addChoices(
          { name: '🔁 Loop Song', value: '1' },
          { name: '🔁 Loop Queue', value: '2' },
          { name: '❌ Disable Loop', value: '0' }
        )
    ),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);
    const mode = parseInt(interaction.options.getString('mode'));

    if (!queue) {
      return interaction.reply({
        embeds: [buildErrorEmbed('Nothing is playing right now!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!interaction.member?.voice?.channel) {
      return interaction.reply({
        embeds: [buildErrorEmbed('You must be in a voice channel!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      queue.setRepeatMode(mode);
      const modeText = mode === 1 ? '🔁 Looping current song' : mode === 2 ? '🔁 Looping entire queue' : '❌ Loop disabled';
      await interaction.reply({ embeds: [buildSuccessEmbed(modeText)] });
    } catch (err) {
      console.error('[/loop]', err);
      await interaction.reply({
        embeds: [buildErrorEmbed(`Error: ${err.message}`)],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

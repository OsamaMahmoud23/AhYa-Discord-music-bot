const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { buildErrorEmbed, buildSuccessEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause or resume the current song'),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);

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
      if (queue.paused) {
        queue.resume();
        await interaction.reply({ embeds: [buildSuccessEmbed('▶️ Resumed playback!')] });
      } else {
        queue.pause();
        await interaction.reply({ embeds: [buildSuccessEmbed('⏸️ Paused playback!')] });
      }
    } catch (err) {
      console.error('[/pause]', err);
      await interaction.reply({
        embeds: [buildErrorEmbed(`Error: ${err.message}`)],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

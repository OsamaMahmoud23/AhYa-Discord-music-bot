const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { buildErrorEmbed, buildSuccessEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song')
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Number of songs to skip (default: 1)')
        .setMinValue(1)
        .setRequired(false)
    ),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);
    const amount = interaction.options.getInteger('amount') || 1;

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

    if (queue.songs.length <= 1 && !queue.autoplay) {
      return interaction.reply({
        embeds: [buildErrorEmbed('No songs left in the queue to skip to!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      if (amount === 1) {
        await queue.skip();
        await interaction.reply({ embeds: [buildSuccessEmbed('⏭️ Skipped to the next song!')] });
      } else {
        // Skip multiple songs by jumping ahead in queue
        const skipCount = Math.min(amount - 1, queue.songs.length - 1);
        queue.songs.splice(1, skipCount);
        await queue.skip();
        await interaction.reply({ embeds: [buildSuccessEmbed(`⏭️ Skipped ${amount} songs!`)] });
      }
    } catch (err) {
      console.error('[/skip]', err);
      await interaction.reply({
        embeds: [buildErrorEmbed(`Error: ${err.message}`)],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

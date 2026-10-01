const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { buildErrorEmbed, buildSuccessEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the current queue'),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);

    if (!queue) {
      return interaction.reply({
        embeds: [buildErrorEmbed('Nothing is playing right now!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (queue.songs.length <= 2) {
      return interaction.reply({
        embeds: [buildErrorEmbed('Not enough songs in queue to shuffle!')],
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
      await queue.shuffle();
      await interaction.reply({ embeds: [buildSuccessEmbed(`🔀 Shuffled ${queue.songs.length - 1} songs in the queue!`)] });
    } catch (err) {
      console.error('[/shuffle]', err);
      await interaction.reply({
        embeds: [buildErrorEmbed(`Error: ${err.message}`)],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

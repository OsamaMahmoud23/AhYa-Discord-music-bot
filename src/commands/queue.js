const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { buildQueueEmbed, buildErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the current song queue')
    .addIntegerOption((option) =>
      option
        .setName('page')
        .setDescription('Page number of the queue')
        .setMinValue(1)
        .setRequired(false)
    ),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);

    if (!queue || queue.songs.length === 0) {
      return interaction.reply({
        embeds: [buildErrorEmbed('The queue is empty!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.reply({ embeds: [buildQueueEmbed(queue)] });
  },
};

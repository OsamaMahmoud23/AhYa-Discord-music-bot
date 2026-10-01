const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { buildErrorEmbed, buildSuccessEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoplay')
    .setDescription('Toggle autoplay — automatically adds related songs when queue ends'),

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
      const newState = queue.toggleAutoplay();
      await interaction.reply({
        embeds: [buildSuccessEmbed(`♾️ Autoplay is now **${newState ? 'ON ✅' : 'OFF ❌'}**`)],
      });
    } catch (err) {
      console.error('[/autoplay]', err);
      await interaction.reply({
        embeds: [buildErrorEmbed(`Error: ${err.message}`)],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

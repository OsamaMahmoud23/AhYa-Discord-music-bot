const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { buildErrorEmbed, buildNowPlayingEmbed, buildControlButtons } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show info about the currently playing song'),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);

    if (!queue || !queue.songs[0]) {
      return interaction.reply({
        embeds: [buildErrorEmbed('Nothing is playing right now!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const song = queue.songs[0];
    const embed = buildNowPlayingEmbed(song, queue, {
      isPaused: queue.paused,
      loopMode: queue.repeatMode,
      autoplay: queue.autoplay,
    });
    const buttons = buildControlButtons({
      isPaused: queue.paused,
      loopMode: queue.repeatMode,
      autoplay: queue.autoplay,
    });

    await interaction.reply({ embeds: [embed], components: buttons });
  },
};

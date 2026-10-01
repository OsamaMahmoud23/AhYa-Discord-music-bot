const { SlashCommandBuilder } = require('discord.js');
const { buildErrorEmbed, buildLyricsEmbed } = require('../utils/embeds');
const { fetchLyrics, chunkLyrics } = require('../utils/lyrics');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Show lyrics for the current or a specified song')
    .addStringOption((option) =>
      option
        .setName('song')
        .setDescription('Song name to search lyrics for (defaults to currently playing song)')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const customQuery = interaction.options.getString('song');
    let title = customQuery;
    let artist = '';

    // If no custom query, use the currently playing song
    if (!customQuery) {
      const queue = interaction.client.distube.getQueue(interaction.guildId);
      if (!queue || !queue.songs[0]) {
        return interaction.editReply({
          embeds: [buildErrorEmbed('Nothing is playing and no song was specified!')],
        });
      }
      title = queue.songs[0].name;
      artist = queue.songs[0].uploader?.name || '';
    }

    const { lyrics, url, title: foundTitle, error } = await fetchLyrics(title, artist);

    if (error && !lyrics) {
      return interaction.editReply({
        embeds: [buildErrorEmbed(`Could not fetch lyrics: ${error}`)],
      });
    }

    if (!lyrics) {
      return interaction.editReply({
        embeds: [buildErrorEmbed(`No lyrics found for **${title}**. Try a different search query.`)],
      });
    }

    const chunks = chunkLyrics(lyrics);
    const totalPages = chunks.length;

    // Send first page
    await interaction.editReply({
      embeds: [buildLyricsEmbed(foundTitle || title, chunks[0], url, 1, totalPages)],
    });

    // Send remaining pages as follow-up messages
    for (let i = 1; i < chunks.length; i++) {
      await interaction.followUp({
        embeds: [buildLyricsEmbed(foundTitle || title, chunks[i], url, i + 1, totalPages)],
      });
    }
  },
};

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { buildErrorEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song or playlist from YouTube or Spotify')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Song name, YouTube URL, or Spotify URL')
        .setRequired(true)
    ),

  async execute(interaction) {
    const query = interaction.options.getString('query');
    const member = interaction.member;
    const voiceChannel = member?.voice?.channel;
    const distube = interaction.client.distube;

    if (!voiceChannel) {
      return interaction.reply({
        embeds: [buildErrorEmbed('You must be in a voice channel to play music!')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const botMember = interaction.guild.members.me;
    const permissions = voiceChannel.permissionsFor(botMember);
    if (!permissions.has('Connect') || !permissions.has('Speak')) {
      return interaction.reply({
        embeds: [buildErrorEmbed("I don't have permission to join or speak in your voice channel!")],
        flags: MessageFlags.Ephemeral,
      });
    }

    // Acknowledge immediately — Discord requires a response within 3 seconds
    await interaction.reply({
      embeds: [{
        color: 0x5865F2,
        description: `🔎 Searching for **${query}**...`,
      }],
    });

    try {
      await distube.play(voiceChannel, query, {
        member,
        textChannel: interaction.channel,
        skip: false,
      });

      // Delete the "searching..." message — playSong event sends the real embed
      await interaction.deleteReply().catch(() => {});
    } catch (err) {
      console.error('[/play]', err);
      await interaction.editReply({
        embeds: [buildErrorEmbed(`Failed to play: ${err.message}`)],
      }).catch(() => {});
    }
  },
};

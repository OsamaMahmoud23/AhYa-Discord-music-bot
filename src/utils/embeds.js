const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config');

/**
 * Formats milliseconds to mm:ss or hh:mm:ss
 */
function formatDuration(ms) {
  if (!ms || ms === Infinity) return '🔴 LIVE';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Builds a simple progress bar string.
 */
function buildProgressBar(current, total, length = 15) {
  if (!total || total === Infinity) return '──────────────●';
  const progress = Math.min(current / total, 1);
  const filled = Math.round(progress * length);
  const bar = '▬'.repeat(filled) + '🔘' + '▬'.repeat(length - filled);
  return bar;
}

/**
 * Builds the "Now Playing" embed.
 * @param {import('distube').Song} song - DisTube Song object
 * @param {import('distube').Queue} queue - DisTube Queue object
 * @param {object} options
 * @param {boolean} [options.isPaused]
 * @param {number} [options.loopMode] - 0=off, 1=song, 2=queue
 * @param {boolean} [options.autoplay]
 * @returns {EmbedBuilder}
 */
function buildNowPlayingEmbed(song, queue, options = {}) {
  const { isPaused = false, loopMode = 0, autoplay = false } = options;

  const currentTime = queue?.currentTime ?? 0;
  const duration = song.duration * 1000 || 0;
  const progressBar = buildProgressBar(currentTime * 1000, duration);

  const loopText = loopMode === 1 ? '🔁 Song' : loopMode === 2 ? '🔁 Queue' : '❌ Off';
  const autoplayText = autoplay ? '✅ On' : '❌ Off';
  const statusText = isPaused ? '⏸ Paused' : '▶️ Playing';

  const embed = new EmbedBuilder()
    .setColor(config.colors.primary)
    .setAuthor({
      name: '🎵 Now Playing',
      iconURL: 'https://cdn.discordapp.com/emojis/1234567890.gif', // placeholder, replace with your icon
    })
    .setTitle(song.name || 'Unknown Title')
    .setURL(song.url || null)
    .setThumbnail(song.thumbnail || null)
    .addFields(
      {
        name: '⏱ Duration',
        value: `\`${formatDuration(currentTime * 1000)}\` / \`${formatDuration(duration)}\``,
        inline: true,
      },
      {
        name: '👤 Requested by',
        value: song.member ? `<@${song.member.id}>` : 'Unknown',
        inline: true,
      },
      {
        name: '🎤 Artist',
        value: song.uploader?.name || 'Unknown',
        inline: true,
      },
      {
        name: '📋 Queue',
        value: queue?.songs?.length > 1
          ? `${queue.songs.length - 1} song(s) remaining`
          : 'No songs in queue',
        inline: true,
      },
      {
        name: '🔁 Loop',
        value: loopText,
        inline: true,
      },
      {
        name: '♾️ Autoplay',
        value: autoplayText,
        inline: true,
      },
      {
        name: '\u200B',
        value: `${statusText}\n\`${progressBar}\``,
        inline: false,
      }
    )
    .setFooter({
      text: `Song By: ${song.uploader?.name || 'Unknown'} • Volume: ${queue?.volume ?? 50}%`,
      iconURL: song.member?.user?.displayAvatarURL() || null,
    })
    .setTimestamp();

  return embed;
}

/**
 * Builds the control buttons row (2 rows of 5 buttons each).
 * @param {object} state
 * @param {boolean} state.isPaused
 * @param {number} state.loopMode  - 0=off, 1=song, 2=queue
 * @param {boolean} state.autoplay
 * @returns {ActionRowBuilder[]}
 */
function buildControlButtons(state = {}) {
  const { isPaused = false, loopMode = 0, autoplay = false } = state;

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('music_back')
      .setLabel('BACK')
      .setEmoji('⏮️')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('music_rewind')
      .setLabel('REWIND')
      .setEmoji('⏪')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('music_pause')
      .setLabel(isPaused ? 'RESUME' : 'PAUSE')
      .setEmoji(isPaused ? '▶️' : '⏸️')
      .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId('music_forward')
      .setLabel('FORWARD')
      .setEmoji('⏩')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('music_skip')
      .setLabel('SKIP')
      .setEmoji('⏭️')
      .setStyle(ButtonStyle.Secondary),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('music_loop')
      .setLabel(loopMode === 1 ? 'LOOP: SONG' : loopMode === 2 ? 'LOOP: QUEUE' : 'LOOP')
      .setEmoji('🔁')
      .setStyle(loopMode > 0 ? ButtonStyle.Success : ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('music_replay')
      .setLabel('REPLAY')
      .setEmoji('🔄')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('music_stop')
      .setLabel('STOP')
      .setEmoji('⏹️')
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId('music_autoplay')
      .setLabel('AUTOPLAY')
      .setEmoji('♾️')
      .setStyle(autoplay ? ButtonStyle.Success : ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('music_shuffle')
      .setLabel('SHUFFLE')
      .setEmoji('🔀')
      .setStyle(ButtonStyle.Secondary),
  );

  return [row1, row2];
}

/**
 * Builds the queue embed showing current song + upcoming songs.
 * @param {import('distube').Queue} queue
 * @returns {EmbedBuilder}
 */
function buildQueueEmbed(queue) {
  if (!queue || queue.songs.length === 0) {
    return new EmbedBuilder()
      .setColor(config.colors.warning)
      .setTitle('📋 Queue List')
      .setDescription('The queue is empty!')
      .setTimestamp();
  }

  const current = queue.songs[0];
  const upcoming = queue.songs.slice(1, 11); // show up to 10 upcoming

  let description = `**Now Playing:**\n🎵 [${current.name}](${current.url}) \`${formatDuration(current.duration * 1000)}\` — <@${current.member?.id || 'Unknown'}>\n\n`;

  if (upcoming.length > 0) {
    description += '**Up Next:**\n';
    upcoming.forEach((song, index) => {
      description += `\`${index + 1}.\` [${song.name}](${song.url}) \`${formatDuration(song.duration * 1000)}\` — <@${song.member?.id || 'Unknown'}>\n`;
    });
  }

  if (queue.songs.length > 11) {
    description += `\n_...and ${queue.songs.length - 11} more song(s)_`;
  }

  return new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle('📋 Queue List')
    .setDescription(description)
    .setFooter({ text: `Total songs: ${queue.songs.length} | Loop: ${queue.repeatMode === 1 ? 'Song' : queue.repeatMode === 2 ? 'Queue' : 'Off'}` })
    .setTimestamp();
}

/**
 * Builds an error embed.
 * @param {string} message
 * @returns {EmbedBuilder}
 */
function buildErrorEmbed(message) {
  return new EmbedBuilder()
    .setColor(config.colors.error)
    .setTitle('❌ Error')
    .setDescription(message)
    .setTimestamp();
}

/**
 * Builds a success embed.
 * @param {string} message
 * @returns {EmbedBuilder}
 */
function buildSuccessEmbed(message) {
  return new EmbedBuilder()
    .setColor(config.colors.success)
    .setTitle('✅ Success')
    .setDescription(message)
    .setTimestamp();
}

/**
 * Builds a lyrics embed.
 * @param {string} songTitle
 * @param {string} lyricsChunk
 * @param {string} url
 * @param {number} page
 * @param {number} totalPages
 * @returns {EmbedBuilder}
 */
function buildLyricsEmbed(songTitle, lyricsChunk, url, page = 1, totalPages = 1) {
  return new EmbedBuilder()
    .setColor(config.colors.music)
    .setTitle(`📝 Lyrics: ${songTitle}`)
    .setURL(url || null)
    .setDescription(lyricsChunk)
    .setFooter({ text: totalPages > 1 ? `Page ${page}/${totalPages}` : 'Powered by Genius' })
    .setTimestamp();
}

module.exports = {
  buildNowPlayingEmbed,
  buildControlButtons,
  buildQueueEmbed,
  buildErrorEmbed,
  buildSuccessEmbed,
  buildLyricsEmbed,
  formatDuration,
};

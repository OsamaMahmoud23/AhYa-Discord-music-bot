const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const config = require('../config');
const { buildNowPlayingEmbed, buildControlButtons, buildErrorEmbed } = require('../utils/embeds');

// Tell DisTube/ffmpeg where the binary is
if (config.ffmpegPath && config.ffmpegPath !== 'ffmpeg') {
  process.env.FFMPEG_PATH = config.ffmpegPath;
  // Also set for fluent-ffmpeg which DisTube uses internally
  try {
    const ffmpeg = require('fluent-ffmpeg');
    ffmpeg.setFfmpegPath(config.ffmpegPath);
  } catch (_) {}
}

/**
 * Initializes and returns a configured DisTube instance.
 * @param {import('discord.js').Client} client
 * @returns {DisTube}
 */
function createPlayer(client) {
  const distube = new DisTube(client, {
    plugins: [
      new SpotifyPlugin(),
      new YtDlpPlugin({ update: false }),
    ],
    emitNewSongOnly: false,
    savePreviousSongs: true,
  });

  // ── Event: playSong ──────────────────────────────────────────────
  distube.on('playSong', async (queue, song) => {
    const embed = buildNowPlayingEmbed(song, queue, {
      isPaused: false,
      loopMode: queue.repeatMode,
      autoplay: queue.autoplay,
    });
    const buttons = buildControlButtons({
      isPaused: false,
      loopMode: queue.repeatMode,
      autoplay: queue.autoplay,
    });

    try {
      const msg = await queue.textChannel?.send({
        embeds: [embed],
        components: buttons,
      });
      queue.nowPlayingMessage = msg;
    } catch (err) {
      console.error('[Player] Failed to send playSong embed:', err.message);
    }
  });

  // ── Event: addSong ───────────────────────────────────────────────
  distube.on('addSong', async (queue, song) => {
    if (queue.songs.length > 1) {
      try {
        await queue.textChannel?.send({
          embeds: [{
            color: config.colors.success,
            title: '✅ Added to Queue',
            description: `🎵 **[${song.name}](${song.url})**\nPosition: #${queue.songs.length - 1}`,
            thumbnail: { url: song.thumbnail },
            footer: { text: `Requested by ${song.member?.user?.tag || 'Unknown'}` },
            timestamp: new Date().toISOString(),
          }],
        });
      } catch (err) {
        console.error('[Player] Failed to send addSong embed:', err.message);
      }
    }
  });

  // ── Event: addList ───────────────────────────────────────────────
  distube.on('addList', async (queue, playlist) => {
    try {
      await queue.textChannel?.send({
        embeds: [{
          color: config.colors.success,
          title: '✅ Playlist Added',
          description: `📋 **${playlist.name}** — ${playlist.songs.length} songs added to queue`,
          thumbnail: { url: playlist.thumbnail },
          footer: { text: `Requested by ${playlist.member?.user?.tag || 'Unknown'}` },
          timestamp: new Date().toISOString(),
        }],
      });
    } catch (err) {
      console.error('[Player] Failed to send addList embed:', err.message);
    }
  });

  // ── Event: finish ────────────────────────────────────────────────
  distube.on('finish', async (queue) => {
    try {
      await queue.textChannel?.send({
        embeds: [{
          color: config.colors.warning,
          title: '📋 Queue Finished',
          description: 'The queue has ended. Add more songs with `/play`!',
          timestamp: new Date().toISOString(),
        }],
      });
      queue.nowPlayingMessage = null;
    } catch (err) {
      console.error('[Player] Failed to send finish embed:', err.message);
    }
  });

  // ── Event: disconnect ────────────────────────────────────────────
  distube.on('disconnect', async (queue) => {
    try {
      await queue.textChannel?.send({
        embeds: [{
          color: config.colors.error,
          title: '🔌 Disconnected',
          description: 'Left the voice channel.',
          timestamp: new Date().toISOString(),
        }],
      });
    } catch (err) {
      console.error('[Player] Failed to send disconnect embed:', err.message);
    }
  });

  // ── Event: empty ─────────────────────────────────────────────────
  distube.on('empty', async (queue) => {
    try {
      await queue.textChannel?.send({
        embeds: [{
          color: config.colors.warning,
          title: '👤 Voice Channel Empty',
          description: 'The voice channel is empty. Leaving soon...',
          timestamp: new Date().toISOString(),
        }],
      });
    } catch (err) {
      console.error('[Player] Failed to send empty embed:', err.message);
    }
  });

  // ── Event: error ─────────────────────────────────────────────────
  distube.on('error', async (error, queue, song) => {
    console.error('[DisTube Error]', error);
    try {
      await queue?.textChannel?.send({
        embeds: [buildErrorEmbed(`An error occurred: ${error.message}`)],
      });
    } catch (err) {
      console.error('[Player] Failed to send error embed:', err.message);
    }
  });

  return distube;
}

module.exports = { createPlayer };

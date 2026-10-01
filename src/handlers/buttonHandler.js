const { MessageFlags } = require('discord.js');
const { buildErrorEmbed, buildNowPlayingEmbed, buildControlButtons } = require('../utils/embeds');

/**
 * Handles all music button interactions.
 * Button custom IDs: music_back, music_rewind, music_pause,
 *                   music_forward, music_skip, music_loop,
 *                   music_replay, music_stop, music_autoplay, music_shuffle
 */
async function handleMusicButton(interaction) {
  const { customId, guildId, member } = interaction;
  const distube = interaction.client.distube;
  const queue = distube.getQueue(guildId);

  // Check if user is in a voice channel
  if (!member?.voice?.channel) {
    return interaction.reply({
      embeds: [buildErrorEmbed('You must be in a voice channel to use controls!')],
      flags: MessageFlags.Ephemeral,
    });
  }

  if (!queue) {
    return interaction.reply({
      embeds: [buildErrorEmbed('Nothing is playing right now!')],
      flags: MessageFlags.Ephemeral,
    });
  }

  await interaction.deferUpdate();

  try {
    switch (customId) {
      // ── BACK ─────────────────────────────────────────────────────
      case 'music_back': {
        if (queue.previousSongs?.length === 0) {
          return interaction.followUp({
            embeds: [buildErrorEmbed('No previous songs to go back to!')],
            flags: MessageFlags.Ephemeral,
          });
        }
        await queue.previous();
        break;
      }

      // ── REWIND (seeks back 10 seconds) ───────────────────────────
      case 'music_rewind': {
        const newTime = Math.max(0, queue.currentTime - 10);
        await queue.seek(newTime);
        await interaction.followUp({
          embeds: [{ color: 0x5865F2, description: '⏪ Rewound 10 seconds', timestamp: new Date().toISOString() }],
          flags: MessageFlags.Ephemeral,
        });
        break;
      }

      // ── PAUSE / RESUME ────────────────────────────────────────────
      case 'music_pause': {
        if (queue.paused) {
          queue.resume();
        } else {
          queue.pause();
        }
        // Update the embed and buttons to reflect new state
        await updateNowPlayingMessage(queue);
        break;
      }

      // ── FORWARD (seeks forward 10 seconds) ───────────────────────
      case 'music_forward': {
        const song = queue.songs[0];
        const newTime = Math.min(queue.currentTime + 10, (song.duration || 0) - 1);
        await queue.seek(Math.max(0, newTime));
        await interaction.followUp({
          embeds: [{ color: 0x5865F2, description: '⏩ Fast-forwarded 10 seconds', timestamp: new Date().toISOString() }],
          flags: MessageFlags.Ephemeral,
        });
        break;
      }

      // ── SKIP ──────────────────────────────────────────────────────
      case 'music_skip': {
        if (queue.songs.length <= 1 && !queue.autoplay) {
          return interaction.followUp({
            embeds: [buildErrorEmbed('No songs left to skip to!')],
            flags: MessageFlags.Ephemeral,
          });
        }
        await queue.skip();
        break;
      }

      // ── LOOP (cycles: off → song → queue → off) ──────────────────
      case 'music_loop': {
        const nextMode = (queue.repeatMode + 1) % 3;
        queue.setRepeatMode(nextMode);
        await updateNowPlayingMessage(queue);
        await interaction.followUp({
          embeds: [{
            color: 0x57F287,
            description: nextMode === 1 ? '🔁 Now looping the current song' : nextMode === 2 ? '🔁 Now looping the entire queue' : '❌ Loop disabled',
            timestamp: new Date().toISOString(),
          }],
          flags: MessageFlags.Ephemeral,
        });
        break;
      }

      // ── REPLAY (seek to beginning of current song) ───────────────
      case 'music_replay': {
        await queue.seek(0);
        await interaction.followUp({
          embeds: [{ color: 0x5865F2, description: '🔄 Replaying from the beginning!', timestamp: new Date().toISOString() }],
          flags: MessageFlags.Ephemeral,
        });
        break;
      }

      // ── STOP ──────────────────────────────────────────────────────
      case 'music_stop': {
        await queue.stop();
        // Disable all buttons on the embed
        if (queue.nowPlayingMessage) {
          try {
            await queue.nowPlayingMessage.edit({ components: [] });
          } catch (_) {}
        }
        break;
      }

      // ── AUTOPLAY ──────────────────────────────────────────────────
      case 'music_autoplay': {
        const state = queue.toggleAutoplay();
        await updateNowPlayingMessage(queue);
        await interaction.followUp({
          embeds: [{
            color: 0x57F287,
            description: `♾️ Autoplay is now **${state ? 'ON ✅' : 'OFF ❌'}**`,
            timestamp: new Date().toISOString(),
          }],
          flags: MessageFlags.Ephemeral,
        });
        break;
      }

      // ── SHUFFLE ───────────────────────────────────────────────────
      case 'music_shuffle': {
        if (queue.songs.length <= 2) {
          return interaction.followUp({
            embeds: [buildErrorEmbed('Not enough songs in queue to shuffle!')],
            flags: MessageFlags.Ephemeral,
          });
        }
        await queue.shuffle();
        await interaction.followUp({
          embeds: [{
            color: 0x57F287,
            description: `🔀 Shuffled ${queue.songs.length - 1} songs in the queue!`,
            timestamp: new Date().toISOString(),
          }],
          flags: MessageFlags.Ephemeral,
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`[ButtonHandler] Error handling ${customId}:`, err.message);
    await interaction.followUp({
      embeds: [buildErrorEmbed(`Error: ${err.message}`)],
      flags: MessageFlags.Ephemeral,
    }).catch(() => {});
  }
}

/**
 * Updates the stored "Now Playing" message with current queue state.
 * @param {import('distube').Queue} queue
 */
async function updateNowPlayingMessage(queue) {
  if (!queue.nowPlayingMessage) return;
  const song = queue.songs[0];
  if (!song) return;

  try {
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
    await queue.nowPlayingMessage.edit({ embeds: [embed], components: buttons });
  } catch (err) {
    console.error('[ButtonHandler] Failed to update now playing message:', err.message);
  }
}

module.exports = { handleMusicButton };

require('dotenv').config();

// Set FFmpeg path before anything else if provided
if (process.env.FFMPEG_PATH) {
  process.env.FFMPEG_PATH = process.env.FFMPEG_PATH;
}

module.exports = {
  // Discord
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID || null,

  // FFmpeg path (for systems where ffmpeg isn't in PATH)
  ffmpegPath: process.env.FFMPEG_PATH || 'ffmpeg',

  // Spotify
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  },

  // Genius Lyrics
  geniusToken: process.env.GENIUS_API_TOKEN,

  // Player defaults
  player: {
    defaultVolume: parseInt(process.env.DEFAULT_VOLUME) || 50,
    maxQueueSize: parseInt(process.env.MAX_QUEUE_SIZE) || 100,
    leaveOnEmptyCooldown: parseInt(process.env.LEAVE_ON_EMPTY_COOLDOWN) || 30000,
    leaveOnFinishCooldown: parseInt(process.env.LEAVE_ON_FINISH_COOLDOWN) || 30000,
    // Audio quality & buffering (helps with latency on free hosting)
    ytdlOptions: {
      quality: 'highestaudio',
      highWaterMark: 1 << 25, // 32MB buffer
      dlChunkSize: 0,
    },
  },

  // Embed colors
  colors: {
    primary: 0x5865F2,   // Discord blurple
    success: 0x57F287,   // Green
    warning: 0xFEE75C,   // Yellow
    error: 0xED4245,     // Red
    music: 0x1DB954,     // Spotify green
  },

  // Emojis used in embeds
  emojis: {
    play: '▶️',
    pause: '⏸️',
    stop: '⏹️',
    skip: '⏭️',
    back: '⏮️',
    loop: '🔁',
    shuffle: '🔀',
    autoplay: '♾️',
    replay: '🔄',
    rewind: '⏪',
    forward: '⏩',
    music: '🎵',
    queue: '📋',
    lyrics: '📝',
    volume: '🔊',
    loading: '⏳',
    cd: '💿',
  },
};

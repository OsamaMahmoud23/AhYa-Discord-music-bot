const { getLyrics, searchSong } = require('genius-lyrics-api');
const config = require('../config');

/**
 * Fetches lyrics for a given song title and artist.
 * Falls back to title-only search if artist+title returns nothing.
 * @param {string} title - Song title
 * @param {string} [artist] - Artist name (optional)
 * @returns {Promise<{lyrics: string|null, url: string|null, title: string|null}>}
 */
async function fetchLyrics(title, artist = '') {
  if (!config.geniusToken) {
    return { lyrics: null, url: null, title: null, error: 'No Genius API token configured.' };
  }

  try {
    // Clean up title (remove things like "[Official Video]", "(Lyrics)", etc.)
    const cleanTitle = title
      .replace(/\(.*?\)/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/official|video|lyrics|audio|hd|hq|4k|mv/gi, '')
      .trim();

    const searchOptions = {
      apiKey: config.geniusToken,
      title: cleanTitle,
      artist: artist,
      optimizeQuery: true,
    };

    const songs = await searchSong(searchOptions);

    if (!songs || songs.length === 0) {
      // Try without artist
      if (artist) {
        const fallback = await searchSong({
          apiKey: config.geniusToken,
          title: cleanTitle,
          artist: '',
          optimizeQuery: true,
        });
        if (!fallback || fallback.length === 0) {
          return { lyrics: null, url: null, title: null };
        }
        const lyricsText = await getLyrics(fallback[0].url);
        return {
          lyrics: lyricsText,
          url: fallback[0].url,
          title: fallback[0].title,
        };
      }
      return { lyrics: null, url: null, title: null };
    }

    const lyricsText = await getLyrics(songs[0].url);
    return {
      lyrics: lyricsText,
      url: songs[0].url,
      title: songs[0].title,
    };
  } catch (err) {
    console.error('[Lyrics] Error fetching lyrics:', err.message);
    return { lyrics: null, url: null, title: null, error: err.message };
  }
}

/**
 * Splits lyrics into Discord-safe chunks (max 4096 chars per embed description).
 * @param {string} lyrics
 * @param {number} [maxLength=4000]
 * @returns {string[]}
 */
function chunkLyrics(lyrics, maxLength = 4000) {
  if (lyrics.length <= maxLength) return [lyrics];

  const chunks = [];
  let current = '';
  const lines = lyrics.split('\n');

  for (const line of lines) {
    if ((current + '\n' + line).length > maxLength) {
      chunks.push(current.trim());
      current = line;
    } else {
      current += (current ? '\n' : '') + line;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

module.exports = { fetchLyrics, chunkLyrics };

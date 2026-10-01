<div align="center">

# 🎵 AH_YA — Discord Music Bot

**A powerful, feature-rich Discord music bot with YouTube & Spotify support, real-time lyrics, and a full interactive button UI.**

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?style=flat-square&logo=node.js)](https://nodejs.org)
[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=flat-square&logo=discord)](https://discord.js.org)
[![DisTube](https://img.shields.io/badge/DisTube-v5-red?style=flat-square)](https://distube.js.org)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

</div>

---

## ✨ Features

- 🎵 **YouTube & Spotify** playback — songs, albums, playlists, and search queries
- 📝 **Lyrics** — fetch and display lyrics for any song via Genius
- 🎛️ **Interactive Controls** — rich "Now Playing" embed with 10 control buttons:
  - `⏮ BACK` `⏪ REWIND` `⏸ PAUSE/RESUME` `⏩ FORWARD` `⏭ SKIP`
  - `🔁 LOOP` `🔄 REPLAY` `⏹ STOP` `♾️ AUTOPLAY` `🔀 SHUFFLE`
- 📋 **Queue Management** — view, skip multiple, and manage your queue
- 🔁 **Loop Modes** — loop the current song or the entire queue
- ♾️ **Autoplay** — automatically adds related songs when the queue ends
- ☁️ **Cloud Ready** — pre-configured for Railway and Square Cloud deployment

---

## 🤖 Commands

| Command | Description |
|---|---|
| `/play <query>` | Play a song or playlist from YouTube/Spotify or by search |
| `/pause` | Pause or resume the current song |
| `/skip [amount]` | Skip the current song (or multiple) |
| `/stop` | Stop playback and clear the queue |
| `/queue` | Display the current song queue |
| `/nowplaying` | Show the currently playing song with controls |
| `/lyrics [song]` | Show lyrics for the current or a specified song |
| `/loop <mode>` | Set loop mode: song / queue / off |
| `/shuffle` | Shuffle all songs in the queue |
| `/autoplay` | Toggle autoplay mode on or off |

---

## 🚀 Self-Hosting Guide

### Prerequisites

- [Node.js](https://nodejs.org) v18 or higher
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) installed and in PATH
- [FFmpeg](https://ffmpeg.org/download.html) installed and in PATH

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ah-ya-bot.git
cd ah-ya-bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
GENIUS_API_TOKEN=your_genius_api_token
```

### 4. Deploy slash commands

```bash
npm run deploy-commands
```

### 5. Start the bot

```bash
npm start
```

---

## 🔑 Getting API Keys

<details>
<summary><b>Discord Bot Token & Client ID</b></summary>

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to **Bot** → click **Reset Token** → copy your token
4. Your **Client ID** is on the **General Information** page

**Required Bot Permissions:**
- Connect, Speak, Send Messages, Embed Links, Read Message History

**Required Intents:**
- Server Members Intent
- Voice States

**Invite URL:**
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=3148800&scope=bot%20applications.commands
```

</details>

<details>
<summary><b>Spotify API Credentials</b></summary>

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Copy the **Client ID** and **Client Secret**

</details>

<details>
<summary><b>Genius API Token (Lyrics)</b></summary>

1. Go to [Genius API Clients](https://genius.com/api-clients)
2. Create a new client
3. Copy the **Client Access Token**

</details>

---

## ☁️ Deployment

### Railway (Recommended)

1. Push this repo to GitHub
2. Go to [Railway](https://railway.app) → New Project → Deploy from GitHub
3. Add your environment variables in the **Variables** tab
4. Railway auto-detects the `Dockerfile` — bot goes live automatically

### Square Cloud

1. Zip the project (exclude `node_modules` and `.env`)
2. Upload to [Square Cloud](https://squarecloud.app)
3. Add environment variables in the dashboard
4. The `squarecloud.app` config file handles the rest

---

## 🗂️ Project Structure

```
AH_YA/
├── src/
│   ├── index.js                  # Entry point
│   ├── config.js                 # Configuration
│   ├── deploy-commands.js        # Slash command deployer
│   ├── commands/                 # Slash command files
│   │   ├── play.js
│   │   ├── pause.js
│   │   ├── skip.js
│   │   ├── stop.js
│   │   ├── queue.js
│   │   ├── lyrics.js
│   │   ├── loop.js
│   │   ├── shuffle.js
│   │   ├── autoplay.js
│   │   └── nowplaying.js
│   ├── player/
│   │   └── player.js             # DisTube setup & events
│   ├── handlers/
│   │   ├── eventHandlers.js      # Discord event handlers
│   │   └── buttonHandler.js      # Button interaction handler
│   └── utils/
│       ├── embeds.js             # Embed & button builders
│       └── lyrics.js             # Genius API lyrics fetcher
├── .env.example                  # Environment variable template
├── Dockerfile                    # Container config for cloud hosting
├── railway.toml                  # Railway deployment config
├── squarecloud.app               # Square Cloud deployment config
└── package.json
```

---

## 🛠️ Tech Stack

| Package | Purpose |
|---|---|
| [discord.js v14](https://discord.js.org) | Discord API wrapper |
| [DisTube v5](https://distube.js.org) | Music player engine |
| [@distube/spotify](https://github.com/distubejs/spotify) | Spotify support |
| [@distube/yt-dlp](https://github.com/distubejs/yt-dlp) | YouTube audio via yt-dlp |
| [genius-lyrics-api](https://github.com/farshed/genius-lyrics-api) | Lyrics fetching |
| [FFmpeg](https://ffmpeg.org) | Audio processing |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
Made with ❤️ — AH_YA Music Bot
</div>

# ── AH_YA Discord Music Bot ──────────────────────────────────────────
# Optimized for Railway, Square Cloud, and other Node.js hosting
FROM node:20-slim

# Install system dependencies:
# - ffmpeg: required for audio processing
# - python3 + pip: required by yt-dlp
# - ca-certificates: for HTTPS
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    ca-certificates \
    curl \
    --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp globally (better than youtube-dl for bypassing restrictions)
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Set working directory
WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./

# Install Node dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose no ports (Discord bots are outbound only)
# Set memory limit hint for free-tier hosts
ENV NODE_OPTIONS="--max-old-space-size=512"

# Health check (optional but helpful for some platforms)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node -e "console.log('OK')" || exit 1

# Start the bot
CMD ["node", "src/index.js"]

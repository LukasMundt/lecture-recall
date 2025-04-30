# ====== Build Stage ======
FROM cloudron/base:5.0.0@sha256:04fd70dbd8ad6149c19de39e35718e024417c3e01dc9c6637eaf4a41ec4e596c AS builder

ARG BUILD_CLOUDRON_APP_DOMAIN
ENV APP_DOMAIN=${BUILD_CLOUDRON_APP_DOMAIN}
ENV NODE_ENV=production
WORKDIR /app/code

# Copy only what's needed for installing deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app code and build
COPY . .
RUN chmod +x start.sh && \
    npm run build && \
    cp -r public .next/standalone/ && \
    cp -r .next/static .next/standalone/.next/

# ====== Runtime Stage ======
FROM cloudron/base:5.0.0@sha256:04fd70dbd8ad6149c19de39e35718e024417c3e01dc9c6637eaf4a41ec4e596c AS runner

ENV NODE_ENV=production
ENV NEXT_CACHE_DIR=/app/data/cache
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

ARG BUILD_CLOUDRON_APP_DOMAIN
ENV APP_DOMAIN=${BUILD_CLOUDRON_APP_DOMAIN}

RUN mkdir -p /app/code /app/data /app/data/cache
WORKDIR /app/code

# Copy final app from build stage
COPY --from=builder /app/code /app/code

# Setup symlinks
RUN ln -s /app/data/env /app/code/.env && \
    ln -s /app/data/env /app/code/.next/standalone/.env && \
    ln -s /app/data/imprint.html /app/code/.next/standalone/imprint.html && \
    ln -s /app/data/privacy.html /app/code/.next/standalone/privacy.html && \
    rm -rf /app/code/.next/standalone/.next/cache && \
    ln -s /app/data/cache /app/code/.next/standalone/.next/cache && \
    chown -R cloudron:cloudron /app

EXPOSE 3000

CMD [ "/app/code/start.sh" ]

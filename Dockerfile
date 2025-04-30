ARG BUILD_CLOUDRON_APP_DOMAIN
FROM cloudron/base:5.0.0@sha256:04fd70dbd8ad6149c19de39e35718e024417c3e01dc9c6637eaf4a41ec4e596c

RUN mkdir -p /app/code /app/data
WORKDIR /app/code

# make this variable available during build time
ARG BUILD_CLOUDRON_APP_DOMAIN
ENV APP_DOMAIN=${BUILD_CLOUDRON_APP_DOMAIN}

ENV NODE_ENV=production

# copy code
ADD . /app/code/

# Ensure the start.sh script has execute permissions
RUN chmod +x /app/code/start.sh && \
    npm ci --omit=dev && \
    npm run build && \
    chown -R cloudron:cloudron /app/code

RUN cp -r public .next/standalone/ && \
    cp -r .next/static .next/standalone/.next/

# link env file
RUN ln -s /app/data/env /app/code/.env
RUN ln -s /app/data/env /app/code/.next/standalone/.env

# link legal files
RUN ln -s /app/data/imprint.html /app/code/.next/standalone/imprint.html
RUN ln -s /app/data/privacy.html /app/code/.next/standalone/privacy.html

# Erstelle das Cache-Verzeichnis im beschreibbaren Bereich
RUN mkdir -p /app/data/cache && \
    chown -R cloudron:cloudron /app/data/cache

# Entferne alte .next-Verknüpfungen, falls vorhanden
RUN rm -rf /app/code/.next/standalone/.next/cache

# Verlinke das beschreibbare Cache-Verzeichnis für Next.js
RUN ln -s /app/data/cache /app/code/.next/standalone/.next/cache

# Setze die Umgebungsvariable für das Cache-Verzeichnis
ENV NEXT_CACHE_DIR=/app/data/cache

# set the port and host and expose the port
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
ENV NODE_OPTIONS="--dns-result-order=ipv4first"


CMD [ "/app/code/start.sh" ]
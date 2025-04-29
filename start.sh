#!/bin/bash

# set -eu

ENV_FILE="/app/data/env"

# ensure that data directory is owned by 'cloudron' user
chown -R cloudron:cloudron /app/data

if [[ ! -f /app/data/.cr ]]; then
    echo "=> First run"
    cp /app/code/.env.prod-cloudron "${ENV_FILE}"

    AUTH_SECRET=$(openssl rand -base64 33)

    # Check if the environment variable exists in the .env file
    if grep -q "^AUTH_SECRET=" "$ENV_FILE"; then
        # update current value
        sed -i "s/^AUTH_SECRET=.*/AUTH_SECRET=\"${AUTH_SECRET}\"/" "${ENV_FILE}"
        echo "AUTH_SECRET in $ENV_FILE aktualisiert."
    else
        # add value if it doesnt exists
        echo "AUTH_SECRET=\"${AUTH_SECRET}\"" >>"$ENV_FILE"
        echo "AUTH_SECRET wurde zu $ENV_FILE hinzugefügt."
    fi

    chown -R cloudron:cloudron /app/data

    touch /app/data/.cr
fi

# Ensure DATABASE_URL is set correctly
if grep -q "^DATABASE_URL=" "${ENV_FILE}"; then
    # Update the existing DATABASE_URL line
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${CLOUDRON_MYSQL_URL}\"|" "${ENV_FILE}"

    echo "Updated DATABASE_URL in ${ENV_FILE}"
else
    # Add DATABASE_URL if it doesn't exist
    echo "DATABASE_URL=\"${CLOUDRON_MYSQL_URL}\"" >>"${ENV_FILE}"
    echo "Added DATABASE_URL to ${ENV_FILE}."
fi

# Run Prisma migrations
cd /app/code
if npx prisma migrate status | grep -q "There are pending migrations"; then
    echo "Es gibt ausstehende Migrationen. Sie werden jetzt angewendet."
    npx prisma migrate deploy
else
    echo "Keine ausstehenden Migrationen."
fi

if [[ ! -f /app/data/imprint.html ]]; then
    echo "=> Copying imprint.html"
    cp /app/code/imprint.cloudron.html /app/data/imprint.html
fi
if [[ ! -f /app/data/privacy.html ]]; then
    echo "=> Copying privacy.html"
    cp /app/code/privacy.cloudron.html /app/data/privacy.html
fi

echo "Starting Node.js app"

# run the app as user 'cloudron'
exec /usr/local/bin/gosu cloudron:cloudron node /app/code/.next/standalone/server.js --port $PORT --hostname 0.0.0.0

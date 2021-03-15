#!/bin/sh
set -e pipefail


SECRETS_PATH=./.github/secrets/android
KEYSTORE=2018-08-20-upload-keystore.jks
SERVICE_ACCOUNT=2021-03-13-service-account.json


gpg --quiet --batch --yes --decrypt --passphrase="$SECRETS_KEY" \
    --output $SECRETS_PATH/$KEYSTORE \
    $SECRETS_PATH/$KEYSTORE.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$SECRETS_KEY" \
    --output $SECRETS_PATH/$SERVICE_ACCOUNT \
    $SECRETS_PATH/$SERVICE_ACCOUNT.gpg

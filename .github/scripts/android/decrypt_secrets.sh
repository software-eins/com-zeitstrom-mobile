#!/bin/sh
set -e pipefail

gpg --quiet --batch --yes --decrypt --passphrase="$IOS_KEYS" \
    --output ./.github/secrets/android/2018-08-20-upload-keystore.jks \
    ./.github/secrets/android/2018-08-20-upload-keystore.jks.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$IOS_KEYS" \
    --output ./.github/secrets/android/2021-03-13-service-account.json \
    ./.github/secrets/android/2021-03-13-service-account.json

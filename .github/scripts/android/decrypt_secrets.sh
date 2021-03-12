#!/bin/sh
set -eo pipefail

gpg --quiet --batch --yes --decrypt --passphrase="$IOS_KEYS" \
    --output ./.github/secrets/android/2018-08-20-upload-keystore.jks \
    ./.github/secrets/android/2018-08-20-upload-keystore.jks.gpg

#!/bin/sh
set -eo pipefail

gpg --quiet --batch --yes --decrypt --passphrase="$IOS_KEYS" --output ./.github/secrets/2021-02-25-Profile.mobileprovision ./.github/secrets/2021-02-25-Profile.mobileprovision.gpg
gpg --quiet --batch --yes --decrypt --passphrase="$IOS_KEYS" --output ./.github/secrets/2021-02-25-Keypair.p12 ./.github/secrets/2021-02-25-Keypair.p12.gpg

mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles

cp ./.github/secrets/2021-02-25-Profile.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/2021-02-25-Profile.mobileprovision


security create-keychain -p "" build.keychain
security import ./.github/secrets/2021-02-25-Keypair.p12 -t agg -k ~/Library/Keychains/build.keychain -P "" -A

security list-keychains -s ~/Library/Keychains/build.keychain
security default-keychain -s ~/Library/Keychains/build.keychain
security unlock-keychain -p "" ~/Library/Keychains/build.keychain

security set-key-partition-list -S apple-tool:,apple: -s -k "" ~/Library/Keychains/build.keychain

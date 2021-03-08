#!/bin/sh
set -eo pipefail

gpg --quiet --batch --yes --decrypt --passphrase="$IOS_KEYS" --output ./.github/secrets/ios/2021-02-25-Keypair.p12 ./.github/secrets/ios/2021-02-25-Keypair.p12.gpg
gpg --quiet --batch --yes --decrypt --passphrase="$IOS_KEYS" --output ./.github/secrets/ios/2021-02-25-orange.mobileprovision ./.github/secrets/ios/2021-02-25-orange.mobileprovision.gpg
gpg --quiet --batch --yes --decrypt --passphrase="$IOS_KEYS" --output ./.github/secrets/ios/2021-03-04-red.mobileprovision ./.github/secrets/ios/2021-03-04-red.mobileprovision.gpg

mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles

cp ./.github/secrets/ios/2021-02-25-orange.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/2021-02-25-orange.mobileprovision
cp ./.github/secrets/ios/2021-03-04-red.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/2021-03-04-red.mobileprovision


security create-keychain -p "" build.keychain
security import ./.github/secrets/ios/2021-02-25-Keypair.p12 -t agg -k ~/Library/Keychains/build.keychain -P "" -A

security list-keychains -s ~/Library/Keychains/build.keychain
security default-keychain -s ~/Library/Keychains/build.keychain
security unlock-keychain -p "" ~/Library/Keychains/build.keychain

security set-key-partition-list -S apple-tool:,apple: -s -k "" ~/Library/Keychains/build.keychain

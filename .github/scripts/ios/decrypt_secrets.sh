#!/bin/sh
set -eo pipefail

SECRETS_PATH=./.github/secrets/ios

KEYPAIR=2021-02-25-Keypair.p12
PROFILE_ORANGE=2021-02-25-orange.mobileprovision
PROFILE_RED=2021-03-04-red.mobileprovision

gpg --quiet --batch --yes --decrypt --passphrase="$SECRETS_KEY" --output $SECRETS_PATH/$KEYPAIR $SECRETS_PATH/$KEYPAIR.gpg
gpg --quiet --batch --yes --decrypt --passphrase="$SECRETS_KEY" --output $SECRETS_PATH/$PROFILE_ORANGE $SECRETS_PATH/$PROFILE_ORANGE.gpg
gpg --quiet --batch --yes --decrypt --passphrase="$SECRETS_KEY" --output $SECRETS_PATH/$PROFILE_RED $SECRETS_PATH/$PROFILE_RED.gpg


# Add mobile provisioning profiles
mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
cp $SECRETS_PATH/$PROFILE_ORANGE ~/Library/MobileDevice/Provisioning\ Profiles/$PROFILE_ORANGE
cp $SECRETS_PATH/$PROFILE_RED ~/Library/MobileDevice/Provisioning\ Profiles/$PROFILE_RED

# Add signing certificate to keychain
security create-keychain -p "" build.keychain
security import $SECRETS_PATH/$KEYPAIR -t agg -k ~/Library/Keychains/build.keychain -P "" -A

# Add signing certificate to keychain
security list-keychains -s ~/Library/Keychains/build.keychain
security default-keychain -s ~/Library/Keychains/build.keychain
security unlock-keychain -p "" ~/Library/Keychains/build.keychain

security set-key-partition-list -S apple-tool:,apple: -s -k "" ~/Library/Keychains/build.keychain

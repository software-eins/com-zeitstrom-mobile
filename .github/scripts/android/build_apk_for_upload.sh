#!/bin/sh
set -e pipefail

cd android

rm -f ./app/build/outputs/apk/release/app-release-unsigned.apk
rm -f ./app/build/outputs/apk/release/app.apk

npx jetify

./gradlew build

jarsigner -sigalg SHA1withRSA \
    -digestalg SHA1 \
    -storepass kmuZFTJYGyNKw9YmdCW822 \
    -keystore ../.github/secrets/android/2018-08-20-upload-keystore.jks \
    ./app/build/outputs/apk/release/app-release-unsigned.apk time_tracking

zipalign -v 4 \
    ./app/build/outputs/apk/release/app-release-unsigned.apk \
    ./app/build/outputs/apk/release/app.apk

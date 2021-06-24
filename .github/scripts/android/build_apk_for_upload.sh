#!/bin/sh
set -e pipefail

cd android

rm -f ./app/build/outputs/apk/release/app-release-unsigned.apk
rm -f ./app/build/outputs/apk/release/app.apk

./gradlew --no-daemon build

# /usr/local/lib/android/sdk/build-tools/30.0.3/zipalign -v 4 \
~/Library/Android/sdk/build-tools/30.0.3/zipalign -v 4 \
    ./app/build/outputs/apk/release/app-release-unsigned.apk \
    ./app/build/outputs/apk/release/app.apk

# /usr/local/lib/android/sdk/build-tools/30.0.3/apksigner sign \
~/Library/Android/sdk/build-tools/30.0.3/apksigner sign \
    --ks-pass pass:kmuZFTJYGyNKw9YmdCW822 \
    --ks ../.github/secrets/android/2018-08-20-upload-keystore.jks \
    --ks-key-alias \
    time_tracking ./app/build/outputs/apk/release/app.apk

rm ./app/build/outputs/apk/release/app-release-unsigned.apk

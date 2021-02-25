#!/bin/bash

set -eo pipefail

security unlock-keychain -p "" ~/Library/Keychains/build.keychain

xcodebuild -archivePath $PWD/ios/build/App.xcarchive \
            -exportOptionsPlist ios/App/App/exportOptions.plist \
            -exportPath $PWD/ios/build \
            -exportArchive | xcpretty

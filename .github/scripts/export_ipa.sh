#!/bin/bash

set -eo pipefail

security unlock-keychain -p "" ~/Library/Keychains/build.keychain

xcodebuild -archivePath $PWD/ios/build/App.xcarchive \
            -target App$TARGET \
            -exportOptionsPlist ios/App/App/exportOptions.plist \
            -exportPath $PWD/ios/build \
            -exportArchive | xcpretty

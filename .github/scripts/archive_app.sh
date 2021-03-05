#!/bin/bash

set -euxo pipefail

security unlock-keychain -p "" ~/Library/Keychains/build.keychain

xcodebuild -workspace ios/App/App.xcworkspace \
            -allowProvisioningUpdates \
            -scheme App \
            -sdk iphoneos \
            -target App$TARGET \
            -configuration AppStoreDistribution \
            -archivePath $PWD/ios/build/App.xcarchive \
            clean archive | xcpretty

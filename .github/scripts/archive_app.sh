#!/bin/bash

set -euxo pipefail

security unlock-keychain -p "" ~/Library/Keychains/build.keychain

# -workspace ios/App/App.xcworkspace \

xcodebuild -workspace ios/App/App.xcworkspace \
            -allowProvisioningUpdates \
            -scheme App \
            -sdk iphoneos \
            -configuration AppStoreDistribution \
            -archivePath $PWD/ios/build/App.xcarchive \
            clean archive | xcpretty

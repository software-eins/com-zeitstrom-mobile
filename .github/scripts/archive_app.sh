#!/bin/bash

set -eo pipefail

xcodebuild -workspace ios/App/App.xcworkspace \
            -allowProvisioningUpdates \
            -scheme App \
            -sdk iphoneos \
            -configuration AppStoreDistribution \
            -archivePath $PWD/ios/build/App.xcarchive \
            clean archive | xcpretty

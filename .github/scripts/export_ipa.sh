#!/bin/bash

set -eo pipefail

xcodebuild -archivePath $PWD/ios/build/App.xcarchive \
            -exportOptionsPlist ios/App/App/Info.plist \
            -exportPath $PWD/ios/build \
            -allowProvisioningUpdates \
            -exportArchive | xcpretty

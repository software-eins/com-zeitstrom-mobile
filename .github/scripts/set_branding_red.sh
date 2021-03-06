#!/bin/bash

set -euxo pipefail

# Set vue environment
mv .env .env.debug
mv .env.red .env

# ios / set icons
rm -r ios/App/App/Assets.xcassets/AppIcon.appiconset
mv brands/red/ios/AppIcon.appiconset ios/App/App/Assets.xcassets/AppIcon.appiconset

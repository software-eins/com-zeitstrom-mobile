#!/bin/bash

set -euxo pipefail

mv .env .env.debug
mv .env.red .env

rm -r ios/App/App/Assets.xcassets/AppIcon.appiconset
mv brands/red/ios/AppIcon.appiconset ios/App/App/Assets.xcassets/AppIcon.appiconset

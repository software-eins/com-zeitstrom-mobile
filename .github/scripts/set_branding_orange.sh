#!/bin/bash

set -euxo pipefail

mv .env .env.debug
mv .env.orange .env

rm -r ios/App/App/Assets.xcassets/AppIcon.appiconset
mv brands/orange/ios/AppIcon.appiconset ios/App/App/Assets.xcassets/AppIcon.appiconset

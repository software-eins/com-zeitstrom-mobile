#!/bin/bash

set -euxo pipefail

xcrun altool --upload-app -t ios -f ios/build/AppOrange.ipa -u "$APPLEID_USERNAME" -p "$APPLEID_PASSWORD" --verbose

#!/bin/bash

set -eo pipefail

xcrun altool --upload-app -t ios -f ios/build/App.ipa -u "$APPLEID_USERNAME" -p "$APPLEID_PASSWORD" --verbose

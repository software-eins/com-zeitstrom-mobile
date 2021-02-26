#!/bin/bash

set -euxo pipefail

export build=3.1.`date +"%y%m%d%H%M"`
export marketing=3.1.`date +"%y%m%d"`

sed -i '' 's/CURRENT_PROJECT_VERSION = 3.1.0/CURRENT_PROJECT_VERSION = '"$build"'/g' ./ios/App/App.xcodeproj/project.pbxproj
sed -i '' 's/MARKETING_VERSION = 3.1.0/MARKETING_VERSION = '"$marketing"'/g' ./ios/App/App.xcodeproj/project.pbxproj

#!/bin/bash

set -e pipefail

rm -f envars

echo "export APP_BRAND=$BRAND" >> envars
echo "export APP_LABEL=$LABEL" >> envars
echo "export APP_PACKAGE=$PACKAGE" >> envars

echo "export APP_VERSION_CODE=`expr $GITHUB_RUN_NUMBER + 90`" >> envars
echo "export APP_VERSION_MARKETING=3.1.`date +"%y%m%d%H%M"`" >> envars

echo "export VUE_APP_BRANDING=$BRAND" >> envars
echo "export VUE_APP_BASE_URL=$BASE_URL" >> envars
echo "export VUE_APP_DEBUG=false" >> envars

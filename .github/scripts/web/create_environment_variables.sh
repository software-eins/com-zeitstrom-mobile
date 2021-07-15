#!/bin/bash

set -e pipefail

rm -f envars

echo "export APP_BRAND=$BRAND" >> envars
echo "export APP_LABEL=$LABEL" >> envars

echo "export VUE_APP_BRANDING=$BRAND" >> envars
echo "export VUE_APP_BASE_URL=$BASE_URL" >> envars
echo "export VUE_APP_DEBUG=false" >> envars

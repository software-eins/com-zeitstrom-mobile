export APP_LABEL="TA Zeitblick"
export APP_BRAND="orange"
export VUE_APP_BRANDING=$APP_BRAND
export APP_PACKAGE="com.zeitstrom.ta_mobile"
export APP_VERSION_CODE=142
export APP_VERSION_MARKETING=3.1.211201
export BRAND=$APP_BRAND
export LABEL=$APP_LABEL
export PACKAGE=$APP_PACKAGE
export BASE_URL="http://192.168.2.230:8000"
export VUE_APP_BASE_URL=$BASE_URL

ionic capacitor run ios -l --external

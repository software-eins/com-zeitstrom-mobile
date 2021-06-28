mv android/app/src/main/java/com/zeitstrom/ta_mobile android/app/src/main/java/com/zeitstrom/$APP_MODULE

sed "s/ta_mobile/${APP_MODULE}/" android/app/src/main/AndroidManifest.xml > android/app/src/main/AndroidManifest.xml.new
mv android/app/src/main/AndroidManifest.xml.new android/app/src/main/AndroidManifest.xml

sed "s/ta_mobile/${APP_MODULE}/" android/app/src/main/java/com/zeitstrom/$APP_MODULE/MainActivity.java > android/app/src/main/java/com/zeitstrom/$APP_MODULE/MainActivity.java.new
mv android/app/src/main/java/com/zeitstrom/$APP_MODULE/MainActivity.java.new android/app/src/main/java/com/zeitstrom/$APP_MODULE/MainActivity.java

sed "s/ta_mobile/${APP_MODULE}/" android/app/src/main/res/values/strings.xml > android/app/src/main/res/values/strings.xml.new
mv android/app/src/main/res/values/strings.xml.new android/app/src/main/res/values/strings.xml

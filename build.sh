# nvm use 20
rm android/app/build/outputs/apk/debug/app-debug.apk
ionic build
# ionic cap build android --prod
ionic capacitor sync
cd android
./gradlew assembleDebug
./gradlew assembleRelease
ls -l app/build/outputs/apk/debug/app-debug.apk
ls -l app/build/outputs/apk/release/app-release-unsigned.apk
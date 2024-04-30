#  # nvm use 20
#  rm android/app/build/outputs/apk/debug/*.apk
#  ionic build
#  # ionic cap build android --prod
#  ionic capacitor sync
#  cd android
#  ./gradlew assembleDebug
#  ./gradlew assembleRelease
#  ls -l app/build/outputs/apk/debug/app-debug.apk
#  ls -l app/build/outputs/apk/release/app-release-unsigned.apk
#  cd ..



# npm version patch
# version=`npm pkg get version | tr -d \"`
# echo $version
# mv android/app/build/outputs/apk/debug/app-debug.apk android/app/build/outputs/apk/debug/JB-NOTES-$version.apk
# caja android/app/build/outputs/apk/debug
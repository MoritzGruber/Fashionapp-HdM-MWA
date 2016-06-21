#!/bin/bash
echo "Building Ionic/Cordova iOS release..."
ionic build --release ios

# Save current directory and cd to other dir
pushd platforms/ios/

# Build archive
xcodebuild -scheme "Lapica" -configuration Release clean archive
# Can also specify archive path:
# xcodebuild <all_other_args> archive -archivePath build/MyApp

# Return current directory
popd

# Uncomment if you have disabled HockeyApp auto-watching for archives
# This path needs to be edited based on IPA from earlier command
#echo "Opening IPA (in HockeyApp)..."
#open platforms/MyApp.ipa

echo "Done"

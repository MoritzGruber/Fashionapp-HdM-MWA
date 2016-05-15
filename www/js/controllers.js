angular.module('starter.controllers', [])
.controller('PhotoCtrl', function($scope, $base64, socket, Camera, storage, $localStorage, voteservice) {
      $scope.getPhoto = function() {
        //first we define a var to set the settings we use calling the cordova camera,
        var cameraSettings = {
          sourceType: navigator.camera.PictureSourceType.CAMERA,
          destinationType: navigator.camera.DestinationType.DATA_URL, // very importend!!! to get base64 and no link NOTE: mybe cause out of memory error after a while
          quality: 75,
          targetWidth: 320,
          targetHeight: 320,
          saveToPhotoAlbum: false,
        };
        //calling our service with asynchronously runs the cordova camera plugin
       Camera.getPicture(cameraSettings).then(function(imageData) {
          //adding the phone number and pasing the object to json
          var image= {"imageData":imageData, "transmitternumber":storage.getNumber(), "recipients":storage.getFriendswithbenefits()};
          //upload the image with our open socket connection
          socket.emit('new_image',(image));
          //store localy now
          storage.addOwnImage(image);
       }, function(err) {
         console.log(err);
        //this function dosnt even get called, have to make a cetch outside before
      });
     };
     if ($localStorage.ownImages == undefined) {
         $localStorage.ownImages = [];
     }
     $scope.ownImages = $localStorage.ownImages;
     //calling the calculate percentage function for each image
     for (var i = 0; i < $scope.ownImages.length; i++) {
         $scope.ownImages[i].percantag = voteservice.getPercentage($scope.ownImages[i].recipients);
     }
     //TODO: replace the image data with an id
     socket.on('vote_sent_from_server', function (package) {
         for (var i = 0; i < $localStorage.ownImages.length; i++) {
             if ($localStorage.ownImages[i].imageData == package.imageData) {
                 console.log("imageData same");
                 //this double loop is to masure out the exact image and then the exact recipient
                 for (var j = 0; j < $localStorage.ownImages[i].recipients.length; j++) {
                    if ($localStorage.ownImages[i].recipients[j].number == package.number){
                        //saving the revied vote to local storage and scope
                        $localStorage.ownImages[i].recipients[j].state = package.rating;
                        $scope.ownImages[i].recipients[j].state = package.rating;
                        //calling calculation again
                        $scope.ownImages[i].percantag = (voteservice.getPercentage($scope.ownImages[i].recipients));
                        $localStorage.ownImages[i].percantag = (voteservice.getPercentage($scope.ownImages[i].recipients));
                        console.log("number found and vote set");
                    }
                 }
             }
         }
     });
})

.controller('CommunityCtrl', function($scope, socket, $ionicPlatform, storage, $localStorage, voteservice) {
    console.log("platform: " + ionic.Platform.platform());

    //this function is called when you hit a vote button
    $scope.vote= function (voting, indexofvotedimage) {
            voteservice.vote(voting, indexofvotedimage);
    }

    $ionicPlatform.ready(function() {
        $scope.local = $localStorage.images;
        //on startup load iamges from storage, if there is sth to load
        //saving reciving images to scope and storage
      socket.on('incoming_image', function (image) {
          //only call this part if the app is not running the background task
          if (!(cordova.plugins.backgroundMode.isActive())) {
              storage.addImage(image);
              $scope.local=$localStorage.images;
              $scope.$apply();
              console.log("saved foreground");
              console.log(cordova.plugins.backgroundMode);
          }
      });
      if (ionic.Platform.platform() == "android" || ionic.Platform.platform() == "ios") {
            // cordova.plugins.backgroundMode.setDefaults({
            //     title:  'Lapica',
            //     text:   'Waiting from friends to post new image'
            // });
            // Enable background mode only if there is no other backgroundprozess already running
            if (!cordova.plugins.backgroundMode.isEnabled()){
                cordova.plugins.backgroundMode.enable();
            }


            // Called when background mode has been activated
            cordova.plugins.backgroundMode.ondeactivate = function() {
                console.log("i am deactivaed");
                return;
            };
            cordova.plugins.backgroundMode.onactivate = function () {
                var counter = 1;
                counter = counter +1;
                console.log("bg enabeld" + counter);
                if (cordova.plugins.backgroundMode.isActive) {
                    socket.on('incoming_image', function (image) {

                      if (cordova.plugins.backgroundMode._isActive) {
                          if (cordova.plugins.backgroundMode._isActive == false){
                              console.log("stop this shit");
                          }
                          storage.addImage(image);
                          $scope.bgmode = true;
                          $scope.local=$localStorage.images;
                          $scope.$apply();
                      } else{
                          return;
                      }
                      console.log("saved background");
                       console.log(cordova.plugins.backgroundMode);

                    });
                } else{
                    return;
                }
            }
      }
    });
})

.controller('ProfileCtrl', function($scope, $localStorage, storage) {
    $scope.friends = $localStorage.friends;
    $scope.storage = storage;
    $scope.number = $localStorage.ownnumber;
})

.controller('CollectionCtrl', [ function(){}])

.controller('CollectionDetailCtrl', function($scope, $stateParams, storage) {
  $scope.image = storage.getOwnImage($stateParams.imageId);
  console.log($scope.image);
})

.controller('FriendSelectCtrl', function ($scope, storage, $ionicPlatform) {
    $ionicPlatform.ready(function() {
        $scope.contacts = storage.getContacts();
    });
    //  save/delete contact to localStorage
    $scope.checkFriend = function(index, number, value) {
        storage.editFriend(index, number, value);
    }
    //fetch all data from the phone again
    $scope.updateContacts = function () {
        console.log("updated");
        $scope.contacts = storage.loadContacts();
    }
});

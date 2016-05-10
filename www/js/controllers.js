angular.module('starter.controllers', [])
.controller('PhotoCtrl', function($scope, $base64, socket, Camera, storage, $localStorage) {
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
      var image= {"imageData":imageData, "transmitternumber":storage.getNumber(), "recipients":storage.getFriends()};
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
          }
      });
      if (ionic.Platform.platform() == "android" || ionic.Platform.platform() == "ios") {
            // cordova.plugins.backgroundMode.setDefaults({
            //     title:  'Lapica',
            //     text:   'Waiting from friends to post new image'
            // });
            // Enable background mode
            cordova.plugins.backgroundMode.enable();

            // Called when background mode has been activated
            cordova.plugins.backgroundMode.onactivate = function () {

                socket.on('incoming_image', function (image) {
                  storage.addImage(image);
                  $scope.bgmode = true;
                  $scope.local=$localStorage.images;
                  $scope.$apply();
                });
            }
      }
    });
})

.controller('ProfileCtrl', function($scope, $localStorage) {
    $scope.friends = $localStorage.friends;
})

.controller('CollectionCtrl', ['$scope', '$http', function($scope, $http, socket, storage){
  $http.get('js/data.json').success(function(data){
    // http://angular-js.in/svg-round-progressbar/
    //$scope.images = storage.images();
    // get the data out of images.json
    //pass along data from http service to scope items
    $scope.collection = data.collection;

    // delete function
      $scope.remove = function(item) {
        $scope.collection.splice($scope.collection.indexOf(item), 1);
      };
    });
  }])

.controller('CollectionDetailCtrl', function($scope, $stateParams, Collection) {
  $scope.collection = Collection.get($stateParams.itemId);
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

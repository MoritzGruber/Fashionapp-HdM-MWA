angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, storage) {
  //passing in the storage service in the scope
$scope.storage = storage;
})

.controller('PhotoCtrl', function($scope, $base64, Chats, socket, Camera, storage) {


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
      //defineing some recipientsnumbes for testing
      var recipients = ["12345678901", "12345678902", "12345678903"];
      //adding the phone number and pasing the object to json
      var image= {"imageData":imageData, "transmitternumber":storage.getNumber(), "recipients":recipients};
      //upload the image with our open socket connection
      socket.emit('new_image',(image));
      //save the image in the scope to display it in the tapview
      $scope.srcImage = "data:image/jpeg;base64," + imageData;
   }, function(err) {
     console.log(err);
    //this function dosnt even get called, have to make a cetch outside before
  });
 };
})
.controller('CommunityCtrl', function($scope, socket, $ionicPlatform, storage) {
    $ionicPlatform.ready(function() {
        $scope.local = storage.getImages();
        //on startup load iamges from storage, if there is sth to load
        if (storage.getImages()!=undefined) {
            $scope.lastImage = "data:image/jpeg;base64," + storage.getImages().imageData;
            $scope.ownnumber = storage.getImages().ownnumber;
            console.log("storage was loaded");
        }
        //saving reciving images to scope and storage
      socket.on('incoming_image', function (image) {
        storage.setImages(image);
        $scope.local=image;
        console.log(image + " ::::: recived and stored");
        $scope.$apply();
      });
    //   cordova.plugins.backgroundMode.setDefaults({
    //       title:  'Lapica',
    //       text:   'Waiting from friends to post new image'
    //   });
    //   // Enable background mode
    //   cordova.plugins.backgroundMode.enable();
      //
    //   // Called when background mode has been activated
    //   cordova.plugins.backgroundMode.onactivate = function () {
      //
    //       // Set an interval of 3 seconds (3000 milliseconds)
    //       socket.on('incoming_image', function (data) {
    //         $scope.lastImage = "data:image/jpeg;base64," + data;
    //       });
    //   }
    });
})
.controller('ProfileCtrl', function($scope) {})

// tab-community
.controller('ItemsController', ['$scope', '$http',  function($scope, $http, socket, storage){
  //http service to get a json file
    //starter template code below.....
  $http.get('js/data.json').success(function(data){
    //pass along data from http service to scope items
    $scope.items = data.items;
  });
}])

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
.controller('AccountCtrl', function($scope, storage) {
  $scope.settings = {
    enableFriends: true
  };
  //pass over the service to use in html tap
  $scope.storage = storage;
})
.controller('CollectionDetailCtrl', function($scope, $stateParams, Collection) {
  $scope.collection = Collection.get($stateParams.itemId);
});

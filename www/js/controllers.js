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
      //upload the image with our open socket connection
      socket.emit('new_image', imageData);
      //save the image in the scope to display it in the tapview
      $scope.srcImage = "data:image/jpeg;base64," + imageData;
   }, function(err) {
     console.log(err);
    //this function dosnt even get called, have to make a cetch outside before
  });
 };
})
.controller('CommunityCtrl', function($scope) {})
.controller('ProfileCtrl', function($scope) {})

// tab-community
.controller('ItemsController', ['$scope', '$http',  function($scope, $http){
  //http service to get a json file

    //catching socket events
    socket.on('connection',function(){
      console.log('The party is going on!');

    });

    socket.on('incoming_image', function (data) {
      $scope.data = data;
    });

    //function called when user hits the send button
    // sends the data in $scope.message to the server with our websocket
    $scope.sendMessage=function(){
    		socket.emit('chat message', $scope.message);
    		$scope.message = "";
        socket.emit('new_image', $scope.upload);
        $scope.upload = "";
    };

    //starter template code below.....
    $scope.chats = Chats.all();
    $scope.remove = function(chat) {
      Chats.remove(chat);
    };
  $http.get('js/data.json').success(function(data){
    //pass along data from http service to scope items
    $scope.items = data.items;
  });
}])

.controller('CollectionCtrl', ['$scope', '$http', storage,  function($scope, $http){
  $http.get('js/data.json').success(function(data){
    // http://angular-js.in/svg-round-progressbar/
    $scope.images = storage.images();
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

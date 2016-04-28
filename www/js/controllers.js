angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, storage) {
  //passing in the storage service in the scope
$scope.storage = storage;
})

.controller('ChatsCtrl', function($scope, $base64, Chats, socket, Camera, storage) {


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
   Camera.getPicture(cameraSettings).then(function(dataURL) {
      //store the returned bas64 string in the scope
      $scope.upload = dataURL;
   }, function(err) {
     console.log(err);
    //this function dosnt even get called, have to make a cetch outside before
  });
 };

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
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope, storage) {
  $scope.settings = {
    enableFriends: true
  };
  //pass over the service to use in html tap
  $scope.storage = storage;
});

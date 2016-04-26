angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, $base64, Chats, socket, Camera) {


  $scope.getPhoto = function() {
    //creating new getPhoto funciton in the scope of the controller
   Camera.getPicture().then(function(dataURL) {
     //use Camera plugin, which was added in dependencies
      console.log ($base64.encode(dataURL) +"log3");
      socket.on('connection',function(){
        socket.emit('new_image', $base64.encode(dataURL));
        console.log("is connected");
      });
      $scope.upload = $base64.encode(dataURL);
     //logging uri of the image, if debugging is enabeld in the Constants factory
     //save the uri to the scope
   }, function(err) {
     console.log(err);
    //this function dosnt even get called, have to make a cetch outside before
   }, {
     //destinationType: navigator.camera.DestinationType.DATA_URL, //desttype is to rease the base64 string
     quality: 75,
     targetWidth: 320,
     targetHeight: 320,
     saveToPhotoAlbum: false,
     //settings for image quality, etc..
   })
 };


  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  //here we call the socket factory/service and log sth. for debugging
  socket.on('connection',function(){
    console.log('The party is going on!');

  });

  socket.on('incoming_image', function (data) {
    $scope.lastPhoto = $base64.decode(data);
  });

  //function called when user hits the send button
  // sends the data in $scope.message to the server with our websocket
  $scope.sendMessage=function(){
  		socket.emit('chat message', $scope.message);
  		$scope.message = "";
      socket.emit('new_image', $scope.upload);
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

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});

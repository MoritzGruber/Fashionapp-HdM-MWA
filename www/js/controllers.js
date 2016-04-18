angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, Camera, Constants) {

  $scope.getPhoto = function() {
    //creating new getPhoto funciton in the scope of the controller
   Camera.getPicture().then(function(imageURI) {
     //use Camera plugin, which was added in dependencies
     if (Constants.debugging) {
       console.log(imageURI);
     }
     //logging uri of the image, if debugging is enabeld in the Constants factory
     $scope.lastPhoto = imageURI;
     //save the uri to the scope
   }, function(err) {
     console.err(err);
     //logging error to console
     //TODO: Show an error massage on screen
   }, {
     quality: 75,
     targetWidth: 320,
     targetHeight: 320,
     saveToPhotoAlbum: false
     //settings for image quality, etc..
   });
 };

})

.controller('ChatsCtrl', function($scope, Chats, socket, Constants) {
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

  //function called when user hits the send button
  // sends the data in $scope.message to the server with our websocket
  $scope.sendMessage=function(){
  		socket.emit('chat message', $scope.message);
  		$scope.message = "";
      if (Constants.debugging) {
        //logging for debugging
        console.log('Send button was clicked, and send function was called!');
      }
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

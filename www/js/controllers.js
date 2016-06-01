angular.module('starter.controllers', [])
.controller('StartCtrl', function($scope, $css, storage, $state, socket){
  //hockeyapp.trackEvent(null, null, "at_tab_start");
  $scope.storage = storage;
  $scope.start = function () {
    if (storage.getNumber().length <3 || storage.getNumber().length >10 || storage.getNumber() == "Unknown" ){
      alert("Please choose a Nickname between 3 and 10 letters");
    }else{
      //socket emit new user
      socket.emit('new_user',(storage.getNumber()));
      //some unique sucess could be received here
      //navigate to normal start screen
      $state.go('tab.collection');
    }
  };
})
  .controller('TabsCtrl', function($scope, $rootScope, $state) {
    //this controller disables the tab navigation bar for certain views/tabs
    $rootScope.$on('$ionicView.beforeEnter', function () {

      $rootScope.hideTabs = false;

      //disable tabbar on start/welcome screen
      if ($state.current.name === 'tab.collectionstart') {
        $rootScope.hideTabs = true;
      }
    });
  })
.controller('PhotoCtrl', function($scope, $base64, $timeout, socket, Camera, storage, $localStorage, $ionicPlatform, $state, voteservice, communicationservice) {
  $ionicPlatform.ready(function() {
    if  (!ionic.Platform.platform() == "macintel"){
      hockeyapp.start(null, null, "92590608ebe64ac682e3af9bb46019cd");
    }
    //hockeyapp.checkForUpdate();
    //hockeyapp.trackEvent(null, null, "at_tab_collection");
    if (storage.getNumber().length <3 || storage.getNumber().length >10 || storage.getNumber() == "Unknown" ) {
      //app opend the first time ==> go to welcome page
      $state.go('tab.collectionstart');
    }

  });
  console.log(storage.getNumber());
  //functions
  //remove an Item
  $scope.removeItem = function(index){
    console.log("pls add remove action here");
    //storage.deleteOwnImage(index);
    //TODO: Some Animation and Delete Button to show up
  };
  //switch to the detail view of the selected image
  $scope.openDetailImage = function(index){
    console.log("taped");
    $state.go('tab.collection-detail', {imageId: index});
  };
  $scope.getPhoto = function() {

    //first we define a var to set the settings we use calling the cordova camera,
    var cameraSettings = {
      sourceType: 1, //navigator.camera.PictureSourceType.CAMERA,
      destinationType: 0, //navigator.camera.DestinationType.DATA_URL, // very importend!!! to get base64 and no link NOTE: mybe cause out of memory error after a while
      quality: 100,
      targetWidth: 640,
      targetHeight: 1136,
      saveToPhotoAlbum: true,
    };
    //calling our service with asynchronously runs the cordova camera plugin
   Camera.getPicture(cameraSettings).then(function(imageData) {
      //adding the phone number and pasing the object to json
      var votes = [];
      var image= {"imageData":imageData, "timestamp": Date.parse(Date()), "transmitternumber":storage.getNumber(), "recipients":storage.getFriendswithbenefits(), "votes":votes};
      //upload the image with our open socket connection
      socket.emit('new_image',(image));
      //store localy now
      storage.addOwnImage(image);
     $scope.collage = true;
     setTimeout(function () {
       console.log("dudu");
       $scope.collage = false;
       $scope.$apply();
     }, 3000);

   }, function(err) {
     console.log(err);
    //this function dosnt even get called, have to make a ceetch outside before
  });

 };
     if ($localStorage.ownImages == undefined) {
         $localStorage.ownImages = [];
     }
     $scope.ownImages = $localStorage.ownImages;
     //calling the calculate percentage function for each image
     for (var i = 0; i < $scope.ownImages.length; i++) {
         $scope.ownImages[i].percantag = voteservice.getPercentage($scope.ownImages[i].votes);
     }
     //TODO: replace the image data with an id
     socket.on('vote_sent_from_server', function (package) {
         for (var i = 0; i < $localStorage.ownImages.length; i++) {
             if ($localStorage.ownImages[i].imageData == package.imageData) {
                 var vote={"name":package.number, "vote":package.rating};
                 $localStorage.ownImages[i].votes.push(vote);
                $localStorage.ownImages[i].percantag = voteservice.getPercentage($localStorage.ownImages[i].votes);
             }
         }
       $scope.ownImages = $localStorage.ownImages;
     });
     socket.on('updateUserData', function(data){
       console.log(data);
     });
    //  socket.on('vote_sent_from_server', function (package) {
    //      for (var i = 0; i < $localStorage.ownImages.length; i++) {
    //          if ($localStorage.ownImages[i].imageData == package.imageData) {
    //              console.log("imageData same");
    //              //this double loop is to masure out the exact image and then the exact recipient
    //              for (var j = 0; j < $localStorage.ownImages[i].recipients.length; j++) {
    //                 if ($localStorage.ownImages[i].recipients[j].number == package.number){
    //                     //saving the revied vote to local storage and scope
    //                     $localStorage.ownImages[i].recipients[j].state = package.rating;
    //                     $scope.ownImages[i].recipients[j].state = package.rating;
    //                     //calling calculation again
    //                     $scope.ownImages[i].percantag = (voteservice.getPercentage($scope.ownImages[i].recipients));
    //                     $localStorage.ownImages[i].percantag = (voteservice.getPercentage($scope.ownImages[i].recipients));
    //                     console.log("number found and vote set");
    //                 }
    //              }
    //          }
    //      }
    //  });
    $scope.doRefresh = function() {

      communicationservice.updateData("collection");
      $timeout( function() {
        //simulate async response
        //Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');

      }, 1000);

    };
})

.controller('CommunityCtrl', function($scope, socket, $ionicPlatform, $timeout, storage, $localStorage, voteservice, communicationservice) {
    //hockeyapp.trackEvent(null, null, "at_tab_community");
    console.log("platform: " + ionic.Platform.platform());
    console.log(Date.parse(Date()));
    //this function is called when you hit a vote button
    $scope.vote= function (voting, indexofvotedimage) {
            voteservice.vote(voting, indexofvotedimage);
    }
    $scope.doRefresh = function() {

      console.log('Refreshing!');
      $timeout( function() {
        //simulate async response
        //TODO: call refresh function here
        communicationservice.updateData("community");
        //Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');

      }, 1000);

    };

    $ionicPlatform.ready(function() {
        storage.clearOldImages();
        $scope.local = $localStorage.images;

        //on startup load iamges from storage, if there is sth to load
        //saving reciving images to scope and storage
      socket.on('incoming_image', function (image) {
          //only call this part if the app is not running the background task
        if  (ionic.Platform.platform() == "macintel"){
          storage.addImage(image);
          $scope.local=$localStorage.images;
          $scope.$apply();
        }else {
          if (!(cordova.plugins.backgroundMode.isActive())) {
            storage.addImage(image);
            $scope.local=$localStorage.images;
            $scope.$apply();
            console.log("saved foreground");
            console.log(cordova.plugins.backgroundMode);
          }
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
            cordova.plugins.backgroundMode.onactivate = function () {
                if (cordova.plugins.backgroundMode._isActive) {
                    socket.on('incoming_image', function (image) {

                      if (cordova.plugins.backgroundMode._isActive) {
                        //added workaround for buggy background pluign, but after too many times reopening the app will crash anyway
                          var i = $localStorage.images.length;
                        containsbool = false;
                          while (i--) {
                            if ($localStorage.images[i] === image) {
                              containsbool =true;

                            }
                          }
                          if (containsbool == false){
                            storage.addImage(image);
                            $scope.bgmode = true;
                            $scope.local=$localStorage.images;
                            $scope.$apply();
                          }
                        containsbool=true;
                      }
                    });
                }
            }
      }
    });
})

.controller('ProfileCtrl', function($scope, $localStorage, storage, socket, communicationservice) {
    //hockeyapp.trackEvent(null, null, "at_tab_profile");
    // $scope.friends = $localStorage.friends;
    $scope.storage = storage;
    $scope.updateData = function(){
      communicationservice.updateData("profile");
    };
    $scope.number = $localStorage.ownnumber;
    $scope.sendFeedback = function () {
      hockeyapp.feedback();
      console.log("feedback called");
    }
})

.controller('CollectionCtrl', function(
){})

.controller('CollectionDetailCtrl', function($scope, $stateParams, storage) {
  $scope.image = storage.getOwnImage($stateParams.imageId);
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

angular.module('starter.controllers', [])
  .controller('StartCtrl', function ($scope, $css, storage, $state, socket) {
    //controller for welcome screen, here users creates an account
    $scope.storage = storage;
    $scope.start = function (number) {
      if (number != undefined) { //check if that username fits our style
              if (number.length < 3 || number.length > 10) {
                //style don't fit ==> try again
                $scope.errormsg = "Please choose a nickname between 3 and 10 letters";
              } else {
                //now we get the push id to create the user
                if (storage.getPushId() == undefined) {
                  $scope.errormsg = "Ups, pls check your internet connection";
                } else {
                  socket.emit('new_user', number, storage.getPushId());
                }
              }
    }
      //we are waiting for green light of the server
      socket.on('signup', function (msg, number) {
        if (msg == "success") {
          //user was successful created on serverside
          $state.go('tab.collection');
          storage.setNumber(number);
        } else {
          //bad news :( 
          //Tell the user the msg form the server, so he can do better next time
          $scope.errormsg = msg;
        }
      });
    }
  })
  .controller('TabsCtrl', function ($scope, $rootScope, $state) {
    //this controller disables the tab navigation bar for certain views/tabs
    $rootScope.$on('$ionicView.beforeEnter', function () {
      //on default we see the tabbar
      $rootScope.hideTabs = false;
      //disable tabbar when you enter the welcome screen start/welcome screen
      if ($state.current.name === 'tab.collectionstart') {
        $rootScope.hideTabs = true;
      }
    });
  })
  .controller('PhotoCtrl', function ($scope, $base64, $timeout, socket, Camera, storage, $localStorage, $ionicPlatform, $state, voteservice, communicationservice) {
    $ionicPlatform.ready(function () {
      //checking if users created an usable account
      if (storage.getNumber() == "Unknown") {
        //no, then ==> go to welcome page
        $state.go('tab.collectionstart');
      }
    });
    //functions
    //remove an Item
    $scope.removeItem = function (index) {
      console.log("pls add remove action here");
      //call this to delete the image:
      //storage.deleteOwnImage(index);

      //TODO: Some Animation and Delete Button to show up
    };
    //switch to the detail view of the selected image

    $scope.getPhoto = function () {

      //first we define a var to set the settings we use calling the cordova camera,
      var cameraSettings = {
        sourceType: 1, //navigator.camera.PictureSourceType.CAMERA,
        destinationType: 0, //navigator.camera.DestinationType.DATA_URL, // very importend!!! to get base64 and no link NOTE: mybe cause out of memory error after a while
        quality: 100,
        targetWidth: 640,
        targetHeight: 1136,
        saveToPhotoAlbum: true,
        correctOrientation: true
      };
      //calling our service with asynchronously runs the cordova camera plugin
      Camera.getPicture(cameraSettings).then(function (imageData) {
        var onesignal_ids = $localStorage.pushId;
        console.log("onesignal_ids :" + onesignal_ids);
        //adding the phone number and pasing the object to json
        var votes = [];
        //TODO: add local id
        var image = {
          "imageData": imageData, "timestamp": Date.parse(Date()), "transmitternumber": storage.getNumber(),
          "recipients": storage.getFriendswithbenefits(),
          "votes": votes,
          "onesignal_ids": onesignal_ids,
          "localImageId": storage.getlocalImageId()
        };
        //upload the image with our open socket connection
        socket.emit('new_image', (image));
        //store localy now
        storage.addOwnImage(image);



      }, function (err) {
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
    socket.on('image_created', function(serverId, clientId){
      console.log("image_created called");
      if ($localStorage.ownImages == undefined) {
        console.log("images ware undefined called");
        $localStorage.ownImages= [];
      }
      for (var i = 0; i < $localStorage.ownImages.length; i++) {
        if ($localStorage.ownImages[i] != undefined) {
          if ($localStorage.ownImages[i].localImageId == clientId) {
            var temp = localStorage.ownImages[i];
            localStorage.ownImages[i]._id = serverId;
            console.log("localImageId: " + clientId + " has also now the _id: " + serverId + " from the server");
          }
        }
      }
    });
    //TODO: replace the image data with an id
    socket.on('vote_sent_from_server', function (votepackage) {
      for (var i = 0; i < $localStorage.ownImages.length; i++) {
        if ($localStorage.ownImages[i].imageData != undefined) {
                  if ($localStorage.ownImages[i].imageData == votepackage.imageData) {
                    var vote = {"name": votepackage.number, "vote": votepackage.rating};
                    $localStorage.ownImages[i].votes.push(vote);
                    $localStorage.ownImages[i].percantag = voteservice.getPercentage($localStorage.ownImages[i].votes);
                      }
                  }
      }
      $scope.ownImages = $localStorage.ownImages;
    });
    socket.on('updateUserData', function (data) {
      console.log("updateUserData got this additionl data: " + data);
    });

    $scope.doRefresh = function () {

      communicationservice.updateData("collection");
      $timeout(function () {
        //simulate async response
        //Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');

      }, 1000);
    };
    // called when item-container is on-hold for showing the delete button
    $scope.onHold = function () {
      $scope.deleteBtn = true;
      $scope.detailDisabled = true;
      $scope.detailLink = true;
      console.log($scope.deleteBtn);
    };
    // deleting the image
    $scope.onDelete = function (index) {
      $localStorage.ownImages.splice(index, 1);
      console.log("on delete");
      $scope.deleteBtn = false;
      $scope.detailDisabled = false;
    };
    // hiding the delete button
    $scope.resetDelete = function () {
      $scope.deleteBtn = false;
      $scope.detailDisabled = false;
      $scope.detailLink = false;
    };
    $scope.openDetailImage = function (index) {
      console.log("taped");
      $state.go('tab.collection-detail', { imageId: index });
    };
  })

  .controller('CommunityCtrl', function ($scope, socket, $ionicPlatform, $timeout, storage, $localStorage, voteservice, communicationservice) {
    //hockeyapp.trackEvent(null, null, "at_tab_community");
    console.log("platform: " + ionic.Platform.platform());
    console.log(Date.parse(new Date()));
    //this function is called when you hit a vote button
    $scope.vote = function (voting, indexofvotedimage) {
      voteservice.vote(voting, indexofvotedimage);
    };
    $scope.doRefresh = function () {

      console.log('Refreshing!');
      $timeout(function () {
        //simulate async response
        //TODO: call refresh function here
        communicationservice.updateData("community");
        //Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');

      }, 1000);

    };

    $ionicPlatform.ready(function () {
      storage.clearOldImages();
      $scope.local = $localStorage.images;

      //on startup load iamges from storage, if there is sth to load
      //saving reciving images to scope and storage
      socket.on('incoming_image', function (image) {
        storage.addImage(image);
        $scope.local = $localStorage.images;
        $scope.$apply();
      });
    });
  })

  .controller('ProfileCtrl', function ($scope, $localStorage, storage, socket, communicationservice) {
    //hockeyapp.trackEvent(null, null, "at_tab_profile");
    // $scope.friends = $localStorage.friends;
    $scope.storage = storage;
    $scope.updateData = function () {
      communicationservice.updateData("profile");
    };
    $scope.number = $localStorage.ownnumber;
    $scope.sendFeedback = function () {
      hockeyapp.feedback();
      console.log("feedback called");
    }
  })

  .controller('CollectionCtrl', function (
  ) { })

  .controller('CollectionDetailCtrl', function ($scope, $stateParams, storage) {
    $scope.image = storage.getOwnImage($stateParams.imageId);
  })

  .controller('FriendSelectCtrl', function ($scope, storage, $ionicPlatform) {
    $ionicPlatform.ready(function () {
      $scope.contacts = storage.getContacts();
    });
    //  save/delete contact to localStorage
    $scope.checkFriend = function (index, number, value) {
      storage.editFriend(index, number, value);
    };
    //fetch all data from the phone again
    $scope.updateContacts = function () {
      console.log("updated");
      $scope.contacts = storage.loadContacts();
    }
  });

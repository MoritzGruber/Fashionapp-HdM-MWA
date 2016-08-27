angular.module('starter.controllers', [])
  .controller('StartCtrl', function ($scope, storage, $state, socket, $ionicHistory) {
    //controller for welcome screen, here users creates an account
    $scope.storage = storage;
    $scope.start = function (number) {
      hockeyapp.trackEvent(null, null, 'User is on startscreen');
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
          //we disable this so the user sees the signup screen only once
          $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
          });
          //user was successful created on serverside
          $state.go('tab.collection');
          storage.setNumber(number);
          hockeyapp.trackEvent(null, null, 'User signup succsessful');
        } else {
          //bad news :(
          //Tell the user the msg form the server, so he can do better next time
          $scope.errormsg = msg;
        }
      });
    }
  })
  .controller('TabsCtrl', function ($scope, $rootScope, $state, socket) {
    //listen to the server for new stuff (socket)
    $scope.socket = socket;
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
  .controller('CollectionCtrl', function ($scope, $base64, $timeout, socket, Camera, storage, $ionicPlatform, $state, supportservice, communicationservice, storageService) {
    $scope.ownImages = [];
    $ionicPlatform.ready(function () {
      //checking if users created an usable account
      if (storage.getNumber() == "Unknown") {
        //no, then ==> go to welcome page
        $state.go('tab.collectionstart');
      }
      //Initializing
      //load own images into the scope
      storageService.getOwnImages().then(function (loadedOwnImages) {
        $scope.ownImages = loadedOwnImages;
        //calling the calculate percentage function for each image
        for (var i = 0; i < $scope.ownImages.length; i++) {
          $scope.ownImages[i].percantag = supportservice.calculatePercentage($scope.ownImages[i].votes);
        }
        console.log('run TROUGH!');
      }).catch(function (err) {
        console.log('error @storageService.getOwnImages: ' + err);
      });
    });
    //listen to the server for new stuff (socket)
    $scope.socket = socket;
    //functions
    //make a picture
    $scope.getPhoto = function () {
      //first we define a var to set the settings we use calling the cordova camera,
      var cameraSettings;
      if (navigator.connection.type == Connection.WIFI || navigator.connection.type == Connection.ETHERNET) {
        //Setting for good internet speed
        cameraSettings = {
          sourceType: 1, //navigator.camera.PictureSourceType.CAMERA,
          destinationType: 0, //navigator.camera.DestinationType.DATA_URL, // very importend!!! to get base64 and no link NOTE: mybe cause out of memory error after a while
          quality: 100,
          targetWidth: 640,
          targetHeight: 1136,
          saveToPhotoAlbum: true,
          correctOrientation: true
        };
      } else {
        //settings for bad internet speed
        cameraSettings = {
          sourceType: 1, //navigator.camera.PictureSourceType.CAMERA,
          destinationType: 0, //navigator.camera.DestinationType.DATA_URL, // very importend!!! to get base64 and no link NOTE: mybe cause out of memory error after a while
          quality: 70,
          targetWidth: 320,
          targetHeight: 640,
          saveToPhotoAlbum: true,
          correctOrientation: true
        };
      }

      //calling our service which asynchronously and returns a promise that cordova camera plugin worked fine
      Camera.getPicture(cameraSettings).then(function (imageData) {
        //packing the imageData in a json object with all data we also need to send it to the server
        var onesignal_ids = storage.getPushId();
        var votes = [];
        var image = {
          "imageData": imageData, "timestamp": Date.parse(Date()), "transmitternumber": storage.getNumber(),
          "recipients": storageService.getFriendsNumbers(),
          "votes": votes,
          "onesignal_ids": onesignal_ids,
          "localImageId": storage.getLocalImageId()
        };

        //store localy now and get local id
        console.log("before addOwnImagecall");
        storageService.addOwnImage(image).then(function (localImageId) {
          image.localImageId = localImageId;
          console.log("we got it");
          //upload the image with our open socket connection
          //socket.emit('new_image', (image));
        });
        //storage.addOwnImage(image);
        //tracking
        hockeyapp.trackEvent(null, null, 'User made a image');
      }, function (err) {
        console.log(err);
      });
    };
    //manually refresh for new data, this handles all the pulldowns
    $scope.doRefresh = function () {
      communicationservice.updateData("collection");
      $timeout(function () {
        //simulate async response
        //Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
        hockeyapp.trackEvent(null, null, 'User made a refresh in collection');
      }, 1000);
    };
    // called when item-container is on-hold for showing the delete button
    $scope.onHold = function () {
      $scope.deleteBtn = true;
      $scope.detailDisabled = true;
      $scope.detailLink = true;
    };
    // deleting the image
    $scope.onDelete = function (index) {
      storage.deleteOwnImage(index);
      $scope.deleteBtn = false;
      $scope.detailDisabled = false;
      hockeyapp.trackEvent(null, null, 'User deleted own image');
    };
    // hiding the delete button
    $scope.resetDelete = function () {
      $scope.deleteBtn = false;
      $scope.detailDisabled = false;
      $scope.detailLink = false;
    };
    //open detail view of the image
    $scope.openDetailImage = function (index) {
      $state.go('tab.collection-detail', {imageId: index});
      hockeyapp.trackEvent(null, null, 'User viewed his own image on detail');
    };
  })

  .controller('CommunityCtrl', function ($scope, socket, $ionicPlatform, $timeout, storage, voteservice, communicationservice) {
    //Initializing
    $ionicPlatform.ready(function () {
      //clear old imagesFromOtherUsers and load imagesFromOtherUsers form storage
      storage.clearOldImagesFromOtherUsers();
      $scope.local = storage.getImagesFromOtherUsers();
      //listen to the server for new stuff (socket)
      $scope.socket = socket;
    });

    //functions
    //this function is called when you hit a vote button
    $scope.vote = function (voting, indexofvotedimage) {
      voteservice.vote(voting, indexofvotedimage);
    };
    //manually refresh for new data, this handles all the pulldowns
    $scope.doRefresh = function () {
      $timeout(function () {
        //simulate async response
        communicationservice.updateData("community");
        //Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
        hockeyapp.trackEvent(null, null, 'User made a refresh in community');
      }, 1000);
    };
  })
  .controller('ProfileCtrl', function ($scope, storage, socket, communicationservice, $state) {
    //Initializing
    //listen to the server for new stuff (socket)
    $scope.socket = socket;
    //to get the number we use storage service
    $scope.storage = storage;

    //functions
    //refresh function
    $scope.updateData = function () {
      communicationservice.updateData("profile");
      hockeyapp.trackEvent(null, null, 'User made a refresh in profile');
    };
    //feedback function, hockeyapp
    $scope.sendFeedback = function () {
      hockeyapp.feedback();
    };
    $scope.selectFriends = function () {
      $state.go('tab.profile-friends');
    }
  })

  .controller('CollectionDetailCtrl', function ($scope, $stateParams, storage, socket, storageService) {
    //listen to the server for new stuff (socket)
    $scope.socket = socket;
    //just get the right image to show out of the link params
    $scope.image = storageService.getOwnImage($stateParams.imageId);
  })

  .controller('FriendsCtrl', function ($scope, storage, socket, storageService, $state) {
    //listen to the server for new stuff (socket)
    $scope.socket = socket;
    $scope.friendList = [];
    $scope.friendsToDelete = [];
    $scope.deleteMode = false;

    //select from phone
    $scope.selectFromPhone = function () {
      $state.go('tab.profile-phonecontacts');
    };

    //get all friends and fill the array to show it
    storageService.getFriends().then(function (resultArrayOfFriends) {
      $scope.friendList = resultArrayOfFriends;
    });
    // add a friend to the array
    $scope.addFriend = function (userName) {
      if (userName != "") {
        storageService.addFriend(userName).then(function (lokiID) {
          $scope.friendList.push({'userName': userName, 'lokiID': lokiID});
          console.log('Added friend successfully');
        });
      }
    };
    //toggle deleteMode
    $scope.toggleDeleteMode = function (index) {
      $scope.deleteMode = !$scope.deleteMode;
      $scope.toggleDeleteList(index);
    };
    //delete all selcted Friends
    $scope.deleteSelectedFriends = function () {
      //delete all selected friends in the array
      storageService.deleteFriends($scope.friendsToDelete).then(function () {
        //also delte the friends in the scope then when done in db
        for (var i = 0; i < $scope.friendList.length; i++) {
          for (var j = 0; j < $scope.friendsToDelete.length; j++) {
            if ($scope.friendList[i].lokiID == $scope.friendsToDelete[j]) {
              $scope.friendList.splice(i, 1);
            }
          }
        }
        //clear the array
        $scope.friendsToDelete = [];
        $scope.deleteMode = false;
      });

    };
    $scope.cancelDelete = function () {
      //clear the array
      $scope.friendsToDelete = [];
      $scope.deleteMode = false;
    };
    //add or remove a friend from the list for friends to be delted
    $scope.toggleDeleteList = function (lokiID) {
      if ($scope.deleteMode) {
        var indexOf = $scope.friendsToDelete.indexOf(lokiID);
        if (indexOf !== -1) {
          //if already exists then remove
          $scope.friendsToDelete.splice(indexOf, 1);
        } else {
          //else we add the friend to the list
          $scope.friendsToDelete.push(lokiID);
        }
      }
    }
  })
  .controller('SelectFriendCtrl', function ($scope, socket, storageService, contacts, $ionicPlatform) {
    //listen to the server for new stuff (socket)
    $scope.socket = socket;

    $ionicPlatform.ready(function() {
      contacts.readContacts(callback); // need to use a callback because reading contacts takes time
    });

    $scope.$on('$ionicView.enter', function(e) {
      contacts.readContacts(callback); // you can read contacts again on enter
    });

    function callback(){ // will get called once all the contacts get read

      $scope.contacts = contacts.getContacts();
    }


  });

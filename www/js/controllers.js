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
  .controller('CollectionCtrl', function ($scope, $base64, $timeout, socket, Camera, storage, $localStorage, $ionicPlatform, $state, supportservice, communicationservice) {
    $ionicPlatform.ready(function () {
      //checking if users created an usable account
      if (storage.getNumber() == "Unknown") {
        //no, then ==> go to welcome page
        $state.go('tab.collectionstart');
      }
    });
    //Initializing
    //prevent null error if empty
    if ($localStorage.ownImages == undefined) {
      $localStorage.ownImages = [];
    }
    $scope.ownImages = $localStorage.ownImages;
    //calling the calculate percentage function for each image
    for (var i = 0; i < $scope.ownImages.length; i++) {
      $scope.ownImages[i].percantag = supportservice.calculatePercentage($scope.ownImages[i].votes);
    }
    //listen to the server for new stuff (socket)
    $scope.socket = socket;
    //functions
    //make a picture
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
      //calling our service which asynchronously and returns a promise that cordova camera plugin worked fine
      Camera.getPicture(cameraSettings).then(function (imageData) {
        //packing the imageData in a json object with all data we also need to send it to the server
        var onesignal_ids = $localStorage.pushId;
        var votes = [];
        var image = {
          "imageData": imageData, "timestamp": Date.parse(Date()), "transmitternumber": storage.getNumber(),
          "recipients": [],
          "votes": votes,
          "onesignal_ids": onesignal_ids,
          "localImageId": storage.getlocalImageId()
        };
        //upload the image with our open socket connection
        socket.emit('new_image', (image));
        //store localy now
        storage.addOwnImage(image);
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

  .controller('CommunityCtrl', function ($scope, socket, $ionicPlatform, $timeout, storage, $localStorage, voteservice, communicationservice) {
    //Initializing
    $ionicPlatform.ready(function () {
      //clear old imagesFromOtherUsers and load imagesFromOtherUsers form storage
      storage.clearOldImages();
      $scope.local = $localStorage.imagesFromOtherUsers;
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
  .controller('ProfileCtrl', function ($scope, $localStorage, storage, socket, communicationservice) {
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
    }
  })

  .controller('CollectionDetailCtrl', function ($scope, $stateParams, storage, socket) {
    //listen to the server for new stuff (socket)
    $scope.socket = socket;
    //just get the right image to show out of the link params
    $scope.image = storage.getOwnImage($stateParams.imageId);
  });

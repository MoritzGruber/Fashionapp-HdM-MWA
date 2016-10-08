angular.module('starter.controllers', [])
  .controller('StartCtrl', function ($scope, $state, socket, $ionicHistory, storageService) {
    //controller for welcome screen, here users creates an account
    $scope.showNumberField = true;
    $scope.number = null;
    $scope.showCodeField = false;
    $scope.storage = storageService;
    var lastSubmittedNumber = 0;
    var pushID = 0;
    $scope.verify = function (code) {
      socket.emit('checkVerify', lastSubmittedNumber, pushID, code);
      $scope.code = null;

    };
    $scope.back = function () {
      $scope.showNumberField = true;
      $scope.number = null;
      $scope.showCodeField = false;
      $scope.code = null;
    };
    $scope.start = function (number) {
      hockeyapp.trackEvent(null, null, 'User is on startscreen');
      if (number != undefined) { //check if that number fits our style
        if (number.length < 4 || number.length > 16) {
          //style don't fit ==> try again
          $scope.errormsg = "Please choose a real mobile phone number";
        } else {
          //now we get the push id to create the user
          storageService.getPushId().then(function (resPushID) {
            pushID = resPushID;
            $scope.showCodeField = true;
            $scope.showNumberField = false;
            lastSubmittedNumber = number;
            socket.emit('startVerify', number, pushID);
            $scope.number = null;
          }).catch(function (err) {
            $scope.errormsg = "Ups, something went wrong";
          });
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
          storageService.addNumber(number);
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
    ionic.Platform.ready(function () {
      $scope.socket = socket;
    });
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
  .controller('CollectionCtrl', function ($scope, $q, $base64, $timeout, socket, Camera, $ionicPlatform, $state, $ionicHistory, supportservice, communicationservice, storageService, $rootScope) {
    $rootScope.ownImages = [];

    $ionicPlatform.ready(function () {
      //checking if users created an usable account
      setTimeout(function () {
        storageService.initDB().then(function () {
          return storageService.getNumber()
        }).then(function (result) {
          if (result == "Unknown") {
            $ionicHistory.nextViewOptions({
              disableAnimate: true,
              disableBack: true
            });
            //no, then ==> go to welcome page
            $state.go('tab.collectionstart');
          }
          //Initializing
          //load own images into the scope
          return storageService.getOwnImages();
        }).then(function (loadedOwnImages) {
          $rootScope.ownImages = loadedOwnImages;
          //calling the calculate percentage function for each image
          for (var i = 0; i < $rootScope.ownImages.length; i++) {
            $rootScope.ownImages[i].percantag = supportservice.calculatePercentage($rootScope.ownImages[i].votes);
          }
          //listen to the server for new stuff (socket)
          $scope.socket = socket;
        }).catch(function (err) {
          console.log(err);
        });

      }, 0);
    });

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
        var image;
        // Promise.join(storageService.getPushId(),storageService.getNumber(), function (pushId, number) {
        //   console.log("Push id: "+pushId+ " Number: "+number);
        // });
        $q.all([storageService.getPushId(), storageService.getNumber(), storageService.getSelectedFriendsNumberArray()]).then(function (result) {
          var votes = [];
          image = {
            "imageData": imageData, "timestamp": Date.parse(Date()), "transmitternumber": result[1],
            "recipients": result[2],
            "votes": votes,
            "onesignal_ids": result[0]
          };
          storageService.addOwnImage(image).then(function (localImageId) {
            //store localy now and get local id
            image.localImageId = localImageId;
            console.log("we got it, local ID = " + localImageId);
            //upload the image with our open socket connection
            socket.emit('new_image', (image));
            $rootScope.ownImages.push(image);
          });
          //tracking
          hockeyapp.trackEvent(null, null, 'User made a image');
        })
      }).catch(function (err) {
        console.log('err in camera get pictue: ' + err);
      })
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
    $scope.debug = function () {
      storageService.getOwnImages().then(function (res) {

        console.log(res);
        console.log($rootScope.ownImages);
      });
    };
    // called when item-container is on-hold for showing the delete button
    $scope.onHold = function () {
      $scope.deleteBtn = true;
      $scope.detailDisabled = true;
      $scope.detailLink = true;
    };
    // deleting the image
    $scope.onDelete = function (scopeindex, lokiindex) {
      storageService.deleteOwnImage(lokiindex);
      $scope.deleteBtn = false;
      $scope.detailDisabled = false;
      $rootScope.ownImages.splice(scopeindex, 1);
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
      if (!$scope.deleteBtn) {
        $state.go('tab.collection-detail', {imageId: index});
        hockeyapp.trackEvent(null, null, 'User viewed his own image on detail');
      }
    };
  })

  .controller('CommunityCtrl', function ($scope, $rootScope, socket, $ionicPlatform, $timeout, voteservice, communicationservice, storageService) {
    //Initializing
    $ionicPlatform.ready(function () {
      //clear old imagesFromOtherUsers and load imagesFromOtherUsers form storage
      storageService.clearOldImagesFromOtherUsers();
      storageService.getImagesFromOtherUsers().then(function (res) {
        $rootScope.local = res;
      }).catch(function (err) {
        console.log(err);
      });
      //listen to the server for new stuff (socket)
      $scope.socket = socket;
    });

    //functions
    //this function is called when you hit a vote button
    $scope.vote = function (voting, indexofvotedimage, scopeindex) {
      voteservice.vote(voting, indexofvotedimage).then(function (res) {
        $rootScope.local.splice(scopeindex, 1);
      }).catch(function (err) {
        console.log(err);
      });
    };
    //manually refresh for new data, this handles all the pulldowns
    $scope.doRefresh = function () {
      console.log($rootScope);
      storageService.getImagesFromOtherUsers().then(function (res) {
        $rootScope.local = res;
      }).catch(function (err) {
        console.log(err);
      });
      communicationservice.updateData("community");
      $timeout(function () {
        //simulate async response
        //Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
        hockeyapp.trackEvent(null, null, 'User made a refresh in community');
      }, 1000);
    };
  })
  .controller('ProfileCtrl', function ($scope, socket, communicationservice, $state, storageService) {
    //Initializing
    //listen to the server for new stuff (socket)
    $scope.socket = socket;
    //to get the number we use storage service
    storageService.getNumber().then(function (resnumber) {
      $scope.number = resnumber;
    }).catch(function (err) {
      console.log('error getting number: ' + err);
    });

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

  .controller('CollectionDetailCtrl', function ($scope, $stateParams, socket, $rootScope, storageService) {
    //listen to the server for new stuff (socket)
    $scope.socket = socket;
    //just get the right image to show out of the link params
    $scope.image = $rootScope.ownImages[$stateParams.imageId];
    // storageService.getOwnImage($stateParams.imageId).then(function (res) {
    //   $scope.image = res;
    // }).catch(function (err) {
    //   console.log(err);
    // });
  })

  .controller('FriendsCtrl', function ($scope, socket, storageService, $state, contacts, $timeout) {
    //listen to the server for new stuff (socket)
    $scope.socket = socket;
    $scope.loading = true;
    $scope.friendList = [];
    $scope.friendsToDelete = [];
    $scope.deleteMode = false;
    $scope.selectedFriends = [];
    storageService.getSelectedFriendsIdsArray().then(function (resArray) {
      $scope.selectedFriends = resArray;
      $scope.$broadcast('scroll.refreshComplete');
    });
    $scope.doRefresh = function () {
      $scope.syncWithPhone();
      $timeout(function () {
        //simulate async response
        //Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
        hockeyapp.trackEvent(null, null, 'User loaded friends from phone with pull down');
      }, 1000);
    };
    //get all friends and fill the array to show it
    storageService.getFriends().then(function (resultArrayOfFriends) {
      if (resultArrayOfFriends.length == 0) {
        $scope.syncWithPhone();
      }
      $scope.friendList = resultArrayOfFriends;
      $scope.loading = false;
    });
    //syncWithPhone == override all contacts with the ones from the phone
    $scope.syncWithPhone = function () {
      $scope.loadingContacts = true;
      contacts.getContacts().then(function (resultArrayOfContacts) {
        storageService.updateFriends(resultArrayOfContacts).then(function (res) {
          $scope.friendList = res;
          $scope.loadingContacts = false;
          console.log("contacts succsessful loaded and saved to database");
          $scope.loading = false;
        });
      });
    };
    //select from phone


    // add a friend to the array
    $scope.addFriend = function (number) {
      if (number != "") {
        storageService.addFriend({'number': number, 'name': 'anonym'}).then(function (lokiID) {
          $scope.friendList.push({'number': number, 'lokiID': lokiID});
          console.log('Added friend successfully');
        });
      }
    };
    //toggle deleteMode
    $scope.toggleDeleteMode = function (index) {
      $scope.deleteMode = !$scope.deleteMode;
      $scope.toggleDeleteList(index);
    };
    $scope.toggleSelect = function (id) {

      var index = $scope.selectedFriends.indexOf(id);
      if (index < 0) {
        //fried was not selected
        //so he gets selected
        storageService.addSelectedFriendByID(id).then(function () {
          $scope.selectedFriends.push(id);
        });
      } else {
        //friend was already selected
        //so we deselct him
        storageService.removeSelectedFriendByID(id).then(function () {
          $scope.selectedFriends.splice(index, 1);
        })
      }
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

    $ionicPlatform.ready(function () {
      contacts.readContacts(callback); // need to use a callback because reading contacts takes time
    });

    $scope.$on('$ionicView.enter', function (e) {
      contacts.readContacts(callback); // you can read contacts again on enter
    });

    function callback() { // will get called once all the contacts get read
      $scope.contacts = contacts.getContacts();
      setTimeout(function () {
        for (var i = 0; i < $scope.contacts.length; i++) {
          var contact = $scope.contacts[i];
          if (contact.phoneNumbers != null && contact.phoneNumbers[0].value.length > 1) {
            storageService.addFriend({
              'number': contact.phoneNumbers[0].value,
              'name': contact.name.formatted
            }).then(function (lokiID) {
              // $scope.friendList.push({'number': contact.phoneNumbers[0].value, 'lokiID': lokiID});
              // console.log('Added friend successfully');
              console.log("one item");
            });
          }
        }
        console.log("run t a");
      }, 3000);


    }


  });

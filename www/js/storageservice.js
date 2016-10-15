//this service is just for storage purposes
//user data such as push_id and number should still be saved in localstorage and images in sql
//user data ==
// push id, number, local image id (that is the counter to match the server ids)

angular.module('starter.services').factory('storageService', ['$q', 'Loki', 'supportservice', '$localStorage', '$rootScope',
  function ($q, Loki, supportservice, $localStorage, $rootScope) {
    var db;
    var ownImages;
    var pushId;
    var ownNumber;
    var friends;
    var imagesFromOtherUsers;
    var selectedFriends;
    var minutesWhenImagesFromOtherUsersAreOutdated = 300;
    return {
      initDB: initDB,
      //userData
      getNumber: getNumber,
      addNumber: addNumber,
      getPushId: getPushId,
      //own Images (collection)
      addOwnImage: addOwnImage,
      deleteOwnImage: deleteOwnImage,
      getOwnImage: getOwnImage,
      addServerImageIdToOwnImage: addServerImageIdToOwnImage,
      addVoteToOwnImage: addVoteToOwnImage,
      getOwnImages: getOwnImages,
      getIdsFromOwnImages: getIdsFromOwnImages,
      //Images from other users (community)
      addImageFromOtherUser: addImageFromOtherUser,
      getImageFromOtherUser: getImageFromOtherUser,
      deleteImageFromOtherUser: deleteImageFromOtherUser,
      getImagesFromOtherUsers: getImagesFromOtherUsers,
      getIdsFromImagesFromOtherUsers: getIdsFromImagesFromOtherUsers,
      clearOldImagesFromOtherUsers: clearOldImagesFromOtherUsers,
      //FRIEND FUNCTIONS:
      addFriend: addFriend,
      getFriends: getFriends,
      deleteFriends: deleteFriends,
      getFriendsNumbers: getFriendsNumbers,
      updateFriends: updateFriends,
      getSelectedFriendsNumberArray: getSelectedFriendsNumberArray,
      getSelectedFriendsIdsArray: getSelectedFriendsIdsArray,
      addSelectedFriendByID: addSelectedFriendByID,
      removeSelectedFriendByID: removeSelectedFriendByID,
      friendNameByNumber: friendNameByNumber
    };
    function initDB() {
      return $q(function (resolve, reject) {
        ionic.Platform.ready(function () {
          console.log('intidb called');
          var adapter = new LokiCordovaFSAdapter({"prefix": "loki"});
          db = new Loki('fittshot.json', {
            autosave: true,
            autosaveInterval: 1000, // 1 second
            adapter: adapter
          });
          var options = {};

          // db.loadDatabase(options, function () {
          //   ownImages = db.getCollection('ownImages');
          //
          //   if (!ownImages) {
          //     console.log("creating neew own Images");
          //     ownImages = db.addCollection('ownImages');
          //   }
          // });
          resolve(true);
        });

      });
    }

    //UserData
    //get the push id and if not found call onesignal plugin
    function getPushId() {
      return $q(function (resolve, reject) {
        //first try local storage
        if ($localStorage.pushId != undefined && $localStorage != null) {
          resolve($localStorage.pushId);
        } else {
          //if local storage dont work try db
          ionic.Platform.ready(function () {
            if (db == undefined) {
              initDB().then(function () {
                run();
              });
            } else {
              run();
            }
            function run() {
              var options = {};
              var object = {};
              console.log(' getPushId from db called');
              db.loadDatabase(options, function () {
                pushId = db.getCollection('pushId');

                if (!pushId || pushId.data[0].pushId !== undefined) {
                  try {
                    //if db dont have the stuff we need to get a new one
                    pushId = db.addCollection('pushId');
                    //get id
                    window.plugins.OneSignal.getIds(function (ids) {
                      object.pushId = ids.userId;
                      pushId.insert(object);
                      $localStorage.pushId = ids.userId;
                      resolve(ids.userId);
                    });
                  } catch (e) {
                    reject("onesignal push notifiactions setup failed " + e);
                  }
                } else {
                  $localStorage.pushId = pushId.data[0].pushId;
                  resolve(pushId.data[0].pushId);
                }
              });
            }

          });
        }
      });
    }

    //getting own number first try localstorage, if this don't work try db
    function getNumber() {
      return $q(function (resolve, reject) {
        if ($localStorage.number != undefined && $localStorage.number != null) {
          resolve("" + $localStorage.number);
        } else {
          var options = {};
          console.log('getNumber from db called');
          db.loadDatabase(options, function () {
            ownNumber = db.getCollection('ownNumber');

            if (!ownNumber) {
              resolve("Unknown");
            }
            else {
              $localStorage.number = (ownNumber.data[0].number);
              resolve("" + ownNumber.data[0].number);

            }
          });
        }
      });
    }

    //setting own number
    function addNumber(newOwnNumber) {
      return $q(function (resolve, reject) {
        $localStorage.number = newOwnNumber;
        var options = {};
        var object = {'number': newOwnNumber};
        db.loadDatabase(options, function () {
          ownNumber = db.addCollection('ownNumber');
          ownNumber.insert(object);
          resolve(true);
        });
      });
    }

    //add a new own image
    function addOwnImage(image) {
      return $q(function (resolve, reject) {
        ownImages = db.getCollection('ownImages');
        var res = ownImages.insert(image);
        console.log(ownImages.data);
        resolve(res.$loki);
      });
    }

    //get all the own images
    function getOwnImages() {

      return $q(function (resolve, reject) {
        var options = {};

        console.log('getOwnImages  called');
        db.loadDatabase(options, function () {
          ownImages = db.getCollection('ownImages');

          if (!ownImages) {
            ownImages = db.addCollection('ownImages');
            console.log("added new collection");
          }
          resolve(ownImages.data);
        });
      });
    }

    //delete an own image
    function deleteOwnImage(index) {

      return $q(function (resolve, reject) {
        var options = {};

        console.log(' deleteOwnImage called');
        db.loadDatabase(options, function () {
          ownImages = db.getCollection('ownImages');

          if (!ownImages) {
            ownImages = db.addCollection('ownImages');
          }

          var tmp = ownImages.findOne({$loki: index});
          if (tmp != undefined && tmp != null) {
            resolve(ownImages.remove(tmp));
          } else {
            resolve(false);
          }
        });
      });
    }

    //get one own image with specific index
    function getOwnImage(index) {

      return $q(function (resolve, reject) {
        var options = {};

        console.log('getOwnImage  called');
        db.loadDatabase(options, function () {
          ownImages = db.getCollection('ownImages');

          if (!ownImages) {
            ownImages = db.addCollection('ownImages');
          }
          //+1 becasue loki starts counting at 1
          index++;
          var res = ownImages.get(index);
          if (res == [] || res == undefined) {
            reject("no image found");
          } else {
            resolve(ownImages.get(index));

          }
        });
      });
    }

    //add server image id to the local image, found by the local image id
    function addServerImageIdToOwnImage(serverId, localImageId) {

      return $q(function (resolve, reject) {
        var options = {};

        console.log('addServerImageIdToOwnImage  called');
        //timeout is needed here to prevent saving db from creating image and this function to interrupt each other and the date would be overritten and lost
        setTimeout(function () {
          db.loadDatabase(options, function () {
            ownImages = db.getCollection('ownImages');
            console.log(ownImages.data);
            if (!ownImages) {
              console.log("creating new collection");
              ownImages = db.addCollection('ownImages');
            }
            var res = ownImages.find({$loki: localImageId});
            console.log(" ownImages.find res = ");
            console.log(res);
            if (res != undefined) {
              res[0].serverId = serverId;
              resolve(true);
            }
            reject("nothing found to add this server id");
          });
        }, 1000);
      });
    }

    //add vote to own image
    function addVoteToOwnImage(votepackage) {

      return $q(function (resolve, reject) {
        var options = {};

        console.log('addVoteToOwnImage  called');
        db.loadDatabase(options, function () {
          ownImages = db.getCollection('ownImages');

          if (!ownImages) {
            ownImages = db.addCollection('ownImages');
          }

          if (Array.isArray(votepackage)) {
            // this is the array from the refrash call
            //handling the array of packages here
            //looping through the array and calling the addSingleVote function every time
            for (var i = 0; i < votepackage.length; i++) {
              addSingleVote(votepackage[i]);
            }
          } else {
            //its only a single vote in the package
            addSingleVote(votepackage);
          }
          resolve(true);
          //add a single vote to one of my own images
          function addSingleVote(vote) {
            var tmp = ownImages.findOne({'serverId': vote._id});
            if (tmp != null) {
              var tmpArray = tmp.votes;
              var user_has_already_voted = false;
              for (var j = 0; j < tmpArray.length; j++) {
                if (tmpArray[j].number == vote.number) {
                  user_has_already_voted = true;
                }
              }
              if (!user_has_already_voted) {
                this.getNameForNumber(vote.number).then(function (resName) {
                  tmpArray.push({"number": vote.number, "vote": vote.rating, "username": resName});
                  tmp.votes = tmpArray;
                  tmp.percantag = supportservice.calculatePercentage(tmpArray);
                  for (var i = 0; i < $rootScope.ownImages.length; i++) {
                    if($rootScope.ownImages[i].imageData == tmp.imageData){
                      console.log('apply to root scope');
                      $rootScope.ownImages[i] = tmp;
                    }
                  }
                  ownImages.update(tmp);
                }).catch(function (err) {
                  console.log(err);
                });
              }
            }
          }
        });
      });
    }

    //get ids from own images
    function getIdsFromOwnImages() {

      return $q(function (resolve, reject) {
        var options = {};

        console.log('getIdsFromOwnImages  called');
        db.loadDatabase(options, function () {
          ownImages = db.getCollection('ownImages');

          if (!ownImages) {
            ownImages = db.addCollection('ownImages');
          }

          var image_ids = [];
          for (var i = 0; i < ownImages.data.length; i++) {
            if (ownImages.data[i].serverId != undefined) {
              image_ids.push(ownImages.data[i].serverId);
            }
          }
          resolve(image_ids);
        });
      });
    }

    //add an image from another user
    function addImageFromOtherUser(image) {

      return $q(function (resolve, reject) {
        var options = {};

        console.log('addImageFromOtherUser  called');
        db.loadDatabase(options, function () {
          imagesFromOtherUsers = db.getCollection('imagesFromOtherUsers');

          if (!imagesFromOtherUsers) {
            imagesFromOtherUsers = db.addCollection('imagesFromOtherUsers');
          }

          resolve (imagesFromOtherUsers.insert(image).$loki);
        });
      });
    }

    //delete an image from another user
    function deleteImageFromOtherUser(lokiindex) {

      return $q(function (resolve, reject) {
        var options = {};

        console.log('deleteImageFromOtherUser  called');
        db.loadDatabase(options, function () {
          imagesFromOtherUsers = db.getCollection('imagesFromOtherUsers');

          if (!imagesFromOtherUsers) {
            return;
          }
          var tmp = imagesFromOtherUsers.findOne({$loki: lokiindex});
          imagesFromOtherUsers.remove(tmp);
          resolve(true);
        });
      });
    }

    //get images from other users
    function getImagesFromOtherUsers() {

      return $q(function (resolve, reject) {
        var options = {};

        console.log('getImagesFromOtherUsers  called');
        db.loadDatabase(options, function () {
          imagesFromOtherUsers = db.getCollection('imagesFromOtherUsers');

          if (!imagesFromOtherUsers) {
            imagesFromOtherUsers = db.addCollection('imagesFromOtherUsers');
          }

          resolve(imagesFromOtherUsers.data);
        });
      });

    }

    function getImageFromOtherUser(index) {

      return $q(function (resolve, reject) {
        var options = {};

        console.log('getImagesFromOtherUsers  called');
        db.loadDatabase(options, function () {
          imagesFromOtherUsers = db.getCollection('imagesFromOtherUsers');

          if (!imagesFromOtherUsers) {
            imagesFromOtherUsers = db.addCollection('imagesFromOtherUsers');
          }
          for (var i = 0; i < imagesFromOtherUsers.data.length; i++) {
            if(imagesFromOtherUsers.data[i].$loki == index){
              resolve(imagesFromOtherUsers.data[i]);
            }
          }
        });
      });
    }

    //get ids from other users images
    function getIdsFromImagesFromOtherUsers() {

      return $q(function (resolve, reject) {
        var options = {};

        console.log('getIdsFromImagesFromOtherUsers  called');
        db.loadDatabase(options, function () {
          imagesFromOtherUsers = db.getCollection('imagesFromOtherUsers');

          if (!imagesFromOtherUsers) {
            imagesFromOtherUsers = db.addCollection('imagesFromOtherUsers');
          }

          //make a list of all image_ids that are in collection (ownImages)
          var arr = new Array();
          for (var i = 0; i < imagesFromOtherUsers.data.length; i++) {
            if (imagesFromOtherUsers.data[i].serverId != undefined) {
              arr.push(imagesFromOtherUsers.data[i].serverId);
            }
          }
          resolve(arr);
        });
      });
    }

    //clear old images from other users
    function clearOldImagesFromOtherUsers(image) {

      return $q(function (resolve, reject) {
        var options = {};

        console.log(' clearOldImagesFromOtherUsers called');
        db.loadDatabase(options, function () {
          imagesFromOtherUsers = db.getCollection('imagesFromOtherUsers');

          if (!imagesFromOtherUsers) {
            imagesFromOtherUsers = db.addCollection('imagesFromOtherUsers');
          }

          for (var i = 0; i < imagesFromOtherUsers.data.length; i++) {
            if (imagesFromOtherUsers.data[i].timestamp < (Date.parse(Date()) - (1000 * minutesWhenImagesFromOtherUsersAreOutdated * 60))) {  //minutesWhenImagesFromOtherUsersAreOutdated stands for some minutes, thats the time when the imagesFromOtherUsers get deleted
              imagesFromOtherUsers.data.splice(i, 1);
            }
          }
        });
        resolve(true);
      });
    }

    //Friends Functions
    function getFriends() {
      return $q(function (resolve, reject) {
        var options = {};
        if (db == undefined) {
          initDB().then(function () {
              loadFriends();
            }
          );
        } else {
          loadFriends();
        }
        function loadFriends() {
          console.log('loadFriends  called');
          db.loadDatabase(options, function () {
            friends = db.getCollection('friends');
            if (!friends) {
              friends = db.addCollection('friends');
            }
            selectedFriends = db.getCollection('selectedFriends');
            if (!selectedFriends) {
              selectedFriends = db.addCollection('selectedFriends');
            }
            console.log(friends.data.length);
            resolve(friends.data);
          });
        }
      });
    }

    //get just the numbers of the friends for backend
    function getFriendsNumbers() {
      return $q(function (resolve, reject) {
        var options = {};
        if (db == undefined) {
          initDB().then(function () {
              loadFriends();
            }
          );
        } else {
          loadFriends();
        }
        function loadFriends() {
          console.log('loadFriends  called');
          db.loadDatabase(options, function () {
            friends = db.getCollection('friends');
            if (!friends) {
              friends = db.addCollection('friends');
            }
            var justFriendsArray = [];
            for (var i = 0; i < friends.data.length; i++) {
              justFriendsArray.push(friends.data[i].number);
            }
            console.log("justFriendsArray length *" + justFriendsArray.length);
            resolve(justFriendsArray);
          });
        }
      });
    }

    function addFriend(friend) {
      return $q(function (resolve, reject) {
        var options = {};
        console.log('addFriend  called');
        db.loadDatabase(options, function () {
          friends = db.getCollection('friends');

          if (!friends) {
            friends = db.addCollection('friends');
          }
          //insert the friend to the collection
          var tmp = friends.insert(friend);
          //return the id
          resolve(tmp.$loki);
        });
      });
    }

    function deleteFriends(arrayOfFriendIds) {
      return $q(function (resolve, reject) {
        var options = {};
        console.log('deleteFriends  called');
        db.loadDatabase(options, function () {
          friends = db.getCollection('friends');

          if (!friends) {
            friends = db.addCollection('friends');
          }
          for (var i = 0; i < arrayOfFriendIds.length; i++) {
            var list = friends.get(arrayOfFriendIds[i]);
            friends.remove(list);
          }
          resolve();
        });
      });
    }

    //getNameForNumber
    function friendNameByNumber(number) {
      return $q(function (resolve, reject) {
        if(number == "99999999999999"){
          resolve("Fittshot Team");
        }
        var options = {};
        console.log('getNameForNumber  called');
        db.loadDatabase(options, function () {
          friends = db.getCollection('friends');

          if (!friends) {
            friends = db.addCollection('friends');
          }
          var name = friends.findOne({'number': number});
          if (name == "" || name == undefined || name == null) {
            console.log('To this number was no name found');
            resolve(" ");
          } else {
            resolve(name.displayName);
          }
        });
      });
    }

    function updateFriends(arrayWithContacts) {
      return $q(function (resolve, reject) {
        var arrayOfFriendsIds = [];
        var options = {};
        if (db == undefined) {
          initDB().then(function () {
              loadFriends();
            }
          );
        } else {
          loadFriends();
        }
        function loadFriends() {
          console.log('updateFriends  called');
          db.loadDatabase(options, function () {
            friends = db.getCollection('friends');
            if (!friends) {
              friends = db.addCollection('friends');
            }
            //get all friends that have the isFriend state (just get the id)
            for (var j = 0; j < friends.data.length; j++) {
              if (friends.data[j].isFriend != null && friends.data[j].isFriend == true) {
                arrayOfFriendsIds.push(friends.data[j].id);
              }
            }
            //clear the old collection by overriding it
            friends.clear();

            //add this states to the new array and add them to the new collection
            for (var j = 0; j < arrayWithContacts.length; j++) {
              if (arrayOfFriendsIds.indexOf(arrayWithContacts[j].id > -1)) {
                arrayWithContacts[j].isFriend = true;
                friends.insert(arrayWithContacts[j]);
              }
            }
            resolve(arrayWithContacts);
          });
        }
      });
      //get an array of all the contacts, that have the flag isFriend
      //Ceep the states of isFriend
      //if there are changes on a item then replace the item and copy the state from the old contact
      //if there are no changes just skip
      //if contact does not exist create it
    }

    function getSelectedFriendsNumberArray() {
      return $q(function (resolve, reject) {
        var options = {};
        if (db == undefined) {
          initDB().then(function () {
              loadFriends();
            }
          );
        } else {
          loadFriends();
        }
        function loadFriends() {
          console.log('getSelectedFriendsNumberArray  called');
          db.loadDatabase(options, function () {
            selectedFriends = db.getCollection('selectedFriends');
            friends = db.getCollection('friends');

            if (!selectedFriends) {
              selectedFriends = db.addCollection('selectedFriends');
            }
            if (!friends) {
              friends = db.addCollection('friends');
            }
            var resArray = [];
            var tmp = [];
            for (var i = 0; i < selectedFriends.data.length; i++) {
              tmp.push(selectedFriends.data[i].id);
            }
            var tmpResult = friends.find({'id': {'$in': tmp}});
            for (var j = 0; j < tmpResult.length; j++) {
              if (tmpResult[j].phoneNumbers[0].value != undefined) {
                resArray.push(tmpResult[j].phoneNumbers[0].value);
              } else {
                console.log("trying to send an image to and contact with no usable number");
              }
            }
            console.log("resArray= " + resArray.length + resArray);
            resolve(resArray);
          });
        }
      });
    }

    function getSelectedFriendsIdsArray() {
      return $q(function (resolve, reject) {
        var options = {};
        if (db == undefined) {
          initDB().then(function () {
              loadFriends();
            }
          );
        } else {
          loadFriends();
        }
        function loadFriends() {
          console.log(' getSelectedFriendsIdsArray called');
          db.loadDatabase(options, function () {
            selectedFriends = db.getCollection('selectedFriends');
            if (!selectedFriends) {
              selectedFriends = db.addCollection('selectedFriends');
            }
            console.log("Currently " + selectedFriends.data.length + " are selected");
            var tmp = [];
            for (var i = 0; i < selectedFriends.data.length; i++) {
              tmp.push(selectedFriends.data[i].id);
            }
            resolve(tmp);
          });
        }
      });
    }

    function addSelectedFriendByID(idOfTheFriendThatWasSelected) {
      return $q(function (resolve, reject) {
        var options = {};
        if (db == undefined) {
          initDB().then(function () {
              loadFriends();
            }
          );
        } else {
          loadFriends();
        }
        function loadFriends() {
          console.log('addSelectedFriendByID  called');
          db.loadDatabase(options, function () {
            selectedFriends = db.getCollection('selectedFriends');
            if (!selectedFriends) {
              selectedFriends = db.addCollection('selectedFriends');
            }
            selectedFriends.insert({id: idOfTheFriendThatWasSelected});
            resolve(true);
          });
        }
      });
    }

    function removeSelectedFriendByID(idOfTheFriendThatWasDeselected) {
      return $q(function (resolve, reject) {
        var options = {};
        if (db == undefined) {
          initDB().then(function () {
              loadFriends();
            }
          );
        } else {
          loadFriends();
        }
        function loadFriends() {
          console.log('removeSelectedFriendByID  called');
          db.loadDatabase(options, function () {
            selectedFriends = db.getCollection('selectedFriends');
            if (!selectedFriends) {
              selectedFriends = db.addCollection('selectedFriends');
            }
            var result = selectedFriends.find({'id': idOfTheFriendThatWasDeselected});
            selectedFriends.remove(result);
            resolve(true);
          });
        }
      });
    }

  }]);


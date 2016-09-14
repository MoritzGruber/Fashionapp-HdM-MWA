//this service is just for storage purposes
//user data such as push_id and number should still be saved in localstorage and images in sql
//user data ==
// push id, number, local image id (that is the counter to match the server ids)

angular.module('starter.services').factory('storageService', ['$q', 'Loki',
  function ($q, Loki) {
    var db;
    var ownImages;
    var pushId;
    var ownNumber;
    var friends;
    var imagesFromOtherUsers;
    var selectedFriends;
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
      deleteImageFromOtherUser: deleteImageFromOtherUser,
      getImagesFromOtherUsers: getImagesFromOtherUsers,
      getIdsFromImagesFromOtherUsers: getIdsFromImagesFromOtherUsers,
      clearOldImagesFromOtherUsers: clearOldImagesFromOtherUsers,
      //FRIEND FUNCTIONS:
      addFriend: addFriend,
      getFriends: getFriends,
      deleteFriends: deleteFriends,
      getFriendsNumbers: getFriendsNumbers,
      getNameForNumber: getNameForNumber,
      updateFriends: updateFriends,
      getSelectedFriendsNumberArray: getSelectedFriendsNumberArray,
      getSelectedFriendsIdsArray: getSelectedFriendsIdsArray,
      addSelectedFriendByID: addSelectedFriendByID,
      removeSelectedFriendByID: removeSelectedFriendByID
    };

    function initDB() {
      console.log('intidb called');
      var adapter = new LokiCordovaFSAdapter({"prefix": "loki"});
      db = new Loki('fittshot.json', {
        autosave: true,
        autosaveInterval: 1000, // 1 second
        adapter: adapter
      });
      var options = {};

      db.loadDatabase(options, function () {
        ownImages = db.getCollection('ownImages');

        if (!ownImages) {
          console.log("creating new db");
          ownImages = db.addCollection('ownImages');
        }
      });
    }

    //UserData
    //get the push id and if not found call onesignal plugin
    function getPushId() {
      return $q(function (resolve, reject) {
        var options = {};

        db.loadDatabase(options, function () {
          pushId = db.getCollection('pushId');

          if (!pushId) {
            try {
              pushId = db.addCollection('pushId');
              //get id
              window.plugins.OneSignal.getIds(function (ids) {
                console.log('Got onesignal ids: ' + JSON.stringify(ids));
                pushId.insert({'userId': ids.userId});
                resolve(ids.userId);
              });
            } catch (e) {
              reject("onesignal push notifiactions setup failed " + e);
            }
          } else {
            resolve(pushId.data[0]);
          }
        });
      });
    }

    //getting own number
    function getNumber() {
      return $q(function (resolve, reject) {
        var options = {};

        db.loadDatabase(options, function () {
          ownNumber = db.getCollection('ownNumber');

          if (!ownNumber) {
            resolve("Unknown");
          } else {
            resolve(ownNumber.data[0]);
          }
        });
      });
    }

    //setting own number
    function addNumber(newOwnNumber) {
      return $q(function (resolve, reject) {
        var options = {};

        db.loadDatabase(options, function () {
          ownNumber = db.addCollection('ownNumber');
          ownNumber.insert(newOwnNumber);
          resolve(true);
        });
      });
    }

    //add a new own image
    function addOwnImage(image) {
      return $q(function (resolve, reject) {
        var options = {};

        db.loadDatabase(options, function () {
          ownImages = db.getCollection('ownImages');

          if (!ownImages) {
            ownImages = db.addCollection('ownImages');
          }
          resolve(ownImages.insert(image).$loki);
        });
      });
    }

    //get all the own images
    function getOwnImages() {

      return $q(function (resolve, reject) {
        var options = {};

        db.loadDatabase(options, function () {
          ownImages = db.getCollection('ownImages');

          if (!ownImages) {
            ownImages = db.addCollection('ownImages');
          }
          resolve(ownImages.data);
        });
      });
    }

    //delete an own image
    function deleteOwnImage(index) {

      return $q(function (resolve, reject) {
        var options = {};

        db.loadDatabase(options, function () {
          ownImages = db.getCollection('ownImages');

          if (!ownImages) {
            ownImages = db.addCollection('ownImages');
          }

          if (ownImages.data[index] != undefined && ownImages.data[index] != null) {
            ownImages.remove(ownImages.data[index]);
            resolve(true);
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

        db.loadDatabase(options, function () {
          ownImages = db.getCollection('ownImages');

          if (!ownImages) {
            ownImages = db.addCollection('ownImages');
          }
          resolve(ownImages.data[index]);
        });
      });
    }

    //add server image id to the local image, found by the local image id
    function addServerImageIdToOwnImage(serverId, localImageId) {

      return $q(function (resolve, reject) {
        var options = {};

        db.loadDatabase(options, function () {
          ownImages = db.getCollection('ownImages');

          if (!ownImages) {
            ownImages = db.addCollection('ownImages');
          }

          for (var i = 0; i < ownImages.data.length; i++) {
            if (ownImages.data[i] != undefined) {
              if (ownImages.data[i].localImageId == localImageId) {
                ownImages.data[i]._id = serverId;
              }
            }
          }

          resolve(true);
        });
      });
    }

    //add vote to own image
    function addVoteToOwnImage(votepackage) {

      return $q(function (resolve, reject) {
        var options = {};

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
          //add a single vote to one of my own images
          function addSingleVote(vote) {
            for (var i = 0; i < ownImages.data.length; i++) {
              if (ownImages.data[i]._id == vote._id) {
                var user_has_already_voted = false;
                //check if the same user has already voted
                for (var j = 0; j < ownImages.data[i].votes.length; j++) {
                  //override if already exist
                  if (ownImages.data[i].votes[j].number == vote.number) {
                    ownImages.data[i].votes[j].vote = vote.rating;
                    user_has_already_voted = true;
                  }
                }
                if (!user_has_already_voted) {
                  //otherwise, we create a new vote on that pic
                  ownImages.data[i].votes.push({"number": vote.number, "vote": vote.rating});
                }
                //after adding a new vote we have calculate the overall percentage again
                ownImages.data[i].percantag = supportservice.calculatePercentage(ownImages.data[i].votes);
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

        db.loadDatabase(options, function () {
          ownImages = db.getCollection('ownImages');

          if (!ownImages) {
            ownImages = db.addCollection('ownImages');
          }

          var image_ids = [];
          for (var i = 0; i < ownImages.data.length; i++) {
            if (ownImages.data[i]._id != undefined) {
              image_ids.push(ownImages.data[i]._id);
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

        db.loadDatabase(options, function () {
          imagesFromOtherUsers = db.getCollection('imagesFromOtherUsers');

          if (!imagesFromOtherUsers) {
            imagesFromOtherUsers = db.addCollection('imagesFromOtherUsers');
          }

          imagesFromOtherUsers.data.push(image);
        });
      });
    }

    //delete an image from another user
    function deleteImageFromOtherUser(index) {

      return $q(function (resolve, reject) {
        var options = {};

        db.loadDatabase(options, function () {
          imagesFromOtherUsers = db.getCollection('imagesFromOtherUsers');

          if (!imagesFromOtherUsers.data) {
            return;
          }

          imagesFromOtherUsers.remove(imagesFromOtherUsers.data[index]);
        });
      });
    }

    //get images from other users
    function getImagesFromOtherUsers() {

      return $q(function (resolve, reject) {
        var options = {};

        db.loadDatabase(options, function () {
          imagesFromOtherUsers = db.getCollection('imagesFromOtherUsers');

          if (!imagesFromOtherUsers) {
            imagesFromOtherUsers = db.addCollection('imagesFromOtherUsers');
          }

          resolve(imagesFromOtherUsers.data);
        });
      });
    }

    //get ids from other users images
    function getIdsFromImagesFromOtherUsers() {

      return $q(function (resolve, reject) {
        var options = {};

        db.loadDatabase(options, function () {
          imagesFromOtherUsers = db.getCollection('imagesFromOtherUsers');

          if (!imagesFromOtherUsers) {
            imagesFromOtherUsers = db.addCollection('imagesFromOtherUsers');
          }

          //make a list of all image_ids that are in collection (ownImages)
          var image_ids = [];
          for (var i = 0; i < imagesFromOtherUsers.data.length; i++) {
            if (imagesFromOtherUsers.data[i]._id != undefined) {
              image_ids.push(imagesFromOtherUsers.data[i]._id);
            }
          }
          return image_ids;
        });
      });
    }

    //clear old images from other users
    function clearOldImagesFromOtherUsers(image) {

      return $q(function (resolve, reject) {
        var options = {};

        db.loadDatabase(options, function () {
          imagesFromOtherUsers = db.getCollection('imagesFromOtherUsers');

          if (!imagesFromOtherUsers) {
            imagesFromOtherUsers = db.addCollection('imagesFromOtherUsers');
          }

          for (var i = 0; i < imagesFromOtherUsers.data.length; i++) {
            if (imagesFromOtherUsers.data[i].timestamp < (Date.parse(Date()) - (1000 * minutesWhenImagesFromOtherUsersAreOutdated * 60))) {  //minutesWhenImagesFromOtherUsersAreOutdated stands for some minutes, thats the time when the imagesFromOtherUsers get deleted
              imagesFromOtherUsers.remove(imagesFromOtherUsers.data[i]);
            }
          }
        });
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
          db.loadDatabase(options, function () {
            friends = db.getCollection('friends');
            if (!friends) {
              friends = db.addCollection('friends');
            }
            var justFriendsArray = [];
            for (var i = 0; i < friends.data.length; i++) {
              justFriendsArray.push(friends.data[i].number);
            }
            resolve(justFriendsArray);
          });
        }
      });
    }

    function addFriend(friend) {
      return $q(function (resolve, reject) {
        var options = {};
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
    function getNameForNumber(number) {
      return $q(function (resolve, reject) {
        var options = {};
        db.loadDatabase(options, function () {
          friends = db.getCollection('friends');

          if (!friends) {
            friends = db.addCollection('friends');
          }
          var name = friends.find({'number': number}).name;
          if (name == "" || name == undefined) {
            console.log('To this number was no name found');
            resolve(number);
          } else {
            resolve(name);
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


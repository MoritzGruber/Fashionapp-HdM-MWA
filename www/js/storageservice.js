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
    var localImageIdCounter;
    var imagesFromOtherUsers;
    return {
      initDB: initDB,
      //userData
      getNumber: getNumber,
      addNumber: addNumber,
      getPushId: getPushId,
      getLocalImageId: getLocalImageIdCounter,

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
      clearOldImagesFromOtherUsers: clearOldImagesFromOtherUsers
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
          console.log("creating neew db");
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
                pushId.insert(ids.userId);
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

    // get localImageId (vurrent counter)
    function getLocalImageIdCounter() {
      return $q(function (resolve, reject) {
        var options = {};

        db.loadDatabase(options, function () {
          localImageIdCounter = db.getCollection('localImageIdCounter');

          if (!localImageIdCounter) {
            //if there is no counter we start from zero
            localImageIdCounter.insert(0);
            localImageIdCounter = db.addCollection('localImageIdCounter');
          } else {
            //add one to the counter and save it again
            var tmp = localImageIdCounter.data[0];
            tmp++;
            localImageIdCounter = db.addCollection('localImageIdCounter');
            localImageIdCounter.insert(tmp);
            resolve(tmp);
          }
        });
      });
    }

    //add a new own image
    function addOwnImage(image) {
      ownImages.insert(image);
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
    function deleteOwnImage() {

      return $q(function (resolve, reject) {
        var options = {};

        db.loadDatabase(options, function () {
          ownImages = db.getCollection('ownImages');

          if (!ownImages) {
            ownImages = db.addCollection('ownImages');
          }

          if (ownImages[index] != undefined && ownImages[index] != null) {
            ownImages.splice(index, 1);
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
          resolve(ownImages.get(index));
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

          for (var i = 0; i < ownImages.length; i++) {
            if (ownImages[i] != undefined) {
              if (ownImages[i].localImageId == localImageId) {
                ownImages[i]._id = serverId;
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
            for (var i = 0; i < ownImages.length; i++) {
              if (ownImages[i]._id == vote._id) {
                var user_has_already_voted = false;
                //check if the same user has already voted
                for (var j = 0; j < ownImages[i].votes.length; j++) {
                  //override if already exist
                  if (ownImages[i].votes[j].number == vote.number) {
                    ownImages[i].votes[j].vote = vote.rating;
                    user_has_already_voted = true;
                  }
                }
                if (!user_has_already_voted) {
                  //otherwise, we create a new vote on that pic
                  ownImages[i].votes.push({"number": vote.number, "vote": vote.rating});
                }
                //after adding a new vote we have calculate the overall percentage again
                ownImages[i].percantag = supportservice.calculatePercentage(ownImages[i].votes);
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
          for (var i = 0; i < ownImages.length; i++) {
            if (ownImages[i]._id != undefined) {
              image_ids.push(ownImages[i]._id);
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

          imagesFromOtherUsers.push(image);
        });
      });
    }

    //delete an image from another user
    function deleteImageFromOtherUser(index) {

      return $q(function (resolve, reject) {
        var options = {};

        db.loadDatabase(options, function () {
          imagesFromOtherUsers = db.getCollection('imagesFromOtherUsers');

          if (!imagesFromOtherUsers) {
            return;
          }

          imagesFromOtherUsers.splice(index, 1);
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

          resolve(imagesFromOtherUsers);
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
          for (var i = 0; i < imagesFromOtherUsers.length; i++) {
            if (imagesFromOtherUsers[i]._id != undefined) {
              image_ids.push(imagesFromOtherUsers[i]._id);
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

          for (var i = 0; i < imagesFromOtherUsers.length; i++) {
            if (imagesFromOtherUsers[i].timestamp < (Date.parse(Date()) - (1000 * minutesWhenImagesFromOtherUsersAreOutdated * 60))) {  //minutesWhenImagesFromOtherUsersAreOutdated stands for some minutes, thats the time when the imagesFromOtherUsers get deleted
              imagesFromOtherUsers.splice(i, 1);
            }
          }
        });
      });
    }

  }]);


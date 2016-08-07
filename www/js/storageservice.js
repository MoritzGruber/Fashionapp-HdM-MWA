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
      // deleteOwnImage: deleteOwnImage,
      // getOwnImage: getOwnImage,
      // addServerImageIdToOwnImage: addServerImageIdToOwnImage,
      // addVoteToOwnImage: addVoteToOwnImage,
      getOwnImages: getOwnImages,
      // getIdsFromOwnImages: getIdsFromOwnImages,
      //Images from other users (community)
      // addImageFromOtherUser: addIaddImageFromOtherUser,
      // deleteImageFromOtherUser: deleteImageFromOtherUser,
      // getImagesFromOtherUsers: getImagesFromOtherUsers,
      // getIdsFromImagesFromOtherUsers: getIdsFromImagesFromOtherUsers,
      // clearOldImagesFromOtherUsers: clearOldImagesFromOtherUsers
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
  }]);


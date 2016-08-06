(function () {
  //this service is just for storage purposes
  //user data such as push_id and number should still be saved in localstorage and images in sql
  //user data ==
  // push id, number, local image id (that is the counter to match the server ids)

  angular.module('starter.services').factory('storageService', ['$q', 'Loki',
    function ($q, Loki) {
      var db;
      var ownImages;
      var children;
      return {
        //local storage user data
        // getNumber: getNumber,
        // addNumber: addNumber,
        //getPushId: getPushId,
        // getLocalImageId: getLocalImageId,
        initDB: initDB,
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

      function addOwnImage(image) {
        ownImages.insert(image);
        console.log('image added' + image);
      }


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
      };
    }]);
})();

(function() {
  //this service is just for storage purposes
  //user data such as push_id and number should still be saved in localstorage and images in sql
  //user data ==
  // push id, number, local image id (that is the counter to match the server ids)

  angular.module('starter.services').factory('storageService', ['$q', 'Loki', storageService]);
  function storageService($q) {
    var _db;
    var _ownImages;
    //COLLECTIOS: ownImages, imagesFromOtherUsers

    return {
      //local storage user data
      getNumber: getNumber,
      getPushId: getPushId,
      getLocalImageId: getLocalImageId,
      //lokijs storage
      initDB: initDB,
      //own Images (collection)
      addOwnImage: addOwnImage,
      deleteOwnImage: deleteOwnImage,
      getOwnImage: getOwnImage,
      addServerImageIdToOwnImage: addServerImageIdToOwnImage,
      addVoteToOwnImage: addVoteToOwnImage,
      getOwnImages: getOwnImages,
      getIdsFromOwnImages: getIdsFromOwnImages,
      //Images from other users (community)
      addImageFromOtherUser: addIaddImageFromOtherUser,
      deleteImageFromOtherUser: deleteImageFromOtherUser,
      getImagesFromOtherUsers: getImagesFromOtherUsers,
      getIdsFromImagesFromOtherUsers: getIdsFromImagesFromOtherUsers,
      clearOldImagesFromOtherUsers: clearOldImagesFromOtherUsers
    };

    function initDB() {
      var adapter = new LokiCordovaFSAdapter({"prefix": "loki"});
      _db = new Loki('fittshotDB',
        {
          autosave: true,
          autosaveInterval: 1000, // 1 second
          adapter: adapter
        });
    };
    // get all all own Images
    function getOwnImages() {

      return $q(function (resolve, reject) {
        var options = {};

        _db.loadDatabase(options, function () {
          _ownImages = _db.getCollection('ownImages');

          if (!_birthdays) {
            _ownImages = _db.addCollection('ownImages');
          }

          resolve(_ownImages);
        });
      });
    }
  }
})();

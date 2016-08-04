(function() {
  //this service is just for storage purposes
  //user data such as push_id and number should still be saved in localstorage and images in sql
  //user data ==
  // push id, number, local image id (that is the counter to match the server ids)

  angular.module('starter.services').factory('storageService', ['$q', storageService]);
  function storageService($q) {
    var _db;
    var _ownImages;
    var _userData;
    var _imagesFromOtherUsers;
    var _votes;
    var _recipients;

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
      // Creates the database or opens if it already exists
      _db = new PouchDB('fittshot', {adapter: 'websql'});
    };
    //
    // function addBirthday(birthday) {
    //   return $q.when(_db.post(birthday));
    // };
    //
    // function updateBirthday(birthday) {
    //   return $q.when(_db.put(birthday));
    // };
    //
    // function deleteBirthday(birthday) {
    //   return $q.when(_db.remove(birthday));
    // };
  }
})();

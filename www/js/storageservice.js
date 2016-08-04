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
      //addNumber: addNumber,
      //getPushId: getPushId,
      // getLocalImageId: getLocalImageId,
      initDB: initDB,
      //own Images (collection)
      //addOwnImage: addOwnImage,
      // deleteOwnImage: deleteOwnImage,
      // getOwnImage: getOwnImage,
      // addServerImageIdToOwnImage: addServerImageIdToOwnImage,
      // addVoteToOwnImage: addVoteToOwnImage,
      // getOwnImages: getOwnImages,
      // getIdsFromOwnImages: getIdsFromOwnImages,
      //Images from other users (community)
      // addImageFromOtherUser: addIaddImageFromOtherUser,
      // deleteImageFromOtherUser: deleteImageFromOtherUser,
      // getImagesFromOtherUsers: getImagesFromOtherUsers,
      // getIdsFromImagesFromOtherUsers: getIdsFromImagesFromOtherUsers,
      // clearOldImagesFromOtherUsers: clearOldImagesFromOtherUsers
    };

    function initDB() {
      // Creates the database or opens if it already exists
      _db = window.sqlitePlugin.openDatabase({name: "fittshot.db", location: 'default'});
      //create user dataTable
      _db.transaction(function(transaction) {
        transaction.executeSql('CREATE TABLE IF NOT EXISTS userData (_id integer PRIMARY KEY AUTOINCREMENT, ownNumber text, pushId text)', [],
            function(tx, result) {
              alert("Table created successfully");
            },
            function(error) {
              alert("Error occurred while creating the table.");
            });
      });
      _db.transaction(function(transaction) {
        transaction.executeSql('INSERT INTO userData (ownNumber, pushId) VALUES ("unknown", "") WHERE NOT EXISTS (SELECT name FROM table_listnames WHERE name="value")', [],
            function(tx, result) {
              alert("Table created successfully");
            },
            function(error) {
              alert("Error occurred while creating the table.");
            });
      });
    }
    function getNumber() {
      _db.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM userData', [], function (tx, results) {
          alert(results);
        }, null);
      });
    }
    function insertUserNumber (ownNumber) {
      var query = "INSERT INTO userData (ownNumber, pushId) VALUES (?,?)";
      $cordovaSQLite.execute(db, query, [ownNumber, pushId]).then(function(res) {
        console.log("Insert ID: " + res.insertId);
      }, function (err) {
        console.error(err);
      });
    }
  }
})();

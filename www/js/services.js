angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array
  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Glasses',
    lastText: 'Gucci',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Dress',
    lastText: 'Zara',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Scarf',
    lastText: 'Stradivarius',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'T-shirt',
    lastText: 'Zara',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Shoes',
    lastText: 'Aldo',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});

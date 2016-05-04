angular.module('starter.services', [])

//this factory is used to establish a socketio connect to our server
//returning the socket
.factory('socket',function(socketFactory){
	//Create socket and connect to (serverip)
 	var myIoSocket = io.connect('http://46.101.216.38:3000'); //<-- place your ip in here if you docker/etc is running on a diffrent one
  	mySocket = socketFactory({
    	ioSocket: myIoSocket
  	});

	return mySocket;
})

//this is servie is to storage variables globally and share them between tabs/controllers
//TODO: Later we have to save this data to the phone memory to make it persist when closing and reopen the app
.service('storage', function ($localStorage) {
  return {
      getNumber: function () {
          if ($localStorage.ownnumber == undefined){
              console.log("number unknown provided");
              return "no number defined yet";
          } else {
              console.log("stored number provided");
              return $localStorage.ownnumber;
          }
      },
      setNumber: function(value) {
          console.log("number saved to localStorage");
          $localStorage.ownnumber = value;
      },
      addImage: function (image) {
          console.log($localStorage);
          if ($localStorage.images == undefined) {
              $localStorage.images= [];
          }
          $localStorage.images.push(image);
      },
      getImages: function () {
          console.log("image loaded");
          return $localStorage.images;
      }
  };
})
//service for voting
.service('voteservice', function ($localStorage) {
  return {
      vote: function (voting, indexofvotedimage) {
            //send vote
                //succsess:
                    //destory object
                    $localStorage.images.splice(indexofvotedimage, 1);
                //error:
                    //show error message
            //end of send vote
            console.log("Bob liked this image == " + voting);
      }
  };
})

.factory('Camera', ['$q', function($q) {
 // creating camera factory calls codova plugin to load native camera app
 //$q is used to give the controller a promise, check out the promise Api of angular for more details
 //$q and deferred is asynchronous programing and try, catch, throw is synchronous programming
 //== A service that helps you run functions asynchronously, and use their return values (or exceptions) when they are done processing
  return {
    getPicture: function(options) {
      // this is the same as try and catch, just asynchronous
      var deferred = $q.defer();
      navigator.camera.getPicture(function(result) {
        //calling codova plugin
        deferred.resolve(result);
      }, function(err) {
        deferred.reject(err);
      }, options);

      //handling the results
      return deferred.promise;
      //return a promise
    }

  }
}])


.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
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

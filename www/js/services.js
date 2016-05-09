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
      },
      //retun array of friends(phonenumbers)
      getFriends: function () {
          //create if undefined
          if($localStorage.friends == undefined){
              $localStorage.friends = [];
          }
          return $localStorage.friends;
      },
      editFriend: function (index, number, value) {
          console.log("edited");
          //  save/delete contact to localStorage
          //check if the phone number slot of the contact is acutal filled, without storing makes no sense
          if (number == undefined) {
              alert("Sry, this contact has no phonenumber");
          } else {
              if (value) {
                  //value == ture, toggel is postive now
                  //push the toggeld contact
                  $localStorage.friends.push(number);
              } else {
                  //loop throgh local array and remove the selected contact
                  for (var i = 0; i < $localStorage.friends.length; i++) {
                      if ($localStorage.friends[i] == number) {
                          $localStorage.friends.splice(i,1);
                      }
                  }
              }
          }
      },
      loadContacts: function () {
          //synchronise the contacts between phone and local storage
          navigator.contacts.find(
          [navigator.contacts.fieldType.displayName],
          gotContacts,
          null);
          function gotContacts(result) {
              $localStorage.contacts = result;

          }
          return $localStorage.contacts;
      },
      //Contact is anybody in your native phonecontactlist and friends are the selected once
      getContacts: function () {
          //retun the contacts from local storage
          //or fetch them again from phone , TODO: error handling
          if($localStorage.contacts == undefined || $localStorage.contacts.length < 2){
              $localStorage.contacts = this.loadContacts();
          }
          return $localStorage.contacts;
      },

  };
})
//service for voting
.service('voteservice', function ($localStorage, socket, storage) {
  return {
      vote: function (voting, indexofvotedimage) {
            //send vote
            socket.emit('vote',($localStorage.images[indexofvotedimage].imageId, storage.getNumber(), voting));
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
}]);

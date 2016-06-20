angular.module('starter.services', [])

//this factory is used to establish a socketio connect to our server
//returning the socket
  .factory('socket', function (socketFactory, $localStorage) {
    //Create socket and connect to (server ip)
    var myIoSocket = io.connect('http://46.101.122.130:3000'); //<-- place your ip in here if you docker/etc is running on a other one
    var mySocket = socketFactory({
      ioSocket: myIoSocket
    });
    //sending pushId to sever so we mark him as online
    mySocket.emit('join', $localStorage.pushId);
  return mySocket;
})

//this is service is to storage variables globally and share them between tabs/controllers
  .service('storage', function ($localStorage, socket, voteservice) {
  return {
    //get pushId
    getPushId: function () {
      if ($localStorage.pushId == undefined) {
        //setting up onesignal for push notifications
        var notificationOpenedCallback = function(jsonData) {
          //what happen in the open app on push
          alert("Notification received:\n" + JSON.stringify(jsonData));
          //TODO: Call update service here to get new data loaded
          console.log('didReceiveRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
        };
        try{
          //register
          window.plugins.OneSignal.init("f132b52a-4ebf-4446-a8e0-b031f40074da",
            {googleProjectNumber: "378633166857"},
            notificationOpenedCallback);
          //get id
          window.plugins.OneSignal.getIds(function(ids) {
            console.log('Got onesignal ids: ' + JSON.stringify(ids));
            $localStorage.pushId = ids.userId;
          });} catch(e){
          console.log("onesignal push notifiactions setup failed " + e);
        }
      }
      return $localStorage.pushId;
    },
    //get localImageId
    getlocalImageId: function () {
      if ($localStorage.localImageId == undefined) {
        $localStorage.localImageId = 0;
      }
      //we increase this counter every time so there never are two+ images with the same counter
      return $localStorage.localImageId++;
    },
      //get your own number
      getNumber: function () {
          if ($localStorage.ownnumber == undefined){
              return "Unknown";
          } else {
              return $localStorage.ownnumber;
          }
      },
      //set your own number
      setNumber: function(value) {
          console.log("number saved to localStorage");
          $localStorage.ownnumber = value;
      },
      //Own images are the images where you recive your votings
      //save own images
      addOwnImage: function (image) {
          if ($localStorage.ownImages == undefined){
             $localStorage.ownImages= [];
          }
          $localStorage.ownImages.unshift(image);
      },
      //load own images
      getOwnImages: function () {
          if ($localStorage.ownImages == undefined){
             $localStorage.ownImages= [];
          }
          return $localStorage.ownImages;
      },
      getOwnImage: function (index) {
          if ($localStorage.ownImages == undefined){
             $localStorage.ownImages= [];
          }
          return $localStorage.ownImages[index];
      },
      deleteOwnImage: function (index) {
        if($localStorage.ownImages[index] != undefined && $localStorage.ownImages[index] != null){
            $localStorage.ownImages.splice (index, 1);
            return true;
        } else {
            return false;
        }

      },
      //adding a image in the community storage
      addImage: function (image) {
          if ($localStorage.images == undefined) {
              $localStorage.images= [];
          }
          $localStorage.images.push(image);
      },
      //retun the stored community images
      getImages: function () {
          if ($localStorage.images == undefined) {
              $localStorage.images= [];
          }
          return $localStorage.images;
      },
      //clears the inbox of inmages in the community tab if they are outdated
      clearOldImages: function () {
        if ($localStorage.images == undefined) {
          $localStorage.images= [];
        }
        for (var i = 0; i < $localStorage.images.length; i++) {
          console.log("chick check "+$localStorage.images[i].timestamp+ "<" +(Date.parse(Date())-(1000*30*60)));
          if($localStorage.images[i].timestamp < (Date.parse(Date())-(1000*30*60))){  //30 stands for 30 minutes, thats the time when the images get deleted
            $localStorage.images.splice (i, 1);
          }

        }
      },
      //apply the vote form other user to own votes to ownImages
      addVote: function (votepackage) {
        for (var i = 0; i < $localStorage.ownImages.length; i++) {
          if ($localStorage.ownImages[i]._id == votepackage._id) {
            var user_has_already_voted = false;
            //check if the same user has already voted
            for (var j=0; j < $localStorage.ownImages[i].votes.length; j++){
              //override if already exist
              if( $localStorage.ownImages[i].votes[j].number == votepackage.number){
                $localStorage.ownImages[i].votes[j].vote = votepackage.rating;
                user_has_already_voted = true;
              }
            }
            if (!user_has_already_voted) {
              //otherwise, we create a new vote on that pic
              var vote = {"number": votepackage.number, "vote": votepackage.rating};
              $localStorage.ownImages[i].votes.push(vote);
            }
            //after adding a new vote we have calculate the overall percentage again
            $localStorage.ownImages[i].percantag = voteservice.getPercentage($localStorage.ownImages[i].votes);
          }
        }
      },
      //return friendlist / array of friends(phonenumbers)
      getFriends: function () {
          //create if undefined
          if($localStorage.friends == undefined){
              $localStorage.friends = [];
          }
          return $localStorage.friends;
      },
      //retun friends with benefits
      getFriendswithbenefits: function () {
          //create if undefined
          if($localStorage.friends == undefined){
              $localStorage.friends = [];
          }
          var friendswithbenefits = [];
          //copy array and add state
          for (var i = 0; i < $localStorage.friends.length; i++) {
              friendswithbenefits[i] = {};
              friendswithbenefits[i].number = $localStorage.friends[i];
              friendswithbenefits[i].state = 0;
              //the benefit is that these friends have a voting state
              //this state is used for calculating the persentage
              //0 = not voted 1 = positive 2 = negative
          }
          return friendswithbenefits;
      },
      //add or remove a friend
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
                  if($localStorage.friends == undefined){
                      $localStorage.friends = [];
                  }
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
      //synchronise the contacts between native phone and local storage of the App
      loadContacts: function () {
          navigator.contacts.find(
          [navigator.contacts.fieldType.displayName],
          gotContacts,
          null);
          function gotContacts(result) {
              $localStorage.contacts = result;

          }
          return $localStorage.contacts;
      },
      //return Contact == anybody in your native phonecontactlist and friends are the selected once
      getContacts: function () {
          //retun the contacts from local storage
          //or fetch them again from phone , TODO: error handling
          if($localStorage.contacts == undefined || $localStorage.contacts.length < 2){
              $localStorage.contacts = this.loadContacts();
          }
          return $localStorage.contacts;
      }
  };
})
.service('communicationservice', function (socket, $localStorage) {
  return{
    updateData: function (update_trigger) {
      //pull incoming votes, etc. of the past 30 minutes from the server
      socket.emit('user_refresh', $localStorage.ownnumber, update_trigger);
    }
  };
})
//service for voting
  .service('voteservice', function ($localStorage, socket) {
  return {
      //this is the basic voting function, called in the community tab
      vote: function (voting, indexofvotedimage) {
            //send vote
        var package_ = {
                "_id":$localStorage.images[indexofvotedimage]._id,
          "number": $localStorage.ownnumber,
                "rating": voting
            };
        socket.emit('vote', package_);
        //TODO: keep images on connection/server problems
                //succsess:
                    //destory object
                    $localStorage.images.splice(indexofvotedimage, 1);
                //error:
                    //show error message
            //end of send vote
      },
      //calculate the percentage of positive votes # just math
      getPercentage: function (recipenctsarry) {

          var counter_positive = 0;
          var counter_negative = 0;
          if (recipenctsarry == undefined) {
              return 0;
          }
          for (var i = 0; i < recipenctsarry.length; i++) {
              if (recipenctsarry[i].vote == true) {
                  counter_positive++;
              }else if (recipenctsarry[i].vote == false ) {
                  counter_negative++;
              }
          }
          //if the are no positive votes, we devide throu 0 , that is NaN #illegal
          if (isNaN(((((counter_positive) / (counter_negative + counter_positive)))))) {
              return 0.0;
          }
          return ((((counter_positive) / (counter_negative + counter_positive))));
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
      //calling codova plugin
      navigator.camera.getPicture(function(result) {
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

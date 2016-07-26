angular.module('starter.services', [])

//this factory is used to establish a socketio connect to our server
//returning the socket
  .factory('socket', function (socketFactory, $localStorage, storage) {
    //Create socket and connect to (server ip)
    var myIoSocket = io.connect('http://46.101.122.130:3000'); //<-- place your ip in here if you docker/etc is running on a other one
    var mySocket = socketFactory({
      ioSocket: myIoSocket
    });
    //sending pushId to sever so we mark him as online
    mySocket.emit('join', $localStorage.pushId);
    //this event is fired when when the image was successful created and we get the id from the server back
    mySocket.on('image_created', function (serverId, clientId) {
      //apply the id given by the server to our clint image
      for (var i = 0; i < $localStorage.ownImages.length; i++) {
        if ($localStorage.ownImages[i] != undefined) {
          if ($localStorage.ownImages[i].localImageId == clientId) {
            var temp = $localStorage.ownImages[i];
            $localStorage.ownImages[i]._id = serverId;
          }
        }
      }
    });
    //receive a vote
    mySocket.on('vote_sent_from_server', function (votepackage) {
      storage.addVote(votepackage);
    });
    //images form other users are incoming
    mySocket.on('incoming_image', function (image) {
      var image_is_already_in_storage = false;
      if ($localStorage.imagesFromOtherUsers == null || $localStorage.imagesFromOtherUsers == undefined) {
        $localStorage.imagesFromOtherUsers = [];
      }
      for (var i = 0; i < $localStorage.imagesFromOtherUsers.length; i++) {
        if (image._id == $localStorage.imagesFromOtherUsers[i]._id) {
          image_is_already_in_storage = true;
        }
      }
      if (!image_is_already_in_storage) {
        storage.addImage(image);
      }
    });
    return mySocket;
  })

  //this is service is to storage variables globally and share them between tabs/controllers
  .service('storage', function ($localStorage, supportservice) {
    var minutesWhenImagesAreOutdated = 120;
    return {
      //get pushId
      getPushId: function () {
        if ($localStorage.pushId == undefined) {
          try {
            //get id
            window.plugins.OneSignal.getIds(function (ids) {
              console.log('Got onesignal ids: ' + JSON.stringify(ids));
              $localStorage.pushId = ids.userId;
            });
          } catch (e) {
            console.log("onesignal push notifiactions setup failed " + e);
          }
        }
        return $localStorage.pushId;
      },
      //get localImageId, so we can apply the serverImageId later to the right image
      getlocalImageId: function () {
        if ($localStorage.localImageId == undefined) {
          $localStorage.localImageId = 0;
        }
        //we increase this counter every time so there never are two+ imagesFromOtherUsers with the same counter
        return $localStorage.localImageId++;
      },
      //get your own number
      getNumber: function () {
        if ($localStorage.ownnumber == undefined) {
          return "Unknown";
        } else {
          return $localStorage.ownnumber;
        }
      },
      //set your own number, currently not in usage
      setNumber: function (value) {
        console.log("number saved to localStorage");
        $localStorage.ownnumber = value;
      },
      //Own imagesFromOtherUsers are the imagesFromOtherUsers where you recive your votings
      //save own imagesFromOtherUsers
      addOwnImage: function (image) {
        if ($localStorage.ownImages == undefined) {
          $localStorage.ownImages = [];
        }
        $localStorage.ownImages.unshift(image);
      },
      getOwnImage: function (index) {
        if ($localStorage.ownImages == undefined) {
          $localStorage.ownImages = [];
        }
        return $localStorage.ownImages[index];
      },
      deleteOwnImage: function (index) {
        if ($localStorage.ownImages[index] != undefined && $localStorage.ownImages[index] != null) {
          $localStorage.ownImages.splice(index, 1);
          return true;
        } else {
          return false;
        }
      },
      //adding a image in the community storage
      addImage: function (image) {
        if ($localStorage.imagesFromOtherUsers == undefined) {
          $localStorage.imagesFromOtherUsers = [];
        }
        $localStorage.imagesFromOtherUsers.push(image);
      },
      //apply the vote form other user to own votes to ownImages
      addVote: function (votepackage) {
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
          for (var i = 0; i < $localStorage.ownImages.length; i++) {
            if ($localStorage.ownImages[i]._id == vote._id) {
              var user_has_already_voted = false;
              //check if the same user has already voted
              for (var j = 0; j < $localStorage.ownImages[i].votes.length; j++) {
                //override if already exist
                if ($localStorage.ownImages[i].votes[j].number == vote.number) {
                  $localStorage.ownImages[i].votes[j].vote = vote.rating;
                  user_has_already_voted = true;
                }
              }
              if (!user_has_already_voted) {
                //otherwise, we create a new vote on that pic
                var vote = {"number": vote.number, "vote": vote.rating};
                $localStorage.ownImages[i].votes.push(vote);
              }
              //after adding a new vote we have calculate the overall percentage again
              $localStorage.ownImages[i].percantag = supportservice.calculatePercentage($localStorage.ownImages[i].votes);
            }
          }
        }
      },
      //clears the inbox of inmages in the community tab if they are outdated
      clearOldImages: function () {
        if ($localStorage.imagesFromOtherUsers == undefined) {
          $localStorage.imagesFromOtherUsers = [];
        }
        for (var i = 0; i < $localStorage.imagesFromOtherUsers.length; i++) {
          console.log("chick check " + $localStorage.imagesFromOtherUsers[i].timestamp + "<" + (Date.parse(Date()) - (1000 * 30 * 60)));
          if ($localStorage.imagesFromOtherUsers[i].timestamp < (Date.parse(Date()) - (1000 * minutesWhenImagesAreOutdated * 60))) {  //minutesWhenImagesAreOutdated stands for some minutes, thats the time when the imagesFromOtherUsers get deleted
            $localStorage.imagesFromOtherUsers.splice(i, 1);
          }

        }
      }
    };
  })
  .service('communicationservice', function (socket, $localStorage) {
    return {
      // request new vots on own imagesFromOtherUsers and request to imagesFromOtherUsers from other users form the server
      updateData: function (update_trigger) {
        //make a list of all image_ids that are in collection (ownImages)
        var image_ids_to_refresh = [];
        for (var i = 0; i < $localStorage.ownImages.length; i++) {
          if ($localStorage.ownImages[i]._id != undefined) {
            image_ids_to_refresh.push($localStorage.ownImages[i]._id);
          }
        }
        //pull incoming votes, of the past 120 minutes from the server
        //update_trigger is "community", "collection" or "profile"
        socket.emit('user_refresh', $localStorage.ownnumber, update_trigger, image_ids_to_refresh);
      }
    };
  })
  //service for voting
  .service('voteservice', function (socket, $localStorage) {
    return {
      //this is the voting function, called in the community tab
      vote: function (voting, indexofvotedimage) {
        //send vote
        var package_ = {
          "_id": $localStorage.imagesFromOtherUsers[indexofvotedimage]._id,
          "number": $localStorage.ownnumber,
          "rating": voting,
          "recipient_number": $localStorage.imagesFromOtherUsers[indexofvotedimage].transmitternumber
        };
        socket.emit('vote', package_);
        //destory object after sending the vote, currently we assume internet always works
        $localStorage.imagesFromOtherUsers.splice(indexofvotedimage, 1);
        hockeyapp.trackEvent(null, null, 'User made a vote');
      }
    };
  })
  .service('supportservice', function () {
    return {
      calculatePercentage: function (recipenctsarry) {

        var counter_positive = 0;
        var counter_negative = 0;
        if (recipenctsarry == undefined) {
          return 0;
        }
        for (var i = 0; i < recipenctsarry.length; i++) {
          if (recipenctsarry[i].vote == true) {
            counter_positive++;
          } else if (recipenctsarry[i].vote == false) {
            counter_negative++;
          }
        }
        //if the are no positive votes, we divide by 0 , that is NaN ==> illegal
        if (isNaN(((((counter_positive) / (counter_negative + counter_positive)))))) {
          return 0.0;
        } else {
          //else we return the correct percentage
          return ((((counter_positive) / (counter_negative + counter_positive))));
        }
      }

    };
  })
  .factory('Camera', ['$q', function ($q) {
    // creating camera factory calls codova plugin to load native camera app
    //$q is used for asyc. running and .defer to return a promise
    return {
      getPicture: function (options) {
        // this is the same as try and catch, just asynchronous, and we return a promise instead of a callback
        var deferred = $q.defer();
        //calling cordova pluign
        navigator.camera.getPicture(function (result) {
          deferred.resolve(result);
        }, function (err) {
          deferred.reject(err);
        }, options);

        //handling the results
        return deferred.promise;
        //return a promise
      }

    }
  }]);

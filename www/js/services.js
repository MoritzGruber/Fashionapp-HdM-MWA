angular.module('starter.services', [])

//this factory is used to establish a socketio connect to our server
//returning the socket
  .factory('socket', function ($rootScope, socketFactory, storageService) {
    //Create socket and connect to (server ip)
    var myIoSocket = io.connect('http://138.68.74.156:3000'); //<-- place your ip in here if you docker/etc is running on a other one
    var mySocket = socketFactory({
      ioSocket: myIoSocket
    });
    //sending pushId to sever so we mgark him as online

    storageService.getPushId().then(function (res) {
      mySocket.emit('join', res);
    }).catch(function (err) {
      console.log(err);
    });
    //this event is fired when when the image was successful created and we get the id from the server back
    mySocket.on('image_created', function (serverId, clientId) {
      storageService.addServerImageIdToOwnImage(serverId, clientId);
    });
    //receive a vote
    mySocket.on('vote_sent_from_server', function (votepackage) {
      console.log('Vote empfangen: '+'Vote empfangen: '+votepackage);
      console.log(votepackage);
      storageService.addVoteToOwnImage(votepackage).then(function (res) {
          $rootScope.ownImages
          }).catch(function (err) {
            console.log(err);
          });
    });
    //images form other users are incoming
    mySocket.on('incoming_image', function (image) {
      console.log(' incoming_image'+ $rootScope);
      var image_is_already_in_storage = false;
      storageService.getIdsFromImagesFromOtherUsers().then(function (res) {
        var imageIdsAlreadyExistingInCommunity = res;
        console.log('res = '+JSON.stringify(res));
        for (var i = 0; i < imageIdsAlreadyExistingInCommunity.length; i++) {
          if (image._id == imageIdsAlreadyExistingInCommunity[i]._id) {
            //there is a image with the same id
            image_is_already_in_storage = true;
            console.log('image already exists ');
          }
        }
        if (!image_is_already_in_storage) {
          //there was no image with the same id
          console.log('add iamge :'+ image);
          storageService.addImageFromOtherUser(image).then(function (res) {
            $rootScope.local.push(image);
          }).catch(function (err) {
            console.log(err);
          });
        }
      }).catch(function (err) {
        console.log('ERROR' + err);
      });
    });
    return mySocket;
  })
  .service('communicationservice', function (socket, storageService, $q) {
    return {
      // request new votes on own imagesFromOtherUsers and request to imagesFromOtherUsers from other users form the server
      updateData: function (update_trigger) {
        $q.all([ storageService.getNumber(), storageService.getIdsFromOwnImages() ]).then(function (result) {
          socket.emit('user_refresh', result[0], update_trigger, result[1]);
        }).catch(function (err) {
          console.log('error getting number or ids of ownImages in communicationservice.updateData: '+err);
        });
      }
    };
  })
  //service for voting
  .service('voteservice', function (socket, storageService, $q) {
    return {
      //this is the voting function, called in the community tab
      vote: function (voting, lokiindex) {
        return $q(function (resolve, reject) {
          $q.all([ storageService.getNumber(), storageService.getImageFromOtherUser(lokiindex) ]).then(function (result) {
            //send vote
            console.log('result'+result[1]);
            var package_ = {
              "_id": result[1]._id,
              "number": result[0],
              "rating": voting,
              "recipient_number": result[1].transmitternumber
            };
            socket.emit('vote', package_);
            //destory object after sending the vote, currently we assume internet always works
            hockeyapp.trackEvent(null, null, 'User made a vote');
            console.log('waaaas loos');
            return storageService.deleteImageFromOtherUser(lokiindex);
          }).then(function (res) {
            console.log('aaaaab? ');
            resolve(true);
          }).catch(function (err) {
            reject(err);
          });
        });
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
  }])
  //for getting all contacts
  .factory('contacts', ['$q' , function ($q) {

    var allContacts;
    var callBackFunction;

    function getContacts() {
      return $q(function (resolve, reject) {
        readContacts(function () {
          resolve(allContacts);
        });
      });
    }

    function readContacts(callback) {

      callBackFunction = callback;
      var options = new ContactFindOptions();
      options.filter = "";          // empty search string returns all contacts
      options.multiple = true;
      options.hasPhoneNumber = true;// return multiple results
      var filter = ["*"];

      navigator.contacts.find(
        filter,
        gotContacts,
        errorHandler,
        options);
    }

    function errorHandler(e) {
      alert("errorHandler: " + e);
    }

    function gotContacts(contact) {

      var phone;
      allContacts = new Array();

      // alert('printout: ' + JSON.stringify(contact) );
      allContacts = contact;

      // BELOW IS THE CODE FOR ACCESSING EACH PHONE NUMBER
      // IT IS NOT USED CURRENTLY FOR THIS DEMO
      // IT IS HERE FOR EXAMPLE OF HOWTO

      try { // safer to use try for this

        for (var i = 0; i < contact.length; i++) {

          if (contact[i].phoneNumbers) // check if there are numbers
            for (var j = 0; j < contact[i].phoneNumbers.length; j++) {
              phone = JSON.stringify(contact[i].phoneNumbers[j].value); // if you want to modify any data directly
            }
        }
        callBackFunction(); // notify controller that we got the numbers

      }
      catch (err) {
        console.log(" catch error " + err);
      }
    }

    return {

      readContacts: readContacts,
      getContacts: getContacts
    };
  }]);

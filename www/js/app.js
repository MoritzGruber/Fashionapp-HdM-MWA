// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var app = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova' ])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
//setting up route
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive, template for tabs
    .state('tab', {
    url: '/tab', // to navigate from browser
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:
  //child template of tabs
  .state('tab.enquires', {
    url: '/enquires',
    views: {
      'tab-enquires': {
        templateUrl: 'templates/tab-enquires.html',
        controller: 'EnquiresCtrl'
      }
    }
  })

  .state('tab.collection', {
      url: '/collection',
      views: {
        'tab-collection': {
          templateUrl: 'templates/tab-collection.html',
          controller: 'CollectionCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.camera', {
    url: '/camera',
    views: {
      'tab-camera': {
        templateUrl: 'templates/tab-camera.html',
        controller: 'CameraCtrl'
      }
    }
  })
  .state('tab.profile', {
      url: '/profile',
      views: {
        'tab-profile': {
          templateUrl: 'templates/tab-profile.html',
          controller: 'ProfileCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/enquires');

});




//tab-collection
app.controller('PictureControl', function($scope, $cordovaCamera){
  // function which takes as a parameter source of the photo
   $scope.takeImage = function(source) {
     //var to hold the source of photo

    switch (source) {
      case 1:
        source = Camera.PictureSourceType.CAMERA;
        break;
      case 2:
        source = Camera.PictureSourceType.PHOTOLIBRARY;
        break;
    }
    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: source,
      encodingType: Camera.EncodingType.JPEG,
      mediaType: Camera.MediaType.PICTURE,
      allowEdit: false,
      saveToPhotoAlbum: false,
    //  correctOrientation: true  //Corrects Android orientation quirks
    };
    $cordovaCamera.getPicture(options).then(function(){
        $state.go('tab.camera')
    }, function(imageData) {
      $scope.srcImage = "data:image/jpeg;base64," + imageData;
      $scope.srcImage = imageData;

    },
      function(err) {
      console.log(err);
    });
  }
});

app.controller('PopupCtrl',function($scope, $ionicPopup, $timeout, $state) {
  $scope.showPopup = function(){
            var popup = $ionicPopup.prompt({
                title:'title',
                template: 'It might taste good'
              });
              popup.then(function(res){
                console.log("clicked", res)
              })

  }
});

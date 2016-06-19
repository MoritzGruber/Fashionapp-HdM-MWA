// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

angular.module('starter', ['ionic', 'ngStorage', 'base64', 'starter.controllers', 'starter.services', 'btford.socket-io','ngCordova', 'angular-progress-arc', 'monospaced.elastic', 'angularCSS'])

.run(function($ionicPlatform, $localStorage) {
  $ionicPlatform.ready(function() {

    //INITIALIZE PROCESS
    //default setup for keyboard
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar && ionic.Platform.isIOS()) {
      // hide statusbar on ios
      StatusBar.hide();
    }
    //setting up onesignal for push notifications
    var notificationOpenedCallback = function(jsonData) {
      alert("Notification received:\n" + JSON.stringify(jsonData));
      //TODO: Call update service here to get new data loaded
      console.log('didReceiveRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
    };
    try{
    window.plugins.OneSignal.init("f132b52a-4ebf-4446-a8e0-b031f40074da",
      {googleProjectNumber: "378633166857"},
      notificationOpenedCallback);
    window.plugins.OneSignal.getIds(function(ids) {
      console.log('getIds: ' + JSON.stringify(ids));
      $localStorage.pushId = ids.userId;
    });} catch(e){
      console.log("onesignal push notifiactions setup failed " + e);
    }
    //Setup our beta deploy platform hockeyapp
    try {
      hockeyapp.start(null, null, "92590608ebe64ac682e3af9bb46019cd");
    } catch (e) {
      console.log("hockeyapp start failed " + e);
    }
    //TODO: Hockeyapp track events
  });
})
.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {
//setting up route
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $ionicConfigProvider.tabs.position('bottom'); //TODO: Remove this, when we have design for android
  
  $stateProvider
  // setup an abstract state for the tabs directive, template for tabs
    .state('tab', {
    url: '/tab', // to navigate from browser
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })
  // Each tab has its own nav history stack:
  //child template of tabs
  .state('tab.community', {
    url: '/community',
    views: {
      'tab-community': {
        templateUrl: 'templates/tab-community.html',
        controller: 'CommunityCtrl'
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
    .state('tab.collectionstart', {
        url: '/collectionstart',
        views: {
          'tab-collection': {
            templateUrl: 'templates/tab-collection-start.html',
            controller: 'StartCtrl',
          }
        }
      })
    .state('tab.collection-detail', {
      url: '/collection/:imageId',
      views: {
        'tab-collection': {
          templateUrl: 'templates/collection-detail.html',
          controller: 'CollectionDetailCtrl'
        }
      }
    })
    .state('tab.profile-select', {
      url: '/profile/select',
      views: {
        'tab-profile': {
          templateUrl: 'templates/profile-select.html',
          controller: 'FriendSelectCtrl'
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
  $urlRouterProvider.otherwise('/tab/collection');
});

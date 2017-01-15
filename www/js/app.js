// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

angular.module('fittshot', ['mobile-angular-ui' , 'fittshot.controllers', 'fittshot.services', 'ngStorage', 'ngRoute'])

  .config(function  ($routeProvider, $qProvider) {
    //setting up route
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js

    $qProvider.errorOnUnhandledRejections(false);


    $routeProvider
    // setup an abstract when for the tabs directive, template for tabs
    // $locationProvider.html5Mode(true);
      .when('/community', {
            templateUrl: 'templates/tab-community.html',
            controller: 'CommunityCtrl'
      })
      .when('/collection', {
        templateUrl: 'templates/tab-collection.html',
        controller: 'CollectionCtrl'
      })
      .when('/collection-detail/:imageId', {
        templateUrl: 'templates/tab-collection-detail.html',
        controller: 'CollectionCtrl'
      })

      .when('/community-detail/:imageId', {
        templateUrl: 'templates/tap-community-detail.html',
        controller: 'CommunityCtrl'
      })

      .when('/profile', {
            templateUrl: 'templates/tab-profile.html',
            controller: 'ProfileCtrl'
      })
      .when('/profile/feedback', {
            templateUrl: 'templates/tap-profile-feedback.html',
            controller: 'FeedbackCtrl'
      })
      .when('/login', {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })
      // if none of the above states are matched, use this as the fallback
      .otherwise({ redirectTo: '/login' });

  });
angular.module('fittshot.controllers', []);
angular.module('fittshot.services', []);

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

angular.module('fittshot', ['ui.router', 'mobile-angular-ui' , 'fittshot.controllers', 'fittshot.services', 'ngStorage'])

  .config(function ($stateProvider, $urlRouterProvider) {
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
      .state('tab.community', {
        url: '/community',
        views: {
          'tab-community': {
            templateUrl: 'templates/tab-community.html',
            controller: 'CommunityCtrl'
          }
        }
      })
      .state('tab.community-detail', {
        url: '/community-detail/:imageId',
        views: {
          'tab-community': {
            templateUrl: 'templates/tap-community-detail.html',
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

      .state('tab.collection-detail', {
        url: '/collection-detail/:imageId',
        views: {
          'tab-collection': {
            templateUrl: 'templates/tap-collection-detail.html',
            controller: 'CollectionCtrl'
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
      })
      .state('tab.feedback', {
        url: '/profile/feedback',
        views: {
          'tab-profile': {
            templateUrl: 'templates/tap-profile-feedback.html',
            controller: 'FeedbackCtrl'
          }
        }
      })
      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
  });
angular.module('fittshot.controllers', []);
angular.module('fittshot.services', []);
